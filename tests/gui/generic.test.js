/**
 * Tests for the 'gui/generic.js' file.
 */
/** @module tests/gui */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('gui');

/**
 * Tests for {@link dwv.gui.canCreateCanvas}.
 *
 * @function module:tests/gui~canCreateCanvas
 */
QUnit.test('Test canCreateCanvas.', function (assert) {
  assert.equal(dwv.gui.canCreateCanvas(1, 1), true,
    'Can create 1*1 canvas');

  assert.equal(dwv.gui.canCreateCanvas(512, 512), true,
    'Can create 512*512 canvas');
  assert.equal(dwv.gui.canCreateCanvas(1024, 1024), true,
    'Can create 1024*1024 canvas');

  // safari iOS (9-12) limit: 4096^2
  assert.equal(dwv.gui.canCreateCanvas(4097, 4097), true,
    'Can create 4096*4096 canvas');

  // firefox 88 limit: 11180^2
  // assert.equal(dwv.gui.canCreateCanvas(11181, 11181), true,
  //   'Can create 11181*11181 canvas');

  // limit for most browsers (06/2021): 16384^2
  assert.equal(dwv.gui.canCreateCanvas(16385, 16385), false,
    'Cannot create 16385*16385 canvas');
});
