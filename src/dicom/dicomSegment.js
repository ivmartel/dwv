import {
  isEqualRgb,
  cielabToSrgb,
  uintLabToLab
} from '../utils/colour';
import {getCode} from './dicomCode';
import {getSpacingFromMeasure} from './dicomElementsWrapper';
import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {RGB} from '../utils/colour';
import {DataElement} from './dataElement';
import {DicomCode} from './dicomCode';
/* eslint-enable no-unused-vars */

/**
 * @typedef {Object<string, DataElement>} DataElements
 */

/**
 * DICOM (mask) segment.
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
 * @param {DataElements} dataElements The dicom element.
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
 * Get a frame information object from a dicom element.
 *
 * @param {DataElements} dataElements The dicom element.
 * @returns {object} A frame information object.
 */
export function getSegmentFrameInfo(dataElements) {
  // Derivation Image Sequence
  const derivationImages = [];
  if (typeof dataElements['00089124'] !== 'undefined') {
    const derivationImageSq = dataElements['00089124'].value;
    // Source Image Sequence
    for (let i = 0; i < derivationImageSq.length; ++i) {
      const sourceImages = [];
      if (typeof derivationImageSq[i]['00082112'] !== 'undefined') {
        const sourceImageSq = derivationImageSq[i]['00082112'].value;
        for (let j = 0; j < sourceImageSq.length; ++j) {
          const sourceImage = {};
          // Referenced SOP Class UID
          if (typeof sourceImageSq[j]['00081150'] !== 'undefined') {
            sourceImage.referencedSOPClassUID =
              sourceImageSq[j]['00081150'].value[0];
          }
          // Referenced SOP Instance UID
          if (typeof sourceImageSq[j]['00081155'] !== 'undefined') {
            sourceImage.referencedSOPInstanceUID =
              sourceImageSq[j]['00081155'].value[0];
          }
          sourceImages.push(sourceImage);
        }
      }
      derivationImages.push({
        sourceImages: sourceImages
      });
    }
  }
  // Frame Content Sequence (required, only one)
  const frameContentSq = dataElements['00209111'].value;
  // Dimension Index Value
  const dimIndex = frameContentSq[0]['00209157'].value;
  // Segment Identification Sequence (required, only one)
  const segmentIdSq = dataElements['0062000A'].value;
  // Referenced Segment Number
  const refSegmentNumber = segmentIdSq[0]['0062000B'].value[0];
  // Plane Position Sequence (required, only one)
  const planePosSq = dataElements['00209113'].value;
  // Image Position (Patient) (conditionally required)
  const imagePosPat = planePosSq[0]['00200032'].value;
  for (let p = 0; p < imagePosPat.length; ++p) {
    imagePosPat[p] = parseFloat(imagePosPat[p]);
  }
  const frameInfo = {
    dimIndex: dimIndex,
    imagePosPat: imagePosPat,
    derivationImages: derivationImages,
    refSegmentNumber: refSegmentNumber
  };
  // Plane Orientation Sequence
  if (typeof dataElements['00209116'] !== 'undefined') {
    const framePlaneOrientationSeq = dataElements['00209116'];
    if (framePlaneOrientationSeq.value.length !== 0) {
      // should only be one Image Orientation (Patient)
      const frameImageOrientation =
        framePlaneOrientationSeq.value[0]['00200037'].value;
      if (typeof frameImageOrientation !== 'undefined') {
        frameInfo.imageOrientationPatient = frameImageOrientation;
      }
    }
  }
  // Pixel Measures Sequence
  if (typeof dataElements['00289110'] !== 'undefined') {
    const framePixelMeasuresSeq = dataElements['00289110'];
    if (framePixelMeasuresSeq.value.length !== 0) {
      // should only be one
      const frameSpacing =
        getSpacingFromMeasure(framePixelMeasuresSeq.value[0]);
      if (typeof frameSpacing !== 'undefined') {
        frameInfo.spacing = frameSpacing;
      }
    } else {
      logger.warn(
        'No shared functional group pixel measure sequence items.');
    }
  }

  return frameInfo;
}

/**
 * Check if two segment objects are equal.
 *
 * @param {object} seg1 The first segment.
 * @param {object} seg2 The second segment.
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

