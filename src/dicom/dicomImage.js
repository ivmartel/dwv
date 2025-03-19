import {custom} from '../app/custom';
import {
  isJpeg2000TransferSyntax,
  isJpegBaselineTransferSyntax,
  isJpegLosslessTransferSyntax
} from './dicomParser';
import {getOrientationFromCosines} from '../math/orientation';
import {Spacing} from '../image/spacing';
import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {Matrix33} from '../math/matrix';
import {DataElement} from './dataElement';
/* eslint-enable no-unused-vars */

/**
 * Extract the 2D size from dicom elements.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {number[]} The size.
 */
export function getImage2DSize(elements) {
  // rows
  const rows = elements['00280010'];
  if (typeof rows === 'undefined') {
    throw new Error('Missing DICOM image number of rows');
  }
  if (rows.value.length === 0) {
    throw new Error('Empty DICOM image number of rows');
  }
  // columns
  const columns = elements['00280011'];
  if (typeof columns === 'undefined') {
    throw new Error('Missing DICOM image number of columns');
  }
  if (columns.value.length === 0) {
    throw new Error('Empty DICOM image number of columns');
  }
  return [columns.value[0], rows.value[0]];
}

/**
 * Get the pixel spacing from the different spacing tags.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {Spacing} The read spacing or the default [1,1].
 */
export function getPixelSpacing(elements) {
  let rowSpacing;
  let columnSpacing;

  // 1. PixelSpacing
  // 2. ImagerPixelSpacing
  // 3. NominalScannedPixelSpacing
  // 4. PixelAspectRatio
  const keys = ['00280030', '00181164', '00182010', '00280034'];
  for (let k = 0; k < keys.length; ++k) {
    const spacing = elements[keys[k]];
    if (spacing && spacing.value.length === 2) {
      // spacing order: [row, column]
      rowSpacing = parseFloat(spacing.value[0]);
      columnSpacing = parseFloat(spacing.value[1]);
      break;
    }
  }

  // check
  if (typeof rowSpacing === 'undefined') {
    logger.warn('Undefined row spacing, using default (1mm).');
    rowSpacing = 1;
  } else if (rowSpacing === 0) {
    logger.warn('Zero row spacing, using default (1mm).');
    rowSpacing = 1;
  }
  if (typeof columnSpacing === 'undefined') {
    logger.warn('Undefined column spacing, using default (1mm).');
    columnSpacing = 1;
  } else if (columnSpacing === 0) {
    logger.warn('Zero column spacing, using default (1mm).');
    columnSpacing = 1;
  }

  // return
  // (slice spacing will be calculated using the image position patient)
  return new Spacing([columnSpacing, rowSpacing, 1]);
}

/**
 * Get a spacing object from a dicom measure element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {Spacing} A spacing object.
 */
export function getSpacingFromMeasure(dataElements) {
  // Pixel Spacing
  if (typeof dataElements['00280030'] === 'undefined') {
    return null;
  }
  const pixelSpacing = dataElements['00280030'];
  // spacing order: [row, column]
  const spacingValues = [
    parseFloat(pixelSpacing.value[1]),
    parseFloat(pixelSpacing.value[0]),
  ];
  // Spacing Between Slices
  if (typeof dataElements['00180088'] !== 'undefined') {
    spacingValues.push(parseFloat(dataElements['00180088'].value[0]));
  }
  return new Spacing(spacingValues);
}

/**
 * Get pixel data unit from a list of tags.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {string|undefined} The unit value if available.
 */
export function getTagPixelUnit(elements) {
  if (typeof custom.getTagPixelUnit !== 'undefined') {
    return custom.getTagPixelUnit(elements);
  } else {
    return defaultGetTagPixelUnit(elements);
  }
}

/**
 * Default get pixel data unit.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {string|undefined} The unit value if available.
 */
function defaultGetTagPixelUnit(elements) {
  let unit;
  // 1. RescaleType
  // 2. Units (for PET)
  const keys = ['00281054', '00541001'];
  for (let i = 0; i < keys.length; ++i) {
    const element = elements[keys[i]];
    if (typeof element !== 'undefined') {
      unit = element.value[0];
      break;
    }
  }
  // default rescale type for CT
  if (typeof unit === 'undefined') {
    const element = elements['00080060'];
    if (typeof element !== 'undefined') {
      const modality = element.value[0];
      if (modality === 'CT') {
        unit = 'HU';
      }
    }
  }
  return unit;
}

/**
 * Get an orientation matrix from a dicom orientation element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {Matrix33|undefined} The orientation matrix.
 */
export function getOrientationMatrix(dataElements) {
  const imageOrientationPatient = dataElements['00200037'];
  let orientationMatrix;
  // slice orientation (cosines are matrices' columns)
  // http://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.7.6.2.html#sect_C.7.6.2.1.1
  if (typeof imageOrientationPatient !== 'undefined') {
    orientationMatrix =
      getOrientationFromCosines(
        imageOrientationPatient.value.map((item) => parseFloat(item))
      );
  }
  return orientationMatrix;
}

/**
 * Get a dicom item from a measure sequence.
 *
 * @param {Spacing} spacing The spacing object.
 * @returns {object} The dicom item.
 */
export function getDicomMeasureItem(spacing) {
  return {
    SpacingBetweenSlices: spacing.get(2),
    PixelSpacing: [spacing.get(1), spacing.get(0)]
  };
}

/**
 * Get a dicom element from a plane orientation sequence.
 *
 * @param {Matrix33} orientation The image orientation.
 * @returns {object} The dicom element.
 */
export function getDicomPlaneOrientationItem(orientation) {
  return {
    ImageOrientationPatient: [
      orientation.get(0, 0),
      orientation.get(1, 0),
      orientation.get(2, 0),
      orientation.get(0, 1),
      orientation.get(1, 1),
      orientation.get(2, 1)
    ]
  };
}

/**
 * Get the photometric interpretation from the data elements.
 *
 * @param {Object<string, DataElement>} dataElements The data elements.
 * @returns {string|undefined} The photometric interpretation value.
 */
export function getPhotometricInterpretation(dataElements) {
  const photometricInterpretation = dataElements['00280004'];
  const syntaxElement = dataElements['00020010'];
  const spp = dataElements['00280002'];
  // samplesPerPixel
  let samplesPerPixel = 1;
  if (typeof spp !== 'undefined') {
    samplesPerPixel = spp.value[0];
  }

  if (typeof photometricInterpretation !== 'undefined' &&
  typeof syntaxElement !== 'undefined') {
    let photo = photometricInterpretation.value[0].toUpperCase();
    // TransferSyntaxUID
    const syntax = syntaxElement.value[0];
    const jpeg2000 = isJpeg2000TransferSyntax(syntax);
    const jpegBase = isJpegBaselineTransferSyntax(syntax);
    const jpegLoss = isJpegLosslessTransferSyntax(syntax);
    // jpeg decoders output RGB data
    if ((jpeg2000 || jpegBase || jpegLoss) &&
      (photo !== 'MONOCHROME1' && photo !== 'MONOCHROME2')) {
      photo = 'RGB';
    }
    // check samples per pixels
    if (photo === 'RGB' && samplesPerPixel === 1) {
      photo = 'PALETTE COLOR';
    }
    return photo;
  }
}

/**
 * Check if an input photometricInterpretation is monochrome.
 *
 * @param {string} photometricInterpretation The photometric interpretation.
 * @returns {boolean} True if the input string starts with 'MONOCHROME'.
 */
export function isMonochrome(photometricInterpretation) {
  return typeof photometricInterpretation !== 'undefined' &&
    photometricInterpretation.match(/MONOCHROME/) !== null;
}

/**
 * Gets the sop class uid from the data elements.
 *
 * @param {Object<string, DataElement>} dataElements The data elements. *.
 * @returns {string|undefined} The sop class uid value.
 */
export function getSopClassUid(dataElements) {
  const SOPClassUID = dataElements['00080016'];
  if (typeof SOPClassUID !== 'undefined') {
    return SOPClassUID.value[0];
  }
  return;
}

/**
 * Check if the received string represents a secondary capture.
 *
 * @param {string} SOPClassUID The sop class uid.
 * @returns {boolean} True if it is secondary capture.
 */
export function isSecondatyCapture(SOPClassUID) {
  const pattern = /^1\.2\.840\.10008\.5\.1\.4\.1\.1\.7/;
  return !SOPClassUID && pattern.test(SOPClassUID);
}
