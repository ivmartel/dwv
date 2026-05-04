import {logger} from '../../utils/logger.js';
import {getActiveOrDrawRefViewLayer} from './utils.js';

/**
 * @import {Point2D} from '../../math/point.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 */

/**
 * Tap (no drag move): subclasses implement {@link TapBehavior#onTap}.
 * Extends {@link EventTarget} so tap-driven tools can emit and forward events.
 */
export class TapBehavior extends EventTarget {

  /**
   * Tap points. Reset to empty array on the tap after
   * the last previous tap.
   *
   * @type {Point2D[]}
   */
  #points = [];

  /**
   * @type {number}
   */
  #numberOfTaps = 1;

  /**
   * Set the number of taps.
   *
   * @param {number} numberOfTaps The number of taps.
   */
  setNumberOfTaps(numberOfTaps) {
    this.#points = [];
    this.#numberOfTaps = numberOfTaps;
  }

  /**
   * @returns {boolean} True when the tap behavior is active.
   */
  isActive() {
    return this.#points.length !== 0;
  }

  /**
   * Behavior reset.
   */
  reset() {
    this.#points = [];
  }

  /**
   * Committed tap points (copy).
   *
   * @returns {Point2D[]} Display-space points accumulated for this tap session.
   */
  getPointList() {
    return this.#points.slice();
  }

  /**
   * @param {Point2D} _point Display position.
   * @param {LayerGroup} _layerGroup The layer group.
   */
  onUpdate(_point, _layerGroup) {
    // default is no-op
  }

  /**
   * @param {Point2D} point Display position under the pointer.
   * @param {LayerGroup} _layerGroup Layer group under the pointer.
   */
  onTap(point, _layerGroup) {
    // add the current point
    this.#points.push(point);
    // call onEnd if the number of taps is at limit
    if (this.#points.length === this.#numberOfTaps) {
      this.onEnd();
    }
  }

  /**
   * End the tap behavior.
   */
  onEnd() {
    this.reset();
  }
}

/**
 * Tap sets the current slice/index from the display position (plane point).
 */
export class PositionSetTapBehavior extends TapBehavior {

  /**
   * @param {Point2D} point Display position.
   * @param {LayerGroup} layerGroup The layer group.
   */
  onTap(point, layerGroup) {
    super.onTap(point, layerGroup);

    const viewLayer = getActiveOrDrawRefViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to set current position');
      return;
    }
    const viewController = viewLayer.getViewController();
    const planePos = viewLayer.displayToPlanePos(point);
    const position = viewController.getPositionFromPlanePoint(planePos);
    viewController.setCurrentPosition(position);
  }

}
