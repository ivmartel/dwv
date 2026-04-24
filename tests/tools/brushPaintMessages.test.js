// @vitest-environment node
import {describe, test, assert} from 'vitest';
import {ERROR_MESSAGES, formatString} from '../../src/tools/brushPaintMessages.js';

describe('brushPaintMessages', () => {
  describe('formatString', () => {
    test('replaces {0} with first value', () => {
      assert.equal(
        formatString('ID: {0}', 'abc'),
        'ID: abc'
      );
    });

    test('replaces multiple placeholders in order', () => {
      assert.equal(
        formatString('{1} then {0}', 'a', 'b'),
        'b then a'
      );
    });

    test('uses empty string for missing values', () => {
      assert.equal(formatString('x{0}x'), 'xx');
    });
  });

  describe('ERROR_MESSAGES.brush', () => {
    test('contains expected stable keys used by brush tooling', () => {
      assert.equal(
        ERROR_MESSAGES.brush.noSelectedSegmentNumber,
        'No selected segment number'
      );
      assert.equal(
        ERROR_MESSAGES.brush.unsupportedScrollIndex,
        'Unsupported scroll index: {0}'
      );
      assert.include(ERROR_MESSAGES.brush.noMaskId, 'mask');
    });
  });
});
