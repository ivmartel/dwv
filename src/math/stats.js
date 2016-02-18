/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Get the minimum, maximum, mean and standard deviation
 * of an array of values.
 * Note: could use https://github.com/tmcw/simple-statistics
 * @method getStats
 * @static
 */
dwv.math.getStats = function (array)
{
    var min = array[0];
    var max = min;
    var mean = 0;
    var sum = 0;
    var sumSqr = 0;
    var stdDev = 0;
    var variance = 0;

    var val = 0;
    for ( var i = 0; i < array.length; ++i ) {
        val = array[i];
        if ( val < min ) {
            min = val;
        }
        else if ( val > max ) {
            max = val;
        }
        sum += val;
        sumSqr += val * val;
    }

    mean = sum / array.length;
    // see http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
    variance = sumSqr / array.length - mean * mean;
    stdDev = Math.sqrt(variance);

    return { 'min': min, 'max': max, 'mean': mean, 'stdDev': stdDev };
};

/**
 * Unique ID generator.
 * @class IdGenerator
 * @namespace dwv.math
 * @constructor
 */
dwv.math.IdGenerator = function ()
{
    /**
     * Root for IDs.
     * @property root
     * @private
     * @type Number
     */
    var root = Math.floor( Math.random() * 26 ) + Date.now();
    /**
     * Get a unique id.
     * @method get
     * @return {Number} The unique Id.
     */
    this.get = function () {
        return root++;
    };
};
