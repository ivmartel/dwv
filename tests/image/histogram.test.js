import {describe, test, assert} from 'vitest';
import {Histogram} from '../../src/image/histogram.js';
import {RescaleSlopeAndIntercept} from '../../src/image/rsi.js';

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

  test('Histogram getCountInRange', () => {
    const histogram = buildHistogram({'-5': 1, 0: 2, 5: 3, 10: 4});

    assert.equal(histogram.getCountInRange(0, 10), 5, '[0, 10)');
    assert.equal(histogram.getCountInRange(undefined, 5), 3, '[-inf, 5)');
    assert.equal(histogram.getCountInRange(5), 7, '[5, +inf]');
    assert.equal(histogram.getCountInRange(), 10, 'unbounded');
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

});
