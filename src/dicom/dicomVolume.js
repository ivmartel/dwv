import {custom} from '../app/custom.js';
import {
  safeGet,
  safeGetAll
} from '../dicom/dataElement.js';
import {
  NormalisedManufacturers,
  getNormalisedManufacturer
} from './dicomManufacturer.js';
import {cleanString} from './dicomParser.js';
import {getConstantPerFrameValue} from './dicomFunctionalGroup.js';
import {logger} from '../utils/logger.js';

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
  MRDiffusionSequence: '00189117',
  DiffusionBValue: '00189087',
  DiffusionBValueAT: '(0018,9087)',
  FrameContentSequence: '00209111',
  DimensionIndexValues: '00209157',
  TemporalPositionIdentifier: '00200100',
  TemporalPositionIndex: '00209128',
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
    manufacturer: NormalisedManufacturers.HITACHI,
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
    res = getConstantPerFrameValue(
      elements, getDiffusionBValueFromFunctionalSeq, 'DiffusionBValue');
  }
  return res;
}

/**
 * Get the first value of a private tag. Private tags read from
 * implicit VR data are not in the dictionary and are parsed as 'UN',
 * their value is then the raw bytes: decode them as an ASCII string.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @param {string} key The tag key.
 * @returns {string|undefined} The value, if present.
 */
function getPrivateTagValue(elements, key) {
  const element = elements[key];
  if (typeof element !== 'undefined' &&
    element.vr === 'UN' &&
    typeof element.value !== 'undefined') {
    const str = cleanString(String.fromCharCode(...element.value));
    // first of multiple values
    return str.length !== 0 ? str.split('\\')[0] : undefined;
  }
  return safeGet(elements, key);
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
  const manufacturer = getNormalisedManufacturer(elements);
  const sopInstanceUID = safeGet(elements, TagKeys.SOPInstanceUID);

  let rules;
  if (typeof custom.privateBValueRules !== 'undefined') {
    rules = custom.privateBValueRules;
  } else {
    rules = LocalBValueRules;
  }

  for (const rule of rules) {
    let value;
    if (typeof rule.uidPrefix !== 'undefined' &&
      typeof sopInstanceUID !== 'undefined' &&
      sopInstanceUID.startsWith(rule.uidPrefix)) {
      value = getPrivateTagValue(elements, rule.key);
    } else if (typeof rule.manufacturer !== 'undefined' &&
      typeof manufacturer !== 'undefined' &&
      rule.manufacturer === manufacturer) {
      value = getPrivateTagValue(elements, rule.key);
    }
    // keep first valid result
    if (typeof value !== 'undefined' &&
      !isNaN(parseFloat(value))) {
      res = value;
      break;
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
 * Hard coded logic based on real cases...
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
    /**
     * Get the b-value dimension index value of a frame.
     *
     * @param {Record<string, DataElement>} group The per frame
     *   functional group.
     * @returns {string|undefined} The value, if present.
     */
    const valueGetter = function (group) {
      let value;
      const frameContentSeq = safeGetAll(group, TagKeys.FrameContentSequence);
      if (typeof frameContentSeq !== 'undefined') {
        // should be only one
        const dimValues =
          safeGetAll(frameContentSeq[0], TagKeys.DimensionIndexValues);
        if (typeof dimValues !== 'undefined' &&
          dimValues.length === 4) {
          // does not follow order set in DimensionIndexSequence...
          value = dimValues[2];
        }
      }
      return value;
    };
    res = getConstantPerFrameValue(
      elements, valueGetter, 'DimensionIndexValues b-value');
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
 * Parse a tag value to a number.
 *
 * @param {any} value The value to parse.
 * @param {Function} parse The string to number parser to use.
 * @returns {number|undefined} The number, or undefined if the value
 *   is absent or not a number.
 */
function parseNumber(value, parse) {
  let res;
  if (typeof value !== 'undefined') {
    const number = parse(value);
    if (!isNaN(number)) {
      res = number;
    }
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
        logger.debug('Got b-value for enhanced MR from non standard tag');
      }
    }
  } else if (sopClassUID === SOPClassUIDs.MR) {
    // non standard for MR
    res = getNonStandardDiffusionBValueFromMR(elements);
    // if not found, check standard EMR tag
    if (typeof res === 'undefined') {
      res = getStandardDiffusionBValueFromEMR(elements);
    }
  }

  // cast to number (FD/DS b-values can be fractional)
  return parseNumber(res, parseFloat);
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
 * Get the tag time value for enhanced multi-frame images.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {number|undefined} The value, if present.
 */
function getTemporalPositionIndex(elements) {
  /**
   * Get the temporal position index of a frame.
   *
   * @param {Record<string, DataElement>} group The per frame
   *   functional group.
   * @returns {number|undefined} The value, if present.
   */
  const valueGetter = function (group) {
    let res;
    const frameContentSeq = safeGetAll(group, TagKeys.FrameContentSequence);
    if (typeof frameContentSeq !== 'undefined') {
      res = parseNumber(
        safeGet(frameContentSeq[0], TagKeys.TemporalPositionIndex),
        value => parseInt(value, 10));
    }
    return res;
  };
  return getConstantPerFrameValue(
    elements, valueGetter, 'TemporalPositionIndex');
}

/**
 * Create a getter that reads a numeric value from a single tag.
 *
 * @param {string} key The tag key.
 * @param {Function} parse The string to number parser to use.
 * @returns {Function} The getter, returns undefined if the tag is absent
 *   or not a number.
 */
function makeNumericTagGetter(key, parse) {
  return function (elements) {
    return parseNumber(safeGet(elements, key), parse);
  };
}

/**
 * Get the TemporalPositionIdentifier tag value.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {number|undefined} The value, if present.
 */
const getTemporalPositionIdentifier = makeNumericTagGetter(
  TagKeys.TemporalPositionIdentifier, value => parseInt(value, 10));

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
    // classic multi-frame temporal position
    res = getTemporalPositionIdentifier(elements);
    // enhanced multi-frame temporal position
    if (typeof res === 'undefined') {
      res = getTemporalPositionIndex(elements);
    }
    // MR (and enhanced MR) volume id
    if (typeof res === 'undefined') {
      const volumeId = getMRVolumeIdTagValue(elements);
      if (typeof volumeId !== 'undefined') {
        res = volumeId;
      }
    }
  }

  return res;
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
    getter: getTemporalPositionIdentifier
  },
  {
    name: 'TemporalPositionIndex',
    getter: getTemporalPositionIndex
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
