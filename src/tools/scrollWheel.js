import {getLayerDetailsFromEvent} from '../gui/layerGroup';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

/**
 * Get a normalised spin speed in the Y direction to try to support
 * trackpads (small and large deltaY) and mouse wheel (large deltaY).
 * Should return 1 or -1 for a single mouse wheel tick.
 *
 * @param {object} event The wheel event.
 * @returns {number} The normalised spin Y.
 */
function getSpinY(event) {
  // (notes of 03/2024)

  // firefox seems to change the value of deltaY
  // if you ask for deltaMode before (?????)

  // deltaY (for a single mouse wheel tick):
  // - chrome: [linux] 120, [mac]: 4
  // - firefox: [linux] 132, [mac]: 16

  // wheelDelta (for a single mouse wheel tick):
  // - chrome: [linux] 120, [mac]: 240
  // - firefox: [linux] 120, [mac]: 48

  // -> using wheelDelta for mouse wheel detection as
  //    it is consistently larger than trackpad scroll

  // wheelDeltaY and deltaY do not go in the same direction,
  // using -deltaY so that they do...

  if (typeof event.wheelDeltaY === 'undefined') {
    //logger.warn('No wheel delta, scroll could be tricky...);
    return -event.deltaY;
  } else {
    const threshold = 45;
    if (event.wheelDeltaY > threshold) {
      return 1;
    } else if (event.wheelDeltaY < -threshold) {
      return -1;
    } else {
      return -event.deltaY / 60;
    }
  }
}

/**
 * Class to sum wheel events and know if that sum
 * corresponds to a 'tick'.
 */
class ScrollSum {
  /**
   * The scroll sum.
   *
   * @type {number}
   */
  #sum = 0;

  /**
   * Get the scroll sum.
   *
   * @returns {number} The scroll sum.
   */
  getSum() {
    return this.#sum;
  }

  /**
   * Add scroll.
   *
   * @param {object} event The wheel event.
   */
  add(event) {
    this.#sum += getSpinY(event);
  }

  /**
   * Clear the scroll sum.
   */
  clear() {
    this.#sum = 0;
  }

  /**
   * Does the accumulated scroll correspond to a 'tick'.
   *
   * @returns {boolean} True if the sum corresponds to a 'tick'.
   */
  isTick() {
    return Math.abs(this.#sum) >= 1;
  }
}

/**
 * Scroll wheel class: provides a wheel event handler
 *   that scroll the corresponding data.
 */
export class ScrollWheel {
  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * Accumulated scroll.
   *
   * @type {ScrollSum}
   */
  #scrollSum = new ScrollSum();

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Handle mouse wheel event.
   *
   * @param {WheelEvent} event The mouse wheel event.
   */
  wheel(event) {
    this.#scrollSum.add(event);
    const up = this.#scrollSum.getSum() >= 0;

    // exit if no tick
    if (!this.#scrollSum.isTick()) {
      return;
    } else {
      this.#scrollSum.clear();
    }

    // prevent default page scroll
    event.preventDefault();

    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewController =
      layerGroup.getActiveViewLayer().getViewController();
    let newPosition;
    if (layerGroup.canScroll()) {
      if (up) {
        newPosition = viewController.getIncrementScrollPosition();
      } else {
        newPosition = viewController.getDecrementScrollPosition();
      }
    } else if (layerGroup.moreThanOne(3)) {
      if (up) {
        newPosition = viewController.getIncrementPosition(3);
      } else {
        newPosition = viewController.getDecrementPosition(3);
      }
    }

    // set all layers if at least one can be set
    if (typeof newPosition !== 'undefined' &&
      layerGroup.isPositionInBounds(newPosition)) {
      viewController.setCurrentPosition(newPosition);
    }
  }

} // ScrollWheel class
