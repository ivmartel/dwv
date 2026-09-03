import {getSpacingFromMeasure} from './dicomImage.js';
import {logger} from '../utils/logger.js';
import {arrayEquals} from '../utils/array.js';
import {
  getDicomCodeItem,
  DcmCodes,
  getDcmDicomCode
} from './dicomCode.js';
import {
  safeGetAll
} from './dataElement.js';

/**
 * @import {DataElement} from './dataElement.js';
 * @import {Spacing} from '../image/spacing.js';
 * @import {SimpleTagValues} from './simpleTagValues.js';
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  DerivationImageSequence: '00089124',
  SourceImageSequence: '00082112',
  ReferencedSOPClassUID: '00081150',
  ReferencedSOPInstanceUID: '00081155',
  FrameContentSequence: '00209111',
  DimensionIndexValue: '00209157',
  DimensionOrganizationSequence: '00209221',
  DimensionOrganizationUID: '00209164',
  DimensionIndexSequence: '00209222',
  DimensionIndexPointer: '00209165',
  DimensionDescriptionLabel: '00209421',
  SegmentIdentificationSequence: '0062000A',
  ReferencedSegmentNumber: '0062000B',
  PlanePositionSequence: '00209113',
  ImagePosition: '00200032',
  PlaneOrientationSequence: '00209116',
  ImageOrientation: '00200037',
  PixelMeasuresSequence: '00289110',
  PerFrameFunctionalGroupsSequence: '52009230'
};

/**
 * Check the dimension organization from a dicom element.
 *
 * @param {Record<string, DataElement>} dataElements The root dicom element.
 * @returns {object} The dimension organizations and indices.
 */
export function getDimensionOrganization(dataElements) {
  // Dimension Organization Sequence (required)
  const orgSq = dataElements[TagKeys.DimensionOrganizationSequence];
  if (typeof orgSq === 'undefined' || orgSq.value.length !== 1) {
    throw new Error('Unsupported dimension organization sequence length');
  }
  // Dimension Organization UID
  const orgUID = orgSq.value[0][TagKeys.DimensionOrganizationUID].value[0];

  // Dimension Index Sequence (conditionally required)
  const indices = [];
  const indexSqElem = dataElements[TagKeys.DimensionIndexSequence];
  if (typeof indexSqElem !== 'undefined') {
    const indexSq = indexSqElem.value;
    // expecting 2D index
    if (indexSq.length !== 2) {
      throw new Error('Unsupported dimension index sequence length');
    }
    let indexPointer;
    for (let i = 0; i < indexSq.length; ++i) {
      // Dimension Organization UID (required)
      const indexOrg = indexSq[i][TagKeys.DimensionOrganizationUID].value[0];
      if (indexOrg !== orgUID) {
        throw new Error(
          'Dimension Index Sequence contains a unknown Dimension Organization');
      }
      // Dimension Index Pointer (required)
      indexPointer = indexSq[i][TagKeys.DimensionIndexPointer].value[0];

      const index = {
        DimensionOrganizationUID: indexOrg,
        DimensionIndexPointer: indexPointer
      };
      // Dimension Description Label (optional)
      const descriptionLabelEl =
        indexSq[i][TagKeys.DimensionDescriptionLabel];
      if (typeof descriptionLabelEl !== 'undefined') {
        index.DimensionDescriptionLabel = descriptionLabelEl.value[0];
      }
      // store
      indices.push(index);
    }
    // expecting Image Position at last position
    if (indexPointer !== '(0020,0032)') {
      throw new Error('Unsupported non image position as last index');
    }
  }

  return {
    organizations: {
      value: [
        {
          DimensionOrganizationUID: orgUID
        }
      ]
    },
    indices: {
      value: indices
    }
  };
}

/**
 * DICOM functional group: item of a
 *  SharedFunctionalGroupsSequence (5200,9229) or
 *  PerframeFunctionalGroupsSequence (5200,9230).
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.7.6.16.html}.
 */
export class DicomFunctionalGroup {
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
 * Get a functional group object from a dicom element.
 *
 * @param {Record<string, DataElement>} dataElements The dicom element.
 * @returns {DicomFunctionalGroup|undefined} A functional group object.
 */
export function getFunctionalGroup(dataElements) {
  // Derivation Image Sequence
  const derivationImages = [];
  if (typeof dataElements[TagKeys.DerivationImageSequence] !== 'undefined') {
    const derivationImageSq =
      dataElements[TagKeys.DerivationImageSequence].value;
    // Source Image Sequence
    for (let i = 0; i < derivationImageSq.length; ++i) {
      const sourceImages = [];
      if (typeof derivationImageSq[i][TagKeys.SourceImageSequence] !==
        'undefined') {
        const sourceImageSq =
          derivationImageSq[i][TagKeys.SourceImageSequence].value;
        for (let j = 0; j < sourceImageSq.length; ++j) {
          const sourceImage = {};
          // Referenced SOP Class UID
          if (typeof sourceImageSq[j][TagKeys.ReferencedSOPClassUID] !==
            'undefined') {
            sourceImage.referencedSOPClassUID =
              sourceImageSq[j][TagKeys.ReferencedSOPClassUID].value[0];
          }
          // Referenced SOP Instance UID
          if (typeof sourceImageSq[j][TagKeys.ReferencedSOPInstanceUID] !==
            'undefined') {
            sourceImage.referencedSOPInstanceUID =
              sourceImageSq[j][TagKeys.ReferencedSOPInstanceUID].value[0];
          }
          sourceImages.push(sourceImage);
        }
      }
      derivationImages.push({
        sourceImages
      });
    }
  }
  // Frame Content Sequence (required, only one)
  if (typeof dataElements[TagKeys.FrameContentSequence] === 'undefined') {
    logger.info('Missing frame content sequence');
    return;
  }
  const frameContentSq = dataElements[TagKeys.FrameContentSequence].value;
  if (frameContentSq.length === 0) {
    logger.info('Empty frame content sequence');
    return;
  }
  // Dimension Index Value
  const dimIndex = frameContentSq[0][TagKeys.DimensionIndexValue].value;
  // Referenced Segment Number (can be undefined for non SEG)
  let refSegmentNumber;
  // Segment Identification Sequence (required for SEG, only one)
  const segmentIdSq = dataElements[TagKeys.SegmentIdentificationSequence];
  if (typeof segmentIdSq !== 'undefined') {
    const item0 = segmentIdSq.value[0];
    refSegmentNumber =
      parseInt(item0[TagKeys.ReferencedSegmentNumber].value[0], 10);
  }
  // Plane Position Sequence (required, only one)
  if (typeof dataElements[TagKeys.PlanePositionSequence] === 'undefined') {
    logger.info('Missing plane position sequence');
    return;
  }
  const planePosSq = dataElements[TagKeys.PlanePositionSequence].value;
  if (planePosSq.length === 0) {
    logger.info('Empty plane position sequence');
    return;
  }
  // Image Position (Patient) (conditionally required)
  const imagePosPat = planePosSq[0][TagKeys.ImagePosition].value;
  for (let p = 0; p < imagePosPat.length; ++p) {
    imagePosPat[p] = parseFloat(imagePosPat[p]);
  }
  const funcGroup = new DicomFunctionalGroup(
    dimIndex,
    imagePosPat,
    derivationImages,
    refSegmentNumber
  );
  // Plane Orientation Sequence
  if (typeof dataElements[TagKeys.PlaneOrientationSequence] !== 'undefined') {
    const framePlaneOrientationSeq =
      dataElements[TagKeys.PlaneOrientationSequence];
    if (framePlaneOrientationSeq.value.length !== 0) {
      // should only be one Image Orientation (Patient)
      const frameImageOrientation =
        framePlaneOrientationSeq.value[0][TagKeys.ImageOrientation].value;
      if (typeof frameImageOrientation !== 'undefined') {
        funcGroup.imageOrientationPatient = frameImageOrientation;
      }
    }
  }
  // Pixel Measures Sequence
  if (typeof dataElements[TagKeys.PixelMeasuresSequence] !== 'undefined') {
    const framePixelMeasuresSeq = dataElements[TagKeys.PixelMeasuresSequence];
    if (framePixelMeasuresSeq.value.length !== 0) {
      // should only be one
      const frameSpacing =
        getSpacingFromMeasure(framePixelMeasuresSeq.value[0]);
      if (typeof frameSpacing !== 'undefined') {
        funcGroup.spacing = frameSpacing;
      }
    } else {
      logger.warn(
        'No shared functional group pixel measure sequence items.');
    }
  }

  return funcGroup;
}

/**
 * Get the list of per frame DicomFunctionalGroup from the root list
 * of data elements.
 *
 * @param {Record<string, DataElement>} dataElements The root dicom element.
 * @param {number} [numberOfFrames] Optional number of frames to compare
 *   with per frame sequence size.
 * @returns {DicomFunctionalGroup[]|undefined} The list of frame
 *   information object.
 */
export function getPerFrameFunctionalGroups(dataElements, numberOfFrames) {
  // Per-frame Functional Groups Sequence
  const perFrameFuncGroupSequence =
    safeGetAll(dataElements, TagKeys.PerFrameFunctionalGroupsSequence);

  let funcGroups;
  if (typeof perFrameFuncGroupSequence !== 'undefined') {
    // check size
    if (typeof numberOfFrames !== 'undefined' &&
      numberOfFrames !== perFrameFuncGroupSequence.length) {
      throw new Error(
        'perFrameFuncGroupSequence meta and numberOfFrames are not equal.');
    }
    // create frame info object from per frame func
    funcGroups = [];
    for (const item of perFrameFuncGroupSequence) {
      funcGroups.push(getFunctionalGroup(item));
    }
  }

  return funcGroups;
}

/**
 * Check if two functional group objects are equal.
 *
 * @param {DicomFunctionalGroup} group1 The first frame info.
 * @param {DicomFunctionalGroup} group2 The second frame info.
 * @returns {boolean} True if both groups are equal.
 */
export function isEqualFunctionalGroup(group1, group2) {
  // basics
  if (typeof group1 === 'undefined' ||
    typeof group2 === 'undefined' ||
    group1 === null ||
    group2 === null) {
    return false;
  }
  let isEqual =
    arrayEquals(group1.dimIndex, group2.dimIndex) &&
    arrayEquals(group1.imagePosPat, group2.imagePosPat) &&
    group1.refSegmentNumber === group2.refSegmentNumber;

  isEqual = isEqual &&
    group1.derivationImages.length === group2.derivationImages.length;
  for (let i = 0; i < group1.derivationImages.length; ++i) {
    const derivationImage1 = group1.derivationImages[i];
    const derivationImage2 = group2.derivationImages[i];
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
 * Get a dicom item from a functional group object.
 *
 * @param {DicomFunctionalGroup} funcGroup The functional group object.
 * @returns {SimpleTagValues} The item as a list of (key, value) pairs.
 */
export function getDicomFunctionalGroupItem(funcGroup) {
  const item = {
    FrameContentSequence: {
      value: [
        {
          DimensionIndexValues: funcGroup.dimIndex
        }
      ]
    },
    PlanePositionSequence: {
      value: [
        {
          ImagePositionPatient: funcGroup.imagePosPat
        }
      ]
    },
    SegmentIdentificationSequence: {
      value: [
        {
          ReferencedSegmentNumber: funcGroup.refSegmentNumber
        }
      ]
    }
  };
  // optional DerivationImageSequence
  if (funcGroup.derivationImages !== undefined) {
    const sourceImgPurposeOfReferenceCode =
      getDicomCodeItem(
        getDcmDicomCode(DcmCodes.SourceImageForImageProcessingOperation)
      );
    const segDerivationCode =
      getDicomCodeItem(getDcmDicomCode(DcmCodes.Segmentation));

    const derivationImageItems = [];
    for (const derivationImage of funcGroup.derivationImages) {
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
