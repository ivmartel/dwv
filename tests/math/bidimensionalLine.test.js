import {describe, test, assert} from 'vitest';
import {BidimensionalLine} from '../../src/math/bidimensionalLine.js';
import {Point2D} from '../../src/math/point.js';


describe('BidimensionalLine', () => {
  test('constructor and getters', () => {
    const p1 = new Point2D(1, 2);
    const p2 = new Point2D(3, 4);
    const b = new BidimensionalLine(p1, p2);
    assert.strictEqual(b.getBegin(), p1);
    assert.strictEqual(b.getEnd(), p2);
  });

  test('getCentroid returns midpoint', () => {
    const p1 = new Point2D(0, 0);
    const p2 = new Point2D(4, 4);
    const b = new BidimensionalLine(p1, p2);
    const c = b.getCentroid();
    assert.equal(c.getX(), 2);
    assert.equal(c.getY(), 2);
  });

  test('getLength returns correct value', () => {
    const p1 = new Point2D(0, 0);
    const p2 = new Point2D(3, 4);
    const b = new BidimensionalLine(p1, p2);
    assert.equal(b.getLength(), 5);
  });

  test('getSlope returns correct value', () => {
    const p1 = new Point2D(0, 0);
    const p2 = new Point2D(2, 4);
    const b = new BidimensionalLine(p1, p2);
    assert.equal(b.getSlope(), 2);
    // vertical line
    const p3 = new Point2D(0, 0);
    const p4 = new Point2D(0, 5);
    const b2 = new BidimensionalLine(p3, p4);
    assert.equal(b2.getSlope(), Infinity);
  });

  test('getDeltaX and getDeltaY', () => {
    const p1 = new Point2D(1, 2);
    const p2 = new Point2D(4, 6);
    const b = new BidimensionalLine(p1, p2);
    assert.equal(b.getDeltaX(), 3);
    assert.equal(b.getDeltaY(), 4);
  });

  test('quantify returns correct axes (default spacing, no short axis)', () => {
    const p1 = new Point2D(0, 0);
    const p2 = new Point2D(3, 4);
    const b = new BidimensionalLine(p1, p2);
    // No shortAxisLength set
    const viewController = {
      get2DSpacing: () => ({x: 1, y: 1}),
      getLengthUnit: () => 'mm',
    };
    const result = b.quantify(viewController);
    assert.deepEqual(result, {
      longAxis: {value: 5, unit: 'mm'},
      shortAxis: {value: null, unit: 'mm'},
    });
  });

  test('quantify returns correct axes (with short axis, spacing)', () => {
    const p1 = new Point2D(0, 0);
    const p2 = new Point2D(10, 0);
    const b = new BidimensionalLine(p1, p2);
    b.shortAxisLength = 6;
    b.shortAxisT = 0.5;
    b.shortAxisL1 = 3;
    b.shortAxisL2 = 3;
    const viewController = {
      get2DSpacing: () => ({x: 2, y: 2}),
      getLengthUnit: () => 'cm',
    };
    const result = b.quantify(viewController);
    // Main axis: (0,0)-(10,0) with spacing 2: length = 20
    // Short axis: endpoints (5,3)-(5,-3) with spacing 2: dx=0, dy=6, world=12
    assert.deepEqual(result, {
      longAxis: {value: 20, unit: 'cm'},
      shortAxis: {value: 12, unit: 'cm'},
    });
    // shortAxisCenter should be set
    assert.closeTo(b.shortAxisCenter.x, 5, 1e-6);
    assert.closeTo(b.shortAxisCenter.y, 0, 1e-6);
  });

  test('quantify handles missing viewController methods', () => {
    const p1 = new Point2D(0, 0);
    const p2 = new Point2D(0, 10);
    const b = new BidimensionalLine(p1, p2);
    b.shortAxisLength = 4;
    const viewController = {}; // no methods
    const result = b.quantify(viewController);
    assert.equal(result.longAxis.unit, 'mm');
    assert.equal(result.shortAxis.unit, 'mm');
  });
});
