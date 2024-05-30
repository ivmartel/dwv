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
import {DrawLayer} from '../gui/drawLayer';
import {DrawTrash} from './drawTrash';
/* eslint-enable no-unused-vars */

/**
 * Draw Debug flag.
 */
export const DRAW_DEBUG = false;

/**
 * Drawing tool.
 *
 * This tool is responsible for the draw of layer group structure.
 *
 * ```
 * drawLayer
 * |_ positionGroup: {name="position-group", id="#2-0#_#3-1"}
 *    |_ shapeGroup: {name="{shape name}-group", id="#"}
 *       |_ shape: {name="shape"},
 *       |_ label: {name="label"},
 *       |_ extra: line tick, protractor arc...
 * ```
 *
 * Discussion:
 * - posGroup > shapeGroup:
 *   (pro) slice/frame display: 1 loop -
 *   (cons) multi-slice shape splitted in positionGroups.
 * - shapeGroup > posGroup:
 *   (pros) more logical -
 *   (cons) slice/frame display: 2 loops.
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
   * @type {DrawTrash}
   */
  #trash;

  /**
   * Drawing style.
   *
   * @type {Style}
   */
  #style;

  /**
   * Callback store to allow attach/detach.
   *
   * @type {Array}
   */
  #callbackStore = [];

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
    this.#trash = new DrawTrash();
  }

  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  #isDrawing = false;

  /**
   * Shape factory list.
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
  #switchEditOrCreateShapeGroup(point, divId) {
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const drawLayer = layerGroup.getActiveDrawLayer();
    const stage = drawLayer.getKonvaStage();

    // determine if the click happened in an existing shape
    const kshape = stage.getIntersection({
      x: point.getX(),
      y: point.getY()
    });

    // update scale
    this.#style.setZoomScale(stage.scale());

    // If shape exists, let user to edit
    if (kshape) {
      this.#selectShapeGroup(layerGroup, drawLayer, kshape);
      return;
    }
    // Else, is a new shape creation
    this.#startShapeGroupCreation(layerGroup, point);
  }

  /**
   * Initializes the new shape creation:
   * - Updates the started variable,
   * - Gets the factory,
   * - Initializes the points array.
   *
   * @param {LayerGroup} layerGroup The layer group where the user clicks.
   * @param {Point2D} point The start point where the user clicks.
   */
  #startShapeGroupCreation(layerGroup, point) {
    // disable edition
    this.#shapeEditor.disable();
    this.#shapeEditor.reset();
    this.#setToDrawingState();
    // store point
    const viewLayer = layerGroup.getActiveViewLayer();
    this.#lastPoint = viewLayer.displayToPlanePos(point);
    this.#points.push(this.#lastPoint);
  }

  /**
   * Sets the variables to drawing state:
   * - Updates is drawing variable,
   * - Initializes the current factory,
   * - Resets points.
   */
  #setToDrawingState() {
    // start storing points
    this.#isDrawing = true;
    // set factory
    this.#currentFactory = new this.#shapeFactoryList[this.#shapeName]();
    // clear array
    this.#points = [];
  }

  /**
   * Resets the variables to not drawing state:
   * - Destroys tmp shape group,
   * - Updates is drawing variable,
   * - Resets points.
   */
  #setToNotDrawingState() {
    this.#isDrawing = false;
    this.#points = [];
  }

  /**
   * Selects a shape group.
   *
   * @param {LayerGroup} layerGroup The layer group where the user clicks.
   * @param {DrawLayer} drawLayer The draw layer where to draw.
   * @param {Konva.Shape} kshape The shape that has been selected.
   */
  #selectShapeGroup(layerGroup, drawLayer, kshape) {
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
  }

  /**
   * Update tool interaction.
   *
   * @param {Point2D} point The update point.
   * @param {string} divId The layer group divId.
   */
  #updateShapeGroupCreation(point, divId) {
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
  #finishShapeGroupCreation(divId) {
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
      this.#setToNotDrawingState();
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
    // exit if not started draw
    if (this.#isDrawing) {
      return;
    }
    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#switchEditOrCreateShapeGroup(mousePoint, layerDetails.groupDivId);
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  mousemove = (event) => {
    // exit if not started draw
    if (!this.#isDrawing) {
      return;
    }
    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#updateShapeGroupCreation(mousePoint, layerDetails.groupDivId);
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} event The mouse up event.
   */
  mouseup = (event) => {
    // exit if not started draw
    if (!this.#isDrawing) {
      return;
    }
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#finishShapeGroupCreation(layerDetails.groupDivId);
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
    if (!this.#isDrawing) {
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
    this.#setToNotDrawingState();
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  mouseout = (event) => {
    // exit if not started draw
    if (!this.#isDrawing) {
      return;
    }
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#finishShapeGroupCreation(layerDetails.groupDivId);
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  touchstart = (event) => {
    // exit if not started draw
    if (this.#isDrawing) {
      return;
    }
    const touchPoints = getTouchPoints(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#switchEditOrCreateShapeGroup(touchPoints[0], layerDetails.groupDivId);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    // exit if not started draw
    if (!this.#isDrawing) {
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
    if (!this.#isDrawing) {
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
      // delete command
      const drawLayer = this.#app.getActiveLayerGroup().getActiveDrawLayer();
      this.#emitDeleteCommand(drawLayer, shapeGroup, shape);
    }

    // escape key: exit shape creation
    if (event.key === 'Escape' && this.#tmpShapeGroup !== null) {
      const konvaLayer = this.#tmpShapeGroup.getLayer();
      // reset temporary shape group
      this.#tmpShapeGroup.destroy();
      this.#tmpShapeGroup = null;
      // set state
      this.#setToNotDrawingState();
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
    // remove temporary shape draw
    if (this.#tmpShapeGroup) {
      this.#tmpShapeGroup.destroy();
      this.#tmpShapeGroup = null;
    }

    const drawLayer = layerGroup.getActiveDrawLayer();
    const konvaLayer = drawLayer.getKonvaLayer();
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
    // remove temporary shape draw
    // (has to be done before sending drawcreate event)
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
    finalShapeGroup.id(guid());

    // get the position group
    const posGroup = drawController.getCurrentPosGroup();
    // add shape group to position group
    posGroup.add(finalShapeGroup);

    // re-activate layer
    konvaLayer.listening(true);
    this.#emitDrawGroupCommand(drawLayer, finalShapeGroup);

    // activate shape listeners
    this.#addShapeListeners(layerGroup, finalShapeGroup);
  }

  /**
   * Create a draw group command, execute it and add
   *   it to the undo stack.
   *
   * @param {DrawLayer} drawLayer The associated layer.
   * @param {Konva.Group} shapeGroup The shape group to draw.
   */
  #emitDrawGroupCommand(drawLayer, shapeGroup) {
    // draw shape command
    const command = new DrawGroupCommand(
      shapeGroup,
      this.#shapeName,
      drawLayer
    );
    command.onExecute = this.#fireEvent;
    command.onUndo = this.#fireEvent;
    // execute it
    command.execute();
    // add it to undo stack
    this.#app.addToUndoStack(command);
  }

  /**
   * Create a delete group command, execute it and add
   *   it to the undo stack.
   *
   * @param {DrawLayer} drawLayer The associated layer.
   * @param {Konva.Group} shapeGroup The shape group to delete.
   * @param {Konva.Shape} shape The shape to delete.
   */
  #emitDeleteCommand(drawLayer, shapeGroup, shape) {
    const shapeDisplayName = getShapeDisplayName(shape);
    // delete command
    const delcmd = new DeleteGroupCommand(
      shapeGroup,
      shapeDisplayName,
      drawLayer
    );
    delcmd.onExecute = this.#fireEvent;
    delcmd.onUndo = this.#fireEvent;
    // execute it
    delcmd.execute();
    // add it to undo stack
    this.#app.addToUndoStack(delcmd);
  }

  /**
   * Create a move group command and add
   *   it to the undo stack. To no execute it.
   *
   * @param {DrawLayer} drawLayer The associated layer.
   * @param {Konva.Group} shapeGroup The shape group to move.
   * @param {Konva.Shape} shape The shape to move.
   * @param {object} translation The move translation as {x,y}.
   */
  #storeMoveCommand(drawLayer, shapeGroup, shape, translation) {
    const shapeDisplayName = getShapeDisplayName(shape);
    const mvcmd = new MoveGroupCommand(
      shapeGroup,
      shapeDisplayName,
      translation,
      drawLayer
    );
    mvcmd.onExecute = this.#fireEvent;
    mvcmd.onUndo = this.#fireEvent;
    // add it to undo stack
    this.#app.addToUndoStack(mvcmd);
  }

  /**
   * Get a layerGroup position callback.
   *
   * TODO: check needo for store item removal.
   *
   * @param {LayerGroup} layerGroup The origin layer group.
   * @returns {Function} The layerGroup position callback.
   */
  #getPositionCallback(layerGroup) {
    const divId = layerGroup.getDivId();
    if (typeof this.#callbackStore[divId] === 'undefined') {
      this.#callbackStore[divId] = () => {
        this.#updateDrawLayer(layerGroup);
      };
    }
    return this.#callbackStore[divId];
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
    if (typeof layerGroup === 'undefined') {
      throw new Error('No active layerGroup to activate draw on');
    }
    this.#activateCurrentPositionShapes(flag, layerGroup);
    // listen to app change to update the draw layer
    if (flag) {
      // store cursor
      this.#originalCursor = document.body.style.cursor;
      // TODO: merge with drawController.activateDrawLayer?
      this.#app.addEventListener('positionchange',
        this.#getPositionCallback(layerGroup)
      );
    } else {
      // reset shape and cursor
      this.#resetActiveShapeGroup();
      // reset local var
      this.#originalCursor = undefined;
      // remove listeners
      this.#app.removeEventListener('positionchange',
        this.#getPositionCallback(layerGroup)
      );
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
        this.#addShapeListeners(layerGroup, group);
      });
    } else {
      // de-activate shape listeners
      shapeGroups.forEach((group) => {
        this.#removeShapeListeners(group);
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
   * Remove shape group listeners.
   *
   * @param {Konva.Group} shapeGroup The shape group to set off.
   */
  #removeShapeListeners(shapeGroup) {
    // mouse over
    this.#removeShapeOverListeners(shapeGroup);
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
   * Add shape group mouse over and out listeners: updates
   *   shape group opacity and cursor.
   *
   * @param {Konva.Group} shapeGroup The shape group.
   */
  #addShapeOverListeners(shapeGroup) {
    // handle mouse over
    shapeGroup.on('mouseover', () => {
      // store locally
      this.#activeShapeGroup = shapeGroup;
      // change cursor and opacity
      document.body.style.cursor = this.#mouseOverCursor;
      shapeGroup.opacity(0.75);
    });

    // handle mouse out
    shapeGroup.on('mouseout', () => {
      // reset cursor and opacity
      this.#resetActiveShapeGroup();
      // reset local var
      this.#activeShapeGroup = undefined;
    });
  }

  /**
   * Remove shape group mouse over and out listeners.
   *
   * @param {Konva.Group} shapeGroup The shape group.
   */
  #removeShapeOverListeners(shapeGroup) {
    shapeGroup.off('mouseover');
    shapeGroup.off('mouseout');
  }

  /**
   * Get a groups' shape factory.
   *
   * @param {Konva.Group} shapeGroup The shape group to set on.
   * @returns {object} The corresponding factory.
   */
  #getShapeFactory(shapeGroup) {
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
    return factory;
  }

  /**
   * Add shape group listeners.
   *
   * @param {LayerGroup} layerGroup The origin layer group.
   * @param {Konva.Group} shapeGroup The shape group to set on.
   */
  #addShapeListeners(layerGroup, shapeGroup) {
    // shape mouse over
    this.#addShapeOverListeners(shapeGroup);

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
      this.#trash.activate(drawLayer);
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
      const factory = this.#getShapeFactory(shapeGroup);
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
      this.#trash.changeChildrenColourOnTrashHover(eventPos,
        shapeGroup, colour);
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
      if (this.#trash.isOverTrash(eventPos)) {
        // compensate for the drag translation
        group.x(dragStartPos.x);
        group.y(dragStartPos.y);
        // disable editor
        this.#shapeEditor.disable();
        this.#shapeEditor.reset();
        this.#trash.changeGroupChildrenColour(shapeGroup, colour);
        this.#emitDeleteCommand(drawLayer, shapeGroup, shape);
        // reset cursor
        document.body.style.cursor = this.#originalCursor;
      } else {
        const translation = {
          x: pos.x - dragStartPos.x,
          y: pos.y - dragStartPos.y
        };
        if (translation.x !== 0 || translation.y !== 0) {
          // the move is handled by Konva, create a command but
          // do not execute it
          this.#storeMoveCommand(drawLayer, group, shape, translation);
          // manually trigger a move event
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
