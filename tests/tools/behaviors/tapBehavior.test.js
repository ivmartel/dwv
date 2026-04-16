// @vitest-environment jsdom
import {describe, test, assert, afterEach, beforeEach, vi} from 'vitest';
import {
  TapBehavior,
  PositionSetTapBehavior
} from '../../../src/tools/behaviors/tapBehavior.js';
import {Point2D} from '../../../src/math/point.js';
import {
  makeMockLayerGroup,
  makeMockViewLayer
} from './utils.js';
import * as loggerModule from '../../../src/utils/logger.js';

describe('tools/behaviors', () => {
  describe('TapBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new TapBehavior();
    });

    test('onTap is a no-op by default', () => {
      const point = new Point2D(10, 20);
      const layerGroup = makeMockLayerGroup();
      // Should not throw
      behavior.onTap(point, layerGroup);
      assert.ok(true);
    });
  });

  describe('PositionSetTapBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new PositionSetTapBehavior();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('onTap sets current position from tap point', () => {
      const layerGroup = makeMockLayerGroup();
      const viewLayer = makeMockViewLayer();
      layerGroup.getActiveViewLayer.mockReturnValue(viewLayer);

      const point = new Point2D(10, 20);
      behavior.onTap(point, layerGroup);

      const viewController = viewLayer.getViewController();
      assert.equal(viewController.setCurrentPosition.mock.calls.length, 1);
    });

    test('onTap does nothing when no view layer', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.getActiveViewLayer.mockReturnValue(undefined);

      const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
        .mockImplementation(() => {});

      const point = new Point2D(10, 20);
      behavior.onTap(point, layerGroup);

      // Should handle gracefully without throwing
      assert.ok(true);
      assert.equal(warnSpy.mock.calls.length, 1, 'warning emitted');
    });

    test('onTap converts display coords to plane coords', () => {
      const layerGroup = makeMockLayerGroup();
      const viewLayer = makeMockViewLayer();
      layerGroup.getActiveViewLayer.mockReturnValue(viewLayer);

      const point = new Point2D(100, 200);
      behavior.onTap(point, layerGroup);

      assert.equal(viewLayer.displayToPlanePos.mock.calls.length, 1);
    });
  });
});
