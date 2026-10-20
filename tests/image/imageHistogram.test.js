import {describe, test, assert} from 'vitest';
import {ImageHistogram} from '../../src/image/imageHistogram.js';
import {RescaleSlopeAndIntercept} from '../../src/image/rsi.js';
import {getStats} from '../../src/math/stats.js';

/**
 * Tests for the 'image/imageHistogram.js' file.
 */

const idRsi = new RescaleSlopeAndIntercept(1, 0);

/**
 * Build an image histogram from raw value -> count pairs.
 *
 * @param {Record<number, number>} counts Map of raw value to count.
 * @param {RescaleSlopeAndIntercept} [rsi] Optional RSI, defaults to id.
 * @returns {ImageHistogram} The histogram.
 */
function buildHistogram(counts, rsi) {
  const histogram = new ImageHistogram();
  const rawHistogram = histogram.getHistogram(rsi ?? idRsi);
  for (const [value, count] of Object.entries(counts)) {
    rawHistogram.add(Number(value), count);
  }
  return histogram;
}

describe('image', () => {

  test('ImageHistogram identity RSI', () => {
    const histogram = buildHistogram({'-1000': 3, 0: 1, 40: 2});

    assert.deepEqual(histogram.getRescaledHistogram().getEntries(), [
      {value: -1000, count: 3},
      {value: 0, count: 1},
      {value: 40, count: 2}
    ]);
    assert.equal(histogram.getTotal(), 6);
    assert.deepEqual(histogram.getRescaledRange(), {min: -1000, max: 40});
    assert.deepEqual(histogram.getRange(), {min: -1000, max: 40});
  });

  test('ImageHistogram rescales non integer values', () => {
    const rsi = new RescaleSlopeAndIntercept(0.5, -1024);
    const histogram = buildHistogram({1: 2, 2: 1, 3: 4}, rsi);

    assert.deepEqual(histogram.getRescaledHistogram().getEntries(), [
      {value: -1023.5, count: 2},
      {value: -1023, count: 1},
      {value: -1022.5, count: 4}
    ]);
    assert.deepEqual(histogram.getRange(), {min: 1, max: 3});
    assert.deepEqual(
      histogram.getRescaledRange(), {min: -1023.5, max: -1022.5});
  });

  test('ImageHistogram merges equal values from different RSI', () => {
    const histogram = new ImageHistogram();
    // 10 * 1 + 0 = 10, 5 * 2 + 0 = 10, 2 * 2 + 0 = 4
    histogram.add(10, new RescaleSlopeAndIntercept(1, 0));
    histogram.add(5, new RescaleSlopeAndIntercept(2, 0));
    histogram.add(5, new RescaleSlopeAndIntercept(2, 0));
    histogram.add(2, new RescaleSlopeAndIntercept(2, 0));

    assert.deepEqual(histogram.getRescaledHistogram().getEntries(), [
      {value: 4, count: 1},
      {value: 10, count: 3}
    ]);
    assert.equal(histogram.getTotal(), 4);
    // raw range over all RSI
    assert.deepEqual(histogram.getRange(), {min: 2, max: 10});
  });

  test('ImageHistogram sorts entries with negative slope', () => {
    const rsi = new RescaleSlopeAndIntercept(-1, 0);
    const histogram = buildHistogram({1: 1, 2: 2, 3: 3}, rsi);

    assert.deepEqual(
      histogram.getRescaledHistogram().getEntries().map(
        (entry) => entry.value),
      [-3, -2, -1]);
    assert.deepEqual(histogram.getRescaledRange(), {min: -3, max: -1});
  });

  test('ImageHistogram empty', () => {
    const histogram = new ImageHistogram();

    assert.equal(histogram.getTotal(), 0);
    assert.isUndefined(histogram.getRescaledRange());
    assert.isUndefined(histogram.getRange());
    assert.isUndefined(histogram.getStats());
    assert.deepEqual(histogram.getIntervalPercentages([1, 5]), [0, 0, 0]);
  });

  test('ImageHistogram getIntervalPercentages uses rescaled values', () => {
    // values 0.5, 1, 1.5, 2 with counts 1, 1, 1, 1
    const rsi = new RescaleSlopeAndIntercept(0.5, 0);
    const histogram = buildHistogram({1: 1, 2: 1, 3: 1, 4: 1}, rsi);

    assert.deepEqual(histogram.getIntervalPercentages([1.5]), [50, 50]);
  });

  test('ImageHistogram getStats matches getStats on values', () => {
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

});
