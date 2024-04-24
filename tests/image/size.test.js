import {Index} from '../../src/math/index';
import {Size} from '../../src/image/size';

/**
 * Tests for the 'image/size.js' file.
 */

/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link Size}.
 *
 * @function module:tests/image~size-class
 */
QUnit.test('Size class', function (assert) {
  // error cases
  assert.throws(function () {
    new Size();
  },
  new Error('Cannot create size with no values.'),
  'size with undef values array.');
  assert.throws(function () {
    new Size(null);
  },
  new Error('Cannot create size with no values.'),
  'size with null values array.');
  assert.throws(function () {
    new Size([]);
  },
  new Error('Cannot create size with empty values.'),
  'size with empty values array.');
  assert.throws(function () {
    new Size([2, 2, 0]);
  },
  new Error('Cannot create size with non number or zero values.'),
  'size with zero values.');
  assert.throws(function () {
    new Size([2, undefined, 2]);
  },
  new Error('Cannot create size with non number or zero values.'),
  'size with undef values.');
  assert.throws(function () {
    new Size([2, 'a', 2]);
  },
  new Error('Cannot create size with non number or zero values.'),
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
  new Error('Wrong input dir value: 3'),
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
QUnit.test('Index to and from offset', function (assert) {
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
    const index = new Index(testData00[i].values);
    const offset = testData00[i].offset;
    assert.equal(
      size00.indexToOffset(index), offset, 'indexToOffset #' + i);
    assert.ok(
      size00.offsetToIndex(offset).equals(index), 'offsetToIndex #' + i);
  }

  // test indexToOffset with start
  const size01 = new Size([5, 4, 3, 2]);
  const index01 = new Index([0, 0, 0, 0]);
  // error: start too big
  assert.throws(function () {
    size01.indexToOffset(index01, 4);
  },
  new Error('Invalid start value for indexToOffset'),
  'indexToOffset start too big');
  // error: index bad length
  const index02 = new Index([0, 0, 0]);
  assert.throws(function () {
    size01.indexToOffset(index02, 2);
  },
  new Error('Incompatible index and size length'),
  'indexToOffset start index bad length');
  // no error
  assert.equal(size01.indexToOffset(index01, 2), 0, 'indexToOffset start #0');
  const index03 = new Index([0, 0, 1, 0]);
  assert.equal(size01.indexToOffset(index03, 2), 1, 'indexToOffset start #1');
  const index04 = new Index([0, 0, 0, 1]);
  assert.equal(size01.indexToOffset(index04, 2), 3, 'indexToOffset start #2');
  const index05 = new Index([0, 0, 3, 2]);
  assert.equal(size01.indexToOffset(index05, 2), 9, 'indexToOffset start #3');
  const index06 = new Index([0, 0, 3, 2]);
  assert.equal(size01.indexToOffset(index06, 3), 2, 'indexToOffset start #4');
});
