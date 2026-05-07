import {DragBehavior} from './dragBehavior.js';
import {
  isValidDrawPoint,
  DrawPreview
} from './drawPreview.js';
import {DrawSelect} from './drawSelect.js';

// doc imports
/* eslint-disable no-unused-vars */
// external
import Konva from 'konva';
/* eslint-enable no-unused-vars */

/**
 * @import {App} from '../../app/application.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {Point2D} from '../../math/point.js';
 * @import {DrawLayer} from '../../gui/drawLayer.js';
 * @import {DragPointerStartContext, DragStep} from './dragBehavior.js';
 */

/**
 * Drag-driven placement session for {@link Draw}.
 */
export class DrawDragBehavior extends DragBehavior {

  /**
   * @type {DrawSelect}
   */
  #drawSelect;

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
   * Draw preview.
   *
   * @type {DrawPreview}
   */
  #drawPreview;

  /**
   * @param {App} app The application.
   * @param {DrawSelect} drawSelect Hepler for selecting and editing
   *   existing shapes.
   */
  constructor(app, drawSelect) {
    super();
    this.#drawSelect = drawSelect;
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
    this.#drawPreview.setFeatures(features);
  }

  /**
   * Clear temporary preview and tap session (Escape / cancel).
   */
  resetPlacement() {
    this.#drawPreview.resetPlacement();
    super.onEnd();
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
   * Gate drag placement to two-point shapes only (line-like placement).
   *
   * @param {Point2D} _point Display point (unused).
   * @param {LayerGroup} _layerGroup Layer group (unused).
   * @returns {boolean} True only when the active shape factory
   * expects two points.
   * @override
   */
  canStart(_point, _layerGroup) {
    return this.#drawPreview.getNPoints() === 2;
  }

  /**
   * @param {Point2D} point Display point.
   * @param {LayerGroup} layerGroup Layer group.
   * @param {DragPointerStartContext|undefined} [_pointerStart] Mouse/touch
   *   context from {@link LayerGroupPointer}.
   * @override
   */
  onStart(point, layerGroup, _pointerStart) {
    if (!this.isActive()) {
      const drawLayer = layerGroup.getActiveDrawLayer();
      if (typeof drawLayer !== 'undefined') {
        if (this.#getSelectShape(point, drawLayer)) {
          return;
        }
      }

      // shape creation
      if (this.#drawPreview.tryBeginPlacement(layerGroup)) {
        this.#drawSelect.disableAndResetEditor();
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
    // add point
    this.#placementLayerGroup = layerGroup;

    super.onStart(point, layerGroup, _pointerStart);
  }

  /**
   * Preview update while pointer moves during sticky placement.
   *
   * @param {DragStep} _drag Step with {@link DragStep#delta}.
   * @param {LayerGroup} layerGroup Layer group.
   * @override
   */
  onDrag(_drag, layerGroup) {
    if (!this.isActive()) {
      return;
    }
    // exit if not valid
    if (!isValidDrawPoint(this.prevPoint, layerGroup)) {
      return;
    }

    this.#lastMovePoint = this.prevPoint;
    this.#placementLayerGroup = layerGroup;

    // update preview
    const tmpPoints = [
      this.startPoint,
      this.#lastMovePoint
    ];
    this.#drawPreview.onNewPoints(tmpPoints, layerGroup);
  }

  /**
   * DragBehavior ends session — finalize shape.
   *
   * @override
   */
  onEnd() {
    const lg = this.#placementLayerGroup;
    if (lg && typeof this.#lastMovePoint !== 'undefined') {
      const finalPoints = [
        this.startPoint,
        this.#lastMovePoint
      ];
      this.#drawPreview.onFinalPoints(finalPoints, lg);
    }

    this.#lastMovePoint = undefined;
    this.#placementLayerGroup = undefined;
    super.onEnd();
  }
}
