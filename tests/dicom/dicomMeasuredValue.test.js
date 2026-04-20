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

    /**
     * Tests for empty {@link MeasuredValue}.
     *
     * @function module:tests/dicom~measuredvalueEmpty
     */
    test('empty', () => {
      const value = new MeasuredValue();
      assert.isUndefined(value.numericValue);
      assert.isUndefined(value.floatingPointValue);
      assert.isUndefined(value.rationalNumeratorValue);
      assert.isUndefined(value.rationalDenominatorValue);
      assert.isUndefined(value.measurementUnitsCode);
    });

    /**
     * Tests for {@link MeasuredValue} toString.
     *
     * @function module:tests/dicom~measuredvalueTostring
     */
    test('toString', () => {
      const code = new DicomCode('millimeter');
      code.value = 'mm';

      const value = new MeasuredValue();
      value.numericValue = 42.5;
      value.measurementUnitsCode = code;

      const result = value.toString();
      assert.include(result, '42.5');
      assert.include(result, 'mm');
    });

    /**
     * Tests for {@link MeasuredValue} round trip.
     *
     * @function module:tests/dicom~measuredvalueRoundTrip
     */
    test('round trip', () => {
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

  describe('getMeasuredValue', () => {

    /**
     * Tests for {@link getMeasuredValue} numeric.
     *
     * @function module:tests/dicom~getmeasuredvalueNumeric
     */
    test('numeric', () => {
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

      // numeric float
      const de1 = new DataElement('DS');
      de1.value = ['3.14159'];
      const dataElements1 = {
        [TagKeys.NumericValue]: de1
      };
      const result1 = getMeasuredValue(dataElements1);
      assert.approximately(result1.numericValue, 3.14159, 0.00001);

    });

    /**
     * Tests for {@link getMeasuredValue} float.
     *
     * @function module:tests/dicom~getmeasuredvalueFloat
     */
    test('float', () => {
      const de = new DataElement('FD');
      de.value = ['123.456'];

      const dataElements = {
        [TagKeys.FloatingPointValue]: de
      };

      const result = getMeasuredValue(dataElements);
      assert.equal(result.floatingPointValue, 123.456);
      assert.isUndefined(result.numericValue);
    });

    /**
     * Tests for {@link getMeasuredValue} rational.
     *
     * @function module:tests/dicom~getmeasuredvalueRational
     */
    test('rational', () => {
      const de0 = new DataElement('IS');
      de0.value = ['100'];
      const dataElements0 = {
        [TagKeys.RationalNumeratorValue]: de0
      };
      const result0 = getMeasuredValue(dataElements0);
      assert.equal(result0.rationalNumeratorValue, 100);

      const de1 = new DataElement('IS');
      de1.value = ['50'];
      const dataElements1 = {
        [TagKeys.RationalDenominatorValue]: de1
      };
      const result1 = getMeasuredValue(dataElements1);
      assert.equal(result1.rationalDenominatorValue, 50);

      const deNumer2 = new DataElement('IS');
      deNumer2.value = ['255'];
      const deDenom2 = new DataElement('IS');
      deDenom2.value = ['256'];
      const dataElements2 = {
        [TagKeys.RationalNumeratorValue]: deNumer2,
        [TagKeys.RationalDenominatorValue]: deDenom2
      };
      const result2 = getMeasuredValue(dataElements2);
      assert.equal(result2.rationalNumeratorValue, 255);
      assert.equal(result2.rationalDenominatorValue, 256);

    });

    /**
     * Tests for {@link getMeasuredValue} code.
     *
     * @function module:tests/dicom~getmeasuredvalueCode
     */
    test('code', () => {
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

    /**
     * Tests for {@link getMeasuredValue} all.
     *
     * @function module:tests/dicom~getmeasuredvalueAll
     */
    test('all', () => {
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

    /**
     * Tests for {@link getMeasuredValue} no tag.
     *
     * @function module:tests/dicom~getmeasuredvalueNoTag
     */
    test('no tag', () => {
      const result = getMeasuredValue({});

      assert.isUndefined(result.numericValue);
      assert.isUndefined(result.floatingPointValue);
      assert.isUndefined(result.rationalNumeratorValue);
      assert.isUndefined(result.rationalDenominatorValue);
      assert.isUndefined(result.measurementUnitsCode);
    });
  });

  describe('getDicomMeasuredValueItem', () => {

    /**
     * Tests for {@link getDicomMeasuredValueItem} numeric.
     *
     * @function module:tests/dicom~getdicommeasuredvalueitemNumeric
     */
    test('numeric', () => {
      const value = new MeasuredValue();
      value.numericValue = 42.5;

      const item = getDicomMeasuredValueItem(value);

      assert.equal(item.NumericValue, 42.5);
      assert.isUndefined(item.FloatingPointValue);
      assert.isUndefined(item.RationalNumeratorValue);
      assert.isUndefined(item.RationalDenominatorValue);
    });

    /**
     * Tests for {@link getDicomMeasuredValueItem} float.
     *
     * @function module:tests/dicom~getdicommeasuredvalueitemFloat
     */
    test('float', () => {
      const value = new MeasuredValue();
      value.floatingPointValue = 123.456;

      const item = getDicomMeasuredValueItem(value);

      assert.equal(item.FloatingPointValue, 123.456);
    });

    /**
     * Tests for {@link getDicomMeasuredValueItem} rational.
     *
     * @function module:tests/dicom~getdicommeasuredvalueitemRational
     */
    test('rational', () => {
      const value = new MeasuredValue();
      value.rationalNumeratorValue = 85;
      value.rationalDenominatorValue = 2;

      const item = getDicomMeasuredValueItem(value);

      assert.equal(item.RationalNumeratorValue, 85);
      assert.equal(item.RationalDenominatorValue, 2);
    });

    /**
     * Tests for {@link getDicomMeasuredValueItem} code.
     *
     * @function module:tests/dicom~getdicommeasuredvalueitemCode
     */
    test('code', () => {
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

    /**
     * Tests for {@link getDicomMeasuredValueItem} all.
     *
     * @function module:tests/dicom~getdicommeasuredvalueitemAll
     */
    test('all', () => {
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

    /**
     * Tests for {@link getDicomMeasuredValueItem} undefined.
     *
     * @function module:tests/dicom~getdicommeasuredvalueitemUndefined
     */
    test('undefined', () => {
      const value = new MeasuredValue();
      value.numericValue = 10;

      const item = getDicomMeasuredValueItem(value);

      assert.equal(item.NumericValue, 10);
      assert.isUndefined(item.FloatingPointValue);
      assert.isUndefined(item.RationalNumeratorValue);
      assert.isUndefined(item.RationalDenominatorValue);
      assert.isUndefined(item.MeasurementUnitsCodeSequence);
    });

    /**
     * Tests for {@link getDicomMeasuredValueItem} empty.
     *
     * @function module:tests/dicom~getdicommeasuredvalueitemEmpty
     */
    test('empty', () => {
      const value = new MeasuredValue();
      const item = getDicomMeasuredValueItem(value);

      assert.deepEqual(item, {});
    });

  });

});
