/**
 * Tests for the 'math/shapes.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('shape-path');

/**
 * Tests for {@link dwv.math.Path}.
 *
 * @function module:tests/math~Path
 */
QUnit.test('Test Path.', function (assert) {
  var path0 = new dwv.math.Path();
  // getLength
  assert.equal(path0.getLength(), 0, 'getLength');
  // add a point
  var p0 = new dwv.math.Point2D(0, 0);
  path0.addPoint(p0);
  // getLength
  assert.equal(path0.getLength(), 1, 'getLength');
  // add another point
  var p1 = new dwv.math.Point2D(-4, -4);
  path0.addPoint(p1);
  // getPoint first
  assert.equal(path0.getPoint(0), p0, 'getPoint first');
  // getPoint second
  assert.equal(path0.getPoint(1), p1, 'getPoint second');
  // add first point a control point
  path0.addControlPoint(p0);
  // check if control point
  assert.equal(path0.isControlPoint(p0), 1, 'isControlPoint');
});
