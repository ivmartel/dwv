import {describe, test, assert} from 'vitest';
import {
  Tag,
  getTransferSyntaxUIDTag
} from '../../src/dicom/dicomTag.js';
import {getTagFromDictionary} from '../../src/dicom/dicomTagInfo.js';

/**
 * Tests for the 'dicom/dicomTagInfo.js' file.
 */

describe('dicom', () => {

  /**
   * Tests for {@link getTagFromDictionary}.
   *
   * @function module:tests/dicom~gettagfromdictionary
   */
  test('getTagFromDictionary', () => {
    const tag00 = getTagFromDictionary();
    assert.equal(tag00, undefined, 'get undefined');
    const tag01 = getTagFromDictionary(null);
    assert.equal(tag01, undefined, 'get null');
    const tag02 = getTagFromDictionary('null');
    assert.equal(tag02, undefined, 'get non existing');

    // empty tag name...
    const tag03 = getTagFromDictionary('');
    const refTag03 = new Tag('0008', '0202');
    assert.ok(tag03.equals(refTag03), 'get empty');

    const refTag10 = getTransferSyntaxUIDTag();

    // extra space
    const tag04 = getTagFromDictionary('TransferSyntaxUID ');
    assert.equal(tag04, undefined, 'get with extra space');
    // bad case
    const tag05 = getTagFromDictionary('TransferSyntaxUid');
    assert.equal(tag05, undefined, 'get with bad case');

    // working case
    const tag10 = getTagFromDictionary('TransferSyntaxUID');
    assert.ok(tag10.equals(refTag10), 'get test #0');
  });

});