import {Histogram} from '../math/histogram.js';

/**
 * @import {RescaleSlopeAndIntercept} from './rsi.js';
 * @import {NumberRange} from '../math/number.js';
 * @import {Statistics} from '../math/stats.js';
 */

/**
 * Histogram of image values.
 *
 * Raw (stored) values are counted in one {@link Histogram} per rescale
 * slope and intercept (RSI). Values are rescaled when read. An image
 * with a constant RSI only has one histogram.
 */
export class ImageHistogram {

  /**
   * Raw value histograms per RSI.
   *
   * @type {Array<{rsi: RescaleSlopeAndIntercept, histogram: Histogram}>}
   */
  #groups = [];

  /**
   * Unit of the rescaled values.
   *
   * @type {string|undefined}
   */
  #unit;

  /**
   * @param {string} [unit] The unit of the rescaled values.
   */
  constructor(unit) {
    this.#unit = unit;
  }

  /**
   * Get the unit of the rescaled values.
   *
   * @returns {string|undefined} The unit, undefined if not known.
   */
  getUnit() {
    return this.#unit;
  }

  /**
   * Get the raw value histogram for an RSI, creating it if needed.
   *
   * @param {RescaleSlopeAndIntercept} rsi The RSI of the raw values.
   * @returns {Histogram} The raw value histogram.
   */
  getHistogram(rsi) {
    let group = this.#groups.find((item) => item.rsi.equals(rsi));
    if (typeof group === 'undefined') {
      group = {rsi, histogram: new Histogram()};
      this.#groups.push(group);
    }
    return group.histogram;
  }

  /**
   * Add one raw value.
   *
   * @param {number} rawValue The raw value.
   * @param {RescaleSlopeAndIntercept} rsi The RSI of the raw value.
   */
  add(rawValue, rsi) {
    this.getHistogram(rsi).add(rawValue);
  }

  /**
   * Get the total number of counted values.
   *
   * @returns {number} The total count.
   */
  getTotal() {
    let total = 0;
    for (const group of this.#groups) {
      total += group.histogram.getTotal();
    }
    return total;
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
      const range = group.histogram.getRange();
      if (typeof range === 'undefined') {
        continue;
      }
      if (typeof min === 'undefined' || range.min < min) {
        min = range.min;
      }
      if (typeof max === 'undefined' || range.max > max) {
        max = range.max;
      }
    }
    if (typeof min === 'undefined') {
      return undefined;
    }
    return {min, max};
  }

  /**
   * Get the histogram of the rescaled values: raw values of each RSI
   * are rescaled and equal rescaled values merged.
   *
   * @returns {Histogram} The rescaled value histogram.
   */
  getRescaledHistogram() {
    const rescaled = new Histogram();
    for (const group of this.#groups) {
      for (const entry of group.histogram.getEntries()) {
        rescaled.add(group.rsi.apply(entry.value), entry.count);
      }
    }
    return rescaled;
  }

  /**
   * Get the rescaled value range.
   *
   * @returns {NumberRange|undefined} The range, undefined if empty.
   */
  getRescaledRange() {
    return this.getRescaledHistogram().getRange();
  }

  /**
   * Get the percentage of counts that fall in each interval defined by
   * interior rescaled thresholds,
   * see {@link Histogram#getIntervalPercentages}.
   *
   * @param {number[]} thresholds Interior rescaled cut points in ascending
   *   order.
   * @returns {number[]} The percentages in [0, 100], one per interval
   *   (`thresholds.length + 1` entries), all 0 for an empty histogram.
   */
  getIntervalPercentages(thresholds) {
    return this.getRescaledHistogram().getIntervalPercentages(thresholds);
  }

  /**
   * Get the statistics of the rescaled values,
   * see {@link Histogram#getStats}.
   *
   * @returns {Statistics|undefined} The statistics, undefined if empty.
   */
  getStats() {
    return this.getRescaledHistogram().getStats();
  }

} // class ImageHistogram
