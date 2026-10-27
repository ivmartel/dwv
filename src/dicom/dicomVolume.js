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
 * @import {
 *   PrivateBValueRule,
 *   VolumeIdCandidate
 * } from './types.js';
 * @import {SourcedNumberValue} from '../math/types.js';
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
 * Related SOP class UIDs.
 */
const SOPClassUIDs = {
  MR: '1.2.840.10008.5.1.4.1.1.4',
  EnhancedMR: '1.2.840.10008.5.1.4.1.1.4.1',
  EnhancedMRColorImage: '1.2.840.10008.5.1.4.1.1.4.3',
  LegacyConvertedEnhancedMRImageStorage: '1.2.840.10008.5.1.4.1.1.4.4'
};

/**
 * Default private b-value tag rules. Tested in order.
 * Rules are either `{manufacturer, key}` or `{uidPrefix, key}`.
 * Can be used to extend `custom.privateBValueRules`.
 *
 * @type {PrivateBValueRule[]}
 */
export const defaultPrivateBValueRules = [
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
 * Ordered list of candidate volume id getters. Since the tag that
 * actually discriminates volumes is not known until the full data
 * is loaded, `guessVolumeIndices` tries these in order and keeps the
 * first one that produces a valid, consistent per-volume grouping.
 * It is used for the files of a series (see `DicomSliceDataList`)
 * and for the frames of a multi-frame file (see
 * `getSortedFramesGeometry`).
 * Most explicit/reliable discriminators come first, AcquisitionTime
 * (the historical default) comes last.
 * Candidates flagged with `preLoad` are also used while loading
 * (see `getVolumeIdTagValue`): they must not vary between the
 * slices of a single volume.
 *
 * @type {VolumeIdCandidate[]}
 */
export const defaultVolumeIdCandidates = [
  {
    name: 'TemporalPositionIdentifier',
    getter: makeNumericTagGetter(
      TagKeys.TemporalPositionIdentifier, value => parseInt(value, 10)),
    preLoad: true
  },
  {
    name: 'TemporalPositionIndex',
    getter: getTemporalPositionIndex,
    preLoad: true
  },
  {
    name: 'DiffusionBValue',
    getter: getMRVolumeId,
    preLoad: true
  },
  {
    name: 'EchoTime',
    getter: makeNumericTagGetter(TagKeys.EchoTime, parseFloat, 'unit.ms')
  },
  {
    name: 'TriggerTime',
    getter: makeNumericTagGetter(TagKeys.TriggerTime, parseFloat, 'unit.ms')
  },
  {
    name: 'InversionTime',
    getter: makeNumericTagGetter(
      TagKeys.InversionTime, parseFloat, 'unit.ms')
  },
  {
    // seconds since the first acquisition
    name: 'AcquisitionTime',
    getter: getAcquisitionTime,
    relative: true
  }
];

/**
 * Create a volume id.
 *
 * @param {number|undefined} value The volume id value.
 * @param {string} tagKey The key of the tag the value is read from.
 * @param {string} [unit] The value unit as an i18n key.
 * @returns {SourcedNumberValue|undefined} The volume id, undefined if the
 *   value is undefined.
 */
function createVolumeId(value, tagKey, unit) {
  if (typeof value === 'undefined') {
    return undefined;
  }
  /** @type {SourcedNumberValue} */
  const res = {value, tagKey};
  if (typeof unit !== 'undefined') {
    res.unit = unit;
  }
  return res;
}

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
 * @returns {{value: string, key: string}|undefined} The value and
 *   the key of the tag it was read from, if present.
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
    rules = defaultPrivateBValueRules;
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
      res = {value, key: rule.key};
      break;
    }
  }

  // b-value at root level
  if (typeof res === 'undefined') {
    const value = safeGet(elements, TagKeys.DiffusionBValue);
    if (typeof value !== 'undefined') {
      res = {value, key: TagKeys.DiffusionBValue};
    }
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
 * Get the diffusion b-value as a volume id: with the key of the tag
 * it was read from and its unit (no unit if the value is not
 * a b-value, for example a dimension index).
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {SourcedNumberValue|undefined} The volume id, if present.
 */
function getDiffusionBValueVolumeId(elements) {
  let res;
  // SOP class UID
  const sopClassUID = safeGet(elements, TagKeys.SOPClassUID);

  const bValueUnit = 'unit.smm2';
  if (sopClassUID === SOPClassUIDs.EnhancedMR ||
    sopClassUID === SOPClassUIDs.EnhancedMRColorImage ||
    sopClassUID === SOPClassUIDs.LegacyConvertedEnhancedMRImageStorage
  ) {
    // standard tag
    const value = getStandardDiffusionBValueFromEMR(elements);
    if (typeof value !== 'undefined') {
      res = {value, tagKey: TagKeys.DiffusionBValue, unit: bValueUnit};
    } else {
      // if not found, check non standard tag
      // (a dimension index, not a b-value: no unit)
      const index = getNonStandardDiffusionBValueFromEMR(elements);
      if (typeof index !== 'undefined') {
        logger.debug('Got b-value for enhanced MR from non standard tag');
        res = {value: index, tagKey: TagKeys.DimensionIndexValues};
      }
    }
  } else if (sopClassUID === SOPClassUIDs.MR) {
    // non standard for MR
    const nonStandard = getNonStandardDiffusionBValueFromMR(elements);
    if (typeof nonStandard !== 'undefined') {
      res = {
        value: nonStandard.value,
        tagKey: nonStandard.key,
        unit: bValueUnit
      };
    } else {
      // if not found, check standard EMR tag
      const value = getStandardDiffusionBValueFromEMR(elements);
      if (typeof value !== 'undefined') {
        res = {value, tagKey: TagKeys.DiffusionBValue, unit: bValueUnit};
      }
    }
  }

  // cast to number (FD/DS b-values can be fractional)
  if (typeof res !== 'undefined') {
    const value = parseNumber(res.value, parseFloat);
    res = typeof value !== 'undefined' ? {...res, value} : undefined;
  }
  return res;
}

/**
 * Get the volume id for MR images (can be time, b-value...).
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {SourcedNumberValue|undefined} The volume id, if present.
 */
function getMRVolumeId(elements) {
  let res;

  // filter by SOP class UID
  const sopClassUID = safeGet(elements, TagKeys.SOPClassUID);
  if (sopClassUID === SOPClassUIDs.MR ||
    sopClassUID === SOPClassUIDs.EnhancedMR ||
    sopClassUID === SOPClassUIDs.EnhancedMRColorImage ||
    sopClassUID === SOPClassUIDs.LegacyConvertedEnhancedMRImageStorage
  ) {
    // diffusion b-value
    res = getDiffusionBValueVolumeId(elements);
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
 * @returns {SourcedNumberValue|undefined} The volume id, if present.
 */
function getTemporalPositionIndex(elements) {
  return createVolumeId(
    getConstantPerFrameValue(
      elements, getFrameTemporalPositionIndex, 'TemporalPositionIndex'),
    TagKeys.TemporalPositionIndex);
}

/**
 * Create a getter that reads a numeric volume id from a single tag.
 *
 * @param {string} key The tag key.
 * @param {Function} parse The string to number parser to use.
 * @param {string} [unit] The value unit as an i18n key.
 * @returns {Function} The getter, returns undefined if the tag is absent
 *   or not a number.
 */
function makeNumericTagGetter(key, parse, unit) {
  return function (elements) {
    return createVolumeId(
      parseNumber(safeGet(elements, key), parse), key, unit);
  };
}

/**
 * List of already logged deprecation messages.
 *
 * @type {string[]}
 */
const loggedDeprecations = [];

/**
 * Log a deprecation warning, only once per message.
 *
 * @param {string} message The deprecation message.
 */
function warnDeprecatedOnce(message) {
  if (!loggedDeprecations.includes(message)) {
    loggedDeprecations.push(message);
    logger.warn(message);
  }
}

/**
 * Get the volume id of a candidate, named after the candidate.
 *
 * @param {VolumeIdCandidate} candidate The candidate.
 * @param {Record<string, DataElement>} elements The DICOM elements.
 * @returns {SourcedNumberValue|undefined} The volume id, if present.
 */
function getCandidateVolumeId(candidate, elements) {
  const volumeId = candidate.getter(elements);
  if (typeof volumeId === 'undefined') {
    return undefined;
  }
  return {...volumeId, source: candidate.name};
}

/**
 * Get a deprecated custom volume id getter as a candidate: its
 * getter returns a number.
 *
 * @param {Function} getter The deprecated getter.
 * @returns {VolumeIdCandidate} The candidate.
 */
function getDeprecatedCandidate(getter) {
  return {
    name: 'custom',
    getter(elements) {
      const value = getter(elements);
      return typeof value !== 'undefined' ? {value} : undefined;
    }
  };
}

/**
 * Get the volume id from a list of tags, used while loading (before
 * the full data is known): the first defined volume id of the
 * candidates flagged with `preLoad` (see defaultVolumeIdCandidates).
 *
 * @param {Record<string, DataElement>} elements The DICOM elements.
 * @returns {SourcedNumberValue|undefined} The volume id if available.
 */
export function getVolumeId(elements) {
  if (typeof custom.getVolumeIdTagValue !== 'undefined') {
    warnDeprecatedOnce(
      'custom.getVolumeIdTagValue: deprecated since v0.37,' +
      ' please use custom.volumeIdCandidates with a preLoad candidate.'
    );
    return getCandidateVolumeId(
      getDeprecatedCandidate(custom.getVolumeIdTagValue), elements);
  }
  for (const candidate of getVolumeIdCandidates()) {
    if (candidate.preLoad === true) {
      const volumeId = getCandidateVolumeId(candidate, elements);
      if (typeof volumeId !== 'undefined') {
        return volumeId;
      }
    }
  }
  return undefined;
}

/**
 * Get the volume id value from a list of tags, used while loading
 * (see getVolumeId).
 *
 * @param {Record<string, DataElement>} elements The DICOM elements.
 * @returns {number|undefined} The id value if available.
 */
export function getVolumeIdTagValue(elements) {
  return getVolumeId(elements)?.value;
}

/**
 * Get the acquisition time as a number of seconds. If the acquisition
 * date is available, it is included so that acquisitions spanning
 * midnight are correctly ordered.
 *
 * @param {Record<string, DataElement>} elements The DICOM tags.
 * @returns {SourcedNumberValue|undefined} The volume id, if present.
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
  return createVolumeId(res, TagKeys.AcquisitionTime, 'unit.s');
}

/**
 * Get the list of volume id candidates: the custom one if defined,
 * the default one otherwise.
 *
 * @returns {VolumeIdCandidate[]}
 *   The candidates.
 */
function getVolumeIdCandidates() {
  return typeof custom.volumeIdCandidates !== 'undefined'
    ? custom.volumeIdCandidates
    : defaultVolumeIdCandidates;
}

/**
 * Get the volume index of each item (file or frame) from its volume
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
 * Get volume ids with values relative to the smallest one.
 *
 * @param {SourcedNumberValue[]} volumeIds The volume ids.
 * @returns {SourcedNumberValue[]} The relative volume ids.
 */
function getRelativeVolumeIds(volumeIds) {
  const min = Math.min(...volumeIds.map(volumeId => volumeId.value));
  return volumeIds.map(
    volumeId => ({...volumeId, value: volumeId.value - min}));
}

/**
 * Guess the volume index of items (files or frames) that share slice
 * positions: volume id candidates are tried in order, the first one
 * that produces a valid grouping is kept (see getVolumeIndices).
 * If the deprecated `custom.getPostLoadVolumeIdTagValue` is defined,
 * it is used as the only candidate.
 *
 * @param {Array<Record<string, DataElement>>} elementsList The DICOM tags
 *   of each item.
 * @param {number[]} sliceIndices The slice index of each item.
 * @param {number} numberOfSlices The number of distinct slices.
 * @returns {{
 *   volumeIndices: number[],
 *   volumeIds: SourcedNumberValue[],
 *   getter: Function
 * }|undefined}
 *   The volume index and volume id of each item (relative to the
 *   smallest one for `relative` candidates) and the volume id
 *   value getter (`(elements) => number|undefined`, not relative)
 *   that produced them, undefined if no candidate produces a valid
 *   grouping.
 */
export function guessVolumeIndices(
  elementsList, sliceIndices, numberOfSlices) {
  let candidates;
  if (typeof custom.getPostLoadVolumeIdTagValue !== 'undefined') {
    warnDeprecatedOnce(
      'custom.getPostLoadVolumeIdTagValue: deprecated since v0.37,' +
      ' please use custom.volumeIdCandidates.'
    );
    candidates = [
      getDeprecatedCandidate(custom.getPostLoadVolumeIdTagValue)
    ];
  } else {
    candidates = getVolumeIdCandidates();
  }
  for (const candidate of candidates) {
    const volumeIds = elementsList.map(
      elements => getCandidateVolumeId(candidate, elements));
    const volumeIndices = getVolumeIndices(
      volumeIds.map(volumeId => volumeId?.value),
      sliceIndices, numberOfSlices);
    if (typeof volumeIndices !== 'undefined') {
      logger.debug(`Using '${candidate.name}' as volume id`);
      return {
        volumeIndices,
        volumeIds: candidate.relative === true
          ? getRelativeVolumeIds(volumeIds)
          : volumeIds,
        getter: elements => candidate.getter(elements)?.value
      };
    }
  }
  return undefined;
}
