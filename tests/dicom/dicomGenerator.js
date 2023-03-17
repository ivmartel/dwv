import {logger} from '../../src/utils/logger';
import {getTypedArray} from '../../src/dicom/dicomParser';
import {getPixelDataTag} from '../../src/dicom/dicomTag';
import {FilePixGenerator} from './filePixGenerator';
import {GradSquarePixGenerator} from './gradSquarePixGenerator';
import {MPRPixGenerator} from './mprPixGenerator';

// List of required tags for generating pixel data
export const RequiredPixelTags = [
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
  var check = true;
  for (var i = 0; i < requiredTags.length; ++i) {
    if (typeof tags[requiredTags[i]] === 'undefined') {
      if (withLog) {
        logger.debug('Missing ' +
          requiredTags[i] + ' for pixel generation.');
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
 * @param {string} pixGeneratorName The name of a pixel generator.
 * @param {number} sliceNumber The slice number.
 * @param {Array} images The images to pass to the generator.
 * @param {number} numberOfSlices The result number of slices.
 * @returns {object} The DICOM pixel data element.
 */
export function generatePixelDataFromJSONTags(
  tags, pixGeneratorName, sliceNumber, images, numberOfSlices) {

  // default
  if (typeof pixGeneratorName === 'undefined') {
    pixGeneratorName = 'gradSquare';
  }
  if (typeof sliceNumber === 'undefined') {
    sliceNumber = 0;
  }
  if (typeof numberOfSlices === 'undefined') {
    numberOfSlices = 1;
  }

  // check tags
  if (!checkTags(tags, RequiredPixelTags, true)) {
    throw new Error('Missing meta data for dicom creation.');
  }

  // extract info from tags
  var numberOfRows = tags.Rows;
  var numberOfColumns = tags.Columns;
  var bitsAllocated = tags.BitsAllocated;
  var pixelRepresentation = tags.PixelRepresentation;
  var samplesPerPixel = tags.SamplesPerPixel;
  // trim in case config contains padding
  var photometricInterpretation = tags.PhotometricInterpretation.trim();

  var sliceLength = numberOfRows * numberOfColumns;
  var dataLength = sliceLength * samplesPerPixel;

  // check values
  if (samplesPerPixel !== 1 && samplesPerPixel !== 3) {
    throw new Error(
      'Unsupported SamplesPerPixel for pixel generation: ' +
      samplesPerPixel);
  }
  if ((samplesPerPixel === 1 && !(photometricInterpretation === 'MONOCHROME1' ||
        photometricInterpretation === 'MONOCHROME2')) ||
        (samplesPerPixel === 3 && photometricInterpretation !== 'RGB')) {
    throw new Error(
      'Unsupported PhotometricInterpretation for pixel generation: ' +
      photometricInterpretation + ' with SamplesPerPixel: ' + samplesPerPixel);
  }

  var numberOfSamples = 1;
  var numberOfColourPlanes = 1;
  if (samplesPerPixel === 3) {
    if (typeof tags.PlanarConfiguration === 'undefined') {
      throw new Error('Missing PlanarConfiguration for pixel generation.');
    }
    var planarConfiguration = tags.PlanarConfiguration;
    if (planarConfiguration !== 0 && planarConfiguration !== 1) {
      throw new Error(
        'Unsupported PlanarConfiguration for pixel generation: ' +
        planarConfiguration);
    }
    if (planarConfiguration === 0) {
      numberOfSamples = 3;
    } else {
      numberOfColourPlanes = 3;
    }
  }

  // create pixel array
  var pixels = getTypedArray(
    bitsAllocated, pixelRepresentation, dataLength);

  // pixels generator
  var pixelGenerators = {
    file: FilePixGenerator,
    gradSquare: GradSquarePixGenerator,
    mpr: MPRPixGenerator
  };
  if (typeof pixelGenerators[pixGeneratorName] === 'undefined') {
    throw new Error('Unknown PixelData generator: ' + pixGeneratorName);
  }
  var GeneratorClass = pixelGenerators[pixGeneratorName];
  var generator = new GeneratorClass({
    numberOfColumns: numberOfColumns,
    numberOfRows: numberOfRows,
    numberOfSamples: numberOfSamples,
    numberOfColourPlanes: numberOfColourPlanes,
    photometricInterpretation: photometricInterpretation,
    imageOrientationPatient: tags.ImageOrientationPatient
  });
  if (typeof generator.setImages !== 'undefined') {
    generator.setImages(images);
  }
  if (typeof generator.setNumberOfSlices !== 'undefined') {
    generator.setNumberOfSlices(numberOfSlices);
  }
  generator.generate(pixels, sliceNumber);

  // create and return the DICOM element
  var vr = 'OW';
  if (bitsAllocated === 8) {
    vr = 'OB';
  }
  var pixVL = pixels.BYTES_PER_ELEMENT * dataLength;
  return {
    tag: getPixelDataTag(),
    vr: vr,
    vl: pixVL,
    value: pixels
  };
}

/**
 * Extract the image data from an image.
 *
 * @param {Image} image The image to get the data from.
 * @returns {object} The image data buffer.
 */
export function getImageDataData(image) {
  // draw the image in the canvas in order to get its data
  var canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  // get the image data
  var imageData = ctx.getImageData(0, 0, image.width, image.height);
  // data.data
  return imageData.data;
}
