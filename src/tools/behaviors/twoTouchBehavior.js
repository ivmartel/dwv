import {Line} from '../../math/line.js';
import {logger} from '../../utils/logger.js';

/**
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {Point2D} from '../../math/point.js';
 */

import {getActiveOrDrawRefViewLayer} from './utils.js';

/**
 * Two-finger gesture handling for tools that forward into
 * {@link LayerGroupPointer} two-touch paths.
 */
export class TwoTouchBehavior {

  /**
   * Whether two-touch tracking is active (subclasses track gesture state).
   *
   * @returns {boolean} True when a two-finger gesture is in progress.
   */
  isActive() {
    return false;
  }

  /**
   * Clear two-touch session state; default is a no-op.
   */
  reset() {
    // does nothing
  }

  /**
   * First frame with two simultaneous touches (or equivalent pointers).
   *
   * @param {Point2D[]} _points Two touch points.
   */
  onStart(_points) {
    // override in subclass
  }

  /**
   * Two-touch move; return value is used for tap vs gesture disambiguation.
   *
   * @param {Point2D[]} _points Two touch points.
   * @param {LayerGroup} _layerGroup The layer group under the touch.
   * @returns {boolean} True when the gesture counts as movement (for tap).
   */
  onUpdate(_points, _layerGroup) {
    return false;
  }

  /**
   * End two-touch session and reset.
   */
  onEnd() {
    this.reset();
  }

}

/**
 * Two-finger pinch zoom and vertical scroll on the stack (zoom/pan tool).
 * Gesture move state is owned by the layer group pointer.
 */
export class ZoomScrollTwoTouchBehavior extends TwoTouchBehavior {

  /**
   * @type {Line|undefined}
   */
  #pointsLine;

  /**
   * @type {Point2D|undefined}
   */
  #midPoint;

  /**
   * @returns {boolean} True after {@link ZoomScrollTwoTouchBehavior#onStart}.
   * @override
   */
  isActive() {
    return typeof this.#pointsLine !== 'undefined';
  }

  /**
   * Clear pinch/scroll tracking lines and midpoint.
   *
   * @override
   */
  reset() {
    this.#pointsLine = undefined;
    this.#midPoint = undefined;
  }

  /**
   * Begin or reset two-finger tracking.
   *
   * @param {Point2D[]} points Two touch points.
   * @override
   */
  onStart(points) {
    this.#pointsLine = new Line(points[0], points[1]);
    this.#midPoint = this.#pointsLine.getCentroid();
  }

  /**
   * @param {Point2D[]} points Two touch points.
   * @param {LayerGroup} layerGroup The layer group under the touch.
   * @returns {boolean} False when tracking is inactive; true after an update
   *   that counts as gesture movement (for tap detection).
   * @override
   */
  onUpdate(points, layerGroup) {
    if (this.#pointsLine === undefined) {
      return false;
    }

    const newLine = new Line(points[0], points[1]);
    const lineRatio = newLine.getLength() / this.#pointsLine.getLength();

    const positionHelper = layerGroup.getPositionHelper();

    if (lineRatio === 1) {
      const diffY = points[0].getY() - this.#pointsLine.getBegin().getY();
      if (Math.abs(diffY) < 15) {
        return true;
      }
      if (layerGroup.canScroll()) {
        if (diffY > 0) {
          positionHelper.incrementPositionAlongScroll();
        } else {
          positionHelper.decrementPositionAlongScroll();
        }
      }
    } else {
      const zoom = (lineRatio - 1) / 10;
      if (Math.abs(zoom) % 0.1 <= 0.05 &&
        typeof this.#midPoint !== 'undefined') {
        const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
        if (typeof viewLayer === 'undefined') {
          logger.warn('No view layer to do touch zoom behavior');
          return true;
        }
        const viewController = viewLayer.getViewController();
        const planePos = viewLayer.displayToMainPlanePos(this.#midPoint);
        const center = viewController.getPlanePositionFromPlanePoint(planePos);
        layerGroup.addScale(zoom, center);
        layerGroup.draw();
      }
    }
    return true;
  }

  /**
   * End two-touch tracking (touch end or pointer cancel).
   *
   * @override
   */
  onEnd() {
    // isActive returns false after this
    this.#pointsLine = undefined;
    // reset
    this.reset();
  }

}
