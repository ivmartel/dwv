/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
/**
 * Namespace for math functions.
 * @class math
 * @namespace dwv
 * @static
 */
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
 * See http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * and this answer http://stackoverflow.com/a/13403498.
 * @method guid
 * @static
 */
dwv.math.guid = function ()
{
    return Math.random().toString(36).substring(2, 15);
};
