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

    test('constructor creates instance', () => {
      const ref = new SopInstanceReference();
      assert.isUndefined(ref.referencedSOPClassUID);
      assert.isUndefined(ref.referencedSOPInstanceUID);
    });

    test('toString with both properties set', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPClassUID = '1.2.840.10008.5.1.4.1.1.2';
      ref.referencedSOPInstanceUID = '1.2.3.4.5';

      const result = ref.toString();
      assert.equal(
        result,
        '1.2.3.4.5 (class: 1.2.840.10008.5.1.4.1.1.2)'
      );
    });

    test('toString with only SOPInstanceUID set', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPInstanceUID = '1.2.3.4.5';

      const result = ref.toString();
      assert.equal(result, '1.2.3.4.5 (class: undefined)');
    });

    test('toString with only SOPClassUID set', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPClassUID = '1.2.840.10008.5.1.4.1.1.2';

      const result = ref.toString();
      assert.equal(result, 'undefined (class: 1.2.840.10008.5.1.4.1.1.2)');
    });

    test('toString with neither property set', () => {
      const ref = new SopInstanceReference();
      const result = ref.toString();
      assert.equal(result, 'undefined (class: undefined)');
    });

  });

  describe('getSopInstanceReference', () => {

    test('extracts both UIDs from dataElements', () => {
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

    test('extracts only SOPClassUID when present', () => {
      const de1 = new DataElement('UI');
      de1.value = ['1.2.840.10008.5.1.4.1.1.2'];

      const dataElements = {
        [TagKeys.ReferencedSOPClassUID]: de1
      };

      const ref = getSopInstanceReference(dataElements);

      assert.equal(ref.referencedSOPClassUID, '1.2.840.10008.5.1.4.1.1.2');
      assert.isUndefined(ref.referencedSOPInstanceUID);
    });

    test('extracts only SOPInstanceUID when present', () => {
      const de2 = new DataElement('UI');
      de2.value = ['1.2.3.4.5'];

      const dataElements = {
        [TagKeys.ReferencedSOPInstanceUID]: de2
      };

      const ref = getSopInstanceReference(dataElements);

      assert.isUndefined(ref.referencedSOPClassUID);
      assert.equal(ref.referencedSOPInstanceUID, '1.2.3.4.5');
    });

    test('handles empty dataElements', () => {
      const dataElements = {};
      const ref = getSopInstanceReference(dataElements);

      assert.isUndefined(ref.referencedSOPClassUID);
      assert.isUndefined(ref.referencedSOPInstanceUID);
    });

    test('handles dataElements with other tags', () => {
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

    test('takes first value when array has multiple values', () => {
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

    test('converts both properties to item', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPClassUID = '1.2.840.10008.5.1.4.1.1.2';
      ref.referencedSOPInstanceUID = '1.2.3.4.5';

      const item = getDicomSopInstanceReferenceItem(ref);

      assert.equal(item.ReferencedSOPClassUID, '1.2.840.10008.5.1.4.1.1.2');
      assert.equal(item.ReferencedSOPInstanceUID, '1.2.3.4.5');
    });

    test('includes only defined SOPClassUID', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPClassUID = '1.2.840.10008.5.1.4.1.1.2';

      const item = getDicomSopInstanceReferenceItem(ref);

      assert.equal(item.ReferencedSOPClassUID, '1.2.840.10008.5.1.4.1.1.2');
      assert.isUndefined(item.ReferencedSOPInstanceUID);
    });

    test('includes only defined SOPInstanceUID', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPInstanceUID = '1.2.3.4.5';

      const item = getDicomSopInstanceReferenceItem(ref);

      assert.isUndefined(item.ReferencedSOPClassUID);
      assert.equal(item.ReferencedSOPInstanceUID, '1.2.3.4.5');
    });

    test('returns empty object when no properties set', () => {
      const ref = new SopInstanceReference();
      const item = getDicomSopInstanceReferenceItem(ref);

      assert.deepEqual(item, {});
    });

    test('maintains property name mapping', () => {
      const ref = new SopInstanceReference();
      ref.referencedSOPClassUID = '1.2.3';
      ref.referencedSOPInstanceUID = '4.5.6';

      const item = getDicomSopInstanceReferenceItem(ref);

      // Check that camelCase is converted to PascalCase
      assert.ok('ReferencedSOPClassUID' in item);
      assert.ok('ReferencedSOPInstanceUID' in item);
    });

  });

  describe('round-trip conversion', () => {

    test('dataElements -> ref -> item -> ref', () => {
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

});
