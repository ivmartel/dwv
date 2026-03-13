import {custom} from '../app/custom.js';
import {
  isJpeg2000TransferSyntax,
  isJpegBaselineTransferSyntax,
  isJpegLosslessTransferSyntax
} from './dicomParser.js';
import {safeGet, safeGetAll} from './dataElement.js';
import {getOrientationFromCosines} from '../math/orientation.js';
import {Spacing} from '../image/spacing.js';
import {logger} from '../utils/logger.js';

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
  ReferencedSeriesSequence: '00081115',
  SeriesInstanceUID: '0020000E',
  Rows: '00280010',
  Columns: '00280011',
  PixelSpacing: '00280030',
  ImagerPixelSpacing: '00181164',
  NominalScannedPixelSpacing: '00182010',
  DistanceSourceToDetector: '00181110',
  DistanceSourceToPatient: '00181111',
  EstimatedRadiographicMagnificationFactor: '00181114',
  PixelAspectRatio: '00280034',
  SpacingBetweenSlices: '00180088',
  RescaleType: '00281054',
  Units: '00541001',
  ImageOrientationPatient: '00200037',
  PhotometricInterpretation: '00280004',
  SamplesPerPixel: '00280002',
  PixelMeasuresSequence: '00289110',
  SharedFunctionalGroupsSequence: '52009229',
  PerFrameFunctionalGroupsSequence: '52009230'
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
 * Get the 2D spacing values.
 *
 * @param {Object<string, DataElement>} elements The dicom element.
 * @param {string} tagKey The tag key.
 * @returns {number[]|undefined} The values if present.
 */
function get2DSpacingValues(elements, tagKey) {
  let res;
  const values = safeGetAll(elements, tagKey);
  if (typeof values !== 'undefined' &&
    values.length === 2) {
    // dicom spacing order: [row, column]
    res = [
      parseFloat(values[1]),
      parseFloat(values[0])
    ];
  }
  return res;
}

/**
 * Get the 2D spacing values from a functional group.
 *
 * @param {Object<string, DataElement>} funcGroupElements The dicom elements.
 * @returns {number[]|undefined} The values if present.
 */
function get2DSpacingValuesFromFuncGroup(funcGroupElements) {
  let res;
  // Pixel Measures Sequence
  const pixelMeasuresSeq =
    safeGetAll(funcGroupElements, TagKeys.PixelMeasuresSequence);
  if (typeof pixelMeasuresSeq !== 'undefined') {
    // should be only one
    res = get2DSpacingValues(pixelMeasuresSeq[0], TagKeys.PixelSpacing);
  }
  return res;
}

/**
 * Get the pixel spacing for projection data.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {number[]|undefined} The values if present.
 */
function getProjection2DSpacingValues(elements) {
  // ImagerPixelSpacing
  let res = get2DSpacingValues(elements, TagKeys.ImagerPixelSpacing);
  if (typeof res !== 'undefined') {
    let factor;
    const magnification = parseFloat(
      safeGet(elements, TagKeys.EstimatedRadiographicMagnificationFactor));
    if (!isNaN(magnification)) {
      factor = magnification;
    } else {
      const d0 = parseFloat(
        safeGet(elements, TagKeys.DistanceSourceToDetector));
      const d1 = parseFloat(
        safeGet(elements, TagKeys.DistanceSourceToPatient));
      if (!isNaN(d0) && !isNaN(d1) && d1 !== 0) {
        factor = d0 / d1;
      }
    }
    if (typeof factor !== 'undefined') {
      res = res.map((value) => value / factor);
      logger.warn('Got pixel spacing from corrected ImagerPixelSpacing tag');
    } else {
      logger.warn('Got pixel spacing from raw ImagerPixelSpacing tag');
    }
  }
  return res;
}

/**
 * Get the pixel spacing for secondary capture data.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {number[]|undefined} The values if present.
 */
function getSecondaryCapture2DSpacingValues(elements) {
  // NominalScannedPixelSpacing
  const res = get2DSpacingValues(elements, TagKeys.NominalScannedPixelSpacing);
  if (typeof res !== 'undefined') {
    logger.warn('Got pixel spacing from NominalScannedPixelSpacing tag');
  }
  return res;
}

/**
 * Get the pixel spacing for multi-frame data.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {number[]|undefined} The values if present.
 */
function getMultiFrame2DSpacingValues(elements) {
  let res;

  // SharedFunctionalGroupsSequence (multi-frame)
  const sharedFunctionalGroupsSeq =
    safeGetAll(elements, TagKeys.SharedFunctionalGroupsSequence);
  if (typeof sharedFunctionalGroupsSeq !== 'undefined') {
    // should be only one
    const funcGroup = sharedFunctionalGroupsSeq[0];
    res = get2DSpacingValuesFromFuncGroup(funcGroup);
  }

  // PerFrameFunctionalGroupsSequence (multi-frame)
  if (typeof res === 'undefined') {
    const perFrameFunctionalGroupsSeq =
      safeGetAll(elements, TagKeys.PerFrameFunctionalGroupsSequence);
    if (typeof perFrameFunctionalGroupsSeq !== 'undefined') {
      // take first one
      // TODO: use proper frame
      const funcGroup = perFrameFunctionalGroupsSeq[0];
      res = get2DSpacingValuesFromFuncGroup(funcGroup);
    }
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
  // main tag
  let res = get2DSpacingValues(elements, TagKeys.PixelSpacing);
  // projection related
  // TODO: use SOPClassUID filter?
  if (typeof res === 'undefined') {
    res = getProjection2DSpacingValues(elements);
  }
  // secondary capture (before multi-frame case)
  if (typeof res === 'undefined') {
    res = getSecondaryCapture2DSpacingValues(elements);
  }
  // multi-frame case (spacing in functional group)
  if (typeof res === 'undefined') {
    res = getMultiFrame2DSpacingValues(elements);
  }
  // return
  return res;
}

/**
 * Get the pixel aspect ratio.
 *
 * @param {Object<string, DataElement>} elements The DICOM elements.
 * @returns {number[]|undefined} The values if present.
 */
export function getPixelAspectRatio(elements) {
  return get2DSpacingValues(elements, TagKeys.PixelAspectRatio);
}

/**
 * Get a spacing object from a dicom measure element.
 *
 * @param {Object<string, DataElement>} dataElements The dicom element.
 * @returns {Spacing|undefined} A spacing object.
 */
export function getSpacingFromMeasure(dataElements) {
  // Pixel Spacing
  const spacingValues = get2DSpacingValues(dataElements, TagKeys.PixelSpacing);
  if (typeof spacingValues === 'undefined') {
    return undefined;
  }
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
  }
  return defaultGetTagPixelUnit(elements);
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
    unit = safeGet(elements, TagKeys[tag]);
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

/**
 * Get the referenced series UID from the data elements.
 *
 * @param {Object<string, DataElement>} dataElements The data elements.
 * @returns {string|undefined} The referenced series UID.
 */
export function getReferencedSeriesUID(dataElements) {
  let res;
  const refSeriesSq =
    safeGetAll(dataElements, TagKeys.ReferencedSeriesSequence);
  if (typeof refSeriesSq !== 'undefined') {
    res = safeGet(refSeriesSq[0], TagKeys.SeriesInstanceUID);
  }
  return res;
}
