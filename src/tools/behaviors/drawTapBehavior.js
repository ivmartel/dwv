import {logger} from '../../utils/logger.js';
import {AddAnnotationCommand} from '../../command/drawCommands.js';
import {isNodeNameShape} from '../shapes/drawBounds.js';
import {Annotation} from '../../image/annotation.js';
import {TapBehavior} from './tapBehavior.js';

// external
import Konva from 'konva';

/**
 * @import {App} from '../../app/application.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {Point2D} from '../../math/point.js';
 * @import {Style} from '../../gui/style.js';
 * @import {ViewLayer} from '../../gui/viewLayer.js';
 * @import {DrawShapeHandler} from '../shapes/drawShapeHandler.js';
 */

/**
 * Large tap budget when factory {@link ShapeFactory#getNPoints} is undefined.
 *
 * @type {number}
 */
const OPEN_ENDED_TAP_LIMIT = 65535;

/**
 * Tap-driven placement session for {@link Draw}.
 */
export class DrawTapBehavior extends TapBehavior {

  /**
   * @type {App}
   */
  #app;

  /**
   * @type {DrawShapeHandler}
   */
  #shapeHandler;

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
   * @type {Point2D|undefined}
   */
  #lastMovePoint;

  /**
   * Layer group for the current placement preview/finalize path.
   *
   * @type {LayerGroup|undefined}
   */
  #placementLayerGroup;

  /**
   * Reference image meta validator.
   *
   * @type {Function|undefined}
   */
  #refMetaValidator;

  /**
   * Annotation group meta validator.
   *
   * @type {Function|undefined}
   */
  #drawMetaValidator;

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
   * @param {DrawShapeHandler} shapeHandler Handler for selecting and editing
   *   existing shapes.
   */
  constructor(app, shapeHandler) {
    super();
    this.#app = app;
    this.#shapeHandler = shapeHandler;
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
    if (typeof features.drawMetaValidator !== 'undefined') {
      this.#drawMetaValidator = features.drawMetaValidator;
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
   * Try to select an existing shape at the pointer.
   *
   * @param {Point2D} point Display point.
   * @param {LayerGroup} layerGroup Layer group.
   * @returns {boolean} True if selection consumed the event.
   */
  trySelectShapeGroup(point, layerGroup) {
    const drawLayer = layerGroup.getActiveDrawLayer();

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
   * Create draw layer if needed and start factory placement (no vertex yet).
   *
   * @param {LayerGroup} layerGroup Layer group.
   * @returns {boolean} True if placement can proceed (layer ready).
   */
  tryBeginPlacement(layerGroup) {
    let drawLayer = layerGroup.getActiveDrawLayer();

    if (typeof drawLayer === 'undefined' &&
      this.#checkCanCreate(layerGroup)) {
      drawLayer = this.#createDrawLayer(layerGroup);
    }
    if (typeof drawLayer !== 'undefined' &&
      this.#checkCanEdit(drawLayer)) {
      this.#startShapeGroupCreation();
      return true;
    }

    return false;
  }

  /**
   * Start a new factory instance for the current shape name.
   */
  #startShapeGroupCreation() {
    if (!this.#shapeFactoryList || !this.#shapeName) {
      logger.warn('DrawTapBehavior: missing factory list or shape name');
      return;
    }
    this.#currentFactory = new this.#shapeFactoryList[this.#shapeName]();
  }

  #applyTapLimitFromFactory() {
    if (!this.#currentFactory) {
      return;
    }
    const nPoints = this.#currentFactory.getNPoints();
    if (typeof nPoints === 'undefined') {
      super.setNumberOfTaps(OPEN_ENDED_TAP_LIMIT);
    } else {
      super.setNumberOfTaps(nPoints);
    }
  }

  /**
   * Preview update while pointer moves during sticky placement.
   *
   * @param {Point2D} point Display point.
   * @param {LayerGroup} layerGroup Layer group.
   */
  onUpdate(point, layerGroup) {
    if (!this.isActive()) {
      return;
    }
    const viewLayer = this.#getViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      return;
    }
    const pos = viewLayer.displayToPlanePos(point);
    const vc = viewLayer.getViewController();
    if (!vc.validatePlanePoint(pos)) {
      return;
    }

    this.#lastMovePoint = point;
    this.#placementLayerGroup = layerGroup;

    const tmpPoints = this.getPointList();
    tmpPoints.push(point);
    this.#onNewPoints(tmpPoints, layerGroup);
  }

  /**
   * @param {Point2D} point Display point.
   * @param {LayerGroup} layerGroup Layer group.
   */
  onTap(point, layerGroup) {
    if (!this.isActive()) {
      if (this.trySelectShapeGroup(point, layerGroup)) {
        return;
      }
      if (this.tryBeginPlacement(layerGroup)) {
        this.#shapeHandler.disableAndResetEditor();
        this.#applyTapLimitFromFactory();
      } else {
        return;
      }
    }

    const last = this.getPointList();
    if (last.length > 0) {
      const prev = last[last.length - 1];
      if (prev.getX() === point.getX() &&
        prev.getY() === point.getY()) {
        return;
      }
    }

    this.#placementLayerGroup = layerGroup;
    super.onTap(point, layerGroup);
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
    super.onEnd();
    this.#currentFactory = null;
    this.#placementLayerGroup = undefined;
  }

  /**
   * @param {LayerGroup} layerGroup The layer group.
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

  #checkBaseData(layerGroup) {
    const viewLayer = layerGroup.getBaseViewLayer();
    const baseDataId = viewLayer.getDataId();
    const baseData = this.#app.getData(baseDataId);
    const baseImage = baseData.image;

    return !baseImage.isResampled();
  }

  #checkDrawData(drawLayer) {
    let res = true;
    const validator = this.#drawMetaValidator;
    if (typeof validator !== 'undefined') {
      const drawDataId = drawLayer.getDataId();
      const drawData = this.#app.getData(drawDataId);
      const drawMeta = drawData.annotationGroup.getMeta();
      res = validator(drawMeta);
    }
    return res;
  }

  #checkCanCreate(layerGroup) {
    if (!this.#checkDrawRefData(layerGroup)) {
      this.dispatchEvent(new CustomEvent('warn', {
        detail: {
          type: 'warn',
          message: 'Cannot create draw, reference data is invalid'
        }
      }));
      return false;
    }

    if (!this.#checkBaseData(layerGroup)) {
      this.dispatchEvent(new CustomEvent('warn', {
        detail: {
          type: 'warn',
          message: 'Cannot create draw, base data is invalid'
        }
      }));
      return false;
    }

    return true;
  }

  #checkCanEdit(drawLayer) {
    if (!this.#checkDrawData(drawLayer)) {
      this.dispatchEvent(new CustomEvent('warn', {
        detail: {
          type: 'warn',
          message: 'Cannot edit draw, data meta is invalid'
        }
      }));
      return false;
    }

    return true;
  }

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

  #getSelectShape(point, drawLayer) {
    let res = null;

    if (typeof drawLayer !== 'undefined') {
      const data = drawLayer.getDrawController().getAnnotationGroup();
      if (data.isEditable()) {
        const kStage = drawLayer.getKonvaStage();
        res = kStage.getIntersection({
          x: point.getX(),
          y: point.getY()
        });
      }
    }
    return res;
  }

  #selectShapeGroup(kshape, drawLayer) {
    let group = kshape.getParent();
    if (kshape instanceof Konva.Tag) {
      group = group.getParent();
    }
    const selectedShape = group.find('.shape')[0];
    if (!(selectedShape instanceof Konva.Shape)) {
      return;
    }
    this.dispatchEvent(new CustomEvent('annotationselect', {
      detail: {
        type: 'annotationselect',
        annotationid: group.id(),
        dataid: drawLayer.getDataId()
      }
    }));
    this.#shapeHandler.setEditorShape(selectedShape, drawLayer);
  }

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
   * @param {Point2D[]} tmpPoints Display points.
   * @param {LayerGroup} layerGroup Layer group.
   */
  #onNewPoints(tmpPoints, layerGroup) {
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
   * @param {Point2D[]} finalPoints Display points.
   * @param {LayerGroup} layerGroup Layer group.
   */
  #onFinalPoints(finalPoints, layerGroup) {
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

    this.#currentFactory = null;
    this.#placementLayerGroup = undefined;
  }

  /**
   * TapBehavior ends session — finalize fixed-count shapes or clear preview.
   */
  onEnd() {
    const pts = this.getPointList();
    const lg = this.#placementLayerGroup;
    const n = this.#currentFactory?.getNPoints?.();

    if (pts.length > 0 && lg) {
      if (typeof n !== 'undefined') {
        if (pts.length === n) {
          this.#onFinalPoints(pts, lg);
        } else if (pts.length === n - 1) {
          pts.push(this.#lastMovePoint);
          this.#onFinalPoints(pts, lg);
        }
      } else {
        this.#onFinalPoints(pts, lg);
      }
    }

    if (this.#tmpShapeGroup) {
      const konvaLayer = this.#tmpShapeGroup.getLayer();
      this.#tmpShapeGroup.destroy();
      this.#tmpShapeGroup = null;
      konvaLayer.draw();
    }

    this.#currentFactory = null;
    this.#placementLayerGroup = undefined;
    super.onEnd();
  }
}
