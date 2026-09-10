
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
 * @param {object} [options] The options for pixel generation.
 * @param {string} [options.pixelGeneratorName] The name of the pixel generator
 *   to use, defaults to gradSquare.
 * @param {number} [options.sliceNumber] The slice number,
 *   default to 0.
 * @param {Array} [options.images] The images to pass to the generator.
 * @param {number} [options.numberOfSlices] The result number of slices,
 *   default to 1.
 * @returns {object} The DICOM pixel data element.
 */
export function generatePixelDataFromJSONTags(
  tags, options) {
  if (typeof options === 'undefined') {
    options = {};
  }
  // default
  if (typeof options.pixelGeneratorName === 'undefined') {
    options.pixelGeneratorName = 'gradSquare';
  }
  if (typeof options.sliceNumber === 'undefined') {
    options.sliceNumber = 0;
  }
  if (typeof options.numberOfSlices === 'undefined') {
    options.numberOfSlices = 1;
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
  if (typeof _pixelGenerators[options.pixelGeneratorName] === 'undefined') {
    throw new Error(
      `Unknown PixelData generator: ${options.pixelGeneratorName}`
    );
  }
  const GeneratorClass = _pixelGenerators[options.pixelGeneratorName].generator;
  const generator = new GeneratorClass({
    numberOfColumns,
    numberOfRows,
    numberOfSlices: options.numberOfSlices,
    numberOfFrames,
    numberOfSamples,
    numberOfColourPlanes,
    photometricInterpretation,
    imageOrientationPatient: tags.ImageOrientationPatient,
    segmentSquares: options.segmentSquares
  });
  if (typeof generator.setImages !== 'undefined' &&
    typeof options.images !== 'undefined') {
    generator.setImages(options.images);
  }
  if (typeof generator.setNumberOfSlices !== 'undefined') {
    generator.setNumberOfSlices(options.numberOfSlices);
  }
  generator.generate(pixels, options.sliceNumber);

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
 *
 * @param {object} tags The tags.
 * @param {string} pixelGeneratorName The name of the pixel generator.
 * @param {number} numberOfSlices The number of slices.
 * @param {number} sliceNumber The slice to generate.
 * @param {any} images Images to use as pixel data.
 * @returns {dicomElements} The dicom elements.
 */
export function generateDicomElements(
  tags,
  pixelGeneratorName,
  numberOfSlices,
  sliceNumber,
  images
) {
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
    tags.ImagePositionPatient = [0, 0, sliceNumber * sliceSpacing];
  } else if (orientationName === Orientation.Coronal) {
    tags.ImagePositionPatient = [0, sliceNumber * sliceSpacing, 0];
  } else if (orientationName === Orientation.Sagittal) {
    tags.ImagePositionPatient = [sliceNumber * sliceSpacing, 0, 0];
  }
  // instance number
  tags.SOPInstanceUID = `${tags.SOPInstanceUID}.${sliceNumber}`;
  tags.InstanceNumber = sliceNumber.toString();
  // convert JSON to DICOM element object
  const dicomElements = getElementsFromSimpleTagValues(tags);
  // pixels
  dicomElements['7FE00010'] = generatePixelDataFromJSONTags(
    tags, {
      pixelGeneratorName,
      sliceNumber,
      images,
      numberOfSlices
    }
  );
  return dicomElements;
}

/**
 *
 * @param {object} tags The tags.
 * @param {string} pixelGeneratorName The name of the pixel generator.
 * @param {number} numberOfSlices The number of slices.
 * @param {number} sliceNumber The slice to generate.
 * @param {any} images Images to use as pixel data.
 * @returns {Blob} A blob with the slice DICOM data.
 */
export function generateSlice(
  tags,
  pixelGeneratorName,
  numberOfSlices,
  sliceNumber,
  images) {
  const dicomElements = generateDicomElements(
    tags,
    pixelGeneratorName,
    numberOfSlices,
    sliceNumber,
    images
  );

  // create writer
  const writer = new DicomWriter();
  const dicomBuffer = writer.getBuffer(dicomElements);

  // view as Blob to allow download
  return new Blob([dicomBuffer], {type: 'application/dicom'});
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