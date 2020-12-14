// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Basic statistics
 *
 * @class
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @param {number} mean The mean value.
 * @param {number} stdDev The standard deviation.
 */
dwv.math.Stats = function (min, max, mean, stdDev) {
  /**
   * Get the minimum value.
   *
   * @returns {number} The minimum value.
   */
  this.getMin = function () {
    return min;
  };
  /**
   * Get the maximum value.
   *
   * @returns {number} The maximum value.
   */
  this.getMax = function () {
    return max;
  };
  /**
   * Get the mean value.
   *
   * @returns {number} The mean value.
   */
  this.getMean = function () {
    return mean;
  };
  /**
   * Get the standard deviation.
   *
   * @returns {number} The standard deviation.
   */
  this.getStdDev = function () {
    return stdDev;
  };
};

/**
 * Check for Stats equality.
 *
 * @param {object} rhs The other Stats object to compare to.
 * @returns {boolean} True if both Stats object are equal.
 */
dwv.math.Stats.prototype.equals = function (rhs) {
  return rhs !== null &&
        this.getMin() === rhs.getMin() &&
        this.getMax() === rhs.getMax() &&
        this.getMean() === rhs.getMean() &&
        this.getStdDev() === rhs.getStdDev();
};

/**
 * Get the stats as an object
 *
 * @returns {object} An object representation of the stats.
 */
dwv.math.Stats.prototype.asObject = function () {
  return {
    min: this.getMin(),
    max: this.getMax(),
    mean: this.getMean(),
    stdDev: this.getStdDev()
  };
};

/**
 * Get the minimum, maximum, mean and standard deviation
 * of an array of values.
 * Note: could use {@link https://github.com/tmcw/simple-statistics}.
 *
 * @param {Array} array The array of values to extract stats from.
 * @returns {dwv.math.Stats} A stats object.
 */
dwv.math.getStats = function (array) {
  var min = array[0];
  var max = min;
  var mean = 0;
  var sum = 0;
  var sumSqr = 0;
  var stdDev = 0;
  var variance = 0;

  var val = 0;
  for (var i = 0; i < array.length; ++i) {
    val = array[i];
    if (val < min) {
      min = val;
    } else if (val > max) {
      max = val;
    }
    sum += val;
    sumSqr += val * val;
  }

  mean = sum / array.length;
  // see http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
  variance = sumSqr / array.length - mean * mean;
  stdDev = Math.sqrt(variance);

  return new dwv.math.Stats(min, max, mean, stdDev);
};

/**
 * Unique ID generator.
 * See {@link http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript}
 * and this {@link http://stackoverflow.com/a/13403498 answer}.
 *
 * @returns {string} A unique ID.
 */
dwv.math.guid = function () {
  return Math.random().toString(36).substring(2, 15);
};
