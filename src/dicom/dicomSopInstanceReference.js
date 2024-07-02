// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  ReferencedSOPClassUID: '00081150',
  ReferencedSOPInstanceUID: '00081155'
};

/**
 * DICOM sop instance reference.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_10.8.html#table_10-11}.
 */
export class SopInstanceReference {
  /**
   * @type {string}
   */
  referencedSOPClassUID;

  /**
   * @type {string}
   */
  referencedSOPInstanceUID;

  /**
   * Get a string representation of this object.
   *
   * @returns {string} The object as string.
   */
  toString() {
    return this.referencedSOPInstanceUID + ' (class: ' +
      this.referencedSOPClassUID + ')';
  };
};

/**
 * Get a SOP reference object from a dicom element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {SopInstanceReference} A SOP reference object.
 */
export function getSopInstanceReference(dataElements) {
  const ref = new SopInstanceReference();

  if (typeof dataElements[TagKeys.ReferencedSOPClassUID] !== 'undefined') {
    ref.referencedSOPClassUID =
      dataElements[TagKeys.ReferencedSOPClassUID].value[0];
  }
  if (typeof dataElements[TagKeys.ReferencedSOPInstanceUID] !== 'undefined') {
    ref.referencedSOPInstanceUID =
      dataElements[TagKeys.ReferencedSOPInstanceUID].value[0];
  }

  return ref;
};

/**
 * Get a simple dicom element item from a SOP reference object.
 *
 * @param {SopInstanceReference} ref The SOP reference object.
 * @returns {Object<string, any>} The item as a list of (key, value) pairs.
 */
export function getDicomSopInstanceReferenceItem(ref) {
  // dicom item (tags are in group/element order)
  const item = {};

  if (typeof ref.referencedSOPClassUID !== 'undefined') {
    item.ReferencedSOPClassUID = ref.referencedSOPClassUID;
  }
  if (typeof ref.referencedSOPInstanceUID !== 'undefined') {
    item.ReferencedSOPInstanceUID = ref.referencedSOPInstanceUID;
  }

  // return
  return item;
}
