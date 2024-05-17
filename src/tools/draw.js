import {getLayerDetailsFromEvent} from '../gui/layerGroup';
import {
  getMousePoint,
  getTouchPoints,
  customUI
} from '../gui/generic';
import {Point2D} from '../math/point';
import {guid} from '../math/stats';
import {logger} from '../utils/logger';
import {replaceFlags} from '../utils/string';
import {
  getShapeDisplayName,
  DrawGroupCommand,
  DeleteGroupCommand,
  MoveGroupCommand
} from './drawCommands';
import {
  canNodeChangeColour,
  isNodeNameShape
} from '../app/drawController';
import {ScrollWheel} from './scrollWheel';
import {ShapeEditor} from './editor';
// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
import {Style} from '../gui/style';
import {LayerGroup} from '../gui/layerGroup';
import {Scalar2D} from '../math/scalar';
/* eslint-enable no-unused-vars */

/**
 * Draw Debug flag.
 */
export const DRAW_DEBUG = false;

/**
 * Drawing tool.
 *
 * This tool is responsible for the draw layer group structure. The layout is:
 *
 * drawLayer
 * |_ positionGroup: name="position-group", id="#2-0#_#3-1""
 *    |_ shapeGroup: name="{shape name}-group", id="#"
 *       |_ shape: name="shape"
 *       |_ label: name="label"
 *       |_ extra: line tick, protractor arc...
 *
 * Discussion:
 * - posGroup > shapeGroup
 *    pro: slice/frame display: 1 loop
 *    cons: multi-slice shape splitted in positionGroups
 * - shapeGroup > posGroup
 *    pros: more logical
 *    cons: slice/frame display: 2 loops
 */
export class Draw {

  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * Scroll wheel handler.
   *
   * @type {ScrollWheel}
   */
  #scrollWhell;

  /**
   * Shape editor.
   *
   * @type {ShapeEditor}
   */
  #shapeEditor;

  /**
   * Trash draw: a cross.
   *
   * @type {Konva.Group}
   */
  #trash;

  /**
   * Drawing style.
   *
   * @type {Style}
   */
  #style;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
    this.#scrollWhell = new ScrollWheel(app);
    this.#shapeEditor = new ShapeEditor(app);
    // associate the event listeners of the editor
    //  with those of the draw tool
    this.#shapeEditor.setDrawEventCallback(this.#fireEvent);

    this.#style = app.getStyle();

    // trash cross
    this.#trash = new Konva.Group();
    // first line of the cross
    const trashLine1 = new Konva.Line({
      points: [-10, -10, 10, 10],
      stroke: 'red'
    });
    // second line of the cross
    const trashLine2 = new Konva.Line({
      points: [10, -10, -10, 10],
      stroke: 'red'
    });
    this.#trash.width(20);
    this.#trash.height(20);
    this.#trash.add(trashLine1);
    this.#trash.add(trashLine2);
  }

  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  #started = false;

  /**
   * Shape factory list
   *
   * @type {object}
   */
  #shapeFactoryList = null;

  /**
   * Current shape factory.
   *
   * @type {object}
   */
  #currentFactory = null;

  /**
   * Draw command.
   *
   * @type {object}
   */
  #command = null;

  /**
   * Current shape group.
   *
   * @type {object}
   */
  #tmpShapeGroup = null;

  /**
   * Shape name.
   *
   * @type {string}
   */
  #shapeName;

  /**
   * List of points.
   *
   * @type {Point2D[]}
   */
  #points = [];

  /**
   * Last selected point.
   *
   * @type {Point2D}
   */
  #lastPoint = null;

  /**
   * Active shape, ie shape with mouse over.
   *
   * @type {Konva.Group}
   */
  #activeShapeGroup;

  /**
   * Original mouse cursor.
   *
   * @type {string}
   */
  #originalCursor;

  /**
   * Mouse cursor.
   *
   * @type {string}
   */
  #mouseOverCursor = 'pointer';

  /**
   * With scroll flag.
   *
   * @type {boolean}
   */
  #withScroll = true;

  /**
   * Auto shape colour: will use defaults colours and
   * vary them according to the layer.
   *
   * @type {boolean}
   */
  #autoShapeColour = true;

  /**
   * Event listeners.
   */
  #listeners = {};

  /**
   * Flag to know if the last added point was made by mouse move.
   *
   * @type {boolean}
   */
  #lastIsMouseMovePoint = false;

  /**
   * Start tool interaction.
   *
   * @param {Point2D} point The start point.
   * @param {string} divId The layer group divId.
   */
  #start(point, divId) {
    // exit if a draw was started (handle at mouse move or up)
    if (this.#started) {
      return;
    }

    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const drawLayer = layerGroup.getActiveDrawLayer();

    // determine if the click happened in an existing shape
    const stage = drawLayer.getKonvaStage();
    const kshape = stage.getIntersection({
      x: point.getX(),
      y: point.getY()
    });

    // update scale
    this.#style.setZoomScale(stage.scale());

    if (kshape) {
      const group = kshape.getParent();
      const selectedShape = group.find('.shape')[0];
      // reset editor if click on other shape
      // (and avoid anchors mouse down)
      if (selectedShape &&
        selectedShape instanceof Konva.Shape &&
        selectedShape !== this.#shapeEditor.getShape()) {
        this.#shapeEditor.disable();
        const viewController =
          layerGroup.getActiveViewLayer().getViewController();
        this.#shapeEditor.setShape(selectedShape, drawLayer, viewController);
        this.#shapeEditor.enable();
      }
    } else {
      // disable edition
      this.#shapeEditor.disable();
      this.#shapeEditor.reset();
      // start storing points
      this.#started = true;
      // set factory
      this.#currentFactory = new this.#shapeFactoryList[this.#shapeName]();
      // clear array
      this.#points = [];
      // store point
      const viewLayer = layerGroup.getActiveViewLayer();
      this.#lastPoint = viewLayer.displayToPlanePos(point);
      this.#points.push(this.#lastPoint);
    }
  }

  /**
   * Update tool interaction.
   *
   * @param {Point2D} point The update point.
   * @param {string} divId The layer group divId.
   */
  #update(point, divId) {
    // exit if not started draw
    if (!this.#started) {
      return;
    }

    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const pos = viewLayer.displayToPlanePos(point);

    // draw line to current pos
    if (Math.abs(pos.getX() - this.#lastPoint.getX()) > 0 ||
      Math.abs(pos.getY() - this.#lastPoint.getY()) > 0) {
      // clear last mouse move point
      if (this.#lastIsMouseMovePoint) {
        this.#points.pop();
      }
      // current point
      this.#lastPoint = pos;
      // mark it as temporary
      this.#lastIsMouseMovePoint = true;
      // add it to the list
      this.#points.push(this.#lastPoint);
      // update points
      this.#onNewPoints(this.#points, layerGroup);
    }
  }

  /**
   * Finish tool interaction.
   *
   * @param {string} divId The layer group divId.
   */
  #finish(divId) {
    // exit if not started draw
    if (!this.#started) {
      return;
    }
    // exit if no points
    if (this.#points.length === 0) {
      logger.warn('Draw mouseup but no points...');
      return;
    }

    // do we have all the needed points
    if (this.#points.length === this.#currentFactory.getNPoints()) {
      // store points
      const layerGroup =
        this.#app.getLayerGroupByDivId(divId);
      this.#onFinalPoints(this.#points, layerGroup);
      // reset flag
      this.#started = false;
    }

    // reset mouse move point flag
    this.#lastIsMouseMovePoint = false;
  }

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  mousedown = (event) => {
    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#start(mousePoint, layerDetails.groupDivId);
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  mousemove = (event) => {
    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#update(mousePoint, layerDetails.groupDivId);
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} event The mouse up event.
   */
  mouseup = (event) => {
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#finish(layerDetails.groupDivId);
  };

  /**
   * Handle double click event: some tools use it to finish interaction.
   *
   * @param {object} event The double click event.
   */
  dblclick = (event) => {
    // only end by double click undefined NPoints
    if (typeof this.#currentFactory.getNPoints() !== 'undefined') {
      return;
    }
    // exit if not started draw
    if (!this.#started) {
      return;
    }
    // exit if no points
    if (this.#points.length === 0) {
      logger.warn('Draw dblclick but no points...');
      return;
    }

    // store points
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    this.#onFinalPoints(this.#points, layerGroup);
    // reset flag
    this.#started = false;
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  mouseout = (event) => {
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#finish(layerDetails.groupDivId);
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  touchstart = (event) => {
    const touchPoints = getTouchPoints(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#start(touchPoints[0], layerDetails.groupDivId);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    // exit if not started draw
    if (!this.#started) {
      return;
    }

    const layerDetails = getLayerDetailsFromEvent(event);
    const touchPoints = getTouchPoints(event);

    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const pos = viewLayer.displayToPlanePos(touchPoints[0]);

    if (Math.abs(pos.getX() - this.#lastPoint.getX()) > 0 ||
      Math.abs(pos.getY() - this.#lastPoint.getY()) > 0) {
      // clear last added point from the list (but not the first one)
      if (this.#points.length !== 1) {
        this.#points.pop();
      }
      // current point
      this.#lastPoint = pos;
      // add current one to the list
      this.#points.push(this.#lastPoint);
      // allow for anchor points
      if (this.#points.length < this.#currentFactory.getNPoints()) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.#points.push(this.#lastPoint);
        }, this.#currentFactory.getTimeout());
      }
      // update points
      this.#onNewPoints(this.#points, layerGroup);
    }
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  touchend = (event) => {
    this.dblclick(event);
  };

  /**
   * Handle mouse wheel event.
   *
   * @param {WheelEvent} event The mouse wheel event.
   */
  wheel = (event) => {
    if (this.#withScroll) {
      this.#scrollWhell.wheel(event);
    }
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    // call app handler if we are not in the middle of a draw
    if (!this.#started) {
      event.context = 'Draw';
      this.#app.onKeydown(event);
    }

    // press delete or backspace key
    if ((event.key === 'Delete' ||
      event.key === 'Backspace') &&
      this.#shapeEditor.isActive()) {
      // get shape
      const shapeGroup = this.#shapeEditor.getShape().getParent();
      if (!(shapeGroup instanceof Konva.Group)) {
        return;
      }
      const shape = shapeGroup.getChildren(isNodeNameShape)[0];
      if (!(shape instanceof Konva.Shape)) {
        return;
      }
      const shapeDisplayName = getShapeDisplayName(shape);
      // delete command
      const drawLayer = this.#app.getActiveLayerGroup().getActiveDrawLayer();
      const delcmd = new DeleteGroupCommand(
        shapeGroup,
        shapeDisplayName,
        drawLayer
      );
      delcmd.onExecute = this.#fireEvent;
      delcmd.onUndo = this.#fireEvent;
      delcmd.execute();
      this.#app.addToUndoStack(delcmd);
    }

    // escape key: exit shape creation
    if (event.key === 'Escape' && this.#tmpShapeGroup !== null) {
      const konvaLayer = this.#tmpShapeGroup.getLayer();
      // reset temporary shape group
      this.#tmpShapeGroup.destroy();
      this.#tmpShapeGroup = null;
      // reset flag and points
      this.#started = false;
      this.#points = [];
      // redraw
      konvaLayer.draw();
    }
  };

  /**
   * Update the current draw with new points.
   *
   * @param {Point2D[]} tmpPoints The array of new points.
   * @param {LayerGroup} layerGroup The origin layer group.
   */
  #onNewPoints(tmpPoints, layerGroup) {
    const drawLayer = layerGroup.getActiveDrawLayer();
    const konvaLayer = drawLayer.getKonvaLayer();

    // remove temporary shape draw
    if (this.#tmpShapeGroup) {
      this.#tmpShapeGroup.destroy();
      this.#tmpShapeGroup = null;
    }

    const viewLayer = layerGroup.getActiveViewLayer();

    // auto mode: vary shape colour with layer id
    if (this.#autoShapeColour) {
      const colours = [
        '#ffff80', '#ff80ff', '#80ffff', '#80ff80', '8080ff', 'ff8080'
      ];
      // warning: depends on layer id nomenclature
      const viewLayerId = viewLayer.getId();
      const layerId = viewLayerId.substring(viewLayerId.length - 1);
      // expecting one draw layer per view layer
      const layerIndex = parseInt(layerId, 10) / 2;
      const colour = colours[layerIndex];
      if (typeof colour !== 'undefined') {
        this.#style.setLineColour(colour);
      }
    }

    // create shape group
    const viewController = viewLayer.getViewController();
    this.#tmpShapeGroup = this.#currentFactory.create(
      tmpPoints, this.#style, viewController);

    // skip if select draw
    if (!this.#tmpShapeGroup) {
      return;
    }

    // do not listen during creation
    const shape = this.#tmpShapeGroup.getChildren(isNodeNameShape)[0];
    shape.listening(false);
    konvaLayer.listening(false);
    // draw shape
    konvaLayer.add(this.#tmpShapeGroup);
    konvaLayer.draw();
  }

  /**
   * Create the final shape from a point list.
   *
   * @param {Point2D[]} finalPoints The array of points.
   * @param {LayerGroup} layerGroup The origin layer group.
   */
  #onFinalPoints(finalPoints, layerGroup) {
    // reset temporary shape group
    if (this.#tmpShapeGroup) {
      this.#tmpShapeGroup.destroy();
      this.#tmpShapeGroup = null;
    }

    const drawLayer = layerGroup.getActiveDrawLayer();
    const konvaLayer = drawLayer.getKonvaLayer();
    const drawController = drawLayer.getDrawController();

    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();

    // create final shape
    const finalShapeGroup = this.#currentFactory.create(
      finalPoints, this.#style, viewController);

    // skip if select draw
    if (!finalShapeGroup) {
      return;
    }

    finalShapeGroup.id(guid());

    // get the position group
    const posGroup = drawController.getCurrentPosGroup();
    // add shape group to position group
    posGroup.add(finalShapeGroup);

    // re-activate layer
    konvaLayer.listening(true);
    // draw shape command
    this.#command = new DrawGroupCommand(
      finalShapeGroup,
      this.#shapeName,
      drawLayer
    );
    this.#command.onExecute = this.#fireEvent;
    this.#command.onUndo = this.#fireEvent;
    // execute it
    this.#command.execute();
    // save it in undo stack
    this.#app.addToUndoStack(this.#command);

    // activate shape listeners
    this.setShapeOn(finalShapeGroup, layerGroup);
  }

  /**
   * Activate the tool.
   *
   * @param {boolean} flag The flag to activate or not.
   */
  activate(flag) {
    // reset shape display properties
    this.#shapeEditor.disable();
    this.#shapeEditor.reset();
    // get the current draw layer
    const layerGroup = this.#app.getActiveLayerGroup();
    this.#activateCurrentPositionShapes(flag, layerGroup);
    // listen to app change to update the draw layer
    if (flag) {
      // store cursor
      this.#originalCursor = document.body.style.cursor;
      // TODO: merge with drawController.activateDrawLayer?
      this.#app.addEventListener('positionchange', () => {
        this.#updateDrawLayer(layerGroup);
      });
    } else {
      // reset shape and cursor
      this.#resetActiveShapeGroup();
      // reset local var
      this.#originalCursor = undefined;
      // remove listeners
      this.#app.removeEventListener('positionchange', () => {
        this.#updateDrawLayer(layerGroup);
      });
    }
  }

  /**
   * Update the draw layer.
   *
   * @param {LayerGroup} layerGroup The origin layer group.
   */
  #updateDrawLayer(layerGroup) {
    // activate the shape at current position
    this.#activateCurrentPositionShapes(true, layerGroup);
  }

  /**
   * Activate shapes at current position.
   *
   * @param {boolean} visible Set the draw layer visible or not.
   * @param {LayerGroup} layerGroup The origin layer group.
   */
  #activateCurrentPositionShapes(visible, layerGroup) {
    const drawLayer = layerGroup.getActiveDrawLayer();
    if (typeof drawLayer === 'undefined') {
      return;
    }
    const drawController = drawLayer.getDrawController();

    // get shape groups at the current position
    const shapeGroups =
      drawController.getCurrentPosGroup().getChildren();

    // set shape display properties
    if (visible) {
      // activate shape listeners
      shapeGroups.forEach((group) => {
        this.setShapeOn(group, layerGroup);
      });
    } else {
      // de-activate shape listeners
      shapeGroups.forEach((group) => {
        this.#setShapeOff(group);
      });
    }
    // draw
    const konvaLayer = drawLayer.getKonvaLayer();
    if (shapeGroups.length !== 0) {
      konvaLayer.listening(true);
    }
    konvaLayer.draw();
  }

  /**
   * Set shape group off properties.
   *
   * @param {Konva.Group} shapeGroup The shape group to set off.
   */
  #setShapeOff(shapeGroup) {
    // mouse styling
    shapeGroup.off('mouseover');
    shapeGroup.off('mouseout');
    // drag
    shapeGroup.draggable(false);
    shapeGroup.off('dragstart.draw');
    shapeGroup.off('dragmove.draw');
    shapeGroup.off('dragend.draw');
    shapeGroup.off('dblclick');
  }

  /**
   * Get the real position from an event.
   * TODO: use layer method?
   *
   * @param {Scalar2D} index The input index as {x,y}.
   * @param {LayerGroup} layerGroup The origin layer group.
   * @returns {Scalar2D} The real position in the image as {x,y}.
   */
  #getRealPosition(index, layerGroup) {
    const drawLayer = layerGroup.getActiveDrawLayer();
    const stage = drawLayer.getKonvaStage();
    return {
      x: stage.offset().x + index.x / stage.scale().x,
      y: stage.offset().y + index.y / stage.scale().y
    };
  }

  /**
   * Reset the active shape group and mouse cursor to their original state.
   */
  #resetActiveShapeGroup() {
    if (typeof this.#originalCursor !== 'undefined') {
      document.body.style.cursor = this.#originalCursor;
    }
    if (typeof this.#activeShapeGroup !== 'undefined') {
      this.#activeShapeGroup.opacity(1);
    }
  }

  /**
   * Set shape group on properties.
   *
   * @param {Konva.Group} shapeGroup The shape group to set on.
   * @param {LayerGroup} layerGroup The origin layer group.
   */
  setShapeOn(shapeGroup, layerGroup) {
    // adapt shape and cursor when mouse over
    const mouseOnShape = () => {
      document.body.style.cursor = this.#mouseOverCursor;
      shapeGroup.opacity(0.75);
    };
    // mouse over event hanlding
    shapeGroup.on('mouseover', () => {
      // save local vars
      this.#activeShapeGroup = shapeGroup;
      // adapt shape
      mouseOnShape();
    });
    // mouse out event hanlding
    shapeGroup.on('mouseout', () => {
      // reset shape
      this.#resetActiveShapeGroup();
      // reset local vars
      this.#activeShapeGroup = undefined;
    });

    const drawLayer = layerGroup.getActiveDrawLayer();
    const konvaLayer = drawLayer.getKonvaLayer();

    // make it draggable
    shapeGroup.draggable(true);
    // cache drag start position
    let dragStartPos = {x: shapeGroup.x(), y: shapeGroup.y()};

    // command name based on shape type
    const shape = shapeGroup.getChildren(isNodeNameShape)[0];
    if (!(shape instanceof Konva.Shape)) {
      return;
    }
    const shapeDisplayName = getShapeDisplayName(shape);

    let colour = null;

    // drag start event handling
    shapeGroup.on('dragstart.draw', (/*event*/) => {
      // store colour
      const shape = shapeGroup.getChildren(isNodeNameShape)[0];
      if (!(shape instanceof Konva.Shape)) {
        return;
      }
      colour = shape.stroke();
      // display trash
      const stage = drawLayer.getKonvaStage();
      const scale = stage.scale();
      const invscale = {x: 1 / scale.x, y: 1 / scale.y};
      this.#trash.x(stage.offset().x + (stage.width() / (2 * scale.x)));
      this.#trash.y(stage.offset().y + (stage.height() / (15 * scale.y)));
      this.#trash.scale(invscale);
      konvaLayer.add(this.#trash);
      // deactivate anchors to avoid events on null shape
      this.#shapeEditor.setAnchorsActive(false);
      // draw
      konvaLayer.draw();
    });
    // drag move event handling
    shapeGroup.on('dragmove.draw', (event) => {
      const group = event.target;
      if (!(group instanceof Konva.Group)) {
        return;
      }
      // validate the group position
      validateGroupPosition(drawLayer.getBaseSize(), group);
      // get appropriate factory
      let factory;
      const keys = Object.keys(this.#shapeFactoryList);
      for (let i = 0; i < keys.length; ++i) {
        factory = new this.#shapeFactoryList[keys[i]];
        if (factory.isFactoryGroup(shapeGroup)) {
          // stop at first find
          break;
        }
      }
      if (typeof factory === 'undefined') {
        throw new Error('Cannot find factory to update quantification.');
      }
      // update quantification if possible
      if (typeof factory.updateQuantification !== 'undefined') {
        const vc = layerGroup.getActiveViewLayer().getViewController();
        factory.updateQuantification(group, vc);
      }
      // highlight trash when on it
      const mousePoint = getMousePoint(event.evt);
      const offset = {
        x: mousePoint.getX(),
        y: mousePoint.getY()
      };
      const eventPos = this.#getRealPosition(offset, layerGroup);
      const trashHalfWidth =
        this.#trash.width() * Math.abs(this.#trash.scaleX()) / 2;
      const trashHalfHeight =
        this.#trash.height() * Math.abs(this.#trash.scaleY()) / 2;
      if (Math.abs(eventPos.x - this.#trash.x()) < trashHalfWidth &&
        Math.abs(eventPos.y - this.#trash.y()) < trashHalfHeight) {
        this.#trash.getChildren().forEach(function (tshape) {
          if (tshape instanceof Konva.Shape) {
            tshape.stroke('orange');
          }
        });
        // change the group shapes colour
        shapeGroup.getChildren(canNodeChangeColour).forEach(
          function (ashape) {
            if (ashape instanceof Konva.Shape) {
              ashape.stroke('red');
            }
          });
      } else {
        this.#trash.getChildren().forEach(function (tshape) {
          if (tshape instanceof Konva.Shape) {
            tshape.stroke('red');
          }
        });
        // reset the group shapes colour
        shapeGroup.getChildren(canNodeChangeColour).forEach(
          function (ashape) {
            if (ashape instanceof Konva.Shape &&
              typeof ashape.stroke !== 'undefined') {
              ashape.stroke(colour);
            }
          });
      }
      // draw
      konvaLayer.draw();
    });
    // drag end event handling
    shapeGroup.on('dragend.draw', (event) => {
      const group = event.target;
      if (!(group instanceof Konva.Group)) {
        return;
      }
      // remove trash
      this.#trash.remove();
      // activate(false) will also trigger a dragend.draw
      if (typeof event === 'undefined' ||
        typeof event.evt === 'undefined') {
        return;
      }
      const pos = {x: group.x(), y: group.y()};
      // delete case
      const mousePoint = getMousePoint(event.evt);
      const offset = {
        x: mousePoint.getX(),
        y: mousePoint.getY()
      };
      const eventPos = this.#getRealPosition(offset, layerGroup);
      const trashHalfWidth =
        this.#trash.width() * Math.abs(this.#trash.scaleX()) / 2;
      const trashHalfHeight =
        this.#trash.height() * Math.abs(this.#trash.scaleY()) / 2;
      if (Math.abs(eventPos.x - this.#trash.x()) < trashHalfWidth &&
        Math.abs(eventPos.y - this.#trash.y()) < trashHalfHeight) {
        // compensate for the drag translation
        group.x(dragStartPos.x);
        group.y(dragStartPos.y);
        // disable editor
        this.#shapeEditor.disable();
        this.#shapeEditor.reset();
        // reset colour
        shapeGroup.getChildren(canNodeChangeColour).forEach(
          function (ashape) {
            if (ashape instanceof Konva.Shape) {
              ashape.stroke(colour);
            }
          });
        // reset cursor
        document.body.style.cursor = this.#originalCursor;
        // delete command
        const delcmd = new DeleteGroupCommand(
          group,
          shapeDisplayName,
          drawLayer
        );
        delcmd.onExecute = this.#fireEvent;
        delcmd.onUndo = this.#fireEvent;
        delcmd.execute();
        this.#app.addToUndoStack(delcmd);
      } else {
        // save drag move
        const translation = {
          x: pos.x - dragStartPos.x,
          y: pos.y - dragStartPos.y
        };
        if (translation.x !== 0 || translation.y !== 0) {
          const mvcmd = new MoveGroupCommand(
            group,
            shapeDisplayName,
            translation,
            drawLayer
          );
          mvcmd.onExecute = this.#fireEvent;
          mvcmd.onUndo = this.#fireEvent;
          this.#app.addToUndoStack(mvcmd);

          // the move is handled by Konva, trigger an event manually
          this.#fireEvent({
            type: 'drawmove',
            id: group.id(),
            srclayerid: drawLayer.getId(),
            dataid: drawLayer.getDataId()
          });
        }
        // reset anchors
        this.#shapeEditor.setAnchorsActive(true);
        this.#shapeEditor.resetAnchors();
      }
      // draw
      konvaLayer.draw();
      // reset start position
      dragStartPos = {x: group.x(), y: group.y()};
    });
    // double click handling: update label
    shapeGroup.on('dblclick', (event) => {
      const group = event.currentTarget;
      if (!(group instanceof Konva.Group)) {
        return;
      }
      // get the label object for this shape
      const label = group.findOne('Label');
      if (!(label instanceof Konva.Label)) {
        return;
      }
      // should just be one
      if (typeof label === 'undefined') {
        throw new Error('Could not find the shape label.');
      }
      const ktext = label.getText();
      // id for event
      const groupId = group.id();

      const onSaveCallback = (meta) => {
        // store meta
        // @ts-expect-error
        ktext.meta = meta;
        // update text expression
        ktext.setText(replaceFlags(
          meta.textExpr, meta.quantification));
        // hide label if no text
        label.visible(meta.textExpr.length !== 0);

        // trigger event
        this.#fireEvent({
          type: 'drawchange',
          id: groupId,
          srclayerid: drawLayer.getId(),
          dataid: drawLayer.getDataId()
        });
        // draw
        konvaLayer.draw();
      };

      // call roi dialog
      // @ts-expect-error
      customUI.openRoiDialog(ktext.meta, onSaveCallback);
    });
  }

  /**
   * Set the tool configuration options.
   *
   * @param {object} options The list of shape names amd classes.
   */
  setOptions(options) {
    // save the options as the shape factory list
    this.#shapeFactoryList = options;
    // pass them to the editor
    this.#shapeEditor.setFactoryList(options);
  }

  /**
   * Get the type of tool options: here 'factory' since the shape
   * list contains factories to create each possible shape.
   *
   * @returns {string} The type.
   */
  getOptionsType() {
    return 'factory';
  }

  /**
   * Set the tool live features: shape colour and shape name.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.autoShapeColour !== 'undefined') {
      this.#autoShapeColour = features.autoShapeColour;
    }
    if (typeof features.shapeColour !== 'undefined') {
      this.#style.setLineColour(features.shapeColour);
      this.#autoShapeColour = false;
    }
    if (typeof features.shapeName !== 'undefined') {
      // check if we have it
      if (!this.hasShape(features.shapeName)) {
        throw new Error('Unknown shape: \'' + features.shapeName + '\'');
      }
      this.#shapeName = features.shapeName;
    }
    if (typeof features.mouseOverCursor !== 'undefined') {
      this.#mouseOverCursor = features.mouseOverCursor;
    }
    if (typeof features.withScroll !== 'undefined') {
      this.#withScroll = features.withScroll;
    }
  }

  /**
   * Initialise the tool.
   */
  init() {
    // does nothing
  }

  /**
   * Get the list of event names that this tool can fire.
   *
   * @returns {string[]} The list of event names.
   */
  getEventNames() {
    return [
      'drawcreate', 'drawchange', 'drawmove', 'drawdelete'
    ];
  }

  /**
   * Add an event listener on the app.
   *
   * @param {string} type The event type.
   * @param {Function} listener The function associated with the provided
   *   event type.
   */
  addEventListener(type, listener) {
    if (typeof this.#listeners[type] === 'undefined') {
      this.#listeners[type] = [];
    }
    this.#listeners[type].push(listener);
  }

  /**
   * Remove an event listener from the app.
   *
   * @param {string} type The event type.
   * @param {Function} listener The function associated with the provided
   *   event type.
   */
  removeEventListener(type, listener) {
    if (typeof this.#listeners[type] === 'undefined') {
      return;
    }
    for (let i = 0; i < this.#listeners[type].length; ++i) {
      if (this.#listeners[type][i] === listener) {
        this.#listeners[type].splice(i, 1);
      }
    }
  }

  // Private Methods -----------------------------------------------------------

  /**
   * Fire an event: call all associated listeners.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    if (typeof this.#listeners[event.type] === 'undefined') {
      return;
    }
    for (let i = 0; i < this.#listeners[event.type].length; ++i) {
      this.#listeners[event.type][i](event);
    }
  };

  /**
   * Check if the shape is in the shape list.
   *
   * @param {string} name The name of the shape.
   * @returns {boolean} True if there is a factory for the shape.
   */
  hasShape(name) {
    return typeof this.#shapeFactoryList[name] !== 'undefined';
  }

} // Draw class

/**
 * Get the minimum position in a groups' anchors.
 *
 * @param {Konva.Group} group The group that contains anchors.
 * @returns {Point2D|undefined} The minimum position.
 */
function getAnchorMin(group) {
  const anchors = group.find('.anchor');
  if (anchors.length === 0) {
    return undefined;
  }
  let minX = anchors[0].x();
  let minY = anchors[0].y();
  for (let i = 0; i < anchors.length; ++i) {
    minX = Math.min(minX, anchors[i].x());
    minY = Math.min(minY, anchors[i].y());
  }

  return new Point2D(minX, minY);
}

/**
 * Bound a node position.
 *
 * @param {Konva.Node} node The node to bound the position.
 * @param {Point2D} min The minimum position.
 * @param {Point2D} max The maximum position.
 * @returns {boolean} True if the position was corrected.
 */
function boundNodePosition(node, min, max) {
  let changed = false;
  if (node.x() < min.getX()) {
    node.x(min.getX());
    changed = true;
  } else if (node.x() > max.getX()) {
    node.x(max.getX());
    changed = true;
  }
  if (node.y() < min.getY()) {
    node.y(min.getY());
    changed = true;
  } else if (node.y() > max.getY()) {
    node.y(max.getY());
    changed = true;
  }
  return changed;
}

/**
 * Validate a group position.
 *
 * @param {Scalar2D} stageSize The stage size {x,y}.
 * @param {Konva.Group} group The group to evaluate.
 * @returns {boolean} True if the position was corrected.
 */
function validateGroupPosition(stageSize, group) {
  // if anchors get mixed, width/height can be negative
  const shape = group.getChildren(isNodeNameShape)[0];
  const anchorMin = getAnchorMin(group);
  // handle no anchor: when dragging the label, the editor does
  //   not activate
  if (typeof anchorMin === 'undefined') {
    return null;
  }

  const min = new Point2D(
    -anchorMin.getX(),
    -anchorMin.getY()
  );
  const max = new Point2D(
    stageSize.x - (anchorMin.getX() + Math.abs(shape.width())),
    stageSize.y - (anchorMin.getY() + Math.abs(shape.height()))
  );

  return boundNodePosition(group, min, max);
}

/**
 * Validate an anchor position.
 *
 * @param {Scalar2D} stageSize The stage size {x,y}.
 * @param {Konva.Shape} anchor The anchor to evaluate.
 * @returns {boolean} True if the position was corrected.
 */
export function validateAnchorPosition(stageSize, anchor) {
  const group = anchor.getParent();

  const min = new Point2D(
    -group.x(),
    -group.y()
  );
  const max = new Point2D(
    stageSize.x - group.x(),
    stageSize.y - group.y()
  );

  return boundNodePosition(anchor, min, max);
}
