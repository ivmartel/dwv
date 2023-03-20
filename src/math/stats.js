/**
 * Get the minimum, maximum, mean and standard deviation
 * of an array of values.
 * Note: could use {@link https://github.com/tmcw/simple-statistics}.
 *
 * @param {Array} array The array of values to extract stats from.
 * @param {Array} flags A list of stat values to calculate.
 * @returns {dwv.math.Stats} A stats object.
 */
export function getStats(array, flags) {
  if (includesFullStatsFlags(flags)) {
    return getFullStats(array);
  } else {
    return getSimpleStats(array);
  }
}

/**
 * Does the input flag list contain a full stat element?
 *
 * @param {Array} flags A list of stat values to calculate.
 * @returns {boolean} True if one of the flags is a full start flag.
 */
function includesFullStatsFlags(flags) {
  return typeof flags !== 'undefined' &&
    flags !== null &&
    flags.includes('median', 'p25', 'p75');
}

/**
 * Get simple stats: minimum, maximum, mean and standard deviation
 * of an array of values.
 *
 * @param {Array} array The array of values to extract stats from.
 * @returns {dwv.math.SimpleStats} A simple stats object.
 */
function getSimpleStats(array) {
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

  return {
    min: min,
    max: max,
    mean: mean,
    stdDev: stdDev
  };
}

/**
 * Get full stats: minimum, maximum, mean, standard deviation, median, 25%
 * and 75% percentile of an array of values.
 *
 * @param {Array} array The array of values to extract stats from.
 * @returns {object} A full stats object.
 */
function getFullStats(array) {
  // get simple stats
  var stats = getSimpleStats(array);

  // sort array... can get slow...
  array.sort(function (a, b) {
    return a - b;
  });

  stats.median = getPercentile(array, 0.5);
  stats.p25 = getPercentile(array, 0.25);
  stats.p75 = getPercentile(array, 0.75);

  return stats;
}

/**
 * Get an arrays' percentile. Uses linear interpolation for percentiles
 * that lie between data points.
 * see https://en.wikipedia.org/wiki/Percentile (second variant interpolation)
 *
 * @param {Array} array The sorted array of values.
 * @param {number} ratio The percentile ratio [0-1].
 * @returns {number} The percentile,
 */
function getPercentile(array, ratio) {
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
}

/**
 * Unique ID generator.
 * See {@link http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript}
 * and this {@link http://stackoverflow.com/a/13403498 answer}.
 *
 * @returns {string} A unique ID.
 */
export function guid() {
  return Math.random().toString(36).substring(2, 15);
}