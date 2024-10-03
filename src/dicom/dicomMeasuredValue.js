import {
  getCode,
  getDicomCodeItem
} from './dicomCode';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
import {DicomCode} from './dicomCode';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  NumericValue: '0040A30A',
  FloatingPointValue: '0040A161',
  RationalNumeratorValue: '0040A162',
  RationalDenominatorValue: '0040A163',
  MeasurementUnitsCodeSequence: '004008EA'
};

/**
 * DICOM measured value: property of a numeric measurement.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.18.html#table_C.18.1-1}.
 */
export class MeasuredValue {
  /**
   * @type {number}
   */
  numericValue;

  /**
   * @type {number}
   */
  floatingPointValue;

  /**
   * @type {number}
   */
  rationalNumeratorValue;

  /**
   * @type {number}
   */
  rationalDenominatorValue;

  /**
   * @type {DicomCode}
   */
  measurementUnitsCode;

  /**
   * Get a string representation of this object.
   *
   * @returns {string} The object as string.
   */
  toString() {
    return this.numericValue + ' ' +
      this.measurementUnitsCode.toString();
  };

};

/**
 * Get a measured value object from a dicom element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {MeasuredValue} A measured value object.
 */
export function getMeasuredValue(dataElements) {
  const value = new MeasuredValue();

  if (typeof dataElements[TagKeys.NumericValue] !== 'undefined') {
    value.numericValue = dataElements[TagKeys.NumericValue].value[0];
  }
  if (typeof dataElements[TagKeys.FloatingPointValue] !== 'undefined') {
    value.floatingPointValue =
      dataElements[TagKeys.FloatingPointValue].value[0];
  }
  if (typeof dataElements[TagKeys.RationalNumeratorValue] !== 'undefined') {
    value.rationalNumeratorValue =
      dataElements[TagKeys.RationalNumeratorValue].value[0];
  }
  if (typeof dataElements[TagKeys.RationalDenominatorValue] !== 'undefined') {
    value.rationalDenominatorValue =
      dataElements[TagKeys.RationalDenominatorValue].value[0];
  }
  if (typeof dataElements[TagKeys.MeasurementUnitsCodeSequence] !==
    'undefined') {
    value.measurementUnitsCode = getCode(
      dataElements[TagKeys.MeasurementUnitsCodeSequence].value[0]);
  }

  return value;
};

/**
 * Get a simple dicom element item from a measured value object.
 *
 * @param {MeasuredValue} value The measured value object.
 * @returns {Object<string, any>} The item as a list of (key, value) pairs.
 */
export function getDicomMeasuredValueItem(value) {
  // dicom item (tags are in group/element order)
  const item = {};

  if (typeof value.measurementUnitsCode !== 'undefined') {
    item.MeasurementUnitsCodeSequence = {
      value: [getDicomCodeItem(value.measurementUnitsCode)]
    };
  }
  if (typeof value.floatingPointValue !== 'undefined') {
    item.FloatingPointValue = value.floatingPointValue;
  }
  if (typeof value.rationalNumeratorValue !== 'undefined') {
    item.RationalNumeratorValue = value.rationalNumeratorValue;
  }
  if (typeof value.rationalDenominatorValue !== 'undefined') {
    item.RationalDenominatorValue = value.rationalDenominatorValue;
  }
  if (typeof value.numericValue !== 'undefined') {
    item.NumericValue = value.numericValue;
  }

  // return
  return item;
}
