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
  var p00 = new dwv.math.Point2D(0, 0);
  var p01 = new dwv.math.Point2D(0, -5);
  var l00 = new dwv.math.Line(p00, p01);
  // getBegin
  assert.equal(l00.getBegin(), p00, 'getBegin');
  // getEnd
  assert.equal(l00.getEnd(), p01, 'getEnd');
  // getLength
  assert.equal(l00.getLength(), 5, 'getLength');
  // getWorldLength
  assert.equal(l00.getWorldLength(0.5, 0.5), 2.5, 'getWorldLength');
  // getMidpoint
  var pMid = new dwv.math.Point2D(0, -2); // rounded...
  assert.equal(l00.getMidpoint().equals(pMid), true, 'getMidpoint');

  // equals: true
  var l01 = new dwv.math.Line(p00, p01);
  assert.ok(l00.equals(l01), 'equal lines');
  // equals: false end
  var p02 = new dwv.math.Point2D(0, -4);
  var l02 = new dwv.math.Line(p00, p02);
  assert.notOk(l00.equals(l02), 'non equal lines end');
  // equals: false begin
  var l03 = new dwv.math.Line(p02, p01);
  assert.notOk(l00.equals(l03), 'non equal lines begin');

  // slope
  var p10 = new dwv.math.Point2D(1, 1);
  var l10 = new dwv.math.Line(p00, p10);
  assert.equal(l10.getSlope(), 1, 'getSlope');
  var p11 = new dwv.math.Point2D(1, -1);
  var l11 = new dwv.math.Line(p00, p11);
  assert.equal(l11.getSlope(), -1, 'getSlope (negative)');
  var p12 = new dwv.math.Point2D(1, 0);
  var l12 = new dwv.math.Line(p00, p12);
  assert.equal(l12.getSlope(), 0, 'getSlope (horizontal)');
  assert.equal(l00.getSlope(), -Infinity, 'getSlope (vertical)');

  // inclination
  assert.equal(l10.getInclination(), 135, 'Inclination'); // 180 - 45
  assert.equal(l11.getInclination(), 225, 'Inclination (negative)'); // 180 + 45
  assert.equal(l12.getInclination(), 180, 'Inclination (horizontal)');
  assert.equal(l00.getInclination(), 270, 'Inclination (vertical)'); // 180 + 90

  // intercept
  assert.equal(l10.getIntercept(), 0, 'getIntercept (zero)');
  var p20 = new dwv.math.Point2D(0, 1);
  var p21 = new dwv.math.Point2D(1, 2);
  var l20 = new dwv.math.Line(p20, p21);
  assert.equal(l20.getIntercept(), 1, 'getIntercept');
  var p22 = new dwv.math.Point2D(0, -1);
  var p23 = new dwv.math.Point2D(1, -2);
  var l21 = new dwv.math.Line(p22, p23);
  assert.equal(l21.getIntercept(), -1, 'getIntercept (negative)');
  var p24 = new dwv.math.Point2D(0, 1);
  var p25 = new dwv.math.Point2D(-1, 2);
  var l22 = new dwv.math.Line(p24, p25);
  assert.equal(l22.getIntercept(), 1, 'getIntercept (back)');
  var p26 = new dwv.math.Point2D(0, -1);
  var p27 = new dwv.math.Point2D(-1, -2);
  var l23 = new dwv.math.Line(p26, p27);
  assert.equal(l23.getIntercept(), -1, 'getIntercept (back negative)');
});

/**
 * Tests for {@link dwv.math.Line}.
 *
 * @function module:tests/math~Line
 */
QUnit.test('Test angle between lines.', function (assert) {
  var p00 = new dwv.math.Point2D(0, 0);
  var p02 = new dwv.math.Point2D(1, -1);

  // test #0
  var p01 = new dwv.math.Point2D(1, 1);
  var l00 = new dwv.math.Line(p00, p01);
  var l01 = new dwv.math.Line(p00, p02);
  assert.equal(
    dwv.math.getAngle(l00, l01),
    90,
    'getAngle');

  // test #1
  var p11 = new dwv.math.Point2D(1, 0);
  var l10 = new dwv.math.Line(p00, p11);
  var p12 = new dwv.math.Point2D(0, -1);
  var p13 = new dwv.math.Point2D(1, -1);
  var l11 = new dwv.math.Line(p12, p13);
  assert.equal(
    dwv.math.getAngle(l10, l11),
    180,
    'getAngle (horizontal parallel)');

  // test #2
  var p20 = new dwv.math.Point2D(0, -5);
  var l20 = new dwv.math.Line(p00, p20);
  var l21 = new dwv.math.Line(p11, p02);
  assert.equal(
    dwv.math.getAngle(l20, l21),
    180,
    'getAngle (vertical parallel)');
});

/**
 * Tests for {@link dwv.math.Line}.
 *
 * @function module:tests/math~Line
 */
QUnit.test('Test perpendicular line.', function (assert) {
  var p00 = new dwv.math.Point2D(0, 0);
  var p01 = new dwv.math.Point2D(0, -5);
  var l00 = new dwv.math.Line(p00, p01);

  // test #0
  var l0p = dwv.math.getPerpendicularLine(l00, p00, 2);
  var pl0pbeg = new dwv.math.Point2D(-1, 0);
  assert.ok(l0p.getBegin().equals(pl0pbeg), 'perpendicular horizon begin');
  var pl0pend = new dwv.math.Point2D(1, 0);
  assert.ok(l0p.getEnd().equals(pl0pend), 'perpendicular horizon end');

  // test #1
  var p11 = new dwv.math.Point2D(1, 0);
  var l1 = new dwv.math.Line(p00, p11);
  var l1p = dwv.math.getPerpendicularLine(l1, p00, 2);
  var pl2pbeg = new dwv.math.Point2D(0, -1);
  assert.ok(l1p.getBegin().equals(pl2pbeg), 'perpendicular vertical begin');
  var pl2pend = new dwv.math.Point2D(0, 1);
  assert.ok(l1p.getEnd().equals(pl2pend), 'perpendicular vertical end');

  // test #0
  var isSimilar = function (a, b) {
    return Math.abs(a - b) < 1e-10;
  };
  var isSimilarPoint2D = function (p0, p1) {
    return isSimilar(p0.getX(), p1.getX()) &&
            isSimilar(p0.getY(), p1.getY());
  };

  var p6 = new dwv.math.Point2D(0, 1);
  var p7 = new dwv.math.Point2D(1, 2);
  var l5 = new dwv.math.Line(p6, p7);
  var l5p = dwv.math.getPerpendicularLine(l5, p6, 2);
  var halfSqrt2 = Math.sqrt(2) / 2;
  var pl5pbeg = new dwv.math.Point2D(-halfSqrt2, 1 + halfSqrt2);
  assert.ok(isSimilarPoint2D(l5p.getBegin(), pl5pbeg), 'perpendicular begin');
  var pl5pend = new dwv.math.Point2D(halfSqrt2, 1 - halfSqrt2);
  assert.ok(isSimilarPoint2D(l5p.getEnd(), pl5pend), 'perpendicular end');
});
