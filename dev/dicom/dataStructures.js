import {addTagsToDictionary} from '../../src/dicom/dictionary.js';
import {
  generateDataElements,
  generateSliceBuffers
} from './dicomGenerator.js';

/**
 * MR Image Storage SOP class UID.
 */
const MRImageStorage = '1.2.840.10008.5.1.4.1.1.4';

/**
 * Enhanced MR Image Storage SOP class UID.
 */
const EnhancedMRImageStorage = '1.2.840.10008.5.1.4.1.1.4.1';

/**
 * Single file, single frame data structure.
 */
export const singleSliceStructure = {
  name: 'single-slice',
  genOptions: {}
};

/**
 * Single file, frames with positions not in spatial order: the
 * frames need to be sorted to get the spatial slices.
 *
 * Test only: not part of {@link dataStructures}, so not listed
 * in the synthetic data page.
 */
export const unsortedMultiframeMultiSliceStructure = {
  name: 'unsorted multiframe multi-slice',
  numberOfFrames: 5,
  genOptions: {frames3D: true, framePositionOrder: [2, 0, 4, 1, 3]}
};

/**
 * Single file, several volumes: frames share positions and have
 * a different TemporalPositionIndex per volume. Frames are not in
 * spatial nor temporal order.
 *
 * Test only: not part of {@link dataStructures}, so not listed
 * in the synthetic data page.
 */
export const unsortedMultiframeMultiVolumeStructure = {
  name: 'unsorted multiframe multi-volume',
  numberOfFrames: 4,
  genOptions: {
    frames3D: true,
    framePositionOrder: [1, 0, 0, 1],
    frameTemporalPositions: [2, 2, 1, 1]
  }
};

/**
 * Single file, several volumes: frames share positions and have
 * a different diffusion b-value per volume (constant
 * TemporalPositionIndex). Frames are not in spatial nor b-value order.
 *
 * Test only: not part of {@link dataStructures}, so not listed
 * in the synthetic data page.
 */
export const unsortedMultiframeMultiVolumeBValueStructure = {
  name: 'unsorted multiframe multi-volume b-value',
  numberOfFrames: 4,
  genOptions: {
    frames3D: true,
    framePositionOrder: [1, 0, 0, 1],
    frameBValues: [1000, 1000, 50, 50]
  }
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
  // (not valid DICOM: the MR Image IOD is single frame and has no
  // Multi-frame module)
  multiframe: {
    name: 'multiframe',
    short: 'mf',
    numberOfFrames: 3,
    genOptions: {}
  },
  // one file, frames with position: spatial slices
  multiframeMultiSlice: {
    name: 'multiframe multi-slice',
    short: 'mfms',
    numberOfFrames: 5,
    genOptions: {frames3D: true}
  },
  // one file, frames with position and temporal position: several
  // volumes (frames in volume then spatial order)
  multiframeMultiVolume: {
    name: 'multiframe multi-volume',
    short: 'mfmv',
    numberOfFrames: 10,
    genOptions: {
      frames3D: true,
      framePositionOrder: [0, 1, 2, 3, 4, 0, 1, 2, 3, 4],
      frameTemporalPositions: [1, 1, 1, 1, 1, 2, 2, 2, 2, 2]
    }
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
  multipleMultiframeMultiSlice: {
    name: 'multiple multiframe multi-slice',
    short: 'mmfms',
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
  // per-frame functional groups are not part of the MR Image IOD:
  // use the Enhanced MR Image one
  if (structure.genOptions.frames3D &&
    tags.SOPClassUID === MRImageStorage) {
    tags.SOPClassUID = EnhancedMRImageStorage;
    tags.MediaStorageSOPClassUID = EnhancedMRImageStorage;
  }
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
