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
import {getDateObj, getTimeInSeconds} from './dicomDate.js';
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
  AcquisitionDate: '00080022',
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
  EnhancedMRColorImage: '1.2.840.10008.5.1.4.1.1.4.3',
  LegacyConvertedEnhancedMRImageStorage: '1.2.840.10008.5.1.4.1.1.4.4'
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
 * Check if the dimension index sequence has a pointer to the b-value.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {boolean} True if a b-value pointer is present.
 */
function hasBValueDimensionPointer(elements) {
  const indexSeq = safeGetAll(elements, TagKeys.DimensionIndexSequence);
  return typeof indexSeq !== 'undefined' &&
    indexSeq.some(dimIndex =>
      safeGet(dimIndex, TagKeys.DimensionIndexPointer) ===
      TagKeys.DiffusionBValueAT);
}

/**
 * Get the b-value dimension index value of a frame.
 * Hard coded logic based on real cases...
 *
 * @param {Record<string, DataElement>} group The per frame
 *   functional group.
 * @returns {number|undefined} The value, if present.
 */
function getPhilipsFrameBValueIndex(group) {
  let res;
  const frameContentSeq = safeGetAll(group, TagKeys.FrameContentSequence);
  if (typeof frameContentSeq !== 'undefined') {
    // should be only one
    const dimValues =
      safeGetAll(frameContentSeq[0], TagKeys.DimensionIndexValues);
    if (typeof dimValues !== 'undefined' &&
      dimValues.length === 4) {
      // does not follow order set in DimensionIndexSequence...
      res = parseNumber(dimValues[2], parseFloat);
    }
  }
  return res;
}

/**
 * Get the b-value from the frame content sequence if
 * the dimension index sequence has a pointer to the b-value.
 * Note: the value is a dimension index, not the b-value itself.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {number|undefined} The value, if present.
 */
function getPhilipsDiffusionBValueFromEMR(elements) {
  let res;
  if (hasBValueDimensionPointer(elements)) {
    res = getConstantPerFrameValue(
      elements, getPhilipsFrameBValueIndex, 'DimensionIndexValues b-value');
  }
  return res;
}

/**
 * Get the diffusion b-value from Enhanced MR from non standard
 *   and/or private DICOM tags.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {number|undefined} The value, if present.
 */
function getNonStandardDiffusionBValueFromEMR(elements) {
  let res;

  // philips can use frame content
  if (getNormalisedManufacturer(elements) ===
    NormalisedManufacturers.PHILIPS) {
    res = getPhilipsDiffusionBValueFromEMR(elements);
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
    sopClassUID === SOPClassUIDs.EnhancedMRColorImage ||
    sopClassUID === SOPClassUIDs.LegacyConvertedEnhancedMRImageStorage
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
 * Get the volume id for MR images (can be time, b-value...).
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
    sopClassUID === SOPClassUIDs.EnhancedMRColorImage ||
    sopClassUID === SOPClassUIDs.LegacyConvertedEnhancedMRImageStorage
  ) {
    // diffusion b-value
    res = getDiffusionBValue(elements);
  }

  return res;
}

/**
 * Get the temporal position index of a frame.
 *
 * @param {Record<string, DataElement>} group The per frame
 *   functional group.
 * @returns {number|undefined} The value, if present.
 */
function getFrameTemporalPositionIndex(group) {
  let res;
  const frameContentSeq = safeGetAll(group, TagKeys.FrameContentSequence);
  if (typeof frameContentSeq !== 'undefined') {
    // should be only one
    res = parseNumber(
      safeGet(frameContentSeq[0], TagKeys.TemporalPositionIndex),
      value => parseInt(value, 10));
  }
  return res;
}

/**
 * Get the temporal position index for enhanced multi-frame images.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {number|undefined} The value, if present.
 */
function getTemporalPositionIndex(elements) {
  return getConstantPerFrameValue(
    elements, getFrameTemporalPositionIndex, 'TemporalPositionIndex');
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
 * Get the volume id from a list of tags, used while loading (before
 * the full data is known): the first defined value of the volume id
 * candidates flagged with `preLoad` (see volumeIdCandidates).
 *
 * @param {Record<string, DataElement>} elements The DICOM elements.
 * @returns {number|undefined} The id value if available.
 */
export function getVolumeIdTagValue(elements) {
  if (typeof custom.getVolumeIdTagValue !== 'undefined') {
    return custom.getVolumeIdTagValue(elements);
  }
  for (const candidate of getVolumeIdCandidates()) {
    if (candidate.preLoad === true) {
      const value = candidate.getter(elements);
      if (typeof value !== 'undefined') {
        return value;
      }
    }
  }
  return undefined;
}

/**
 * Get the acquisition time as a number of seconds. If the acquisition
 * date is available, it is included so that acquisitions spanning
 * midnight are correctly ordered.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {number|undefined} The value, if present.
 */
function getAcquisitionTime(elements) {
  if (typeof safeGet(elements, TagKeys.AcquisitionTime) === 'undefined') {
    return undefined;
  }
  let res = getTimeInSeconds(elements[TagKeys.AcquisitionTime]);
  if (typeof res !== 'undefined' &&
    typeof safeGet(elements, TagKeys.AcquisitionDate) !== 'undefined') {
    const date = getDateObj(elements[TagKeys.AcquisitionDate]);
    const dateMs = Date.UTC(date.year, date.monthIndex, date.day);
    if (!isNaN(dateMs)) {
      res += dateMs / 1000;
    }
  }
  return res;
}

/**
 * Ordered list of candidate volume id getters. Since the tag that
 * actually discriminates volumes is not known until the full data
 * is loaded, `guessVolumeIndices` tries these in order and keeps the
 * first one that produces a valid, consistent per-volume grouping.
 * It is used for the files of a series (see `DicomSliceDataList`).
 * Most explicit/reliable discriminators come first, AcquisitionTime
 * (the historical default) comes last.
 * Candidates flagged with `preLoad` are also used while loading
 * (see `getVolumeIdTagValue`): they must not vary between the
 * slices of a single volume.
 *
 * @type {{name: string, getter: Function, preLoad?: boolean}[]}
 */
export const volumeIdCandidates = [
  {
    name: 'TemporalPositionIdentifier',
    getter: getTemporalPositionIdentifier,
    preLoad: true
  },
  {
    name: 'TemporalPositionIndex',
    getter: getTemporalPositionIndex,
    preLoad: true
  },
  {
    name: 'DiffusionBValue',
    getter: getMRVolumeIdTagValue,
    preLoad: true
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
    getter: getAcquisitionTime
  }
];

/**
 * Get the list of volume id candidates: the custom one if defined,
 * the default one otherwise.
 *
 * @returns {{name: string, getter: Function, preLoad?: boolean}[]}
 *   The candidates.
 */
function getVolumeIdCandidates() {
  return typeof custom.volumeIdCandidates !== 'undefined'
    ? custom.volumeIdCandidates
    : volumeIdCandidates;
}

/**
 * Get the volume index of each item (file) from its volume
 * id value. The grouping is valid if all items have a numeric value,
 * there are at least two distinct values and each (slice, volume)
 * pair is unique with a total of slices times volumes items: every
 * volume then contains every slice.
 *
 * @param {any[]} values The volume id value of each item.
 * @param {number[]} sliceIndices The slice index of each item.
 * @param {number} numberOfSlices The number of distinct slices.
 * @returns {number[]|undefined} The volume index of each item (volumes
 *   ordered by ascending value), undefined if the grouping is not valid.
 */
export function getVolumeIndices(values, sliceIndices, numberOfSlices) {
  if (values.length !== sliceIndices.length) {
    return undefined;
  }
  // distinct values
  const volValues = [];
  for (const value of values) {
    if (typeof value !== 'number' || isNaN(value)) {
      return undefined;
    }
    if (!volValues.includes(value)) {
      volValues.push(value);
    }
  }
  if (volValues.length < 2 ||
    volValues.length * numberOfSlices !== values.length) {
    return undefined;
  }
  // sort as numbers
  volValues.sort((a, b) => a - b);
  // volume index per item, check unique (slice, volume) pairs
  const res = [];
  const seen = new Set();
  for (let i = 0; i < values.length; ++i) {
    const volIndex = volValues.indexOf(values[i]);
    const key = volIndex * numberOfSlices + sliceIndices[i];
    if (seen.has(key)) {
      return undefined;
    }
    seen.add(key);
    res.push(volIndex);
  }
  return res;
}

/**
 * Guess the volume index of items (files) that share slice
 * positions: volume id candidates are tried in order, the first one
 * that produces a valid grouping is kept (see getVolumeIndices).
 * If `custom.getPostLoadVolumeIdTagValue` is defined, it is used as
 * the only candidate.
 *
 * @param {Record<string, DataElement>[]} elementsList The DICOM tags
 *   of each item.
 * @param {number[]} sliceIndices The slice index of each item.
 * @param {number} numberOfSlices The number of distinct slices.
 * @returns {{volumeIndices: number[], getter: Function}|undefined}
 *   The volume index of each item and the volume id getter that
 *   produced them, undefined if no candidate produces a valid grouping.
 */
export function guessVolumeIndices(
  elementsList, sliceIndices, numberOfSlices) {
  let candidates;
  if (typeof custom.getPostLoadVolumeIdTagValue !== 'undefined') {
    candidates = [{
      name: 'custom',
      getter: custom.getPostLoadVolumeIdTagValue
    }];
  } else {
    candidates = getVolumeIdCandidates();
  }
  for (const candidate of candidates) {
    const values = elementsList.map(
      elements => candidate.getter(elements));
    const volumeIndices = getVolumeIndices(
      values, sliceIndices, numberOfSlices);
    if (typeof volumeIndices !== 'undefined') {
      logger.debug(`Using '${candidate.name}' as volume id`);
      return {volumeIndices, getter: candidate.getter};
    }
  }
  return undefined;
}
