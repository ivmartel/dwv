import {logger} from '../../utils/logger.js';
import {TapBehavior} from './tapBehavior.js';
import {DrawPreview} from './drawPreview.js';

// external
import Konva from 'konva';

/**
 * @import {App} from '../../app/application.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {Point2D} from '../../math/point.js';
 * @import {ViewLayer} from '../../gui/viewLayer.js';
 * @import {DrawLayer} from '../../gui/drawLayer.js';
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
   * Annotation group meta validator.
   *
   * @type {Function|undefined}
   */
  #drawMetaValidator;

  /**
   * Draw preview.
   *
   * @type {DrawPreview}
   */
  #drawPreview;

  /**
   * @param {App} app The application.
   * @param {DrawShapeHandler} shapeHandler Handler for selecting and editing
   *   existing shapes.
   */
  constructor(app, shapeHandler) {
    super();
    this.#app = app;
    this.#shapeHandler = shapeHandler;
    this.#drawPreview = new DrawPreview(app);
  }

  /**
   * @param {object} options Shape factory map (name → constructor).
   */
  setOptions(options) {
    this.#drawPreview.setOptions(options);
  }

  /**
   * @param {object} features Live features (shape, colour, meta, …).
   */
  setFeatures(features) {
    if (typeof features.drawMetaValidator !== 'undefined') {
      this.#drawMetaValidator = features.drawMetaValidator;
    }
    this.#drawPreview.setFeatures(features);
  }

  /**
   * @param {string} name Shape id.
   * @returns {boolean} True if registered.
   */
  hasShape(name) {
    return this.#drawPreview.hasShape(name);
  }

  /**
   * Try to select an existing shape at the pointer.
   *
   * @param {Point2D} point Display point.
   * @param {LayerGroup} layerGroup Layer group.
   * @returns {boolean} True if selection consumed the event.
   */
  #trySelectShapeGroup(point, layerGroup) {
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
   * Apply the draw preview current shape number of points.
   */
  #applyTapLimitFromFactory() {
    const nPoints = this.#drawPreview.getNPoints();
    if (typeof nPoints === 'undefined') {
      super.setNumberOfTaps(OPEN_ENDED_TAP_LIMIT);
    } else {
      super.setNumberOfTaps(nPoints);
    }
  }

  /**
   * Clear temporary preview and tap session (Escape / cancel).
   */
  resetPlacement() {
    this.#drawPreview.resetPlacement();
    super.onEnd();
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

  /**
   * Check if the draw data is valid.
   *
   * @param {DrawLayer} drawLayer The draw layer.
   * @returns {boolean} True if the data is valid.
   */
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

  /**
   * Check if the draw data can be edited.
   *
   * @param {DrawLayer} drawLayer The draw layer.
   * @returns {boolean} True if the data is editable.
   */
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

  /**
   * Get the data under the input point.
   *
   * @param {Point2D} point The point where to find the data.
   * @param {DrawLayer} drawLayer The draw layer.
   * @returns {Konva.Shape|null} The shape of null.
   */
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

  /**
   * Selects a shape group.
   *
   * @param {Konva.Shape} kshape The shape that has been selected.
   * @param {DrawLayer} drawLayer The draw layer where to draw.
   */
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

    // update preview
    const tmpPoints = this.getPointList();
    tmpPoints.push(point);
    this.#drawPreview.onNewPoints(tmpPoints, layerGroup);
  }

  /**
   * @param {Point2D} point Display point.
   * @param {LayerGroup} layerGroup Layer group.
   */
  onTap(point, layerGroup) {
    if (!this.isActive()) {
      // shape selection
      if (this.#trySelectShapeGroup(point, layerGroup)) {
        return;
      }
      // shape creation
      if (this.#drawPreview.tryBeginPlacement(layerGroup)) {
        this.#shapeHandler.disableAndResetEditor();
        this.#applyTapLimitFromFactory();
      } else {
        const reason = this.#drawPreview.getCannotCreateReason(layerGroup);
        this.dispatchEvent(new CustomEvent('warn', {
          detail: {
            type: 'warn',
            message: `Cannot create draw, ${reason}`
          }
        }));
        return;
      }
    }

    // store point if not yet done
    const last = this.getPointList();
    if (last.length > 0) {
      const prev = last[last.length - 1];
      if (prev.getX() === point.getX() &&
        prev.getY() === point.getY()) {
        return;
      }
    }
    // add point
    this.#placementLayerGroup = layerGroup;
    super.onTap(point, layerGroup);
  }

  /**
   * TapBehavior ends session — finalize fixed-count shapes or clear preview.
   */
  onEnd() {
    const pts = this.getPointList();
    const lg = this.#placementLayerGroup;
    const n = this.#drawPreview.getNPoints();

    if (pts.length > 0 && lg) {
      if (typeof n !== 'undefined') {
        if (pts.length === n) {
          this.#drawPreview.onFinalPoints(pts, lg);
        } else if (pts.length === n - 1) {
          pts.push(this.#lastMovePoint);
          this.#drawPreview.onFinalPoints(pts, lg);
        }
      } else {
        this.#drawPreview.onFinalPoints(pts, lg);
      }
    }

    this.#lastMovePoint = undefined;
    this.#placementLayerGroup = undefined;
    super.onEnd();
  }
}
