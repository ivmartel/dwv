import {
  Tag,
  getTagFromDictionary,
  getTagFromKey,
  getTransferSyntaxUIDTag
} from '../../src/dicom/dicomTag';

/**
 * Tests for the 'dicom/dicomTag.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests for {@link Tag}.
 *
 * @function module:tests/dicom~Tag
 */
QUnit.test('Test Tag.', function (assert) {
  // error cases
  assert.throws(function () {
    new Tag();
  },
  new Error('Cannot create tag with no group.'),
  'tag with undef group and element.');

  assert.throws(function () {
    new Tag('');
  },
  new Error('Cannot create tag with no group.'),
  'tag with empty group.');
  assert.throws(function () {
    new Tag('0x12');
  },
  new Error('Cannot create tag with badly formed group.'),
  'tag with bad group #0.');
  assert.throws(function () {
    new Tag('1234');
  },
  new Error('Cannot create tag with badly formed group.'),
  'tag with bad group #1.');

  assert.throws(function () {
    new Tag('0x1234');
  },
  new Error('Cannot create tag with no element.'),
  'tag with undef element.');
  assert.throws(function () {
    new Tag('0x1234', '');
  },
  new Error('Cannot create tag with no element.'),
  'tag with empty element.');
  assert.throws(function () {
    new Tag('0x1234', '0x12');
  },
  new Error('Cannot create tag with badly formed element.'),
  'tag with bad element #0.');
  assert.throws(function () {
    new Tag('0x1234', '1234');
  },
  new Error('Cannot create tag with badly formed element.'),
  'tag with bad element #1.');

  const tag00 = new Tag('0x1111', '0x2222');
  assert.notOk(tag00.equals(null), 'equals to null');
  assert.notOk(tag00.equals(), 'equals to undef');
  const tag01 = new Tag('0x1112', '0x2222');
  assert.notOk(tag00.equals(tag01), 'not equals #0');
  const tag02 = new Tag('0x1111', '0x2221');
  assert.notOk(tag00.equals(tag02), 'not equals #1');
  assert.ok(tag00.equals(tag00), 'equals #0');

  assert.equal(tag00.getKey(), 'x11112222', 'get key');
  assert.equal(tag00.getKey2(), '11112222', 'get key 2');

  assert.ok(getTagFromKey('x11112222').equals(tag00),
    'getTagFromKey');
});

/**
 * Tests for {@link getTagFromDictionary}.
 *
 * @function module:tests/dicom~getTagFromDictionary
 */
QUnit.test('Test getTagFromDictionary.', function (assert) {
  const tag00 = getTagFromDictionary();
  assert.equal(tag00, null, 'get undefined');
  const tag01 = getTagFromDictionary(null);
  assert.equal(tag01, null, 'get null');
  const tag02 = getTagFromDictionary('null');
  assert.equal(tag02, null, 'get non existing');

  // empty tag name...
  const tag03 = getTagFromDictionary('');
  const refTag03 = new Tag('0x0008', '0x0202');
  assert.ok(tag03.equals(refTag03), 'get empty');

  const refTag10 = getTransferSyntaxUIDTag();

  // extra space
  const tag04 = getTagFromDictionary('TransferSyntaxUID ');
  assert.equal(tag04, null, 'get with extra space');
  // bad case
  const tag05 = getTagFromDictionary('TransferSyntaxUid');
  assert.equal(tag05, null, 'get with bad case');

  // working case
  const tag10 = getTagFromDictionary('TransferSyntaxUID');
  assert.ok(tag10.equals(refTag10), 'get test #0');
});