/**
 * @import {DataElement} from './dataElement.js';
 * @import {SimpleTagValues} from './types.js';
 */

/**
 * DICOM code tag keys.
 */
const TagKeys = {
  CodeValue: '00080100',
  CodingSchemeDesignator: '00080102',
  CodingSchemeVersion: '00080103',
  CodeMeaning: '00080104',
  LongCodeValue: '00080119',
  URNCodeValue: '00080120'
};

/**
 * DICOM code: item of a basic code sequence.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_8.8.html}.
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
   * Coding scheme version, only used with a coding scheme designator.
   *
   * @type {string|undefined}
   */
  schemeVersion;

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
    return `(${this.value}, ${
      this.schemeDesignator }, '${
      this.meaning }')`;
  }
}

/**
 * Check if two code objects are equal: just checks
 * schemeDesignator and value.
 *
 * @param {DicomCode} code1 The first code.
 * @param {DicomCode} code2 The second code.
 * @returns {boolean} True if both codes are equal.
 */
export function isEqualCode(code1, code2) {
  return typeof code1 !== 'undefined' &&
    typeof code2 !== 'undefined' &&
    code1.schemeDesignator === code2.schemeDesignator &&
    code1.value === code2.value;
}

/**
 * Get a code object from a dicom element.
 *
 * @param {Record<string, DataElement>} dataElements The dicom element.
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
  // schemeVersion -> CodingSchemeVersion (type1C, only with a designator)
  if (typeof code.schemeDesignator !== 'undefined' &&
    typeof dataElements[TagKeys.CodingSchemeVersion] !== 'undefined') {
    code.schemeVersion = dataElements[TagKeys.CodingSchemeVersion].value[0];
  }
  return code;
}

/**
 * Get a simple dicom element item from a code object.
 *
 * @param {DicomCode} code The code object.
 * @returns {SimpleTagValues} The item as a list of (key, value) pairs.
 */
export function getDicomCodeItem(code) {
  // dicom item (tags are in group/element order)
  /** @type {SimpleTagValues} */
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
    // CodingSchemeVersion: shall not be present without a designator
    if (typeof code.schemeVersion !== 'undefined') {
      item.CodingSchemeVersion = code.schemeVersion;
    }
  }
  // CodeMeaning
  item.CodeMeaning = code.meaning;
  // return
  return item;
}

/**
 * DICOM codes.
 * List: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter_d.html}.
 */
export const DcmCodes = {
  MRSignalIntensity: {
    value: '110852', meaning: 'MR signal intensity'
  },
  CADProcessingAndFindingsSummary: {
    value: '111017', meaning: 'CAD Processing and Findings Summary'
  },
  ImageLibrary: {
    value: '111028', meaning: 'Image Library'
  },
  ImageRegion: {
    value: '111030', meaning: 'Image Region'
  },
  SingleImageFinding: {
    value: '111059', meaning: 'Single Image Finding'
  },
  SelectedRegion: {
    value: '111099', meaning: 'Selected region'
  },
  AllAlgorithmsSucceededWithFindings: {
    value: '111242', meaning: 'All algorithms succeeded; with findings'
  },
  ChestCADReport: {
    value: '112000', meaning: 'Chest CAD Report'
  },
  ResponseEvaluation: {
    value: '112020', meaning: 'Response Evaluation'
  },
  AttenuationCoefficient: {
    value: '112031', meaning: 'Attenuation Coefficient'
  },
  ResponseEvaluationMethod: {
    value: '112021', meaning: 'Response Evaluation Method'
  },
  RECIST: {
    value: '112022', meaning: 'RECIST'
  },
  TrackingIdentifier: {
    value: '112039', meaning: 'Tracking Identifier'
  },
  MeasurementOfResponse: {
    value: '112051', meaning: 'Measurement of Response'
  },
  TrackingUniqueIdentifier: {
    value: '112040', meaning: 'Tracking Unique Identifier'
  },
  CurrentResponse: {
    value: '112048', meaning: 'Current Response'
  },
  PixelByPixelMaximum: {
    value: '113048', meaning: 'Pixel by pixel Maximum'
  },
  PixelByPixelMean: {
    value: '113049', meaning: 'Pixel by pixel mean'
  },
  PixelByPixelMinimum: {
    value: '113051', meaning: 'Pixel by pixel Minimum'
  },
  StandardDeviation: {
    value: '113061', meaning: 'Standard Deviation'
  },
  Segmentation: {
    value: '113076', meaning: 'Segmentation'
  },
  ObserverType: {
    value: '121005', meaning: 'Observer Type'
  },
  Device: {
    value: '121007', meaning: 'Device'
  },
  DeviceObserverUID: {
    value: '121012', meaning: 'Device Observer UID'
  },
  DeviceObserverName: {
    value: '121013', meaning: 'Device Observer Name'
  },
  DeviceObserverManufacturer: {
    value: '121014', meaning: 'Device Observer Manufacturer'
  },
  DeviceObserverModelName: {
    value: '121015', meaning: 'Device Observer Model Name'
  },
  LanguageOfContentItemAndDescendants: {
    value: '121049', meaning: 'Language of Content Item and Descendants'
  },
  Path: {
    value: '121055', meaning: 'Path'
  },
  ProcedureReported: {
    value: '121058', meaning: 'Procedure reported'
  },
  Finding: {
    value: '121071', meaning: 'Finding'
  },
  Comment: {
    value: '121106', meaning: 'Comment'
  },
  SourceOfMeasurement: {
    value: '121112', meaning: 'Source of Measurement'
  },
  Height: {
    value: '121207', meaning: 'Height'
  },
  SourceImageForImageProcessingOperation: {
    value: '121322', meaning: 'Source image for image processing operation'
  },
  SourceImage: {
    value: '121324', meaning: 'Source Image'
  },
  Derivation: {
    value: '121401', meaning: 'Derivation'
  },
  ReferencePoints: {
    value: '122438', meaning: 'Reference Points'
  },
  MeasurementGroup: {
    value: '125007', meaning: 'Measurement Group'
  },
  ShortLabel: {
    value: '125309', meaning: 'Short Label'
  },
  ImagingMeasurementReport: {
    value: '126000', meaning: 'Imaging Measurement Report'
  },
  ImagingMeasurements: {
    value: '126010', meaning: 'Imaging Measurements'
  },
  ImageLibraryGroup: {
    value: '126200', meaning: 'Image Library Group'
  },
  SUVbw: {
    value: '126401', meaning: 'SUVbw'
  },
  ReferenceGeometry: {
    value: '128773', meaning: 'Reference Geometry'
  }
};

/**
 * SNOMED-CT codes, with the code meanings used in the DICOM context groups.
 * List: {@link https://browser.ihtsdotools.org}.
 */
const SctCodes = {
  1483009: 'Angle',
  42798000: 'Area',
  56851009: 'Maximum',
  81827009: 'Diameter',
  103339001: 'Long Axis',
  103340004: 'Short Axis',
  103355008: 'Width',
  131190003: 'Radius',
  255605001: 'Minimum',
  261665006: 'Unknown',
  363679005: 'Imaging procedure',
  373098007: 'Mean',
  373099004: 'Median',
  386136009: 'Standard Deviation',
  410668003: 'Length',
  // not part of the DICOM standard, only kept to read
  // annotations written by dwv up to v0.37
  718499004: 'Color'
};

/**
 * UCUM codes, with the code meanings used in the DICOM context groups
 * (for ex CID 7181, 7183, 7460, 7461 and 84).
 * Definition: {@link https://unitsofmeasure.org/ucum}.
 * List: {@link https://ucum.nlm.nih.gov/ucum-lhc/demo.html}.
 * Code meaning rules: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/sect_7.2.2.html}.
 */
const UcumCodes = {
  1: 'no units',
  mm: 'millimeter',
  mm2: 'square millimeter',
  deg: 'Degree',
  cm2: 'square centimeter',
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
  '%': 'Percent',
  '[hnsf\'U]': 'Hounsfield unit',
  '10*23/ml': 'Electron Density',
  '{counts}': 'Counts',
  '{counts}/s': 'Counts per second',
  '{propcounts}': 'Proportional to counts',
  '{propcounts}/s': 'Proportional to counts per second',
};

/**
 * DWV local coding scheme designator: local schemes start with '99'.
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/chapter_8.html}.
 */
export const DWV_CODING_SCHEME_DESIGNATOR = '99DWV';

/**
 * DWV local codes, for annotation properties that have no
 * DICOM equivalent.
 */
export const DwvCodes = {
  Colour: {
    value: 'COLOUR', meaning: 'Colour'
  },
  LabelPosition: {
    value: 'LABEL_POSITION', meaning: 'Label position'
  },
  ReferencePoints: {
    value: 'REFERENCE_POINTS', meaning: 'Reference points'
  },
  // plane of an annotation drawn on a non acquisition plane
  PlanePoints: {
    value: 'PLANE_POINTS', meaning: 'Plane points'
  },
  // intensity measured property when no CID 7180 concept fits
  // the referenced image
  PixelValue: {
    value: 'PIXEL_VALUE', meaning: 'Pixel value'
  }
};

/**
 * Get a DICOM code from a value and meaning.
 *
 * @param {object} code The code value as {value, meaning}.
 * @returns {DicomCode} The DICOM code.
 */
export function getDcmDicomCode(code) {
  const dcmCode = new DicomCode(code.meaning);
  dcmCode.schemeDesignator = 'DCM';
  dcmCode.value = code.value;
  return dcmCode;
}

/**
 * Get a DWV local DICOM code from a value and meaning.
 *
 * @param {object} code The code value as {value, meaning}.
 * @returns {DicomCode} The DICOM code.
 */
export function getDwvDicomCode(code) {
  const dwvCode = new DicomCode(code.meaning);
  dwvCode.schemeDesignator = DWV_CODING_SCHEME_DESIGNATOR;
  dwvCode.value = code.value;
  return dwvCode;
}

/**
 * Get the language code for English (United States).
 * Ref: CID 5000 ({@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/sect_CID_5000.html}),
 * the coding scheme is RFC5646.
 *
 * @returns {DicomCode} The code.
 */
export function getEnglishLanguageCode() {
  const code = new DicomCode('English, United States');
  code.schemeDesignator = 'RFC5646';
  code.value = 'en-US';
  return code;
}

/**
 * Get the default 'Procedure reported' value code:
 * (363679005, SCT, 'Imaging procedure') from CID 100.
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/sect_CID_100.html}.
 *
 * @returns {DicomCode} The code.
 */
export function getImagingProcedureCode() {
  return getDicomCode('363679005', 'SCT');
}

/**
 * Get a DICOM code from a value (~id).
 *
 * @param {string} value The code value.
 * @param {string} scheme The scheme designator.
 * @returns {DicomCode|undefined} The DICOM code.
 */
function getDicomCode(value, scheme) {
  let meaning;
  if (scheme === 'SCT') {
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
 * Get a segmentation DICOM code.
 *
 * @returns {DicomCode} The code.
 */
export function getSegmentationCode() {
  return getDcmDicomCode(DcmCodes.Segmentation);
}

/**
 * Get a colour DICOM code: (718499004, SCT, 'Color').
 *
 * Not part of the DICOM standard, only used to read annotations
 * written by dwv up to v0.37. Use the dwv local
 * {@link DwvCodes}.Colour code instead.
 *
 * @returns {DicomCode} The code.
 */
export function getColourCode() {
  return getDicomCode('718499004', 'SCT');
}

/**
 * Get a DICOM code from a dictionary item.
 *
 * @param {object} item The item as {key, scheme}.
 * @returns {DicomCode|undefined} The code.
 */
function getCodeFromDictItem(item) {
  let code;
  if (item.scheme === 'DCM') {
    const dcmItem = Object.values(DcmCodes).find(function (dcmCode) {
      return dcmCode.value === item.key;
    });
    if (typeof dcmItem !== 'undefined') {
      code = getDcmDicomCode(dcmItem);
    }
  } else {
    code = getDicomCode(item.key, item.scheme);
  }
  return code;
}

/**
 * Get the quantification name of a dictionary item.
 *
 * @param {Record<string, object>} dict The {name: {key, scheme}} dictionary.
 * @param {DicomCode} code The code to look for.
 * @returns {string|undefined} The quantification name.
 */
function getNameFromDict(dict, code) {
  let name;
  for (const propKey in dict) {
    const item = dict[propKey];
    if (item.scheme === code.schemeDesignator &&
      item.key === code.value) {
      name = propKey;
      break;
    }
  }
  return name;
}

/**
 * Quantification name to dictionary item: size measurements
 * from CID 7470 (linear), CID 7471 (area) and CID 12304 (angle).
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/sect_CID_7470.html}.
 */
const QuantificationName2DictItem = {
  angle: {key: '1483009', scheme: 'SCT'},
  length: {key: '410668003', scheme: 'SCT'},
  surface: {key: '42798000', scheme: 'SCT'},
  height: {key: '121207', scheme: 'DCM'},
  width: {key: '103355008', scheme: 'SCT'},
  radius: {key: '131190003', scheme: 'SCT'},
  longAxis: {key: '103339001', scheme: 'SCT'},
  shortAxis: {key: '103340004', scheme: 'SCT'},
  // legacy statistics codes: 'pixel by pixel' codes are meant for
  // values derived from two or more images, kept to read annotations
  // written by dwv up to v0.37
  min: {key: '113051', scheme: 'DCM'},
  max: {key: '113048', scheme: 'DCM'},
  mean: {key: '113049', scheme: 'DCM'},
  stdDev: {key: '113061', scheme: 'DCM'},
};

/**
 * Quantification name to derivation dictionary item: statistics
 * from CID 7464 'General Region of Interest Measurement Modifier'.
 * Used as (121401, DCM, 'Derivation') concept modifier of an
 * intensity measurement (TID 1419 row 8).
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/sect_CID_7464.html}.
 */
const QuantificationName2Derivation = {
  min: {key: '255605001', scheme: 'SCT'},
  max: {key: '56851009', scheme: 'SCT'},
  mean: {key: '373098007', scheme: 'SCT'},
  median: {key: '373099004', scheme: 'SCT'},
  stdDev: {key: '386136009', scheme: 'SCT'},
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
    code = getCodeFromDictItem(item);
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
  return getNameFromDict(QuantificationName2DictItem, code);
}

/**
 * Check if a quantification name is a statistic expressed with
 * a derivation modifier (for ex 'mean').
 *
 * @param {string} name The quantification name.
 * @returns {boolean} True if the name is a statistic.
 */
export function isDerivationQuantification(name) {
  return typeof QuantificationName2Derivation[name] !== 'undefined';
}

/**
 * Get the derivation DICOM code (CID 7464) of a quantification name.
 *
 * @param {string} name The quantification name, for ex 'mean'.
 * @returns {DicomCode|undefined} The code.
 */
export function getDerivationCode(name) {
  const item = QuantificationName2Derivation[name];
  let code;
  if (typeof item !== 'undefined') {
    code = getCodeFromDictItem(item);
  }
  return code;
}

/**
 * Get the quantification name of a derivation DICOM code (CID 7464).
 *
 * @param {DicomCode} code The derivation code.
 * @returns {string|undefined} The quantification name, for ex 'mean'.
 */
export function getDerivationQuantificationName(code) {
  return getNameFromDict(QuantificationName2Derivation, code);
}

/**
 * Get the intensity measurement concept name code for a modality,
 * from CID 7180 'Abstract Multi-dimensional Image Model Component
 * Semantic'. It is the measured property of ROI statistics
 * (the statistic itself being a derivation modifier).
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/sect_CID_7180.html}.
 *
 * @param {string} modality The image modality.
 * @returns {DicomCode|undefined} The code, undefined if no
 *   concept is known for the modality.
 */
export function getIntensityConceptCode(modality) {
  let code;
  if (modality === 'CT') {
    code = getDcmDicomCode(DcmCodes.AttenuationCoefficient);
  } else if (modality === 'MR') {
    code = getDcmDicomCode(DcmCodes.MRSignalIntensity);
  }
  // PT: (126401, DCM, 'SUVbw') is only valid for SUV values,
  // the caller has to check the unit
  return code;
}

/**
 * Quantification unit to UCUM key. Associated tags:
 * - Rescale type {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.11.html#sect_C.11.1.1.2},
 * - Units {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part03/sect_C.8.9.html#sect_C.8.9.1.1.3}.
 * - SUV {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part16/sect_CID_85.html}.
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
