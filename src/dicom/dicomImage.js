import {custom} from '../app/custom.js';
import {
  isJpeg2000TransferSyntax,
  isJpegBaselineTransferSyntax,
  isJpegLosslessTransferSyntax
} from './dicomParser.js';
import {safeGet, safeGetAll} from './dataElement.js';
import {getOrientationFromCosines} from '../math/orientation.js';
import {Spacing} from '../image/spacing.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Matrix33} from '../math/matrix.js';
import {DataElement} from './dataElement.js';
/* eslint-enable no-unused-vars */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  TransferSyntax: '00020010',
  SOPClassUID: '00080016',
  Modality: '00080060',
  Rows: '00280010',
  Columns: '00280011',
  PixelSpacing: '00280030',
  ImagerPixelSpacing: '00181164',
  NominalScannedPixelSpacing: '00182010',
  PixelAspectRatio: '00280034',
  SpacingBetweenSlices: '00180088',
  RescaleType: '00281054',
  Units: '00541001',
  ImageOrientationPatient: '00200037',
  PhotometricInterpretation: '00280004',
  SamplesPerPixel: '00280002'
};

/**
 * Extract the 2D size from dicom elements.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {number[]|undefined} The sizes as [columns, rows] or
 *   undefined if not present.
 */
export function getImage2DSize(elements) {
  let res;
  const rows = safeGet(elements, TagKeys.Rows);
  const columns = safeGet(elements, TagKeys.Columns);
  if (typeof rows !== 'undefined' &&
    typeof columns !== 'undefined') {
    res = [columns, rows];
  }
  return res;
}

/**
 * Get the pixel spacing from the different spacing tags.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {number[]|undefined} The spacing as [columnSapcing, rowSpacing] or
 *   undefined if not present.
 */
export function getPixelSpacing(elements) {
  let res;

  const tags = [
    'PixelSpacing',
    'ImagerPixelSpacing',
    'NominalScannedPixelSpacing',
    'PixelAspectRatio'
  ];
  for (const tag of tags) {
    const spacing = safeGetAll(elements, TagKeys[tag]);
    if (typeof spacing !== 'undefined' &&
      spacing.length === 2) {
      // dicom spacing order: [row, column]
      res = [
        parseFloat(spacing[1]),
        parseFloat(spacing[0])
      ];
      break;
    }
  }

  return res;
}

/**
 * Get a spacing object from a dicom measure element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {Spacing|undefined} A spacing object.
 */
export function getSpacingFromMeasure(dataElements) {
  // Pixel Spacing
  const pixelSpacing = safeGetAll(dataElements, TagKeys.PixelSpacing);
  if (typeof pixelSpacing === 'undefined' ||
    pixelSpacing.length !== 2
  ) {
    return undefined;
  }
  // spacing order: [row, column]
  const spacingValues = [
    parseFloat(pixelSpacing[1]),
    parseFloat(pixelSpacing[0]),
  ];
  // Spacing Between Slices
  const sbs = safeGet(dataElements, TagKeys.SpacingBetweenSlices);
  if (typeof sbs !== 'undefined') {
    spacingValues.push(parseFloat(sbs));
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
  const tags = ['RescaleType', 'Units'];
  for (const tag of tags) {
    const unit = safeGet(elements, TagKeys[tag]);
    if (typeof unit !== 'undefined') {
      break;
    }
  }
  // default rescale type for CT
  if (typeof unit === 'undefined') {
    const modality = safeGet(elements, TagKeys.Modality);
    if (typeof modality !== 'undefined' && modality === 'CT') {
      unit = 'HU';
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
  const imageOrientationPatient =
    safeGetAll(dataElements, TagKeys.ImageOrientationPatient);
  let orientationMatrix;
  // slice orientation (cosines are matrices' columns)
  // http://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.7.6.2.html#sect_C.7.6.2.1.1
  if (typeof imageOrientationPatient !== 'undefined') {
    orientationMatrix =
      getOrientationFromCosines(
        imageOrientationPatient.map((item) => parseFloat(item))
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
  const photometricInterpretation =
    safeGet(dataElements, TagKeys.PhotometricInterpretation);
  const transferSyntax = safeGet(dataElements, TagKeys.TransferSyntax);

  if (typeof photometricInterpretation !== 'undefined' &&
    typeof transferSyntax !== 'undefined') {
    let photo = photometricInterpretation.toUpperCase();
    // TransferSyntaxUID
    const isJpeg = isJpeg2000TransferSyntax(transferSyntax) ||
      isJpegBaselineTransferSyntax(transferSyntax) ||
      isJpegLosslessTransferSyntax(transferSyntax);
    // jpeg decoders output RGB data
    if (isJpeg && !isMonochrome(photo)) {
      photo = 'RGB';
    }
    // samplesPerPixel
    let samplesPerPixel = safeGet(dataElements, TagKeys.SamplesPerPixel);
    if (typeof samplesPerPixel === 'undefined') {
      samplesPerPixel = 1;
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
 * Check if the received string represents a secondary capture.
 *
 * @param {string} SOPClassUID The sop class uid.
 * @returns {boolean} True if it is secondary capture.
 */
export function isSecondatyCapture(SOPClassUID) {
  const pattern = /^1\.2\.840\.10008\.5\.1\.4\.1\.1\.7/;
  return typeof SOPClassUID !== 'undefined' &&
    pattern.test(SOPClassUID);
}
