/**
 * Tests for the 'math/shapes.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('shape-ellipse');

/**
 * Tests for {@link dwv.math.Ellipse}.
 *
 * @function module:tests/math~Ellipse
 */
QUnit.test('Test Ellipse.', function (assert) {
  var center = new dwv.math.Point2D(0, 0);
  var e0 = new dwv.math.Ellipse(center, 2, 4);
  // getCenter
  assert.equal(e0.getCenter(), center, 'getCenter');
  // getA
  assert.equal(e0.getA(), 2, 'getA');
  // getB
  assert.equal(e0.getB(), 4, 'getB');
  // getSurface
  assert.equal(e0.getSurface(), Math.PI * 2 * 4, 'getSurface');
  // equals: true
  assert.equal(e0.getWorldSurface(0.5, 0.25), Math.PI, 'getWorldSurface');
});
