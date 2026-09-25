import {addTagsToDictionary} from '../../src/dicom/dictionary.js';
import {
  generateDataElements,
  generateSliceBuffers
} from './dicomGenerator.js';

/**
 * Single file, single frame data structure.
 */
export const singleSliceStructure = {
  name: 'single-slice',
  genOptions: {}
};

/**
 * Multi-file or multi-frame data structures: the ways an image can be
 * stored in one or more DICOM files.
 *
 * Each structure has:
 * - name: the structure name,
 * - short: the structure short name,
 * - numberOfFrames: the per file NumberOfFrames tag (undefined for
 *   single frame files),
 * - genOptions: the generateDataElements options (numberOfSlices and
 *   numberOfFrames being numbers of files, frames3D to add per-frame
 *   positions).
 */
export const dataStructures = {
  // one file, frames without position: time
  multiframe: {
    name: 'multiframe',
    short: 'mf',
    numberOfFrames: 3,
    genOptions: {}
  },
  // one file, frames with position: spatial slices
  multiframeMultiSlice: {
    name: 'multiframe multi-slice',
    short: 'sfms',
    numberOfFrames: 5,
    genOptions: {frames3D: true}
  },
  // spatial slices, one file per slice
  multipleSingleSlice: {
    name: 'multiple single-slice',
    short: 'mss',
    genOptions: {numberOfSlices: 5}
  },
  // one single frame file per time point, same position
  multipleSingleFrame: {
    name: 'multiple single-frame',
    short: 'msf',
    genOptions: {numberOfFrames: 3}
  },
  // one multiframe multi-slice file per time point
  multipleSingleFrameMultiSlice: {
    name: 'multiple single-frame multi-slice',
    short: 'msfms',
    numberOfFrames: 5,
    genOptions: {frames3D: true, numberOfSlices: 3}
  }
};

/**
 * Get the number of files of a data structure.
 *
 * @param {object} structure The data structure,
 *   see {@link dataStructures}.
 * @returns {number} The number of files.
 */
export function getStructureNumberOfFiles(structure) {
  let res = 1;
  if (typeof structure.genOptions.numberOfSlices !== 'undefined') {
    res *= structure.genOptions.numberOfSlices;
  }
  if (typeof structure.genOptions.numberOfFrames !== 'undefined') {
    res *= structure.genOptions.numberOfFrames;
  }
  return res;
}

/**
 * Generate the data elements of the files of a data structure.
 *
 * @param {object} config The data configuration (tags, and optional
 *   segmentSquares for SEG), as in tests/data/synthetic-*.json.
 * @param {string} syntax The transfer syntax.
 * @param {object} structure The data structure, see
 *   {@link singleSliceStructure} and {@link dataStructures}.
 * @returns {object[]} The list of data elements, one per file.
 */
export function getStructureElementsList(config, syntax, structure) {
  const tags = structuredClone(config.tags);
  tags.TransferSyntaxUID = syntax;
  if (typeof structure.numberOfFrames !== 'undefined') {
    tags.NumberOfFrames = structure.numberOfFrames;
  }
  // generateDataElements modifies its options, use a copy
  const genOptions = {
    pixelGeneratorName: 'string',
    segmentSquares: config.segmentSquares,
    ...structuredClone(structure.genOptions)
  };
  return generateDataElements(tags, genOptions);
}

/**
 * Generate the DICOM buffers of the files of a data structure.
 * Adds the config private tags to the dictionary if present.
 *
 * @param {object} config The data configuration (tags, and optional
 *   privateDictionary, useUnVrForPrivateSq and segmentSquares),
 *   as in tests/data/synthetic-*.json.
 * @param {string} syntax The transfer syntax.
 * @param {object} structure The data structure, see
 *   {@link singleSliceStructure} and {@link dataStructures}.
 * @returns {ArrayBuffer[]} The list of buffers, one per file.
 */
export function getStructureBuffers(config, syntax, structure) {
  // add private tags to dict if present
  let useUnVrForPrivateSq = false;
  if (typeof config.privateDictionary !== 'undefined') {
    for (const [group, tags] of Object.entries(config.privateDictionary)) {
      addTagsToDictionary(group, tags);
    }
    if (typeof config.useUnVrForPrivateSq !== 'undefined') {
      useUnVrForPrivateSq = config.useUnVrForPrivateSq;
    }
  }
  return generateSliceBuffers(
    getStructureElementsList(config, syntax, structure),
    {useUnVrForPrivateSq}
  );
}
