import {describe, test, assert} from 'vitest';
import {Point2D} from '../../src/math/point.js';
import {ROI} from '../../src/math/roi.js';

/**
 * Tests for the 'math/roi.js' file.
 */

describe('math', () => {

  /**
   * Tests for {@link ROI}.
   *
   * @function module:tests/math~roiClass
   */
  test('ROI class - #DWV-REQ-UI-07-008 Draw ROI', () => {
    const r0 = new ROI();
    const points0 = [
      new Point2D(0, 0),
      new Point2D(0, -4)
    ];
    // getLength
    assert.equal(r0.getLength(), 0, 'getLength #0');
    // add a point
    r0.addPoint(points0[0]);
    // getLength
    assert.equal(r0.getLength(), 1, 'getLength #1');
    // add another point
    r0.addPoint(points0[1]);
    // getPoint first
    assert.equal(r0.getPoint(0), points0[0], 'getPoint first');
    // getPoint second
    assert.equal(r0.getPoint(1), points0[1], 'getPoint second');
    // getPoints
    assert.deepEqual(r0.getPoints(), points0, 'getPoints');
    // add multiple points
    r0.addPoints([
      new Point2D(4, -4),
      new Point2D(4, 0)
    ]);
    // getLength
    assert.equal(r0.getLength(), 4, 'getLength #2');
    // get centroid
    const theoCentroid = new Point2D(2, -2);
    assert.ok(r0.getCentroid().equals(theoCentroid), 'getCentroid');
  });

});

describe('math roi contains', () => {
  test('ROI contains', () => {
    // L shaped polygon
    const r0 = new ROI([
      new Point2D(0, 0),
      new Point2D(10, 0),
      new Point2D(10, 4),
      new Point2D(4, 4),
      new Point2D(4, 10),
      new Point2D(0, 10)
    ]);
    assert.ok(r0.contains(new Point2D(2, 2)), 'inside');
    assert.ok(r0.contains(new Point2D(2, 8)), 'inside leg');
    assert.notOk(r0.contains(new Point2D(8, 8)), 'in L notch');
    assert.ok(r0.contains(new Point2D(8, 5), 1), 'notch within tolerance');
    assert.notOk(r0.contains(new Point2D(-2, 5), 1), 'outside');
    assert.notOk(new ROI().contains(new Point2D(0, 0)), 'empty roi');
  });
});
