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
  var center = new dwv.math.Point2D(0, 0);
  var c0 = new dwv.math.Circle(center, 2);
  // getCenter
  assert.equal(c0.getCenter(), center, 'getCenter');
  // getRadius
  assert.equal(c0.getRadius(), 2, 'getRadius');
  // getSurface
  assert.equal(c0.getSurface(), Math.PI * 2 * 2, 'getSurface');
  // equals: true
  assert.equal(c0.getWorldSurface(0.5, 0.5), Math.PI, 'getWorldSurface');
});
