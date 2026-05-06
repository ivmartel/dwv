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
 * @import {Scalar2D} from '../../math/scalar.js';
 */

/**
 * Optional payload for {@link DragBehavior#onStart} (mouse vs touch).
 *
 * @typedef {object} DragPointerStartContext
 * @property {number|undefined} [mouseDownButton] `MouseEvent#button` when the
 *   pointer is mouse-driven; omit or leave undefined for touch.
 */

/**
 * @typedef {object} DragBehaviorOptions
 * @property {Scalar2D} [threshold] Defaults to zero on both axes (invoke
 *   {@link DragBehavior#onDrag} on every move). Display-space move minimum in
 *   pixels per axis (`<= 0` disables that axis for the minimum check).
 */

/**
 * @param {Scalar2D|undefined} threshold Raw threshold.
 * @returns {Scalar2D} Copy with numeric `x` and `y`.
 */
function normalizeThreshold(threshold) {
  return {
    x: typeof threshold?.x === 'number' ? threshold.x : 0,
    y: typeof threshold?.y === 'number' ? threshold.y : 0
  };
}

/**
 * One pointer move while dragging: display-space delta from the previous
 * event as {@link Scalar2D} (`x` = `point1.x - point0.x`,
 * `y` = `point1.y - point0.y`).
 */
export class DragStep {

  /**
   * Display delta from previous position (`x`/`y` in pixels).
   *
   * @type {Scalar2D}
   */
  #delta;

  /**
   * @type {Scalar2D}
   */
  #threshold;

  /**
   * @param {Point2D} point0 Position at the previous move (or down).
   * @param {Point2D} point1 Current pointer position (display space).
   * @param {object} [options] Options.
   * @param {Scalar2D} [options.threshold] Per-axis
   *   thresholds (see {@link DragBehaviorOptions}).
   */
  constructor(point0, point1, {threshold} = {}) {
    this.#delta = {
      x: point1.getX() - point0.getX(),
      y: point1.getY() - point0.getY()
    };
    this.#threshold = normalizeThreshold(threshold);
  }

  /**
   * @returns {Scalar2D} Display delta (`point1 - point0`); mutable — treat as
   *   read-only from outside {@link DragStep}.
   */
  get delta() {
    return this.#delta;
  }

  /**
   * @returns {boolean} True when `threshold.x` is `<= 0` (no minimum on X), or
   *   when `|delta.x| >= threshold.x`.
   */
  passesThresholdX() {
    const tx = this.#threshold.x;
    if (tx <= 0) {
      return true;
    }
    return Math.abs(this.#delta.x) >= tx;
  }

  /**
   * @returns {boolean} True when `threshold.y` is `<= 0` (no minimum on Y), or
   *   when `|delta.y| >= threshold.y`.
   */
  passesThresholdY() {
    const ty = this.#threshold.y;
    if (ty <= 0) {
      return true;
    }
    return Math.abs(this.#delta.y) >= ty;
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
export class DragBehavior extends EventTarget {

  /**
   * Start point.
   *
   * @type {Point2D|null}
   */
  #startPoint = null;

  /**
   * Pointer anchor for the next step (set in {@link onStart}, advanced in
   * {@link onUpdate} before {@link onDrag}, cleared in {@link onEnd}).
   *
   * @type {Point2D|null}
   */
  #prevPoint = null;

  /**
   * @type {Scalar2D}
   */
  #dragThreshold;

  /**
   * @param {DragBehaviorOptions} [options] Constructor options.
   */
  constructor({threshold} = {}) {
    super();
    this.setDragThreshold(threshold);
  }

  /**
   * @returns {Point2D|null} The start point.
   */
  get startPoint() {
    return this.#startPoint;
  }

  /**
   * @returns {Point2D|null} Last accepted pointer for the next step. When
   *   {@link DragBehavior#onDrag} runs, already updated to this move's
   *   endpoint (the `point` passed to {@link DragBehavior#onUpdate}).
   */
  get prevPoint() {
    return this.#prevPoint;
  }

  /**
   * @param {Scalar2D} threshold New per-axis minimum
   *   move in display pixels before {@link DragBehavior#onDrag} runs.
   */
  setDragThreshold(threshold) {
    this.#dragThreshold = normalizeThreshold(threshold);
  }

  /**
   * @returns {boolean} True after {@link onStart} until {@link onEnd}.
   */
  isActive() {
    return this.#prevPoint !== null;
  }

  /**
   * Whether a drag may start at the given pointer (tool-specific gate).
   *
   * @param {Point2D} _point The pointer position.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   * @returns {boolean} Whether a drag may begin.
   */
  canStart(_point, _layerGroup) {
    return true;
  }

  /**
   * Clear drag anchors ({@link DragBehavior#startPoint},
   * {@link DragBehavior#prevPoint}).
   */
  reset() {
    this.#startPoint = null;
    this.#prevPoint = null;
  }

  /**
   * Begin tracking: records start and previous pointer for
   * {@link DragBehavior#onUpdate}.
   *
   * @param {Point2D} point The pointer position at drag start.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   * @param {DragPointerStartContext|undefined} [_pointerStart] Mouse/touch
   *   context from {@link LayerGroupPointer}.
   */
  onStart(point, _layerGroup, _pointerStart) {
    this.#startPoint = point;
    this.#prevPoint = point;
  }

  /**
   * Advance the drag with a new pointer position. Builds a {@link DragStep}
   * with `point0` = previous position, `point1` = current, and this behavior's
   * `threshold`; when {@link DragStep#passesThreshold} is true, assigns the
   * current point as {@link DragBehavior#prevPoint}, then calls {@link onDrag}.
   *
   * @param {Point2D} point Current pointer position in display space.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onUpdate(point, layerGroup) {
    const drag = new DragStep(this.#prevPoint, point, {
      threshold: this.#dragThreshold
    });
    if (drag.passesThreshold()) {
      this.#prevPoint = point;
      this.onDrag(drag, layerGroup);
    }
  }

  /**
   * Qualifying move step after threshold checks; override in subclasses.
   *
   * @param {DragStep} _drag Step with {@link DragStep#delta}.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   */
  onDrag(_drag, _layerGroup) {
    // override in subclass
  }

  /**
   * End the drag and reset anchors ({@link DragBehavior#reset}).
   */
  onEnd() {
    this.reset();
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
   * @override
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
   * @param {DragStep} drag Delta from previous event ({@link DragStep#delta}).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @override
   */
  onDrag(drag, layerGroup) {
    const viewLayer = getActiveOrFirstMonochromeViewLayer(
      layerGroup, this.#activeViewLayerOnly);
    if (typeof viewLayer === 'undefined') {
      return;
    }
    const viewController = viewLayer.getViewController();

    const diffX = drag.delta.x;
    const diffY = -drag.delta.y;
    const range = viewController.getImageRescaledDataRange();
    const pixelToIntensity = (range.max - range.min) * 0.001;

    const center = viewController.getWindowLevel().center;
    const width = viewController.getWindowLevel().width;
    const windowCenter = center + (diffY * pixelToIntensity);
    const windowWidth = width + (diffX * pixelToIntensity);

    const windowLevel = new WindowLevelValues(windowCenter, windowWidth);
    viewController.setWindowLevel(windowLevel);
  }

}

/**
 * Slice scroll drag updates. Start: {@link ScrollDragBehavior.canStart}.
 * Uses a fixed 15×15 display-pixel {@link DragBehaviorOptions} drag step
 * threshold; each {@link onDrag} step is one such qualifying move — no
 * separate step anchor.
 */
export class ScrollDragBehavior extends DragBehavior {

  /**
   * Uses a 15×15 display-pixel move threshold on both axes.
   */
  constructor() {
    super({
      threshold: {x: 15, y: 15}
    });
  }

  /**
   * @param {Point2D} _point The pointer position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} True if scrolling is possible.
   * @override
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
   * @override
   */
  onDrag(drag, layerGroup) {
    const positionHelper = layerGroup.getPositionHelper();

    if (drag.passesThresholdY() && layerGroup.canScroll()) {
      if (drag.delta.y > 0) {
        positionHelper.decrementPositionAlongScroll();
      } else {
        positionHelper.incrementPositionAlongScroll();
      }
    } else if (drag.passesThresholdX() && layerGroup.moreThanOne(3)) {
      if (drag.delta.x > 0) {
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

  /**
   * Uses a 15×15 display-pixel move threshold on both axes.
   */
  constructor() {
    super({
      threshold: {x: 15, y: 15}
    });
  }

  /**
   * @param {Point2D} _point The pointer position (unused).
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @returns {boolean} True when an active layer exists.
   * @override
   */
  canStart(_point, layerGroup) {
    const layer = layerGroup.getActiveLayer();
    return typeof layer !== 'undefined';
  }

  /**
   * @param {DragStep} drag Step; uses horizontal delta ({@link DragStep#delta}
   *   `x`) when {@link DragStep#passesThresholdX}.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @override
   */
  onDrag(drag, layerGroup) {
    if (!drag.passesThresholdX()) {
      return;
    }
    const layer = layerGroup.getActiveLayer();
    if (typeof layer === 'undefined') {
      return;
    }
    const opacity = layer.getOpacity();
    layer.setOpacity(opacity + (drag.delta.x / 200));
    layer.draw();
  }

}

/**
 * Single-pointer pan drag: translates using display deltas in plane space.
 * No drag thresholds; runs on every move.
 */
export class PanDragBehavior extends DragBehavior {

  /**
   * @param {DragStep} drag Step with {@link DragStep#delta}.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   * @override
   */
  onDrag(drag, layerGroup) {
    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to update pan drag behavior');
      return;
    }
    const viewController = viewLayer.getViewController();
    const planeOffset = viewLayer.displayToPlaneScale(
      new Point2D(drag.delta.x, drag.delta.y)
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
