import {describe, test, assert} from 'vitest';
import {
  NumericMeasurement,
  getNumericMeasurement,
  getDicomNumericMeasurementItem
} from '../../src/dicom/dicomNumericMeasurement.js';
import {DataElement} from '../../src/dicom/dataElement.js';
import {MeasuredValue} from '../../src/dicom/dicomMeasuredValue.js';
import {DicomCode} from '../../src/dicom/dicomCode.js';

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  MeasuredValueSequence: '0040A300',
  NumericValueQualifierCodeSequence: '0040A301',
  NumericValue: '0040A30A',
  FloatingPointValue: '0040A161',
  RationalNumeratorValue: '0040A162',
  RationalDenominatorValue: '0040A163',
  MeasurementUnitsCodeSequence: '004008EA',
  CodeValue: '00080100',
  CodingSchemeDesignator: '00080102',
  CodeMeaning: '00080104'
};

/**
 * Tests for the 'dicom/dicomNumericMeasurement.js' file.
 */

describe('dicom', () => {

  describe('NumericMeasurement', () => {

    test('constructor creates instance with undefined properties', () => {
      const measurement = new NumericMeasurement();
      assert.isUndefined(measurement.measuredValue);
      assert.isUndefined(measurement.numericValueQualifierCode);
    });

    test('toString with measured value only', () => {
      const code = new DicomCode('millimeter');
      code.value = 'mm';

      const value = new MeasuredValue();
      value.numericValue = 42.5;
      value.measurementUnitsCode = code;

      const measurement = new NumericMeasurement();
      measurement.measuredValue = value;

      const result = measurement.toString();
      assert.include(result, '42.5');
      assert.include(result, 'mm');
    });

    test('toString with both measured value and qualifier code', () => {
      const code = new DicomCode('millimeter');
      code.value = 'mm';

      const value = new MeasuredValue();
      value.numericValue = 42.5;
      value.measurementUnitsCode = code;

      const qualifierCode = new DicomCode('mean');
      qualifierCode.value = 'mean';

      const measurement = new NumericMeasurement();
      measurement.measuredValue = value;
      measurement.numericValueQualifierCode = qualifierCode;

      const result = measurement.toString();
      assert.include(result, '42.5');
      assert.include(result, 'mm');
      assert.include(result, 'mean');
    });

    test('toString with only qualifier code', () => {
      const qualifierCode = new DicomCode('mean');
      qualifierCode.value = 'mean';

      const measurement = new NumericMeasurement();
      measurement.numericValueQualifierCode = qualifierCode;

      const result = measurement.toString();
      assert.include(result, 'mean');
    });

    test('toString with neither property set', () => {
      const measurement = new NumericMeasurement();
      const result = measurement.toString();
      assert.equal(result, '');
    });

  });

  describe('getNumericMeasurement', () => {

    test('extracts measured value only', () => {
      const deNumericValue = new DataElement('DS');
      deNumericValue.value = ['42.5'];

      const deCodeMeaning = new DataElement('LO');
      deCodeMeaning.value = ['millimeter'];
      const deCodeValue = new DataElement('SH');
      deCodeValue.value = ['mm'];
      const deScheme = new DataElement('SH');
      deScheme.value = ['UCUM'];

      const codeItem = {
        [TagKeys.CodeMeaning]: deCodeMeaning,
        [TagKeys.CodeValue]: deCodeValue,
        [TagKeys.CodingSchemeDesignator]: deScheme
      };

      const deMeasUnits = new DataElement('SQ');
      deMeasUnits.value = [codeItem];

      const measuredValueItem = {
        [TagKeys.NumericValue]: deNumericValue,
        [TagKeys.MeasurementUnitsCodeSequence]: deMeasUnits
      };

      const deMeasured = new DataElement('SQ');
      deMeasured.value = [measuredValueItem];

      const dataElements = {
        [TagKeys.MeasuredValueSequence]: deMeasured
      };

      const result = getNumericMeasurement(dataElements);

      assert.ok(result.measuredValue);
      assert.equal(result.measuredValue.numericValue, 42.5);
      assert.isUndefined(result.numericValueQualifierCode);
    });

    test('extracts qualifier code only', () => {
      const deCodeMeaning = new DataElement('LO');
      deCodeMeaning.value = ['mean'];
      const deCodeValue = new DataElement('SH');
      deCodeValue.value = ['mean'];
      const deScheme = new DataElement('SH');
      deScheme.value = ['DCM'];

      const codeItem = {
        [TagKeys.CodeMeaning]: deCodeMeaning,
        [TagKeys.CodeValue]: deCodeValue,
        [TagKeys.CodingSchemeDesignator]: deScheme
      };

      const de = new DataElement('SQ');
      de.value = [codeItem];

      const dataElements = {
        [TagKeys.NumericValueQualifierCodeSequence]: de
      };

      const result = getNumericMeasurement(dataElements);

      assert.isUndefined(result.measuredValue);
      assert.ok(result.numericValueQualifierCode);
      assert.equal(result.numericValueQualifierCode.value, 'mean');
    });

    test('extracts both measured value and qualifier code', () => {
      const deNumericValue = new DataElement('DS');
      deNumericValue.value = ['42.5'];

      const deCodeMeaning = new DataElement('LO');
      deCodeMeaning.value = ['millimeter'];
      const deCodeValue = new DataElement('SH');
      deCodeValue.value = ['mm'];
      const deScheme = new DataElement('SH');
      deScheme.value = ['UCUM'];

      const codeItem = {
        [TagKeys.CodeMeaning]: deCodeMeaning,
        [TagKeys.CodeValue]: deCodeValue,
        [TagKeys.CodingSchemeDesignator]: deScheme
      };

      const deMeasUnits = new DataElement('SQ');
      deMeasUnits.value = [codeItem];

      const measuredValueItem = {
        [TagKeys.NumericValue]: deNumericValue,
        [TagKeys.MeasurementUnitsCodeSequence]: deMeasUnits
      };

      const deMeasured = new DataElement('SQ');
      deMeasured.value = [measuredValueItem];

      const deQualCodeMeaning = new DataElement('LO');
      deQualCodeMeaning.value = ['mean'];
      const deQualCodeValue = new DataElement('SH');
      deQualCodeValue.value = ['mean'];
      const deQualScheme = new DataElement('SH');
      deQualScheme.value = ['DCM'];

      const qualCodeItem = {
        [TagKeys.CodeMeaning]: deQualCodeMeaning,
        [TagKeys.CodeValue]: deQualCodeValue,
        [TagKeys.CodingSchemeDesignator]: deQualScheme
      };

      const deQual = new DataElement('SQ');
      deQual.value = [qualCodeItem];

      const dataElements = {
        [TagKeys.MeasuredValueSequence]: deMeasured,
        [TagKeys.NumericValueQualifierCodeSequence]: deQual
      };

      const result = getNumericMeasurement(dataElements);

      assert.ok(result.measuredValue);
      assert.equal(result.measuredValue.numericValue, 42.5);
      assert.ok(result.numericValueQualifierCode);
      assert.equal(result.numericValueQualifierCode.value, 'mean');
    });

    test('returns empty NumericMeasurement when no tags present', () => {
      const result = getNumericMeasurement({});

      assert.isUndefined(result.measuredValue);
      assert.isUndefined(result.numericValueQualifierCode);
    });

  });

  describe('getDicomNumericMeasurementItem', () => {

    test('converts measured value only to item', () => {
      const value = new MeasuredValue();
      value.numericValue = 42.5;

      const measurement = new NumericMeasurement();
      measurement.measuredValue = value;

      const item = getDicomNumericMeasurementItem(measurement);

      assert.ok(item.MeasuredValueSequence);
      assert.ok(Array.isArray(item.MeasuredValueSequence.value));
      assert.isUndefined(item.NumericValueQualifierCodeSequence);
    });

    test('converts qualifier code only to item', () => {
      const code = new DicomCode('mean');
      code.value = 'mean';

      const measurement = new NumericMeasurement();
      measurement.numericValueQualifierCode = code;

      const item = getDicomNumericMeasurementItem(measurement);

      assert.isUndefined(item.MeasuredValueSequence);
      assert.ok(item.NumericValueQualifierCodeSequence);
      assert.ok(Array.isArray(item.NumericValueQualifierCodeSequence.value));
    });

    test('converts both measured value and qualifier to item', () => {
      const value = new MeasuredValue();
      value.numericValue = 42.5;

      const code = new DicomCode('mean');
      code.value = 'mean';

      const measurement = new NumericMeasurement();
      measurement.measuredValue = value;
      measurement.numericValueQualifierCode = code;

      const item = getDicomNumericMeasurementItem(measurement);

      assert.ok(item.MeasuredValueSequence);
      assert.ok(item.NumericValueQualifierCodeSequence);
    });

    test('returns empty object when no properties set', () => {
      const measurement = new NumericMeasurement();
      const item = getDicomNumericMeasurementItem(measurement);

      assert.deepEqual(item, {});
    });

  });

  describe('round-trip conversion via items', () => {

    test('dataElements -> NumericMeasurement -> item -> NumericMeasurement',
      () => {
        const deNumericValue = new DataElement('DS');
        deNumericValue.value = ['42.5'];

        const deCodeMeaning = new DataElement('LO');
        deCodeMeaning.value = ['millimeter'];
        const deCodeValue = new DataElement('SH');
        deCodeValue.value = ['mm'];
        const deScheme = new DataElement('SH');
        deScheme.value = ['UCUM'];

        const codeItem = {
          [TagKeys.CodeMeaning]: deCodeMeaning,
          [TagKeys.CodeValue]: deCodeValue,
          [TagKeys.CodingSchemeDesignator]: deScheme
        };

        const deMeasUnits = new DataElement('SQ');
        deMeasUnits.value = [codeItem];

        const measuredValueItem = {
          [TagKeys.NumericValue]: deNumericValue,
          [TagKeys.MeasurementUnitsCodeSequence]: deMeasUnits
        };

        const deMeasured = new DataElement('SQ');
        deMeasured.value = [measuredValueItem];

        const dataElements = {
          [TagKeys.MeasuredValueSequence]: deMeasured
        };

        const measurement1 = getNumericMeasurement(dataElements);
        const item = getDicomNumericMeasurementItem(measurement1);

        // recreate NumericMeasurement from item
        const measurement2 = new NumericMeasurement();
        if (typeof item.MeasuredValueSequence !== 'undefined') {
          const valueItem = item.MeasuredValueSequence.value[0];
          const newValue = new MeasuredValue();
          if (typeof valueItem.NumericValue !== 'undefined') {
            newValue.numericValue = valueItem.NumericValue;
          }
          measurement2.measuredValue = newValue;
        }

        // verify round-trip
        assert.equal(measurement1.measuredValue.numericValue,
          measurement2.measuredValue.numericValue);
      }
    );

  });

});
