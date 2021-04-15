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
