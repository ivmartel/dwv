// @vitest-environment node
import {describe, test, assert, vi, beforeEach} from 'vitest';
import {
  BrushMaskPaint,
  BrushMode
} from '../../src/tools/brushMaskPaint.js';

describe('BrushMaskPaint', () => {
  /** @type {BrushMaskPaint} */
  let paint;

  beforeEach(() => {
    paint = new BrushMaskPaint({app: {}});
  });

  test('defaults: brush size 10, mode del, no segment', () => {
    assert.equal(paint.getBrushSize(), 10);
    assert.equal(paint.getBrushMode(), BrushMode.Del);
    assert.equal(typeof paint.getSelectedSegmentNumber(), 'undefined');
  });

  test('setFeatures clamps brush size to range', () => {
    paint.setFeatures({
      brushSizeRange: {min: 2, max: 10},
      brushSize: 100
    });
    assert.equal(paint.getBrushSize(), 9);
    paint.setFeatures({brushSize: 1});
    assert.equal(paint.getBrushSize(), 2);
  });

  test('brushSizeAdd dispatches brushsizechange when size changes', () => {
    const spy = vi.fn();
    paint.addEventListener('brushsizechange', spy);
    paint.setFeatures({brushSizeRange: {min: 1, max: 20}, brushSize: 5});
    paint.setFeatures({brushSizeAdd: 1});
    assert.equal(spy.mock.calls.length, 1);
    assert.equal(spy.mock.calls[0][0].detail.value, 6);
  });

  test('brushSizeAdd does not dispatch when clamped unchanged', () => {
    const spy = vi.fn();
    paint.addEventListener('brushsizechange', spy);
    paint.setFeatures({brushSizeRange: {min: 1, max: 20}, brushSize: 19});
    spy.mockClear();
    paint.setFeatures({brushSizeAdd: 1});
    assert.equal(spy.mock.calls.length, 0);
  });

  test('setBrushMode delegates to setFeatures', () => {
    paint.setBrushMode(BrushMode.Add);
    assert.equal(paint.getBrushMode(), BrushMode.Add);
  });

  test('setFeatures updates selected segment number', () => {
    paint.setFeatures({selectedSegmentNumber: 3});
    assert.equal(paint.getSelectedSegmentNumber(), 3);
    paint.setFeatures({selectedSegmentNumber: 2});
    assert.equal(paint.getSelectedSegmentNumber(), 2);
  });
});
