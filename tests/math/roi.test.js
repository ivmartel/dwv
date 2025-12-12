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
   * @function module:tests/math~roi-class
   */
  test('ROI class - #DWV-REQ-UI-07-008 Draw ROI', () => {
    const r0 = new ROI();
    // getLength
    assert.equal(r0.getLength(), 0, 'getLength');
    // add a point
    const p0 = new Point2D(0, 0);
    r0.addPoint(p0);
    // getLength
    assert.equal(r0.getLength(), 1, 'getLength');
    // add another point
    const p1 = new Point2D(-4, -4);
    r0.addPoint(p1);
    // getPoint first
    assert.equal(r0.getPoint(0), p0, 'getPoint first');
    // getPoint second
    assert.equal(r0.getPoint(1), p1, 'getPoint second');
  });

});
