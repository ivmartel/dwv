
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

import JSZip from 'jszip';

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
  square: {generator: SquarePixGenerator}
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
 * @param {object} tags The tags to check.
 * @param {Array} requiredTags Array of tag names.
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
 * @param {object} tags The DICOM tags object.
 * @param {GenerateOptions} [genOptions] The options for pixel generation.
 * @returns {object} The DICOM pixel data element.
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
      genOptions.pixelGeneratorName = 'gradSquare';
    }
  }
  if (typeof genOptions.sliceNumber === 'undefined') {
    genOptions.sliceNumber = 0;
  }
  if (typeof genOptions.numberOfSlices === 'undefined') {
    genOptions.numberOfSlices = 1;
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
    segmentSquares: genOptions.segmentSquares
  });
  if (typeof generator.setImages !== 'undefined' &&
    typeof genOptions.images !== 'undefined') {
    generator.setImages(genOptions.images);
  }
  if (typeof generator.setNumberOfSlices !== 'undefined') {
    generator.setNumberOfSlices(genOptions.numberOfSlices);
  }
  generator.generate(pixels, genOptions.sliceNumber);

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
 * Generate dicom elements.
 *
 * @param {object} tags The tags.
 * @param {GenerateOptions} [genOptions] The options for pixel generation.
 * @returns {dicomElements} The dicom elements.
 */
export function generateDicomElements(tags, genOptions) {
  if (typeof genOptions === 'undefined') {
    genOptions = {};
  }
  if (typeof genOptions.sliceNumber === 'undefined') {
    genOptions.sliceNumber = 0;
  }

  // image position
  let sliceSpacing = 1;
  if (typeof tags.SliceThickness !== 'undefined') {
    sliceSpacing = tags.SliceThickness;
  } else if (typeof tags.PixelSpacing !== 'undefined') {
    sliceSpacing = tags.PixelSpacing[0];
  }
  const orientationName =
    getOrientationName(tags.ImageOrientationPatient);
  if (orientationName === Orientation.Axial) {
    tags.ImagePositionPatient = [0, 0, genOptions.sliceNumber * sliceSpacing];
  } else if (orientationName === Orientation.Coronal) {
    tags.ImagePositionPatient = [0, genOptions.sliceNumber * sliceSpacing, 0];
  } else if (orientationName === Orientation.Sagittal) {
    tags.ImagePositionPatient = [genOptions.sliceNumber * sliceSpacing, 0, 0];
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
  const isImageModality = tags.Modality !== 'KO' &&
    tags.Modality !== 'RTSTRUCT';
  if (isImageModality) {
    dicomElements['7FE00010'] = generatePixelDataFromJSONTags(tags, genOptions);
  }

  return dicomElements;
}

/**
 * Generate one slice buffer.
 *
 * @param {object} tags The tags.
 * @param {GenerateOptions} [genOptions] The options for pixel generation.
 * @param {WriterOptions} [writerOptions] The options for dicom write.
 * @returns {ArrayBuffer} A buffer with the slice DICOM data.
 */
export function generateSliceBuffer(
  tags, genOptions, writerOptions) {
  // generate elements
  const dicomElements = generateDicomElements(tags, genOptions);
  // create writer
  const writer = new DicomWriter();
  if (typeof writerOptions.useUnVrForPrivateSq !== 'undefined') {
    writer.setUseUnVrForPrivateSq(writerOptions.useUnVrForPrivateSq);
  }
  if (typeof writerOptions.writerRules !== 'undefined') {
    writer.setRules(writerOptions.writerRules, writerOptions.addMissingTags);
  }
  return writer.getBuffer(dicomElements);
}

/**
 * Generate multipe slices and create zip.
 *
 * @param {object} tags The tags.
 * @param {Function} zipCallback Callback once zip is ready.
 * @param {GenerateOptions} [genOptions] The options for pixel generation.
 */
export function generateSlicesZip(
  tags,
  zipCallback,
  genOptions) {
  if (typeof genOptions === 'undefined') {
    genOptions = {};
  }
  if (typeof genOptions.numberOfSlices === 'undefined') {
    genOptions.numberOfSlices = 1;
  }

  const zip = new JSZip();
  // generate slices
  for (let k = 0; k < genOptions.numberOfSlices; ++k) {
    genOptions.sliceNumber = k;
    const buffer = generateSliceBuffer(tags, genOptions);
    const blob = new Blob([buffer], {type: 'application/dicom'});
    zip.file(`dwv-generated-slice${k}.dcm`, blob);
  }
  // finish
  zip.generateAsync({type: 'blob'}).then(zipCallback);
}
/**
 * Add dates to input tags.
 *
 * @param {object} tags The tags.
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