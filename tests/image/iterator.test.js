/**
 * Tests for the 'image/iterator.js' file.
 */
/** @module tests/image */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link dwv.image.simpleRange}.
 *
 * @function module:tests/image~simpleRange
 */
QUnit.test('Test simpleRange iterator.', function (assert) {
  var dataAccessor = function (offset) {
    return offset;
  };
  // test #0: default increment
  var test0Min = 0;
  var test0Max = 10;
  var i0Theo = test0Min;
  var iter0 = dwv.image.simpleRange(dataAccessor, test0Min, test0Max);
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
  var iter1 = dwv.image.simpleRange(
    dataAccessor, test1Min, test1Max, test1Incr);
  var ival1 = iter1.next();
  while (!ival1.done) {
    assert.equal(ival1.value, i1Theo, '#1 iterator next');
    ival1 = iter1.next();
    i1Theo += test1Incr;
  }
  assert.equal(test1Max, i1Theo, '#1 iterator max');
});

/**
 * Tests for {@link dwv.image.range}.
 *
 * @function module:tests/image~range
 */
QUnit.test('Test range iterator.', function (assert) {
  /**
   * Run the iterator and store values.
   *
   * @param {object} iter The iterator.
   * @returns {Array} The result array.
   */
  function runIter(iter) {
    var res = [];
    var ival = iter.next();
    while (!ival.done) {
      res.push(ival.value);
      ival = iter.next();
    }
    return res;
  }

  var ncols = 3;
  var nrows = 2;
  var nslices = 4;
  var sliceSize = ncols * nrows;

  /* eslint-disable array-element-newline */
  var valuesAx = [
    0, 1, 2,
    3, 4, 5,
    10, 11, 12,
    13, 14, 15,
    20, 21, 22,
    23, 24, 25,
    30, 31, 32,
    33, 34, 35
  ];
  /* eslint-enable array-element-newline */

  var dataAccessor = function (offset) {
    return valuesAx[offset];
  };

  // axial: xyz or yxz

  /* eslint-disable array-element-newline */
  var valuesAxR1 = [
    5, 4, 3,
    2, 1, 0,
    15, 14, 13,
    12, 11, 10,
    25, 24, 23,
    22, 21, 20,
    35, 34, 33,
    32, 31, 30
  ];
  var valuesAxR2 = [
    2, 1, 0,
    5, 4, 3,
    12, 11, 10,
    15, 14, 13,
    22, 21, 20,
    25, 24, 23,
    32, 31, 30,
    35, 34, 33
  ];
  var valuesAxR1R2 = [
    3, 4, 5,
    0, 1, 2,
    13, 14, 15,
    10, 11, 12,
    23, 24, 25,
    20, 21, 22,
    33, 34, 35,
    30, 31, 32
  ];
  /* eslint-enable array-element-newline */

  /**
   * Check the axial values.
   *
   * @param {boolean} reverse1 Start-end flag.
   * @param {boolean} reverse2 Count start-end flag.
   * @param {Array} theoValues Theoretical result values.
   */
  function checkAxial(reverse1, reverse2, theoValues) {
    for (var k = 0; k < nslices; ++k) {
      var min = k * sliceSize;
      var max = (k + 1) * sliceSize;
      var iter = dwv.image.range(dataAccessor,
        min, max - 1, 1, ncols, ncols, reverse1, reverse2);
      var res = runIter(iter);
      var theo = theoValues.slice(min, max);
      assert.deepEqual(res, theo,
        'range axial ' + reverse1 + '-' + reverse2 + '#' + k);
    }
  }

  checkAxial(false, false, valuesAx);
  checkAxial(true, false, valuesAxR1);
  checkAxial(false, true, valuesAxR2);
  checkAxial(true, true, valuesAxR1R2);

  // coronal: xzy or zxy

  /* eslint-disable array-element-newline */
  var valuesCo = [
    0, 1, 2,
    10, 11, 12,
    20, 21, 22,
    30, 31, 32,
    3, 4, 5,
    13, 14, 15,
    23, 24, 25,
    33, 34, 35
  ];
  var valuesCoR1 = [
    32, 31, 30,
    22, 21, 20,
    12, 11, 10,
    2, 1, 0,
    35, 34, 33,
    25, 24, 23,
    15, 14, 13,
    5, 4, 3
  ];
  var valuesCoR2 = [
    2, 1, 0,
    12, 11, 10,
    22, 21, 20,
    32, 31, 30,
    5, 4, 3,
    15, 14, 13,
    25, 24, 23,
    35, 34, 33
  ];
  var valuesCoR1R2 = [
    30, 31, 32,
    20, 21, 22,
    10, 11, 12,
    0, 1, 2,
    33, 34, 35,
    23, 24, 25,
    13, 14, 15,
    3, 4, 5
  ];
  /* eslint-enable array-element-newline */

  /**
   * Check the coronal values.
   *
   * @param {boolean} reverse1 Start-end flag.
   * @param {boolean} reverse2 Count start-end flag.
   * @param {Array} theoValues Theoretical result values.
   */
  function checkCoronal(reverse1, reverse2, theoValues) {
    var viewSize = ncols * nslices;
    for (var j = 0; j < nrows; ++j) {
      var min = j * ncols;
      var max = min + (nslices - 1) * sliceSize + ncols;
      var iter = dwv.image.range(dataAccessor,
        min, max - 1, 1, ncols, sliceSize, reverse1, reverse2);
      var res = runIter(iter);
      var minVals = j * viewSize;
      var maxVals = (j + 1) * viewSize;
      var theo = theoValues.slice(minVals, maxVals);
      assert.deepEqual(res, theo,
        'range coronal ' + reverse1 + '-' + reverse2 + '#' + j);
    }
  }

  checkCoronal(false, false, valuesCo);
  checkCoronal(true, false, valuesCoR1);
  checkCoronal(false, true, valuesCoR2);
  checkCoronal(true, true, valuesCoR1R2);

  // sagittal: yzx or zyx

  /* eslint-disable array-element-newline */
  var valuesSa = [
    0, 3,
    10, 13,
    20, 23,
    30, 33,
    1, 4,
    11, 14,
    21, 24,
    31, 34,
    2, 5,
    12, 15,
    22, 25,
    32, 35
  ];
  var valuesSaR1 = [
    33, 30,
    23, 20,
    13, 10,
    3, 0,
    34, 31,
    24, 21,
    14, 11,
    4, 1,
    35, 32,
    25, 22,
    15, 12,
    5, 2
  ];
  var valuesSaR2 = [
    3, 0,
    13, 10,
    23, 20,
    33, 30,
    4, 1,
    14, 11,
    24, 21,
    34, 31,
    5, 2,
    15, 12,
    25, 22,
    35, 32
  ];
  var valuesSaR1R2 = [
    30, 33,
    20, 23,
    10, 13,
    0, 3,
    31, 34,
    21, 24,
    11, 14,
    1, 4,
    32, 35,
    22, 25,
    12, 15,
    2, 5
  ];
  /* eslint-enable array-element-newline */

  /**
   * Check the sagittal values.
   *
   * @param {boolean} reverse1 Start-end flag.
   * @param {boolean} reverse2 Count start-end flag.
   * @param {Array} theoValues Theoretical result values.
   */
  function checkSagittal(reverse1, reverse2, theoValues) {
    var viewSize = nrows * nslices;
    for (var i = 0; i < ncols; ++i) {
      var min = i;
      var max = min + (nslices - 1) * sliceSize + ncols * (nrows - 1);
      var iter = dwv.image.range(dataAccessor,
        min, max, ncols, nrows, sliceSize, reverse1, reverse2);
      var res = runIter(iter);
      var minVals = i * viewSize;
      var maxVals = (i + 1) * viewSize;
      var theo = theoValues.slice(minVals, maxVals);
      assert.deepEqual(res, theo,
        'range sagittal ' + reverse1 + '-' + reverse2 + '#' + i);
    }
  }

  checkSagittal(false, false, valuesSa);
  checkSagittal(true, false, valuesSaR1);
  checkSagittal(false, true, valuesSaR2);
  checkSagittal(true, true, valuesSaR1R2);
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

/**
 * Tests for {@link dwv.image.rangeRegion}.
 *
 * @function module:tests/image~rangeRegion
 */
QUnit.test('Test region iterator.', function (assert) {
  var dataAccessor = function (offset) {
    return offset;
  };
  // test #0: simulate regular iterator
  var test0Min = 0;
  var test0Max = 10;
  var test0Incr = 1;
  var test0NCols = 3;
  var test0RowIncr = 0;
  var i0Theo = test0Min;
  var iter0 = dwv.image.rangeRegion(
    dataAccessor, test0Min, test0Max, test0Incr, test0NCols, test0RowIncr);
  var ival0 = iter0.next();
  while (!ival0.done) {
    assert.equal(ival0.value, i0Theo, '#0 iterator next');
    ival0 = iter0.next();
    ++i0Theo;
  }
  assert.equal(test0Max, i0Theo, '#0 iterator max');

  // test #1: with col/row
  var test1Min = 0;
  var test1Max = 10;
  var test1Incr = 1;
  var test1NCols = 2;
  var test1RowIncr = 1;
  var i1Theo = test1Min;
  var iter1 = dwv.image.rangeRegion(
    dataAccessor, test1Min, test1Max, test1Incr, test1NCols, test1RowIncr);
  var ival1 = iter1.next();
  var countCol = 0;
  while (!ival1.done) {
    assert.equal(ival1.value, i1Theo, '#1 iterator next');
    ival1 = iter1.next();
    ++i1Theo;
    ++countCol;
    if (countCol === test1NCols) {
      countCol = 0;
      i1Theo += test1RowIncr;
    }
  }
  assert.equal(test1Max, i1Theo, '#1 iterator max');
});
