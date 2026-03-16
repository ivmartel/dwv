import {describe, test, assert, beforeEach} from 'vitest';
import {
  MaskSegmentViewHelper
} from '../../src/image/maskSegmentViewHelper.js';

/**
 * Tests for the 'image/maskSegmentViewHelper.js' file.
 */

describe('image', () => {

  let helper;

  beforeEach(() => {
    helper = new MaskSegmentViewHelper();
  });

  /**
   * Tests that isHidden returns false for a segment never added.
   *
   * @function module:tests/image~mask-segment-view-helper-is-hidden-initial
   */
  test('MaskSegmentViewHelper isHidden returns false initially', () => {
    assert.notOk(helper.isHidden(1));
    assert.notOk(helper.isHidden(99));
  });

  /**
   * Tests that a segment is hidden after addToHidden.
   *
   * @function module:tests/image~mask-segment-view-helper-add-to-hidden
   */
  test('MaskSegmentViewHelper addToHidden makes segment hidden', () => {
    helper.addToHidden(1);
    assert.ok(helper.isHidden(1), 'hidden after add');
    assert.notOk(helper.isHidden(2), 'other segments unaffected');
  });

  /**
   * Tests that addToHidden is a no-op for an already-hidden segment.
   *
   * @function module:tests/image~mask-segment-view-helper-add-duplicate
   */
  test('MaskSegmentViewHelper addToHidden ignores duplicate', () => {
    helper.addToHidden(1);
    helper.addToHidden(1); // duplicate — should not throw or double-add
    helper.removeFromHidden(1);
    assert.notOk(helper.isHidden(1), 'single remove is enough');
  });

  /**
   * Tests that removeFromHidden unhides a hidden segment.
   *
   * @function module:tests/image~mask-segment-view-helper-remove-from-hidden
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
   * @function module:tests/image~mask-segment-view-helper-remove-unknown
   */
  test('MaskSegmentViewHelper removeFromHidden is a no-op for unknown', () => {
    helper.addToHidden(1);
    helper.removeFromHidden(99); // no-op
    assert.ok(helper.isHidden(1), 'existing segment unaffected');
  });

  /**
   * Tests that multiple segments can be independently hidden and shown.
   *
   * @function module:tests/image~mask-segment-view-helper-multiple
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
