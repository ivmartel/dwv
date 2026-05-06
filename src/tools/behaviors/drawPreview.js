import {logger} from '../../utils/logger.js';
import {AddAnnotationCommand} from '../../command/drawCommands.js';
import {isNodeNameShape} from '../shapes/drawBounds.js';
import {Annotation} from '../../image/annotation.js';

// doc imports
/* eslint-disable no-unused-vars */
// external
import Konva from 'konva';
/* eslint-enable no-unused-vars */

/**
 * @import {App} from '../../app/application.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {DrawLayer} from '../../gui/drawLayer.js';
 * @import {Point2D} from '../../math/point.js';
 * @import {Style} from '../../gui/style.js';
 */

/**
 * Check if a point is valid in the input layerGroup active
 * draw layer.
 *
 * @param {Point2D} point The display point to validate.
 * @param {LayerGroup} layerGroup The layer group.
 * @returns {boolean} True if valid.
 */
export function isValidDrawPoint(point, layerGroup) {
  // active draw layer
  const drawLayer = layerGroup.getActiveDrawLayer();
  if (typeof drawLayer === 'undefined') {
    logger.warn('No draw layer to check point');
    return;
  }
  // ref view layer
  const viewLayer = layerGroup.getViewLayerById(
    drawLayer.getReferenceLayerId());
  if (typeof viewLayer === 'undefined') {
    logger.warn('No view layer to check point');
    return;
  }
  // check point
  const pos = viewLayer.displayToPlanePos(point);
  const vc = viewLayer.getViewController();
  return vc.validatePlanePoint(pos);
}

/**
 * Draw preview class.
 */
export class DrawPreview {

  /**
   * @type {App}
   */
  #app;

  /**
   * Current draw style (line colour, zoom scale, …).
   *
   * @type {Style}
   */
  #style;

  /**
   * @type {object|null}
   */
  #shapeFactoryList = null;

  /**
   * @type {string|undefined}
   */
  #shapeName;

  /**
   * @type {object|null}
   */
  #currentFactory = null;

  /**
   * @type {Konva.Group|null}
   */
  #tmpShapeGroup = null;

  /**
   * Reference image meta validator.
   *
   * @type {Function|undefined}
   */
  #refMetaValidator;

  /**
   * Meta entries for new annotation groups.
   *
   * @type {object[]|undefined}
   */
  #annotationGroupMeta;

  /**
   * Meta entries for new annotations.
   *
   * @type {object[]|undefined}
   */
  #annotationMeta;

  /**
   * Use per-layer default colours when placing shapes.
   *
   * @type {boolean}
   */
  #autoShapeColour = false;

  /**
   * @param {App} app The application.
   */
  constructor(app) {
    this.#app = app;
    this.#style = app.getStyle();
  }

  /**
   * @param {object} options Shape factory map (name → constructor).
   */
  setOptions(options) {
    this.#shapeFactoryList = options;
  }

  /**
   * @param {object} features Live features (shape, colour, meta, …).
   */
  setFeatures(features) {
    if (typeof features.autoShapeColour !== 'undefined') {
      this.#autoShapeColour = features.autoShapeColour;
    }
    if (typeof features.shapeColour !== 'undefined') {
      this.#style.setLineColour(features.shapeColour);
      this.#autoShapeColour = false;
    }
    if (typeof features.refMetaValidator !== 'undefined') {
      this.#refMetaValidator = features.refMetaValidator;
    }
    if (typeof features.annotationGroupMeta !== 'undefined') {
      this.#annotationGroupMeta = features.annotationGroupMeta;
    }
    if (typeof features.annotationMeta !== 'undefined') {
      this.#annotationMeta = features.annotationMeta;
    }
    if (typeof features.shapeName !== 'undefined') {
      if (!this.hasShape(features.shapeName)) {
        throw new Error(`Unknown shape: '${features.shapeName}'`);
      }
      this.#shapeName = features.shapeName;
      this.#currentFactory = new this.#shapeFactoryList[this.#shapeName]();
    }
  }

  /**
   * @param {string} name Shape id.
   * @returns {boolean} True if registered.
   */
  hasShape(name) {
    return typeof this.#shapeFactoryList?.[name] !== 'undefined';
  }

  /**
   * Create draw layer if needed and start factory placement (no vertex yet).
   *
   * @param {LayerGroup} layerGroup Layer group.
   * @returns {boolean} True if placement can proceed (layer ready).
   */
  tryBeginPlacement(layerGroup) {
    let drawLayer = layerGroup.getActiveDrawLayer();

    if (typeof drawLayer === 'undefined' &&
      this.#checkDrawRefData(layerGroup) &&
      this.#checkBaseData(layerGroup)) {
      drawLayer = this.#createDrawLayer(layerGroup);
    }
    if (typeof drawLayer !== 'undefined' &&
      this.#checkShapeGroupCreation()) {
      return true;
    }

    return false;
  }

  /**
   * Check if shape can be created.
   *
   * @returns {boolean} True if possible.
   */
  #checkShapeGroupCreation() {
    if (!this.#shapeFactoryList || !this.#shapeName) {
      logger.warn('DrawPreview: missing factory list or shape name');
      return false;
    }
    return true;
  }

  /**
   * Get the current shape number of points.
   *
   * @returns {number|undefined} The number of points or undefined.
   */
  getNPoints() {
    let number = 0;
    if (this.#currentFactory) {
      number = this.#currentFactory.getNPoints();
    }
    return number;
  }

  /**
   * Clear temporary preview and tap session (Escape / cancel).
   */
  resetPlacement() {
    if (this.#tmpShapeGroup) {
      const konvaLayer = this.#tmpShapeGroup.getLayer();
      this.#tmpShapeGroup.destroy();
      this.#tmpShapeGroup = null;
      konvaLayer.draw();
    }
  }

  /**
   * Check if the reference data (of the active view layer) is
   *  valid.
   *
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} True if the data is valid.
   */
  #checkDrawRefData(layerGroup) {
    let res = true;
    const validator = this.#refMetaValidator;
    if (typeof validator !== 'undefined') {
      const referenceViewLayer = layerGroup.getActiveViewLayer();
      const refDataId = referenceViewLayer.getDataId();
      const refData = this.#app.getData(refDataId);
      const refMeta = refData.image.getMeta();
      res = validator(refMeta);
    }
    return res;
  }

  /**
   * Check if the base data (of the base view layer) is
   *  valid.
   *
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} True if the data is valid.
   */
  #checkBaseData(layerGroup) {
    const viewLayer = layerGroup.getBaseViewLayer();
    const baseDataId = viewLayer.getDataId();
    const baseData = this.#app.getData(baseDataId);
    const baseImage = baseData.image;

    return !baseImage.isResampled();
  }

  /**
   * Get the reason why a shape cannot be created.
   *
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {string} The reason.
   */
  getCannotCreateReason(layerGroup) {
    let reason;
    if (!this.#checkDrawRefData(layerGroup)) {
      reason = 'reference data is invalid';
    }
    if (!this.#checkBaseData(layerGroup)) {
      reason = 'base data is invalid';
    }
    return reason;
  }

  /**
   * Create a draw layer.
   *
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {DrawLayer} The created layer.
   */
  #createDrawLayer(layerGroup) {
    const referenceViewLayer = layerGroup.getActiveViewLayer();
    const refDataId = referenceViewLayer.getDataId();

    const data = this.#app.createAnnotationData(refDataId);
    const groupMeta = this.#annotationGroupMeta;
    if (typeof groupMeta !== 'undefined') {
      for (const meta of groupMeta) {
        data.annotationGroup.setMetaValue(meta.concept, meta.value);
      }
    }
    this.#app.addAndRenderAnnotationData(
      data, layerGroup.getDivId(), refDataId);
    const drawLayer = layerGroup.getActiveDrawLayer();
    layerGroup.setActiveLayerByDataId(drawLayer.getDataId());

    const kStage = drawLayer.getKonvaStage();
    this.#style.setZoomScale(kStage.scale());

    return drawLayer;
  }

  /**
   * Set the style line color from the input layer id.
   *
   * @param {DrawLayer} drawLayer The draw layer.
   */
  #setAutoColour(drawLayer) {
    if (this.#autoShapeColour) {
      const colours = [
        '#ffff80', '#ff80ff', '#80ffff', '#80ff80', '8080ff', 'ff8080'
      ];
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
   * Create an annotation from the input points.
   *
   * @param {Point2D[]} tmpPoints Display points.
   * @param {LayerGroup} layerGroup Layer group.
   * @returns {Annotation|undefined} New annotation or undefined.
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

    const annotation = new Annotation();
    const groupColour = drawController.getAnnotationGroup().getColour();
    if (typeof groupColour !== 'undefined') {
      annotation.colour = groupColour;
    } else {
      annotation.colour = this.#style.getLineColour();
    }
    annotation.init(viewController);

    const meta = this.#annotationMeta;
    if (typeof meta !== 'undefined') {
      for (const item of meta) {
        annotation.addMetaItem(item.concept, item.value);
      }
    }

    const planePoints = tmpPoints.map((item) =>
      viewLayer.displayToPlanePos(item)
    );
    this.#currentFactory.setAnnotationMathShape(annotation, planePoints);

    return annotation;
  }

  /**
   * Handle new points.
   *
   * @param {Point2D[]} tmpPoints Display points.
   * @param {LayerGroup} layerGroup Layer group.
   */
  onNewPoints(tmpPoints, layerGroup) {
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

    this.#setAutoColour(drawLayer);

    const annotation = this.#getAnnotation(tmpPoints, layerGroup);
    if (typeof annotation === 'undefined') {
      return;
    }

    this.#tmpShapeGroup =
      this.#currentFactory.createShapeGroup(annotation, this.#style);
    drawLayer.setLabelVisibility(this.#tmpShapeGroup);

    const shape = this.#tmpShapeGroup.getChildren(isNodeNameShape)[0];
    shape.listening(false);
    konvaLayer.listening(false);
    konvaLayer.add(this.#tmpShapeGroup);
    konvaLayer.draw();
  }

  /**
   * Handle final points.
   *
   * @param {Point2D[]} finalPoints Display points.
   * @param {LayerGroup} layerGroup Layer group.
   */
  onFinalPoints(finalPoints, layerGroup) {
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

    const annotation = this.#getAnnotation(finalPoints, layerGroup);
    if (typeof annotation === 'undefined') {
      return;
    }

    const command = new AddAnnotationCommand(annotation, drawController);
    this.#app.addToUndoStack(command);
    command.execute();

    konvaLayer.listening(true);
  }

}
