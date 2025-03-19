import {DicomParser} from './dicomParser';
import {logger} from '../utils/logger';

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
  const elements = parser.getDicomElements();

  // Directory Record Sequence
  if (typeof elements['00041220'] === 'undefined' ||
    typeof elements['00041220'].value === 'undefined') {
    logger.warn('No Directory Record Sequence found in DICOMDIR.');
    return undefined;
  }
  const dirSeq = elements['00041220'].value;

  if (dirSeq.length === 0) {
    logger.warn('The Directory Record Sequence of the DICOMDIR is empty.');
    return undefined;
  }

  const records = [];
  let series = null;
  let study = null;
  for (let i = 0; i < dirSeq.length; ++i) {
    // Directory Record Type
    if (typeof dirSeq[i]['00041430'] === 'undefined' ||
      typeof dirSeq[i]['00041430'].value === 'undefined') {
      continue;
    }
    const recType = dirSeq[i]['00041430'].value[0];

    // supposed to come in order...
    if (recType === 'STUDY') {
      study = [];
      records.push(study);
    } else if (recType === 'SERIES') {
      series = [];
      study.push(series);
    } else if (recType === 'IMAGE') {
      // Referenced File ID
      if (typeof dirSeq[i]['00041500'] === 'undefined' ||
        typeof dirSeq[i]['00041500'].value === 'undefined') {
        continue;
      }
      const refFileIds = dirSeq[i]['00041500'].value;
      // join ids
      series.push(refFileIds.join('/'));
    }
  }
  return records;
}
