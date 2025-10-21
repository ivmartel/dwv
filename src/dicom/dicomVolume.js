import {custom} from '../app/custom.js';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement.js';
/* eslint-enable no-unused-vars */

/**
 * Get the volume id from a list of tags. Defaults
 *   returns undefined.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {number|undefined} The id value if available.
 */
export function getVolumeIdTagValue(elements) {
  if (typeof custom.getVolumeIdTagValue !== 'undefined') {
    return custom.getVolumeIdTagValue(elements);
  } else {
    return;
  }
}

/**
 * Get the volume id from a list of tags parsed after the load finishes.
 * Defaults returns undefined.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {number|undefined} The id value if available.
 */
export function getPostLoadVolumeIdTagValue(elements) {
  if (typeof custom.getPostLoadVolumeIdTagValue !== 'undefined') {
    return custom.getPostLoadVolumeIdTagValue(elements);
  } else {
    return;
  }
}
