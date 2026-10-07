import {describe, test, assert} from 'vitest';
import {getHistogramIntervalPercentages} from '../../src/image/histogram.js';

/**
 * Tests for the 'image/histogram.js' file.
 */

/**
 * Build a dense histogram array from intensity -> count pairs.
 *
 * @param {Record<number, number>} counts Map of intensity to count.
 * @returns {number[]} Histogram array.
 */
function buildHistogram(counts) {
  const histogram = [];
  const values = Object.keys(counts).map(Number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  for (let b = min; b <= max; ++b) {
    histogram[b] = counts[b] || 0;
  }
  return histogram;
}

describe('histogram', () => {

  test('getHistogramIntervalPercentages for one volume', () => {
    // intensities: 0×25, 1×40, 5×20, 10×15 → total 100
    // thresholds [1, 5] → [0,1), [1,5), [5,11)
    const volumeHistograms = [{
      volume: 0,
      histogram: buildHistogram({0: 25, 1: 40, 5: 20, 10: 15})
    }];
    const thresholds = [1, 5];
    const names = ['intervalo1', 'intervalo2', 'intervalo3'];

    const result = getHistogramIntervalPercentages(
      volumeHistograms, thresholds, names);

    assert.equal(result.length, 1);
    assert.equal(result[0].volume, 0);
    assert.equal(result[0].intervals[0].name, 'intervalo1');
    assert.equal(result[0].intervals[0].percentage, 25);
    assert.equal(result[0].intervals[1].name, 'intervalo2');
    assert.equal(result[0].intervals[1].percentage, 40);
    assert.equal(result[0].intervals[2].name, 'intervalo3');
    assert.equal(result[0].intervals[2].percentage, 35);
  });

  test(
    'getHistogramIntervalPercentages keeps volumes independent',
    () => {
      const volumeHistograms = [
        {
          volume: 0,
          histogram: buildHistogram({0: 10})
        },
        {
          volume: 1,
          histogram: buildHistogram({5: 4, 10: 6})
        }
      ];
      const thresholds = [1, 5];
      const names = ['low', 'mid', 'high'];

      const result = getHistogramIntervalPercentages(
        volumeHistograms, thresholds, names);

      assert.equal(result.length, 2);
      assert.equal(result[0].volume, 0);
      // vol0 range [0,1): only low gets mass
      assert.equal(result[0].intervals[0].percentage, 100);
      assert.equal(result[0].intervals[1].percentage, 0);
      assert.equal(result[0].intervals[2].percentage, 0);
      assert.equal(result[1].volume, 1);
      // vol1 range [5,11): only high gets mass
      assert.equal(result[1].intervals[0].percentage, 0);
      assert.equal(result[1].intervals[1].percentage, 0);
      assert.equal(result[1].intervals[2].percentage, 100);
    }
  );

  test(
    'getHistogramIntervalPercentages returns 0 when total is 0',
    () => {
      const volumeHistograms = [{volume: 0, histogram: []}];
      const thresholds = [1, 5];
      const names = ['a', 'b', 'c'];

      const result = getHistogramIntervalPercentages(
        volumeHistograms, thresholds, names);

      assert.equal(result[0].intervals.length, 3);
      assert.equal(result[0].intervals[0].percentage, 0);
      assert.equal(result[0].intervals[1].percentage, 0);
      assert.equal(result[0].intervals[2].percentage, 0);
    }
  );

  test(
    'getHistogramIntervalPercentages uses semi-open bounds [min, max)',
    () => {
      // value 5 sits on the cut: belongs to [5, max), not [min, 5)
      const volumeHistograms = [{
        volume: 0,
        histogram: buildHistogram({1: 0, 5: 10})
      }];
      const thresholds = [5];
      const names = ['before', 'atAndAfter'];

      const result = getHistogramIntervalPercentages(
        volumeHistograms, thresholds, names);

      assert.equal(result[0].intervals[0].percentage, 0);
      assert.equal(result[0].intervals[1].percentage, 100);
    }
  );

  test(
    'getHistogramIntervalPercentages covers full histogram range',
    () => {
      // with auto min/max, all mass is assigned → percentages sum to 100
      const volumeHistograms = [{
        volume: 0,
        histogram: buildHistogram({2: 50, 100: 50})
      }];
      const thresholds = [10];
      const names = ['low', 'high'];

      const result = getHistogramIntervalPercentages(
        volumeHistograms, thresholds, names);

      assert.equal(result[0].intervals[0].percentage, 50);
      assert.equal(result[0].intervals[1].percentage, 50);
    }
  );

  test(
    'getHistogramIntervalPercentages throws if names length is wrong',
    () => {
      const volumeHistograms = [{
        volume: 0,
        histogram: buildHistogram({0: 1})
      }];
      assert.throws(
        () => getHistogramIntervalPercentages(
          volumeHistograms, [1, 5], ['only-one']),
        /names length must be/
      );
    }
  );

});
