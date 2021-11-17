/**
 * Tests for the 'image/size.js' file.
 */
/** @module tests/image */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link dwv.image.Size}.
 *
 * @function module:tests/image~size
 */
QUnit.test('Test Size.', function (assert) {
  // error cases
  assert.throws(function () {
    new dwv.image.Size();
  },
  new Error('Cannot create size with no values.'),
  'size with undef values array.');
  assert.throws(function () {
    new dwv.image.Size(null);
  },
  new Error('Cannot create size with no values.'),
  'size with null values array.');
  assert.throws(function () {
    new dwv.image.Size([]);
  },
  new Error('Cannot create size with empty values.'),
  'size with empty values array.');
  assert.throws(function () {
    new dwv.image.Size([2, 2, 0]);
  },
  new Error('Cannot create size with non number or zero values.'),
  'size with zero values.');
  assert.throws(function () {
    new dwv.image.Size([2, undefined, 2]);
  },
  new Error('Cannot create size with non number or zero values.'),
  'size with undef values.');
  assert.throws(function () {
    new dwv.image.Size([2, 'a', 2]);
  },
  new Error('Cannot create size with non number or zero values.'),
  'size with string values.');

  var size0 = new dwv.image.Size([2, 3, 4]);
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
  var size10 = new dwv.image.Size([2, 3]);
  assert.equal(size0.equals(size10), false, 'equals different length false');

  assert.equal(size0.equals(size0), true, 'equals self true');
  var size11 = new dwv.image.Size([2, 3, 4]);
  assert.equal(size0.equals(size11), true, 'equals true');
  var size12 = new dwv.image.Size([3, 3, 4]);
  assert.equal(size0.equals(size12), false, 'equals false');

  // is in bounds
  var index0 = new dwv.math.Index([0, 0, 0]);
  assert.equal(size0.isInBounds(index0), true, 'isInBounds 0,0,0');
  index0 = new dwv.math.Index([0, 0]);
  assert.equal(size0.isInBounds(index0), false, 'isInBounds 0,0');
  index0 = new dwv.math.Index([1, 2, 3]);
  assert.equal(size0.isInBounds(index0), true, 'isInBounds max');
  index0 = new dwv.math.Index([2, 3, 4]);
  assert.equal(size0.isInBounds(index0), false, 'isInBounds too big');
  index0 = new dwv.math.Index([-1, 2, 3]);
  assert.equal(size0.isInBounds(index0), false, 'isInBounds too small');

  // can scroll
  var size20 = new dwv.image.Size([2, 1, 2]);
  assert.equal(size20.moreThanOne(0), true, 'moreThanOne 20-0');
  assert.equal(size20.moreThanOne(1), false, 'moreThanOne 20-1');
  assert.equal(size20.moreThanOne(2), true, 'moreThanOne 20-2');
  assert.equal(size20.moreThanOne(3), false, 'moreThanOne 20-3');

  // get 2D
  assert.deepEqual(size0.get2D(), {x: 2, y: 3}, 'get2D 2,3,4');

});

/**
 * Tests for {@link dwv.image.Size.indexToOffset}.
 *
 * @function module:tests/image~indexToOffset
 */
QUnit.test('Test index to and from offset.', function (assert) {
  var size0 = new dwv.image.Size([4, 4, 1]);

  var testData = [
    {vals: [0, 0, 0], offset: 0},
    {vals: [1, 0, 0], offset: 1},
    {vals: [2, 0, 0], offset: 2},
    {vals: [3, 0, 0], offset: 3},
    {vals: [0, 1, 0], offset: 4},
    {vals: [1, 1, 0], offset: 5},
    {vals: [2, 1, 0], offset: 6},
    {vals: [3, 1, 0], offset: 7},
    {vals: [0, 2, 0], offset: 8},
    {vals: [1, 2, 0], offset: 9},
    {vals: [2, 2, 0], offset: 10},
    {vals: [3, 2, 0], offset: 11},
    {vals: [0, 3, 0], offset: 12},
    {vals: [1, 3, 0], offset: 13},
    {vals: [2, 3, 0], offset: 14},
    {vals: [3, 3, 0], offset: 15}
  ];
  for (var i = 0; i < testData.length; ++i) {
    var index = new dwv.math.Index(testData[i].vals);
    var offset = testData[i].offset;
    assert.equal(
      size0.indexToOffset(index), offset, 'indexToOffset #' + i);
    assert.ok(
      size0.offsetToIndex(offset).equals(index), 'offsetToIndex #' + i);
  }
});
