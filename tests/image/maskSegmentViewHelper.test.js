import {describe, test, assert, beforeEach, vi, afterEach} from 'vitest';
import {
  MaskSegmentViewHelper
} from '../../src/image/maskSegmentViewHelper.js';
import * as loggerModule from '../../src/utils/logger.js';

/**
 * Tests for the 'image/maskSegmentViewHelper.js' file.
 */

describe('image', () => {

  let helper;

  beforeEach(() => {
    helper = new MaskSegmentViewHelper();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Tests that isHidden returns false for a segment never added.
   *
   * @function module:tests/image~maskSegmentViewHelperIsHiddenInitial
   */
  test('MaskSegmentViewHelper isHidden returns false initially', () => {
    assert.notOk(helper.isHidden(1));
    assert.notOk(helper.isHidden(99));
  });

  /**
   * Tests that a segment is hidden after addToHidden.
   *
   * @function module:tests/image~maskSegmentViewHelperAddToHidden
   */
  test('MaskSegmentViewHelper addToHidden makes segment hidden', () => {
    helper.addToHidden(1);
    assert.ok(helper.isHidden(1), 'hidden after add');
    assert.notOk(helper.isHidden(2), 'other segments unaffected');
  });

  /**
   * Tests that addToHidden is a no-op for an already-hidden segment.
   *
   * @function module:tests/image~maskSegmentViewHelperAddDuplicate
   */
  test('MaskSegmentViewHelper addToHidden ignores duplicate', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});

    helper.addToHidden(1);
    helper.addToHidden(1); // duplicate — should not throw or double-add
    helper.removeFromHidden(1);
    assert.notOk(helper.isHidden(1), 'single remove is enough');

    assert.equal(warnSpy.mock.calls.length, 1, 'warning on addToHidden');
    assert.ok(warnSpy.mock.calls[0][0].includes('1'),
      'warning mentions the segment number');
  });

  /**
   * Tests that removeFromHidden unhides a hidden segment.
   *
   * @function module:tests/image~maskSegmentViewHelperRemoveFromHidden
   */
  test('MaskSegmentViewHelper removeFromHidden unhides a segment', () => {
    helper.addToHidden(1);
    helper.addToHidden(2);
    helper.removeFromHidden(1);
    assert.notOk(helper.isHidden(1), 'segment 1 removed');
    assert.ok(helper.isHidden(2), 'segment 2 unaffected');
  });

  /**
   * Tests that removeFromHidden is a no-op for a segment not in the list.
   *
   * @function module:tests/image~maskSegmentViewHelperRemoveUnknown
   */
  test('MaskSegmentViewHelper removeFromHidden is a no-op for unknown', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});

    helper.addToHidden(1);
    helper.removeFromHidden(99); // no-op
    assert.ok(helper.isHidden(1), 'existing segment unaffected');

    assert.equal(warnSpy.mock.calls.length, 1, 'warning on removeFromHidden');
    assert.ok(warnSpy.mock.calls[0][0].includes('99'),
      'warning mentions the segment number');
  });

  /**
   * Tests that multiple segments can be independently hidden and shown.
   *
   * @function module:tests/image~maskSegmentViewHelperMultiple
   */
  test('MaskSegmentViewHelper manages multiple segments independently', () => {
    helper.addToHidden(1);
    helper.addToHidden(2);
    helper.addToHidden(3);
    helper.removeFromHidden(2);
    assert.ok(helper.isHidden(1), 'seg 1 still hidden');
    assert.notOk(helper.isHidden(2), 'seg 2 removed');
    assert.ok(helper.isHidden(3), 'seg 3 still hidden');
  });

});
