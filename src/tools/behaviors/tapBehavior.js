import {logger} from '../../utils/logger.js';
import {getActiveOrDrawRefViewLayer} from './utils.js';

/**
 * @import {Point2D} from '../../math/point.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 */

/**
 * Tap (no drag move): subclasses implement {@link TapBehavior#onTap}.
 */
export class TapBehavior {

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
   * Mutable buffer cleared in {@link cancel}. Base class stores display taps;
   * {@link DrawTapBehavior} stores display placement points here too.
   *
   * @returns {Point2D[]} Same array reference until {@link cancel}.
   */
  getPointList() {
    return this.#points;
  }

  /**
   * Set the number of taps.
   *
   * @param {number} numberOfTaps The number of taps.
   */
  setNumberOfTaps(numberOfTaps) {
    this.cancel();
    this.#numberOfTaps = numberOfTaps;
  }

  /**
   * @returns {boolean} True when the tap behavior is active.
   */
  isActive() {
    const tapCount = this.#points.length;
    return tapCount !== 0 && tapCount <= this.#numberOfTaps;
  }

  /**
   * @param {Point2D} _point Display position.
   * @param {LayerGroup} _layerGroup The layer group.
   */
  onUpdate(_point, _layerGroup) {
    // default is no-op
  }

  /**
   * Cancel the tap behavior.
   */
  cancel() {
    this.#points = [];
  }

  /**
   * @param {Point2D} point Display position under the pointer.
   * @param {LayerGroup} _layerGroup Layer group under the pointer.
   */
  onTap(point, _layerGroup) {
    // reset points if the number of taps is
    // at limit or exceeded
    const tapCount = this.#points.length;
    if (tapCount >= this.#numberOfTaps) {
      this.#points = [];
    }
    // add the current point
    this.#points.push(point);
    // override in subclass
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
