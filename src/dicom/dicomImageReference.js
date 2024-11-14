import {
  getSopInstanceReference,
  getDicomSopInstanceReferenceItem
} from './dicomSopInstanceReference';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  ReferencedFrameNumber: '00081160',
  ReferencedSOPSequence: '00081199',
  ReferencedSegmentNumber: '0062000B'
};

/**
 * DICOM image reference: item of a SR content sequence.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.18.4.html#table_C.18.4-1}.
 */
export class ImageReference {
  /**
   * @type {object}
   */
  referencedSOPSequence;

  /**
   * @type {object}
   */
  referencedFrameNumber;

  /**
   * @type {string}
   */
  referencedSegmentNumber;

  /**
   * @type {string}
   */
  fiducialUID;

  /**
   * Get a string representation of this object.
   *
   * @returns {string} The object as string.
   */
  toString() {
    return this.referencedSOPSequence.toString();
  };
};

/**
 * Get a reference object from a dicom element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {ImageReference} A reference object.
 */
export function getImageReference(dataElements) {
  const ref = new ImageReference();

  if (typeof dataElements[TagKeys.ReferencedFrameNumber] !== 'undefined') {
    ref.referencedFrameNumber =
      dataElements[TagKeys.ReferencedFrameNumber].value[0];
  }
  if (typeof dataElements[TagKeys.ReferencedSOPSequence] !== 'undefined') {
    ref.referencedSOPSequence = getSopInstanceReference(
      dataElements[TagKeys.ReferencedSOPSequence].value[0]);
  }
  if (typeof dataElements[TagKeys.ReferencedSegmentNumber] !== 'undefined') {
    ref.referencedSegmentNumber =
      dataElements[TagKeys.ReferencedSegmentNumber].value[0];
  }

  return ref;
};

/**
 * Get a simple dicom element item from a reference object.
 *
 * @param {ImageReference} ref The reference object.
 * @returns {Object<string, any>} The item as a list of (key, value) pairs.
 */
export function getDicomImageReferenceItem(ref) {
  // dicom item (tags are in group/element order)
  const item = {};

  if (typeof ref.referencedFrameNumber !== 'undefined') {
    item.ReferencedFrameNumber = ref.referencedFrameNumber;
  }
  if (typeof ref.referencedSOPSequence !== 'undefined') {
    item.ReferencedSOPSequence = {
      value: [getDicomSopInstanceReferenceItem(ref.referencedSOPSequence)]
    };
  }
  if (typeof ref.referencedSegmentNumber !== 'undefined') {
    item.ReferencedSegmentNumber =
      ref.referencedSegmentNumber;
  }

  // return
  return item;
}
