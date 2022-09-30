/**
 * Tests for the 'dicom/dicomTag.js' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests for {@link dwv.dicom.Tag}.
 *
 * @function module:tests/dicom~Tag
 */
QUnit.test('Test Tag.', function (assert) {
  // error cases
  assert.throws(function () {
    new dwv.dicom.Tag();
  },
  new Error('Cannot create tag with no group.'),
  'tag with undef group and element.');

  assert.throws(function () {
    new dwv.dicom.Tag('');
  },
  new Error('Cannot create tag with no group.'),
  'tag with empty group.');
  assert.throws(function () {
    new dwv.dicom.Tag('0x12');
  },
  new Error('Cannot create tag with badly formed group.'),
  'tag with bad group #0.');
  assert.throws(function () {
    new dwv.dicom.Tag('1234');
  },
  new Error('Cannot create tag with badly formed group.'),
  'tag with bad group #1.');

  assert.throws(function () {
    new dwv.dicom.Tag('0x1234');
  },
  new Error('Cannot create tag with no element.'),
  'tag with undef element.');
  assert.throws(function () {
    new dwv.dicom.Tag('0x1234', '');
  },
  new Error('Cannot create tag with no element.'),
  'tag with empty element.');
  assert.throws(function () {
    new dwv.dicom.Tag('0x1234', '0x12');
  },
  new Error('Cannot create tag with badly formed element.'),
  'tag with bad element #0.');
  assert.throws(function () {
    new dwv.dicom.Tag('0x1234', '1234');
  },
  new Error('Cannot create tag with badly formed element.'),
  'tag with bad element #1.');

  var tag00 = new dwv.dicom.Tag('0x1111', '0x2222');
  assert.notOk(tag00.equals(null), 'equals to null');
  assert.notOk(tag00.equals(), 'equals to undef');
  var tag01 = new dwv.dicom.Tag('0x1112', '0x2222');
  assert.notOk(tag00.equals(tag01), 'not equals #0');
  var tag02 = new dwv.dicom.Tag('0x1111', '0x2221');
  assert.notOk(tag00.equals(tag02), 'not equals #1');
  assert.ok(tag00.equals(tag00), 'equals #0');

  assert.equal(tag00.getKey(), 'x11112222', 'get key');
  assert.equal(tag00.getKey2(), '11112222', 'get key 2');

  assert.ok(dwv.dicom.getTagFromKey('x11112222').equals(tag00),
    'getTagFromKey');
});
