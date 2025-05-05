import {Point3D} from '../../src/math/point.js';
import {Index} from '../../src/math/index.js';
import {
  Matrix33,
  getIdentityMat33
} from '../../src/math/matrix.js';
import {getMatrixFromName} from '../../src/math/orientation.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {
  simpleRange,
  simpleRange3d,
  range,
  rangeRegion,
  getSliceIterator
} from '../../src/image/iterator.js';
import {Image} from '../../src/image/image.js';

/**
 * Tests for the 'image/iterator.js' file.
 */

/* global QUnit */
QUnit.module('image');

/* eslint-disable @stylistic/js/array-element-newline */
const dataIterator0 = {
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
/* eslint-enable @stylistic/js/array-element-newline */

/**
 * Run an input iterator and store values.
 *
 * @param {object} iter The iterator.
 * @returns {Array} The result array.
 */
function runIterator(iter) {
  const res = [];
  let ival = iter.next();
  while (!ival.done) {
    res.push(ival.value);
    ival = iter.next();
  }
  return res;
}

/**
 * Check iter.
 *
 * @param {object} assert The qunit assert.
 * @param {Function} getIter Function to get the iter at a given position.
 * @param {Array} theoValues Theoretical values.
 * @param {string} name String to identify test.
 */
function checkIterator(assert, getIter, theoValues, name) {
  for (let i = 0; i < theoValues.length; ++i) {
    const res = runIterator(getIter(i));
    const theo = theoValues[i];
    assert.deepEqual(res, theo, 'range ' + name + ' #' + i);
  }
}

/**
 * Tests for {@link simpleRange}.
 *
 * @function module:tests/image~simpleRange-iterator
 */
QUnit.test('simpleRange iterator', function (assert) {
  const dataAccessor = function (offset) {
    return offset;
  };
  // test #0: default increment
  const test0Min = 0;
  const test0Max = 10;
  let i0Theo = test0Min;
  const iter0 = simpleRange(dataAccessor, test0Min, test0Max);
  let ival0 = iter0.next();
  while (!ival0.done) {
    assert.equal(ival0.value, i0Theo, '#0 iterator next');
    ival0 = iter0.next();
    ++i0Theo;
  }
  assert.equal(test0Max, i0Theo, '#0 iterator max');

  // test #1: specific increment
  const test1Min = 1;
  const test1Max = 21;
  const test1Incr = 2;
  let i1Theo = test1Min;
  const iter1 = simpleRange(
    dataAccessor, test1Min, test1Max, test1Incr);
  let ival1 = iter1.next();
  while (!ival1.done) {
    assert.equal(ival1.value, i1Theo, '#1 iterator next');
    ival1 = iter1.next();
    i1Theo += test1Incr;
  }
  assert.equal(test1Max, i1Theo, '#1 iterator max');
});

/**
 * Tests for {@link range}.
 *
 * @function module:tests/image~range-iterator-axial
 */
QUnit.test('Range iterator axial', function (assert) {
  // test data
  const testData0 = dataIterator0;
  const ncols = testData0.ncols;
  const nrows = testData0.nrows;
  const sliceSize = ncols * nrows;
  const dataAccessor = function (offset) {
    return testData0.buffer[offset];
  };

  // axial: xyz
  const getAxIter = function (reverse1, reverse2) {
    return function (index) {
      const min = index * sliceSize;
      const max = min + sliceSize;
      const start = reverse1 ? max - 1 : min;
      const maxIter = sliceSize;
      return range(dataAccessor,
        start, maxIter, 1, ncols, ncols, reverse1, reverse2);
    };
  };

  checkIterator(assert,
    getAxIter(false, false), testData0.valuesAx, 'axial');
  checkIterator(assert,
    getAxIter(true, false), testData0.valuesAxR1, 'axialR1');
  checkIterator(assert,
    getAxIter(false, true), testData0.valuesAxR2, 'axialR2');
  checkIterator(assert,
    getAxIter(true, true), testData0.valuesAxR1R2, 'axialR1R2');

  // axial: yxz
  const getAx2Iter = function (reverse1, reverse2) {
    return function (index) {
      const min = index * sliceSize;
      const max = min + sliceSize;
      const start = reverse1 ? max - 1 : min;
      const maxIter = sliceSize;
      return range(dataAccessor,
        start, maxIter, ncols, nrows, 1, reverse1, reverse2);
    };
  };

  checkIterator(assert,
    getAx2Iter(false, false), testData0.valuesAx2, 'axial2');
  checkIterator(assert,
    getAx2Iter(true, false), testData0.valuesAx2R1, 'axial2R1');
  checkIterator(assert,
    getAx2Iter(false, true), testData0.valuesAx2R2, 'axial2R2');
  checkIterator(assert,
    getAx2Iter(true, true), testData0.valuesAx2R1R2, 'axial2R1R2');
});

/**
 * Tests for {@link range}.
 *
 * @function module:tests/image~range-iterator-coronal
 */
QUnit.test('Range iterator coronal', function (assert) {
  // test data
  const testData0 = dataIterator0;
  const ncols = testData0.ncols;
  const nrows = testData0.nrows;
  const nslices = testData0.nslices;
  const sliceSize = ncols * nrows;
  const dataAccessor = function (offset) {
    return testData0.buffer[offset];
  };

  // coronal: xzy
  const getCoroIter = function (reverse1, reverse2) {
    return function (index) {
      const min = index * ncols;
      const max = min + (nslices - 1) * sliceSize + ncols;
      const start = reverse1 ? max - 1 : min;
      const maxIter = nslices * ncols;
      return range(dataAccessor,
        start, maxIter, 1, ncols, sliceSize, reverse1, reverse2);
    };
  };

  checkIterator(assert,
    getCoroIter(false, false), testData0.valuesCo, 'coronal');
  checkIterator(assert,
    getCoroIter(true, false), testData0.valuesCoR1, 'coronalR1');
  checkIterator(assert,
    getCoroIter(false, true), testData0.valuesCoR2, 'coronalR2');
  checkIterator(assert,
    getCoroIter(true, true), testData0.valuesCoR1R2, 'coronalR1R2');

  // coronal: zxy
  const getCoro2Iter = function (reverse1, reverse2) {
    return function (index) {
      const min = index * ncols;
      const max = min + (nslices - 1) * sliceSize + ncols;
      const start = reverse1 ? max - 1 : min;
      const maxIter = nslices * ncols;
      return range(dataAccessor,
        start, maxIter, sliceSize, nslices, 1, reverse1, reverse2);
    };
  };

  checkIterator(assert,
    getCoro2Iter(false, false), testData0.valuesCo2, 'coronal2');
  checkIterator(assert,
    getCoro2Iter(true, false), testData0.valuesCo2R1, 'coronal2R1');
  checkIterator(assert,
    getCoro2Iter(false, true), testData0.valuesCo2R2, 'coronal2R2');
  checkIterator(assert,
    getCoro2Iter(true, true), testData0.valuesCo2R1R2, 'coronal2R1R2');
});

/**
 * Tests for {@link range}.
 *
 * @function module:tests/image~range-iterator-sagittal
 */
QUnit.test('Range iterator sagittal', function (assert) {
  // test data
  const testData0 = dataIterator0;
  const ncols = testData0.ncols;
  const nrows = testData0.nrows;
  const nslices = testData0.nslices;
  const sliceSize = ncols * nrows;
  const dataAccessor = function (offset) {
    return testData0.buffer[offset];
  };

  // sagittal: yzx
  const getSagIter = function (reverse1, reverse2) {
    return function (index) {
      const min = index;
      const max = min + (nslices - 1) * sliceSize + ncols * (nrows - 1);
      const start = reverse1 ? max : min;
      const maxIter = nslices * nrows;
      return range(dataAccessor,
        start, maxIter, ncols, nrows, sliceSize, reverse1, reverse2);
    };
  };

  checkIterator(assert,
    getSagIter(false, false), testData0.valuesSa, 'sagittal');
  checkIterator(assert,
    getSagIter(true, false), testData0.valuesSaR1, 'sagittalR1');
  checkIterator(assert,
    getSagIter(false, true), testData0.valuesSaR2, 'sagittalR2');
  checkIterator(assert,
    getSagIter(true, true), testData0.valuesSaR1R2, 'sagittalR1R2');

  // sagittal: zyx
  const getSag2Iter = function (reverse1, reverse2) {
    return function (index) {
      const min = index;
      const max = min + (nslices - 1) * sliceSize + ncols * (nrows - 1);
      const start = reverse1 ? max : min;
      const maxIter = nslices * nrows;
      return range(dataAccessor,
        start, maxIter, sliceSize, nslices, ncols, reverse1, reverse2);
    };
  };

  checkIterator(assert,
    getSag2Iter(false, false), testData0.valuesSa2, 'sagittal2');
  checkIterator(assert,
    getSag2Iter(true, false), testData0.valuesSa2R1, 'sagittal2R1');
  checkIterator(assert,
    getSag2Iter(false, true), testData0.valuesSa2R2, 'sagittal2R2');
  checkIterator(assert,
    getSag2Iter(true, true), testData0.valuesSa2R1R2, 'sagittal2R1R2');
});

/**
 * Tests for {@link simpleRange3d}.
 *
 * @function module:tests/image~rgb-iterator
 */
QUnit.test('RGB iterator', function (assert) {
  const dataAccessor = function (offset) {
    return offset;
  };
  // test #0: default increment, default planar
  const test0Min = 0;
  const test0Size = 3;
  const test0Max = test0Min + 3 * test0Size;
  let i0Theo = test0Min;
  const iter0 = simpleRange3d(dataAccessor, test0Min, test0Max);
  let ival0 = iter0.next();
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
  const test1Min = 1;
  const test1Size = 6;
  const test1Max = test1Min + 3 * test1Size;
  const test1Incr = 2;
  let i1Theo = test1Min;
  const iter1 = simpleRange3d(
    dataAccessor, test1Min, test1Max, test1Incr);
  let ival1 = iter1.next();
  while (!ival1.done) {
    assert.equal(ival1.value[0], i1Theo, '#1 3d iterator value');
    assert.equal(ival1.value[1], i1Theo + 1, '#1 3d iterator value1');
    assert.equal(ival1.value[2], i1Theo + 2, '#1 3d iterator value2');
    i1Theo += test1Incr * 3;
    ival1 = iter1.next();
  }
  assert.equal(test1Max, i1Theo, '#1 3d iterator max');

  // test #2: default increment, planar
  const test2Min = 2;
  const test2Size = 6;
  const test2Max = test2Min + 3 * test2Size;
  let i2Theo = test2Min;
  const iter2 = simpleRange3d(
    dataAccessor, test2Min, test2Max, 1, true);
  let ival2 = iter2.next();
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
  const test3Min = 3;
  const test3Size = 6;
  const test3Max = test3Min + 3 * test3Size;
  const test3Incr = 2;
  let i3Theo = test3Min;
  const iter3 = simpleRange3d(
    dataAccessor, test3Min, test3Max, test3Incr, true);
  let ival3 = iter3.next();
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
 * Tests for {@link getSliceIterator}.
 *
 * @function module:tests/image~getSliceIterator
 */
QUnit.test('getSliceIterator', function (assert) {

  // test data
  const testData0 = dataIterator0;

  const imgSize00 = new Size([
    testData0.ncols, testData0.nrows, 1
  ]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry([imgOrigin0], imgSize00, imgSpacing0);
  imgGeometry0.appendOrigin(new Point3D(0, 0, 1), 1);
  imgGeometry0.appendOrigin(new Point3D(0, 0, 2), 2);
  imgGeometry0.appendOrigin(new Point3D(0, 0, 3), 3);
  const image0 = new Image(imgGeometry0, testData0.buffer);

  const isRescaled = false;
  let viewOrientation;

  // axial
  const getAxIter = function (orientation) {
    return function (index) {
      const position = new Index([0, 0, index]);
      return getSliceIterator(
        image0, position, isRescaled, orientation);
    };
  };

  // axial: xyz
  viewOrientation = getIdentityMat33();
  checkIterator(assert,
    getAxIter(viewOrientation), testData0.valuesAx, 'axial');
  // axial: yxz
  /* eslint-disable @stylistic/js/array-element-newline */
  viewOrientation = new Matrix33([
    0, 1, 0,
    1, 0, 0,
    0, 0, 1
  ]);
  /* eslint-enable @stylistic/js/array-element-newline */
  checkIterator(assert,
    getAxIter(viewOrientation), testData0.valuesAx2, 'axial2');

  // coronal
  const getCoroIter = function (orientation) {
    return function (index) {
      const position = new Index([0, index, 0]);
      return getSliceIterator(
        image0, position, isRescaled, orientation);
    };
  };

  // coronal: xzy
  viewOrientation = getMatrixFromName('coronal');
  checkIterator(assert,
    getCoroIter(viewOrientation), testData0.valuesCo, 'coronal');
  // coronal: zxy
  /* eslint-disable @stylistic/js/array-element-newline */
  viewOrientation = new Matrix33([
    0, 1, 0,
    0, 0, 1,
    1, 0, 0
  ]);
  /* eslint-enable @stylistic/js/array-element-newline */
  checkIterator(assert,
    getCoroIter(viewOrientation), testData0.valuesCo2, 'coronal2');

  // sagittal
  const getSagIter = function (orientation) {
    return function (index) {
      const position = new Index([index, 0, 0]);
      return getSliceIterator(
        image0, position, isRescaled, orientation);
    };
  };

  // sagittal: yzx
  viewOrientation = getMatrixFromName('sagittal');
  checkIterator(assert,
    getSagIter(viewOrientation), testData0.valuesSa, 'sagittal');
  // sagittal: zyx
  /* eslint-disable @stylistic/js/array-element-newline */
  viewOrientation = new Matrix33([
    0, 0, 1,
    0, 1, 0,
    1, 0, 0
  ]);
  /* eslint-enable @stylistic/js/array-element-newline */
  checkIterator(assert,
    getSagIter(viewOrientation), testData0.valuesSa2, 'sagittal2');
});

/**
 * Tests for {@link rangeRegion}.
 *
 * @function module:tests/image~region-iterator
 */
QUnit.test('Region iterator', function (assert) {
  const dataAccessor = function (offset) {
    return offset;
  };
  // test #0: simulate regular iterator
  const test0Min = 0;
  const test0Max = 10;
  const test0Incr = 1;
  const test0NCols = 3;
  const test0RowIncr = 0;
  let i0Theo = test0Min;
  const iter0 = rangeRegion(
    dataAccessor, test0Min, test0Max, test0Incr, test0NCols, test0RowIncr);
  let ival0 = iter0.next();
  while (!ival0.done) {
    assert.equal(ival0.value, i0Theo, '#0 iterator next');
    ival0 = iter0.next();
    ++i0Theo;
  }
  assert.equal(test0Max, i0Theo, '#0 iterator max');

  // test #1: with col/row
  const test1Min = 0;
  const test1Max = 10;
  const test1Incr = 1;
  const test1NCols = 2;
  const test1RowIncr = 1;
  let i1Theo = test1Min;
  const iter1 = rangeRegion(
    dataAccessor, test1Min, test1Max, test1Incr, test1NCols, test1RowIncr);
  let ival1 = iter1.next();
  let countCol = 0;
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
