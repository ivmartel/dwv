import {describe, test, assert} from 'vitest';
import {Point2D} from '../../src/math/point.js';
import {
  Line,
  getAngle,
  areOrthogonal,
  getPerpendicularLine,
  getPerpendicularLineAtDistance,
  isPointInLineRange
} from '../../src/math/line.js';

/**
 * Tests for the 'math/line.js' file.
 */

describe('math', () => {

  /**
   * Tests for {@link Line}.
   *
   * @function module:tests/math~lineClass
   */
  test('Line class - #DWV-REQ-UI-07-007 Draw ruler', () => {
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

    // getMidpoint
    const pMid = new Point2D(0, -2.5); // rounded...
    assert.equal(l00.getMidpoint().equals(pMid), true, 'getMidpoint');
    // getCentroid
    assert.equal(l00.getCentroid().equals(pMid), true, 'getCentroid');

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
    assert.equal(l11.getInclination(), 225,
      'Inclination (negative)'); // 180 + 45
    assert.equal(l12.getInclination(), 180, 'Inclination (horizontal)');
    assert.equal(l00.getInclination(), 270,
      'Inclination (vertical)'); // 180 + 90

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

    // flipped
    const p30 = new Point2D(0, 1);
    const p31 = new Point2D(1, 2);
    const l30 = new Line(p30, p31);
    const l30res = l30.getFlipped();
    assert.ok(l30res.getBegin().equals(p31), 'getFlipped begin');
    assert.ok(l30res.getEnd().equals(p30), 'getFlipped end');
  });

  /**
   * Tests for {@link getAngle}.
   *
   * @function module:tests/math~angleBetweenLines
   */
  test('Angle between lines - #DWV-REQ-UI-07-005 Draw protractor',
    () => {
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
   * Tests for {@link Line} areOrthogonal.
   *
   * @function module:tests/math~areorthogonal
   */
  test('areOrthogonal', () => {
    const p00 = new Point2D(0, 0);
    const p01 = new Point2D(1, 0);
    const l00 = new Line(p00, p01);

    const p10 = new Point2D(0, 0);
    const p11 = new Point2D(0, 1);
    const l10 = new Line(p10, p11);
    assert.ok(areOrthogonal(l00, l10), 'areOrthogonal #00');

    const p20 = new Point2D(1, 0);
    const p21 = new Point2D(1, 1);
    const l20 = new Line(p20, p21);
    assert.ok(areOrthogonal(l00, l20), 'areOrthogonal #01');

    const p30 = new Point2D(0, 0);
    const p31 = new Point2D(1, 1);
    const l30 = new Line(p30, p31);
    assert.notOk(areOrthogonal(l00, l30), 'areOrthogonal #02');

    const p40 = new Point2D(0, 0);
    const p41 = new Point2D(-1, 1);
    const l40 = new Line(p40, p41);
    assert.ok(areOrthogonal(l30, l40), 'areOrthogonal #03');
  });

  /**
   * Tests for {@link Line}.
   *
   * @function module:tests/math~perpendicularLine
   */
  test('Perpendicular line', () => {
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

  /**
   * Tests for {@link Line}.
   *
   * @function module:tests/math~lineGetperpendicularlineatdistance
   */
  test('Line getPerpendicularLineAtDistance', () => {
    const p00 = new Point2D(0, 0);
    const p01 = new Point2D(0, -5);
    const l00 = new Line(p00, p01);

    // test #0
    const l0p = getPerpendicularLineAtDistance(l00, 0, 2);
    const pl0pbeg = new Point2D(-1, 0);
    assert.ok(l0p.getBegin().equals(pl0pbeg), 'perpendicular horizon begin #0');
    const pl0pend = new Point2D(1, 0);
    assert.ok(l0p.getEnd().equals(pl0pend), 'perpendicular horizon end #0');

    // test #1
    // TODO was expecting -1 and not -0.5...
    const l1p = getPerpendicularLineAtDistance(l00, 1, 2);
    const pl1pbeg = new Point2D(-1, -0.5);
    assert.ok(l1p.getBegin().equals(pl1pbeg), 'perpendicular horizon begin #1');
    const pl1pend = new Point2D(1, -0.5);
    assert.ok(l1p.getEnd().equals(pl1pend), 'perpendicular horizon end #1');

    // test #2
    // TODO was expecting -2 and not -1...
    const l2p = getPerpendicularLineAtDistance(l00, 2, 2);
    const p21pbeg = new Point2D(-1, -1);
    assert.ok(l2p.getBegin().equals(p21pbeg), 'perpendicular horizon begin #2');
    const p21pend = new Point2D(1, -1);
    assert.ok(l2p.getEnd().equals(p21pend), 'perpendicular horizon end #2');
  });

  /**
   * Tests for {@link Line}.
   *
   * @function module:tests/math~lineIspointinlinerange
   */
  test('Line isPointInLineRange', () => {
    const p00 = new Point2D(0, 0);
    const p01 = new Point2D(1, 1);
    const l00 = new Line(p00, p01);

    // begin
    assert.ok(isPointInLineRange(p00, l00), 'isPointInLineRange #0');
    // end
    assert.ok(isPointInLineRange(p01, l00), 'isPointInLineRange #1');
    // centroid
    const p02 = new Point2D(0.5, 0.5);
    assert.ok(isPointInLineRange(p02, l00), 'isPointInLineRange #2');
    const p03 = l00.getCentroid();
    assert.ok(isPointInLineRange(p03, l00), 'isPointInLineRange #3');
    // can be outside line
    const p04 = new Point2D(0, 1);
    assert.ok(isPointInLineRange(p04, l00), 'isPointInLineRange #4');
    const p05 = new Point2D(1, 0);
    assert.ok(isPointInLineRange(p05, l00), 'isPointInLineRange #5');
  });

});