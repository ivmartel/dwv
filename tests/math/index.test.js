/**
 * Tests for the 'math/index.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('index');

/**
 * Tests for {@link dwv.math.Index}.
 *
 * @function module:tests/math~Index
 */
QUnit.test('Test Index.', function (assert) {
  // error cases
  assert.throws(function () {
    new dwv.math.Index();
  },
  new Error('Cannot create index with no values.'),
  'index with undef values array.');
  assert.throws(function () {
    new dwv.math.Index(null);
  },
  new Error('Cannot create index with no values.'),
  'index with null values array.');
  assert.throws(function () {
    new dwv.math.Index([]);
  },
  new Error('Cannot create index with empty values.'),
  'index with empty values array.');
  assert.throws(function () {
    new dwv.math.Index([2, undefined, 2]);
  },
  new Error('Cannot create index with non number values.'),
  'index with undef values.');
  assert.throws(function () {
    new dwv.math.Index([2, 'a', 2]);
  },
  new Error('Cannot create index with non number values.'),
  'index with string values.');

  var i0 = new dwv.math.Index([1, 2, 3]);
  // getX
  assert.equal(i0.get(0), 1, 'get0');
  // getY
  assert.equal(i0.get(1), 2, 'get1');
  // getZ
  assert.equal(i0.get(2), 3, 'get2');

  // equals: true
  var i10 = new dwv.math.Index([1, 2, 3]);
  assert.equal(i10.equals(i10), true, 'equals true');
  // equals: false
  assert.equal(i10.equals(null), false, 'null equals false');
  var i11 = new dwv.math.Index([1, 2]);
  assert.equal(i10.equals(i11), false, 'length equals false');
  var i12 = new dwv.math.Index([3, 2, 1]);
  assert.equal(i10.equals(i12), false, 'values equals false');

  // to string
  var i20 = new dwv.math.Index([1, 2, 3]);
  assert.equal(i20.toString(), '(1,2,3)', 'toString');

  // warning: values are NOT cloned. So this can happen:
  var val3 = [1, 2, 3];
  var i30 = new dwv.math.Index(val3);
  assert.equal(i30.get(0), 1, '[clone] get0');
  val3[0] = 4;
  assert.equal(i30.get(0), 4, '[clone] get0');

  // addition
  var i40 = new dwv.math.Index([1, 2, 3]);
  var i41 = new dwv.math.Index([2, 3, 4]);
  var i42 = i40.add(i41);
  assert.equal(i42.get(0), 3, '[add] get0');
  assert.equal(i42.get(1), 5, '[add] get1');
  assert.equal(i42.get(2), 7, '[add] get2');
});

/**
 * Tests for {@link dwv.math.Index} to and from stringId conversion.
 *
 * @function module:tests/math~Index
 */
QUnit.test('Test Index stringId.', function (assert) {
  var i00 = new dwv.math.Index([1, 2, 3]);
  var i00strId = '#0-1_#1-2_#2-3';
  assert.equal(i00.toStringId(), i00strId, 'toStringId #00');
  assert.ok(dwv.math.getFromStringId(i00strId).equals(i00),
    'getFromStringId #00');

  var i01 = new dwv.math.Index([0, 2, 3]);
  var i01strId = '#1-2_#2-3';
  assert.equal(i01.toStringId(1), i01strId, 'toStringId #01');
  assert.ok(dwv.math.getFromStringId(i01strId).equals(i01),
    'getFromStringId #01');

  var i02 = new dwv.math.Index([0, 0, 3]);
  var i02strId = '#2-3';
  assert.equal(i02.toStringId(2), i02strId, 'toStringId #02');
  assert.ok(dwv.math.getFromStringId(i02strId).equals(i02),
    'getFromStringId #02');

  // error case
  var i10 = new dwv.math.Index([0, 0]);
  assert.throws(function () {
    i10.toStringId(2);
  },
  new Error('Minimum dim cannot be equal or greater than length.'),
  'toStringId error');

});
