/**
 * Tests for the 'utils/colour' file.
 */
/** @module tests/utils */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('utils');

var isSimilar = function (a, b, tol) {
  if (typeof tol === 'undefined') {
    tol = 1e-6;
  }
  var diff = Math.abs(a - b);
  if (tol / diff > 10) {
    console.log('precision could be lower: ', diff, tol);
  }
  return diff < tol;
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
 * Tests for {@link dwv.utils.hexToRgb}.
 *
 * @function module:tests/utils~hexToRgb
 */
QUnit.test('Test hexToRgb.', function (assert) {
  var rgb00 = dwv.utils.hexToRgb('#000000');
  assert.equal(rgb00.r, 0, 'hexToRgb #000000: r');
  assert.equal(rgb00.g, 0, 'hexToRgb #000000: g');
  assert.equal(rgb00.b, 0, 'hexToRgb #000000: b');

  var rgb01 = dwv.utils.hexToRgb('#ffffff');
  assert.equal(rgb01.r, 255, 'hexToRgb #ffffff: r');
  assert.equal(rgb01.g, 255, 'hexToRgb #ffffff: g');
  assert.equal(rgb01.b, 255, 'hexToRgb #ffffff: b');

  var rgb02 = dwv.utils.hexToRgb('#7f7f7f');
  assert.equal(rgb02.r, 127, 'hexToRgb #7f7f7f: r');
  assert.equal(rgb02.g, 127, 'hexToRgb #7f7f7f: g');
  assert.equal(rgb02.b, 127, 'hexToRgb #7f7f7f: b');

  var rgb03 = dwv.utils.hexToRgb('#4e33d6');
  assert.equal(rgb03.r, 78, 'hexToRgb #4e33d6: r');
  assert.equal(rgb03.g, 51, 'hexToRgb #4e33d6: g');
  assert.equal(rgb03.b, 214, 'hexToRgb #4e33d6: b');
});

/**
 * Tests for {@link dwv.utils.isDarkColour}.
 *
 * @function module:tests/utils~isDarkColour
 */
QUnit.test('Test isDarkColour.', function (assert) {
  var test00 = dwv.utils.isDarkColour('#000000');
  assert.equal(test00, true, 'isDarkColour black');

  var test01 = dwv.utils.isDarkColour('#ffffff');
  assert.equal(test01, false, 'isDarkColour white');

  var test02 = dwv.utils.isDarkColour('#7f7f7f');
  assert.equal(test02, true, 'isDarkColour grey 0');

  var test03 = dwv.utils.isDarkColour('#7f7f8f');
  assert.equal(test03, false, 'isDarkColour grey 1');

  var test04 = dwv.utils.isDarkColour('#4e33d6');
  assert.equal(test04, true, 'isDarkColour blue');
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
 * Tests for {@link dwv.utils.ciexyzToCielab}.
 * ref: https://www.easyrgb.com/en/convert.php
 *
 * @function module:tests/utils~ciexyzToCielab
 */
QUnit.test('Test ciexyz to cielab.', function (assert) {
  var xyz00 = {x: 0, y: 0, z: 0};
  var lab00 = dwv.utils.ciexyzToCielab(xyz00);
  assert.ok(isSimilar(lab00.l, 0), 'xyz 0,0,0: l');
  assert.equal(lab00.a, 0, 'xyz 0,0,0: a');
  assert.equal(lab00.b, 0, 'xyz 0,0,0: b');

  var xyz01 = {x: 95.0489, y: 100, z: 108.884};
  var lab01 = dwv.utils.ciexyzToCielab(xyz01);
  assert.equal(lab01.l, 100, 'xyz 100,0,0: x');
  assert.equal(lab01.a, 0, 'xyz 100,0,0: y');
  assert.equal(lab01.b, 0, 'xyz 100,0,0: z');
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
 * Tests for {@link dwv.utils.srgbToCiexyz}.
 * ref: https://www.easyrgb.com/en/convert.php
 *
 * @function module:tests/utils~srgbToCiexyz
 */
QUnit.test('Test srgb to ciexyz.', function (assert) {
  var rgb00 = {r: 0, g: 0, b: 0};
  var xyz00 = dwv.utils.srgbToCiexyz(rgb00);
  assert.equal(xyz00.x, 0, 'rgb 0,0,0: x');
  assert.equal(xyz00.y, 0, 'rgb 0,0,0: y');
  assert.equal(xyz00.z, 0, 'rgb 0,0,0: z');

  var rgb01 = {r: 255, g: 255, b: 255};
  var xyz01 = dwv.utils.srgbToCiexyz(rgb01);
  // TODO: good enough precision?
  assert.ok(isSimilar(xyz01.x, 95.0489, 2e-3), 'rgb D65: x');
  assert.equal(xyz01.y, 100, 'rgb D65: y');
  assert.ok(isSimilar(xyz01.z, 108.884, 2e-2), 'rgb D65: z');
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

/**
 * Tests for {@link dwv.utils.srgbToCielab}.
 * ref: https://www.easyrgb.com/en/convert.php
 *
 * @function module:tests/utils~srgbToCielab
 */
QUnit.test('Test rgb to cielab.', function (assert) {
  var rgb00 = {r: 0, g: 0, b: 0};
  var lab00 = dwv.utils.srgbToCielab(rgb00);
  assert.ok(isSimilar(lab00.l, 0), 'rgb 0,0,0: l');
  assert.equal(lab00.a, 0, 'rgb 0,0,0: a');
  assert.equal(lab00.b, 0, 'rgb 0,0,0: b');

  var rgb01 = {r: 255, g: 255, b: 255};
  var lab01 = dwv.utils.srgbToCielab(rgb01);
  assert.equal(lab01.l, 100, 'rgb 100,0,0: l');
  // TODO: good enough precision?
  assert.ok(isSimilar(lab01.a, 0, 2e-3), 'rgb 100,0,0: a');
  assert.ok(isSimilar(lab01.b, 0, 1e-2), 'rgb 100,0,0: b');
});
