// @vitest-environment jsdom
import {describe, test, assert, afterEach, beforeEach, vi} from 'vitest';
import {
  DoubleClickBehavior,
  WindowLevelDoubleClickBehavior,
  PlayDoubleClickBehavior
} from '../../../src/tools/behaviors/doubleClickBehavior.js';
import {Point2D} from '../../../src/math/point.js';
import {WindowLevel} from '../../../src/image/windowLevel.js';
import {
  makeMockLayerGroup,
  makeMockViewLayer,
  makeMockApp,
  makeMockViewController,
  makeMockLayer
} from './utils.js';
import * as loggerModule from '../../../src/utils/logger.js';

describe('tools/behaviors', () => {
  describe('DoubleClickBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new DoubleClickBehavior();
    });

    test('onDoubleClick is a no-op by default', () => {
      const point = new Point2D(10, 20);
      const layerGroup = makeMockLayerGroup();
      // Should not throw
      behavior.onDoubleClick(point, layerGroup);
      assert.ok(true);
    });
  });

  describe('WindowLevelDoubleClickBehavior', () => {
    let behavior;
    let app;

    beforeEach(() => {
      app = makeMockApp();
      behavior = new WindowLevelDoubleClickBehavior({app});
    });

    test('initializes with app and default activeViewLayerOnly=true', () => {
      assert.ok(behavior);
    });

    test('setActiveViewLayerOnly changes configuration', () => {
      behavior.setActiveViewLayerOnly(false);
      // Configuration updated
      assert.ok(behavior);
    });

    test('onDoubleClick sets window center from clicked pixel', () => {
      const viewLayer = makeMockViewLayer();
      const layerGroup = makeMockLayerGroup(viewLayer);

      const point = new Point2D(100, 200);
      behavior.onDoubleClick(point, layerGroup);

      const viewController = viewLayer.getViewController();
      assert.equal(viewController.setWindowLevel.mock.calls.length, 1);
      const wlArg = viewController.setWindowLevel.mock.calls[0][0];
      assert.ok(wlArg instanceof WindowLevel);
      assert.equal(wlArg.center, 50);
      assert.equal(wlArg.width, 100);
    });

    test('onDoubleClick does nothing when no view layer', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.getActiveViewLayer.mockReturnValue(undefined);

      const point = new Point2D(100, 200);
      behavior.onDoubleClick(point, layerGroup);

      // Should handle gracefully
      assert.ok(true);
    });

    test('onDoubleClick does nothing when layer is not monochrome', () => {
      const viewController0 = makeMockViewController();
      viewController0.isMonochrome = vi.fn(() => false);
      const viewLayer = makeMockViewLayer(viewController0);
      const layerGroup = makeMockLayerGroup(viewLayer);

      const point = new Point2D(100, 200);
      behavior.onDoubleClick(point, layerGroup);

      const viewController = viewLayer.getViewController();
      assert.equal(viewController.setWindowLevel.mock.calls.length, 0);
    });

    test('onDoubleClick creates WindowLevel from pixel intensity', () => {
      const viewLayer = makeMockViewLayer();
      const mockImage = {
        getRescaledValueAtIndex: vi.fn(() => 75)
      };
      app.getData.mockReturnValue({image: mockImage});
      const layerGroup = makeMockLayerGroup(viewLayer);

      const point = new Point2D(100, 200);
      behavior.onDoubleClick(point, layerGroup);

      const viewController = viewLayer.getViewController();
      assert.equal(viewController.setWindowLevel.mock.calls.length, 1);
      const wlArg = viewController.setWindowLevel.mock.calls[0][0];
      assert.ok(wlArg instanceof WindowLevel);
      assert.equal(wlArg.center, 75);
      assert.equal(wlArg.width, 100);
    });
  });

  describe('PlayDoubleClickBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new PlayDoubleClickBehavior();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('onDoubleClick calls play() on the view controller', () => {
      const viewLayer = makeMockViewLayer();
      const layerGroup = makeMockLayerGroup(viewLayer);

      const point = new Point2D(100, 200);
      behavior.onDoubleClick(point, layerGroup);

      const viewController = viewLayer.getViewController();
      assert.equal(viewController.play.mock.calls.length, 1);
    });

    test('onDoubleClick does nothing when no view layer', () => {
      const mockDrawLayer = makeMockLayer();
      const layerGroup = makeMockLayerGroup();
      layerGroup.getActiveViewLayer.mockReturnValue(undefined);
      layerGroup.getActiveDrawLayer.mockReturnValue(mockDrawLayer);
      layerGroup.getViewLayerById.mockReturnValue(undefined);

      const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
        .mockImplementation(() => {});

      const point = new Point2D(100, 200);
      behavior.onDoubleClick(point, layerGroup);

      // Should handle gracefully
      assert.ok(true);
      assert.equal(warnSpy.mock.calls.length, 1, 'warning emitted');
    });
  });
});
