import {getLayerDetailsFromEvent} from '../gui/layerGroup';
import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic';
import {guid} from '../math/stats';
import {logger} from '../utils/logger';
import {
  AddAnnotationCommand,
  RemoveAnnotationCommand
} from './drawCommands';
import {
  isNodeNameShape,
} from './drawBounds';
import {Annotation} from '../image/annotation';
import {ScrollWheel} from './scrollWheel';

// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
import {Style} from '../gui/style';
import {LayerGroup} from '../gui/layerGroup';
import {Point2D} from '../math/point';
import {DrawLayer} from '../gui/drawLayer';
import {DrawShapeHandler} from './drawShapeHandler';
/* eslint-enable no-unused-vars */

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
   * Drawing style.
   *
   * @type {Style}
   */
  #style;

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
   * With scroll flag.
   *
   * @type {boolean}
   */
  #withScroll = true;

  /**
   * Black list: list of dataIds for which draw layer creation
   *   is forbidden.
   */
  #blacklist = [];

  /**
   * Shape handler: activate listeners on existing shape.
   *
   * @type {DrawShapeHandler}
   */
  #shapeHandler;

  /**
   * Auto shape colour: will use defaults colours and
   * vary them according to the layer.
   *
   * @type {boolean}
   */
  #autoShapeColour = false;

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
    this.#shapeHandler = new DrawShapeHandler(app, this.#fireEvent);

    this.#style = app.getStyle();
  }


  /**
   * Start tool interaction.
   *
   * @param {Point2D} point The start point.
   * @param {string} divId The layer group divId.
   */
  #switchEditOrCreateShapeGroup(point, divId) {
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    let drawLayer = layerGroup.getActiveDrawLayer();

    if (typeof drawLayer === 'undefined') {
      const viewLayer = layerGroup.getActiveViewLayer();
      const refDataId = viewLayer.getDataId();
      const refData = this.#app.getData(refDataId);
      const refMeta = refData.image.getMeta();
      const seriesInstanceUID = refMeta.SeriesInstanceUID;
      // check black list
      if (this.#blacklist.includes(seriesInstanceUID)) {
        this.#fireEvent({
          type: 'warn',
          message: 'Cannot create draw layer, data is in black list'
        });
        return;
      }
      // create new data
      const data = this.#app.createAnnotationData(refDataId);
      // render (will create draw layer)
      this.#app.addAndRenderAnnotationData(data, divId, refDataId);
      // get draw layer
      drawLayer = layerGroup.getActiveDrawLayer();
      // set the layer shape handler
      drawLayer.setShapeHandler(this.#shapeHandler);
      // set active to bind to toolboxController
      layerGroup.setActiveDrawLayerByDataId(drawLayer.getDataId());
    }

    // data should exist / be created
    const data = drawLayer.getDrawController().getAnnotationGroup();

    const stage = drawLayer.getKonvaStage();

    // update scale
    this.#style.setZoomScale(stage.scale());

    if (data.isEditable()) {
      // determine if the click happened on an existing shape or not
      const kshape = stage.getIntersection({
        x: point.getX(),
        y: point.getY()
      });
      if (kshape) {
        // select shape for edition
        this.#selectShapeGroup(drawLayer, kshape);
      } else {
        // create new shape
        this.#startShapeGroupCreation(layerGroup, point);
      }
    }
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
    this.#shapeHandler.disableAndResetEditor();
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
   * @param {DrawLayer} drawLayer The draw layer where to draw.
   * @param {Konva.Shape} kshape The shape that has been selected.
   */
  #selectShapeGroup(drawLayer, kshape) {
    const group = kshape.getParent();
    const selectedShape = group.find('.shape')[0];
    if (!(selectedShape instanceof Konva.Shape)) {
      return;
    }
    this.#shapeHandler.setEditorShape(selectedShape, drawLayer);
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
    if (this.#currentFactory &&
      typeof this.#currentFactory.getNPoints() !== 'undefined') {
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
    const annotation = this.#shapeHandler.getEditorAnnotation();
    if ((event.key === 'Delete' ||
      event.key === 'Backspace') &&
      typeof annotation !== 'undefined') {
      const layerGroup = this.#app.getActiveLayerGroup();
      const drawLayer = layerGroup.getActiveDrawLayer();
      const drawController = drawLayer.getDrawController();

      // create remove annotation command
      const command = new RemoveAnnotationCommand(annotation, drawController);
      // add command to undo stack
      this.#app.addToUndoStack(command);
      // execute command: triggers draw remove
      command.execute();

      // reset cursor
      this.#shapeHandler.onMouseOutShapeGroup();
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
    const drawController = drawLayer.getDrawController();
    const konvaLayer = drawLayer.getKonvaLayer();
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();

    // auto mode: vary shape colour with layer id
    if (this.#autoShapeColour) {
      const colours = [
        '#ffff80', '#ff80ff', '#80ffff', '#80ff80', '8080ff', 'ff8080'
      ];
      // warning: depends on layer id nomenclature
      const drawLayerId = drawLayer.getId();
      const layerId = drawLayerId.substring(drawLayerId.length - 1);
      const layerIndex = parseInt(layerId, 10) - 1;
      const colour = colours[layerIndex];
      if (typeof colour !== 'undefined') {
        this.#style.setLineColour(colour);
      }
    }

    // create tmp annotation
    const annotation = new Annotation();
    // use group colour if defined
    const groupColour = drawController.getAnnotationGroup().getColour();
    if (typeof groupColour !== 'undefined') {
      annotation.colour = groupColour;
    } else {
      annotation.colour = this.#style.getLineColour();
    }
    annotation.init(viewController);
    // set annotation shape
    this.#currentFactory.setAnnotationMathShape(annotation, tmpPoints);
    // create shape group
    this.#tmpShapeGroup =
      this.#currentFactory.createShapeGroup(annotation, this.#style);
    // set the label visibility
    drawLayer.setLabelVisibility(this.#tmpShapeGroup);

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
    // (has to be done before sending add event)
    if (this.#tmpShapeGroup) {
      this.#tmpShapeGroup.destroy();
      this.#tmpShapeGroup = null;
    }

    const drawLayer = layerGroup.getActiveDrawLayer();
    const konvaLayer = drawLayer.getKonvaLayer();
    const drawController = drawLayer.getDrawController();
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();

    // create final annotation
    const annotation = new Annotation();
    // use group colour if defined
    const groupColour = drawController.getAnnotationGroup().getColour();
    if (typeof groupColour !== 'undefined') {
      annotation.colour = groupColour;
    } else {
      annotation.colour = this.#style.getLineColour();
    }
    annotation.id = guid();
    annotation.init(viewController);
    // set annotation shape
    this.#currentFactory.setAnnotationMathShape(annotation, finalPoints);

    // create add annotation command
    const command = new AddAnnotationCommand(annotation, drawController);
    // add command to undo stack
    this.#app.addToUndoStack(command);
    // execute command: triggers draw creation
    command.execute();

    // re-activate layer
    konvaLayer.listening(true);
  }

  /**
   * Get a DrawLayer position callback.
   *
   * TODO: check need for store item removal.
   *
   * @param {DrawLayer} layer The layer to update.
   * @returns {Function} The callback.
   */
  #getPositionCallback(layer) {
    const layerId = layer.getId();
    if (typeof this.#callbackStore[layerId] === 'undefined') {
      this.#callbackStore[layerId] = () => {
        layer.activateCurrentPositionShapes(true);
      };
    }
    return this.#callbackStore[layerId];
  }

  /**
   * Activate the tool.
   *
   * @param {boolean} flag The flag to activate or not.
   */
  activate(flag) {
    // force cursor if deactivate
    if (!flag) {
      this.#shapeHandler.onMouseOutShapeGroup();
    }
    // update draw layers
    const drawLayers = this.#app.getDrawLayers();
    for (const drawLayer of drawLayers) {
      if (typeof drawLayer !== 'undefined') {
        drawLayer.setShapeHandler(this.#shapeHandler);
        drawLayer.activateCurrentPositionShapes(flag);
        // update on position change
        if (flag) {
          this.#app.addEventListener('positionchange',
            this.#getPositionCallback(drawLayer)
          );
        } else {
          this.#app.removeEventListener('positionchange',
            this.#getPositionCallback(drawLayer)
          );
        }
      }
    }
  }

  /**
   * Set the tool configuration options.
   *
   * @param {object} options The list of shape names amd classes.
   */
  setOptions(options) {
    // save the options as the shape factory list
    this.#shapeFactoryList = options;
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
      this.#shapeHandler.storeMouseOverCursor(features.mouseOverCursor);
    }
    if (typeof features.withScroll !== 'undefined') {
      this.#withScroll = features.withScroll;
    }
    if (typeof features.blacklist !== 'undefined') {
      this.#blacklist = features.blacklist;
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
      'annotationupdate', 'warn'
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
