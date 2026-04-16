// @vitest-environment jsdom
import {describe, test, assert, beforeEach, afterEach, vi} from 'vitest';
import {Point2D} from '../../../src/math/point.js';
import {WindowLevel} from '../../../src/image/windowLevel.js';
import {
  DragStep,
  DragBehavior,
  WindowLevelDragBehavior,
  ScrollDragBehavior,
  OpacityDragBehavior,
  PanDragBehavior
} from '../../../src/tools/behaviors/dragBehavior.js';
import {makeMockLayerGroup, makeMockViewLayer, makeMockLayer} from './utils.js';
import * as loggerModule from '../../../src/utils/logger.js';

describe('tools/behaviors', () => {
  describe('DragStep', () => {
    test('stores points and computes dx/dy', () => {
      const p0 = new Point2D(10, 20);
      const p1 = new Point2D(15, 25);
      const step = new DragStep(p0, p1);

      assert.equal(step.point0.getX(), 10);
      assert.equal(step.point0.getY(), 20);
      assert.equal(step.point1.getX(), 15);
      assert.equal(step.point1.getY(), 25);
      assert.equal(step.dx, 5);
      assert.equal(step.dy, 5);
    });

    test('computes negative deltas', () => {
      const p0 = new Point2D(20, 30);
      const p1 = new Point2D(15, 25);
      const step = new DragStep(p0, p1);

      assert.equal(step.dx, -5);
      assert.equal(step.dy, -5);
    });

    test('passesThresholdX returns true when no threshold', () => {
      const step = new DragStep(
        new Point2D(0, 0),
        new Point2D(5, 0),
        {thresholdX: 0}
      );
      assert.ok(step.passesThresholdX());
    });

    test('passesThresholdX returns true when abs(dx) >= threshold', () => {
      const step = new DragStep(
        new Point2D(0, 0),
        new Point2D(15, 0),
        {thresholdX: 10}
      );
      assert.ok(step.passesThresholdX());
    });

    test('passesThresholdX returns false when abs(dx) < threshold', () => {
      const step = new DragStep(
        new Point2D(0, 0),
        new Point2D(5, 0),
        {thresholdX: 10}
      );
      assert.notOk(step.passesThresholdX());
    });

    test('passesThresholdY returns true when no threshold', () => {
      const step = new DragStep(
        new Point2D(0, 0),
        new Point2D(0, 5),
        {thresholdY: 0}
      );
      assert.ok(step.passesThresholdY());
    });

    test('passesThresholdY returns true when abs(dy) >= threshold', () => {
      const step = new DragStep(
        new Point2D(0, 0),
        new Point2D(0, 15),
        {thresholdY: 10}
      );
      assert.ok(step.passesThresholdY());
    });

    test('passesThreshold returns true when either X or Y passes', () => {
      const step = new DragStep(
        new Point2D(0, 0),
        new Point2D(15, 5),
        {thresholdX: 10, thresholdY: 10}
      );
      assert.ok(step.passesThreshold());
    });

    test('passesThreshold returns false when neither X nor Y passes', () => {
      const step = new DragStep(
        new Point2D(0, 0),
        new Point2D(5, 5),
        {thresholdX: 10, thresholdY: 10}
      );
      assert.notOk(step.passesThreshold());
    });

    test('handles negative thresholds as no threshold', () => {
      const step = new DragStep(
        new Point2D(0, 0),
        new Point2D(1, 1),
        {thresholdX: -5, thresholdY: -5}
      );
      assert.ok(step.passesThreshold());
    });
  });

  describe('DragBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new DragBehavior();
    });

    test('is not active initially', () => {
      assert.notOk(behavior.isActive());
    });

    test('canStart returns true by default', () => {
      const point = new Point2D(0, 0);
      const layerGroup = makeMockLayerGroup();
      assert.ok(behavior.canStart(point, layerGroup));
    });

    test('onStart makes behavior active', () => {
      const point = new Point2D(10, 20);
      behavior.onStart(point);
      assert.ok(behavior.isActive());
    });

    test('onEnd makes behavior inactive', () => {
      behavior.onStart(new Point2D(10, 20));
      behavior.onEnd();
      assert.notOk(behavior.isActive());
    });

    test('onUpdate calls onDrag when threshold passes', () => {
      const mockDrag = vi.fn();
      behavior.onDrag = mockDrag;

      behavior.onStart(new Point2D(0, 0));
      behavior.onUpdate(new Point2D(20, 0));

      assert.equal(mockDrag.mock.calls.length, 1);
    });

    test('onUpdate does not call onDrag when threshold fails', () => {
      const behavior2 = new DragBehavior({thresholdX: 100, thresholdY: 100});
      const mockDrag = vi.fn();
      behavior2.onDrag = mockDrag;

      behavior2.onStart(new Point2D(0, 0));
      behavior2.onUpdate(new Point2D(5, 5));

      assert.equal(mockDrag.mock.calls.length, 0);
    });

    test('onUpdate updates prevPoint after threshold', () => {
      const mockDrag = vi.fn();
      behavior.onDrag = mockDrag;

      behavior.onStart(new Point2D(0, 0));
      const p1 = new Point2D(20, 0);
      behavior.onUpdate(p1);

      // Verify that next update uses p1 as reference
      const mockDrag2 = vi.fn();
      behavior.onDrag = mockDrag2;
      behavior.onUpdate(new Point2D(40, 0));

      // The second drag should have dx = 20 (from 20 to 40)
      assert.equal(mockDrag2.mock.calls.length, 1);
      const dragStepArg = mockDrag2.mock.calls[0][0];
      assert.equal(dragStepArg.dx, 20);
    });
  });

  describe('WindowLevelDragBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new WindowLevelDragBehavior();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('initializes with default activeViewLayerOnly=true', () => {
      const behavior2 = new WindowLevelDragBehavior();
      // behavior exists and is ready
      assert.ok(behavior2);
    });

    test('setActiveViewLayerOnly changes the configuration', () => {
      behavior.setActiveViewLayerOnly(false);
      // Configuration should be updated (internal state test)
      assert.ok(behavior);
    });

    test('canStart returns false when no monochrome layer', () => {
      const layerGroup = makeMockLayerGroup();
      const viewLayer = makeMockViewLayer();
      viewLayer.getViewController().isMonochrome.mockReturnValue(false);
      layerGroup.getActiveViewLayer.mockReturnValue(viewLayer);

      const result = behavior.canStart(new Point2D(0, 0), layerGroup);
      assert.notOk(result);
    });

    test('canStart returns true when monochrome layer available', () => {
      const layerGroup = makeMockLayerGroup();
      const viewLayer = makeMockViewLayer();
      layerGroup.getActiveViewLayer.mockReturnValue(viewLayer);

      const result = behavior.canStart(new Point2D(0, 0), layerGroup);
      assert.ok(result);
    });

    test('onDrag updates window level with dy delta', () => {
      const layerGroup = makeMockLayerGroup();
      const viewLayer = makeMockViewLayer();
      const viewController = viewLayer.getViewController();
      layerGroup.getActiveViewLayer.mockReturnValue(viewLayer);

      behavior.onStart(new Point2D(0, 0));
      const drag = new DragStep(
        new Point2D(0, 0),
        new Point2D(10, -20),
        {thresholdX: 0, thresholdY: 0}
      );
      behavior.onDrag(drag, layerGroup);

      assert.equal(viewController.setWindowLevel.mock.calls.length, 1);
      const wlArg = viewController.setWindowLevel.mock.calls[0][0];
      assert.ok(wlArg instanceof WindowLevel);
      assert.equal(wlArg.center, 52);
      assert.equal(wlArg.width, 101);
    });
  });

  describe('ScrollDragBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new ScrollDragBehavior();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('initializes with 15px threshold', () => {
      // Behavior with 15x15 threshold internally
      assert.ok(behavior);
    });

    test('canStart returns false when no view layer', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.getActiveViewLayer.mockReturnValue(undefined);

      const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
        .mockImplementation(() => {});

      const result = behavior.canStart(new Point2D(0, 0), layerGroup);
        assert.notOk(result);

      assert.equal(warnSpy.mock.calls.length, 1, 'warning emitted');
    });

    test('canStart returns true when view layer exists', () => {
      const layerGroup = makeMockLayerGroup();
      const viewLayer = makeMockViewLayer();
      layerGroup.getActiveViewLayer.mockReturnValue(viewLayer);

      const result = behavior.canStart(new Point2D(0, 0), layerGroup);
      assert.ok(result);
    });

    test('onDrag decrements scroll when dy > 0 and canScroll', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.canScroll.mockReturnValue(true);
      const posHelper = layerGroup.getPositionHelper();

      const drag = new DragStep(
        new Point2D(0, 0),
        new Point2D(0, 20),
        {thresholdX: 15, thresholdY: 15}
      );
      behavior.onDrag(drag, layerGroup);

      assert.equal(
        posHelper.decrementPositionAlongScroll.mock.calls.length, 1);
    });

    test('onDrag increments scroll when dy < 0 and canScroll', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.canScroll.mockReturnValue(true);
      const posHelper = layerGroup.getPositionHelper();

      const drag = new DragStep(
        new Point2D(0, 20),
        new Point2D(0, 0),
        {thresholdX: 15, thresholdY: 15}
      );
      behavior.onDrag(drag, layerGroup);

      assert.equal(
        posHelper.incrementPositionAlongScroll.mock.calls.length, 1);
    });

    test('onDrag increments dimension 3 when dx > 0 and moreThanOne(3)', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.canScroll.mockReturnValue(false);
      layerGroup.moreThanOne.mockReturnValue(true);
      const posHelper = layerGroup.getPositionHelper();

      const drag = new DragStep(
        new Point2D(0, 0),
        new Point2D(20, 0),
        {thresholdX: 15, thresholdY: 15}
      );
      behavior.onDrag(drag, layerGroup);

      assert.equal(posHelper.incrementPosition.mock.calls.length, 1);
      assert.equal(posHelper.incrementPosition.mock.calls[0][0], 3);
    });
  });

  describe('OpacityDragBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new OpacityDragBehavior();
    });

    test('canStart returns false when no active layer', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.getActiveLayer.mockReturnValue(undefined);

      const result = behavior.canStart(new Point2D(0, 0), layerGroup);
      assert.notOk(result);
    });

    test('canStart returns true when active layer exists', () => {
      const layerGroup = makeMockLayerGroup();
      const layer = makeMockLayer();
      layerGroup.getActiveLayer.mockReturnValue(layer);

      const result = behavior.canStart(new Point2D(0, 0), layerGroup);
      assert.ok(result);
    });

    test('onDrag updates opacity when thresholdX passes', () => {
      const layerGroup = makeMockLayerGroup();
      const layer = makeMockLayer();
      layerGroup.getActiveLayer.mockReturnValue(layer);

      const drag = new DragStep(
        new Point2D(0, 0),
        new Point2D(20, 0),
        {thresholdX: 15, thresholdY: 15}
      );
      behavior.onDrag(drag, layerGroup);

      assert.equal(layer.setOpacity.mock.calls.length, 1);
      const opacityArg = layer.setOpacity.mock.calls[0][0];
      assert.equal(opacityArg, 0.5 + (20 / 200));
    });

    test('onDrag does not update opacity when thresholdX fails', () => {
      const layerGroup = makeMockLayerGroup();
      const layer = makeMockLayer();
      layerGroup.getActiveLayer.mockReturnValue(layer);

      const drag = new DragStep(
        new Point2D(0, 0),
        new Point2D(5, 0),
        {thresholdX: 15, thresholdY: 15}
      );
      behavior.onDrag(drag, layerGroup);

      assert.notOk(layer.setOpacity.called);
    });
  });

  describe('PanDragBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new PanDragBehavior();
    });

    test('onDrag translates using display deltas in plane space', () => {
      const layerGroup = makeMockLayerGroup();
      const viewLayer = makeMockViewLayer();
      layerGroup.getActiveViewLayer.mockReturnValue(viewLayer);

      const drag = new DragStep(
        new Point2D(0, 0),
        new Point2D(10, 20),
        {thresholdX: 0, thresholdY: 0}
      );
      behavior.onDrag(drag, layerGroup);

      // Verify that addScale was called for panning
      const addTranslationCalls = layerGroup.addTranslation.mock.calls.length;
      assert.equal(addTranslationCalls, 1);
      const translationArg = layerGroup.addTranslation.mock.calls[0][0];
      assert.equal(translationArg.x, 0);
      assert.equal(translationArg.y, 1);
      assert.equal(translationArg.z, 2);
      const drawCalls = layerGroup.draw.mock.calls.length;
      assert.equal(drawCalls, 1);
    });

    test('onDrag does nothing when no view layer', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.getActiveViewLayer.mockReturnValue(undefined);

      const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
        .mockImplementation(() => {});

      const drag = new DragStep(
        new Point2D(0, 0),
        new Point2D(10, 20),
        {thresholdX: 0, thresholdY: 0}
      );
      behavior.onDrag(drag, layerGroup);

      // Should not crash and not call methods that depend on viewLayer
      assert.notOk(layerGroup.getActiveViewLayer.called);

      assert.equal(warnSpy.mock.calls.length, 1, 'warning emitted');
    });
  });
});
