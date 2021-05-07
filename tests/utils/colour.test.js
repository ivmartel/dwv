/**
 * Tests for the 'utils/colour' file.
 */
/** @module tests/utils */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('utils');

/**
 * Tests for {@link dwv.utils.ybrToRgb}.
 *
 * @function module:tests/utils~ybrToRgb
 */
QUnit.test('Test ybrToRgb.', function (assert) {
  var rgb00 = dwv.utils.ybrToRgb(0, 0, 0);
  assert.equal(rgb00.r, -179.456, 'ybr 0,0,0: red');
  assert.ok((rgb00.g - 135.459939) < 1e-6, 'ybr 0,0,0: green');
  assert.equal(rgb00.b, -226.816, 'ybr 0,0,0: blue');

  var rgb01 = dwv.utils.ybrToRgb(128, 128, 128);
  assert.equal(rgb01.r, 128, 'ybr 128,128,128: red');
  assert.equal(rgb01.g, 128, 'ybr 128,128,128: green');
  assert.equal(rgb01.b, 128, 'ybr 128,128,128: blue');

  var rgb02 = dwv.utils.ybrToRgb(255, 255, 255);
  assert.equal(rgb02.r, 433.054, 'ybr 255,255,255: red');
  assert.equal(rgb02.g, 120.59844, 'ybr 255,255,255: green');
  assert.equal(rgb02.b, 480.044, 'ybr 255,255,255: blue');
});
