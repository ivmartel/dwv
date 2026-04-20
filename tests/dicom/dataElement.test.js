import {describe, test, assert} from 'vitest';
import {
  DataElement,
  safeGet,
  safeGetAll,
  checkDataElement
} from '../../src/dicom/dataElement.js';

/**
 * Tests for the 'dicom/dataElement.js' file.
 */
/** @module tests/dicom */

describe('dicom', () => {

  /**
   * Tests for {@link DataElement} using simple DICOM data.
   *
   * @function module:tests/dicom~dataElementClass
   */
  test('Data element class', () => {
    assert.equal(checkDataElement(), ' undefined is undefined,',
      'checkDE empty #0');
    assert.equal(checkDataElement(undefined, 'a'), ' a is undefined,',
      'checkDE empty #1');

    const de0 = new DataElement('OB');
    const des0 = {a: de0};

    assert.equal(safeGet(des0, 'a'), undefined, 'safeGet #01');
    assert.equal(safeGetAll(des0, 'a'), undefined, 'safeGet #02');
    assert.equal(checkDataElement(de0), ' undefined has undefined value,',
      'checkDE #01');
    assert.equal(checkDataElement(de0, 'a'), ' a has undefined value,',
      'checkDE #02');
    assert.equal(checkDataElement(de0, 'a', [1]), ' a has undefined value,',
      'checkDE #03');

    de0.value = [];

    assert.equal(safeGet(des0, 'a'), undefined, 'safeGet #11');
    assert.deepEqual(safeGetAll(des0, 'a'), undefined, 'safeGet #12');
    assert.equal(checkDataElement(de0), ' undefined is empty,',
      'checkDE #11');
    assert.equal(checkDataElement(de0, 'a'), ' a is empty,',
      'checkDE #12');
    assert.equal(checkDataElement(de0, 'a', [1]), ' a is empty,',
      'checkDE #13');

    de0.value = [1];

    assert.equal(safeGet(des0, 'a'), 1, 'safeGet #21');
    assert.deepEqual(safeGetAll(des0, 'a'), [1], 'safeGet #22');
    assert.equal(checkDataElement(de0), '',
      'checkDE #21');
    assert.equal(checkDataElement(de0, 'a'), '',
      'checkDE #22');
    assert.equal(checkDataElement(de0, 'a', [1]), '',
      'checkDE #23');
    assert.equal(checkDataElement(de0, 'a', [1, 2]),
      ' a does not contain 2 (value: 1),',
      'checkDE #24');

  });

});
