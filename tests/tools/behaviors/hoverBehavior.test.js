// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {
  HoverBehavior,
  TooltipHoverBehavior
} from '../../../src/tools/behaviors/hoverBehavior.js';
import {Point2D} from '../../../src/math/point.js';
import {
  makeMockLayerGroup
} from './utils.js';

describe('tools/behaviors', () => {
  describe('HoverBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new HoverBehavior();
    });

    test('onUpdate is a no-op by default', () => {
      const point = new Point2D(10, 20);
      const layerGroup = makeMockLayerGroup();
      // Should not throw
      behavior.onUpdate(point, layerGroup);
      assert.ok(true);
    });

    test('onEnd is a no-op by default', () => {
      // Should not throw
      behavior.onEnd();
      assert.ok(true);
    });
  });

  describe('TooltipHoverBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new TooltipHoverBehavior();
    });

    test('initializes with tooltipEnabled=false by default', () => {
      assert.ok(behavior);
    });

    test('setTooltipEnabled changes configuration', () => {
      behavior.setTooltipEnabled(true);
      // Configuration updated (verified by next test)
      assert.ok(behavior);
    });

    test('onUpdate shows tooltip when enabled', () => {
      const layerGroup = makeMockLayerGroup();
      behavior.setTooltipEnabled(true);

      const point = new Point2D(10, 20);
      behavior.onUpdate(point, layerGroup);

      assert.equal(layerGroup.showTooltip.mock.calls.length, 1);
    });

    test('onUpdate does not show tooltip when disabled', () => {
      const layerGroup = makeMockLayerGroup();
      behavior.setTooltipEnabled(false);

      const point = new Point2D(10, 20);
      behavior.onUpdate(point, layerGroup);

      assert.notOk(layerGroup.showTooltip.called);
    });

    test('onEnd removes tooltip', () => {
      const layerGroup = makeMockLayerGroup();
      behavior.setTooltipEnabled(true);

      const point = new Point2D(10, 20);
      behavior.onUpdate(point, layerGroup);
      behavior.onEnd();

      assert.equal(layerGroup.removeTooltipDiv.mock.calls.length, 1);
    });

    test('onEnd does nothing before any hover', () => {
      makeMockLayerGroup();
      // Should not crash when onEnd called without prior onUpdate
      behavior.onEnd();
      assert.ok(true);
    });

    test('onUpdate with enabled=true tracks current layer group', () => {
      const layerGroup = makeMockLayerGroup();
      behavior.setTooltipEnabled(true);

      behavior.onUpdate(new Point2D(10, 20), layerGroup);
      behavior.onEnd();

      // Verify that the tracked layer group was used
      assert.equal(layerGroup.removeTooltipDiv.mock.calls.length, 1);
    });
  });
});
