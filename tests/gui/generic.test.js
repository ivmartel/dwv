// @vitest-environment jsdom
import {describe, test, assert} from 'vitest';
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

});