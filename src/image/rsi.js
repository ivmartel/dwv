/**
 * Rescale Slope and Intercept.
 */
export class RescaleSlopeAndIntercept {

  /**
   * The slope.
   *
   * @type {number}
   */
  #slope;

  /**
   * The intercept.
   *
   * @type {number}
   */
  #intercept;

  /**
   * @param {number} slope The slope of the RSI.
   * @param {number} intercept The intercept of the RSI.
   */
  constructor(slope, intercept) {
    /*// Check the rescale slope.
      if(typeof(slope) === 'undefined') {
          slope = 1;
      }
      // Check the rescale intercept.
      if(typeof(intercept) === 'undefined') {
          intercept = 0;
      }*/
    this.#slope = slope;
    this.#intercept = intercept;
  }

  /**
   * Get the slope of the RSI.
   *
   * @returns {number} The slope of the RSI.
   */
  getSlope() {
    return this.#slope;
  }

  /**
   * Get the intercept of the RSI.
   *
   * @returns {number} The intercept of the RSI.
   */
  getIntercept() {
    return this.#intercept;
  }

  /**
   * Apply the RSI on an input value.
   *
   * @param {number} value The input value.
   * @returns {number} The value to rescale.
   */
  apply(value) {
    return value * this.#slope + this.#intercept;
  }

  /**
   * Check for RSI equality.
   *
   * @param {RescaleSlopeAndIntercept} rhs The other RSI to compare to.
   * @returns {boolean} True if both RSI are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      typeof rhs !== 'undefined' &&
      this.getSlope() === rhs.getSlope() &&
      this.getIntercept() === rhs.getIntercept();
  }

  /**
   * Is this RSI an ID RSI.
   *
   * @returns {boolean} True if the RSI has a slope of 1 and no intercept.
   */
  isID() {
    return (this.getSlope() === 1 && this.getIntercept() === 0);
  }

} // class RescaleSlopeAndIntercept
