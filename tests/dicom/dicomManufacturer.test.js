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

    /**
     * Tests for {@link getManufacturer}.
     *
     * @function module:tests/dicom~getmanufacturer-good-input
     */
    test('good input', () => {
      const de = new DataElement('LO');
      de.value = ['GE MEDICAL SYSTEMS'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getManufacturer(elements);
      assert.equal(result, 'GE MEDICAL SYSTEMS');
    });

    /**
     * Tests for {@link getManufacturer} returns first.
     *
     * @function module:tests/dicom~getmanufacturer-returns-first
     */
    test('returns first', () => {
      const de = new DataElement('LO');
      de.value = ['GE MEDICAL SYSTEMS', 'Other'];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getManufacturer(elements);
      assert.equal(result, 'GE MEDICAL SYSTEMS');
    });

    /**
     * Tests for {@link getManufacturer} with no tag.
     *
     * @function module:tests/dicom~getmanufacturer-no-tag
     */
    test('no tag', () => {
      const elements = {};
      const result = getManufacturer(elements);
      assert.isUndefined(result);
    });

    /**
     * Tests for {@link getManufacturer} with no value.
     *
     * @function module:tests/dicom~getmanufacturer-no-value
     */
    test('no value', () => {
      const de = new DataElement('LO');
      de.value = [];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getManufacturer(elements);
      assert.isUndefined(result);
    });

    /**
     * Tests for {@link getManufacturer} with undefined value.
     *
     * @function module:tests/dicom~getmanufacturer-undefined-value
     */
    test('undefined value', () => {
      const de = new DataElement('LO');

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getManufacturer(elements);
      assert.isUndefined(result);
    });

    /**
     * Tests for {@link getManufacturer} with undefined tag.
     *
     * @function module:tests/dicom~getmanufacturer-undefined-tag
     */
    test('undefined tag', () => {
      const elements = {
        [TagKeys.Manufacturer]: undefined
      };

      const result = getManufacturer(elements);
      assert.isUndefined(result);
    });

  });

  describe('getNormalisedManufacturer', () => {

    /**
     * Tests for {@link getNormalisedManufacturer} for GE.
     *
     * @function module:tests/dicom~getnormalisedmanufacturer-ge
     */
    test('GE', () => {
      const de = new DataElement('LO');
      de.value = ['GE MEDICAL SYSTEMS'];
      const elements = {
        [TagKeys.Manufacturer]: de
      };
      const result = getNormalisedManufacturer(elements);
      assert.equal(result, NormalisedManufacturers.GE);

      const de1 = new DataElement('LO');
      de1.value = ['ge'];
      const elements1 = {
        [TagKeys.Manufacturer]: de1
      };
      const result1 = getNormalisedManufacturer(elements1);
      // Should not match (requires uppercase GE or starting with GE)
      assert.equal(result1, 'ge');

      const de2 = new DataElement('LO');
      de2.value = ['GE Healthcare'];
      const elements2 = {
        [TagKeys.Manufacturer]: de2
      };
      const result2 = getNormalisedManufacturer(elements2);
      assert.equal(result2, NormalisedManufacturers.GE);
    });

    /**
     * Tests for {@link getNormalisedManufacturer} for Siemens.
     *
     * @function module:tests/dicom~getnormalisedmanufacturer-siemens
     */
    test('Siemens', () => {
      const de0 = new DataElement('LO');
      de0.value = ['SIEMENS'];
      const elements0 = {
        [TagKeys.Manufacturer]: de0
      };
      const result0 = getNormalisedManufacturer(elements0);
      assert.equal(result0, NormalisedManufacturers.SIEMENS);

      const de1 = new DataElement('LO');
      de1.value = ['Siemens Healthineers'];
      const elements1 = {
        [TagKeys.Manufacturer]: de1
      };
      const result1 = getNormalisedManufacturer(elements1);
      assert.equal(result1, NormalisedManufacturers.SIEMENS);

      const de2 = new DataElement('LO');
      de2.value = ['siemens'];
      const elements2 = {
        [TagKeys.Manufacturer]: de2
      };
      const result2 = getNormalisedManufacturer(elements2);
      assert.equal(result2, NormalisedManufacturers.SIEMENS);

    });

    /**
     * Tests for {@link getNormalisedManufacturer} for Philipss.
     *
     * @function module:tests/dicom~getnormalisedmanufacturer-philips
     */
    test('Philips', () => {
      const de0 = new DataElement('LO');
      de0.value = ['Philips Healthcare'];
      const elements0 = {
        [TagKeys.Manufacturer]: de0
      };
      const result0 = getNormalisedManufacturer(elements0);
      assert.equal(result0, NormalisedManufacturers.PHILIPS);

      const de1 = new DataElement('LO');
      de1.value = ['Philips Medical Systems'];
      const elements1 = {
        [TagKeys.Manufacturer]: de1
      };
      const result1 = getNormalisedManufacturer(elements1);
      assert.equal(result1, NormalisedManufacturers.PHILIPS);

      const de2 = new DataElement('LO');
      de2.value = ['philips'];
      const elements2 = {
        [TagKeys.Manufacturer]: de2
      };
      const result2 = getNormalisedManufacturer(elements2);
      // Should be treated as unknown manufacturer and lowercased
      assert.equal(result2, 'philips');
    });

    /**
     * Tests for {@link getNormalisedManufacturer} for unknown.
     *
     * @function module:tests/dicom~getnormalisedmanufacturer-unknown
     */
    test('unknown', () => {
      const de0 = new DataElement('LO');
      de0.value = ['ACME Corporation'];
      const elements0 = {
        [TagKeys.Manufacturer]: de0
      };
      const result0 = getNormalisedManufacturer(elements0);
      assert.equal(result0, 'acme corporation');

      const de1 = new DataElement('LO');
      de1.value = ['AcmE CoRp'];
      const elements1 = {
        [TagKeys.Manufacturer]: de1
      };
      const result1 = getNormalisedManufacturer(elements1);
      assert.equal(result1, 'acme corp');
    });

    /**
     * Tests for {@link getNormalisedManufacturer} for empty.
     *
     * @function module:tests/dicom~getnormalisedmanufacturer-empty
     */
    test('empty', () => {
      const elements = {};
      const result = getNormalisedManufacturer(elements);
      assert.isUndefined(result);
    });

    /**
     * Tests for {@link getNormalisedManufacturer} no value.
     *
     * @function module:tests/dicom~getnormalisedmanufacturer-no-value
     */
    test('no value', () => {
      const de = new DataElement('LO');
      de.value = [];

      const elements = {
        [TagKeys.Manufacturer]: de
      };

      const result = getNormalisedManufacturer(elements);
      assert.isUndefined(result);
    });


    /**
     * Tests for {@link getNormalisedManufacturer} returns first.
     *
     * @function module:tests/dicom~getnormalisedmanufacturer-returns-first
     */
    test('returns first', () => {
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
