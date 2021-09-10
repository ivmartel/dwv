// namespace
var dwv = dwv || {};
dwv.test = dwv.test || {};
dwv.test.data = dwv.test.data || {};

/**
 * Tests for the 'image/iterator.js' file.
 */
/** @module tests/image */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('image');

/* eslint-disable array-element-newline */
dwv.test.data.iterator0 = {
  ncols: 3,
  nrows: 2,
  nslices: 4,
  buffer: [
    0, 1, 2,
    3, 4, 5,
    10, 11, 12,
    13, 14, 15,
    20, 21, 22,
    23, 24, 25,
    30, 31, 32,
    33, 34, 35
  ],
  valuesAx: [
    [0, 1, 2, 3, 4, 5],
    [10, 11, 12, 13, 14, 15],
    [20, 21, 22, 23, 24, 25],
    [30, 31, 32, 33, 34, 35]
  ],
  valuesAxR1: [
    [5, 4, 3, 2, 1, 0],
    [15, 14, 13, 12, 11, 10],
    [25, 24, 23, 22, 21, 20],
    [35, 34, 33, 32, 31, 30]
  ],
  valuesAxR2: [
    [2, 1, 0, 5, 4, 3],
    [12, 11, 10, 15, 14, 13],
    [22, 21, 20, 25, 24, 23],
    [32, 31, 30, 35, 34, 33]
  ],
  valuesAxR1R2: [
    [3, 4, 5, 0, 1, 2],
    [13, 14, 15, 10, 11, 12],
    [23, 24, 25, 20, 21, 22],
    [33, 34, 35, 30, 31, 32]
  ],
  valuesAx2: [
    [0, 3, 1, 4, 2, 5],
    [10, 13, 11, 14, 12, 15],
    [20, 23, 21, 24, 22, 25],
    [30, 33, 31, 34, 32, 35]
  ],
  valuesAx2R1: [
    [5, 2, 4, 1, 3, 0],
    [15, 12, 14, 11, 13, 10],
    [25, 22, 24, 21, 23, 20],
    [35, 32, 34, 31, 33, 30]
  ],
  valuesAx2R2: [
    [3, 0, 4, 1, 5, 2],
    [13, 10, 14, 11, 15, 12],
    [23, 20, 24, 21, 25, 22],
    [33, 30, 34, 31, 35, 32]
  ],
  valuesAx2R1R2: [
    [2, 5, 1, 4, 0, 3],
    [12, 15, 11, 14, 10, 13],
    [22, 25, 21, 24, 20, 23],
    [32, 35, 31, 34, 30, 33]
  ],
  valuesCo: [
    [0, 1, 2, 10, 11, 12, 20, 21, 22, 30, 31, 32],
    [3, 4, 5, 13, 14, 15, 23, 24, 25, 33, 34, 35]
  ],
  valuesCoR1: [
    [32, 31, 30, 22, 21, 20, 12, 11, 10, 2, 1, 0],
    [35, 34, 33, 25, 24, 23, 15, 14, 13, 5, 4, 3]
  ],
  valuesCoR2: [
    [2, 1, 0, 12, 11, 10, 22, 21, 20, 32, 31, 30],
    [5, 4, 3, 15, 14, 13, 25, 24, 23, 35, 34, 33]
  ],
  valuesCoR1R2: [
    [30, 31, 32, 20, 21, 22, 10, 11, 12, 0, 1, 2],
    [33, 34, 35, 23, 24, 25, 13, 14, 15, 3, 4, 5]
  ],
  valuesCo2: [
    [0, 10, 20, 30, 1, 11, 21, 31, 2, 12, 22, 32],
    [3, 13, 23, 33, 4, 14, 24, 34, 5, 15, 25, 35]
  ],
  valuesCo2R1: [
    [32, 22, 12, 2, 31, 21, 11, 1, 30, 20, 10, 0],
    [35, 25, 15, 5, 34, 24, 14, 4, 33, 23, 13, 3]
  ],
  valuesCo2R2: [
    [30, 20, 10, 0, 31, 21, 11, 1, 32, 22, 12, 2],
    [33, 23, 13, 3, 34, 24, 14, 4, 35, 25, 15, 5]
  ],
  valuesCo2R1R2: [
    [2, 12, 22, 32, 1, 11, 21, 31, 0, 10, 20, 30],
    [5, 15, 25, 35, 4, 14, 24, 34, 3, 13, 23, 33]
  ],
  valuesSa: [
    [0, 3, 10, 13, 20, 23, 30, 33],
    [1, 4, 11, 14, 21, 24, 31, 34],
    [2, 5, 12, 15, 22, 25, 32, 35]
  ],
  valuesSaR1: [
    [33, 30, 23, 20, 13, 10, 3, 0],
    [34, 31, 24, 21, 14, 11, 4, 1],
    [35, 32, 25, 22, 15, 12, 5, 2]
  ],
  valuesSaR2: [
    [3, 0, 13, 10, 23, 20, 33, 30],
    [4, 1, 14, 11, 24, 21, 34, 31],
    [5, 2, 15, 12, 25, 22, 35, 32]
  ],
  valuesSaR1R2: [
    [30, 33, 20, 23, 10, 13, 0, 3],
    [31, 34, 21, 24, 11, 14, 1, 4],
    [32, 35, 22, 25, 12, 15, 2, 5]
  ],
  valuesSa2: [
    [0, 10, 20, 30, 3, 13, 23, 33],
    [1, 11, 21, 31, 4, 14, 24, 34],
    [2, 12, 22, 32, 5, 15, 25, 35]
  ],
  valuesSa2R1: [
    [33, 23, 13, 3, 30, 20, 10, 0],
    [34, 24, 14, 4, 31, 21, 11, 1],
    [35, 25, 15, 5, 32, 22, 12, 2]
  ],
  valuesSa2R2: [
    [30, 20, 10, 0, 33, 23, 13, 3],
    [31, 21, 11, 1, 34, 24, 14, 4],
    [32, 22, 12, 2, 35, 25, 15, 5]
  ],
  valuesSa2R1R2: [
    [3, 13, 23, 33, 0, 10, 20, 30],
    [4, 14, 24, 34, 1, 11, 21, 31],
    [5, 15, 25, 35, 2, 12, 22, 32]
  ]
};
/* eslint-enable array-element-newline */

/**
 * Run an input iterator and store values.
 *
 * @param {object} iter The iterator.
 * @returns {Array} The result array.
 */
dwv.test.runIterator = function (iter) {
  var res = [];
  var ival = iter.next();
  while (!ival.done) {
    res.push(ival.value);
    ival = iter.next();
  }
  return res;
};

/**
 * Check iter.
 *
 * @param {object} assert The qunit assert.
 * @param {Function} getIter Function to get the iter at a given position.
 * @param {Array} theoValues Theoretical values.
 * @param {string} name String to identify test.
 */
dwv.test.checkIterator = function (assert, getIter, theoValues, name) {
  for (var i = 0; i < theoValues.length; ++i) {
    var res = dwv.test.runIterator(getIter(i));
    var theo = theoValues[i];
    assert.deepEqual(res, theo, 'range ' + name + ' #' + i);
  }
};

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
QUnit.test('Test range iterator: axial', function (assert) {
  // test data
  var testData0 = dwv.test.data.iterator0;
  var ncols = testData0.ncols;
  var nrows = testData0.nrows;
  var sliceSize = ncols * nrows;
  var dataAccessor = function (offset) {
    return testData0.buffer[offset];
  };

  // axial: xyz
  var getAxIter = function (reverse1, reverse2) {
    return function (index) {
      var min = index * sliceSize;
      var max = min + sliceSize;
      var start = reverse1 ? max - 1 : min;
      var maxIter = sliceSize;
      return dwv.image.range(dataAccessor,
        start, maxIter, 1, ncols, ncols, reverse1, reverse2);
    };
  };

  dwv.test.checkIterator(assert,
    getAxIter(false, false), testData0.valuesAx, 'axial');
  dwv.test.checkIterator(assert,
    getAxIter(true, false), testData0.valuesAxR1, 'axialR1');
  dwv.test.checkIterator(assert,
    getAxIter(false, true), testData0.valuesAxR2, 'axialR2');
  dwv.test.checkIterator(assert,
    getAxIter(true, true), testData0.valuesAxR1R2, 'axialR1R2');

  // axial: yxz
  var getAx2Iter = function (reverse1, reverse2) {
    return function (index) {
      var min = index * sliceSize;
      var max = min + sliceSize;
      var start = reverse1 ? max - 1 : min;
      var maxIter = sliceSize;
      return dwv.image.range(dataAccessor,
        start, maxIter, ncols, nrows, 1, reverse1, reverse2);
    };
  };

  dwv.test.checkIterator(assert,
    getAx2Iter(false, false), testData0.valuesAx2, 'axial2');
  dwv.test.checkIterator(assert,
    getAx2Iter(true, false), testData0.valuesAx2R1, 'axial2R1');
  dwv.test.checkIterator(assert,
    getAx2Iter(false, true), testData0.valuesAx2R2, 'axial2R2');
  dwv.test.checkIterator(assert,
    getAx2Iter(true, true), testData0.valuesAx2R1R2, 'axial2R1R2');
});

/**
 * Tests for {@link dwv.image.range}.
 *
 * @function module:tests/image~range
 */
QUnit.test('Test range iterator: coronal', function (assert) {
  // test data
  var testData0 = dwv.test.data.iterator0;
  var ncols = testData0.ncols;
  var nrows = testData0.nrows;
  var nslices = testData0.nslices;
  var sliceSize = ncols * nrows;
  var dataAccessor = function (offset) {
    return testData0.buffer[offset];
  };

  // coronal: xzy
  var getCoroIter = function (reverse1, reverse2) {
    return function (index) {
      var min = index * ncols;
      var max = min + (nslices - 1) * sliceSize + ncols;
      var start = reverse1 ? max - 1 : min;
      var maxIter = nslices * ncols;
      return dwv.image.range(dataAccessor,
        start, maxIter, 1, ncols, sliceSize, reverse1, reverse2);
    };
  };

  dwv.test.checkIterator(assert,
    getCoroIter(false, false), testData0.valuesCo, 'coronal');
  dwv.test.checkIterator(assert,
    getCoroIter(true, false), testData0.valuesCoR1, 'coronalR1');
  dwv.test.checkIterator(assert,
    getCoroIter(false, true), testData0.valuesCoR2, 'coronalR2');
  dwv.test.checkIterator(assert,
    getCoroIter(true, true), testData0.valuesCoR1R2, 'coronalR1R2');

  // coronal: zxy
  var getCoro2Iter = function (reverse1, reverse2) {
    return function (index) {
      var min = index * ncols;
      var max = min + (nslices - 1) * sliceSize + ncols;
      var start = reverse1 ? max - 1 : min;
      var maxIter = nslices * ncols;
      return dwv.image.range(dataAccessor,
        start, maxIter, sliceSize, nslices, 1, reverse1, reverse2);
    };
  };

  dwv.test.checkIterator(assert,
    getCoro2Iter(false, false), testData0.valuesCo2, 'coronal2');
  dwv.test.checkIterator(assert,
    getCoro2Iter(true, false), testData0.valuesCo2R1, 'coronal2R1');
  dwv.test.checkIterator(assert,
    getCoro2Iter(false, true), testData0.valuesCo2R2, 'coronal2R2');
  dwv.test.checkIterator(assert,
    getCoro2Iter(true, true), testData0.valuesCo2R1R2, 'coronal2R1R2');
});

/**
 * Tests for {@link dwv.image.range}.
 *
 * @function module:tests/image~range
 */
QUnit.test('Test range iterator: sagittal', function (assert) {
  // test data
  var testData0 = dwv.test.data.iterator0;
  var ncols = testData0.ncols;
  var nrows = testData0.nrows;
  var nslices = testData0.nslices;
  var sliceSize = ncols * nrows;
  var dataAccessor = function (offset) {
    return testData0.buffer[offset];
  };

  // sagittal: yzx
  var getSagIter = function (reverse1, reverse2) {
    return function (index) {
      var min = index;
      var max = min + (nslices - 1) * sliceSize + ncols * (nrows - 1);
      var start = reverse1 ? max : min;
      var maxIter = nslices * nrows;
      return dwv.image.range(dataAccessor,
        start, maxIter, ncols, nrows, sliceSize, reverse1, reverse2);
    };
  };

  dwv.test.checkIterator(assert,
    getSagIter(false, false), testData0.valuesSa, 'sagittal');
  dwv.test.checkIterator(assert,
    getSagIter(true, false), testData0.valuesSaR1, 'sagittalR1');
  dwv.test.checkIterator(assert,
    getSagIter(false, true), testData0.valuesSaR2, 'sagittalR2');
  dwv.test.checkIterator(assert,
    getSagIter(true, true), testData0.valuesSaR1R2, 'sagittalR1R2');

  // sagittal: zyx
  var getSag2Iter = function (reverse1, reverse2) {
    return function (index) {
      var min = index;
      var max = min + (nslices - 1) * sliceSize + ncols * (nrows - 1);
      var start = reverse1 ? max : min;
      var maxIter = nslices * nrows;
      return dwv.image.range(dataAccessor,
        start, maxIter, sliceSize, nslices, ncols, reverse1, reverse2);
    };
  };

  dwv.test.checkIterator(assert,
    getSag2Iter(false, false), testData0.valuesSa2, 'sagittal2');
  dwv.test.checkIterator(assert,
    getSag2Iter(true, false), testData0.valuesSa2R1, 'sagittal2R1');
  dwv.test.checkIterator(assert,
    getSag2Iter(false, true), testData0.valuesSa2R2, 'sagittal2R2');
  dwv.test.checkIterator(assert,
    getSag2Iter(true, true), testData0.valuesSa2R1R2, 'sagittal2R1R2');
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
 * Tests for {@link dwv.image.getSliceIterator}.
 *
 * @function module:tests/image~getSliceIterator
 */
QUnit.test('Test getSliceIterator.', function (assert) {

  // test data
  var testData0 = dwv.test.data.iterator0;

  var imgSize00 = new dwv.image.Size([
    testData0.ncols, testData0.nrows, 1
  ]);
  var imgSpacing0 = new dwv.image.Spacing(1, 1, 1);
  var imgOrigin0 = new dwv.math.Point3D(0, 0, 0);
  var imgGeometry0 = new dwv.image.Geometry(imgOrigin0, imgSize00, imgSpacing0);
  imgGeometry0.appendOrigin(new dwv.math.Point3D(0, 0, 1), 1);
  imgGeometry0.appendOrigin(new dwv.math.Point3D(0, 0, 2), 2);
  imgGeometry0.appendOrigin(new dwv.math.Point3D(0, 0, 3), 3);
  var image0 = new dwv.image.Image(imgGeometry0, testData0.buffer);

  var isRescaled = false;
  var viewOrientation;

  // axial
  var getAxIter = function (orientation) {
    return function (index) {
      var position = new dwv.math.Index([0, 0, index]);
      return dwv.image.getSliceIterator(
        image0, position, isRescaled, orientation);
    };
  };

  // axial: xyz
  viewOrientation = dwv.math.getIdentityMat33();
  dwv.test.checkIterator(assert,
    getAxIter(viewOrientation), testData0.valuesAx, 'axial');
  // axial: yxz
  /* eslint-disable array-element-newline */
  viewOrientation = new dwv.math.Matrix33([
    0, 1, 0,
    1, 0, 0,
    0, 0, 1
  ]);
  /* eslint-enable array-element-newline */
  dwv.test.checkIterator(assert,
    getAxIter(viewOrientation), testData0.valuesAx2, 'axial2');

  // coronal
  var getCoroIter = function (orientation) {
    return function (index) {
      var position = new dwv.math.Index([0, index, 0]);
      return dwv.image.getSliceIterator(
        image0, position, isRescaled, orientation);
    };
  };

  // coronal: xzy
  viewOrientation = dwv.math.getMatrixFromName('coronal');
  dwv.test.checkIterator(assert,
    getCoroIter(viewOrientation), testData0.valuesCo, 'coronal');
  // coronal: zxy
  /* eslint-disable array-element-newline */
  viewOrientation = new dwv.math.Matrix33([
    0, 1, 0,
    0, 0, 1,
    1, 0, 0
  ]);
  /* eslint-enable array-element-newline */
  dwv.test.checkIterator(assert,
    getCoroIter(viewOrientation), testData0.valuesCo2, 'coronal2');

  // sagittal
  var getSagIter = function (orientation) {
    return function (index) {
      var position = new dwv.math.Index([index, 0, 0]);
      return dwv.image.getSliceIterator(
        image0, position, isRescaled, orientation);
    };
  };

  // sagittal: yzx
  viewOrientation = dwv.math.getMatrixFromName('sagittal');
  dwv.test.checkIterator(assert,
    getSagIter(viewOrientation), testData0.valuesSa, 'sagittal');
  // sagittal: zyx
  /* eslint-disable array-element-newline */
  viewOrientation = new dwv.math.Matrix33([
    0, 0, 1,
    0, 1, 0,
    1, 0, 0
  ]);
  /* eslint-enable array-element-newline */
  dwv.test.checkIterator(assert,
    getSagIter(viewOrientation), testData0.valuesSa2, 'sagittal2');
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
