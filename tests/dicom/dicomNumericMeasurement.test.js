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

    /**
     * Tests for {@link NumericMeasurement} with undefined.
     *
     * @function module:tests/dicom~numericmeasurementUndefined
     */
    test('undefined', () => {
      const measurement = new NumericMeasurement();
      assert.isUndefined(measurement.measuredValue);
      assert.isUndefined(measurement.numericValueQualifierCode);
    });

    /**
     * Tests for {@link NumericMeasurement} value toString.
     *
     * @function module:tests/dicom~numericmeasurementValueTostring
     */
    test('toString', () => {
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

    /**
     * Tests for {@link NumericMeasurement} toString.
     *
     * @function module:tests/dicom~numericmeasurementTostring
     */
    test('toString', () => {
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

    /**
     * Tests for {@link NumericMeasurement} code toString.
     *
     * @function module:tests/dicom~numericmeasurementCodeTostring
     */
    test('code toString', () => {
      const qualifierCode = new DicomCode('mean');
      qualifierCode.value = 'mean';

      const measurement = new NumericMeasurement();
      measurement.numericValueQualifierCode = qualifierCode;

      const result = measurement.toString();
      assert.include(result, 'mean');
    });

    /**
     * Tests for {@link NumericMeasurement} undefined toString.
     *
     * @function module:tests/dicom~numericmeasurementUndefinedTostring
     */
    test('undefined toString', () => {
      const measurement = new NumericMeasurement();
      const result = measurement.toString();
      assert.equal(result, '');
    });

    /**
     * Tests for {@link NumericMeasurement} round trip.
     *
     * @function module:tests/dicom~numericmeasurementRoundTrip
     */
    test('round trip',
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

  describe('getNumericMeasurement', () => {

    /**
     * Tests for {@link getNumericMeasurement} value.
     *
     * @function module:tests/dicom~getnumericmeasurementValue
     */
    test('value', () => {
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

    /**
     * Tests for {@link getNumericMeasurement} code.
     *
     * @function module:tests/dicom~getnumericmeasurementCode
     */
    test('code', () => {
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

    /**
     * Tests for {@link getNumericMeasurement}.
     *
     * @function module:tests/dicom~getnumericmeasurementGoodInput
     */
    test('good input', () => {
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

    /**
     * Tests for {@link getNumericMeasurement} undefined.
     *
     * @function module:tests/dicom~getnumericmeasurementUndefined
     */
    test('undefined', () => {
      const result = getNumericMeasurement({});

      assert.isUndefined(result.measuredValue);
      assert.isUndefined(result.numericValueQualifierCode);
    });

  });

  describe('getDicomNumericMeasurementItem', () => {

    /**
     * Tests for {@link getDicomNumericMeasurementItem} value.
     *
     * @function module:tests/dicom~getdicomnumericmeasurementitemValue
     */
    test('value', () => {
      const value = new MeasuredValue();
      value.numericValue = 42.5;

      const measurement = new NumericMeasurement();
      measurement.measuredValue = value;

      const item = getDicomNumericMeasurementItem(measurement);

      assert.ok(item.MeasuredValueSequence);
      assert.ok(Array.isArray(item.MeasuredValueSequence.value));
      assert.isUndefined(item.NumericValueQualifierCodeSequence);
    });

    /**
     * Tests for {@link getDicomNumericMeasurementItem} code.
     *
     * @function module:tests/dicom~getdicomnumericmeasurementitemCode
     */
    test('code', () => {
      const code = new DicomCode('mean');
      code.value = 'mean';

      const measurement = new NumericMeasurement();
      measurement.numericValueQualifierCode = code;

      const item = getDicomNumericMeasurementItem(measurement);

      assert.isUndefined(item.MeasuredValueSequence);
      assert.ok(item.NumericValueQualifierCodeSequence);
      assert.ok(Array.isArray(item.NumericValueQualifierCodeSequence.value));
    });

    /**
     * Tests for {@link getDicomNumericMeasurementItem}.
     *
     * @function module:tests/dicom~getdicomnumericmeasurementitemGoodInput
     */
    test('good input', () => {
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

    /**
     * Tests for {@link getDicomNumericMeasurementItem} undefined.
     *
     * @function module:tests/dicom~getdicomnumericmeasurementitemUndefined
     */
    test('undefined', () => {
      const measurement = new NumericMeasurement();
      const item = getDicomNumericMeasurementItem(measurement);

      assert.deepEqual(item, {});
    });

  });

});
