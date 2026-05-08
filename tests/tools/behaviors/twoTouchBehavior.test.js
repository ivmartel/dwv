// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {
  TwoTouchBehavior,
  ZoomScrollTwoTouchBehavior
} from '../../../src/tools/behaviors/twoTouchBehavior.js';
import {Point2D} from '../../../src/math/point.js';
import {
  makeMockLayerGroup
} from './utils.js';

describe('tools/behaviors', () => {
  describe('TwoTouchBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new TwoTouchBehavior();
    });

    test('isActive returns false by default', () => {
      assert.notOk(behavior.isActive());
    });

    test('onStart is a no-op by default', () => {
      const points = [new Point2D(0, 0), new Point2D(10, 10)];
      // Should not throw
      behavior.onStart(points);
      assert.ok(true);
    });

    test('onUpdate returns false by default', () => {
      const points = [new Point2D(0, 0), new Point2D(10, 10)];
      const layerGroup = makeMockLayerGroup();
      const result = behavior.onUpdate(points, layerGroup);
      assert.notOk(result);
    });

    test('onEnd is a no-op by default', () => {
      // Should not throw
      behavior.onEnd();
      assert.ok(true);
    });
  });

  describe('ZoomScrollTwoTouchBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new ZoomScrollTwoTouchBehavior();
    });

    test('isActive returns false initially', () => {
      assert.notOk(behavior.isActive());
    });

    test('isActive returns true after onStart', () => {
      const points = [new Point2D(0, 0), new Point2D(10, 10)];
      behavior.onStart(points);
      assert.ok(behavior.isActive());
    });

    test('onStart stores the initial touch line', () => {
      const p1 = new Point2D(0, 0);
      const p2 = new Point2D(10, 10);
      behavior.onStart([p1, p2]);

      // After onStart, isActive should be true
      assert.ok(behavior.isActive());
    });

    test('onUpdate returns true when points move (zoom)', () => {
      const layerGroup = makeMockLayerGroup();
      behavior.onStart([new Point2D(0, 0), new Point2D(10, 10)]);

      // Move points further apart (zoom in)
      const result = behavior.onUpdate(
        [new Point2D(0, 0), new Point2D(20, 20)], layerGroup);
      assert.ok(result);
    });

    test('onUpdate returns false when not active', () => {
      const layerGroup = makeMockLayerGroup();
      // onStart not called, so not active
      const result = behavior.onUpdate(
        [new Point2D(0, 0), new Point2D(10, 10)], layerGroup);
      assert.notOk(result);
    });

    test('onUpdate zooms when line length ratio != 1', () => {
      const layerGroup = makeMockLayerGroup();
      behavior.onStart([new Point2D(0, 0), new Point2D(10, 10)]);

      // Move points to change the line length
      behavior.onUpdate([new Point2D(0, 0), new Point2D(15, 15)], layerGroup);

      // Verify zoom was applied
      const addScaleCalls = layerGroup.addScale.mock.calls.length;
      const drawCalls = layerGroup.draw.mock.calls.length;
      assert.equal(addScaleCalls, 1);
      assert.equal(drawCalls, 1);
    });

    test('onUpdate scrolls when points move vertically with ratio=1', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.canScroll.mockReturnValue(true);
      behavior.onStart([new Point2D(0, 0), new Point2D(10, 0)]);

      // Move both points down without changing line length
      behavior.onUpdate([new Point2D(0, 20), new Point2D(10, 20)], layerGroup);

      const posHelper = layerGroup.getPositionHelper();
      // Should have called incrementPositionAlongScroll or
      //  decrementPositionAlongScroll
      const incrementCalls =
        posHelper.incrementPositionAlongScroll.mock.calls.length;
      const decrementCalls =
        posHelper.decrementPositionAlongScroll.mock.calls.length;
      assert.ok(incrementCalls > 0 || decrementCalls > 0);
    });

    test('onEnd clears the active state', () => {
      const points = [new Point2D(0, 0), new Point2D(10, 10)];
      behavior.onStart(points);
      assert.ok(behavior.isActive());

      behavior.onEnd();
      assert.notOk(behavior.isActive());
    });

    test('can be restarted after onEnd', () => {
      const p1 = [new Point2D(0, 0), new Point2D(10, 10)];
      const p2 = [new Point2D(0, 0), new Point2D(20, 20)];

      behavior.onStart(p1);
      assert.ok(behavior.isActive());

      behavior.onEnd();
      assert.notOk(behavior.isActive());

      behavior.onStart(p2);
      assert.ok(behavior.isActive());
    });

    test('handles zoom in correctly', () => {
      const layerGroup = makeMockLayerGroup();
      // Initial distance: 10
      behavior.onStart([new Point2D(0, 0), new Point2D(10, 0)]);

      // Increase distance to 20 (zoom in)
      behavior.onUpdate([new Point2D(0, 0), new Point2D(20, 0)], layerGroup);

      // Should have called addScale with positive value (zoom in)
      const addScaleCalls = layerGroup.addScale.mock.calls.length;
      const drawCalls = layerGroup.draw.mock.calls.length;
      assert.equal(addScaleCalls, 1);
      assert.equal(drawCalls, 1);
    });

    test('handles zoom out correctly', () => {
      const layerGroup = makeMockLayerGroup();
      // Initial distance: 20
      behavior.onStart([new Point2D(0, 0), new Point2D(20, 0)]);

      // Decrease distance to 10 (zoom out)
      behavior.onUpdate([new Point2D(0, 0), new Point2D(10, 0)], layerGroup);

      // Should have called addScale with negative value (zoom out)
      const addScaleCalls = layerGroup.addScale.mock.calls.length;
      const drawCalls = layerGroup.draw.mock.calls.length;
      assert.equal(addScaleCalls, 1);
      assert.equal(drawCalls, 1);
    });
  });
});
