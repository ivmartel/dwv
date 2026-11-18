// @vitest-environment jsdom
import {describe, test, assert, beforeEach} from 'vitest';
import {WheelTick} from '../../../src/tools/behaviors/wheelTick.js';
import {makeMockWheelEvent} from './utils.js';

describe('tools/behaviors', () => {
  describe('WheelTick', () => {
    let wheelTick;

    beforeEach(() => {
      wheelTick = new WheelTick();
    });

    test('initializes with sum=0', () => {
      assert.equal(wheelTick.getSum(), 0);
    });

    test('isTick returns false initially', () => {
      assert.notOk(wheelTick.isTick());
    });

    test('getSum returns accumulated spin', () => {
      const event = makeMockWheelEvent(120, 120);
      wheelTick.add(event);
      assert.equal(wheelTick.getSum(), 1);
    });

    test('add accumulates spin from wheel events', () => {
      const event1 = makeMockWheelEvent(120, 120);
      const event2 = makeMockWheelEvent(120, 120);
      wheelTick.add(event1);
      assert.equal(wheelTick.getSum(), 1);
      wheelTick.add(event2);
      assert.equal(wheelTick.getSum(), 2);
    });

    test('add handles negative deltaY', () => {
      const event = makeMockWheelEvent(-120, -120);
      wheelTick.add(event);
      // wheelDeltaY < -45 threshold returns -1
      assert.equal(wheelTick.getSum(), -1);
    });

    test('isTick returns true when abs(sum) >= 1', () => {
      const event = makeMockWheelEvent(120, 120);
      wheelTick.add(event);
      assert.ok(wheelTick.isTick());
    });

    test('isTick returns false when abs(sum) < 1', () => {
      const event = makeMockWheelEvent(50, 40);
      wheelTick.add(event);
      // wheelDeltaY=40 is below 45 threshold, uses -deltaY/60 = -50/60 ≈ -0.83
      assert.notOk(wheelTick.isTick());
    });

    test('clear resets accumulation', () => {
      const event = makeMockWheelEvent(120, 120);
      wheelTick.add(event);
      assert.equal(wheelTick.getSum(), 1);

      wheelTick.clear();
      assert.equal(wheelTick.getSum(), 0);
      assert.notOk(wheelTick.isTick());
    });

    test('isTick returns true for negative threshold', () => {
      const event = makeMockWheelEvent(-120, -120);
      wheelTick.add(event);
      assert.ok(wheelTick.isTick());
    });

    test('multiple events can reach tick threshold', () => {
      const event = makeMockWheelEvent(60, 30);
      // wheelDeltaY=30 is below 45 threshold, uses -deltaY/60 = -60/60 = -1
      wheelTick.add(event);
      assert.ok(wheelTick.isTick());

      wheelTick.clear();
      const event2 = makeMockWheelEvent(30, 30);
      // wheelDeltaY=30 is below 45 threshold, uses -deltaY/60 = -30/60 ≈ -0.5
      wheelTick.add(event2);
      assert.notOk(wheelTick.isTick());

      wheelTick.add(event2);
      assert.ok(wheelTick.isTick());
    });

    test('can accumulate multiple ticks', () => {
      const event = makeMockWheelEvent(120, 120);
      wheelTick.add(event);
      wheelTick.add(event);
      wheelTick.add(event);

      assert.equal(wheelTick.getSum(), 3);
      assert.ok(wheelTick.isTick());
    });

    test('clear works after multiple events', () => {
      const event = makeMockWheelEvent(120, 120);
      for (let i = 0; i < 5; i++) {
        wheelTick.add(event);
      }
      assert.equal(wheelTick.getSum(), 5);

      wheelTick.clear();
      assert.equal(wheelTick.getSum(), 0);
    });

    test('handles trackpad small delta values', () => {
      // Trackpad events typically have smaller deltaY
      const event = makeMockWheelEvent(30, 30);
      wheelTick.add(event);
      // Small trackpad events don't produce full ticks
      assert.notOk(wheelTick.isTick());
    });

    test('handles mouse wheel large delta values', () => {
      // Mouse wheel events typically have larger deltaY
      const event = makeMockWheelEvent(120, 240);
      wheelTick.add(event);
      assert.ok(wheelTick.isTick());
    });

    test('wheelDeltaY undefined falls back to deltaY normalization', () => {
      const event = {
        deltaY: 60,
        wheelDeltaY: undefined,
        preventDefault: () => {}
      };
      wheelTick.add(event);
      // When wheelDeltaY undefined, returns -deltaY = -60
      assert.ok(wheelTick.isTick());
    });

    test('normalizes positive wheelDeltaY to 1', () => {
      const event = {
        deltaY: -120,
        wheelDeltaY: 120,
        preventDefault: () => {}
      };
      wheelTick.add(event);
      assert.equal(wheelTick.getSum(), 1);
    });

    test('normalizes negative wheelDeltaY to -1', () => {
      const event = {
        deltaY: 120,
        wheelDeltaY: -120,
        preventDefault: () => {}
      };
      wheelTick.add(event);
      assert.equal(wheelTick.getSum(), -1);
    });

    test('handles wheelDeltaY below threshold as trackpad', () => {
      const event = {
        deltaY: 30,
        wheelDeltaY: 30,
        preventDefault: () => {}
      };
      wheelTick.add(event);
      // Below threshold, should use deltaY / 60 normalization
      assert.notOk(wheelTick.isTick());
    });

    test('isTick boundary at exactly 1', () => {
      const event1 = makeMockWheelEvent(30, 30);
      const event2 = makeMockWheelEvent(30, 30);

      wheelTick.add(event1);
      // wheelDeltaY=30 is below 45 threshold, uses -deltaY/60 = -30/60 ≈ -0.5
      assert.notOk(wheelTick.isTick());

      wheelTick.add(event2);
      // sum = -0.5 + -0.5 = -1, which is at the boundary
      assert.ok(wheelTick.isTick());
    });
  });
});
