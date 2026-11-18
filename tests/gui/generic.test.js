// @vitest-environment jsdom
import {describe, test, assert, vi} from 'vitest';
import {
  canCreateCanvas,
  CanvasSizeChecker
} from '../../src/gui/generic.js';

/**
 * Tests for the 'gui/generic.js' file.
 */
/** @module tests/gui */

/**
 * Create a mock document whose canvases pass or fail
 * the canCreateCanvas test.
 *
 * @param {boolean} valid True if the canvases should pass.
 * @returns {object} The mock document.
 */
function createCanvasDocument(valid) {
  const alpha = valid ? 255 : 0;
  return {
    createElement: vi.fn(() => ({
      width: 0,
      height: 0,
      getContext: () => ({
        fillRect: () => {},
        drawImage: () => {},
        getImageData: () => ({data: [0, 0, 0, alpha]})
      })
    }))
  };
}

describe('gui', () => {

  /**
   * Tests for {@link canCreateCanvas}.
   *
   * @function module:tests/gui~cancreatecanvas
   */
  test('canCreateCanvas', () => {
    assert.equal(canCreateCanvas(1, 1, document), true,
      'Can create 1*1 canvas');

    assert.equal(canCreateCanvas(512, 512, document), true,
      'Can create 512*512 canvas');
    assert.equal(canCreateCanvas(1024, 1024, document), true,
      'Can create 1024*1024 canvas');

    // safari iOS (9-12) limit: 4096^2
    assert.equal(canCreateCanvas(4097, 4097, document), true,
      'Can create 4096*4096 canvas');

    // firefox 88 limit: 11180^2
    // assert.equal(canCreateCanvas(11181, 11181, document), true,
    //   'Can create 11181*11181 canvas');

    // limit for most browsers (06/2021): 16384^2
    // (node canvas used in tests does not have this limit)
    assert.equal(canCreateCanvas(16385, 16385, document), true,
      'Can create 16385*16385 canvas in node');

    // zero sizes
    assert.equal(canCreateCanvas(0, 512, document), false,
      'Cannot create 0*512 canvas');
    assert.equal(canCreateCanvas(512, 0, document), false,
      'Cannot create 512*0 canvas');
  });


  /**
   * Tests for {@link CanvasSizeChecker}.
   *
   * @function module:tests/gui~canvassizechecker
   */
  test('CanvasSizeChecker', () => {
    const checker = new CanvasSizeChecker();

    // valid: a smaller size uses the cache
    const validDoc = createCanvasDocument(true);
    assert.ok(checker.canCreate({x: 20, y: 20}, validDoc),
      'Can create 20*20 canvas');
    const validCalls = validDoc.createElement.mock.calls.length;
    assert.ok(validCalls > 0, 'Valid size is tested');
    assert.ok(checker.canCreate({x: 10, y: 15}, validDoc),
      'Can create 10*15 canvas');
    assert.equal(validDoc.createElement.mock.calls.length, validCalls,
      'Smaller than valid size uses the cache');

    // invalid: a larger size uses the cache
    const invalidDoc = createCanvasDocument(false);
    assert.notOk(checker.canCreate({x: 100, y: 100}, invalidDoc),
      'Cannot create 100*100 canvas');
    const invalidCalls = invalidDoc.createElement.mock.calls.length;
    assert.ok(invalidCalls > 0, 'Invalid size is tested');
    assert.notOk(checker.canCreate({x: 200, y: 100}, invalidDoc),
      'Cannot create 200*100 canvas');
    assert.equal(invalidDoc.createElement.mock.calls.length, invalidCalls,
      'Larger than invalid size uses the cache');

    // in between: tested
    assert.ok(checker.canCreate({x: 50, y: 10}, validDoc),
      'Can create 50*10 canvas');
    assert.ok(validDoc.createElement.mock.calls.length > validCalls,
      'Size not covered by the cache is tested');

    // zero size: not tested, not cached
    assert.notOk(checker.canCreate({x: 0, y: 50}, validDoc),
      'Cannot create 0*50 canvas');
    assert.ok(checker.canCreate({x: 5, y: 5}, validDoc),
      'Zero size is not cached as invalid');
  });

});