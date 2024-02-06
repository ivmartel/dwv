import {getSpacingFromMeasure} from './dicomElementsWrapper';
import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
import {Spacing} from '../image/spacing';
/* eslint-enable no-unused-vars */

/**
 * @typedef {Object<string, DataElement>} DataElements
 */

/**
 * DICOM segment frame info.
 */
export class DicomSegmentFrameInfo {
  /**
   * The dimension index.
   *
   * @type {number[]}
   */
  dimIndex;
  /**
   * The frame image position patient.
   *
   * @type {number[]}
   */
  imagePosPat;
  /**
   * List of derivation images.
   *
   * @type {Array}
   */
  derivationImages;
  /**
   * The reference segment number.
   *
   * @type {number}
   */
  refSegmentNumber;

  /**
   * The frame image orientation.
   *
   * @type {number[]|undefined}
   */
  imageOrientationPatient;
  /**
   * The frame spacing.
   *
   * @type {Spacing|undefined}
   */
  spacing;

  /**
   * @param {number[]} dimIndex The dimension index.
   * @param {number[]} imagePosPat The frame image position patient.
   * @param {Array} derivationImages List of derivation images.
   * @param {number} refSegmentNumber The reference segment number.
   */
  constructor(dimIndex, imagePosPat, derivationImages, refSegmentNumber) {
    this.dimIndex = dimIndex;
    this.imagePosPat = imagePosPat;
    this.derivationImages = derivationImages;
    this.refSegmentNumber = refSegmentNumber;
  }
}

/**
 * Get a frame information object from a dicom element.
 *
 * @param {DataElements} dataElements The dicom element.
 * @returns {DicomSegmentFrameInfo} A frame information object.
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
  const frameInfo = new DicomSegmentFrameInfo(
    dimIndex,
    imagePosPat,
    derivationImages,
    refSegmentNumber
  );
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

