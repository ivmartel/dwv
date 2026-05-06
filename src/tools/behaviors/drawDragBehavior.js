import {DragBehavior} from './dragBehavior.js';
import {
  isValidDrawPoint,
  DrawPreview
} from './drawPreview.js';

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
 * @import {DrawShapeHandler} from '../shapes/drawShapeHandler.js';
 * @import {DragStep} from './dragBehavior.js';
 */

/**
 * Drag-driven placement session for {@link Draw}.
 */
export class DrawDragBehavior extends DragBehavior {

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

  canStart() {
    return this.#drawPreview.getNPoints() === 2;
  }

  /**
   * @param {Point2D} point Display point.
   * @param {LayerGroup} layerGroup Layer group.
   */
  onStart(point, layerGroup) {
    if (!this.isActive()) {
      const drawLayer = layerGroup.getActiveDrawLayer();
      if (typeof drawLayer !== 'undefined') {
        if (this.#getSelectShape(point, drawLayer)) {
          return;
        }
      }

      // shape creation
      if (this.#drawPreview.tryBeginPlacement(layerGroup)) {
        this.#shapeHandler.disableAndResetEditor();
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

    super.onStart(point, layerGroup);
  }

  /**
   * Preview update while pointer moves during sticky placement.
   *
   * @param {DragStep} _drag Step with {@link DragStep#delta}.
   * @param {LayerGroup} layerGroup Layer group.
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
