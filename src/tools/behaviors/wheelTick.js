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
  }
  const threshold = 45;
  if (event.wheelDeltaY > threshold) {
    return 1;
  } else if (event.wheelDeltaY < -threshold) {
    return -1;
  }
  return -event.deltaY / 60;
}

/**
 * Accumulates wheel spin and reports when it crosses a full tick threshold
 * (used with {@link WheelBehavior#onWheelTick}).
 */
export class WheelTick {

  /**
   * @type {number}
   */
  #sum = 0;

  /**
   * Add normalized spin from a wheel event to the accumulator.
   *
   * @param {WheelEvent} event The wheel event.
   */
  add(event) {
    this.#sum += getSpinY(event);
  }

  /**
   * @returns {number} Accumulated spin since last {@link WheelTick#clear}
   *   (sign = direction).
   */
  getSum() {
    return this.#sum;
  }

  /**
   * @returns {boolean} True when accumulated spin crosses a discrete tick
   *   threshold.
   */
  isTick() {
    return Math.abs(this.#sum) >= 1;
  }

  /**
   * Reset accumulated spin (typically after handling a tick).
   */
  clear() {
    this.#sum = 0;
  }

}
