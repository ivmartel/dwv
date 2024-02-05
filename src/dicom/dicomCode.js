// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
/* eslint-enable no-unused-vars */

/**
 * @typedef {Object<string, DataElement>} DataElements
 */

/**
 * DICOM code.
 */
export class DicomCode {
  /**
   * Code meaning (0008,0104).
   *
   * @type {string}
   */
  meaning;
  /**
   * Code value (0008,0100).
   *
   * @type {string|undefined}
   */
  value;
  /**
   * Long code value (0008,0119).
   *
   * @type {string|undefined}
   */
  longValue;
  /**
   * URN code value (0008,0120).
   *
   * @type {string|undefined}
   */
  urnValue;
  /**
   * Coding scheme designator (0008,0102).
   *
   * @type {string|undefined}
   */
  schemeDesignator;

  /**
   * @param {string} meaning The code meaning.
   */
  constructor(meaning) {
    this.meaning = meaning;
  }
}

/**
 * Get a code object from a dicom element.
 *
 * @param {DataElements} dataElements The dicom element.
 * @returns {DicomCode} A code object.
 */
export function getCode(dataElements) {
  // meaning -> CodeMeaning (type1)
  const code = new DicomCode(dataElements['00080104'].value[0]);
  // value -> CodeValue (type1C)
  // longValue -> LongCodeValue (type1C)
  // urnValue -> URNCodeValue (type1C)
  if (dataElements['00080100']) {
    code.value = dataElements['00080100'].value[0];
  } else if (dataElements['00080119']) {
    code.longValue = dataElements['00080119'].value[0];
  } else if (dataElements['00080120']) {
    code.urnValue = dataElements['00080120'].value[0];
  } else {
    throw new Error(
      'Invalid code with no value, no long value and no urn value.');
  }
  // schemeDesignator -> CodingSchemeDesignator (type1C)
  if (typeof code.value !== 'undefined' ||
    typeof code.longValue !== 'undefined') {
    if (dataElements['00080102']) {
      code.schemeDesignator = dataElements['00080102'].value[0];
    } else {
      throw new Error(
        'No coding sheme designator when code value or long value is present');
    }
  }
  return code;
}

