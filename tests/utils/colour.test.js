import {
  isEqualRgb,
  ybrToRgb,
  hexToRgb,
  rgbToHex,
  isDarkColour,
  cielabToCiexyz,
  ciexyzToCielab,
  ciexyzToSrgb,
  srgbToCiexyz,
  cielabToSrgb,
  srgbToCielab
} from '../../src/utils/colour';

/**
 * Tests for the 'utils/colour' file.
 */

/* global QUnit */
QUnit.module('utils');

const isSimilar = function (a, b, tol) {
  if (typeof tol === 'undefined') {
    tol = 1e-6;
  }
  const diff = Math.abs(a - b);
  if (tol / diff > 10) {
    console.log('precision could be lower: ', diff, tol);
  }
  return diff < tol;
};

/**
 * Tests for {@link isEqualRgb}.
 *
 * @function module:tests/utils~isequalrgb
 */
QUnit.test('isEqualRgb', function (assert) {
  const rgb00 = {r: 0, g: 0, b: 0};
  let rgb01;
  assert.ok(!isEqualRgb(rgb00, rgb01), 'equal undefined #0');
  assert.ok(!isEqualRgb(rgb01, rgb00), 'equal undefined #1');
  assert.ok(!isEqualRgb(rgb01, rgb01), 'equal undefined #2');
  const rgb02 = null;
  assert.ok(!isEqualRgb(rgb00, rgb02), 'equal null #0');
  assert.ok(!isEqualRgb(rgb02, rgb00), 'equal null #0');
  assert.ok(!isEqualRgb(rgb02, rgb02), 'equal null #2');

  const rgb03 = {r: undefined, g: undefined, b: undefined};
  assert.ok(!isEqualRgb(rgb00, rgb03), 'equal undefined prop #0');
  assert.ok(isEqualRgb(rgb03, rgb03), 'equal undefined prop #1');

  assert.ok(isEqualRgb(rgb00, rgb00), 'equal #0');

  const rgb20 = {r: 1, g: 0, b: 0};
  assert.ok(!isEqualRgb(rgb00, rgb20), 'not equal #0');
  const rgb21 = {r: 0, g: 1, b: 0};
  assert.ok(!isEqualRgb(rgb00, rgb21), 'not equal #1');
  const rgb22 = {r: 0, g: 0, b: 1};
  assert.ok(!isEqualRgb(rgb00, rgb22), 'not equal #2');
  const rgb23 = {r: 1, g: 1, b: 1};
  assert.ok(!isEqualRgb(rgb00, rgb23), 'not equal #3');
});

/**
 * Tests for {@link ybrToRgb}.
 *
 * @function module:tests/utils~ybrtorgb
 */
QUnit.test('ybrToRgb', function (assert) {
  const rgb00 = ybrToRgb(0, 0, 0);
  assert.equal(rgb00.r, -179.456, 'ybr 0,0,0: red');
  assert.ok(isSimilar(rgb00.g, 135.459839), 'ybr 0,0,0: green');
  assert.equal(rgb00.b, -226.816, 'ybr 0,0,0: blue');

  const rgb01 = ybrToRgb(128, 128, 128);
  assert.equal(rgb01.r, 128, 'ybr 128,128,128: red');
  assert.equal(rgb01.g, 128, 'ybr 128,128,128: green');
  assert.equal(rgb01.b, 128, 'ybr 128,128,128: blue');

  const rgb02 = ybrToRgb(255, 255, 255);
  assert.equal(rgb02.r, 433.054, 'ybr 255,255,255: red');
  assert.equal(rgb02.g, 120.59844, 'ybr 255,255,255: green');
  assert.equal(rgb02.b, 480.044, 'ybr 255,255,255: blue');
});

/**
 * Tests for {@link hexToRgb}.
 *
 * @function module:tests/utils~hextorgb
 */
QUnit.test('hexToRgb', function (assert) {
  const hex00 = '#000000';
  const rgb00 = hexToRgb(hex00);
  assert.equal(rgb00.r, 0, 'hexToRgb #00: r');
  assert.equal(rgb00.g, 0, 'hexToRgb #00: g');
  assert.equal(rgb00.b, 0, 'hexToRgb #00: b');
  assert.equal(rgbToHex(rgb00), hex00, 'rgbToHex #00');

  const hex01 = '#ffffff';
  const rgb01 = hexToRgb(hex01);
  assert.equal(rgb01.r, 255, 'hexToRgb #01: r');
  assert.equal(rgb01.g, 255, 'hexToRgb #01: g');
  assert.equal(rgb01.b, 255, 'hexToRgb #01: b');
  assert.equal(rgbToHex(rgb01), hex01, 'rgbToHex #01');

  const hex02 = '#7f7f7f';
  const rgb02 = hexToRgb(hex02);
  assert.equal(rgb02.r, 127, 'hexToRgb #02: r');
  assert.equal(rgb02.g, 127, 'hexToRgb #02: g');
  assert.equal(rgb02.b, 127, 'hexToRgb #02: b');
  assert.equal(rgbToHex(rgb02), hex02, 'rgbToHex #02');

  const hex03 = '#4e33d6';
  const rgb03 = hexToRgb(hex03);
  assert.equal(rgb03.r, 78, 'hexToRgb #03: r');
  assert.equal(rgb03.g, 51, 'hexToRgb #03: g');
  assert.equal(rgb03.b, 214, 'hexToRgb #03: b');
  assert.equal(rgbToHex(rgb03), hex03, 'rgbToHex #03');
});

/**
 * Tests for {@link isDarkColour}.
 *
 * @function module:tests/utils~isdarkcolour
 */
QUnit.test('isDarkColour', function (assert) {
  const test00 = isDarkColour('#000000');
  assert.equal(test00, true, 'isDarkColour black');

  const test01 = isDarkColour('#ffffff');
  assert.equal(test01, false, 'isDarkColour white');

  const test02 = isDarkColour('#7f7f7f');
  assert.equal(test02, true, 'isDarkColour grey 0');

  const test03 = isDarkColour('#7f7f8f');
  assert.equal(test03, false, 'isDarkColour grey 1');

  const test04 = isDarkColour('#4e33d6');
  assert.equal(test04, true, 'isDarkColour blue');
});

/**
 * Tests for {@link cielabToCiexyz}.
 *
 * Ref: {@link https://www.easyrgb.com/en/convert.php}.
 *
 * @function module:tests/utils~cielab-to-ciexyz
 */
QUnit.test('cielab to ciexyz', function (assert) {
  const lab00 = {l: 0, a: 0, b: 0};
  const xyz00 = cielabToCiexyz(lab00);
  assert.ok(isSimilar(xyz00.x, 0), 'lab 0,0,0: x');
  assert.ok(isSimilar(xyz00.y, 0), 'lab 0,0,0: y');
  assert.ok(isSimilar(xyz00.z, 0), 'lab 0,0,0: z');

  const lab01 = {l: 100, a: 0, b: 0};
  const xyz01 = cielabToCiexyz(lab01);
  assert.equal(xyz01.x, 95.0489, 'lab 100,0,0: x');
  assert.equal(xyz01.y, 100, 'lab 100,0,0: y');
  assert.equal(xyz01.z, 108.884, 'lab 100,0,0: z');
});

/**
 * Tests for {@link ciexyzToCielab}.
 *
 * Ref: {@link https://www.easyrgb.com/en/convert.php}.
 *
 * @function module:tests/utils~ciexyz-to-cielab
 */
QUnit.test('ciexyz to cielab', function (assert) {
  const xyz00 = {x: 0, y: 0, z: 0};
  const lab00 = ciexyzToCielab(xyz00);
  assert.ok(isSimilar(lab00.l, 0), 'xyz 0,0,0: l');
  assert.equal(lab00.a, 0, 'xyz 0,0,0: a');
  assert.equal(lab00.b, 0, 'xyz 0,0,0: b');

  const xyz01 = {x: 95.0489, y: 100, z: 108.884};
  const lab01 = ciexyzToCielab(xyz01);
  assert.equal(lab01.l, 100, 'xyz 100,0,0: x');
  assert.equal(lab01.a, 0, 'xyz 100,0,0: y');
  assert.equal(lab01.b, 0, 'xyz 100,0,0: z');
});

/**
 * Tests for {@link ciexyzToSrgb}.
 *
 * Ref: {@link https://www.easyrgb.com/en/convert.php}.
 *
 * @function module:tests/utils~ciexyz-to-srgb
 */
QUnit.test('ciexyz to srgb', function (assert) {
  const xyz00 = {x: 0, y: 0, z: 0};
  const rgb00 = ciexyzToSrgb(xyz00);
  assert.equal(rgb00.r, 0, 'xyz 0,0,0: r');
  assert.equal(rgb00.g, 0, 'xyz 0,0,0: g');
  assert.equal(rgb00.b, 0, 'xyz 0,0,0: b');

  const xyz01 = {x: 95.0489, y: 100, z: 108.884};
  const rgb01 = ciexyzToSrgb(xyz01);
  assert.equal(rgb01.r, 255, 'xyz D65: r');
  assert.equal(rgb01.g, 255, 'xyz D65: g');
  assert.equal(rgb01.b, 255, 'xyz D65: b');
});

/**
 * Tests for {@link srgbToCiexyz}.
 *
 * Ref: {@link https://www.easyrgb.com/en/convert.php}.
 *
 * @function module:tests/utils~srgb-to-ciexyz
 */
QUnit.test('srgb to ciexyz', function (assert) {
  const rgb00 = {r: 0, g: 0, b: 0};
  const xyz00 = srgbToCiexyz(rgb00);
  assert.equal(xyz00.x, 0, 'rgb 0,0,0: x');
  assert.equal(xyz00.y, 0, 'rgb 0,0,0: y');
  assert.equal(xyz00.z, 0, 'rgb 0,0,0: z');

  const rgb01 = {r: 255, g: 255, b: 255};
  const xyz01 = srgbToCiexyz(rgb01);
  // TODO: good enough precision?
  assert.ok(isSimilar(xyz01.x, 95.0489, 2e-3), 'rgb D65: x');
  assert.equal(xyz01.y, 100, 'rgb D65: y');
  assert.ok(isSimilar(xyz01.z, 108.884, 2e-2), 'rgb D65: z');
});

/**
 * Tests for {@link cielabToSrgb}.
 *
 * Ref: {@link https://www.easyrgb.com/en/convert.php}.
 *
 * @function module:tests/utils~cielab-to-srgb
 */
QUnit.test('cielab to rgb', function (assert) {
  const lab00 = {l: 0, a: 0, b: 0};
  const rgb00 = cielabToSrgb(lab00);
  assert.equal(rgb00.r, 0, 'lab 0,0,0: r');
  assert.equal(rgb00.g, 0, 'lab 0,0,0: g');
  assert.equal(rgb00.b, 0, 'lab 0,0,0: b');

  const lab01 = {l: 100, a: 0, b: 0};
  const rgb01 = cielabToSrgb(lab01);
  assert.equal(rgb01.r, 255, 'lab 100,0,0: r');
  assert.equal(rgb01.g, 255, 'lab 100,0,0: g');
  assert.equal(rgb01.b, 255, 'lab 100,0,0: b');
});

/**
 * Tests for {@link srgbToCielab}.
 *
 * Ref: {@link https://www.easyrgb.com/en/convert.php}.
 *
 * @function module:tests/utils~srgb-to-cielab
 */
QUnit.test('srgb to cielab', function (assert) {
  const rgb00 = {r: 0, g: 0, b: 0};
  const lab00 = srgbToCielab(rgb00);
  assert.ok(isSimilar(lab00.l, 0), 'rgb 0,0,0: l');
  assert.equal(lab00.a, 0, 'rgb 0,0,0: a');
  assert.equal(lab00.b, 0, 'rgb 0,0,0: b');

  const rgb01 = {r: 255, g: 255, b: 255};
  const lab01 = srgbToCielab(rgb01);
  assert.equal(lab01.l, 100, 'rgb 100,0,0: l');
  // TODO: good enough precision?
  assert.ok(isSimilar(lab01.a, 0, 2e-3), 'rgb 100,0,0: a');
  assert.ok(isSimilar(lab01.b, 0, 1e-2), 'rgb 100,0,0: b');
});
