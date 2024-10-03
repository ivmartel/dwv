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
 * List: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part16/chapter_d.html}.
 */
const DcmCodes = {
  111030: 'Image Region',
  112039: 'Tracking Identifier',
  112040: 'Tracking Unique Identifier',
  113048: 'Pixel by pixel Maximum',
  113049: 'Pixel by pixel mean',
  113051: 'Pixel by pixel Minimum',
  113061: 'Standard Deviation',
  113076: 'Segmentation',
  121055: 'Path',
  121207: 'Height',
  121322: 'Source image for image processing operation',
  121324: 'Source Image',
  122438: 'Reference Points',
  125007: 'Measurement Group',
  125309: 'Short label',
  128773: 'Reference Geometry'
};

/**
 * SNOMED-CT codes.
 * List: {@link https://browser.ihtsdotools.org}.
 */
const SctCodes = {
  1483009: 'Angle',
  42798000: 'Area',
  103355008: 'Width',
  103339001: 'Long axis',
  103340004: 'Short axis',
  131190003: 'Radius',
  261665006: 'Unknown',
  410668003: 'Length',
  718499004: 'Color'
};

/**
 * UCUM codes.
 * Definition: {@link https://unitsofmeasure.org/ucum}.
 * List: {@link https://ucum.nlm.nih.gov/ucum-lhc/demo.html}.
 */
const UcumCodes = {
  1: 'No units',
  mm: 'Millimeter',
  deg: 'Degree - plane angle',
  cm2: 'Square centimeter',
  'cm2/ml': 'Square centimeter per milliliter',
  '/cm': 'Per centimeter',
  'g/ml': 'Gram per milliliter',
  'g/ml{SUVbw}': 'Standardized Uptake Value body weight',
  'mg/ml': 'Milligram per milliliter',
  'umol/ml': 'Micromole per milliliter',
  'Bq/ml': 'Becquerels per milliliter',
  'mg/min/ml': 'Milligrams per minute per milliliter',
  'umol/min/ml': 'Micromole per minute per milliliter',
  'ml/min/g': 'Milliliter per minute per gram',
  'ml/g': 'Milliliter per gram',
  'ml/min/ml': 'Milliliter per minute per milliliter',
  'ml/ml': 'Milliliter per milliliter',
  '%': 'Percentage',
  '[hnsf\'U]': 'Hounsfield unit',
  '10*23/ml': 'Electron density',
  '{counts}': 'Counts',
  '{counts}/s': 'Counts per second',
  '{propcounts}': 'Proportional to counts',
  '{propcounts}/s': 'Proportional to counts per second',
};

/**
 * Get a DICOM code from a value (~id).
 *
 * @param {string} value The code value.
 * @param {string} scheme The scheme designator.
 * @returns {DicomCode|undefined} The DICOM code.
 */
function getDicomCode(value, scheme) {
  let meaning;
  if (scheme === 'DCM') {
    meaning = DcmCodes[value];
  } else if (scheme === 'SCT') {
    meaning = SctCodes[value];
  } else if (scheme === 'UCUM') {
    meaning = UcumCodes[value];
  }
  let code;
  if (typeof meaning !== 'undefined') {
    code = new DicomCode(meaning);
    code.schemeDesignator = scheme;
    code.value = value;
  }
  return code;
}

/**
 * Get a measurement group DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getMeasurementGroupCode() {
  return getDicomCode('125007', 'DCM');
}

/**
 * Get an image region DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getImageRegionCode() {
  return getDicomCode('111030', 'DCM');
}

/**
 * Get a reference geometry DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getReferenceGeometryCode() {
  return getDicomCode('128773', 'DCM');
}

/**
 * Get a path DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getPathCode() {
  return getDicomCode('121055', 'DCM');
}

/**
 * Get a source image DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getSourceImageCode() {
  return getDicomCode('121324', 'DCM');
}

/**
 * Get a tracking identifier DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getTrackingIdentifierCode() {
  return getDicomCode('112039', 'DCM');
}

/**
 * Get a segmentation DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getSegmentationCode() {
  return getDicomCode('113076', 'DCM');
}

/**
 * Get a source image for processing DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getSourceImageForProcessingCode() {
  return getDicomCode('121322', 'DCM');
}

/**
 * Get a short label DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getShortLabelCode() {
  return getDicomCode('125309', 'DCM');
}

/**
 * Get a reference points DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getReferencePointsCode() {
  return getDicomCode('122438', 'DCM');
}

/**
 * Get a colour DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getColourCode() {
  return getDicomCode('718499004', 'SCT');
}

/**
 * Quantification name to dictionary item.
 */
const QuantificationName2DictItem = {
  angle: {key: '1483009', scheme: 'SCT'},
  length: {key: '410668003', scheme: 'SCT'},
  surface: {key: '42798000', scheme: 'SCT'},
  height: {key: '121207', scheme: 'DCM'},
  width: {key: '103355008', scheme: 'SCT'},
  radius: {key: '131190003', scheme: 'SCT'},
  a: {key: '103339001', scheme: 'SCT'},
  b: {key: '103340004', scheme: 'SCT'},
  min: {key: '113051', scheme: 'DCM'},
  max: {key: '113048', scheme: 'DCM'},
  mean: {key: '113049', scheme: 'DCM'},
  stddev: {key: '113061', scheme: 'DCM'},
  // median
  // 25th percentile
  // 75th percentile
};

/**
 * Get a concept name DICOM code.
 *
 * @param {string} name The measurment name as defined
 *   in a quantification object.
 * @returns {DicomCode|undefined} The code.
 */
export function getConceptNameCode(name) {
  const item = QuantificationName2DictItem[name];
  let code;
  if (typeof item !== 'undefined') {
    code = getDicomCode(item.key, item.scheme);
  }
  return code;
}

/**
 * Get the DICOM code for a quantification name.
 *
 * @param {DicomCode} code The Dicom code.
 * @returns {string|undefined} The quantification name.
 */
export function getQuantificationName(code) {
  let name;
  for (const propKey in QuantificationName2DictItem) {
    const item = QuantificationName2DictItem[propKey];
    if (item.scheme === code.schemeDesignator &&
      item.key === code.value) {
      name = propKey;
      break;
    }
  }
  return name;
}

/**
 * Quantification unit to UCUM key. Associated tags:
 * - Rescale type {@link https://dicom.innolitics.com/ciods/computed-radiography-image/modality-lut/00281054},
 * - Units {@link https://dicom.innolitics.com/ciods/positron-emission-tomography-image/pet-series/00541001}.
 * - SUV {@link https://dicom.nema.org/medical/dicom/current/output/chtml/part16/sect_CID_85.html}.
 */
const QuantificationUnit2UcumKey = {
  'unit.mm': 'mm',
  'unit.cm2': 'cm2',
  'unit.degree': 'deg',
  // OD optical density
  HU: '[hnsf\'U]',
  // US: '1', // duplicates 'NONE'
  MGML: 'mg/ml',
  // Z_EFF Effective Atomic Number (i.e., Effective-Z)
  ED: '10*23/ml',
  // EDW Electron density normalized
  // HU_MOD Modified Hounsfield Unit
  PCT: '%',
  CNTS: '{counts}',
  NONE: '1',
  CM2: 'cm2',
  CM2ML: 'cm2/ml',
  PCNT: '%',
  CPS: '{counts}/s',
  BQML: 'Bq/ml',
  MGMINML: 'mg/min/ml',
  UMOLMINML: 'umol/min/ml',
  MLMING: 'ml/min/g',
  MLG: 'ml/g',
  '1CM': '/cm',
  UMOLML: 'umol/ml',
  PROPCNTS: '{propcounts}',
  PROPCPS: '{propcounts}/s',
  MLMINML: 'ml/min/ml',
  MLML: 'ml/ml',
  GML: 'g/ml',
  //STDDEV
  SUV: 'g/ml{SUVbw}',
};

/**
 * Get a measurement units DICOM code.
 *
 * @param {string} name The unit name as defined in a quantification object.
 * @returns {DicomCode|undefined} The code.
 */
export function getMeasurementUnitsCode(name) {
  const key = QuantificationUnit2UcumKey[name];
  let code;
  if (typeof key !== 'undefined') {
    code = getDicomCode(key, 'UCUM');
  } else if (typeof key === 'undefined') {
    // no unit
    code = getDicomCode('1', 'UCUM');
  }
  return code;
}

/**
 * Get a quantification unit name.
 *
 * @param {DicomCode} code The code to get the unit from.
 * @returns {string} The quantification unit.
 */
export function getQuantificationUnit(code) {
  let unit;
  for (const propKey in QuantificationUnit2UcumKey) {
    const ucumKey = QuantificationUnit2UcumKey[propKey];
    if (code.schemeDesignator === 'UCUM' &&
      ucumKey === code.value) {
      unit = propKey;
      break;
    }
  }
  return unit;
}
