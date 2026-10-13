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

} // class Histogram
