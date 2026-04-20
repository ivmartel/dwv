import {safeGet} from '../dicom/dataElement.js';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement.js';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  Manufacturer: '00080070',
};

/**
 * Normalised manufacturer names.
 */
export const NormalisedManufacturers = {
  GE: 'ge',
  SIEMENS: 'siemens',
  PHILIPS: 'philips',
  HITASHI: 'hitashi'
};

/**
 * Get the manufacturer.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {string|undefined} The manufacturer.
 */
export function getManufacturer(elements) {
  return safeGet(elements, TagKeys.Manufacturer);
}

/**
 * Get the normalised manufacturer.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {string|undefined} The manufacturer as a unique
 *   all lower case string.
 */
export function getNormalisedManufacturer(elements) {
  let res;
  const manufacturer = getManufacturer(elements);
  if (typeof manufacturer !== 'undefined') {
    if (manufacturer.toUpperCase().startsWith('SIEMENS')) {
      // 'SIEMENS', 'Siemens Healthineers'
      res = NormalisedManufacturers.SIEMENS;
    } else if (manufacturer.startsWith('GE')) {
      // 'GE MEDICAL SYSTEMS'
      res = NormalisedManufacturers.GE;
    } else if (manufacturer.startsWith('Philips')) {
      // 'Philips Healthcare', 'Philips Medical Systems'
      res = NormalisedManufacturers.PHILIPS;
    } else {
      res = manufacturer.toLowerCase();
    }
  }
  return res;
}
