/**
 * Tests for the 'image/iterator.js' file.
 */
/** @module tests/image */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link dwv.image.range}.
 *
 * @function module:tests/image~range
 */
QUnit.test('Test iterator.', function (assert) {
  var dataAccessor = function (offset) {
    return offset;
  };
  // test #0: default increment
  var test0Min = 0;
  var test0Max = 10;
  var i0Theo = test0Min;
  var iter0 = dwv.image.range(dataAccessor, test0Min, test0Max);
  var ival0 = iter0.next();
  while (!ival0.done) {
    assert.equal(ival0.value, i0Theo, '#0 iterator next');
    ival0 = iter0.next();
    ++i0Theo;
  }
  assert.equal(test0Max, i0Theo, '#0 iterator max');

  // test #1: specific increment
  var test1Min = 1;
  var test1Max = 21;
  var test1Incr = 2;
  var i1Theo = test1Min;
  var iter1 = dwv.image.range(dataAccessor, test1Min, test1Max, test1Incr);
  var ival1 = iter1.next();
  while (!ival1.done) {
    assert.equal(ival1.value, i1Theo, '#1 iterator next');
    ival1 = iter1.next();
    i1Theo += test1Incr;
  }
  assert.equal(test1Max, i1Theo, '#1 iterator max');
});

/**
 * Tests for {@link dwv.image.range3d}.
 *
 * @function module:tests/image~range3d
 */
QUnit.test('Test 3 components iterator.', function (assert) {
  var dataAccessor = function (offset) {
    return offset;
  };
  // test #0: default increment, default planar
  var test0Min = 0;
  var test0Size = 3;
  var test0Max = test0Min + 3 * test0Size;
  var i0Theo = test0Min;
  var iter0 = dwv.image.range3d(dataAccessor, test0Min, test0Max);
  var ival0 = iter0.next();
  while (!ival0.done) {
    assert.equal(ival0.value[0], i0Theo, '#0 3d iterator value');
    assert.equal(ival0.value[1], i0Theo + 1, '#0 3d iterator value1');
    assert.equal(ival0.value[2], i0Theo + 2, '#0 3d iterator value2');
    // increment
    i0Theo += 3;
    ival0 = iter0.next();
  }
  assert.equal(test0Max, i0Theo, '#0 3d iterator max');

  // test #1: non default increment, default planar (false)
  var test1Min = 1;
  var test1Size = 6;
  var test1Max = test1Min + 3 * test1Size;
  var test1Incr = 2;
  var i1Theo = test1Min;
  var iter1 = dwv.image.range3d(dataAccessor, test1Min, test1Max, test1Incr);
  var ival1 = iter1.next();
  while (!ival1.done) {
    assert.equal(ival1.value[0], i1Theo, '#1 3d iterator value');
    assert.equal(ival1.value[1], i1Theo + 1, '#1 3d iterator value1');
    assert.equal(ival1.value[2], i1Theo + 2, '#1 3d iterator value2');
    i1Theo += test1Incr * 3;
    ival1 = iter1.next();
  }
  assert.equal(test1Max, i1Theo, '#1 3d iterator max');

  // test #2: default increment, planar
  var test2Min = 2;
  var test2Size = 6;
  var test2Max = test2Min + 3 * test2Size;
  var i2Theo = test2Min;
  var iter2 = dwv.image.range3d(dataAccessor, test2Min, test2Max, 1, true);
  var ival2 = iter2.next();
  while (!ival2.done) {
    assert.equal(ival2.value[0], i2Theo, '#2 3d iterator value');
    assert.equal(ival2.value[1], i2Theo + test2Size, '#2 3d iterator value1');
    assert.equal(ival2.value[2], i2Theo + 2 * test2Size,
      '#2 3d iterator value2');
    ++i2Theo;
    ival2 = iter2.next();
  }
  assert.equal(test2Max, i2Theo, '#2 3d iterator max');

  // test #2: non default increment, planar
  var test3Min = 3;
  var test3Size = 6;
  var test3Max = test3Min + 3 * test3Size;
  var test3Incr = 2;
  var i3Theo = test3Min;
  var iter3 = dwv.image.range3d(
    dataAccessor, test3Min, test3Max, test3Incr, true);
  var ival3 = iter3.next();
  while (!ival3.done) {
    assert.equal(ival3.value[0], i3Theo, '#3 3d iterator value');
    assert.equal(ival3.value[1], i3Theo + test3Size, '#3 3d iterator value1');
    assert.equal(ival3.value[2], i3Theo + 2 * test3Size,
      '#3 3d iterator value2');
    i3Theo += test3Incr;
    ival3 = iter3.next();
  }
  assert.equal(test3Max, i3Theo, '#3 3d iterator max');
});
