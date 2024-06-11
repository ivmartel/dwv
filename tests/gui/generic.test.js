import {canCreateCanvas} from '../../src/gui/generic';

/**
 * Tests for the 'gui/generic.js' file.
 */
/** @module tests/gui */

/* global QUnit */
QUnit.module('gui');

/**
 * Tests for {@link canCreateCanvas}.
 *
 * @function module:tests/gui~canCreateCanvas
 */
QUnit.test('canCreateCanvas', function (assert) {
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
  assert.equal(canCreateCanvas(16385, 16385), false,
    'Cannot create 16385*16385 canvas');
});
