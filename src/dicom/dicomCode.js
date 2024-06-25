// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
/* eslint-enable no-unused-vars */

/**
 * DICOM code tag keys.
 */
const TagKeys = {
  CodeValue: '00080100',
  CodingSchemeDesignator: '00080102',
  CodeMeaning: '00080104',
  LongCodeValue: '00080119',
  URNCodeValue: '00080120'
};

/**
 * DICOM code: item of a basic code sequence.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_8.8.html}.
 */
export class DicomCode {
  /**
   * Code meaning.
   *
   * @type {string}
   */
  meaning;
  /**
   * Code value.
   *
   * @type {string|undefined}
   */
  value;
  /**
   * Long code value.
   *
   * @type {string|undefined}
   */
  longValue;
  /**
   * URN code value.
   *
   * @type {string|undefined}
   */
  urnValue;
  /**
   * Coding scheme designator.
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

  /**
   * Get a string representation of this object.
   *
   * @returns {string} The code as string.
   */
  toString() {
    return '(' + this.value + ', ' +
      this.schemeDesignator + ', \'' +
      this.meaning + '\')';
  }
}

/**
 * Check if two code objects are equal.
 *
 * @param {DicomCode} code1 The first code.
 * @param {DicomCode} code2 The second code.
 * @returns {boolean} True if both codes are equal.
 */
export function isEqualCode(code1, code2) {
  return Object.keys(code1).length === Object.keys(code2).length &&
  Object.keys(code1).every(key =>
    Object.prototype.hasOwnProperty.call(code2, key) &&
    code1[key] === code2[key]
  );
}

/**
 * Get a code object from a dicom element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {DicomCode} A code object.
 */
export function getCode(dataElements) {
  // meaning -> CodeMeaning (type1)
  const code = new DicomCode(dataElements[TagKeys.CodeMeaning].value[0]);
  // value -> CodeValue (type1C)
  // longValue -> LongCodeValue (type1C)
  // urnValue -> URNCodeValue (type1C)
  if (typeof dataElements[TagKeys.CodeValue] !== 'undefined') {
    code.value = dataElements[TagKeys.CodeValue].value[0];
  } else if (typeof dataElements[TagKeys.LongCodeValue] !== 'undefined') {
    code.longValue = dataElements[TagKeys.LongCodeValue].value[0];
  } else if (typeof dataElements[TagKeys.URNCodeValue] !== 'undefined') {
    code.urnValue = dataElements[TagKeys.URNCodeValue].value[0];
  } else {
    throw new Error(
      'Invalid code with no value, no long value and no urn value.');
  }
  // schemeDesignator -> CodingSchemeDesignator (type1C)
  if (typeof code.value !== 'undefined' ||
    typeof code.longValue !== 'undefined') {
    if (typeof dataElements[TagKeys.CodingSchemeDesignator] !== 'undefined') {
      code.schemeDesignator =
        dataElements[TagKeys.CodingSchemeDesignator].value[0];
    } else {
      throw new Error(
        'No coding sheme designator when code value or long value is present');
    }
  }
  return code;
}

/**
 * Get a simple dicom element item from a code object.
 *
 * @param {DicomCode} code The code object.
 * @returns {Object<string, any>} The item as a list of (key, value) pairs.
 */
export function getDicomCodeItem(code) {
  // dicom item (tags are in group/element order)
  const codeItem = {};
  // value
  if (typeof code.value !== 'undefined') {
    codeItem.CodeValue = code.value;
  } else if (typeof code.longValue !== 'undefined') {
    codeItem.LongCodeValue = code.longValue;
  } else if (typeof code.urnValue !== 'undefined') {
    codeItem.URNCodeValue = code.urnValue;
  }
  // CodingSchemeDesignator
  if (typeof code.schemeDesignator !== 'undefined') {
    codeItem.CodingSchemeDesignator = code.schemeDesignator;
  }
  // CodeMeaning
  codeItem.CodeMeaning = code.meaning;
  // return
  return codeItem;
}