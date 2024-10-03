import {
  getCode,
  getDicomCodeItem
} from './dicomCode';
import {
  getMeasuredValue,
  getDicomMeasuredValueItem
} from './dicomMeasuredValue';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
import {MeasuredValue} from './dicomMeasuredValue';
import {DicomCode} from './dicomCode';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  MeasuredValueSequence: '0040A300',
  NumericValueQualifierCodeSequence: '0040A301'
};

/**
 * DICOM numeric measurement: item of a SR content sequence.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.18.html#table_C.18.1-1}.
 */
export class NumericMeasurement {
  /**
   * @type {MeasuredValue}
   */
  measuredValue;

  /**
   * @type {DicomCode}
   */
  numericValueQualifierCode;

  /**
   * Get a string representation of this object.
   *
   * @returns {string} The object as string.
   */
  toString() {
    let res = this.measuredValue.toString();
    if (typeof this.numericValueQualifierCode !== 'undefined') {
      res += ' ' + this.numericValueQualifierCode.toString();
    }
    return res;
  }
};

/**
 * Get a measurement object from a dicom element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {NumericMeasurement} A measurement object.
 */
export function getNumericMeasurement(dataElements) {
  const measurement = new NumericMeasurement();

  if (typeof dataElements[TagKeys.MeasuredValueSequence] !== 'undefined') {
    measurement.measuredValue = getMeasuredValue(
      dataElements[TagKeys.MeasuredValueSequence].value[0]);
  }
  if (typeof dataElements[TagKeys.NumericValueQualifierCodeSequence] !==
    'undefined') {
    measurement.numericValueQualifierCode = getCode(
      dataElements[TagKeys.NumericValueQualifierCodeSequence].value[0]);
  }

  return measurement;
};

/**
 * Get a simple dicom element item from a measurement object.
 *
 * @param {NumericMeasurement} measurement The measurement object.
 * @returns {Object<string, any>} The item as a list of (key, value) pairs.
 */
export function getDicomNumericMeasurementItem(measurement) {
  // dicom item (tags are in group/element order)
  const item = {};

  if (typeof measurement.measuredValue !== 'undefined') {
    item.MeasuredValueSequence = {
      value: [getDicomMeasuredValueItem(measurement.measuredValue)]
    };
  }
  if (typeof measurement.numericValueQualifierCode !== 'undefined') {
    item.NumericValueQualifierCodeSequence = {
      value: [getDicomCodeItem(measurement.numericValueQualifierCode)]
    };
  }

  // return
  return item;
}
