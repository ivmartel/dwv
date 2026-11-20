import {DicomParser} from './dicomParser.js';
import {DicomWriter, getUID} from './dicomWriter.js';
import {safeGet} from './dataElement.js';
import {getPixelDataTag} from './dicomTag.js';
import {
  getSRContent,
  getSRReferencedInstanceUIDs
} from './dicomSRContent.js';
import {
  getElementsFromSimpleTagValues,
  mergeTagValues
} from './simpleTagValues.js';
import {getRootGeometry} from './dicomGeometry.js';
import {getVolumeId} from './dicomVolume.js';
import {
  SopInstanceReference,
  getDicomSopInstanceReferenceItem
} from './dicomSopInstanceReference.js';
import {getComparePoint3D} from '../image/geometry.js';
import {logger} from '../utils/logger.js';

/**
 * @import {DataElement} from './dataElement.js';
 * @import {DicomCode} from './dicomCode.js';
 * @import {Tag} from './dicomTag.js';
 * @import {SimpleTagValues} from './types.js';
 * @import {Geometry} from '../image/geometry.js';
 * @import {Point3D} from '../math/point.js';
 */

/**
 * Related DICOM tag keys.
 */
const DerivedVolumeTagKeys = {
  SOPClassUID: '00080016',
  SOPInstanceUID: '00080018',
  InstanceNumber: '00200013',
  SeriesInstanceUID: '0020000E',
  FrameOfReferenceUID: '00200052',
  NumberOfFrames: '00280008'
};

// maximum UID length
const MAX_UID_LENGTH = 64;
// UID format
const UID_PATTERN = /^(0|[1-9]\d*)(\.(0|[1-9]\d*))*$/;

/**
 * Derived volume source slice.
 *
 * @typedef {object} DerivedVolumeSlice
 * @property {number} index The slice index in the input list.
 * @property {Record<string, DataElement>} elements The slice elements.
 * @property {Point3D} origin The slice origin.
 */

/**
 * Check a derived volume source.
 *
 * @param {Record<string, DataElement>} dataElements The source elements.
 * @param {number} index The source index.
 * @returns {string} The source SOP Instance UID.
 * @throws {Error} If the source cannot be used.
 */
function checkDerivedVolumeSource(dataElements, index) {
  const sopClassUid =
    safeGet(dataElements, DerivedVolumeTagKeys.SOPClassUID);
  const sopInstanceUid =
    safeGet(dataElements, DerivedVolumeTagKeys.SOPInstanceUID);
  if (typeof sopClassUid === 'undefined' ||
    typeof sopInstanceUid === 'undefined') {
    throw new Error(`Source ${index} has no SOP Class or Instance UID.`);
  }
  const numberOfFrames =
    safeGet(dataElements, DerivedVolumeTagKeys.NumberOfFrames);
  if (typeof numberOfFrames !== 'undefined' &&
    Number.parseInt(numberOfFrames, 10) > 1) {
    throw new Error(`Source ${sopInstanceUid} is multi-frame, ` +
      'not supported.');
  }
  return sopInstanceUid;
}

/**
 * Get the slices of a derived volume, checking they form one volume.
 *
 * @param {Record<string, DataElement>[]} sourceElements The source
 *   elements.
 * @returns {{slices: DerivedVolumeSlice[], geometry: Geometry}} The
 *   slices, in input order, and the volume geometry.
 * @throws {Error} If the sources cannot form one volume.
 */
function getDerivedVolumeSlices(sourceElements) {
  const keys = DerivedVolumeTagKeys;
  const slices = [];
  let geometry;
  let seriesInstanceUid;
  let frameOfReferenceUid;
  let volumeId;
  for (let i = 0; i < sourceElements.length; ++i) {
    const elements = sourceElements[i];
    const uid = checkDerivedVolumeSource(elements, i);
    const sliceGeometry = getRootGeometry(elements);
    const origin = sliceGeometry.getOrigin();
    const sliceSeriesUid = safeGet(elements, keys.SeriesInstanceUID);
    const sliceFrameOfReferenceUid =
      safeGet(elements, keys.FrameOfReferenceUID);
    const sliceVolumeId = sliceGeometry.getInitialTime()?.id.value;
    if (i === 0) {
      geometry = sliceGeometry;
      seriesInstanceUid = sliceSeriesUid;
      frameOfReferenceUid = sliceFrameOfReferenceUid;
      volumeId = sliceVolumeId;
    } else {
      if (sliceSeriesUid !== seriesInstanceUid) {
        throw new Error(`Source ${uid} is not in the series of the others.`);
      }
      if (sliceFrameOfReferenceUid !== frameOfReferenceUid) {
        throw new Error(`Source ${uid} has a different frame of reference.`);
      }
      // a different volume id would load as another volume (time frame)
      if (sliceVolumeId !== volumeId) {
        throw new Error(`Source ${uid} belongs to another volume ` +
          `(volume id ${sliceVolumeId}, expected ${volumeId}).`);
      }
      const canAppend = geometry.canAppendSlice(sliceGeometry);
      if (!canAppend.success) {
        throw new Error(`Source ${uid}: ${canAppend.message}.`);
      }
      geometry.appendOrigin(origin, geometry.getSliceIndex(origin));
    }
    slices.push({index: i, elements, origin});
  }
  return {slices, geometry};
}

/**
 * Get the data elements of a new series derived from single frame
 *   slices forming one volume.
 *
 * All source tags are kept except the extra tags and the instance tags:
 *   series and SOP instance UIDs, instance number (slice position order)
 *   and source image reference. The source elements are updated and
 *   returned, they can be written with a {@link DicomWriter}.
 *
 * @param {Record<string, DataElement>[]} sourceElements The data elements
 *   of the source slices, updated.
 * @param {SimpleTagValues} [extraTags] Optional list of extra tags.
 * @returns {Record<string, DataElement>[]} The data elements of the
 *   derived instances.
 * @throws {Error} If the sources cannot form one volume.
 */
export function getDerivedVolumeElements(sourceElements, extraTags) {
  if (!Array.isArray(sourceElements) || sourceElements.length === 0) {
    throw new Error('No source to create the derived volume from.');
  }
  const seriesUidValue = extraTags?.SeriesInstanceUID;
  const seriesInstanceUid =
    Array.isArray(seriesUidValue) && seriesUidValue.length === 1
      ? seriesUidValue[0] : seriesUidValue;
  if (typeof seriesInstanceUid !== 'undefined') {
    const lastInstanceUid = `${seriesInstanceUid}.${sourceElements.length}`;
    if (typeof seriesInstanceUid !== 'string' ||
      !UID_PATTERN.test(seriesInstanceUid) ||
      lastInstanceUid.length > MAX_UID_LENGTH) {
      throw new Error('Invalid series instance UID: ' +
        `${JSON.stringify(seriesUidValue)}.`);
    }
  }

  const {slices, geometry} = getDerivedVolumeSlices(sourceElements);
  // order by position, in the direction of the source instance numbers
  //   or else of the input order
  const comparePoints = getComparePoint3D(geometry.getOrientation());
  slices.sort((a, b) => comparePoints(a.origin, b.origin));
  const firstInstanceNumber = Number.parseInt(
    safeGet(slices[0].elements, DerivedVolumeTagKeys.InstanceNumber), 10);
  const lastInstanceNumber = Number.parseInt(
    safeGet(slices.at(-1).elements, DerivedVolumeTagKeys.InstanceNumber), 10);
  const isReversed = Number.isNaN(firstInstanceNumber) ||
    Number.isNaN(lastInstanceNumber) ||
    firstInstanceNumber === lastInstanceNumber
    ? slices[0].index > slices.at(-1).index
    : firstInstanceNumber > lastInstanceNumber;
  if (isReversed) {
    slices.reverse();
  }

  const newSeriesUid = seriesInstanceUid ?? getUID('SeriesInstanceUID');
  const result = [];
  let firstVolumeId;
  for (let i = 0; i < slices.length; ++i) {
    const elements = slices[i].elements;
    const instanceNumber = i + 1;
    const sopInstanceUid = typeof seriesInstanceUid !== 'undefined'
      ? `${seriesInstanceUid}.${instanceNumber}`
      : getUID('SOPInstanceUID');
    const sourceReference = new SopInstanceReference();
    sourceReference.referencedSOPClassUID =
      safeGet(elements, DerivedVolumeTagKeys.SOPClassUID);
    sourceReference.referencedSOPInstanceUID =
      safeGet(elements, DerivedVolumeTagKeys.SOPInstanceUID);

    /** @type {SimpleTagValues} */
    const tags = {};
    if (extraTags !== undefined) {
      mergeTagValues(tags, extraTags);
    }
    // instance tags
    mergeTagValues(tags, {
      SeriesInstanceUID: newSeriesUid,
      SOPInstanceUID: sopInstanceUid,
      MediaStorageSOPInstanceUID: sopInstanceUid,
      InstanceNumber: instanceNumber,
      SourceImageSequence: {
        value: [getDicomSopInstanceReferenceItem(sourceReference)]
      }
    });
    Object.assign(elements, getElementsFromSimpleTagValues(tags));
    const volumeId = getVolumeId(elements)?.id.value;
    if (i === 0) {
      firstVolumeId = volumeId;
    } else if (volumeId !== firstVolumeId) {
      throw new Error(`Derived instance ${sopInstanceUid} belongs to ` +
        `another volume (volume id ${volumeId}, expected ${firstVolumeId}).`);
    }
    result.push(elements);
  }
  return result;
}

/**
 * Parse a derived volume source file.
 *
 * @param {ArrayBuffer} buffer The source file.
 * @param {number} index The source index.
 * @param {Tag} [untilTag] Optional tag to stop the parsing once reached.
 * @returns {Record<string, DataElement>} The source elements.
 * @throws {Error} If the file cannot be parsed.
 */
function parseDerivedVolumeSource(buffer, index, untilTag) {
  const parser = new DicomParser();
  try {
    parser.parse(buffer, untilTag);
  } catch (error) {
    throw new Error(`Cannot parse source ${index}: ${error.message}`,
      {cause: error});
  }
  return parser.getDicomElements();
}

/**
 * Create the files of a new series derived from the images referenced
 *   by an SR content item, forming one volume.
 *
 * The input data is not modified. Source files not referenced by the SR,
 *   or that cannot be read, are ignored. The source instance numbers, or
 *   else the SR order, give the slice order direction.
 *
 * @param {Record<string, DataElement>} srElements The SR data elements.
 * @param {string|DicomCode} code The code value or the code of the SR
 *   content item that holds the images.
 * @param {ArrayBuffer[]} sourceBuffers The source files, in any order.
 * @param {SimpleTagValues} [extraTags] Optional list of extra tags.
 * @returns {ArrayBuffer[]} The derived DICOM files, in slice order.
 * @throws {Error} If no image is referenced, if a referenced instance is
 *   not in the sources or cannot be parsed, or if the sources cannot form
 *   one volume.
 */
export function createDerivedVolumeFromSR(
  srElements, code, sourceBuffers, extraTags) {
  const uids = getSRReferencedInstanceUIDs(getSRContent(srElements), code);
  if (uids.length === 0) {
    const codeValue = typeof code === 'string'
      ? code : code.value ?? code.longValue ?? code.urnValue;
    throw new Error(`No image referenced by ${codeValue}.`);
  }
  // source index by SOP Instance UID
  /** @type {Map<string, number>} */
  const indexBySopUid = new Map();
  for (let i = 0; i < sourceBuffers.length; ++i) {
    let elements;
    try {
      elements =
        parseDerivedVolumeSource(sourceBuffers[i], i, getPixelDataTag());
    } catch (error) {
      logger.warn(`${error.message}, source ignored.`);
      continue;
    }
    const sopUid = safeGet(elements, DerivedVolumeTagKeys.SOPInstanceUID);
    if (typeof sopUid === 'undefined') {
      logger.warn(`Source ${i} has no SOP Instance UID, source ignored.`);
    } else if (indexBySopUid.has(sopUid)) {
      logger.warn(`Source ${i} has the SOP Instance UID of source ` +
        `${indexBySopUid.get(sopUid)}, source ignored.`);
    } else {
      indexBySopUid.set(sopUid, i);
    }
  }
  const missing = uids.filter((uid) => !indexBySopUid.has(uid));
  if (missing.length !== 0) {
    throw new Error(`Missing source instances: ${missing.join(', ')}.`);
  }
  const derived = getDerivedVolumeElements(
    uids.map((uid) => {
      const index = indexBySopUid.get(uid);
      return parseDerivedVolumeSource(sourceBuffers[index], index);
    }),
    extraTags
  );
  return derived.map((elements) => new DicomWriter().getBuffer(elements));
}
