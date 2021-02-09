/**
 * Tests for the 'math/shapes.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('shape-circle');

/**
 * Tests for {@link dwv.math.Circle}.
 *
 * @function module:tests/math~Circle
 */
QUnit.test('Test Circle.', function (assert) {
  var center0 = new dwv.math.Point2D(0, 0);
  var c0 = new dwv.math.Circle(center0, 2);
  // getCenter
  assert.equal(c0.getCenter(), center0, 'getCenter');
  // getRadius
  assert.equal(c0.getRadius(), 2, 'getRadius');

  // equals: true
  var c1 = new dwv.math.Circle(center0, 2);
  assert.ok(c0.equals(c1), 'equal circles');
  // equals: false radius
  var c20 = new dwv.math.Circle(center0, 3);
  assert.notOk(c0.equals(c20), 'non equal circles radius');
  // equals: false center
  var center21 = new dwv.math.Point2D(1, 1);
  var c21 = new dwv.math.Circle(center21, 2);
  assert.notOk(c0.equals(c21), 'non equal circles center');

  // getSurface
  assert.equal(c0.getSurface(), Math.PI * 2 * 2, 'getSurface');
  // getWorldSurface
  assert.equal(c0.getWorldSurface(0.5, 0.5), Math.PI, 'getWorldSurface');
});
