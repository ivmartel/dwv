import {getStats, guid} from '../../src/math/stats';

/**
 * Tests for the 'math/stats.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests for {@link getSimpleStats}.
 *
 * @function module:tests/math~getSimpleStats
 */
QUnit.test('Test getSimpleStats.', function (assert) {
  const arr0 = [1, 2, 3, 4, 5];
  const q0 = getStats(arr0);
  // min
  assert.equal(q0.min, 1, 'min.0');
  // max
  assert.equal(q0.max, 5, 'max.0');
  // mean
  assert.equal(q0.mean, 3, 'mean.0');
  // stdDev
  assert.equal(q0.stdDev, 1.4142135623730951, 'stdDev.0');

  const arr1 = [9, 2, 5, 4, 12, 7, 8, 11, 9, 3, 7, 4, 12, 5, 4, 10, 9, 6, 9, 4];
  const q1 = getStats(arr1);
  // min
  assert.equal(q1.min, 2, 'min.1');
  // max
  assert.equal(q1.max, 12, 'max.1');
  // mean
  assert.equal(q1.mean, 7, 'mean.1');
  // stdDev
  assert.equal(q1.stdDev, 2.9832867780352594, 'stdDev.1');
});

/**
 * Tests for {@link getFullStats}.
 *
 * @function module:tests/math~getFullStats
 */
QUnit.test('Test getFullStats.', function (assert) {
  const arr0 = [15, 20, 35, 40, 50];
  const q0 = getStats(arr0, ['median']);
  // median
  assert.equal(q0.median, 35, 'median.0');
  // p25
  assert.equal(q0.p25, 20, 'p25.0');
  // p75
  assert.equal(q0.p75, 40, 'p75.0');

  const arr1 = [15, 20, 35, 40, 50, 60];
  const q1 = getStats(arr1, ['median']);
  // median
  assert.equal(q1.median, 37.5, 'median.1');
  // p25
  assert.equal(q1.p25, 23.75, 'p25.1');
  // p75
  assert.equal(q1.p75, 47.5, 'p75.1');
});

/**
 * Tests for {@link guid}.
 *
 * @function module:tests/math~guid
 */
QUnit.test('Test GUID.', function (assert) {
  const id0 = guid();
  const id1 = guid();
  assert.equal((id0 === id1), false, 'Two GUids should not be equal.');

  let duplicates = 0;
  // create an array of guids
  const ids = [];
  for (let i = 0; i < 1000; ++i) {
    ids[ids.length] = guid();
  }
  // check duplicates
  let id = 0;
  for (let i = 0; i < ids.length - 1; ++i) {
    id = ids.pop();
    if (ids.indexOf(id) !== -1) {
      ++duplicates;
    }
  }
  assert.equal(duplicates, 0, '1000 GUids should not be equal.');
});
