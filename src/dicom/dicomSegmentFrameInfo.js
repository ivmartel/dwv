import {getSpacingFromMeasure} from './dicomElementsWrapper';
import {logger} from '../utils/logger';
import {arrayEquals} from '../utils/array';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
import {Spacing} from '../image/spacing';
/* eslint-enable no-unused-vars */

/**
 * DICOM segment frame info: item of a
 *  PerframeFunctionalGroupsSequence (5200,9230).
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.7.6.16.html}.
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
 * @param {Object<string, DataElement>} dataElements The dicom element.
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
  const refSegmentNumber = parseInt(segmentIdSq[0]['0062000B'].value[0], 0);
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

/**
 * Check if two frame info objects are equal.
 *
 * @param {DicomSegmentFrameInfo} dsfi1 The first frame info.
 * @param {DicomSegmentFrameInfo} dsfi2 The second frame info.
 * @returns {boolean} True if both frame info are equal.
 */
export function isEqualSegmentFrameInfo(dsfi1, dsfi2) {
  // basics
  if (typeof dsfi1 === 'undefined' ||
    typeof dsfi2 === 'undefined' ||
    dsfi1 === null ||
    dsfi2 === null) {
    return false;
  }
  let isEqual =
    arrayEquals(dsfi1.dimIndex, dsfi2.dimIndex) &&
    arrayEquals(dsfi1.imagePosPat, dsfi2.imagePosPat) &&
    dsfi1.refSegmentNumber === dsfi2.refSegmentNumber;

  isEqual = isEqual &&
    dsfi1.derivationImages.length === dsfi2.derivationImages.length;
  for (let i = 0; i < dsfi1.derivationImages.length; ++i) {
    const derivationImage1 = dsfi1.derivationImages[i];
    const derivationImage2 = dsfi2.derivationImages[i];
    isEqual = isEqual &&
      derivationImage1.sourceImages.length ===
        derivationImage2.sourceImages.length;
    for (let j = 0; j < derivationImage1.length; ++j) {
      const sourceImage1 = derivationImage1.sourceImages[j];
      const sourceImage2 = derivationImage2.sourceImages[j];
      isEqual = isEqual &&
        sourceImage1.referencedSOPClassUID ===
          sourceImage2.referencedSOPClassUID &&
        sourceImage1.referencedSOPInstanceUID ===
          sourceImage2.referencedSOPInstanceUID;
    }
  }

  return isEqual;
}

/**
 * Get a dicom item from a frame information object.
 *
 * @param {object} frameInfo The frame information object.
 * @returns {Object<string, any>} The item as a list of (key, value) pairs.
 */
export function getDicomSegmentFrameInfoItem(frameInfo) {
  const item = {
    FrameContentSequence: {
      value: [
        {
          DimensionIndexValues: frameInfo.dimIndex
        }
      ]
    },
    PlanePositionSequence: {
      value: [
        {
          ImagePositionPatient: frameInfo.imagePosPat
        }
      ]
    },
    SegmentIdentificationSequence: {
      value: [
        {
          ReferencedSegmentNumber: frameInfo.refSegmentNumber
        }
      ]
    }
  };
  // optional DerivationImageSequence
  if (frameInfo.derivationImages !== undefined) {
    const sourceImgPurposeOfReferenceCode = {
      CodeMeaning: 'Source image for image processing operation',
      CodeValue: 121_322,
      CodingSchemeDesignator: 'DCM'
    };
    const segDerivationCode = {
      CodeMeaning: 'Segmentation',
      CodeValue: 113_076,
      CodingSchemeDesignator: 'DCM'
    };

    const derivationImageItems = [];
    for (const derivationImage of frameInfo.derivationImages) {
      const sourceImages = [];
      for (const sourceImage of derivationImage.sourceImages) {
        sourceImages.push({
          PurposeOfReferenceCodeSequence: {
            value: [sourceImgPurposeOfReferenceCode]
          },
          ReferencedSOPClassUID: sourceImage.referencedSOPClassUID,
          ReferencedSOPInstanceUID: sourceImage.referencedSOPInstanceUID
        });
      }

      derivationImageItems.push({
        DerivationCodeSequence: {
          value: [segDerivationCode]
        },
        SourceImageSequence: {
          value: sourceImages
        }
      });
    }

    item.DerivationImageSequence = {
      value: derivationImageItems
    };
  }

  return item;
}
