
import {getTypedArray} from '../../src/dicom/dicomParser.js';
import {getPixelDataTag} from '../../src/dicom/dicomTag.js';
import {
  getOrientationName,
  Orientation,
} from '../../src/math/orientation.js';
import {
  getElementsFromSimpleTagValues
} from '../../src/dicom/simpleTagValues.js';
import {
  DicomWriter
} from '../../src/dicom/dicomWriter.js';

import {
  BinaryPixGenerator
} from './binaryPixGenerator.js';
import {
  FilePixGenerator,
  fileCheckTags
} from './filePixGenerator.js';
import {
  GradSquarePixGenerator
} from './gradSquarePixGenerator.js';
import {
  MPRPixGenerator,
  mprCheckTags
} from './mprPixGenerator.js';
import {
  SquarePixGenerator
} from './squarePixGenerator.js';
import {
  StringPixGenerator
} from './stringPixGenerator.js';

import JSZip from 'jszip';

/**
 * @import {DataElement} from '../../src/dicom/dataElement.js;
 * @import {SimpleTagValue} from '../../src/dicom/simpleTagValues.js;
 */

/**
 * @typedef {Object} GenerateOptions
 * @property {string} pixelGeneratorName The name of
 *   the pixel generator to use, defaults to gradSquare.
 * @property {number} numberOfSlices The result number of slices,
 *   default to 1.
 * @property {number} sliceNumber The slice number,
 *   default to 0.
 * @property {Array} images The images to pass to file
 *   capable generators.
 * @property {object} segmentSquares Per-segment square bounds
 *   keyed by segment number string. Each entry has
 *   {minI, maxI, minJ, maxJ}.
 * @property {string} modality The DICOM modality to generate pixel
 *   data for, defaults to the tags' Modality.
 */

/**
 * @typedef {Object} WriterOptions
 * @property {boolean} useUnVrForPrivateSq The use
 *   UN VR for private sequence flag..
 * @property {Object} writerRules The writer rules.
 * @property {boolean} addMissingTags Writer add missing flag.
 */

// List of pixel generators
export const _pixelGenerators = {
  binary: {generator: BinaryPixGenerator},
  file: {generator: FilePixGenerator, checkTags: fileCheckTags},
  gradSquare: {generator: GradSquarePixGenerator},
  mpr: {generator: MPRPixGenerator, checkTags: mprCheckTags},
  square: {generator: SquarePixGenerator},
  string: {generator: StringPixGenerator}
};

// List of required tags for generating pixel data
const _requiredPixelTags = [
  'TransferSyntaxUID',
  'Rows',
  'Columns',
  'BitsAllocated',
  'PixelRepresentation',
  'SamplesPerPixel',
  'PhotometricInterpretation'
];

/**
 * Check a list of input tags against a required list.
 *
 * @param {Record<string, SimpleTagValue>} tags The tags to check.
 * @param {string[]} requiredTags Array of tag names.
 * @param {boolean} withLog Flag to log errors or not.
 * @returns {boolean} True if all required tags are present in the input.
 */
export function checkTags(tags, requiredTags, withLog) {
  if (typeof withLog === 'undefined') {
    withLog = false;
  }
  let check = true;
  for (let i = 0; i < requiredTags.length; ++i) {
    if (typeof tags[requiredTags[i]] === 'undefined') {
      if (withLog) {
        console.log(`Missing ${
          requiredTags[i] } for pixel generation.`);
      }
      check = false;
      break;
    }
  }
  return check;
}

/**
 * Get the DICOM pixel data from a DICOM tags object.
 *
 * @param {Record<string, SimpleTagValue>} tags The DICOM tags object.
 * @param {GenerateOptions} [genOptions] The options for pixel generation.
 * @returns {DataElement} The DICOM pixel data element.
 */
export function generatePixelDataFromJSONTags(
  tags, genOptions) {
  if (typeof genOptions === 'undefined') {
    genOptions = {};
  }
  // defaults
  if (typeof genOptions.pixelGeneratorName === 'undefined') {
    if (tags.Modality === 'SEG') {
      // simple binary generator
      genOptions.pixelGeneratorName = 'binary';
    } else {
      // grad square generator
      genOptions.pixelGeneratorName = 'string';
    }
  }
  if (typeof genOptions.sliceNumber === 'undefined') {
    genOptions.sliceNumber = 0;
  }
  if (typeof genOptions.numberOfSlices === 'undefined') {
    genOptions.numberOfSlices = 1;
  }
  if (typeof genOptions.modality === 'undefined') {
    genOptions.modality = tags.Modality;
  }

  // check tags
  if (!checkTags(tags, _requiredPixelTags, true)) {
    throw new Error('Missing meta data for dicom creation.');
  }

  // extract info from tags
  const numberOfRows = tags.Rows;
  const numberOfColumns = tags.Columns;
  let numberOfFrames = 1;
  if (typeof tags.NumberOfFrames !== 'undefined') {
    numberOfFrames = tags.NumberOfFrames;
  }
  const bitsAllocated = tags.BitsAllocated;
  const pixelRepresentation = tags.PixelRepresentation;
  const samplesPerPixel = tags.SamplesPerPixel;
  // trim in case config contains padding
  const photometricInterpretation = tags.PhotometricInterpretation.trim();

  const sliceLength = numberOfRows * numberOfColumns;
  const dataLength = sliceLength * numberOfFrames * samplesPerPixel;

  // check values
  if (samplesPerPixel !== 1 && samplesPerPixel !== 3) {
    throw new Error(
      `Unsupported SamplesPerPixel for pixel generation: ${
        samplesPerPixel }`);
  }
  if ((samplesPerPixel === 1 && !(photometricInterpretation === 'MONOCHROME1' ||
    photometricInterpretation === 'MONOCHROME2')) ||
    (samplesPerPixel === 3 && photometricInterpretation !== 'RGB')) {
    throw new Error(
      `Unsupported PhotometricInterpretation for pixel generation: ${
        photometricInterpretation } with SamplesPerPixel: ${samplesPerPixel}`);
  }

  let numberOfSamples = 1;
  let numberOfColourPlanes = 1;
  if (samplesPerPixel === 3) {
    if (typeof tags.PlanarConfiguration === 'undefined') {
      throw new Error('Missing PlanarConfiguration for pixel generation.');
    }
    const planarConfiguration = tags.PlanarConfiguration;
    if (planarConfiguration !== 0 && planarConfiguration !== 1) {
      throw new Error(
        `Unsupported PlanarConfiguration for pixel generation: ${
          planarConfiguration }`);
    }
    if (planarConfiguration === 0) {
      numberOfSamples = 3;
    } else {
      numberOfColourPlanes = 3;
    }
  }

  // create pixel array
  const pixels = getTypedArray(
    bitsAllocated, pixelRepresentation, dataLength);

  // pixels generator
  if (typeof _pixelGenerators[genOptions.pixelGeneratorName] === 'undefined') {
    throw new Error(
      `Unknown PixelData generator: ${genOptions.pixelGeneratorName}`
    );
  }
  const GeneratorClass =
    _pixelGenerators[genOptions.pixelGeneratorName].generator;
  const generator = new GeneratorClass({
    numberOfColumns,
    numberOfRows,
    numberOfSlices: genOptions.numberOfSlices,
    numberOfFrames,
    numberOfSamples,
    numberOfColourPlanes,
    photometricInterpretation,
    imageOrientationPatient: tags.ImageOrientationPatient,
    segmentSquares: genOptions.segmentSquares,
    modality: genOptions.modality,
    frames3D: genOptions.frames3D
  });
  if (typeof generator.setImages !== 'undefined' &&
    typeof genOptions.images !== 'undefined') {
    generator.setImages(genOptions.images);
  }
  if (typeof generator.setNumberOfSlices !== 'undefined') {
    generator.setNumberOfSlices(genOptions.numberOfSlices);
  }
  generator.generate(
    pixels,
    genOptions.sliceNumber,
    genOptions.frameNumber
  );

  // create and return the DICOM element
  let vr = 'OW';
  if (bitsAllocated === 8) {
    vr = 'OB';
  }
  const pixVL = pixels.BYTES_PER_ELEMENT * dataLength;
  return {
    tag: getPixelDataTag(),
    vr,
    vl: pixVL,
    value: pixels
  };
};

/**
 * Extract the image data from an image.
 *
 * @param {Image} image The image to get the data from.
 * @returns {object} The image data buffer.
 */
export function getImageDataData(image) {
  // draw the image in the canvas in order to get its data
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  // get the image data
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  // data.data
  return imageData.data;
};

/**
 * Is an input modality an image modality.
 *
 * @param {string} modality The data modality
 * @returns {boolean} True if image type.
 */
export function isImageModality(modality) {
  let res = false;
  if (typeof modality !== 'undefined') {
    res = modality !== 'KO' && modality !== 'RTSTRUCT';
  }
  return res;
}

/**
 * Is an input modality a multi slice image modality.
 *
 * @param {string} modality The data modality
 * @returns {boolean} True if multi-slice type.
 */
export function isMultiSliceModality(modality) {
  let res = false;
  if (typeof modality !== 'undefined') {
    res = isImageModality(modality) && modality !== 'SEG';
  }
  return res;
}

/**
 * Generate dicom elements.
 *
 * @param {Record<string, SimpleTagValue>} tags The tags.
 * @param {GenerateOptions} [genOptions] The options for pixel generation.
 * @returns {Record<string, DataElement>} The data elements.
 */
function generateSingleFileDataElements(tags, genOptions) {
  if (typeof genOptions === 'undefined') {
    genOptions = {};
  }
  if (typeof genOptions.sliceNumber === 'undefined') {
    genOptions.sliceNumber = 0;
  }

  // image position
  let sliceSpacing = 1;
  if (typeof tags.SpacingBetweenSlices !== 'undefined') {
    sliceSpacing = tags.SpacingBetweenSlices;
  } else if (typeof tags.PixelSpacing !== 'undefined') {
    // assume cubic pixels
    sliceSpacing = tags.PixelSpacing[0];
  }
  const orientationName =
    getOrientationName(tags.ImageOrientationPatient);

  const getIpp = function (sliceNumber) {
    let ipp;
    if (orientationName === Orientation.Axial) {
      ipp = [0, 0, sliceNumber * sliceSpacing];
    } else if (orientationName === Orientation.Coronal) {
      ipp = [0, sliceNumber * sliceSpacing, 0];
    } else if (orientationName === Orientation.Sagittal) {
      ipp = [sliceNumber * sliceSpacing, 0, 0];
    }
    return ipp;
  };

  if (genOptions.frames3D) {
    // store in func groups
    const pixMesSq = {
      value: [{
        PixelSpacing: tags.PixelSpacing,
        SpacingBetweenSlices: sliceSpacing
      }]
    };
    const orientSq = {
      value: [{
        ImageOrientationPatient: tags.ImageOrientationPatient
      }]
    };
    tags.SharedFunctionalGroupsSequence = {
      value: [{
        PixelMeasuresSequence: pixMesSq,
        PlaneOrientationSequence: orientSq
      }]
    };

    const perFrameValues = [];
    for (let k = 0; k < tags.NumberOfFrames; ++k) {
      perFrameValues.push({
        FrameContentSequence: {
          value: [{
            DimensionIndexValues: [1, k, 1]
          }]
        },
        PlanePositionSequence: {
          value: [{
            ImagePositionPatient: getIpp(k)
          }]
        }
      });
    }
    tags.PerFrameFunctionalGroupsSequence = {
      value: perFrameValues
    };

  } else {
    tags.ImagePositionPatient = getIpp(genOptions.sliceNumber);
    if (typeof genOptions.frameNumber !== 'undefined' &&
      typeof genOptions.numberOfFrames !== 'undefined' &&
      genOptions.numberOfFrames > 1
    ) {
      tags.TemporalPositionIdentifier = genOptions.frameNumber;
    }
  }

  if (typeof genOptions.numberOfSlices !== 'undefined' &&
    genOptions.numberOfSlices > 1) {
    tags.SOPInstanceUID = `${tags.SOPInstanceUID}.${genOptions.sliceNumber}`;
  }
  // instance number
  tags.InstanceNumber = genOptions.sliceNumber.toString();

  // convert JSON to DICOM element object
  const dicomElements = getElementsFromSimpleTagValues(tags);
  // pixels
  if (isImageModality(tags.Modality)) {
    dicomElements['7FE00010'] = generatePixelDataFromJSONTags(tags, genOptions);
  }

  return dicomElements;
}

/**
 * Generate dicom data elements.
 *
 * @param {Record<string, SimpleTagValue>} tags The tags.
 * @param {GenerateOptions} [genOptions] The options for pixel generation.
 * @returns {Record<string, DataElement>[]} The list of data elements.
 */
export function generateDataElements(tags, genOptions) {
  if (typeof genOptions === 'undefined') {
    genOptions = {};
  }
  let numberOfSlices = 1;
  if (typeof genOptions.numberOfSlices !== 'undefined') {
    numberOfSlices = genOptions.numberOfSlices;
  }
  let numberOfFrames = 1;
  if (typeof genOptions.numberOfFrames !== 'undefined') {
    numberOfFrames = genOptions.numberOfFrames;
  }
  const daList = [];
  for (let f = 0; f < numberOfFrames; ++f) {
    genOptions.frameNumber = f;
    for (let k = 0; k < numberOfSlices; ++k) {
      genOptions.sliceNumber = k;
      const da = generateSingleFileDataElements(tags, genOptions);
      daList.push(da);
    }
  }
  return daList;
}

/**
 * Generate one slice buffer.
 *
 * @param {Record<string, DataElement>} dataElements The data elements.
 * @param {WriterOptions} [writerOptions] The options for dicom write.
 * @returns {ArrayBuffer} A buffer with the slice DICOM data.
 */
function generateSliceBuffer(
  dataElements, writerOptions) {
  // create writer
  const writer = new DicomWriter();
  if (typeof writerOptions !== 'undefined') {
    if (typeof writerOptions.useUnVrForPrivateSq !== 'undefined') {
      writer.setUseUnVrForPrivateSq(writerOptions.useUnVrForPrivateSq);
    }
    if (typeof writerOptions.writerRules !== 'undefined') {
      writer.setRules(writerOptions.writerRules, writerOptions.addMissingTags);
    }
  }
  return writer.getBuffer(dataElements);
}

/**
 * Generate multiple slice buffer.
 *
 * @param {Record<string, DataElement>} dataElementsList The list
 *   of data elements.
 * @param {WriterOptions} [writerOptions] The options for dicom write.
 * @returns {ArrayBuffer[]} An array of buffers with the slice DICOM data.
 */
export function generateSliceBuffers(
  dataElementsList, writerOptions) {
  const buffers = [];
  for (const da of dataElementsList) {
    buffers.push(generateSliceBuffer(da, writerOptions));
  }
  return buffers;
}

/**
 * Generate multipe slices and create zip.
 *
 * @param {ArrayBuffer[]} buffers The dicom buffers.
 * @param {Function} zipCallback Callback once zip is ready.
 */
export function zipBuffers(
  buffers,
  zipCallback) {
  const zip = new JSZip();
  // generate slices
  for (let k = 0; k < buffers.length; ++k) {
    const blob = new Blob([buffers[k]], {type: 'application/dicom'});
    zip.file(`dwv-generated-slice${k}.dcm`, blob);
  }
  // finish
  zip.generateAsync({type: 'blob'}).then(zipCallback);
}

/**
 * Add dates to input tags.
 *
 * @param {Record<string, SimpleTagValue>} tags The tags.
 */
export function addDates(tags) {
  // set study date
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const timeStr = now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');

  // study
  if (typeof tags.StudyDate === 'undefined') {
    tags.StudyDate = dateStr;
  }
  if (typeof tags.StudyTime === 'undefined') {
    tags.StudyTime = timeStr;
  }

  // study
  if (typeof tags.SeriesDate === 'undefined') {
    tags.SeriesDate = dateStr;
  }
  if (typeof tags.SeriesTime === 'undefined') {
    tags.SeriesTime = timeStr;
  }
}