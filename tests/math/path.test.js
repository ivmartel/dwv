import {Point2D} from '../../src/math/point';
import {Path} from '../../src/math/path';

/**
 * Tests for the 'math/path.js' file.
 */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link Path}.
 *
 * @function module:tests/math~path-class
 */
QUnit.test('Path class - #DWV-REQ-UI-07-004 Draw free hand', function (assert) {
  const path0 = new Path();
  // getLength
  assert.equal(path0.getLength(), 0, 'getLength');
  // add a point
  const p0 = new Point2D(0, 0);
  path0.addPoint(p0);
  // getLength
  assert.equal(path0.getLength(), 1, 'getLength');
  // add another point
  const p1 = new Point2D(-4, -4);
  path0.addPoint(p1);
  // getPoint first
  assert.equal(path0.getPoint(0), p0, 'getPoint first');
  // getPoint second
  assert.equal(path0.getPoint(1), p1, 'getPoint second');
  const p2 = new Point2D(1, 1);
  const p3 = new Point2D(1, 2);
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
  const p10 = new Point2D(1, 1);
  assert.throws(function () {
    path0.addControlPoint(p10);
  },
  new Error('Cannot mark a non registered point as control point.'),
  'bad control point');

  // append path
  const path1 = new Path();
  const p4 = new Point2D(1, 3);
  path1.addPoint(p4);
  path0.appenPath(path1);
  assert.equal(path0.getPoint(4), p4, 'appenPath getPoint fifth');
});
