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
  var center0 = new dwv.math.Point2D(0, 0);
  var e0 = new dwv.math.Ellipse(center0, 2, 4);
  // getCenter
  assert.equal(e0.getCenter(), center0, 'getCenter');
  // getA
  assert.equal(e0.getA(), 2, 'getA');
  // getB
  assert.equal(e0.getB(), 4, 'getB');

  // equals: true
  var e1 = new dwv.math.Ellipse(center0, 2, 4);
  assert.ok(e0.equals(e1), 'equal ellipses');
  // equals: false a
  var e20 = new dwv.math.Ellipse(center0, 3, 4);
  assert.notOk(e0.equals(e20), 'non equal ellipses a');
  // equals: false b
  var e21 = new dwv.math.Ellipse(center0, 2, 5);
  assert.notOk(e0.equals(e21), 'non equal ellipses b');
  // equals: false radius
  var center22 = new dwv.math.Point2D(1, 1);
  var e22 = new dwv.math.Ellipse(center22, 2, 4);
  assert.notOk(e0.equals(e22), 'non equal ellipses center');

  // getSurface
  assert.equal(e0.getSurface(), Math.PI * 2 * 4, 'getSurface');
  // equals: true
  assert.equal(e0.getWorldSurface(0.5, 0.25), Math.PI, 'getWorldSurface');
});
