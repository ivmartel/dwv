// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Rescale Slope and Intercept
 * @constructor
 * @param {Number} slope The slope of the RSI.
 * @param {Number} intercept The intercept of the RSI.
 */
dwv.image.RescaleSlopeAndIntercept = function (slope, intercept)
{
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
     * @return {Number} The slope of the RSI.
     */
    this.getSlope = function () {
        return slope;
    };

    /**
     * Get the intercept of the RSI.
     * @return {Number} The intercept of the RSI.
     */
    this.getIntercept = function () {
        return intercept;
    };

    /**
     * Apply the RSI on an input value.
     * @return {Number} The value to rescale.
     */
    this.apply = function (value) {
        return value * slope + intercept;
    };
};

/**
 * Check for RSI equality.
 * @param {Object} rhs The other RSI to compare to.
 * @return {Boolean} True if both RSI are equal.
 */
dwv.image.RescaleSlopeAndIntercept.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getSlope() === rhs.getSlope() &&
        this.getIntercept() === rhs.getIntercept();
};

/**
 * Get a string representation of the RSI.
 * @return {String} The RSI as a string.
 */
dwv.image.RescaleSlopeAndIntercept.prototype.toString = function () {
    return (this.getSlope() + ", " + this.getIntercept());
};

/**
 * Is this RSI an ID RSI.
 * @return {Boolean} True if the RSI has a slope of 1 and no intercept.
 */
dwv.image.RescaleSlopeAndIntercept.prototype.isID = function () {
    return (this.getSlope() === 1 && this.getIntercept() === 0);
};
