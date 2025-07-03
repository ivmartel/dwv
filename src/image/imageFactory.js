import {Size} from './size.js';
import {Spacing} from './spacing.js';
import {Geometry} from './geometry.js';
import {RescaleSlopeAndIntercept} from './rsi.js';
import {WindowLevel} from './windowLevel.js';
import {Image} from './image.js';
import {ColourMap} from './luts.js';
import {safeGet, safeGetAll} from '../dicom/dataElement.js';
import {
  getImage2DSize,
  getPixelSpacing,
  getTagPixelUnit,
  getOrientationMatrix,
  getPhotometricInterpretation,
  isMonochrome,
  isSecondatyCapture
} from '../dicom/dicomImage.js';
import {hasAnyPixelDataElement} from '../dicom/dicomTag.js';
import {getTagTime} from '../dicom/dicomDate.js';
import {getSuvFactor} from '../dicom/dicomPet.js';
import {Point3D} from '../math/point.js';
import {logger} from '../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement.js';
/* eslint-enable no-unused-vars */

/**
 * @typedef {Object<string, DataElement>} DataElements
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  TransferSyntaxUID: '00020010',
  SOPClassUID: '00080016',
  SOPInstanceUID: '00080018',
  Modality: '00080060',
  NumberOfFrames: '00280008',
  ImagePositionPatient: '00200032',
  SamplesPerPixel: '00280002',
  PlanarConfiguration: '00280006',
  RescaleSlope: '00281053',
  RescaleIntercept: '00281052',
  VOILUTFunction: '00281056',
  MediaStorageSOPClassUID: '00020002',
  ImageType: '00080008',
  PhotometricInterpretation: '00280004',
  PixelRepresentation: '00280103',
  BitsAllocated: '00280100',
  BitsStored: '00280101',
  HighBit: '00280102',
  ImageOrientationPatient: '00200037',
  WindowCenter: '00281050',
  WindowLevel: '00281051',
  WindowCenterWidthExplanation: '00281055',
  RedPaletteColorLookupTableDescriptor: '00281101',
  RedPaletteColorLookupTableData: '00281201',
  GreenPaletteColorLookupTableData: '00281202',
  BluePaletteColorLookupTableData: '00281203',
  RecommendedDisplayFrameRate: '00082144'
};

/**
 * Meta tag keys.
 */
const MetaTagKeys = {
  // patient
  PatientName: '00100010',
  PatientID: '00100020',
  PatientBirthDate: '00100030',
  PatientSex: '00100040',
  // general study
  StudyDate: '00080020',
  StudyTime: '00080030',
  StudyInstanceUID: '0020000D',
  StudyID: '00200010',
  StudyDescription: '00081030',
  ReferringPhysicianName: '00080090',
  // general series
  SeriesDate: '00080021',
  SeriesTime: '00080031',
  SeriesInstanceUID: '0020000E',
  SeriesNumber: '00200011',
  // frame of reference
  FrameOfReferenceUID: '00200052',
  // general equipment
  Manufacturer: '00080070',
  ManufacturerModelName: '00081090',
  DeviceSerialNumber: '00181000',
  SoftwareVersions: '00181020',
  // general image
  LossyImageCompression: '00282110'
};

/**
 * Get the palette colour map.
 *
 * @param {Object<string, DataElement>} dataElements The data elements.
 * @returns {ColourMap|undefined} The palette colour map.
 */
function getPaletteColourMap(dataElements) {
  let colourMap;
  // check red palette descriptor (should all be equal)
  // Red Palette Color Lookup Table Descriptor
  // 0: number of entries in the lookup table
  // 1: first input value mapped
  // 2: number of bits for each entry in the Lookup Table Data (8 or 16)
  const descriptor =
    safeGetAll(dataElements, TagKeys.RedPaletteColorLookupTableDescriptor);
  if (typeof descriptor !== 'undefined' &&
    descriptor.length === 3) {
    let redLut;
    let greenLut;
    let blueLut;
    // Red Palette Color Lookup Table Data
    const redLutElement =
      dataElements[TagKeys.RedPaletteColorLookupTableData];
    // Green Palette Color Lookup Table Data
    const greenLutElement =
      dataElements[TagKeys.GreenPaletteColorLookupTableData];
    // Blue Palette Color Lookup Table Data
    const blueLutElement =
      dataElements[TagKeys.BluePaletteColorLookupTableData];

    if (descriptor[2] === 16) {
      let doScale = false;
      // (C.7.6.3.1.5 Palette Color Lookup Table Descriptor)
      // Some implementations have encoded 8 bit entries with 16 bits
      // allocated, padding the high bits;
      let descSize = descriptor[0];
      // (C.7.6.3.1.5 Palette Color Lookup Table Descriptor)
      // The first Palette Color Lookup Table Descriptor value is the
      // number of entries in the lookup table. When the number of table
      // entries is equal to 216 then this value shall be 0.
      if (descSize === 0) {
        descSize = 65536;
      }
      // red palette VL
      // TODO vl is undefined, find info elsewhere...
      const vlSize = redLutElement.vl;
      // check double size
      if (vlSize !== 2 * descSize) {
        doScale = true;
        logger.info('16bits lut but size is not double. desc: ' +
          descSize + ' vl: ' + vlSize);
      }
      // (C.7.6.3.1.6 Palette Color Lookup Table Data)
      // Palette color values must always be scaled across the full
      // range of available intensities
      const bitsAllocated = parseInt(
        safeGet(dataElements, TagKeys.BitsAllocated), 10);
      if (bitsAllocated === 8) {
        doScale = true;
        logger.info(
          'Scaling 16bits color lut since bits allocated is 8.');
      }

      if (doScale) {
        const scaleTo8 = function (value) {
          return value >> 8;
        };

        redLut = redLutElement.value.map(scaleTo8);
        greenLut = greenLutElement.value.map(scaleTo8);
        blueLut = blueLutElement.value.map(scaleTo8);
      }
    } else if (descriptor[2] === 8) {
      // lut with vr=OW was read as Uint16, convert it to Uint8
      logger.info(
        'Scaling 16bits color lut since the lut descriptor is 8.');
      let clone = redLutElement.value.slice(0);
      // @ts-expect-error
      redLut = Array.from(new Uint8Array(clone.buffer));
      clone = greenLutElement.value.slice(0);
      // @ts-expect-error
      greenLut = Array.from(new Uint8Array(clone.buffer));
      clone = blueLutElement.value.slice(0);
      // @ts-expect-error
      blueLut = Array.from(new Uint8Array(clone.buffer));
    }
    colourMap = new ColourMap(redLut, greenLut, blueLut);
  }
  // return
  return colourMap;
}

/**
 * Get the window level presets.
 *
 * @param {Object<string, DataElement>} dataElements The data elements.
 * @param {number} intensityFactor The intensity factor.
 * @returns {object|undefined} The presets.
 */
function getWindowPresets(dataElements, intensityFactor) {
  let windowPresets;
  const windowCenter = safeGetAll(dataElements, TagKeys.WindowCenter);
  const windowWidth = safeGetAll(dataElements, TagKeys.WindowLevel);
  if (typeof windowCenter !== 'undefined' &&
    typeof windowWidth !== 'undefined') {
    windowPresets = {};
    const windowCWExplanation =
      safeGetAll(dataElements, TagKeys.WindowCenterWidthExplanation);
    let name;
    for (let j = 0; j < windowCenter.length; ++j) {
      const center = parseFloat(windowCenter[j]);
      let width = parseFloat(windowWidth[j]);
      if (center && width && width !== 0) {
        name = '';
        if (typeof windowCWExplanation !== 'undefined') {
          name = windowCWExplanation[j];
        }
        if (name === '') {
          name = 'Default' + j;
        }
        width *= intensityFactor;
        if (width < 1) {
          width = 1;
        }
        windowPresets[name] = {
          wl: [new WindowLevel(
            center * intensityFactor,
            width
          )],
          name: name
        };
      }
      if (width === 0) {
        logger.warn('Zero window width found in DICOM.');
      }
    }
  }
  // return
  return windowPresets;
}

/**
 * {@link Image} factory.
 */
export class ImageFactory {

  /**
   * Possible warning created by checkElements.
   *
   * @type {string|undefined}
   */
  #warning;

  /**
   * The PET SUV factor.
   *
   * @type {number|undefined}
   */
  #suvFactor;

  /**
   * Get a warning string if elements are not as expected.
   * Created by checkElements.
   *
   * @returns {string|undefined} The warning.
   */
  getWarning() {
    return this.#warning;
  }

  /**
   * Check dicom elements.
   *
   * @param {DataElements} dataElements The DICOM data elements.
   * @returns {string|undefined} A possible warning.
   * @throws Error for missing or wrong data.
   */
  checkElements(dataElements) {
    // reset
    this.#warning = undefined;
    // check image size
    if (typeof getImage2DSize(dataElements) === 'undefined') {
      throw new Error('No image rows or columns in DICOM file');
    };
    // check pixel data
    if (!hasAnyPixelDataElement(dataElements)) {
      throw new Error('No pixel data in DICOM file');
    }
    // check PET SUV
    const modality = safeGet(dataElements, TagKeys.Modality);
    if (typeof modality !== 'undefined' && modality === 'PT') {
      const photometricInterpretation =
        getPhotometricInterpretation(dataElements);
      const SOPClassUID = safeGet(dataElements, TagKeys.SOPClassUID);
      if (isSecondatyCapture(SOPClassUID) ||
        !isMonochrome(photometricInterpretation)) {
        return this.#warning;
      }
      const suvFactor = getSuvFactor(dataElements);
      this.#suvFactor = suvFactor.value;
      this.#warning = suvFactor.warning;
    }

    return this.#warning;
  }

  /**
   * Get an {@link Image} object from the read DICOM file.
   *
   * @param {DataElements} dataElements The DICOM tags.
   * @param {Uint8Array | Int8Array |
   *   Uint16Array | Int16Array |
   *   Uint32Array | Int32Array} pixelBuffer The pixel buffer.
   * @param {number} numberOfFiles The input number of files.
   * @returns {Image} A new Image.
   * @throws Error for missing or wrong data.
   */
  create(dataElements, pixelBuffer, numberOfFiles) {
    // safe get shortcuts
    const safeGetLocal = function (key) {
      return safeGet(dataElements, key);
    };
    const safeGetAllLocal = function (key) {
      return safeGetAll(dataElements, key);
    };

    const size2D = getImage2DSize(dataElements);
    const sizeValues = [size2D[0], size2D[1], 1];

    // NumberOfFrames
    const numberOfFrames = safeGetLocal(TagKeys.NumberOfFrames);
    if (typeof numberOfFrames !== 'undefined') {
      const number = parseInt(numberOfFrames, 10);
      if (number > 1) {
        sizeValues.push(number);
      }
    }

    // image size
    const size = new Size(sizeValues);

    // image spacing
    let spacingValues = [1, 1, 1];
    const spacing2D = getPixelSpacing(dataElements);
    if (typeof spacing2D !== 'undefined') {
      spacingValues = [spacing2D[0], spacing2D[1], 1];
    }
    const spacing = new Spacing(spacingValues);

    // ImagePositionPatient
    const imagePositionPatient = safeGetAllLocal(TagKeys.ImagePositionPatient);
    // slice position
    let slicePosition = new Array(0, 0, 0);
    if (typeof imagePositionPatient !== 'undefined') {
      slicePosition = [
        parseFloat(imagePositionPatient[0]),
        parseFloat(imagePositionPatient[1]),
        parseFloat(imagePositionPatient[2])
      ];
    }

    // Image orientation patient
    const orientationMatrix = getOrientationMatrix(dataElements);

    // geometry
    const origin = new Point3D(
      slicePosition[0], slicePosition[1], slicePosition[2]);
    const time = getTagTime(dataElements);
    const geometry = new Geometry(
      [origin], size, spacing, orientationMatrix, time);

    // SOP Instance UID
    const sopInstanceUid = safeGetLocal(TagKeys.SOPInstanceUID);

    // Sample per pixels
    let samplesPerPixel = safeGetLocal(TagKeys.SamplesPerPixel);
    if (typeof samplesPerPixel === 'undefined') {
      samplesPerPixel = 1;
    }

    // check buffer size
    const bufferSize = size.getTotalSize() * samplesPerPixel;
    if (bufferSize !== pixelBuffer.length) {
      logger.warn('Badly sized pixel buffer: ' +
        pixelBuffer.length + ' != ' + bufferSize);
      if (bufferSize < pixelBuffer.length) {
        pixelBuffer = pixelBuffer.slice(0, size.getTotalSize());
      } else {
        throw new Error('Underestimated buffer size, can\'t fix it...');
      }
    }

    // image
    const image = new Image(geometry, pixelBuffer, [sopInstanceUid]);

    // PhotometricInterpretation
    const photo = getPhotometricInterpretation(dataElements);
    if (typeof photo !== 'undefined') {
      image.setPhotometricInterpretation(photo);
    }
    // PlanarConfiguration
    const planarConfiguration =
      safeGetLocal(TagKeys.PlanarConfiguration);
    if (typeof planarConfiguration !== 'undefined') {
      image.setPlanarConfiguration(planarConfiguration);
    }

    // rescale slope and intercept
    let slope = 1;
    // RescaleSlope
    const rescaleSlope = safeGetLocal(TagKeys.RescaleSlope);
    if (typeof rescaleSlope !== 'undefined') {
      const value = parseFloat(rescaleSlope);
      if (!isNaN(value)) {
        slope = value;
      }
    }
    let intercept = 0;
    // RescaleIntercept
    const rescaleIntercept = safeGetLocal(TagKeys.RescaleIntercept);
    if (typeof rescaleIntercept !== 'undefined') {
      const value = parseFloat(rescaleIntercept);
      if (!isNaN(value)) {
        intercept = value;
      }
    }

    // PET SUV
    let isPetWithSuv = false;
    let intensityFactor = 1;
    if (typeof this.#suvFactor !== 'undefined') {
      isPetWithSuv = true;
      intensityFactor = this.#suvFactor;
      logger.info('Applying PET SUV calibration: ' + intensityFactor);
      slope *= intensityFactor;
      intercept *= intensityFactor;
    }
    const rsi = new RescaleSlopeAndIntercept(slope, intercept);
    image.setRescaleSlopeAndIntercept(rsi);

    // PALETTE COLOR lut
    if (image.getPhotometricInterpretation() === 'PALETTE COLOR') {
      const colourMap = getPaletteColourMap(dataElements);
      if (typeof colourMap !== 'undefined') {
        image.setPaletteColourMap(colourMap);
      }
    }

    // meta information
    const meta = {
      numberOfFiles: numberOfFiles
    };

    // defaults
    meta.TransferSyntaxUID = safeGetLocal(TagKeys.TransferSyntaxUID);
    meta.MediaStorageSOPClassUID =
      safeGetLocal(TagKeys.MediaStorageSOPClassUID);
    meta.SOPClassUID = safeGetLocal(TagKeys.SOPClassUID);
    meta.Modality = safeGetLocal(TagKeys.Modality);
    meta.ImageType = safeGetLocal(TagKeys.ImageType);
    meta.SamplesPerPixel = safeGetLocal(TagKeys.SamplesPerPixel);
    meta.PhotometricInterpretation =
      safeGetLocal(TagKeys.PhotometricInterpretation);
    meta.PixelRepresentation = safeGetLocal(TagKeys.PixelRepresentation);
    meta.BitsAllocated = safeGetLocal(TagKeys.BitsAllocated);

    meta.BitsStored = safeGetLocal(TagKeys.BitsStored);
    meta.HighBit = safeGetLocal(TagKeys.HighBit);

    meta.ImageOrientationPatient =
      safeGetAllLocal(TagKeys.ImageOrientationPatient);

    // meta tags
    const metaKeys = Object.keys(MetaTagKeys);
    for (const key of metaKeys) {
      meta[key] = safeGetLocal(MetaTagKeys[key]);
    }

    // local pixel unit
    if (isPetWithSuv) {
      meta.pixelUnit = 'SUV';
    } else {
      const pixelUnit = getTagPixelUnit(dataElements);
      if (typeof pixelUnit !== 'undefined') {
        meta.pixelUnit = pixelUnit;
      }
    }

    // length unit
    if (typeof spacing2D === 'undefined') {
      meta.lengthUnit = 'unit.pixel';
    } else {
      meta.lengthUnit = 'unit.mm';
    }

    // window level presets
    const presets = getWindowPresets(dataElements, intensityFactor);
    if (typeof presets !== 'undefined') {
      meta.windowPresets = presets;
    }
    meta.VOILUTFunction = safeGetLocal(TagKeys.VOILUTFunction);

    // store the meta data
    image.setMeta(meta);

    return image;
  }

}