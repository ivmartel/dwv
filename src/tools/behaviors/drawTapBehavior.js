import {TapBehavior} from './tapBehavior.js';
import {
  isValidDrawPoint,
  DrawPreview
} from './drawPreview.js';

// external
import Konva from 'konva';

/**
 * @import {App} from '../../app/application.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {Point2D} from '../../math/point.js';
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
   * Is the input point the last in the points list.
   *
   * @param {Point2D} point The point to check.
   * @returns {boolean} True if equal to last.
   */
  #isLastListPoint(point) {
    const list = this.getPointList();
    if (list.length > 0) {
      const last = list[list.length - 1];
      return last.equals(point);
    }
    return false;
  }

  /**
   * Preview update while pointer moves during sticky placement.
   *
   * @param {Point2D} point Display point.
   * @param {LayerGroup} layerGroup Layer group.
   * @override
   */
  onUpdate(point, layerGroup) {
    if (!this.isActive()) {
      return;
    }
    // exit if known point
    if (this.#isLastListPoint(point)) {
      return;
    }
    // exit if not valid
    if (!isValidDrawPoint(point, layerGroup)) {
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
   * @override
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

    // exit if known point
    if (this.#isLastListPoint(point)) {
      return;
    }

    // add point
    this.#placementLayerGroup = layerGroup;
    super.onTap(point, layerGroup);
  }

  /**
   * TapBehavior ends session — finalize fixed-count shapes or clear preview.
   *
   * @override
   */
  onEnd() {
    const pts = this.getPointList();
    const lg = this.#placementLayerGroup;
    const n = this.#drawPreview.getNPoints();

    if (pts.length > 0 && lg) {
      if (typeof n !== 'undefined') {
        if (pts.length === n) {
          // we have all points -> finish
          this.#drawPreview.onFinalPoints(pts, lg);
        } else if (pts.length === n - 1 &&
          typeof this.#lastMovePoint !== 'undefined' &&
          !this.#isLastListPoint(this.#lastMovePoint)) {
          // one point missing -> finish with last move
          // (for ex on mouse out)
          pts.push(this.#lastMovePoint);
          this.#drawPreview.onFinalPoints(pts, lg);
        } else {
          // missing points -> remove
          this.#drawPreview.resetPlacement();
        }
      } else if (pts.length > 2) {
        // undef npoints + some points -> finish
        this.#drawPreview.onFinalPoints(pts, lg);
      } else {
        // undef npoints + not finished -> remove
        this.#drawPreview.resetPlacement();
      }
    }

    this.#lastMovePoint = undefined;
    this.#placementLayerGroup = undefined;
    super.onEnd();
  }
}
