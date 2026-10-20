import {Statistics} from './stats.js';

/**
 * @import {NumberRange} from './number.js';
 */

/**
 * Histogram entry.
 *
 * @typedef {object} HistogramEntry
 * @property {number} value The value.
 * @property {number} count The number of occurrences.
 */

/**
 * Histogram of values: number of occurrences per distinct value.
 */
export class Histogram {

  /**
   * Value to count map.
   *
   * @type {Map<number, number>}
   */
  #counts = new Map();

  /**
   * Add occurrences of a value.
   *
   * @param {number} value The value.
   * @param {number} [count] The number of occurrences, defaults to 1.
   */
  add(value, count = 1) {
    this.#counts.set(value, (this.#counts.get(value) ?? 0) + count);
  }

  /**
   * Get the total number of counted values.
   *
   * @returns {number} The total count.
   */
  getTotal() {
    let total = 0;
    for (const count of this.#counts.values()) {
      total += count;
    }
    return total;
  }

  /**
   * Get the histogram entries sorted by ascending value.
   *
   * @returns {HistogramEntry[]} The entries.
   */
  getEntries() {
    return Array.from(this.#counts, ([value, count]) => ({value, count}))
      .sort((a, b) => a.value - b.value);
  }

  /**
   * Get the value range.
   *
   * @returns {NumberRange|undefined} The range, undefined if empty.
   */
  getRange() {
    let min;
    let max;
    for (const value of this.#counts.keys()) {
      if (typeof min === 'undefined' || value < min) {
        min = value;
      }
      if (typeof max === 'undefined' || value > max) {
        max = value;
      }
    }
    if (typeof min === 'undefined') {
      return undefined;
    }
    return {min, max};
  }

  /**
   * Get the number of values in [min, max).
   *
   * @param {number} [min] Inclusive lower bound, unbounded if undefined.
   * @param {number} [max] Exclusive upper bound, unbounded if undefined.
   * @returns {number} The count.
   */
  getCountInRange(min, max) {
    let sum = 0;
    for (const [value, count] of this.#counts) {
      if ((typeof min === 'undefined' || value >= min) &&
        (typeof max === 'undefined' || value < max)) {
        sum += count;
      }
    }
    return sum;
  }

  /**
   * Get the percentage of counts that fall in each interval defined by
   * interior thresholds.
   *
   * For thresholds `[1, 5]`, the intervals are `[min, 1)`, `[1, 5)` and
   * `[5, max]`, where `min` / `max` are the histogram range.
   *
   * @param {number[]} thresholds Interior cut points in ascending order.
   * @returns {number[]} The percentages in [0, 100], one per interval
   *   (`thresholds.length + 1` entries), all 0 for an empty histogram.
   */
  getIntervalPercentages(thresholds) {
    const total = this.getTotal();
    // open first and last intervals
    const bounds = [undefined, ...thresholds, undefined];
    const percentages = [];
    for (let i = 0; i < bounds.length - 1; ++i) {
      const count = this.getCountInRange(bounds[i], bounds[i + 1]);
      percentages.push(total === 0 ? 0 : (count * 100) / total);
    }
    return percentages;
  }

  /**
   * Get the statistics of the values: minimum, maximum, mean,
   * standard deviation, median, 25th and 75th percentiles.
   * Gives the same results as `getStats` (`math/stats.js`) on the full
   * list of values.
   *
   * @returns {Statistics|undefined} The statistics, undefined if empty.
   */
  getStats() {
    const entries = this.getEntries();
    if (entries.length === 0) {
      return undefined;
    }

    let total = 0;
    let sum = 0;
    for (const entry of entries) {
      total += entry.count;
      sum += entry.value * entry.count;
    }
    const mean = sum / total;
    // two pass algorithm like `getBasicStats` (`math/stats.js`), see
    // https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
    let sumSqrDiff = 0;
    for (const entry of entries) {
      const diff = entry.value - mean;
      sumSqrDiff += diff * diff * entry.count;
    }
    const variance = sumSqrDiff / total;

    const stats = new Statistics(
      entries[0].value,
      entries[entries.length - 1].value,
      mean,
      Math.sqrt(variance)
    );
    stats.median = getEntriesPercentile(entries, total, 0.5);
    stats.p25 = getEntriesPercentile(entries, total, 0.25);
    stats.p75 = getEntriesPercentile(entries, total, 0.75);
    return stats;
  }

} // class Histogram

/**
 * Get the value at a given index of the sorted list of values
 * that the entries describe.
 *
 * @param {HistogramEntry[]} entries The sorted entries.
 * @param {number} index The index in the sorted list of values.
 * @returns {number} The value.
 */
function getEntriesValueAt(entries, index) {
  let cumulated = 0;
  for (const entry of entries) {
    cumulated += entry.count;
    if (index < cumulated) {
      return entry.value;
    }
  }
  return entries[entries.length - 1].value;
}

/**
 * Get the percentile of the values that the entries describe. Uses
 * linear interpolation between values like `getPercentile` in
 * `math/stats.js`.
 *
 * @param {HistogramEntry[]} entries The sorted entries.
 * @param {number} total The total count.
 * @param {number} ratio The percentile ratio [0-1].
 * @returns {number} The percentile.
 */
function getEntriesPercentile(entries, total, ratio) {
  const i = (total - 1) * ratio;
  const i0 = Math.floor(i);
  const v0 = getEntriesValueAt(entries, i0);
  if (i === i0) {
    return v0;
  }
  const v1 = getEntriesValueAt(entries, i0 + 1);
  return v0 + (v1 - v0) * (i - i0);
}
