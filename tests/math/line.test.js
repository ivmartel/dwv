import {Point2D} from '../../src/math/point';
import {Line, getAngle, getPerpendicularLine} from '../../src/math/line';

/**
 * Tests for the 'math/line.js' file.
 */

/* global QUnit */
QUnit.module('math');

/**
 * Tests for {@link Line}.
 *
 * @function module:tests/math~line-class
 */
QUnit.test('Line class - #DWV-REQ-UI-07-007 Draw ruler', function (assert) {
  const p00 = new Point2D(0, 0);
  const p01 = new Point2D(0, -5);
  const l00 = new Line(p00, p01);
  // getBegin
  assert.equal(l00.getBegin(), p00, 'getBegin');
  // getEnd
  assert.equal(l00.getEnd(), p01, 'getEnd');
  // getLength
  assert.equal(l00.getLength(), 5, 'getLength');
  // getWorldLength
  const spacing2D = {x: 0.5, y: 0.5};
  assert.equal(l00.getWorldLength(spacing2D), 2.5, 'getWorldLength');
  // getMidpoint
  const pMid = new Point2D(0, -2.5); // rounded...
  assert.equal(l00.getMidpoint().equals(pMid), true, 'getMidpoint');

  // equals: true
  const l01 = new Line(p00, p01);
  assert.ok(l00.equals(l01), 'equal lines');
  // equals: false end
  const p02 = new Point2D(0, -4);
  const l02 = new Line(p00, p02);
  assert.notOk(l00.equals(l02), 'non equal lines end');
  // equals: false begin
  const l03 = new Line(p02, p01);
  assert.notOk(l00.equals(l03), 'non equal lines begin');

  // slope
  const p10 = new Point2D(1, 1);
  const l10 = new Line(p00, p10);
  assert.equal(l10.getSlope(), 1, 'getSlope');
  const p11 = new Point2D(1, -1);
  const l11 = new Line(p00, p11);
  assert.equal(l11.getSlope(), -1, 'getSlope (negative)');
  const p12 = new Point2D(1, 0);
  const l12 = new Line(p00, p12);
  assert.equal(l12.getSlope(), 0, 'getSlope (horizontal)');
  assert.equal(l00.getSlope(), -Infinity, 'getSlope (vertical)');

  // inclination
  assert.equal(l10.getInclination(), 135, 'Inclination'); // 180 - 45
  assert.equal(l11.getInclination(), 225, 'Inclination (negative)'); // 180 + 45
  assert.equal(l12.getInclination(), 180, 'Inclination (horizontal)');
  assert.equal(l00.getInclination(), 270, 'Inclination (vertical)'); // 180 + 90

  // intercept
  assert.equal(l10.getIntercept(), 0, 'getIntercept (zero)');
  const p20 = new Point2D(0, 1);
  const p21 = new Point2D(1, 2);
  const l20 = new Line(p20, p21);
  assert.equal(l20.getIntercept(), 1, 'getIntercept');
  const p22 = new Point2D(0, -1);
  const p23 = new Point2D(1, -2);
  const l21 = new Line(p22, p23);
  assert.equal(l21.getIntercept(), -1, 'getIntercept (negative)');
  const p24 = new Point2D(0, 1);
  const p25 = new Point2D(-1, 2);
  const l22 = new Line(p24, p25);
  assert.equal(l22.getIntercept(), 1, 'getIntercept (back)');
  const p26 = new Point2D(0, -1);
  const p27 = new Point2D(-1, -2);
  const l23 = new Line(p26, p27);
  assert.equal(l23.getIntercept(), -1, 'getIntercept (back negative)');
});

/**
 * Tests for {@link Line}.
 *
 * @function module:tests/math~line-angle
 */
QUnit.test('Angle between lines - #DWV-REQ-UI-07-005 Draw protractor',
  function (assert) {
    const p00 = new Point2D(0, 0);
    const p02 = new Point2D(1, -1);

    // test #0
    const p01 = new Point2D(1, 1);
    const l00 = new Line(p00, p01);
    const l01 = new Line(p00, p02);
    assert.equal(
      getAngle(l00, l01),
      90,
      'getAngle');

    // test #1
    const p11 = new Point2D(1, 0);
    const l10 = new Line(p00, p11);
    const p12 = new Point2D(0, -1);
    const p13 = new Point2D(1, -1);
    const l11 = new Line(p12, p13);
    assert.equal(
      getAngle(l10, l11),
      180,
      'getAngle (horizontal parallel)');

    // test #2
    const p20 = new Point2D(0, -5);
    const l20 = new Line(p00, p20);
    const l21 = new Line(p11, p02);
    assert.equal(
      getAngle(l20, l21),
      180,
      'getAngle (vertical parallel)');
  }
);

/**
 * Tests for {@link Line}.
 *
 * @function module:tests/math~line-perpendicular
 */
QUnit.test('Perpendicular line', function (assert) {
  const p00 = new Point2D(0, 0);
  const p01 = new Point2D(0, -5);
  const l00 = new Line(p00, p01);

  // test #0
  const l0p = getPerpendicularLine(l00, p00, 2);
  const pl0pbeg = new Point2D(-1, 0);
  assert.ok(l0p.getBegin().equals(pl0pbeg), 'perpendicular horizon begin');
  const pl0pend = new Point2D(1, 0);
  assert.ok(l0p.getEnd().equals(pl0pend), 'perpendicular horizon end');

  // test #1
  const p11 = new Point2D(1, 0);
  const l1 = new Line(p00, p11);
  const l1p = getPerpendicularLine(l1, p00, 2);
  const pl2pbeg = new Point2D(0, -1);
  assert.ok(l1p.getBegin().equals(pl2pbeg), 'perpendicular vertical begin');
  const pl2pend = new Point2D(0, 1);
  assert.ok(l1p.getEnd().equals(pl2pend), 'perpendicular vertical end');

  // test #0
  const isSimilar = function (a, b) {
    return Math.abs(a - b) < 1e-10;
  };
  const isSimilarPoint2D = function (p0, p1) {
    return isSimilar(p0.getX(), p1.getX()) &&
      isSimilar(p0.getY(), p1.getY());
  };

  const p6 = new Point2D(0, 1);
  const p7 = new Point2D(1, 2);
  const l5 = new Line(p6, p7);
  const l5p = getPerpendicularLine(l5, p6, 2);
  const halfSqrt2 = Math.sqrt(2) / 2;
  const pl5pbeg = new Point2D(-halfSqrt2, 1 + halfSqrt2);
  assert.ok(isSimilarPoint2D(l5p.getBegin(), pl5pbeg), 'perpendicular begin');
  const pl5pend = new Point2D(halfSqrt2, 1 - halfSqrt2);
  assert.ok(isSimilarPoint2D(l5p.getEnd(), pl5pend), 'perpendicular end');
});
