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
  var p2 = new dwv.math.Point2D(1, 1);
  var p3 = new dwv.math.Point2D(1, 2);
  path0.addPoints([p2, p3]);
  assert.equal(path0.getPoint(0), p0, 'addPoints getPoint first');
  assert.equal(path0.getPoint(1), p1, 'addPoints getPoint second');
  assert.equal(path0.getPoint(2), p2, 'addPoints getPoint third');
  assert.equal(path0.getPoint(3), p3, 'addPoints getPoint fourth');

  // add first point a control point
  path0.addControlPoint(p0);
  // check if control point
  assert.equal(path0.isControlPoint(p0), 1, 'isControlPoint');
  // bad control point
  var p10 = new dwv.math.Point2D(1, 1);
  assert.throws(function () {
    path0.addControlPoint(p10);
  },
  new Error('Cannot mark a non registered point as control point.'),
  'bad control point');

  // append path
  var path1 = new dwv.math.Path();
  var p4 = new dwv.math.Point2D(1, 3);
  path1.addPoint(p4);
  path0.appenPath(path1);
  assert.equal(path0.getPoint(4), p4, 'appenPath getPoint fifth');
});
