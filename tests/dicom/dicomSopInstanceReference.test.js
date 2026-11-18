import {describe, test, assert} from 'vitest';
import {
  SopInstanceReference,
  getSopInstanceReference,
  getDicomSopInstanceReferenceItem
} from '../../src/dicom/dicomSopInstanceReference.js';
import {DataElement} from '../../src/dicom/dataElement.js';

/**
 * Tests for the 'dicom/dicomSopInstanceReference.js' file.
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  ReferencedSOPClassUID: '00081150',
  ReferencedSOPInstanceUID: '00081155'
};

describe('dicom', () => {

  describe('SopInstanceReference', () => {

    /**
     * Tests for {@link SopInstanceReference}.
     *
     * @function module:tests/dicom~sopinstancereferenceGoodInput
     */
    test('good input', () => {
      const ref = new SopInstanceReference();
      assert.isUndefined(ref.referencedSOPClassUID);
      assert.isUndefined(ref.referencedSOPInstanceUID);
    });

    /**
     * Tests for {@link SopInstanceReference} toString.
     *
     * @function module:tests/dicom~sopinstancereferenceTostring
     */
    test('toString', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPClassUID = '1.2.840.10008.5.1.4.1.1.2';
      ref.referencedSOPInstanceUID = '1.2.3.4.5';

      const result = ref.toString();
      assert.equal(
        result,
        '1.2.3.4.5 (class: 1.2.840.10008.5.1.4.1.1.2)'
      );
    });

    /**
     * Tests for {@link SopInstanceReference} toString only SOPInstanceUID.
     *
     * @function module:tests/dicom~sopinstancereferenceTostringSopinstance
     */
    test('toString SOPinstance', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPInstanceUID = '1.2.3.4.5';

      const result = ref.toString();
      assert.equal(result, '1.2.3.4.5 (class: undefined)');
    });

    /**
     * Tests for {@link SopInstanceReference} toString only SOPClassUID.
     *
     * @function module:tests/dicom~sopinstancereferenceTostringSopclass
     */
    test('toString SOPClass', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPClassUID = '1.2.840.10008.5.1.4.1.1.2';

      const result = ref.toString();
      assert.equal(result, 'undefined (class: 1.2.840.10008.5.1.4.1.1.2)');
    });

    /**
     * Tests for {@link SopInstanceReference} undefined toString.
     *
     * @function module:tests/dicom~sopinstancereferenceUndefinedTostring
     */
    test('undefined toString', () => {
      const ref = new SopInstanceReference();
      const result = ref.toString();
      assert.equal(result, 'undefined (class: undefined)');
    });

    /**
     * Tests for {@link SopInstanceReference} round trip.
     *
     * @function module:tests/dicom~sopinstancereferenceRoundTrip
     */
    test('round trip', () => {
      const de1 = new DataElement('UI');
      de1.value = ['1.2.840.10008.5.1.4.1.1.2'];
      const de2 = new DataElement('UI');
      de2.value = ['1.2.3.4.5'];

      const originalDataElements = {
        [TagKeys.ReferencedSOPClassUID]: de1,
        [TagKeys.ReferencedSOPInstanceUID]: de2
      };

      // Convert dataElements to ref
      const ref1 = getSopInstanceReference(originalDataElements);
      // Convert ref to item
      const item = getDicomSopInstanceReferenceItem(ref1);
      // Create new ref from item
      const ref2 = new SopInstanceReference();
      if (typeof item.ReferencedSOPClassUID !== 'undefined') {
        ref2.referencedSOPClassUID = item.ReferencedSOPClassUID;
      }
      if (typeof item.ReferencedSOPInstanceUID !== 'undefined') {
        ref2.referencedSOPInstanceUID = item.ReferencedSOPInstanceUID;
      }

      // Verify round-trip
      assert.equal(ref1.referencedSOPClassUID, ref2.referencedSOPClassUID);
      assert.equal(ref1.referencedSOPInstanceUID,
        ref2.referencedSOPInstanceUID);
    });

  });

  describe('getSopInstanceReference', () => {

    /**
     * Tests for {@link getSopInstanceReference}.
     *
     * @function module:tests/dicom~getsopinstancereferenceGoodInput
     */
    test('good input', () => {
      const de1 = new DataElement('UI');
      de1.value = ['1.2.840.10008.5.1.4.1.1.2'];
      const de2 = new DataElement('UI');
      de2.value = ['1.2.3.4.5'];

      const dataElements = {
        [TagKeys.ReferencedSOPClassUID]: de1,
        [TagKeys.ReferencedSOPInstanceUID]: de2
      };

      const ref = getSopInstanceReference(dataElements);

      assert.equal(ref.referencedSOPClassUID, '1.2.840.10008.5.1.4.1.1.2');
      assert.equal(ref.referencedSOPInstanceUID, '1.2.3.4.5');
    });

    /**
     * Tests for {@link getSopInstanceReference} only SOPClassUID.
     *
     * @function module:tests/dicom~getsopinstancereferenceSopclass
     */
    test('SOPClass', () => {
      const de1 = new DataElement('UI');
      de1.value = ['1.2.840.10008.5.1.4.1.1.2'];

      const dataElements = {
        [TagKeys.ReferencedSOPClassUID]: de1
      };

      const ref = getSopInstanceReference(dataElements);

      assert.equal(ref.referencedSOPClassUID, '1.2.840.10008.5.1.4.1.1.2');
      assert.isUndefined(ref.referencedSOPInstanceUID);
    });

    /**
     * Tests for {@link getSopInstanceReference} only SOPInstanceUID.
     *
     * @function module:tests/dicom~getsopinstancereferenceSopinstance
     */
    test('SOPInstance', () => {
      const de2 = new DataElement('UI');
      de2.value = ['1.2.3.4.5'];

      const dataElements = {
        [TagKeys.ReferencedSOPInstanceUID]: de2
      };

      const ref = getSopInstanceReference(dataElements);

      assert.isUndefined(ref.referencedSOPClassUID);
      assert.equal(ref.referencedSOPInstanceUID, '1.2.3.4.5');
    });

    /**
     * Tests for {@link getSopInstanceReference} empty.
     *
     * @function module:tests/dicom~getsopinstancereferenceEmpty
     */
    test('empty', () => {
      const dataElements = {};
      const ref = getSopInstanceReference(dataElements);

      assert.isUndefined(ref.referencedSOPClassUID);
      assert.isUndefined(ref.referencedSOPInstanceUID);
    });

    /**
     * Tests for {@link getSopInstanceReference} other tag.
     *
     * @function module:tests/dicom~getsopinstancereferenceOtherTag
     */
    test('other tag', () => {
      const de1 = new DataElement('UI');
      de1.value = ['1.2.840.10008.5.1.4.1.1.2'];
      const de2 = new DataElement('UI');
      de2.value = ['1.2.3.4.5'];
      const de3 = new DataElement('PN');
      de3.value = ['Doe^John'];

      const dataElements = {
        [TagKeys.ReferencedSOPClassUID]: de1,
        [TagKeys.ReferencedSOPInstanceUID]: de2,
        '00100010': de3
      };

      const ref = getSopInstanceReference(dataElements);

      assert.equal(ref.referencedSOPClassUID, '1.2.840.10008.5.1.4.1.1.2');
      assert.equal(ref.referencedSOPInstanceUID, '1.2.3.4.5');
    });

    /**
     * Tests for {@link getSopInstanceReference} multiple.
     *
     * @function module:tests/dicom~getsopinstancereferenceMultiple
     */
    test('multiple', () => {
      const de1 = new DataElement('UI');
      de1.value = ['1.2.840.10008.5.1.4.1.1.2', '1.2.3'];
      const de2 = new DataElement('UI');
      de2.value = ['1.2.3.4.5', '5.6.7.8.9'];

      const dataElements = {
        [TagKeys.ReferencedSOPClassUID]: de1,
        [TagKeys.ReferencedSOPInstanceUID]: de2
      };

      const ref = getSopInstanceReference(dataElements);

      assert.equal(ref.referencedSOPClassUID, '1.2.840.10008.5.1.4.1.1.2');
      assert.equal(ref.referencedSOPInstanceUID, '1.2.3.4.5');
    });

  });

  describe('getDicomSopInstanceReferenceItem', () => {

    /**
     * Tests for {@link getDicomSopInstanceReferenceItem}.
     *
     * @function module:tests/dicom~getdicomsopinstancereferenceitemGoodInput
     */
    test('good input', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPClassUID = '1.2.840.10008.5.1.4.1.1.2';
      ref.referencedSOPInstanceUID = '1.2.3.4.5';

      const item = getDicomSopInstanceReferenceItem(ref);

      assert.equal(item.ReferencedSOPClassUID, '1.2.840.10008.5.1.4.1.1.2');
      assert.equal(item.ReferencedSOPInstanceUID, '1.2.3.4.5');
    });

    /**
     * Tests for {@link getDicomSopInstanceReferenceItem} with SOPClassUID.
     *
     * @function module:tests/dicom~getdicomsopinstancereferenceitemSopclass
     */
    test('SOPClass', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPClassUID = '1.2.840.10008.5.1.4.1.1.2';

      const item = getDicomSopInstanceReferenceItem(ref);

      assert.equal(item.ReferencedSOPClassUID, '1.2.840.10008.5.1.4.1.1.2');
      assert.isUndefined(item.ReferencedSOPInstanceUID);
    });

    /**
     * Tests for {@link getDicomSopInstanceReferenceItem} with SOPInstanceUID.
     *
     * @function module:tests/dicom~getdicomsopinstancereferenceitemSopinstance
     */
    test('SOPInstance', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPInstanceUID = '1.2.3.4.5';

      const item = getDicomSopInstanceReferenceItem(ref);

      assert.isUndefined(item.ReferencedSOPClassUID);
      assert.equal(item.ReferencedSOPInstanceUID, '1.2.3.4.5');
    });

    /**
     * Tests for {@link getDicomSopInstanceReferenceItem} undefined.
     *
     * @function module:tests/dicom~getdicomsopinstancereferenceitemUndefined
     */
    test('undefined', () => {
      const ref = new SopInstanceReference();
      const item = getDicomSopInstanceReferenceItem(ref);

      assert.deepEqual(item, {});
    });

    /**
     * Tests for {@link getDicomSopInstanceReferenceItem} name mapping.
     *
     * @function module:tests/dicom~getdicomsopinstancereferenceitemMapping
     */
    test('mapping', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPClassUID = '1.2.3';
      ref.referencedSOPInstanceUID = '4.5.6';

      const item = getDicomSopInstanceReferenceItem(ref);

      // Check that camelCase is converted to PascalCase
      assert.ok('ReferencedSOPClassUID' in item);
      assert.ok('ReferencedSOPInstanceUID' in item);
    });

  });

});
