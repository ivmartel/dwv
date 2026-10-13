import {describe, test, assert} from 'vitest';
import {Histogram} from '../../src/image/histogram.js';
import {RescaleSlopeAndIntercept} from '../../src/image/rsi.js';
import {getStats} from '../../src/math/stats.js';

/**
 * Tests for the 'image/histogram.js' file.
 */

const idRsi = new RescaleSlopeAndIntercept(1, 0);

/**
 * Build a histogram from intensity -> count pairs.
 *
 * @param {Record<number, number>} counts Map of intensity to count.
 * @param {RescaleSlopeAndIntercept} [rsi] Optional RSI, defaults to id.
 * @returns {Histogram} The histogram.
 */
function buildHistogram(counts, rsi) {
  const histogram = new Histogram();
  const rawCounts = histogram.getRawCounts(rsi ?? idRsi);
  for (const [value, count] of Object.entries(counts)) {
    if (count !== 0) {
      rawCounts.set(Number(value), count);
    }
  }
  return histogram;
}

describe('histogram', () => {

  test('Histogram keeps negative values', () => {
    const histogram = buildHistogram({'-1000': 3, 0: 1, 40: 2});

    assert.deepEqual(histogram.getEntries(), [
      {value: -1000, count: 3},
      {value: 0, count: 1},
      {value: 40, count: 2}
    ]);
    assert.equal(histogram.getTotal(), 6);
    assert.deepEqual(histogram.getRescaledRange(), {min: -1000, max: 40});
    assert.deepEqual(histogram.getRange(), {min: -1000, max: 40});
  });

  test('Histogram rescales non integer values', () => {
    const rsi = new RescaleSlopeAndIntercept(0.5, -1024);
    const histogram = buildHistogram({1: 2, 2: 1, 3: 4}, rsi);

    assert.deepEqual(histogram.getEntries(), [
      {value: -1023.5, count: 2},
      {value: -1023, count: 1},
      {value: -1022.5, count: 4}
    ]);
    assert.deepEqual(histogram.getRange(), {min: 1, max: 3});
    assert.deepEqual(
      histogram.getRescaledRange(), {min: -1023.5, max: -1022.5});
  });

  test('Histogram merges equal values from different RSI', () => {
    const histogram = new Histogram();
    // 10 * 1 + 0 = 10, 5 * 2 + 0 = 10, 2 * 2 + 0 = 4
    histogram.add(10, new RescaleSlopeAndIntercept(1, 0));
    histogram.add(5, new RescaleSlopeAndIntercept(2, 0));
    histogram.add(5, new RescaleSlopeAndIntercept(2, 0));
    histogram.add(2, new RescaleSlopeAndIntercept(2, 0));

    assert.deepEqual(histogram.getEntries(), [
      {value: 4, count: 1},
      {value: 10, count: 3}
    ]);
    assert.equal(histogram.getTotal(), 4);
  });

  test('Histogram sorts entries with negative slope', () => {
    const rsi = new RescaleSlopeAndIntercept(-1, 0);
    const histogram = buildHistogram({1: 1, 2: 2, 3: 3}, rsi);

    assert.deepEqual(
      histogram.getEntries().map((entry) => entry.value), [-3, -2, -1]);
    assert.deepEqual(histogram.getRescaledRange(), {min: -3, max: -1});
  });

  test('Histogram empty', () => {
    const histogram = new Histogram();

    assert.deepEqual(histogram.getEntries(), []);
    assert.equal(histogram.getTotal(), 0);
    assert.isUndefined(histogram.getRescaledRange());
    assert.isUndefined(histogram.getRange());
  });

  test('Histogram getCountInRescaledRange', () => {
    const histogram = buildHistogram({'-5': 1, 0: 2, 5: 3, 10: 4});

    assert.equal(histogram.getCountInRescaledRange(0, 10), 5, '[0, 10)');
    assert.equal(
      histogram.getCountInRescaledRange(undefined, 5), 3, '[-inf, 5)');
    assert.equal(histogram.getCountInRescaledRange(5), 7, '[5, +inf]');
    assert.equal(histogram.getCountInRescaledRange(), 10, 'unbounded');
  });

  test('Histogram getIntervalPercentages', () => {
    // intensities: 0×25, 1×40, 5×20, 10×15 → total 100
    // thresholds [1, 5] → [0, 1), [1, 5), [5, 10]
    const histogram = buildHistogram({0: 25, 1: 40, 5: 20, 10: 15});

    assert.deepEqual(histogram.getIntervalPercentages([1, 5]), [25, 40, 35]);
  });

  test('Histogram getIntervalPercentages with non integer values', () => {
    // values 0.5, 1, 1.5, 2 with counts 1, 1, 1, 1
    const rsi = new RescaleSlopeAndIntercept(0.5, 0);
    const histogram = buildHistogram({1: 1, 2: 1, 3: 1, 4: 1}, rsi);

    assert.deepEqual(histogram.getIntervalPercentages([1.5]), [50, 50]);
  });

  test('Histogram getIntervalPercentages returns 0 when empty', () => {
    const histogram = new Histogram();

    assert.deepEqual(histogram.getIntervalPercentages([1, 5]), [0, 0, 0]);
  });

  test('Histogram getIntervalPercentages uses semi-open bounds', () => {
    // value 5 sits on the cut: belongs to [5, max], not [min, 5)
    const histogram = buildHistogram({5: 10});

    assert.deepEqual(histogram.getIntervalPercentages([5]), [0, 100]);
  });

  test('Histogram getIntervalPercentages covers full range', () => {
    // all mass is assigned → percentages sum to 100
    const histogram = buildHistogram({2: 50, 100: 50});

    assert.deepEqual(histogram.getIntervalPercentages([10]), [50, 50]);
    assert.deepEqual(histogram.getIntervalPercentages([]), [100]);
  });

  test('Histogram getStats matches getStats on values', () => {
    const counts = {'-3': 2, 0: 1, 4: 3, 7: 1, 10: 2};
    const rsi = new RescaleSlopeAndIntercept(0.5, 1);
    const histogram = buildHistogram(counts, rsi);
    // the full list of rescaled values
    const values = [];
    for (const [raw, count] of Object.entries(counts)) {
      for (let i = 0; i < count; ++i) {
        values.push(rsi.apply(Number(raw)));
      }
    }
    const theo = getStats(values, ['median', 'p25', 'p75']);

    const stats = histogram.getStats();
    assert.equal(stats.min, theo.min, 'min');
    assert.equal(stats.max, theo.max, 'max');
    assert.closeTo(stats.mean, theo.mean, 1e-12, 'mean');
    assert.closeTo(stats.stdDev, theo.stdDev, 1e-12, 'stdDev');
    assert.equal(stats.median, theo.median, 'median');
    assert.equal(stats.p25, theo.p25, 'p25');
    assert.equal(stats.p75, theo.p75, 'p75');
  });

  test('Histogram getStats interpolates median', () => {
    // values 1, 2, 3, 4 → median 2.5
    const histogram = buildHistogram({1: 1, 2: 1, 3: 1, 4: 1});

    const stats = histogram.getStats();
    assert.equal(stats.median, 2.5, 'median');
    assert.equal(stats.mean, 2.5, 'mean');
    assert.equal(stats.p25, 1.75, 'p25');
    assert.equal(stats.p75, 3.25, 'p75');
  });

  test('Histogram getStats single value and empty', () => {
    const stats = buildHistogram({5: 3}).getStats();
    assert.equal(stats.min, 5);
    assert.equal(stats.max, 5);
    assert.equal(stats.mean, 5);
    assert.equal(stats.stdDev, 0);
    assert.equal(stats.median, 5);

    assert.isUndefined(new Histogram().getStats());
  });

});
