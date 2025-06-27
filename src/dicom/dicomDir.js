import {DicomParser} from './dicomParser.js';
import {logger} from '../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from './dataElement.js';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  DirectoryRecordSequence: '00041220',
  DirectoryRecordType: '00041430',
  ReferencedFileID: '00041500'
};

/**
 * DICOM record types.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_F.3.2.2.html#table_F.3-3}.
 */
const DirectoryRecordTypes = {
  study: 'STUDY',
  series: 'SERIES',
  image: 'IMAGE'
};

/**
 * Get the file list from a DICOMDIR.
 *
 * @param {object} data The buffer data of the DICOMDIR.
 * @returns {Array|undefined} The file list as an array ordered by
 *   STUDY > SERIES > IMAGES.
 */
export function getFileListFromDicomDir(data) {
  // parse file
  const parser = new DicomParser();
  parser.parse(data);
  return getDicomDirFileList(parser.getDicomElements());
}

/**
 * Get a DICOMDIR file list.
 *
 * @param {Object<string, DataElement>} dicomElements The dicom elements.
 * @returns {Array|undefined} The file list as an array ordered by
 *   STUDY > SERIES > IMAGES.
 */
function getDicomDirFileList(dicomElements) {
  // Directory Record Sequence
  const dirRecSqElement = dicomElements[TagKeys.DirectoryRecordSequence];
  if (typeof dirRecSqElement === 'undefined' ||
    typeof dirRecSqElement.value === 'undefined') {
    logger.warn('No Directory Record Sequence found in DICOMDIR.');
    return undefined;
  }
  const dirSeq = dirRecSqElement.value;

  if (dirSeq.length === 0) {
    logger.warn('The Directory Record Sequence of the DICOMDIR is empty.');
    return undefined;
  }

  const records = [];
  let series = null;
  let study = null;
  for (let i = 0; i < dirSeq.length; ++i) {
    // Directory Record Type
    const dirRecTypeElement = dirSeq[i][TagKeys.DirectoryRecordType];
    if (typeof dirRecTypeElement === 'undefined' ||
      typeof dirRecTypeElement.value === 'undefined') {
      continue;
    }
    const recType = dirRecTypeElement.value[0];

    // supposed to come in order...
    if (recType === DirectoryRecordTypes.study) {
      study = [];
      records.push(study);
    } else if (recType === DirectoryRecordTypes.series) {
      series = [];
      study.push(series);
    } else if (recType === DirectoryRecordTypes.image) {
      // Referenced File ID
      const refFileIdElement = dirSeq[i][TagKeys.ReferencedFileID];
      if (typeof refFileIdElement === 'undefined' ||
        typeof refFileIdElement.value === 'undefined') {
        continue;
      }
      const refFileIds = refFileIdElement.value;
      // join ids
      series.push(refFileIds.join('/'));
    }
  }
  return records;
}
