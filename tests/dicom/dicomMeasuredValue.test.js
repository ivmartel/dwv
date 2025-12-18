import {describe, test, assert} from 'vitest';
import {
  MeasuredValue,
  getMeasuredValue,
  getDicomMeasuredValueItem
} from '../../src/dicom/dicomMeasuredValue.js';
import {DataElement} from '../../src/dicom/dataElement.js';
import {DicomCode} from '../../src/dicom/dicomCode.js';

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
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
 * Tests for the 'dicom/dicomMeasuredValue.js' file.
 */

describe('dicom', () => {

  describe('MeasuredValue', () => {

    test('constructor creates instance with undefined properties', () => {
      const value = new MeasuredValue();
      assert.isUndefined(value.numericValue);
      assert.isUndefined(value.floatingPointValue);
      assert.isUndefined(value.rationalNumeratorValue);
      assert.isUndefined(value.rationalDenominatorValue);
      assert.isUndefined(value.measurementUnitsCode);
    });

    test('toString with numeric value and units code', () => {
      const code = new DicomCode('millimeter');
      code.value = 'mm';

      const value = new MeasuredValue();
      value.numericValue = 42.5;
      value.measurementUnitsCode = code;

      const result = value.toString();
      assert.include(result, '42.5');
      assert.include(result, 'mm');
    });

  });

  describe('getMeasuredValue', () => {

    test('extracts numeric value', () => {
      const de = new DataElement('DS');
      de.value = ['42.5'];

      const dataElements = {
        [TagKeys.NumericValue]: de
      };

      const result = getMeasuredValue(dataElements);
      assert.equal(result.numericValue, 42.5);
      assert.isUndefined(result.floatingPointValue);
      assert.isUndefined(result.rationalNumeratorValue);
      assert.isUndefined(result.rationalDenominatorValue);
    });

    test('extracts floating point value', () => {
      const de = new DataElement('FD');
      de.value = ['123.456'];

      const dataElements = {
        [TagKeys.FloatingPointValue]: de
      };

      const result = getMeasuredValue(dataElements);
      assert.equal(result.floatingPointValue, 123.456);
      assert.isUndefined(result.numericValue);
    });

    test('extracts rational numerator value', () => {
      const de = new DataElement('IS');
      de.value = ['100'];

      const dataElements = {
        [TagKeys.RationalNumeratorValue]: de
      };

      const result = getMeasuredValue(dataElements);
      assert.equal(result.rationalNumeratorValue, 100);
    });

    test('extracts rational denominator value', () => {
      const de = new DataElement('IS');
      de.value = ['50'];

      const dataElements = {
        [TagKeys.RationalDenominatorValue]: de
      };

      const result = getMeasuredValue(dataElements);
      assert.equal(result.rationalDenominatorValue, 50);
    });

    test('extracts measurement units code sequence', () => {
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

      const de = new DataElement('SQ');
      de.value = [codeItem];

      const dataElements = {
        [TagKeys.MeasurementUnitsCodeSequence]: de
      };

      const result = getMeasuredValue(dataElements);
      assert.ok(result.measurementUnitsCode);
      assert.equal(result.measurementUnitsCode.value, 'mm');
      assert.equal(result.measurementUnitsCode.meaning, 'millimeter');
    });

    test('extracts all values together', () => {
      const deNum = new DataElement('DS');
      deNum.value = ['42.5'];

      const deFloat = new DataElement('FD');
      deFloat.value = ['42.5'];

      const deNumer = new DataElement('IS');
      deNumer.value = ['85'];

      const deDenom = new DataElement('IS');
      deDenom.value = ['2'];

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

      const deCodeSeq = new DataElement('SQ');
      deCodeSeq.value = [codeItem];

      const dataElements = {
        [TagKeys.NumericValue]: deNum,
        [TagKeys.FloatingPointValue]: deFloat,
        [TagKeys.RationalNumeratorValue]: deNumer,
        [TagKeys.RationalDenominatorValue]: deDenom,
        [TagKeys.MeasurementUnitsCodeSequence]: deCodeSeq
      };

      const result = getMeasuredValue(dataElements);

      assert.equal(result.numericValue, 42.5);
      assert.equal(result.floatingPointValue, 42.5);
      assert.equal(result.rationalNumeratorValue, 85);
      assert.equal(result.rationalDenominatorValue, 2);
      assert.ok(result.measurementUnitsCode);
      assert.equal(result.measurementUnitsCode.value, 'mm');
    });

    test('returns empty MeasuredValue when no tags present', () => {
      const result = getMeasuredValue({});

      assert.isUndefined(result.numericValue);
      assert.isUndefined(result.floatingPointValue);
      assert.isUndefined(result.rationalNumeratorValue);
      assert.isUndefined(result.rationalDenominatorValue);
      assert.isUndefined(result.measurementUnitsCode);
    });

    test('parses numeric value as float', () => {
      const de = new DataElement('DS');
      de.value = ['3.14159'];

      const dataElements = {
        [TagKeys.NumericValue]: de
      };

      const result = getMeasuredValue(dataElements);
      assert.approximately(result.numericValue, 3.14159, 0.00001);
    });

    test('parses integer values correctly', () => {
      const deNumer = new DataElement('IS');
      deNumer.value = ['255'];

      const deDenom = new DataElement('IS');
      deDenom.value = ['256'];

      const dataElements = {
        [TagKeys.RationalNumeratorValue]: deNumer,
        [TagKeys.RationalDenominatorValue]: deDenom
      };

      const result = getMeasuredValue(dataElements);
      assert.equal(result.rationalNumeratorValue, 255);
      assert.equal(result.rationalDenominatorValue, 256);
    });

  });

  describe('getDicomMeasuredValueItem', () => {

    test('converts numeric value to item', () => {
      const value = new MeasuredValue();
      value.numericValue = 42.5;

      const item = getDicomMeasuredValueItem(value);

      assert.equal(item.NumericValue, 42.5);
      assert.isUndefined(item.FloatingPointValue);
      assert.isUndefined(item.RationalNumeratorValue);
      assert.isUndefined(item.RationalDenominatorValue);
    });

    test('converts floating point value to item', () => {
      const value = new MeasuredValue();
      value.floatingPointValue = 123.456;

      const item = getDicomMeasuredValueItem(value);

      assert.equal(item.FloatingPointValue, 123.456);
    });

    test('converts rational values to item', () => {
      const value = new MeasuredValue();
      value.rationalNumeratorValue = 85;
      value.rationalDenominatorValue = 2;

      const item = getDicomMeasuredValueItem(value);

      assert.equal(item.RationalNumeratorValue, 85);
      assert.equal(item.RationalDenominatorValue, 2);
    });

    test('converts measurement units code to item', () => {
      const code = new DicomCode('millimeter');
      code.value = 'mm';

      const value = new MeasuredValue();
      value.measurementUnitsCode = code;

      const item = getDicomMeasuredValueItem(value);

      assert.ok(item.MeasurementUnitsCodeSequence);
      assert.ok(Array.isArray(item.MeasurementUnitsCodeSequence.value));
      const codeItem = item.MeasurementUnitsCodeSequence.value[0];
      assert.equal(codeItem.CodeValue, 'mm');
      assert.equal(codeItem.CodeMeaning, 'millimeter');
    });

    test('converts all values to item', () => {
      const code = new DicomCode('millimeter');
      code.value = 'mm';

      const value = new MeasuredValue();
      value.numericValue = 42.5;
      value.floatingPointValue = 42.5;
      value.rationalNumeratorValue = 85;
      value.rationalDenominatorValue = 2;
      value.measurementUnitsCode = code;

      const item = getDicomMeasuredValueItem(value);

      assert.equal(item.NumericValue, 42.5);
      assert.equal(item.FloatingPointValue, 42.5);
      assert.equal(item.RationalNumeratorValue, 85);
      assert.equal(item.RationalDenominatorValue, 2);
      assert.ok(item.MeasurementUnitsCodeSequence);
    });

    test('omits undefined fields', () => {
      const value = new MeasuredValue();
      value.numericValue = 10;

      const item = getDicomMeasuredValueItem(value);

      assert.equal(item.NumericValue, 10);
      assert.isUndefined(item.FloatingPointValue);
      assert.isUndefined(item.RationalNumeratorValue);
      assert.isUndefined(item.RationalDenominatorValue);
      assert.isUndefined(item.MeasurementUnitsCodeSequence);
    });

    test('returns empty object when all properties undefined', () => {
      const value = new MeasuredValue();
      const item = getDicomMeasuredValueItem(value);

      assert.deepEqual(item, {});
    });

  });

  describe('round-trip conversion via items', () => {

    test('dataElements -> MeasuredValue -> item -> MeasuredValue', () => {
      const deNum = new DataElement('DS');
      deNum.value = ['42.5'];

      const deFloat = new DataElement('FD');
      deFloat.value = ['42.5'];

      const deNumer = new DataElement('IS');
      deNumer.value = ['85'];

      const deDenom = new DataElement('IS');
      deDenom.value = ['2'];

      const dataElements = {
        [TagKeys.NumericValue]: deNum,
        [TagKeys.FloatingPointValue]: deFloat,
        [TagKeys.RationalNumeratorValue]: deNumer,
        [TagKeys.RationalDenominatorValue]: deDenom
      };

      const value1 = getMeasuredValue(dataElements);
      const item = getDicomMeasuredValueItem(value1);

      // recreate MeasuredValue from item
      const value2 = new MeasuredValue();
      if (typeof item.NumericValue !== 'undefined') {
        value2.numericValue = item.NumericValue;
      }
      if (typeof item.FloatingPointValue !== 'undefined') {
        value2.floatingPointValue = item.FloatingPointValue;
      }
      if (typeof item.RationalNumeratorValue !== 'undefined') {
        value2.rationalNumeratorValue = item.RationalNumeratorValue;
      }
      if (typeof item.RationalDenominatorValue !== 'undefined') {
        value2.rationalDenominatorValue = item.RationalDenominatorValue;
      }

      // verify round-trip
      assert.equal(value1.numericValue, value2.numericValue);
      assert.equal(value1.floatingPointValue, value2.floatingPointValue);
      assert.equal(value1.rationalNumeratorValue,
        value2.rationalNumeratorValue);
      assert.equal(value1.rationalDenominatorValue,
        value2.rationalDenominatorValue);
    });

  });

});
