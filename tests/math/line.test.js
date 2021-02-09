/**
 * Tests for the 'math/shapes.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('shape-line');

/**
 * Tests for {@link dwv.math.Line}.
 *
 * @function module:tests/math~Line
 */
QUnit.test('Test Line.', function (assert) {
  var p0 = new dwv.math.Point2D(0, 0);
  var p1 = new dwv.math.Point2D(0, -5);
  var l0 = new dwv.math.Line(p0, p1);
  // getBegin
  assert.equal(l0.getBegin(), p0, 'getBegin');
  // getEnd
  assert.equal(l0.getEnd(), p1, 'getEnd');
  // getLength
  assert.equal(l0.getLength(), 5, 'getLength');
  // getWorldLength
  assert.equal(l0.getWorldLength(0.5, 0.5), 2.5, 'getWorldLength');
  // getMidpoint
  var pMid = new dwv.math.Point2D(0, -2); // rounded...
  assert.equal(l0.getMidpoint().equals(pMid), true, 'getMidpoint');
  // slope
  var p20 = new dwv.math.Point2D(1, 1);
  var l10 = new dwv.math.Line(p0, p20);
  assert.equal(l10.getSlope(), 1, 'getSlope');
  var p21 = new dwv.math.Point2D(1, -1);
  var l11 = new dwv.math.Line(p0, p21);
  assert.equal(l11.getSlope(), -1, 'getSlope (negative)');
  var p3 = new dwv.math.Point2D(1, 0);
  var l2 = new dwv.math.Line(p0, p3);
  assert.equal(l2.getSlope(), 0, 'getSlope (horizontal)');
  assert.equal(l0.getSlope(), -Infinity, 'getSlope (vertical)');
  // inclination
  assert.equal(l10.getInclination(), 135, 'Inclination'); // 180 - 45
  assert.equal(l11.getInclination(), 225, 'Inclination (negative)'); // 180 + 45
  assert.equal(l2.getInclination(), 180, 'Inclination (horizontal)');
  assert.equal(l0.getInclination(), 270, 'Inclination (vertical)'); // 180 + 90
  // angle
  assert.equal(dwv.math.getAngle(l10, l11), 90, 'getAngle');
  var p4 = new dwv.math.Point2D(0, -1);
  var p5 = new dwv.math.Point2D(1, -1);
  var l3 = new dwv.math.Line(p4, p5);
  assert.equal(
    dwv.math.getAngle(l2, l3),
    180,
    'getAngle (horizontal parallel)');
  var l4 = new dwv.math.Line(p3, p21);
  assert.equal(dwv.math.getAngle(l0, l4), 180, 'getAngle (vertical parallel)');
  // intercept
  assert.equal(l10.getIntercept(), 0, 'getIntercept (zero)');
  var p6 = new dwv.math.Point2D(0, 1);
  var p7 = new dwv.math.Point2D(1, 2);
  var l5 = new dwv.math.Line(p6, p7);
  assert.equal(l5.getIntercept(), 1, 'getIntercept');
  var p8 = new dwv.math.Point2D(0, -1);
  var p9 = new dwv.math.Point2D(1, -2);
  var l6 = new dwv.math.Line(p8, p9);
  assert.equal(l6.getIntercept(), -1, 'getIntercept (negative)');
  var p10 = new dwv.math.Point2D(0, 1);
  var p11 = new dwv.math.Point2D(-1, 2);
  var l7 = new dwv.math.Line(p10, p11);
  assert.equal(l7.getIntercept(), 1, 'getIntercept (back)');
  var p12 = new dwv.math.Point2D(0, -1);
  var p13 = new dwv.math.Point2D(-1, -2);
  var l8 = new dwv.math.Line(p12, p13);
  assert.equal(l8.getIntercept(), -1, 'getIntercept (back negative)');
  // perpendicular
  var l0p = dwv.math.getPerpendicularLine(l0, p0, 2);
  var pl0pbeg = new dwv.math.Point2D(-1, 0);
  assert.ok(l0p.getBegin().equals(pl0pbeg), 'perpendicular horizon begin');
  var pl0pend = new dwv.math.Point2D(1, 0);
  assert.ok(l0p.getEnd().equals(pl0pend), 'perpendicular horizon end');

  var l2p = dwv.math.getPerpendicularLine(l2, p0, 2);
  var pl2pbeg = new dwv.math.Point2D(0, -1);
  assert.ok(l2p.getBegin().equals(pl2pbeg), 'perpendicular vertical begin');
  var pl2pend = new dwv.math.Point2D(0, 1);
  assert.ok(l2p.getEnd().equals(pl2pend), 'perpendicular vertical end');

  var isSimilar = function (a, b) {
    return Math.abs(a - b) < 1e-10;
  };
  var isSimilarPoint2D = function (p0, p1) {
    return isSimilar(p0.getX(), p1.getX()) &&
            isSimilar(p0.getY(), p1.getY());
  };

  var l5p = dwv.math.getPerpendicularLine(l5, p6, 2);
  var halfSqrt2 = Math.sqrt(2) / 2;
  var pl5pbeg = new dwv.math.Point2D(-halfSqrt2, 1 + halfSqrt2);
  assert.ok(isSimilarPoint2D(l5p.getBegin(), pl5pbeg), 'perpendicular begin');
  var pl5pend = new dwv.math.Point2D(halfSqrt2, 1 - halfSqrt2);
  assert.ok(isSimilarPoint2D(l5p.getEnd(), pl5pend), 'perpendicular end');
});
