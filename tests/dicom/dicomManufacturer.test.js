import {describe, test, assert} from 'vitest';
import {
  NormalisedManufacturers,
  getManufacturer,
  getNormalisedManufacturer
} from '../../src/dicom/dicomManufacturer.js';
import {DataElement} from '../../src/dicom/dataElement.js';

/**
 * Tests for the 'dicom/dicomManufacturer.js' file.
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  Manufacturer: '00080070'
};

describe('dicom', () => {

  describe('getManufacturer', () => {

    test('returns manufacturer from dataElements', () => {
      const de = new DataElement('LO');
      de.value = ['GE MEDICAL SYSTEMS'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getManufacturer(elements);
      assert.equal(result, 'GE MEDICAL SYSTEMS');
    });

    test('returns first value when multiple values present', () => {
      const de = new DataElement('LO');
      de.value = ['GE MEDICAL SYSTEMS', 'Other'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getManufacturer(elements);
      assert.equal(result, 'GE MEDICAL SYSTEMS');
    });

    test('returns undefined when manufacturer tag missing', () => {
      const elements = {};
      const result = getManufacturer(elements);
      assert.isUndefined(result);
    });

    test('returns undefined when manufacturer value is empty', () => {
      const de = new DataElement('LO');
      de.value = [];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getManufacturer(elements);
      assert.isUndefined(result);
    });

    test('returns undefined when value property is undefined', () => {
      const de = new DataElement('LO');

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getManufacturer(elements);
      assert.isUndefined(result);
    });

    test('returns undefined when element is undefined', () => {
      const elements = {
        [TagKeys.Manufacturer]: undefined
      };

      const result = getManufacturer(elements);
      assert.isUndefined(result);
    });

  });

  describe('getNormalisedManufacturer', () => {

    test('returns normalised GE manufacturer', () => {
      const de = new DataElement('LO');
      de.value = ['GE MEDICAL SYSTEMS'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.equal(result, NormalisedManufacturers.GE);
    });

    test('returns normalised Siemens manufacturer', () => {
      const de = new DataElement('LO');
      de.value = ['SIEMENS'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.equal(result, NormalisedManufacturers.SIEMENS);
    });

    test('returns normalised Siemens Healthineers', () => {
      const de = new DataElement('LO');
      de.value = ['Siemens Healthineers'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.equal(result, NormalisedManufacturers.SIEMENS);
    });

    test('returns normalised Philips Healthcare', () => {
      const de = new DataElement('LO');
      de.value = ['Philips Healthcare'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.equal(result, NormalisedManufacturers.PHILIPS);
    });

    test('returns normalised Philips Medical Systems', () => {
      const de = new DataElement('LO');
      de.value = ['Philips Medical Systems'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.equal(result, NormalisedManufacturers.PHILIPS);
    });

    test('returns lowercase for unknown manufacturer', () => {
      const de = new DataElement('LO');
      de.value = ['ACME Corporation'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.equal(result, 'acme corporation');
    });

    test('handles mixed case for unknown manufacturer', () => {
      const de = new DataElement('LO');
      de.value = ['AcmE CoRp'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.equal(result, 'acme corp');
    });

    test('returns undefined when manufacturer missing', () => {
      const elements = {};
      const result = getNormalisedManufacturer(elements);
      assert.isUndefined(result);
    });

    test('returns undefined when manufacturer value is empty', () => {
      const de = new DataElement('LO');
      de.value = [];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.isUndefined(result);
    });

    test('handles case-insensitive Siemens check', () => {
      const de = new DataElement('LO');
      de.value = ['siemens'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.equal(result, NormalisedManufacturers.SIEMENS);
    });

    test('case-sensitive Philips check requires capital P', () => {
      const de = new DataElement('LO');
      de.value = ['philips'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      // Should be treated as unknown manufacturer and lowercased
      assert.equal(result, 'philips');
    });

    test('case-sensitive GE check', () => {
      const de = new DataElement('LO');
      de.value = ['ge'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      // Should not match (requires uppercase GE or starting with GE)
      assert.equal(result, 'ge');
    });

    test('GE with various prefixes', () => {
      const de = new DataElement('LO');
      de.value = ['GE Healthcare'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.equal(result, NormalisedManufacturers.GE);
    });

    test('returns first manufacturer when multiple tags present', () => {
      const de = new DataElement('LO');
      de.value = ['SIEMENS', 'GE'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.equal(result, NormalisedManufacturers.SIEMENS);
    });

  });

});
