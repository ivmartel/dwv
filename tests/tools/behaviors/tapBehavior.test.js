// @vitest-environment jsdom
import {describe, test, assert, afterEach, beforeEach, vi} from 'vitest';
import {
  TapBehavior,
  PositionSetTapBehavior
} from '../../../src/tools/behaviors/tapBehavior.js';
import {Point2D} from '../../../src/math/point.js';
import {
  makeMockLayerGroup,
  makeMockViewLayer,
  makeMockViewController
} from './utils.js';
import * as loggerModule from '../../../src/utils/logger.js';

describe('tools/behaviors', () => {
  describe('TapBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new TapBehavior();
    });

    test('TapBehavior extends EventTarget', () => {
      assert.ok(behavior instanceof EventTarget);
      assert.equal(typeof behavior.addEventListener, 'function');
      assert.equal(typeof behavior.dispatchEvent, 'function');
    });

    test('default onTap does not set active', () => {
      const point = new Point2D(10, 20);
      const layerGroup = makeMockLayerGroup();
      behavior.onTap(point, layerGroup);
      assert.notOk(behavior.isActive());
    });

    test('reset clears an in-progress multi-tap session', () => {
      const point = new Point2D(1, 2);
      const layerGroup = makeMockLayerGroup();
      behavior.setNumberOfTaps(3);
      behavior.onTap(point, layerGroup);
      assert.ok(behavior.isActive());
      behavior.reset();
      assert.notOk(behavior.isActive());
      assert.deepEqual(behavior.getPointList(), []);
    });

    test('sticky onTap does set active', () => {
      const point = new Point2D(10, 20);
      const layerGroup = makeMockLayerGroup();
      behavior.setNumberOfTaps(2);
      behavior.onTap(point, layerGroup);
      assert.ok(behavior.isActive());
      behavior.onTap(point, layerGroup);
      assert.notOk(behavior.isActive());
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

    /**
     * Collect the events of a type fired by the behavior.
     *
     * @param {string} type The event type.
     * @returns {object[]} The list of event details, filled on fire.
     */
    function collect(type) {
      const details = [];
      behavior.addEventListener(type, (event) => {
        details.push(event.detail);
      });
      return details;
    }

    /**
     * Create a draw layer mock.
     *
     * @param {object|undefined} annotation The annotation at any point.
     * @param {boolean} [visible] The layer visibility, default true.
     * @returns {object} The draw layer mock.
     */
    function makeMockDrawLayer(annotation, visible = true) {
      return {
        isVisible: vi.fn(() => visible),
        getReferenceLayerId: vi.fn(() => 'ref'),
        getDataId: vi.fn(() => 'draw-data-id'),
        getAnnotationAt: vi.fn(() => annotation)
      };
    }

    /**
     * Create a mask view layer mock.
     *
     * @param {number[]} segmentNumbers The segment numbers at any position.
     * @returns {object} The view layer mock.
     */
    function makeMockMaskViewLayer(segmentNumbers) {
      const vc = makeMockViewController();
      vc.isMask = vi.fn(() => true);
      vc.getSegmentNumbersAtPosition = vi.fn(() => segmentNumbers);
      const vl = makeMockViewLayer(vc);
      vl.isVisible = vi.fn(() => true);
      vl.getDataId = vi.fn(() => 'mask-data-id');
      return vl;
    }

    test('onTap on an annotation fires tap with the annotation', () => {
      const layerGroup = makeMockLayerGroup();
      const drawLayer = makeMockDrawLayer({trackingUid: 'uid0'});
      layerGroup.getDrawLayers.mockReturnValue([drawLayer]);
      const taps = collect('tap');

      behavior.onTap(new Point2D(10, 20), layerGroup);

      assert.deepEqual(taps, [{
        position: [10, 20, 0],
        annotations: [{annotationid: 'uid0', dataid: 'draw-data-id'}],
        segments: []
      }]);
      // tolerance: 5 display pixels with a 0.5 plane scale mock
      assert.equal(drawLayer.getAnnotationAt.mock.calls[0][1], 0.5);
      const viewController = layerGroup.getActiveViewLayer()
        .getViewController();
      assert.equal(viewController.setCurrentPosition.mock.calls.length, 1,
        'position still set');
    });

    test('onTap on a segment fires tap with the segments', () => {
      const layerGroup = makeMockLayerGroup();
      const maskViewLayer = makeMockMaskViewLayer([1, 3]);
      layerGroup.getViewLayers.mockImplementation(
        (callbackFn) => [maskViewLayer].filter(callbackFn));
      const taps = collect('tap');

      behavior.onTap(new Point2D(10, 20), layerGroup);

      assert.deepEqual(taps, [{
        position: [10, 20, 0],
        annotations: [],
        segments: [{dataid: 'mask-data-id', segmentnumbers: [1, 3]}]
      }]);
    });

    test('onTap on empty space fires tap with empty hits', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.getDrawLayers.mockReturnValue([
        makeMockDrawLayer(undefined),
        makeMockDrawLayer({trackingUid: 'hidden'}, false)
      ]);
      const maskViewLayer = makeMockMaskViewLayer([]);
      layerGroup.getViewLayers.mockImplementation(
        (callbackFn) => [maskViewLayer].filter(callbackFn));
      const taps = collect('tap');

      behavior.onTap(new Point2D(10, 20), layerGroup);

      assert.deepEqual(taps, [{
        position: [10, 20, 0],
        annotations: [],
        segments: []
      }]);
    });

    test('onTap fires no tap when no view layer', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.getActiveViewLayer.mockReturnValue(undefined);
      vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {});
      const taps = collect('tap');

      behavior.onTap(new Point2D(10, 20), layerGroup);

      assert.equal(taps.length, 0);
    });
  });
});
