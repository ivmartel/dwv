// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {
  WheelBehavior,
  ScrollWheelBehavior,
  ZoomWheelBehavior
} from '../../../src/tools/behaviors/wheelBehavior.js';
import {
  makeMockLayerGroup,
  makeMockViewLayer,
  makeMockWheelEvent
} from './utils.js';

describe('tools/behaviors', () => {
  describe('WheelBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new WheelBehavior();
    });

    test('onWheel is a no-op by default', () => {
      const event = makeMockWheelEvent();
      const layerGroup = makeMockLayerGroup();
      // Should not throw
      behavior.onWheel(event, layerGroup);
      assert.ok(true);
    });

    test('onWheelTick is a no-op by default', () => {
      const layerGroup = makeMockLayerGroup();
      // Should not throw
      behavior.onWheelTick(true, layerGroup);
      assert.ok(true);
    });
  });

  describe('ScrollWheelBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new ScrollWheelBehavior();
    });

    test('onWheelTick increments scroll when up=true and canScroll', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.canScroll.mockReturnValue(true);
      const posHelper = layerGroup.getPositionHelper();

      behavior.onWheelTick(true, layerGroup);

      assert.equal(posHelper.incrementPositionAlongScroll.mock.calls.length, 1);
    });

    test('onWheelTick decrements scroll when up=false and canScroll', () => {
      const layerGroup = makeMockLayerGroup();
      layerGroup.canScroll.mockReturnValue(true);
      const posHelper = layerGroup.getPositionHelper();

      behavior.onWheelTick(false, layerGroup);

      assert.equal(posHelper.decrementPositionAlongScroll.mock.calls.length, 1);
    });

    test('onWheelTick increments dimension 3 when up=true and moreThanOne(3)',
      () => {
        const layerGroup = makeMockLayerGroup();
        layerGroup.canScroll.mockReturnValue(false);
        layerGroup.moreThanOne.mockReturnValue(true);
        const posHelper = layerGroup.getPositionHelper();

        behavior.onWheelTick(true, layerGroup);

        assert.equal(posHelper.incrementPosition.mock.calls.length, 1);
        const arg = posHelper.incrementPosition.mock.calls[0][0];
        assert.equal(arg, 3);
      }
    );

    test('onWheelTick decrements dimension 3 when up=false and moreThanOne(3)',
      () => {
        const layerGroup = makeMockLayerGroup();
        layerGroup.canScroll.mockReturnValue(false);
        layerGroup.moreThanOne.mockReturnValue(true);
        const posHelper = layerGroup.getPositionHelper();

        behavior.onWheelTick(false, layerGroup);

        assert.equal(posHelper.decrementPosition.mock.calls.length, 1);
        const arg = posHelper.decrementPosition.mock.calls[0][0];
        assert.equal(arg, 3);
      }
    );
  });

  describe('ZoomWheelBehavior', () => {
    let behavior;

    beforeEach(() => {
      behavior = new ZoomWheelBehavior();
    });

    test('onWheel zooms when layerGroup is defined', () => {
      const layerGroup = makeMockLayerGroup();
      const viewLayer = makeMockViewLayer();
      layerGroup.getActiveViewLayer.mockReturnValue(viewLayer);

      const event = makeMockWheelEvent(-120);
      behavior.onWheel(event, layerGroup);

      assert.equal(layerGroup.addScale.mock.calls.length, 1);
      assert.equal(layerGroup.draw.mock.calls.length, 1);
    });

    test('onWheel does nothing when layerGroup is undefined', () => {
      const event = makeMockWheelEvent(-120);
      // Should not throw
      behavior.onWheel(event, undefined);
      assert.ok(true);
    });

    test('onWheel computes correct zoom step', () => {
      const layerGroup = makeMockLayerGroup();
      const viewLayer = makeMockViewLayer();
      layerGroup.getActiveViewLayer.mockReturnValue(viewLayer);

      const event = makeMockWheelEvent(-500); // deltaY
      behavior.onWheel(event, layerGroup);

      const scaleArg = layerGroup.addScale.mock.calls[0][0];
      // step = -event.deltaY / 500 = -(-500) / 500 = 1
      assert.equal(scaleArg, 1);
    });
  });
});
