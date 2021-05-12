/**
 * Tests for the 'utils/colour' file.
 */
/** @module tests/utils */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('utils');

var isSimilar = function (a, b) {
  return Math.abs(a - b) < 1e-6;
};

/**
 * Tests for {@link dwv.utils.ybrToRgb}.
 *
 * @function module:tests/utils~ybrToRgb
 */
QUnit.test('Test ybrToRgb.', function (assert) {
  var rgb00 = dwv.utils.ybrToRgb(0, 0, 0);
  assert.equal(rgb00.r, -179.456, 'ybr 0,0,0: red');
  assert.ok(isSimilar(rgb00.g, 135.459839), 'ybr 0,0,0: green');
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

/**
 * Tests for {@link dwv.utils.cielabToCiexyz}.
 * ref: https://www.easyrgb.com/en/convert.php
 *
 * @function module:tests/utils~cielabToCiexyz
 */
QUnit.test('Test cielab to ciexyz.', function (assert) {
  var lab00 = {l: 0, a: 0, b: 0};
  var xyz00 = dwv.utils.cielabToCiexyz(lab00);
  assert.ok(isSimilar(xyz00.x, 0), 'lab 0,0,0: x');
  assert.ok(isSimilar(xyz00.y, 0), 'lab 0,0,0: y');
  assert.ok(isSimilar(xyz00.z, 0), 'lab 0,0,0: z');

  var lab01 = {l: 100, a: 0, b: 0};
  var xyz01 = dwv.utils.cielabToCiexyz(lab01);
  assert.equal(xyz01.x, 95.0489, 'lab 100,0,0: x');
  assert.equal(xyz01.y, 100, 'lab 100,0,0: y');
  assert.equal(xyz01.z, 108.884, 'lab 100,0,0: z');
});

/**
 * Tests for {@link dwv.utils.ciexyzToSrgb}.
 * ref: https://www.easyrgb.com/en/convert.php
 *
 * @function module:tests/utils~ciexyzToSrgb
 */
QUnit.test('Test ciexyz to srgb.', function (assert) {
  var xyz00 = {x: 0, y: 0, z: 0};
  var rgb00 = dwv.utils.ciexyzToSrgb(xyz00);
  assert.equal(rgb00.r, 0, 'xyz 0,0,0: r');
  assert.equal(rgb00.g, 0, 'xyz 0,0,0: g');
  assert.equal(rgb00.b, 0, 'xyz 0,0,0: b');

  var xyz01 = {x: 95.0489, y: 100, z: 108.884};
  var rgb01 = dwv.utils.ciexyzToSrgb(xyz01);
  assert.equal(rgb01.r, 255, 'xyz D65: r');
  assert.equal(rgb01.g, 255, 'xyz D65: g');
  assert.equal(rgb01.b, 255, 'xyz D65: b');
});

/**
 * Tests for {@link dwv.utils.cielabToSrgb}.
 * ref: https://www.easyrgb.com/en/convert.php
 *
 * @function module:tests/utils~cielabToSrgb
 */
QUnit.test('Test cielab to rgb.', function (assert) {
  var lab00 = {l: 0, a: 0, b: 0};
  var rgb00 = dwv.utils.cielabToSrgb(lab00);
  assert.equal(rgb00.r, 0, 'lab 0,0,0: r');
  assert.equal(rgb00.g, 0, 'lab 0,0,0: g');
  assert.equal(rgb00.b, 0, 'lab 0,0,0: b');

  var lab01 = {l: 100, a: 0, b: 0};
  var rgb01 = dwv.utils.cielabToSrgb(lab01);
  assert.equal(rgb01.r, 255, 'lab 100,0,0: r');
  assert.equal(rgb01.g, 255, 'lab 100,0,0: g');
  assert.equal(rgb01.b, 255, 'lab 100,0,0: b');
});
