import {custom} from '../app/custom.js';
import {
  safeGet,
  safeGetAll
} from '../dicom/dataElement.js';
import {
  NormalisedManufacturers,
  getNormalisedManufacturer
} from './dicomManufacturer.js';

/**
 * @import {DataElement} from '../dicom/dataElement.js';
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  SOPClassUID: '00080016',
  SOPInstanceUID: '00080018',
  Manufacturer: '00080070',
  AcquisitionTime: '00080032',
  DimensionIndexSequence: '00209222',
  DimensionIndexPointer: '00209165',
  SharedFunctionalGroupsSequence: '52009229',
  PerFrameFunctionalGroupsSequence: '52009230',
  MRDiffusionSequence: '00189117',
  DiffusionBValue: '00189087',
  DiffusionBValueAT: '(0018,9087)',
  FrameContentSequence: '00209111',
  DimensionIndexValues: '00209157',
  TemporalPositionIdentifier: '00200100',
  EchoTime: '00180081',
  TriggerTime: '00181060',
  InversionTime: '00180082'
};

/**
 * Private b-value tag rules. Tested in order.
 * Rules are either `{manufacturer, key}` or `{uidPrefix, key}`.
 *
 * @type {object[]}
 */
const LocalBValueRules = [
  {
    manufacturer: NormalisedManufacturers.SIEMENS,
    key: '0019100C'
  },
  {
    manufacturer: NormalisedManufacturers.GE,
    key: '00431039'
  },
  {
    manufacturer: NormalisedManufacturers.HITASHI,
    key: '00291030'
  }
];

/**
 * Related SOP class UIDs.
 */
const SOPClassUIDs = {
  MR: '1.2.840.10008.5.1.4.1.1.4',
  EnhancedMR: '1.2.840.10008.5.1.4.1.1.4.1',
  MRSpectroscopy: '1.2.840.10008.5.1.4.1.1.4.2',
  EnhancedMRColorImage: '1.2.840.10008.5.1.4.1.1.4.3'
};

/**
 * Get the diffusion b-value from a functional DICOM sequence.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {string|undefined} The value, if present.
 */
function getDiffusionBValueFromFunctionalSeq(elements) {
  let res;
  const diffSeq = safeGetAll(elements, TagKeys.MRDiffusionSequence);
  if (typeof diffSeq !== 'undefined') {
    // should only contain one item
    res = safeGet(diffSeq[0], TagKeys.DiffusionBValue);
  }
  return res;
}

/**
 * Get the diffusion b-value from standard DICOM tag.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {string|undefined} The value, if present.
 */
function getStandardDiffusionBValueFromEMR(elements) {
  let res;
  // from Shared Functional Groups Sequence
  const sharedGroupSeq =
    safeGetAll(elements, TagKeys.SharedFunctionalGroupsSequence);
  if (typeof sharedGroupSeq !== 'undefined') {
    // should only contain one item
    res = getDiffusionBValueFromFunctionalSeq(sharedGroupSeq[0]);
  }
  // from Per Frame Functional Groups Sequence
  if (typeof res === 'undefined') {
    const perFrameGroupSeq =
      safeGetAll(elements, TagKeys.PerFrameFunctionalGroupsSequence);
    if (typeof perFrameGroupSeq !== 'undefined') {
      // TODO: go to specific frame number?
      for (const group of perFrameGroupSeq) {
        res = getDiffusionBValueFromFunctionalSeq(group);
        if (typeof res !== 'undefined') {
          break;
        }
      }
    }
  }
  return res;
}

/**
 * Get the diffusion b-value from MR from non standard
 *   and/or private DICOM tags.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {string|undefined} The value, if present.
 */
function getNonStandardDiffusionBValueFromMR(elements) {
  let res;

  // manufacturers private tag
  if (typeof res === 'undefined') {
    const manufacturer = getNormalisedManufacturer(elements);
    const sopInstanceUID = safeGet(elements, TagKeys.SOPInstanceUID);

    let rules;
    if (typeof custom.privateBValueRules !== 'undefined') {
      rules = custom.privateBValueRules;
    } else {
      rules = LocalBValueRules;
    }

    for (const rule of rules) {
      if (typeof rule.uidPrefix !== 'undefined' &&
        typeof sopInstanceUID !== 'undefined' &&
        sopInstanceUID.startsWith(rule.uidPrefix)) {
        res = safeGet(elements, rule.key);
      } else if (typeof rule.manufacturer !== 'undefined' &&
        typeof manufacturer !== 'undefined' &&
        rule.manufacturer === manufacturer) {
        res = safeGet(elements, rule.key);
      }
      // break at first valid result
      if (typeof res !== 'undefined' &&
        !isNaN(parseInt(res, 10))) {
        // TODO just break or exit function?
        break;
      }
    }
  }

  // b-value at root level
  if (typeof res === 'undefined') {
    res = safeGet(elements, TagKeys.DiffusionBValue);
  }

  return res;
}

/**
 * Get the b-value from the frame content sequence if
 * the dimension index sequence has a pointer to the b-value.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {string|undefined} The value, if present.
 */
function getDiffusionBValueFromFrameContent(elements) {
  let res;

  // check if the dim pointer is for b-value
  let gotBValuePointer = false;
  const indexSeq = safeGetAll(elements, TagKeys.DimensionIndexSequence);
  if (typeof indexSeq !== 'undefined') {
    for (const dimIndex of indexSeq) {
      const pointer = safeGet(dimIndex, TagKeys.DimensionIndexPointer);
      if (typeof pointer !== 'undefined' &&
        pointer === TagKeys.DiffusionBValueAT
      ) {
        gotBValuePointer = true;
        break;
      }
    }
  }
  // get from per frame functional group
  if (gotBValuePointer) {
    const perFrameGroupSeq =
      safeGetAll(elements, TagKeys.PerFrameFunctionalGroupsSequence);
    if (typeof perFrameGroupSeq !== 'undefined') {
      const group = perFrameGroupSeq[0];
      const frameContentSeq = safeGetAll(group, TagKeys.FrameContentSequence);
      if (typeof frameContentSeq !== 'undefined') {
        // should be only one
        const dimValues =
          safeGetAll(frameContentSeq[0], TagKeys.DimensionIndexValues);
        if (typeof dimValues !== 'undefined') {
          // does not follow order set in DimensionIndexSequence...
          res = dimValues[2];
        }
      }
    }
  }

  return res;
}

/**
 * Get the diffusion b-value from Enhanced MR from non standard
 *   and/or private DICOM tags.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {string|undefined} The value, if present.
 */
function getNonStandardDiffusionBValueFromEMR(elements) {
  let res;

  // manufacturer
  const manufacturer = getNormalisedManufacturer(elements);

  // philips can use frame content
  if (typeof manufacturer !== 'undefined' &&
    manufacturer === NormalisedManufacturers.PHILIPS) {
    res = getDiffusionBValueFromFrameContent(elements);
  }

  return res;
}

/**
 * Get the diffusion b-value.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {number|undefined} The value, if present.
 */
function getDiffusionBValue(elements) {
  let res;
  // SOP class UID
  const sopClassUID = safeGet(elements, TagKeys.SOPClassUID);

  if (sopClassUID === SOPClassUIDs.EnhancedMR ||
    sopClassUID === SOPClassUIDs.MRSpectroscopy ||
    sopClassUID === SOPClassUIDs.EnhancedMRColorImage
  ) {
    // standard tag
    res = getStandardDiffusionBValueFromEMR(elements);
    // if not found, check non standard tag
    if (typeof res === 'undefined') {
      res = getNonStandardDiffusionBValueFromEMR(elements);
      if (typeof res !== 'undefined') {
        console.log('got b-value for enhanced MR from non standard tag');
      }
    }
  } else if (sopClassUID === SOPClassUIDs.MR) {
    // non standard for MR
    res = getNonStandardDiffusionBValueFromMR(elements);
    // if not found, check standard EMR tag
    if (typeof res === 'undefined') {
      if (typeof res === 'undefined') {
        res = getStandardDiffusionBValueFromEMR(elements);
      }
    }
  }

  // cast to int
  if (typeof res !== 'undefined') {
    res = parseInt(res, 10);
  }

  return res;
}

/**
 * Get the tag time value for MR images.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {number|undefined} The value, if present.
 */
function getMRVolumeIdTagValue(elements) {
  let res;

  // filter by SOP class UID
  const sopClassUID = safeGet(elements, TagKeys.SOPClassUID);
  if (sopClassUID === SOPClassUIDs.MR ||
    sopClassUID === SOPClassUIDs.EnhancedMR ||
    sopClassUID === SOPClassUIDs.MRSpectroscopy ||
    sopClassUID === SOPClassUIDs.EnhancedMRColorImage
  ) {
    // diffusion b-value
    const bvalue = getDiffusionBValue(elements);
    if (typeof bvalue !== 'undefined') {
      res = bvalue;
    }
  }

  return res;
}

/**
 * Get the volume id from a list of tags. Default
 * returns MR diffusion b-value.
 *
 * @param {Record<string, DataElement>} elements The DICOM elements.
 * @returns {number|undefined} The id value if available.
 */
export function getVolumeIdTagValue(elements) {
  let res;

  if (typeof custom.getVolumeIdTagValue !== 'undefined') {
    res = custom.getVolumeIdTagValue(elements);
  } else {
    // MR (and enhanced MR) volume id
    const volumeId = getMRVolumeIdTagValue(elements);
    if (typeof volumeId !== 'undefined') {
      res = volumeId;
    }
  }

  return res;
}

/**
 * Create a getter that reads a numeric value from a single tag.
 *
 * @param {string} key The tag key.
 * @param {Function} parse The string to number parser to use.
 * @returns {Function} The getter, returns undefined if the tag is absent.
 */
function makeNumericTagGetter(key, parse) {
  return function (elements) {
    let res;
    const value = safeGet(elements, key);
    if (typeof value !== 'undefined') {
      res = parse(value);
    }
    return res;
  };
}

/**
 * Ordered list of candidate post load volume id getters. Since the tag
 * that actually discriminates volumes is not known until the full data
 * is loaded, `DicomSliceDataList` tries these in order and keeps the
 * first one that produces a valid, consistent per-volume grouping.
 * Most explicit/reliable discriminators come first, AcquisitionTime
 * (the historical default) comes last.
 *
 * @type {{name: string, getter: Function}[]}
 */
export const postLoadVolumeIdCandidates = [
  {
    name: 'TemporalPositionIdentifier',
    getter: makeNumericTagGetter(
      TagKeys.TemporalPositionIdentifier, value => parseInt(value, 10))
  },
  {
    name: 'DiffusionBValue',
    getter: getMRVolumeIdTagValue
  },
  {
    name: 'EchoTime',
    getter: makeNumericTagGetter(TagKeys.EchoTime, parseFloat)
  },
  {
    name: 'TriggerTime',
    getter: makeNumericTagGetter(TagKeys.TriggerTime, parseFloat)
  },
  {
    name: 'InversionTime',
    getter: makeNumericTagGetter(TagKeys.InversionTime, parseFloat)
  },
  {
    name: 'AcquisitionTime',
    getter: makeNumericTagGetter(TagKeys.AcquisitionTime, parseFloat)
  }
];
