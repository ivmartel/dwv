import {getLayerDetailsFromEvent} from '../gui/layerGroup.js';
import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic.js';
import {logger} from '../utils/logger.js';
import {
  AddAnnotationCommand,
  RemoveAnnotationCommand
} from '../command/drawCommands.js';
import {
  isNodeNameShape,
} from './shapes/drawBounds.js';
import {Annotation} from '../image/annotation.js';
import {ScrollWheelBehavior} from './behaviors/wheelBehavior.js';
import {WheelTick} from './behaviors/wheelTick.js';
import {runWheelTickPipeline} from './behaviors/wheelTickPipeline.js';
import {DrawShapeHandler} from './shapes/drawShapeHandler.js';

// external
import Konva from 'konva';

/**
 * @import {App} from '../app/application.js';
 * @import {Style} from '../gui/style.js';
 * @import {LayerGroup} from '../gui/layerGroup.js';
 * @import {Point2D} from '../math/point.js';
 * @import {DrawLayer} from '../gui/drawLayer.js';
 * @import {ViewLayer} from '../gui/viewLayer.js';
 */

/**
 * Drawing tool.
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
   * @type {ScrollWheelBehavior}
   */
  #scrollWhell;

  /**
   * @type {WheelTick}
   */
  #wheelTick = new WheelTick();

  /**
   * Drawing style.
   *
   * @type {Style}
   */
  #style;

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
   * With scroll flag.
   *
   * @type {boolean}
   */
  #withScroll = true;

  /**
   * Reference data validator: function that takes the reference
   *   image meta data and returns a boolean.
   *
   * @type {Function}
   */
  #refMetaValidator;

  /**
   * Draw data validator: function that takes the annotation group
   *   meta data and returns a boolean.
   *
   * @type {Function}
   */
  #drawMetaValidator;

  /**
   * Annotation group meta data to pass to newly created groups.
   * Array of {concept: string, value: string}.
   *
   * @type {object[]}
   */
  #annotationGroupMeta;

  /**
   * Annotation meta data to pass to newly created annotations.
   * Array of either {concept: DicomCode, value: DicomCode} or
   *   {concept: DicomCode, value: string}.
   *
   * @type {object[]}
   */
  #annotationMeta;

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
   * Callback store to allow attach/detach.
   *
   * @type {Array}
   */
  #callbackStore = [];

  /**
   * @type {Point2D}
   */
  #lastMovePoint;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
    this.#scrollWhell = new ScrollWheelBehavior();
    this.#shapeHandler = new DrawShapeHandler(app, this.#fireEvent);

    this.#style = app.getStyle();
  }

  /**
   * Check if a draw layer can be created in the given layer group.
   * Uses the validator provided as feature. Default returns true.
   *
   * @param {LayerGroup} layerGroup The layer group
   *   where to create the draw layer.
   * @returns {boolean} True if possible.
   */
  #checkDrawRefData(layerGroup) {
    let res = true;

    // validate reference meta data
    if (typeof this.#refMetaValidator !== 'undefined') {
      const referenceViewLayer = layerGroup.getActiveViewLayer();
      const refDataId = referenceViewLayer.getDataId();
      const refData = this.#app.getData(refDataId);
      const refMeta = refData.image.getMeta();
      res = this.#refMetaValidator(refMeta);
    }

    return res;
  }

  /**
   * Check if the base image supports drawing.
   *
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} True if the image is resampled.
   */
  #checkBaseData(layerGroup) {
    const viewLayer = layerGroup.getBaseViewLayer();
    const baseDataId = viewLayer.getDataId();
    const baseData = this.#app.getData(baseDataId);
    const baseImage = baseData.image;

    return !baseImage.isResampled();
  }

  /**
   * Check if a draw can be created in the given draw layer.
   * Uses the validator provided as feature. Default returns true.
   *
   * @param {DrawLayer} drawLayer The layer where to create the draw.
   * @returns {boolean} True if possible.
   */
  #checkDrawData(drawLayer) {
    let res = true;

    // validate annotation group meta data
    if (typeof this.#drawMetaValidator !== 'undefined') {
      const drawDataId = drawLayer.getDataId();
      const drawData = this.#app.getData(drawDataId);
      const drawMeta = drawData.annotationGroup.getMeta();
      res = this.#drawMetaValidator(drawMeta);
    }

    return res;
  }

  /**
   * Create a draw layer in the given layer group.
   *
   * @param {LayerGroup} layerGroup The layer group where to create.
   * @returns {DrawLayer} The created layer.
   */
  #createDrawLayer(layerGroup) {
    const referenceViewLayer = layerGroup.getActiveViewLayer();
    const refDataId = referenceViewLayer.getDataId();

    // create new data
    const data = this.#app.createAnnotationData(refDataId);
    // add possible meta data
    if (typeof this.#annotationGroupMeta !== 'undefined') {
      for (const meta of this.#annotationGroupMeta) {
        data.annotationGroup.setMetaValue(meta.concept, meta.value);
      }
    }
    // render (will create draw layer)
    this.#app.addAndRenderAnnotationData(
      data, layerGroup.getDivId(), refDataId);
    // get draw layer
    const drawLayer = layerGroup.getActiveDrawLayer();
    // set the layer shape handler
    drawLayer.setShapeHandler(this.#shapeHandler);
    // set active to bind to toolboxController
    layerGroup.setActiveLayerByDataId(drawLayer.getDataId());

    // sync style
    const kStage = drawLayer.getKonvaStage();
    this.#style.setZoomScale(kStage.scale());

    return drawLayer;
  }

  /**
   * Get the selected shape at the given point.
   *
   * @param {Point2D} point The start point.
   * @param {DrawLayer} drawLayer The draw layer.
   * @returns {Konva.Shape|null} The shape or undefined if no shape
   *  bellow the input point.
   */
  #getSelectShape(point, drawLayer) {
    let res = null;

    if (typeof drawLayer !== 'undefined') {
      const data = drawLayer.getDrawController().getAnnotationGroup();
      if (data.isEditable()) {
        const kStage = drawLayer.getKonvaStage();
        // determine if the click happened on an existing shape or not
        res = kStage.getIntersection({
          x: point.getX(),
          y: point.getY()
        });
      }
    }
    return res;
  }

  /**
   * Draw warn event.
   *
   * @event Draw#warn
   * @type {object}
   * @property {string} type The event type.
   * @property {string} message The warning message.
   */

  /**
   * Check if a draw layer can be created.
   *
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} True if all ok.
   */
  #checkCanCreate(layerGroup) {
    if (!this.#checkDrawRefData(layerGroup)) {
      this.#fireEvent({
        type: 'warn',
        message: 'Cannot create draw, reference data is invalid'
      });
      return false;
    }

    if (!this.#checkBaseData(layerGroup)) {
      this.#fireEvent({
        type: 'warn',
        message: 'Cannot create draw, base data is invalid'
      });
      return false;
    }

    return true;
  }

  /**
   * Check if a draw layer can be created.
   *
   * @param {DrawLayer} drawLayer The draw layer.
   * @returns {boolean} True if all ok.
   */
  #checkCanEdit(drawLayer) {
    // draw data check
    if (!this.#checkDrawData(drawLayer)) {
      this.#fireEvent({
        type: 'warn',
        message: 'Cannot edit draw, data meta is invalid'
      });
      return false;
    }

    return true;
  }

  /**
   * Try to select a shape group.
   *
   * @param {Point2D} point The start point.
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} True if successful.
   */
  #tryToSelectShapeGroup(point, layerGroup) {
    const drawLayer = layerGroup.getActiveDrawLayer();

    // edit
    if (typeof drawLayer !== 'undefined' &&
      this.#checkCanEdit(drawLayer)) {
      const kShape = this.#getSelectShape(point, drawLayer);
      if (kShape) {
        this.#selectShapeGroup(kShape, drawLayer);
        return true;
      }
    }

    return false;
  }

  /**
   * Try to create shape group.
   *
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} True if successful.
   */
  #tryToCreateShapeGroup(layerGroup) {
    let drawLayer = layerGroup.getActiveDrawLayer();

    // create layer
    if (typeof drawLayer === 'undefined' &&
      this.#checkCanCreate(layerGroup)) {
      drawLayer = this.#createDrawLayer(layerGroup);
    }
    // start drawing
    if (typeof drawLayer !== 'undefined' &&
      this.#checkCanEdit(drawLayer)) {
      this.#startShapeGroupCreation();
      return true;
    }

    return false;
  }

  /**
   * Get the associated view layer.
   *
   * @param {LayerGroup} layerGroup The layer group to search.
   * @returns {ViewLayer|undefined} The view layer.
   */
  #getViewLayer(layerGroup) {
    const drawLayer = layerGroup.getActiveDrawLayer();
    if (typeof drawLayer === 'undefined') {
      logger.warn('No draw layer to do draw');
      return;
    }
    return layerGroup.getViewLayerById(
      drawLayer.getReferenceLayerId());
  }

  /**
   * Initializes the new shape creation.
   */
  #startShapeGroupCreation() {
    // disable edition
    this.#shapeHandler.disableAndResetEditor();
    // set factory
    this.#currentFactory = new this.#shapeFactoryList[this.#shapeName]();
    // reset points
    this.#points = [];
  }

  /**
   * @returns {boolean} True when interaction is ongoing.
   */
  #isDrawing() {
    return this.#points.length !== 0;
  }

  /**
   * Selects a shape group.
   *
   * @param {Konva.Shape} kshape The shape that has been selected.
   * @param {DrawLayer} drawLayer The draw layer.
   */
  #selectShapeGroup(kshape, drawLayer) {
    let group = kshape.getParent();
    // kshape: Konva.Tag -> parent: Konva.Label -> parent: Konva.Group
    if (kshape instanceof Konva.Tag) {
      group = group.getParent();
    }
    const selectedShape = group.find('.shape')[0];
    if (!(selectedShape instanceof Konva.Shape)) {
      return;
    }
    /**
     * Annotation select event.
     *
     * @event Draw#annotationselect
     * @type {object}
     * @property {string} type The event type.
     * @property {string} annotationid The annotation id.
     * @property {string} dataid The data id.
     */
    this.#fireEvent({
      type: 'annotationselect',
      annotationid: group.id(),
      dataid: drawLayer.getDataId()
    });
    this.#shapeHandler.setEditorShape(selectedShape, drawLayer);
  }

  /**
   * Update tool interaction.
   *
   * @param {Point2D} point The update point.
   * @param {LayerGroup} layerGroup The layer group.
   */
  #updateShapeGroupCreation(point, layerGroup) {
    // validate position
    const viewLayer = this.#getViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to update shape');
      return;
    }
    const pos = viewLayer.displayToPlanePos(point);
    const vc = viewLayer.getViewController();
    if (!vc.validatePlanePoint(pos)) {
      return;
    }

    this.#lastMovePoint = point;

    const tmpPoints = this.#points.slice();
    tmpPoints.push(point);
    // update points
    this.#onNewPoints(tmpPoints, layerGroup);
  }

  /**
   * Check shape creation: if enough points, stop drawing.
   *
   * @param {LayerGroup} layerGroup The layer group.
   */
  #checkShapeGroupCreation(layerGroup) {
    // do we have all the needed points
    if (typeof this.#currentFactory.getNPoints() !== 'undefined' &&
      this.#points.length !== 0 &&
      this.#points.length === this.#currentFactory.getNPoints()) {
      this.#onFinalPoints(this.#points, layerGroup);
    }
  }

  /**
   * Store a point if first or different from last.
   *
   * @param {Point2D} displayPoint The input point.
   */
  #storePoint(displayPoint) {
    let isNew;
    const nPoints = this.#points.length;
    if (nPoints !== 0) {
      const lastPoint = this.#points[nPoints - 1];
      isNew = lastPoint.getX() !== displayPoint.getX() ||
        lastPoint.getY() !== displayPoint.getY();
    } else {
      isNew = true;
    }
    if (isNew) {
      this.#points.push(displayPoint);
    }
  }

  /**
   * @param {Point2D} point The update point.
   * @param {LayerGroup} layerGroup The layer group.
   */
  #onInteractionStep(point, layerGroup) {
    // try to select
    if (this.#tryToSelectShapeGroup(point, layerGroup)) {
      return;
    }
    // try to create
    if (!this.#isDrawing()) {
      if (!this.#tryToCreateShapeGroup(layerGroup)) {
        return;
      }
    }
    // store point (before check)
    this.#storePoint(point);
    // check if done
    this.#checkShapeGroupCreation(layerGroup);
  }

  /**
   * Handle mouse down event.
   *
   * @param {object} _event The mouse down event.
   */
  mousedown = (_event) => {
    // does nothing
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  mousemove = (event) => {
    // exit if not started draw
    if (!this.#isDrawing()) {
      return;
    }
    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    this.#updateShapeGroupCreation(mousePoint, layerGroup);
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} event The mouse up event.
   */
  mouseup = (event) => {
    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    this.#onInteractionStep(mousePoint, layerGroup);
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  mouseout = (event) => {
    // exit if not started draw
    if (!this.#isDrawing()) {
      return;
    }

    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);

    // store point (before check)
    this.#storePoint(this.#lastMovePoint);
    // check if done
    this.#checkShapeGroupCreation(layerGroup);
  };

  /**
   * Handle double click event: some tools use it to finish interaction.
   *
   * @param {object} event The double click event.
   */
  dblclick = (event) => {
    // exit if not started draw
    if (!this.#isDrawing()) {
      return;
    }
    // only end by double click undefined NPoints
    if (this.#currentFactory &&
      typeof this.#currentFactory.getNPoints() !== 'undefined') {
      return;
    }

    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);

    // store point (before final)
    this.#storePoint(mousePoint);
    // finalise (no length check)
    this.#onFinalPoints(this.#points, layerGroup);
  };

  /**
   * Handle touch start event.
   *
   * @param {object} _event The touch start event.
   */
  touchstart = (_event) => {
    // does nothing
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    // does nothing
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  touchend = (event) => {
    const touchPoint = getTouchPoints(event)[0];
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    this.#onInteractionStep(touchPoint, layerGroup);
  };

  /**
   * Handle mouse wheel event.
   *
   * @param {WheelEvent} event The mouse wheel event.
   */
  wheel = (event) => {
    if (this.#withScroll) {
      runWheelTickPipeline(
        event, this.#app, this.#wheelTick, this.#scrollWhell);
    }
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    // call app handler if we are not in the middle of a draw
    if (!this.#isDrawing()) {
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
      if (typeof drawLayer === 'undefined') {
        logger.warn('No draw layer to handle key down');
        return;
      }
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
      // redraw
      konvaLayer.draw();
    }
  };

  /**
   * Set the auto shape colour based on the input layer id.
   *
   * @param {DrawLayer} drawLayer The input layer.
   */
  #setAutoColour(drawLayer) {
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
  }

  /**
   * Create an annotation based on the input points.
   *
   * @param {Point2D[]} tmpPoints The array of new points.
   * @param {LayerGroup} layerGroup The origin layer group.
   * @returns {Annotation|undefined} The created annotation.
   */
  #getAnnotation(tmpPoints, layerGroup) {
    const drawLayer = layerGroup.getActiveDrawLayer();
    const drawController = drawLayer.getDrawController();

    const viewLayer = layerGroup.getViewLayerById(
      drawLayer.getReferenceLayerId());
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to handle new points');
      return;
    }
    const viewController = viewLayer.getViewController();

    // create annotation
    const annotation = new Annotation();
    // use group colour if defined
    const groupColour = drawController.getAnnotationGroup().getColour();
    if (typeof groupColour !== 'undefined') {
      annotation.colour = groupColour;
    } else {
      annotation.colour = this.#style.getLineColour();
    }
    annotation.init(viewController);

    // meta data
    if (typeof this.#annotationMeta !== 'undefined') {
      for (const meta of this.#annotationMeta) {
        annotation.addMetaItem(meta.concept, meta.value);
      }
    }

    // set annotation shape
    const planePoints = tmpPoints.map((item) =>
      viewLayer.displayToPlanePos(item)
    );
    this.#currentFactory.setAnnotationMathShape(annotation, planePoints);

    return annotation;
  }

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
    if (typeof drawLayer === 'undefined') {
      logger.warn('No draw layer to handle new points');
      return;
    }
    const konvaLayer = drawLayer.getKonvaLayer();

    // set auto colour (if present)
    this.#setAutoColour(drawLayer);

    // get annotation
    const annotation = this.#getAnnotation(tmpPoints, layerGroup);

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
    if (typeof drawLayer === 'undefined') {
      logger.warn('No draw layer to handle final points');
      return;
    }
    const konvaLayer = drawLayer.getKonvaLayer();
    const drawController = drawLayer.getDrawController();

    // get annotation
    const annotation = this.#getAnnotation(finalPoints, layerGroup);

    // create add annotation command
    const command = new AddAnnotationCommand(annotation, drawController);
    // add command to undo stack
    this.#app.addToUndoStack(command);
    // execute command: triggers draw creation
    command.execute();

    // re-activate layer
    konvaLayer.listening(true);

    // reset points
    this.#points = [];
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
   * Activate a draw layer.
   *
   * @param {DrawLayer} drawLayer The layer to update.
   * @param {boolean} flag The flag to activate or not.
   */
  #activateLayer(drawLayer, flag) {
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
        this.#activateLayer(drawLayer, flag);
      }
    }
    // activate newly added layers
    this.#app.addEventListener('drawlayeradd', (event) => {
      const newDrawLayers = this.#app.getDrawLayers(function (item) {
        return item.getId() === event.layerid;
      });
      // should be just one
      if (newDrawLayers.length === 1) {
        this.#activateLayer(newDrawLayers[0], flag);
      }
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
   * Set the tool live features.
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
        throw new Error(`Unknown shape: '${features.shapeName}'`);
      }
      this.#shapeName = features.shapeName;
    }
    if (typeof features.mouseOverCursor !== 'undefined') {
      this.#shapeHandler.storeMouseOverCursor(features.mouseOverCursor);
    }
    if (typeof features.withScroll !== 'undefined') {
      this.#withScroll = features.withScroll;
    }
    if (typeof features.refMetaValidator !== 'undefined') {
      this.#refMetaValidator = features.refMetaValidator;
    }
    if (typeof features.drawMetaValidator !== 'undefined') {
      this.#drawMetaValidator = features.drawMetaValidator;
    }
    if (typeof features.annotationGroupMeta !== 'undefined') {
      this.#annotationGroupMeta = features.annotationGroupMeta;
    }
    if (typeof features.annotationMeta !== 'undefined') {
      this.#annotationMeta = features.annotationMeta;
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
      'annotationupdate', 'annotationselect', 'warn'
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
