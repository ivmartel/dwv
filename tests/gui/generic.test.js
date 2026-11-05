// @vitest-environment jsdom
import {describe, test, assert, vi} from 'vitest';
import {canCreateCanvas} from '../../src/gui/generic.js';

/**
 * Tests for the 'gui/generic.js' file.
 */
/** @module tests/gui */

describe('gui', () => {

  /**
   * Tests for {@link canCreateCanvas}.
   *
   * @function module:tests/gui~cancreatecanvas
   */
  test('canCreateCanvas', () => {
    assert.equal(canCreateCanvas(1, 1), true,
      'Can create 1*1 canvas');

    assert.equal(canCreateCanvas(512, 512), true,
      'Can create 512*512 canvas');
    assert.equal(canCreateCanvas(1024, 1024), true,
      'Can create 1024*1024 canvas');

    // safari iOS (9-12) limit: 4096^2
    assert.equal(canCreateCanvas(4097, 4097), true,
      'Can create 4096*4096 canvas');

    // firefox 88 limit: 11180^2
    // assert.equal(canCreateCanvas(11181, 11181), true,
    //   'Can create 11181*11181 canvas');

    // limit for most browsers (06/2021): 16384^2
    assert.equal(canCreateCanvas(16385, 16385), true,
      'Cannot create 16385*16385 canvas');
  });

  /**
   * Tests that {@link canCreateCanvas} only asks for a read optimised
   * context for the canvas it reads back.
   *
   * @function module:tests/gui~cancreatecanvasWillReadFrequently
   */
  test('canCreateCanvas uses willReadFrequently on crop canvas', () => {
    const getContextArgs = [];
    const createElement = document.createElement.bind(document);
    const spy = vi.spyOn(document, 'createElement')
      .mockImplementation((tag) => {
        const element = createElement(tag);
        if (tag === 'canvas') {
          const getContext = element.getContext.bind(element);
          element.getContext = (...args) => {
            getContextArgs.push(args);
            return getContext(...args);
          };
        }
        return element;
      });

    canCreateCanvas(2, 2);
    spy.mockRestore();

    assert.deepEqual(getContextArgs, [
      ['2d'],
      ['2d', {willReadFrequently: true}]
    ], 'test canvas: default, crop canvas: willReadFrequently');
  });

});