import {isMonochrome} from '../../src/dicom/dicomImage.js';

/**
 * Tests for the 'dicom/dicomImage.js' file.
 */

// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('dicom');

/**
 * Tests for isMonochrome.
 *
 * @function module:tests/dicom~isMonochrome
 */
QUnit.test('isMonochrome', function (assert) {
  // ok
  assert.ok(isMonochrome('MONOCHROME1'), 'monochrome1');
  assert.ok(isMonochrome('MONOCHROME2'), 'monochrome2');
  // method tests that the string starts with MONOCHROME...
  assert.ok(isMonochrome('MONOCHROME'), 'monochrome');
  assert.ok(isMonochrome('MONOCHROME123'), 'monochrome123');

  // case sensitive
  assert.notOk(isMonochrome('monochrome1'), 'monochrome1');

  // not ok
  assert.notOk(isMonochrome(), 'undefined');
  assert.notOk(isMonochrome('abcd'), 'random');
  assert.notOk(isMonochrome('RGB'), 'rgb');
  assert.notOk(isMonochrome('PALETTE COLOR'), 'palette color');
});
