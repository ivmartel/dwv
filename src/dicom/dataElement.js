// doc imports
/* eslint-disable no-unused-vars */
import {Tag} from './dicomTag.js';
/* eslint-enable no-unused-vars */

/**
 * DICOM data element.
 */
export class DataElement {
  /**
   * The element Value Representation.
   *
   * @type {string}
   */
  vr;
  /**
   * The element value.
   *
   * @type {Array}
   */
  value;

  // [start] internal values
  // only present during parsing or writing otherwise not set

  /**
   * The element dicom tag.
   *
   * @type {Tag}
   */
  tag;

  /**
   * The element Value Length.
   *
   * @type {number}
   */
  vl;

  /**
   * Flag to know if defined or undefined sequence length.
   *
   * @type {boolean}
   */
  undefinedLength;

  /**
   * The element start offset.
   *
   * @type {number}
   */
  startOffset;

  /**
   * The element end offset.
   *
   * @type {number}
   */
  endOffset;

  /**
   * The sequence items.
   *
   * @type {Array}
   */
  items;

  // [end] internal values

  /**
   * @param {string} vr The element VR (Value Representation).
   */
  constructor(vr) {
    this.vr = vr;
  }
}

/**
 * Check an input data element, returns true if:
 * - the element is not undefined,
 * - the elements' value is not undefined,
 * - the elements' value has content.
 *
 * @param {DataElement} element The data element.
 * @returns {boolean} True if there is a value.
 */
function hasValue(element) {
  return typeof element !== 'undefined' &&
    typeof element.value !== 'undefined' &&
    element.value.length !== 0;
}

/**
 * Safely get an elements' first value from a list of elements.
 *
 * @param {Object<string, DataElement>} dataElements A list of data elements.
 * @param {string} key The tag key as for example '00100020'.
 * @returns {any|undefined} The elements' value or undefined.
 */
export function safeGet(dataElements, key) {
  let res;
  if (hasValue(dataElements[key])) {
    res = dataElements[key].value[0];
  }
  return res;
};

/**
 * Safely get all of an elements' values from a list of elements.
 *
 * @param {Object<string, DataElement>} dataElements A list of data elements.
 * @param {string} key The tag key as for example '00100020'.
 * @returns {any[]|undefined} The elements' values or undefined.
 */
export function safeGetAll(dataElements, key) {
  let res;
  if (hasValue(dataElements[key])) {
    res = dataElements[key].value;
  }
  return res;
};

/**
 * Check a DICOM data element: checks
 * - if the element is not undefined,
 * - if the elements' value is not undefined,
 * - if the elements' value is not empty,
 * - (optional) if the elements' values have specific values.
 *
 * @param {DataElement} element The element to check.
 * @param {string} name The element name.
 * @param {Array} [values] Optional list of expected values.
 * @returns {string} A warning if the element is not as expected.
 */
export function checkDataElement(element, name, values) {
  let warning = '';
  if (typeof element === 'undefined') {
    warning += ' ' + name + ' is undefined,';
  } else if (typeof element.value === 'undefined') {
    warning += ' ' + name + ' has undefined value,';
  } else if (element.value.length === 0) {
    warning += ' ' + name + ' is empty,';
  } else {
    if (typeof values !== 'undefined') {
      for (let i = 0; i < values.length; ++i) {
        if (!element.value.includes(values[i])) {
          warning += ' ' + name + ' does not contain ' + values[i] +
            ' (value: ' + element.value + '),';
        }
      }
    }
  }
  return warning;
}
