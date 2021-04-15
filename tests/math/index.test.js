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
  var i0 = new dwv.math.Index(1, 2, 3);
  // getX
  assert.equal(i0.getI(), 1, 'getI');
  // getY
  assert.equal(i0.getJ(), 2, 'getJ');
  // getZ
  assert.equal(i0.getK(), 3, 'getK');
  // can't modify internal i
  i0.i = 3;
  assert.equal(i0.getI(), 1, 'getI after .i');
  // can't modify internal j
  i0.j = 3;
  assert.equal(i0.getJ(), 2, 'getJ after .j');
  // can't modify internal k
  i0.k = 3;
  assert.equal(i0.getK(), 3, 'getK after .k');
  // equals: true
  var i1 = new dwv.math.Index(1, 2, 3);
  assert.equal(i0.equals(i1), true, 'equals true');
  // equals: false
  assert.equal(i0.equals(null), false, 'null equals false');
  var i2 = new dwv.math.Index(3, 2, 1);
  assert.equal(i0.equals(i2), false, 'equals false');
  // to string
  assert.equal(i0.toString(), '(1, 2, 3)', 'toString');
});
