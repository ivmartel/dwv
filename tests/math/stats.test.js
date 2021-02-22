/**
 * Tests for the 'math/stats.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('stats');

/**
 * Tests for {@link dwv.math.Stats.equals}.
 *
 * @function module:tests/math~Stats~equals
 */
QUnit.test('Test Stats equals.', function (assert) {
  var stats0 = new dwv.math.SimpleStats(0, 0, 0, 0);
  assert.notOk(stats0.equals(null), 'Stats should not be equal to null.');
  var stats1 = new dwv.math.SimpleStats(0, 0, 0, 0);
  assert.ok(stats0.equals(stats1), 'Stats should be equal.');
  var stats2 = new dwv.math.SimpleStats(0, 1, 2, 3);
  assert.notOk(stats0.equals(stats2), 'Stats should not be equal.');
});

/**
 * Tests for {@link dwv.math.getSimpleStats}.
 *
 * @function module:tests/math~getSimpleStats
 */
QUnit.test('Test getSimpleStats.', function (assert) {
  var arr0 = [1, 2, 3, 4, 5];
  var q0 = dwv.math.getStats(arr0);
  // min
  assert.equal(q0.getMin(), 1, 'min.0');
  // max
  assert.equal(q0.getMax(), 5, 'max.0');
  // mean
  assert.equal(q0.getMean(), 3, 'mean.0');
  // stdDev
  assert.equal(q0.getStdDev(), 1.4142135623730951, 'stdDev.0');

  var arr1 = [9, 2, 5, 4, 12, 7, 8, 11, 9, 3, 7, 4, 12, 5, 4, 10, 9, 6, 9, 4];
  var q1 = dwv.math.getStats(arr1);
  // min
  assert.equal(q1.getMin(), 2, 'min.1');
  // max
  assert.equal(q1.getMax(), 12, 'max.1');
  // mean
  assert.equal(q1.getMean(), 7, 'mean.1');
  // stdDev
  assert.equal(q1.getStdDev(), 2.9832867780352594, 'stdDev.1');
});

/**
 * Tests for {@link dwv.math.getFullStats}.
 *
 * @function module:tests/math~getFullStats
 */
QUnit.test('Test getFullStats.', function (assert) {
  var arr0 = [15, 20, 35, 40, 50];
  var q0 = dwv.math.getFullStats(arr0);
  // median
  assert.equal(q0.getMedian(), 35, 'median.0');
  // p25
  assert.equal(q0.getP25(), 20, 'p25.0');
  // p75
  assert.equal(q0.getP75(), 40, 'p75.0');

  var arr1 = [15, 20, 35, 40, 50, 60];
  var q1 = dwv.math.getFullStats(arr1);
  // median
  assert.equal(q1.getMedian(), 37.5, 'median.1');
  // p25
  assert.equal(q1.getP25(), 23.75, 'p25.1');
  // p75
  assert.equal(q1.getP75(), 47.5, 'p75.1');
});

/**
 * Tests for {@link dwv.math.guid}.
 *
 * @function module:tests/math~guid
 */
QUnit.test('Test GUID.', function (assert) {
  var id0 = dwv.math.guid();
  var id1 = dwv.math.guid();
  assert.equal((id0 === id1), false, 'Two GUids should not be equal.');

  var duplicates = 0;
  // create an array of guids
  var ids = [];
  for (var i = 0; i < 1000; ++i) {
    ids[ids.length] = dwv.math.guid();
  }
  // check duplicates
  var id = 0;
  for (i = 0; i < ids.length - 1; ++i) {
    id = ids.pop();
    if (ids.indexOf(id) !== -1) {
      ++duplicates;
    }
  }
  assert.equal(duplicates, 0, '1000 GUids should not be equal.');
});
