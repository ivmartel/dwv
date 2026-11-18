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
   * Standard deviation (population: divided by the number of values).
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
   * @param {number} max The maximum.
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
 * @param {string[]} [flags] A list of stat value names to calculate.
 * @returns {Statistics|undefined} A statistics object, undefined if
 *   the input array is empty.
 */
export function getStats(values, flags) {
  if (includesFullStatsFlags(flags)) {
    return getFullStats(values);
  }
  return getBasicStats(values);
}

/**
 * Does the input flag list contain a full stat element?
 *
 * @param {string[]} [flags] A list of stat values to calculate.
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
 * @returns {Statistics|undefined} Simple statistics (no median, p25
 *   nor p75), undefined if the input array is empty.
 */
export function getBasicStats(values) {
  const length = values.length;
  if (length === 0) {
    return undefined;
  }

  let min = values[0];
  let max = min;
  let sum = 0;
  for (const val of values) {
    if (val < min) {
      min = val;
    } else if (val > max) {
      max = val;
    }
    sum += val;
  }
  const mean = sum / length;

  // two pass algorithm to avoid the precision loss of
  // 'sum of squares minus squared mean' with large values, see
  // https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
  let sumSqrDiff = 0;
  for (const val of values) {
    const diff = val - mean;
    sumSqrDiff += diff * diff;
  }
  const stdDev = Math.sqrt(sumSqrDiff / length);

  return new Statistics(min, max, mean, stdDev);
}

/**
 * Get full stats: minimum, maximum, mean, standard deviation, median, 25%
 * and 75% percentile of an array of values.
 *
 * @param {number[]} values The array of values to extract stats from,
 *   left unchanged.
 * @returns {Statistics|undefined} Complete statistics (includes median,
 *   p25 and p75), undefined if the input array is empty.
 */
function getFullStats(values) {
  // get basic stats
  const stats = getBasicStats(values);
  if (typeof stats === 'undefined') {
    return undefined;
  }

  // sort a copy to not modify the input... can get slow...
  const sorted = values.slice().sort(function (a, b) {
    return a - b;
  });

  stats.median = getPercentile(sorted, 0.5);
  stats.p25 = getPercentile(sorted, 0.25);
  stats.p75 = getPercentile(sorted, 0.75);

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
      `Invalid ratio provided for percentile calculation: ${ratio}`);
  }
  // interpolate between indices if needed
  const i = (values.length - 1) * ratio;
  const i0 = Math.floor(i);
  const v0 = values[i0];
  // no interpolation for an exact index (includes ratio 0 and 1,
  // and single value arrays)
  if (i === i0) {
    return v0;
  }
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
