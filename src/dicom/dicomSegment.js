import {
  isEqualRgb,
  cielabToSrgb,
  uintLabToLab,
  labToUintLab,
  srgbToCielab
} from '../utils/colour';
import {
  getCode,
  getDicomCodeItem
} from './dicomCode';

// doc imports
/* eslint-disable no-unused-vars */
import {RGB} from '../utils/colour';
import {DataElement} from './dataElement';
import {DicomCode} from './dicomCode';
/* eslint-enable no-unused-vars */

/**
 * DICOM (mask) segment: item of a SegmentSequence (0062,0002).
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.8.20.4.html}.
 */
export class MaskSegment {
  /**
   * Segment number (0062,0004).
   *
   * @type {number}
   */
  number;
  /**
   * Segment label (0062,0005).
   *
   * @type {string}
   */
  label;
  /**
   * Segment algorithm type (0062,0008).
   *
   * @type {string}
   */
  algorithmType;
  /**
   * Segment algorithm name (0062,0009).
   *
   * @type {string|undefined}
   */
  algorithmName;
  /**
   * Segment display value as simple value.
   *
   * @type {number|undefined}
   */
  displayValue;
  /**
   * Segment display value as RGB colour ({r,g,b}).
   *
   * @type {RGB|undefined}
   */
  displayRGBValue;
  /**
   * Segment property code: specific property
   * the segment represents (0062,000F).
   *
   * @type {DicomCode|undefined}
   */
  propertyTypeCode;
  /**
   * Segment property category code: general category
   * of the property the segment represents (0062,0003).
   *
   * @type {DicomCode|undefined}
   */
  propertyCategoryCode;
  /**
   * Segment tracking UID (0062,0021).
   *
   * @type {string|undefined}
   */
  trackingUid;
  /**
   * Segment tracking id: text label for the UID (0062,0020).
   *
   * @type {string|undefined}
   */
  trackingId;

  /**
   * @param {number} number The segment number.
   * @param {string} label The segment label.
   * @param {string} algorithmType The segment number.
   */
  constructor(number, label, algorithmType) {
    this.number = number;
    this.label = label;
    this.algorithmType = algorithmType;
  }
}

/**
 * Get a segment object from a dicom element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {MaskSegment} A segment object.
 */
export function getSegment(dataElements) {
  // number -> SegmentNumber (type1)
  // label -> SegmentLabel (type1)
  // algorithmType -> SegmentAlgorithmType (type1)
  const segment = new MaskSegment(
    dataElements['00620004'].value[0],
    dataElements['00620005'] ? dataElements['00620005'].value[0] : 'n/a',
    dataElements['00620008'].value[0]
  );
  // algorithmName -> SegmentAlgorithmName (type1C)
  if (dataElements['00620009']) {
    segment.algorithmName = dataElements['00620009'].value[0];
  }
  // // required if type is not MANUAL
  // if (segment.algorithmType !== 'MANUAL' &&
  //   (typeof segment.algorithmName === 'undefined' ||
  //   segment.algorithmName.length === 0)) {
  //   throw new Error('Empty algorithm name for non MANUAL algorithm type.');
  // }
  // displayValue ->
  // - RecommendedDisplayGrayscaleValue
  // - RecommendedDisplayCIELabValue converted to RGB
  if (typeof dataElements['0062000C'] !== 'undefined') {
    segment.displayValue = dataElements['006200C'].value[0];
  } else if (typeof dataElements['0062000D'] !== 'undefined') {
    const cielabElement = dataElements['0062000D'].value;
    const rgb = cielabToSrgb(uintLabToLab({
      l: cielabElement[0],
      a: cielabElement[1],
      b: cielabElement[2]
    }));
    segment.displayRGBValue = rgb;
  }
  // Segmented Property Category Code Sequence (type1, only one)
  if (typeof dataElements['00620003'] !== 'undefined') {
    segment.propertyCategoryCode =
      getCode(dataElements['00620003'].value[0]);
  } else {
    throw new Error('Missing Segmented Property Category Code Sequence.');
  }
  // Segmented Property Type Code Sequence (type1)
  if (typeof dataElements['0062000F'] !== 'undefined') {
    segment.propertyTypeCode =
      getCode(dataElements['0062000F'].value[0]);
  } else {
    throw new Error('Missing Segmented Property Type Code Sequence.');
  }
  // tracking Id and UID (type1C)
  if (typeof dataElements['00620020'] !== 'undefined') {
    segment.trackingId = dataElements['00620020'].value[0];
    segment.trackingUid = dataElements['00620021'].value[0];
  }

  return segment;
}

/**
 * Check if two segment objects are equal.
 *
 * @param {MaskSegment} seg1 The first segment.
 * @param {MaskSegment} seg2 The second segment.
 * @returns {boolean} True if both segment are equal.
 */
export function isEqualSegment(seg1, seg2) {
  // basics
  if (typeof seg1 === 'undefined' ||
    typeof seg2 === 'undefined' ||
    seg1 === null ||
    seg2 === null) {
    return false;
  }
  let isEqual = seg1.number === seg2.number &&
    seg1.label === seg2.label &&
    seg1.algorithmType === seg2.algorithmType;
  // display value
  if (typeof seg1.displayRGBValue !== 'undefined' &&
    typeof seg2.displayRGBValue !== 'undefined') {
    isEqual = isEqual &&
      isEqualRgb(seg1.displayRGBValue, seg2.displayRGBValue);
  } else if (typeof seg1.displayValue !== 'undefined' &&
    typeof seg2.displayValue !== 'undefined') {
    isEqual = isEqual &&
      seg1.displayValue === seg2.displayValue;
  } else {
    isEqual = false;
  }
  // algorithmName
  if (typeof seg1.algorithmName !== 'undefined') {
    if (typeof seg2.algorithmName === 'undefined') {
      isEqual = false;
    } else {
      isEqual = isEqual &&
        seg1.algorithmName === seg2.algorithmName;
    }
  }

  return isEqual;
}

/**
 * Check if two segment objects are similar: either the
 * number or the displayValue are equal.
 *
 * @param {MaskSegment} seg1 The first segment.
 * @param {MaskSegment} seg2 The second segment.
 * @returns {boolean} True if both segment are similar.
 */
export function isSimilarSegment(seg1, seg2) {
  // basics
  if (typeof seg1 === 'undefined' ||
    typeof seg2 === 'undefined' ||
    seg1 === null ||
    seg2 === null) {
    return false;
  }
  let isSimilar = seg1.number === seg2.number;
  // display value
  if (typeof seg1.displayRGBValue !== 'undefined' &&
    typeof seg2.displayRGBValue !== 'undefined') {
    isSimilar = isSimilar ||
      isEqualRgb(seg1.displayRGBValue, seg2.displayRGBValue);
  } else if (typeof seg1.displayValue !== 'undefined' &&
    typeof seg2.displayValue !== 'undefined') {
    isSimilar = isSimilar ||
      seg1.displayValue === seg2.displayValue;
  } else {
    isSimilar = false;
  }

  return isSimilar;
}

/**
 * Get a dicom simple tag from a segment object.
 *
 * @param {MaskSegment} segment The segment object.
 * @returns {Object<string, any>} The item as a list of (key, value) pairs.
 */
export function getDicomSegmentItem(segment) {
  let algoType = segment.algorithmType;
  if (algoType === undefined) {
    algoType = 'MANUAL';
  }
  // dicom item (tags are in group/element order)
  const segmentItem = {
    SegmentNumber: segment.number,
    SegmentLabel: segment.label,
    SegmentAlgorithmType: algoType
  };
  // SegmentAlgorithmName
  if (algoType !== 'MANUAL' && segment.algorithmName !== undefined) {
    segmentItem.SegmentAlgorithmName = segment.algorithmName;
  }
  // RecommendedDisplay value
  if (segment.displayRGBValue) {
    const cieLab = labToUintLab(srgbToCielab(segment.displayRGBValue));
    segmentItem.RecommendedDisplayCIELabValue = [
      Math.round(cieLab.l),
      Math.round(cieLab.a),
      Math.round(cieLab.b)
    ];
  } else {
    segmentItem.RecommendedDisplayGrayscaleValue = segment.displayValue;
  }
  // SegmentedPropertyCategoryCodeSequence
  if (segment.propertyCategoryCode) {
    segmentItem.SegmentedPropertyCategoryCodeSequence = {
      value: [getDicomCodeItem(segment.propertyCategoryCode)]
    };
  }
  // SegmentedPropertyTypeCodeSequence
  if (segment.propertyTypeCode) {
    segmentItem.SegmentedPropertyTypeCodeSequence = {
      value: [getDicomCodeItem(segment.propertyTypeCode)]
    };
  }
  // tracking
  if (segment.trackingId) {
    segmentItem.TrackingID = segment.trackingId;
    segmentItem.TrackingUID = segment.trackingUid;
  }
  // return
  return segmentItem;
}
