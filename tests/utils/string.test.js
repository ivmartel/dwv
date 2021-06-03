/**
 * Tests for the 'utils/string' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */
QUnit.module('string');

/**
 * Tests for {@link dwv.utils.capitaliseFirstLetter}.
 *
 * @function module:tests/utils~capitaliseFirstLetter
 */
QUnit.test('Test CapitaliseFirstLetter.', function (assert) {
  // undefined
  assert.equal(dwv.utils.capitaliseFirstLetter(), null, 'Capitalise undefined');
  // null
  assert.equal(dwv.utils.capitaliseFirstLetter(null), null, 'Capitalise null');
  // empty
  assert.equal(dwv.utils.capitaliseFirstLetter(''), '', 'Capitalise empty');
  // short
  assert.equal(
    dwv.utils.capitaliseFirstLetter('a'), 'A', 'Capitalise one letter');
  // space first
  assert.equal(dwv.utils.capitaliseFirstLetter(' a'), ' a', 'Capitalise space');
  // regular
  assert.equal(
    dwv.utils.capitaliseFirstLetter('dicom'), 'Dicom', 'Capitalise regular');
  assert.equal(
    dwv.utils.capitaliseFirstLetter('Dicom'),
    'Dicom',
    'Capitalise regular no need');
  // with spaces
  assert.equal(
    dwv.utils.capitaliseFirstLetter('le ciel est bleu'),
    'Le ciel est bleu',
    'Capitalise sentence');
});

/**
 * Tests for {@link dwv.utils.endsWith}.
 *
 * @function module:tests/utils~endsWith
 */
QUnit.test('Test EndsWith.', function (assert) {
  // undefined
  assert.equal(dwv.utils.endsWith(), false, 'EndsWith undefined');
  assert.equal(dwv.utils.endsWith('test'), false, 'EndsWith end undefined');
  // null
  assert.equal(dwv.utils.endsWith(null), false, 'EndsWith null');
  assert.equal(dwv.utils.endsWith('test', null), false, 'EndsWith end null');
  // empty
  assert.equal(dwv.utils.endsWith('', ''), true, 'EndsWith empty');
  assert.equal(dwv.utils.endsWith('test', ''), true, 'EndsWith end empty');
  // short
  assert.equal(dwv.utils.endsWith('a', 'a'), true, 'EndsWith one letter');
  assert.equal(
    dwv.utils.endsWith('a', 'A'),
    false,
    'EndsWith one letter case sensitive');
  // end bigger than input
  assert.equal(dwv.utils.endsWith('a', 'aba'), false, 'EndsWith large end');
  // space
  assert.equal(dwv.utils.endsWith('test ', ' '), true, 'EndsWith end space');
  assert.equal(dwv.utils.endsWith('test ', 'a'), false, 'EndsWith with space');
  // regular
  assert.equal(
    dwv.utils.endsWith('Winter is coming.', '.'), true, 'EndsWith test#0');
  assert.equal(
    dwv.utils.endsWith('Winter is coming.', 'coming.'),
    true, 'EndsWith test#1');
  assert.equal(
    dwv.utils.endsWith('Winter is coming.', 'ING.'),
    false, 'EndsWith test#2');
  assert.equal(
    dwv.utils.endsWith('Winter is coming.', 'is coming.'),
    true, 'EndsWith test#3');
  assert.equal(
    dwv.utils.endsWith('Winter is coming.', 'Winter is coming.'),
    true, 'EndsWith test#4');
});

/**
 * Tests for {@link dwv.utils.getFlags}.
 *
 * @function module:tests/utils~getFlags
 */
QUnit.test('Test getFlags.', function (assert) {
  // empty
  assert.equal(
    dwv.utils.getFlags('').length, 0, 'getFlags empty');
  // null
  assert.equal(
    dwv.utils.getFlags(null).length, 0, 'getFlags null');
  // undefined
  assert.equal(
    dwv.utils.getFlags().length, 0, 'getFlags undefined');
  // nothing to do
  var str00 = 'abcd';
  assert.equal(
    dwv.utils.getFlags(str00).length, 0, 'getFlags nothing to do');
  // empty braces
  var str01 = '{}';
  assert.equal(
    dwv.utils.getFlags(str01).length, 0, 'getFlags empty braces');

  // real #0
  var str10 = '{a}';
  assert.equal(
    dwv.utils.getFlags(str10)[0], 'a', 'getFlags #0');
  // real #1
  var str11 = 'aaa{a}aaa';
  assert.equal(
    dwv.utils.getFlags(str11)[0], 'a', 'getFlags #1');
  // real #2
  var str12 = '{a}-{b}-{c}';
  var res12 = dwv.utils.getFlags(str12);
  assert.equal(res12[0], 'a', 'getFlags #2.0');
  assert.equal(res12[1], 'b', 'getFlags #2.1');
  assert.equal(res12[2], 'c', 'getFlags #2.2');
  // real #3
  var str13 = '{a{b}}';
  assert.equal(
    dwv.utils.getFlags(str13)[0], 'b', 'getFlags #3');
});

/**
 * Tests for {@link dwv.utils.replaceFlags}.
 *
 * @function module:tests/utils~replaceFlags
 */
QUnit.test('Test ReplaceFlags.', function (assert) {
  // empty/null
  assert.equal(dwv.utils.replaceFlags('', null), '', 'ReplaceFlags empty/null');
  // null/null
  assert.equal(
    dwv.utils.replaceFlags(null, null), '', 'ReplaceFlags null/null');
  // empty/undefined
  assert.equal(dwv.utils.replaceFlags(''), '', 'ReplaceFlags empty/undefined');
  // real
  var str = '{a}';
  var values = {a: {value: 33, unit: 'ohm'}};
  assert.equal(
    dwv.utils.replaceFlags(str, values), '33.00 ohm', 'ReplaceFlags real');
  // real surrounded
  str = 'Resistance:{a}.';
  values = {a: {value: 33, unit: 'ohm'}};
  assert.equal(
    dwv.utils.replaceFlags(str, values),
    'Resistance:33.00 ohm.',
    'ReplaceFlags surrounded');
  // real no unit
  str = '{a}';
  values = {a: {value: 33}};
  assert.equal(
    dwv.utils.replaceFlags(str, values), '33.00', 'ReplaceFlags real no unit');
  // no match
  str = '{a}';
  values = {b: {value: 33, unit: 'ohm'}};
  assert.equal(
    dwv.utils.replaceFlags(str, values), '{a}', 'ReplaceFlags no match');
  // no value
  str = '{a}';
  values = {a: {unit: 'ohm'}};
  assert.equal(
    dwv.utils.replaceFlags(str, values), '{a}', 'ReplaceFlags no value');
  // nothing to do
  str = 'a';
  values = {a: {value: 33, unit: 'ohm'}};
  assert.equal(
    dwv.utils.replaceFlags(str, values), 'a', 'ReplaceFlags nothing to do');
  // nothing to do no values
  str = 'a';
  values = {};
  assert.equal(
    dwv.utils.replaceFlags(str, values),
    'a',
    'ReplaceFlags nothing to do no values');
});

/**
 * Tests for {@link dwv.utils.getFileExtension}.
 *
 * @function module:tests/utils~getFileExtension
 */
QUnit.test('Test getFileExtension.', function (assert) {
  // undefined
  assert.equal(
    dwv.utils.getFileExtension(), null, 'getFileExtension undefined');
  // null
  assert.equal(dwv.utils.getFileExtension(null), null, 'getFileExtension null');
  // empty
  assert.equal(dwv.utils.getFileExtension(''), null, 'getFileExtension empty');
  // no extension
  assert.equal(
    dwv.utils.getFileExtension('filename'),
    null, 'getFileExtension no extension');
  // test #00
  var test00 = 'image.png';
  var res00 = 'png';
  assert.equal(
    dwv.utils.getFileExtension(test00), res00, 'getFileExtension 00');
  // test #01
  var test01 = 'IMAGE.PNG';
  var res01 = 'png';
  assert.equal(
    dwv.utils.getFileExtension(test01), res01, 'getFileExtension 01');
  // test #02
  var test02 = 'image.10.png';
  var res02 = 'png';
  assert.equal(
    dwv.utils.getFileExtension(test02), res02, 'getFileExtension 02');
  // test #10
  var test10 = '/path/to/file/image.png';
  var res10 = 'png';
  assert.equal(
    dwv.utils.getFileExtension(test10), res10, 'getFileExtension 10');
  // test #11
  var test11 = 'domain.org/path/to/file/image.png';
  var res11 = 'png';
  assert.equal(
    dwv.utils.getFileExtension(test11), res11, 'getFileExtension 11');
});
