// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Rescale Slope and Intercept
 *
 * @class
 * @param {number} slope The slope of the RSI.
 * @param {number} intercept The intercept of the RSI.
 */
dwv.image.RescaleSlopeAndIntercept = function (slope, intercept) {
  /*// Check the rescale slope.
    if(typeof(slope) === 'undefined') {
        slope = 1;
    }
    // Check the rescale intercept.
    if(typeof(intercept) === 'undefined') {
        intercept = 0;
    }*/

  /**
   * Get the slope of the RSI.
   *
   * @returns {number} The slope of the RSI.
   */
  this.getSlope = function () {
    return slope;
  };

  /**
   * Get the intercept of the RSI.
   *
   * @returns {number} The intercept of the RSI.
   */
  this.getIntercept = function () {
    return intercept;
  };

  /**
   * Apply the RSI on an input value.
   *
   * @param {number} value The input value.
   * @returns {number} The value to rescale.
   */
  this.apply = function (value) {
    return value * slope + intercept;
  };
};

/**
 * Check for RSI equality.
 *
 * @param {object} rhs The other RSI to compare to.
 * @returns {boolean} True if both RSI are equal.
 */
dwv.image.RescaleSlopeAndIntercept.prototype.equals = function (rhs) {
  return rhs !== null &&
        this.getSlope() === rhs.getSlope() &&
        this.getIntercept() === rhs.getIntercept();
};

/**
 * Get a string representation of the RSI.
 *
 * @returns {string} The RSI as a string.
 */
dwv.image.RescaleSlopeAndIntercept.prototype.toString = function () {
  return (this.getSlope() + ', ' + this.getIntercept());
};

/**
 * Is this RSI an ID RSI.
 *
 * @returns {boolean} True if the RSI has a slope of 1 and no intercept.
 */
dwv.image.RescaleSlopeAndIntercept.prototype.isID = function () {
  return (this.getSlope() === 1 && this.getIntercept() === 0);
};
