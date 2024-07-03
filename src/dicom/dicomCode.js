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
 * List: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part16/chapter_d.html}.
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
  const item = {};
  // value
  if (typeof code.value !== 'undefined') {
    item.CodeValue = code.value;
  } else if (typeof code.longValue !== 'undefined') {
    item.LongCodeValue = code.longValue;
  } else if (typeof code.urnValue !== 'undefined') {
    item.URNCodeValue = code.urnValue;
  }
  // CodingSchemeDesignator
  if (typeof code.schemeDesignator !== 'undefined') {
    item.CodingSchemeDesignator = code.schemeDesignator;
  }
  // CodeMeaning
  item.CodeMeaning = code.meaning;
  // return
  return item;
}

/**
 * DICOM codes.
 */
const DcmCodes = {
  111030: 'Image Region',
  112039: 'Tracking Identifier',
  112040: 'Tracking Unique Identifier',
  113076: 'Segmentation',
  121322: 'Source image for image processing operation',
  121324: 'Source Image',
  125007: 'Measurement Group',
  125309: 'Short label'
};

/**
 * Get a DICOM code from a value (~id).
 *
 * @param {string} value The code value.
 * @returns {DicomCode} The DICOM code.
 */
function getDicomCode(value) {
  const code = new DicomCode(DcmCodes[value]);
  code.schemeDesignator = 'DCM';
  code.value = value;
  return code;
}

/**
 * Get a measurement group DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getMeasurementGroupCode() {
  return getDicomCode('125007');
}

/**
 * Get an image region DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getImageRegionCode() {
  return getDicomCode('111030');
}

/**
 * Get a source image DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getSourceImageCode() {
  return getDicomCode('121324');
}

/**
 * Get a tracking identifier DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getTrackingIdentifierCode() {
  return getDicomCode('112039');
}

/**
 * Get a segmentation DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getSegmentationCode() {
  return getDicomCode('113076');
}

/**
 * Get a source image for processing DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getSourceImageForProcessingCode() {
  return getDicomCode('121322');
}

/**
 * Get a short label DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getShortLabelCode() {
  return getDicomCode('125309');
}
