import {
  WindowLevel as WindowLevelValues
} from '../../image/windowLevel.js';
import {logger} from '../../utils/logger.js';
import {
  getActiveOrDrawRefViewLayer,
  getActiveOrFirstMonochromeViewLayer
} from './utils.js';
import {Point2D} from '../../math/point.js';

/**
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 */

/**
 * @typedef {object} DragBehaviorOptions
 * @property {number} [thresholdX] Minimum absolute display delta along X
 *   (pixels) before {@link DragBehavior#onDrag} runs; `0` disables the X
 *   check. Ignored together with `thresholdY` when both are `<= 0` (always
 *   invoke {@link DragBehavior#onDrag}).
 * @property {number} [thresholdY] Minimum absolute display delta along Y;
 *   `0` disables the Y check.
 */

/**
 * One pointer move while dragging: positions and delta from the previous event.
 */
export class DragStep {

  /**
   * @param {Point2D} point0 Position at the previous move (or down).
   * @param {Point2D} point1 Current pointer position (display space).
   * @param {DragBehaviorOptions} [options] Thresholds for
   *   {@link passesThresholdX}, {@link passesThresholdY}, and
   *   {@link passesThreshold}; default `0` / `0` (see
   *   {@link DragBehaviorOptions}).
   */
  constructor(point0, point1, {thresholdX = 0, thresholdY = 0} = {}) {
    this.point0 = point0;
    this.point1 = point1;
    this.dx = point1.getX() - point0.getX();
    this.dy = point1.getY() - point0.getY();
    this.thresholdX = thresholdX;
    this.thresholdY = thresholdY;
  }

  /**
   * @returns {boolean} True when `thresholdX` is `<= 0` (no minimum on X), or
   *   when `|dx| >= thresholdX`.
   */
  passesThresholdX() {
    const t = this.thresholdX;
    if (t <= 0) {
      return true;
    }
    return Math.abs(this.dx) >= t;
  }

  /**
   * @returns {boolean} True when `thresholdY` is `<= 0` (no minimum on Y), or
   *   when `|dy| >= thresholdY`.
   */
  passesThresholdY() {
    const t = this.thresholdY;
    if (t <= 0) {
      return true;
    }
    return Math.abs(this.dy) >= t;
  }

  /**
   * @returns {boolean} {@link passesThresholdX} `||` {@link passesThresholdY}.
   */
  passesThreshold() {
    return this.passesThresholdX() || this.passesThresholdY();
  }

}

/**
 * Base drag behaviour: optional start gate and drag lifecycle hooks.
 * Concrete tools extend this (e.g. {@link WindowLevelDragBehavior}).
 *
 * Pointer tracking for incremental {@link DragStep} deltas lives here
 * ({@link DragBehavior#onUpdate}); {@link LayerGroupPointer} only forwards
 * positions during an active drag.
 */
export class DragBehavior {

  /**
   * Previous pointer position for the current drag (set in {@link onStart},
   * updated in {@link onUpdate}, cleared in {@link onEnd}).
   *
   * @type {Point2D|null}
   */
  #prevPoint = null;

  /**
   * @type {number}
   */
  #thresholdX;

  /**
   * @type {number}
   */
  #thresholdY;

  /**
   * @param {DragBehaviorOptions} [options] Constructor options.
   */
  constructor({thresholdX = 0, thresholdY = 0} = {}) {
    this.#thresholdX = thresholdX;
    this.#thresholdY = thresholdY;
  }

  /**
   * @returns {boolean} True after {@link onStart} until {@link onEnd}.
   */
  isActive() {
    return this.#prevPoint !== null;
  }

  /**
   * @param {Point2D} _point The pointer position.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   * @returns {boolean} Whether a drag may begin.
   */
  canStart(_point, _layerGroup) {
    return true;
  }

  /**
   * @param {Point2D} point The pointer position at drag start.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   */
  onStart(point, _layerGroup) {
    this.#prevPoint = point;
  }

  /**
   * Advance the drag with a new pointer position. Builds a {@link DragStep}
   * with `point0` = previous position, `point1` = current, and this behavior's
   * `thresholdX` / `thresholdY`; calls {@link onDrag} when
   * {@link DragStep#passesThreshold} is true, then stores the current
   * point as the new previous position.
   *
   * @param {Point2D} point Current pointer position in display space.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onUpdate(point, layerGroup) {
    const drag = new DragStep(this.#prevPoint, point, {
      thresholdX: this.#thresholdX,
      thresholdY: this.#thresholdY
    });
    if (drag.passesThreshold()) {
      this.onDrag(drag, layerGroup);
      this.#prevPoint = point;
    }
  }

  /**
   * @param {DragStep} _drag Step with `dx`/`dy` and positions.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   */
  onDrag(_drag, _layerGroup) {
    // override in subclass
  }

  onEnd() {
    this.#prevPoint = null;
  }

}

/**
 * Window/level drag updates. Start: {@link WindowLevelDragBehavior.canStart}.
 */
export class WindowLevelDragBehavior extends DragBehavior {

  /**
   * If true, use only the active view layer; if false, resolve to the first
   * monochrome view layer among active layers.
   *
   * @type {boolean}
   */
  #activeViewLayerOnly;

  /**
   * @param {object} options Constructor options.
   * @param {boolean} [options.activeViewLayerOnly] Active view layer only.
   */
  constructor({activeViewLayerOnly = true} = {}) {
    // use default drag thresholds to trigger at each move
    super();
    this.#activeViewLayerOnly = activeViewLayerOnly;
  }

  /**
   * @param {boolean} activeViewLayerOnly Active view layer only.
   */
  setActiveViewLayerOnly(activeViewLayerOnly) {
    this.#activeViewLayerOnly = activeViewLayerOnly;
  }

  /**
   * @param {Point2D} _point The pointer position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} True if W/L adjustment is allowed.
   */
  canStart(_point, layerGroup) {
    const viewLayer = getActiveOrFirstMonochromeViewLayer(
      layerGroup, this.#activeViewLayerOnly);
    if (typeof viewLayer === 'undefined') {
      return false;
    }
    const viewController = viewLayer.getViewController();
    if (!viewController.isMonochrome()) {
      return false;
    }
    return true;
  }

  /**
   * @param {DragStep} drag Delta from previous event (`dx`/`dy`).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onDrag(drag, layerGroup) {
    const viewLayer = getActiveOrFirstMonochromeViewLayer(
      layerGroup, this.#activeViewLayerOnly);
    if (typeof viewLayer === 'undefined') {
      return;
    }
    const viewController = viewLayer.getViewController();

    const diffX = drag.dx;
    const diffY = -drag.dy;
    const range = viewController.getImageRescaledDataRange();
    const pixelToIntensity = (range.max - range.min) * 0.001;

    const center = viewController.getWindowLevel().center;
    const width = viewController.getWindowLevel().width;
    const windowCenter = center + (diffY * pixelToIntensity);
    const windowWidth = width + (diffX * pixelToIntensity);

    const wl = new WindowLevelValues(windowCenter, windowWidth);
    viewController.setWindowLevel(wl);
  }

}

/**
 * Slice scroll drag updates. Start: {@link ScrollDragBehavior.canStart}.
 * Uses a fixed 15×15 display-pixel {@link DragBehaviorOptions} drag step
 * threshold; each {@link onDrag} step is one such qualifying move — no
 * separate step anchor.
 */
export class ScrollDragBehavior extends DragBehavior {

  constructor() {
    super({
      thresholdX: 15,
      thresholdY: 15
    });
  }

  /**
   * @param {Point2D} _point The pointer position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} True if scrolling is possible.
   */
  canStart(_point, layerGroup) {
    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to start scroll');
      return false;
    }
    return true;
  }

  /**
   * @param {DragStep} drag Step with 15×15 thresholds from this behavior.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onDrag(drag, layerGroup) {
    const positionHelper = layerGroup.getPositionHelper();

    if (drag.passesThresholdY() && layerGroup.canScroll()) {
      if (drag.dy > 0) {
        positionHelper.decrementPositionAlongScroll();
      } else {
        positionHelper.incrementPositionAlongScroll();
      }
    } else if (drag.passesThresholdX() && layerGroup.moreThanOne(3)) {
      if (drag.dx > 0) {
        positionHelper.incrementPosition(3);
      } else {
        positionHelper.decrementPosition(3);
      }
    }
  }

}

/**
 * Horizontal drag adjusts the active layer opacity (`dx` / 200 per qualifying
 * horizontal step). Uses a fixed 15×15 display-pixel
 * {@link DragBehaviorOptions} drag step threshold; opacity updates only when
 * {@link DragStep#passesThresholdX} is true for that step.
 */
export class OpacityDragBehavior extends DragBehavior {

  constructor() {
    super({
      thresholdX: 15,
      thresholdY: 15
    });
  }

  /**
   * @param {Point2D} _point The pointer position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} True when an active layer exists.
   */
  canStart(_point, layerGroup) {
    const layer = layerGroup.getActiveLayer();
    return typeof layer !== 'undefined';
  }

  /**
   * @param {DragStep} drag Step; uses `dx` when
   *   {@link DragStep#passesThresholdX}.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onDrag(drag, layerGroup) {
    if (!drag.passesThresholdX()) {
      return;
    }
    const layer = layerGroup.getActiveLayer();
    if (typeof layer === 'undefined') {
      return;
    }
    const op = layer.getOpacity();
    layer.setOpacity(op + (drag.dx / 200));
    layer.draw();
  }

}

/**
 * Single-pointer pan drag: translates using display deltas in plane space.
 * No drag thresholds; runs on every move.
 */
export class PanDragBehavior extends DragBehavior {

  /**
   * @param {object} drag Step with `dx`/`dy` (same shape as DragStep).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onDrag(drag, layerGroup) {
    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to update pan drag behavior');
      return;
    }
    const viewController = viewLayer.getViewController();
    const planeOffset = viewLayer.displayToPlaneScale(
      new Point2D(drag.dx, drag.dy)
    );
    const offset3D = viewController.getOffset3DFromPlaneOffset({
      x: planeOffset.getX(),
      y: planeOffset.getY()
    });
    layerGroup.addTranslation({
      x: offset3D.getX(),
      y: offset3D.getY(),
      z: offset3D.getZ()
    });
    layerGroup.draw();
  }

}
