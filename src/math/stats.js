// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Simple statistics
 *
 * @class
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @param {number} mean The mean value.
 * @param {number} stdDev The standard deviation.
 */
dwv.math.SimpleStats = function (min, max, mean, stdDev) {
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
dwv.math.SimpleStats.prototype.equals = function (rhs) {
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
dwv.math.SimpleStats.prototype.asObject = function () {
  return {
    min: this.getMin(),
    max: this.getMax(),
    mean: this.getMean(),
    stdDev: this.getStdDev()
  };
};

dwv.math.FullStats = function (min, max, mean, stdDev, median, p25, p75) {
  dwv.math.SimpleStats.call(this, min, max, mean, stdDev);
  /**
   * Get the median value.
   *
   * @returns {number} The median value.
   */
  this.getMedian = function () {
    return median;
  };
  /**
   * Get the 25th persentile value.
   *
   * @returns {number} The 25th persentile value.
   */
  this.getP25 = function () {
    return p25;
  };
  /**
   * Get the 75th persentile value.
   *
   * @returns {number} The 75th persentile value.
   */
  this.getP75 = function () {
    return p75;
  };
};

// inherit from simple stats
dwv.math.FullStats.prototype = Object.create(dwv.math.SimpleStats.prototype);
Object.defineProperty(dwv.math.FullStats.prototype, 'constructor', {
  value: dwv.math.FullStats,
  enumerable: false, // so that it does not appear in 'for in' loop
  writable: true
});

/**
 * Get the minimum, maximum, mean and standard deviation
 * of an array of values.
 * Note: could use {@link https://github.com/tmcw/simple-statistics}.
 *
 * @param {Array} array The array of values to extract stats from.
 * @param {Array} flags A list of stat values to calculate.
 * @returns {dwv.math.Stats} A stats object.
 */
dwv.math.getStats = function (array, flags) {
  if (dwv.math.includesFullStatsFlags(flags)) {
    return dwv.math.getFullStats(array);
  } else {
    return dwv.math.getSimpleStats(array);
  }
};

/**
 * Does the input flag list contain a full stat element?
 *
 * @param {Array} flags A list of stat values to calculate.
 * @returns {boolean} True if one of the flags is a full start flag.
 */
dwv.math.includesFullStatsFlags = function (flags) {
  return typeof flags !== 'undefined' &&
    flags !== null &&
    flags.includes('median', 'p25', 'p75');
};

/**
 * Get simple stats: minimum, maximum, mean and standard deviation
 * of an array of values.
 *
 * @param {Array} array The array of values to extract stats from.
 * @returns {dwv.math.SimpleStats} A simple stats object.
 */
dwv.math.getSimpleStats = function (array) {
  var min = array[0];
  var max = min;
  var sum = 0;
  var sumSqr = 0;
  var val = 0;
  var length = array.length;
  for (var i = 0; i < length; ++i) {
    val = array[i];
    if (val < min) {
      min = val;
    } else if (val > max) {
      max = val;
    }
    sum += val;
    sumSqr += val * val;
  }

  var mean = sum / length;
  // see http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
  var variance = sumSqr / length - mean * mean;
  var stdDev = Math.sqrt(variance);

  return new dwv.math.SimpleStats(min, max, mean, stdDev);
};

/**
 * Get full stats: minimum, maximum, mean, standard deviation, median, 25%
 * and 75% percentile of an array of values.
 *
 * @param {Array} array The array of values to extract stats from.
 * @returns {dwv.math.FullStats} A full stats object.
 */
dwv.math.getFullStats = function (array) {
  // get simple stats
  var simpleStats = dwv.math.getSimpleStats(array);

  // sort array... can get slow...
  array.sort(function (a, b) {
    return a - b;
  });

  var median = dwv.math.getPercentile(array, 0.5);
  var p25 = dwv.math.getPercentile(array, 0.25);
  var p75 = dwv.math.getPercentile(array, 0.75);

  return new dwv.math.FullStats(
    simpleStats.getMin(),
    simpleStats.getMax(),
    simpleStats.getMean(),
    simpleStats.getStdDev(),
    median,
    p25,
    p75
  );
};

/**
 * Get an arrays' percentile. Uses linear interpolation for percentiles
 * that lie between data points.
 * see https://en.wikipedia.org/wiki/Percentile (second variant interpolation)
 *
 * @param {Array} array The sorted array of values.
 * @param {number} ratio The percentile ratio [0-1].
 * @returns {number} The percentile,
 */
dwv.math.getPercentile = function (array, ratio) {
  // check input
  if (array.length === 0) {
    throw new Error('Empty array provided for percentile calculation.');
  }
  if (ratio < 0 || ratio > 1) {
    throw new Error(
      'Invalid ratio provided for percentile calculation: ' + ratio);
  }
  // return min for ratio=0 amd max for ratio=1
  if (ratio === 0) {
    return array[0];
  } else if (ratio === 1) {
    return array[array.length - 1];
  }
  // general case: interpolate between indices if needed
  var i = (array.length - 1) * ratio;
  var i0 = Math.floor(i);
  var v0 = array[i0];
  var v1 = array[i0 + 1];
  return v0 + (v1 - v0) * (i - i0);
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
