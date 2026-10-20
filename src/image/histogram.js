import {Statistics} from '../math/stats.js';

/**
 * Histogram utilities.
 */

/**
 * @import {RescaleSlopeAndIntercept} from './rsi.js';
 * @import {NumberRange} from '../math/number.js';
 */

/**
 * Histogram entry.
 *
 * @typedef {object} HistogramEntry
 * @property {number} value The rescaled value.
 * @property {number} count The number of occurrences.
 */

/**
 * Histogram of image values.
 *
 * Raw (stored) values are counted per rescale slope and intercept (RSI):
 * values sharing an RSI share one count map. Values are rescaled when
 * read. An image with a constant RSI only has one group.
 */
export class Histogram {

  /**
   * Raw value counts per RSI.
   *
   * @type {{rsi: RescaleSlopeAndIntercept, counts: Map<number, number>}[]}
   */
  #groups = [];

  /**
   * Get the raw value counts for an RSI, creating them if needed.
   *
   * @param {RescaleSlopeAndIntercept} rsi The RSI of the raw values.
   * @returns {Map<number, number>} The raw value to count map.
   */
  getRawCounts(rsi) {
    let group = this.#groups.find((item) => item.rsi.equals(rsi));
    if (typeof group === 'undefined') {
      group = {rsi, counts: new Map()};
      this.#groups.push(group);
    }
    return group.counts;
  }

  /**
   * Add one raw value.
   *
   * @param {number} rawValue The raw value.
   * @param {RescaleSlopeAndIntercept} rsi The RSI of the raw value.
   */
  add(rawValue, rsi) {
    const counts = this.getRawCounts(rsi);
    counts.set(rawValue, (counts.get(rawValue) ?? 0) + 1);
  }

  /**
   * Get the total number of counted values.
   *
   * @returns {number} The total count.
   */
  getTotal() {
    let total = 0;
    for (const group of this.#groups) {
      for (const count of group.counts.values()) {
        total += count;
      }
    }
    return total;
  }

  /**
   * Get the histogram entries: rescaled values (equal values from
   * different RSI merged) sorted in ascending order.
   *
   * @returns {HistogramEntry[]} The entries.
   */
  getEntries() {
    /** @type {Map<number, number>} */
    const merged = new Map();
    for (const group of this.#groups) {
      for (const [rawValue, count] of group.counts) {
        const value = group.rsi.apply(rawValue);
        merged.set(value, (merged.get(value) ?? 0) + count);
      }
    }
    return Array.from(merged, ([value, count]) => ({value, count}))
      .sort((a, b) => a.value - b.value);
  }

  /**
   * Get the value range (raw values).
   *
   * @returns {NumberRange|undefined} The range, undefined if empty.
   */
  getRange() {
    let min;
    let max;
    for (const group of this.#groups) {
      for (const rawValue of group.counts.keys()) {
        if (typeof min === 'undefined' || rawValue < min) {
          min = rawValue;
        }
        if (typeof max === 'undefined' || rawValue > max) {
          max = rawValue;
        }
      }
    }
    if (typeof min === 'undefined') {
      return undefined;
    }
    return {min, max};
  }

  /**
   * Get the rescaled value range.
   *
   * @returns {NumberRange|undefined} The range, undefined if empty.
   */
  getRescaledRange() {
    let min;
    let max;
    for (const group of this.#groups) {
      for (const rawValue of group.counts.keys()) {
        const value = group.rsi.apply(rawValue);
        if (typeof min === 'undefined' || value < min) {
          min = value;
        }
        if (typeof max === 'undefined' || value > max) {
          max = value;
        }
      }
    }
    if (typeof min === 'undefined') {
      return undefined;
    }
    return {min, max};
  }

  /**
   * Get the number of values with a rescaled value in [min, max).
   *
   * @param {number} [min] Inclusive lower bound, unbounded if undefined.
   * @param {number} [max] Exclusive upper bound, unbounded if undefined.
   * @returns {number} The count.
   */
  getCountInRescaledRange(min, max) {
    let sum = 0;
    for (const group of this.#groups) {
      for (const [rawValue, count] of group.counts) {
        const value = group.rsi.apply(rawValue);
        if ((typeof min === 'undefined' || value >= min) &&
          (typeof max === 'undefined' || value < max)) {
          sum += count;
        }
      }
    }
    return sum;
  }

  /**
   * Get the percentage of counts that fall in each interval defined by
   * interior thresholds.
   *
   * For thresholds `[1, 5]`, the intervals are `[min, 1)`, `[1, 5)` and
   * `[5, max]`, where `min` / `max` are the histogram rescaled range.
   *
   * @param {number[]} thresholds Interior rescaled cut points in ascending
   *   order.
   * @returns {number[]} The percentages in [0, 100], one per interval
   *   (`thresholds.length + 1` entries), all 0 for an empty histogram.
   */
  getIntervalPercentages(thresholds) {
    const total = this.getTotal();
    // open first and last intervals
    const bounds = [undefined, ...thresholds, undefined];
    const percentages = [];
    for (let i = 0; i < bounds.length - 1; ++i) {
      const count = this.getCountInRescaledRange(bounds[i], bounds[i + 1]);
      percentages.push(total === 0 ? 0 : (count * 100) / total);
    }
    return percentages;
  }

  /**
   * Get the statistics of the rescaled values: minimum, maximum, mean,
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
