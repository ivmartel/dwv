import {describe, test, assert} from 'vitest';
import {Size} from '../../src/image/size.js';
import {Index} from '../../src/math/index.js';
import {Point} from '../../src/math/point.js';

/**
 * Tests for the 'image/size.js' file.
 */

describe('image', () => {

  /**
   * Tests for {@link Size}.
   *
   * @function module:tests/image~size-class
   */
  test('Size class', () => {
    // error cases
    assert.throws(function () {
      new Size();
    },
    Error,
    'Cannot create size with no values.',
    'size with undef values array.');
    assert.throws(function () {
      new Size(null);
    },
    Error,
    'Cannot create size with no values.',
    'size with null values array.');
    assert.throws(function () {
      new Size([]);
    },
    Error,
    'Cannot create size with empty values.',
    'size with empty values array.');
    assert.throws(function () {
      new Size([2, 2, 0]);
    },
    Error,
    'Cannot create size with non number or zero values.',
    'size with zero values.');
    assert.throws(function () {
      new Size([2, undefined, 2]);
    },
    Error,
    'Cannot create size with non number or zero values.',
    'size with undef values.');
    assert.throws(function () {
      new Size([2, 'a', 2]);
    },
    Error,
    'Cannot create size with non number or zero values.',
    'size with string values.');

    const size0 = new Size([2, 3, 4]);
    // length
    assert.equal(size0.length(), 3, 'length');
    // test its values
    assert.equal(size0.get(0), 2, 'get 0');
    assert.equal(size0.get(1), 3, 'get 1');
    assert.equal(size0.get(2), 4, 'get 2');
    assert.equal(size0.get(3), undefined, 'get 3 (above dim)');
    // dim size
    assert.equal(size0.getDimSize(0), 1, 'getDimSize 0');
    assert.equal(size0.getDimSize(1), 2, 'getDimSize 1');
    assert.equal(size0.getDimSize(2), 6, 'getDimSize 2');
    assert.equal(size0.getDimSize(3), 24, 'getDimSize 3');
    assert.equal(size0.getTotalSize(), 24, 'getTotalSize');
    assert.equal(size0.getDimSize(4), null, 'getDimSize 4 (above dim)');

    // equality
    assert.equal(size0.equals(null), false, 'equals null false');
    assert.equal(size0.equals(), false, 'equals undefined false');
    const size10 = new Size([2, 3]);
    assert.equal(size0.equals(size10), false, 'equals different length false');

    assert.equal(size0.equals(size0), true, 'equals self true');
    const size11 = new Size([2, 3, 4]);
    assert.equal(size0.equals(size11), true, 'equals true');
    const size12 = new Size([3, 3, 4]);
    assert.equal(size0.equals(size12), false, 'equals false');

    // is in bounds
    let index0 = new Index([0, 0, 0]);
    assert.equal(size0.isInBounds(index0), true, 'isInBounds 0,0,0');
    index0 = new Index([0, 0]);
    assert.equal(size0.isInBounds(index0), false, 'isInBounds 0,0');
    index0 = new Index([1, 2, 3]);
    assert.equal(size0.isInBounds(index0), true, 'isInBounds max');
    index0 = new Index([2, 3, 4]);
    assert.equal(size0.isInBounds(index0), false, 'isInBounds too big');
    index0 = new Index([-1, 2, 3]);
    assert.equal(size0.isInBounds(index0), false, 'isInBounds too small');
    // with dirs
    index0 = new Index([0, 0, 0]);
    assert.equal(size0.isInBounds(index0, [0, 1]), true,
      'isInBounds [0, 1] 0,0,0');
    assert.equal(size0.isInBounds(index0, [1, 2]), true,
      'isInBounds [1, 2] 0,0,0');
    assert.throws(function () {
      size0.isInBounds(index0, [1, 3]);
    },
    Error,
    'Wrong input dir value: 3',
    'isInBounds bad dir');
    index0 = new Index([2, 3, 4]);
    assert.equal(size0.isInBounds(index0, [1, 2]), false,
      'isInBounds [0, 1] 2,3,4');

    // can scroll
    const size20 = new Size([2, 1, 2]);
    assert.equal(size20.moreThanOne(0), true, 'moreThanOne 20-0');
    assert.equal(size20.moreThanOne(1), false, 'moreThanOne 20-1');
    assert.equal(size20.moreThanOne(2), true, 'moreThanOne 20-2');
    assert.equal(size20.moreThanOne(3), false, 'moreThanOne 20-3');

    // get 2D
    assert.deepEqual(size0.get2D(), {x: 2, y: 3}, 'get2D 2,3,4');

  });

  /**
   * Tests for {@link Size.indexToOffset}.
   *
   * @function module:tests/image~index-to-and-from-offset
   */
  test('Index to and from offset', () => {
    const size00 = new Size([4, 3, 2]);
    const testData00 = [
      {values: [0, 0, 0], offset: 0},
      {values: [1, 0, 0], offset: 1},
      {values: [2, 0, 0], offset: 2},
      {values: [3, 0, 0], offset: 3},
      {values: [0, 1, 0], offset: 4},
      {values: [1, 1, 0], offset: 5},
      {values: [2, 1, 0], offset: 6},
      {values: [3, 1, 0], offset: 7},
      {values: [0, 2, 0], offset: 8},
      {values: [1, 2, 0], offset: 9},
      {values: [2, 2, 0], offset: 10},
      {values: [3, 2, 0], offset: 11},
      {values: [0, 0, 1], offset: 12},
      {values: [1, 0, 1], offset: 13},
      {values: [2, 0, 1], offset: 14},
      {values: [3, 0, 1], offset: 15},
      {values: [0, 1, 1], offset: 16},
      {values: [1, 1, 1], offset: 17},
      {values: [2, 1, 1], offset: 18},
      {values: [3, 1, 1], offset: 19},
      {values: [0, 2, 1], offset: 20},
      {values: [1, 2, 1], offset: 21},
      {values: [2, 2, 1], offset: 22},
      {values: [3, 2, 1], offset: 23}
    ];
    for (let i = 0; i < testData00.length; ++i) {
      const values = testData00[i].values;
      const index = new Index(values);
      const offset = testData00[i].offset;
      assert.equal(
        size00.indexToOffset(index), offset, `indexToOffset #${i}`);
      assert.ok(
        size00.offsetToIndex(offset).equals(index), `offsetToIndex #${i}`);
      // index wiht less dims than size
      if (values[2] === 0) {
        const index1 = new Index(values.slice(0, 2));
        assert.equal(
          size00.indexToOffset(index1), offset, `indexToOffset small #${i}`);
      }
    }

    // test indexToOffset with start
    const size10 = new Size([5, 4, 3, 2]);
    const index10 = new Index([0, 0, 0, 0]);

    // no error
    assert.equal(size10.indexToOffset(index10, 2), 0, 'indexToOffset start #0');
    const index03 = new Index([0, 0, 1, 0]);
    assert.equal(size10.indexToOffset(index03, 2), 1, 'indexToOffset start #1');
    const index04 = new Index([0, 0, 0, 1]);
    assert.equal(size10.indexToOffset(index04, 2), 3, 'indexToOffset start #2');
    const index05 = new Index([0, 0, 2, 1]);
    assert.equal(size10.indexToOffset(index05, 2), 5, 'indexToOffset start #3');
    const index06 = new Index([0, 0, 2, 1]);
    assert.equal(size10.indexToOffset(index06, 3), 1, 'indexToOffset start #4');
    const index07 = new Index([0, 0, 2]);
    assert.equal(size10.indexToOffset(index07, 2), 2, 'indexToOffset start #5');

    // error: start too big
    assert.throws(function () {
      size10.indexToOffset(index10, 4);
    },
    Error,
    'Invalid start value for indexToOffset',
    'indexToOffset start too big');
    // error: index too many dimensions
    const index20 = new Index([0, 0, 0, 0, 0]);
    assert.throws(function () {
      size10.indexToOffset(index20, 2);
    },
    Error,
    'Incompatible index and size length',
    'indexToOffset start index bad length');

    const index21 = new Index([5, 0, 0, 0]);
    assert.equal(
      size10.indexToOffset(index21, 0),
      -1,
      'indexToOffset bounds #0'
    );
    const index22 = new Index([0, 0, 3, 2]);
    assert.equal(
      size10.indexToOffset(index22, 2),
      -1,
      'indexToOffset bounds #1'
    );
    const index23 = new Index([0, 0, 3, 2]);
    assert.equal(
      size10.indexToOffset(index23, 3),
      -1,
      'indexToOffset bounds #2'
    );
  });

  /**
   * Tests for {@link Size.normalisePoint}.
   *
   * @function module:tests/image~index-normalise-point
   */
  test('Index normalise Point', () => {
    const size00 = new Size([4, 3, 2]);

    // same number of dims
    const test00 = new Point([1, 2, 3]);
    const testRes00 = size00.normalisePoint(test00);
    const testRef00 = new Point([1, 2, 3]);
    assert.ok(testRes00.equals(testRef00), 'normalise point #0');

    // dims -1
    const test01 = new Point([1, 2]);
    const testRes01 = size00.normalisePoint(test01);
    const testRef01 = new Point([1, 2, 0]);
    assert.ok(testRes01.equals(testRef01), 'normalise point #1');

    // dims -2
    const test02 = new Point([1]);
    const testRes02 = size00.normalisePoint(test02);
    const testRef02 = new Point([1, 0, 0]);
    assert.ok(testRes02.equals(testRef02), 'normalise point #2');

    // dims +1
    const test03 = new Point([1, 2, 3, 4]);
    const testRes03 = size00.normalisePoint(test03);
    const testRef03 = new Point([1, 2, 3]);
    assert.ok(testRes03.equals(testRef03), 'normalise point #3');

    const extra10 = new Point([4, 5, 6]);

    // same number of dims + extra
    const test10 = new Point([1, 2, 3]);
    const testRes10 = size00.normalisePoint(test10, extra10);
    const testRef10 = new Point([1, 2, 3]);
    assert.ok(testRes10.equals(testRef10), 'normalise point with extra #0');

    // dims -1 + extra
    const test11 = new Point([1, 2]);
    const testRes11 = size00.normalisePoint(test11, extra10);
    const testRef11 = new Point([1, 2, 6]);
    assert.ok(testRes11.equals(testRef11), 'normalise point with extra #1');

    // dims -2 + extra
    const test12 = new Point([1]);
    const testRes12 = size00.normalisePoint(test12, extra10);
    const testRef12 = new Point([1, 5, 6]);
    assert.ok(testRes12.equals(testRef12), 'normalise point with extra #2');

    // dims +1 + extra
    const test13 = new Point([1, 2, 3, 7]);
    const testRes13 = size00.normalisePoint(test13, extra10);
    const testRef13 = new Point([1, 2, 3]);
    assert.ok(testRes13.equals(testRef13), 'normalise point with extra #3');
  });

  /**
   * Tests for {@link Size.normaliseIndex}.
   *
   * @function module:tests/image~size-normalise-index
   */
  test('Size normalise Index', () => {
    const size00 = new Size([4, 3, 2]);

    // same number of dims
    const test00 = new Index([1, 2, 3]);
    const testRes00 = size00.normaliseIndex(test00);
    const testRef00 = new Index([1, 2, 3]);
    assert.ok(testRes00.equals(testRef00), 'normalise index #0');

    // dims -1
    const test01 = new Index([1, 2]);
    const testRes01 = size00.normaliseIndex(test01);
    const testRef01 = new Index([1, 2, 0]);
    assert.ok(testRes01.equals(testRef01), 'normalise index #1');

    // dims -2
    const test02 = new Index([1]);
    const testRes02 = size00.normaliseIndex(test02);
    const testRef02 = new Index([1, 0, 0]);
    assert.ok(testRes02.equals(testRef02), 'normalise index #2');

    // dims +1
    const test03 = new Index([1, 2, 3, 4]);
    const testRes03 = size00.normaliseIndex(test03);
    const testRef03 = new Index([1, 2, 3]);
    assert.ok(testRes03.equals(testRef03), 'normalise index #3');

    const extra10 = new Index([4, 5, 6]);

    // same number of dims + extra
    const test10 = new Index([1, 2, 3]);
    const testRes10 = size00.normaliseIndex(test10, extra10);
    const testRef10 = new Index([1, 2, 3]);
    assert.ok(testRes10.equals(testRef10), 'normalise index with extra #0');

    // dims -1 + extra
    const test11 = new Index([1, 2]);
    const testRes11 = size00.normaliseIndex(test11, extra10);
    const testRef11 = new Index([1, 2, 6]);
    assert.ok(testRes11.equals(testRef11), 'normalise index with extra #1');

    // dims -2 + extra
    const test12 = new Index([1]);
    const testRes12 = size00.normaliseIndex(test12, extra10);
    const testRef12 = new Index([1, 5, 6]);
    assert.ok(testRes12.equals(testRef12), 'normalise index with extra #2');

    // dims +1 + extra
    const test13 = new Index([1, 2, 3, 7]);
    const testRes13 = size00.normaliseIndex(test13, extra10);
    const testRef13 = new Index([1, 2, 3]);
    assert.ok(testRes13.equals(testRef13), 'normalise index with extra #3');
  });

});
