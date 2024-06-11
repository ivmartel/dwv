import {
  capitaliseFirstLetter,
  startsWith,
  endsWith,
  getFlags,
  replaceFlags,
  getFileExtension,
  precisionRound
} from '../../src/utils/string';

/**
 * Tests for the 'utils/string' file.
 */

/* global QUnit */
QUnit.module('utils');

/**
 * Tests for {@link capitaliseFirstLetter}.
 *
 * @function module:tests/utils~capitalisefirstletter
 */
QUnit.test('CapitaliseFirstLetter', function (assert) {
  // undefined
  assert.equal(capitaliseFirstLetter(), null, 'Capitalise undefined');
  // null
  assert.equal(capitaliseFirstLetter(null), null, 'Capitalise null');
  // empty
  assert.equal(capitaliseFirstLetter(''), '', 'Capitalise empty');
  // short
  assert.equal(
    capitaliseFirstLetter('a'), 'A', 'Capitalise one letter');
  // space first
  assert.equal(capitaliseFirstLetter(' a'), ' a', 'Capitalise space');
  // regular
  assert.equal(
    capitaliseFirstLetter('dicom'), 'Dicom', 'Capitalise regular');
  assert.equal(
    capitaliseFirstLetter('Dicom'),
    'Dicom',
    'Capitalise regular no need');
  // with spaces
  assert.equal(
    capitaliseFirstLetter('le ciel est bleu'),
    'Le ciel est bleu',
    'Capitalise sentence');
});

/**
 * Tests for {@link startsWith}.
 *
 * @function module:tests/utils~startswith
 */
QUnit.test('StartsWith', function (assert) {
  // undefined
  assert.equal(startsWith(), false, 'StartsWith undefined');
  assert.equal(
    startsWith('test'),
    false, 'StartsWith start undefined');
  // null
  assert.equal(startsWith(null), false, 'StartsWith null');
  assert.equal(
    startsWith('test', null),
    false, 'StartsWith start null');
  // empty
  assert.equal(startsWith('', ''), true, 'StartsWith empty');
  assert.equal(
    startsWith('test', ''),
    true, 'StartsWith start empty');
  // short
  assert.equal(startsWith('a', 'a'), true, 'StartsWith one letter');
  assert.equal(
    startsWith('a', 'A'),
    false,
    'StartsWith one letter case sensitive');
  // start bigger than input
  assert.equal(
    startsWith('a', 'aba'),
    false, 'StartsWith large start');
  // space
  assert.equal(
    startsWith(' test', ' '),
    true, 'StartsWith start space');
  assert.equal(
    startsWith(' test', 'a'),
    false, 'StartsWith with space');
  // regular
  assert.equal(
    startsWith('Winter is coming.', 'W'), true, 'StartsWith test#0');
  assert.equal(
    startsWith('Winter is coming.', 'Winter'),
    true, 'StartsWith test#1');
  assert.equal(
    startsWith('Winter is coming.', 'WINT'),
    false, 'StartsWith test#2');
  assert.equal(
    startsWith('Winter is coming.', 'Winter is'),
    true, 'StartsWith test#3');
  assert.equal(
    startsWith('Winter is coming.', 'Winter is coming.'),
    true, 'StartsWith test#4');
});

/**
 * Tests for {@link endsWith}.
 *
 * @function module:tests/utils~endswith
 */
QUnit.test('EndsWith', function (assert) {
  // undefined
  assert.equal(endsWith(), false, 'EndsWith undefined');
  assert.equal(endsWith('test'), false, 'EndsWith end undefined');
  // null
  assert.equal(endsWith(null), false, 'EndsWith null');
  assert.equal(endsWith('test', null), false, 'EndsWith end null');
  // empty
  assert.equal(endsWith('', ''), true, 'EndsWith empty');
  assert.equal(endsWith('test', ''), true, 'EndsWith end empty');
  // short
  assert.equal(endsWith('a', 'a'), true, 'EndsWith one letter');
  assert.equal(
    endsWith('a', 'A'),
    false,
    'EndsWith one letter case sensitive');
  // end bigger than input
  assert.equal(endsWith('a', 'aba'), false, 'EndsWith large end');
  // space
  assert.equal(endsWith('test ', ' '), true, 'EndsWith end space');
  assert.equal(endsWith('test ', 'a'), false, 'EndsWith with space');
  // regular
  assert.equal(
    endsWith('Winter is coming.', '.'), true, 'EndsWith test#0');
  assert.equal(
    endsWith('Winter is coming.', 'coming.'),
    true, 'EndsWith test#1');
  assert.equal(
    endsWith('Winter is coming.', 'ING.'),
    false, 'EndsWith test#2');
  assert.equal(
    endsWith('Winter is coming.', 'is coming.'),
    true, 'EndsWith test#3');
  assert.equal(
    endsWith('Winter is coming.', 'Winter is coming.'),
    true, 'EndsWith test#4');
});

/**
 * Tests for {@link getFlags}.
 *
 * @function module:tests/utils~getflags
 */
QUnit.test('getFlags', function (assert) {
  // empty
  assert.equal(
    getFlags('').length, 0, 'getFlags empty');
  // null
  assert.equal(
    getFlags(null).length, 0, 'getFlags null');
  // undefined
  assert.equal(
    getFlags().length, 0, 'getFlags undefined');
  // nothing to do
  const str00 = 'abcd';
  assert.equal(
    getFlags(str00).length, 0, 'getFlags nothing to do');
  // empty braces
  const str01 = '{}';
  assert.equal(
    getFlags(str01).length, 0, 'getFlags empty braces');

  // real #0
  const str10 = '{a}';
  assert.equal(
    getFlags(str10)[0], 'a', 'getFlags #0');
  // real #1
  const str11 = 'aaa{a}aaa';
  assert.equal(
    getFlags(str11)[0], 'a', 'getFlags #1');
  // real #2
  const str12 = '{a}-{b}-{c}';
  const res12 = getFlags(str12);
  assert.equal(res12[0], 'a', 'getFlags #2.0');
  assert.equal(res12[1], 'b', 'getFlags #2.1');
  assert.equal(res12[2], 'c', 'getFlags #2.2');
  // real #3
  const str13 = '{a{b}}';
  assert.equal(
    getFlags(str13)[0], 'b', 'getFlags #3');
});

/**
 * Tests for {@link replaceFlags}.
 *
 * @function module:tests/utils~replaceflags
 */
QUnit.test('ReplaceFlags', function (assert) {
  // empty/null
  assert.equal(replaceFlags('', null), '', 'ReplaceFlags empty/null');
  // null/null
  assert.equal(
    replaceFlags(null, null), '', 'ReplaceFlags null/null');
  // empty/undefined
  assert.equal(replaceFlags(''), '', 'ReplaceFlags empty/undefined');
  // real
  let str = '{a}';
  let values = {a: {value: 33, unit: 'ohm'}};
  assert.equal(
    replaceFlags(str, values), '33.00 ohm', 'ReplaceFlags real');
  // real surrounded
  str = 'Resistance:{a}.';
  values = {a: {value: 33, unit: 'ohm'}};
  assert.equal(
    replaceFlags(str, values),
    'Resistance:33.00 ohm.',
    'ReplaceFlags surrounded');
  // real no unit
  str = '{a}';
  values = {a: {value: 33}};
  assert.equal(
    replaceFlags(str, values), '33.00', 'ReplaceFlags real no unit');
  // no match
  str = '{a}';
  values = {b: {value: 33, unit: 'ohm'}};
  assert.equal(
    replaceFlags(str, values), '{a}', 'ReplaceFlags no match');
  // no value
  str = '{a}';
  values = {a: {unit: 'ohm'}};
  assert.equal(
    replaceFlags(str, values), '{a}', 'ReplaceFlags no value');
  // nothing to do
  str = 'a';
  values = {a: {value: 33, unit: 'ohm'}};
  assert.equal(
    replaceFlags(str, values), 'a', 'ReplaceFlags nothing to do');
  // nothing to do no values
  str = 'a';
  values = {};
  assert.equal(
    replaceFlags(str, values),
    'a',
    'ReplaceFlags nothing to do no values');
});

/**
 * Tests for {@link getFileExtension}.
 *
 * @function module:tests/utils~getfileextension
 */
QUnit.test('getFileExtension', function (assert) {
  // undefined
  assert.equal(
    getFileExtension(), null, 'getFileExtension undefined');
  // null
  assert.equal(getFileExtension(null), null, 'getFileExtension null');
  // empty
  assert.equal(getFileExtension(''), null, 'getFileExtension empty');
  // dot
  assert.equal(getFileExtension('.'), null, 'getFileExtension dot');
  // no extension
  assert.equal(
    getFileExtension('filename'),
    null, 'getFileExtension no extension');
  // test #00
  const test00 = 'image.png';
  const res00 = 'png';
  assert.equal(
    getFileExtension(test00), res00, 'getFileExtension 00: simple');
  // test #01
  const test01 = 'IMAGE.PNG';
  const res01 = 'png';
  assert.equal(
    getFileExtension(test01), res01,
    'getFileExtension 01: upper case');
  // test #02
  const test02 = 'image.10.png';
  const res02 = 'png';
  assert.equal(
    getFileExtension(test02), res02,
    'getFileExtension 02: multiple dots');
  // test #03
  const test03 = '.profile';
  const res03 = null;
  assert.equal(
    getFileExtension(test03), res03,
    'getFileExtension 04: start with dot');
  // test #04
  const test04 = 'MR.1.3.12.123456.123456789';
  const res04 = null;
  assert.equal(
    getFileExtension(test04), res04,
    'getFileExtension 03: dots and numbers');

  // test #10
  const test10 = '/path/to/file/image.png';
  const res10 = 'png';
  assert.equal(
    getFileExtension(test10), res10, 'getFileExtension 10');
  // test #11
  const test11 = 'domain.org/path/to/file/image.png';
  const res11 = 'png';
  assert.equal(
    getFileExtension(test11), res11, 'getFileExtension 11');
  // test #12
  const test12 = 'domain.org/path/to/file/IMAGE';
  const res12 = null;
  assert.equal(
    getFileExtension(test12), res12, 'getFileExtension 12');
});

/**
 * Tests for {@link precisionRound}.
 *
 * @function module:tests/utils~precisionround
 */
QUnit.test('precisionRound', function (assert) {
  // just to be sure...
  assert.equal(Math.round(-0.6), -1, 'test round #00');
  assert.equal(Math.round(-0.5), 0, 'test round #01');
  assert.equal(Math.round(0.5), 1, 'test round #02');
  assert.equal(Math.round(1.5), 2, 'test round #03');

  assert.equal(precisionRound(-0.004, 2), 0, 'test #00');
  assert.equal(precisionRound(-0.005, 2), 0, 'test #01');
  assert.equal(precisionRound(-0.006, 2), -0.01, 'test #02');

  assert.equal(precisionRound(0.004, 2), 0, 'test #10');
  assert.equal(precisionRound(0.005, 2), 0.01, 'test #11');
  assert.equal(precisionRound(0.006, 2), 0.01, 'test #1');

  assert.equal(precisionRound(1.004, 2), 1, 'test #20');
  assert.equal(precisionRound(1.005, 2), 1.01, 'test #21');
  assert.equal(precisionRound(1.006, 2), 1.01, 'test #22');

  assert.equal(precisionRound(1.05, 1), 1.1, 'test #31');
  assert.equal(precisionRound(1.0005, 3), 1.001, 'test #31');
  assert.equal(precisionRound(1.00005, 4), 1.0001, 'test #31');
  assert.equal(precisionRound(1.000005, 5), 1.00001, 'test #31');

  assert.equal(precisionRound(1234.5, 0), 1235, 'test #40');
  assert.equal(precisionRound(1234.56, 0), 1235, 'test #41');
  assert.equal(precisionRound(1234.5, 1), 1234.5, 'test #42');
  assert.equal(precisionRound(1234.56, 1), 1234.6, 'test #43');
  assert.equal(precisionRound(1234.5, 2), 1234.5, 'test #44');
  assert.equal(precisionRound(1234.56, 2), 1234.56, 'test #45');
  assert.equal(precisionRound(1234.566, 2), 1234.57, 'test #46');
  assert.equal(precisionRound(1234.5666, 2), 1234.57, 'test #47');

});
