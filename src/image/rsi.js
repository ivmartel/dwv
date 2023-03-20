/**
 * Rescale Slope and Intercept
 *
 * @class
 * @param {number} slope The slope of the RSI.
 * @param {number} intercept The intercept of the RSI.
 */
export class RescaleSlopeAndIntercept {

  #slope;
  #intercept;

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
   * @param {object} rhs The other RSI to compare to.
   * @returns {boolean} True if both RSI are equal.
   */
  equals(rhs) {
    return rhs !== null &&
          this.getSlope() === rhs.getSlope() &&
          this.getIntercept() === rhs.getIntercept();
  }

  /**
   * Get a string representation of the RSI.
   *
   * @returns {string} The RSI as a string.
   */
  toString() {
    return (this.getSlope() + ', ' + this.getIntercept());
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
