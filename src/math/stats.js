/**
 * Statistics storage class.
 * 'simple' statistics do not include median, p25 nor p75.
 */
export class Statistics {
  /**
   * Minimum.
   *
   * @type {number}
   */
  min;
  /**
   * Maximum.
   *
   * @type {number}
   */
  max;
  /**
   * Mean.
   *
   * @type {number}
   */
  mean;
  /**
   * Standard deviation.
   *
   * @type {number}
   */
  stdDev;
  /**
   * Median.
   *
   * @type {number|undefined}
   */
  median;
  /**
   * 25th percentile.
   *
   * @type {number|undefined}
   */
  p25;
  /**
   * 75th percentile.
   *
   * @type {number|undefined}
   */
  p75;

  /**
   * @param {number} min The minimum.
   * @param {number} max The maxnimum.
   * @param {number} mean The mean.
   * @param {number} stdDev The standard deviation.
   */
  constructor(min, max, mean, stdDev) {
    this.min = min;
    this.max = max;
    this.mean = mean;
    this.stdDev = stdDev;
  }
}

/**
 * Get statistics on an input array of number.
 * Note: could use {@link https://github.com/tmcw/simple-statistics}.
 *
 * @param {number[]} values The array of values to extract stats from.
 * @param {string[]} flags A list of stat value names to calculate.
 * @returns {Statistics} A statistics object.
 */
export function getStats(values, flags) {
  if (includesFullStatsFlags(flags)) {
    return getFullStats(values);
  } else {
    return getBasicStats(values);
  }
}

/**
 * Does the input flag list contain a full stat element?
 *
 * @param {string[]} flags A list of stat values to calculate.
 * @returns {boolean} True if one of the flags is a full stat flag.
 */
function includesFullStatsFlags(flags) {
  return typeof flags !== 'undefined' &&
    flags !== null &&
    (flags.includes('median') ||
    flags.includes('p25') ||
    flags.includes('p75'));
}

/**
 * Get simple stats: minimum, maximum, mean and standard deviation
 * of an array of values.
 *
 * @param {number[]} values The array of values to extract stats from.
 * @returns {Statistics} Simple statistics (no median, p25 nor p75).
 */
export function getBasicStats(values) {
  let min = values[0];
  let max = min;
  let sum = 0;
  let sumSqr = 0;
  let val = 0;
  const length = values.length;
  for (let i = 0; i < length; ++i) {
    val = values[i];
    if (val < min) {
      min = val;
    } else if (val > max) {
      max = val;
    }
    sum += val;
    sumSqr += val * val;
  }

  const mean = sum / length;
  // see http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
  let variance = sumSqr / length - mean * mean;
  if (variance < 0) {
    variance = 0;
  }
  const stdDev = Math.sqrt(variance);

  return new Statistics(min, max, mean, stdDev);
}

/**
 * Get full stats: minimum, maximum, mean, standard deviation, median, 25%
 * and 75% percentile of an array of values.
 *
 * @param {number[]} values The array of values to extract stats from.
 * @returns {Statistics} Complete statistics (includes median, p25 and p75).
 */
function getFullStats(values) {
  // get basic stats
  const stats = getBasicStats(values);

  // sort array... can get slow...
  values.sort(function (a, b) {
    return a - b;
  });

  stats.median = getPercentile(values, 0.5);
  stats.p25 = getPercentile(values, 0.25);
  stats.p75 = getPercentile(values, 0.75);

  return stats;
}

/**
 * Get an arrays' percentile. Uses linear interpolation for percentiles
 *   that lie between data points.
 * See: {@link https://en.wikipedia.org/wiki/Percentile} (second variant interpolation).
 *
 * @param {number[]} values The sorted array of values.
 * @param {number} ratio The percentile ratio [0-1].
 * @returns {number} The percentile.
 */
function getPercentile(values, ratio) {
  // check input
  if (values.length === 0) {
    throw new Error('Empty array provided for percentile calculation.');
  }
  if (ratio < 0 || ratio > 1) {
    throw new Error(
      'Invalid ratio provided for percentile calculation: ' + ratio);
  }
  // return min for ratio=0 amd max for ratio=1
  if (ratio === 0) {
    return values[0];
  } else if (ratio === 1) {
    return values[values.length - 1];
  }
  // general case: interpolate between indices if needed
  const i = (values.length - 1) * ratio;
  const i0 = Math.floor(i);
  const v0 = values[i0];
  const v1 = values[i0 + 1];
  return v0 + (v1 - v0) * (i - i0);
}

/**
 * Unique ID generator.
 *
 * See {@link http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript}
 *   and this {@link http://stackoverflow.com/a/13403498 answer}.
 *
 * @returns {string} A unique ID.
 */
export function guid() {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Number range.
 */
export class NumberRange {
  /**
   * @type {number}
   */
  min;
  /**
   * @type {number}
   */
  max;
  /**
   * @param {number} min The minimum.
   * @param {number} max The maximum.
   */
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }
}
