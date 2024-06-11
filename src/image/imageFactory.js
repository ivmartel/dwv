import {Size} from './size';
import {Geometry} from './geometry';
import {RescaleSlopeAndIntercept} from './rsi';
import {WindowLevel} from './windowLevel';
import {Image} from './image';
import {luts} from './luts';
import {
  isJpeg2000TransferSyntax,
  isJpegBaselineTransferSyntax,
  isJpegLosslessTransferSyntax
} from '../dicom/dicomParser';
import {
  getImage2DSize,
  getPixelSpacing,
  getPixelUnit,
  TagValueExtractor,
  getSuvFactor,
  getOrientationMatrix
} from '../dicom/dicomElementsWrapper';
import {Point3D} from '../math/point';
import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement';
/* eslint-enable no-unused-vars */

/**
 * @typedef {Object<string, DataElement>} DataElements
 */

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
   * Check dicom elements. Throws an error if not suitable.
   *
   * @param {DataElements} dataElements The DICOM data elements.
   * @returns {string|undefined} A possible warning.
   */
  checkElements(dataElements) {
    // reset
    this.#warning = undefined;
    // will throw if columns or rows is not defined
    getImage2DSize(dataElements);
    // check PET SUV
    let modality;
    const element = dataElements['00080060'];
    if (typeof element !== 'undefined') {
      modality = element.value[0];
      if (modality === 'PT') {
        const suvFactor = getSuvFactor(dataElements);
        this.#suvFactor = suvFactor.value;
        this.#warning = suvFactor.warning;
      }
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
   */
  create(dataElements, pixelBuffer, numberOfFiles) {
    const size2D = getImage2DSize(dataElements);
    const sizeValues = [size2D[0], size2D[1], 1];

    // NumberOfFrames
    const numberOfFramesEl = dataElements['00280008'];
    if (typeof numberOfFramesEl !== 'undefined') {
      const number = parseInt(numberOfFramesEl.value[0], 10);
      if (number > 1) {
        sizeValues.push(number);
      }
    }

    // image size
    const size = new Size(sizeValues);

    // image spacing
    const spacing = getPixelSpacing(dataElements);

    // TransferSyntaxUID
    const syntax = dataElements['00020010'].value[0];
    const jpeg2000 = isJpeg2000TransferSyntax(syntax);
    const jpegBase = isJpegBaselineTransferSyntax(syntax);
    const jpegLoss = isJpegLosslessTransferSyntax(syntax);

    // ImagePositionPatient
    const imagePositionPatient = dataElements['00200032'];
    // slice position
    let slicePosition = new Array(0, 0, 0);
    if (typeof imagePositionPatient !== 'undefined') {
      slicePosition = [
        parseFloat(imagePositionPatient.value[0]),
        parseFloat(imagePositionPatient.value[1]),
        parseFloat(imagePositionPatient.value[2])
      ];
    }

    // Image orientation patient
    const orientationMatrix = getOrientationMatrix(dataElements);

    // geometry
    const origin = new Point3D(
      slicePosition[0], slicePosition[1], slicePosition[2]);
    const extractor = new TagValueExtractor();
    const time = extractor.getTime(dataElements);
    const geometry = new Geometry(
      origin, size, spacing, orientationMatrix, time);

    // SOP Instance UID
    let sopInstanceUid;
    const siu = dataElements['00080018'];
    if (typeof siu !== 'undefined') {
      sopInstanceUid = siu.value[0];
    }

    // Sample per pixels
    let samplesPerPixel = 1;
    const spp = dataElements['00280002'];
    if (typeof spp !== 'undefined') {
      samplesPerPixel = spp.value[0];
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
    const photometricInterpretation = dataElements['00280004'];
    if (typeof photometricInterpretation !== 'undefined') {
      let photo = photometricInterpretation.value[0].toUpperCase();
      // jpeg decoders output RGB data
      if ((jpeg2000 || jpegBase || jpegLoss) &&
        (photo !== 'MONOCHROME1' && photo !== 'MONOCHROME2')) {
        photo = 'RGB';
      }
      // check samples per pixels
      if (photo === 'RGB' && samplesPerPixel === 1) {
        photo = 'PALETTE COLOR';
      }
      image.setPhotometricInterpretation(photo);
    }
    // PlanarConfiguration
    const planarConfiguration = dataElements['00280006'];
    if (typeof planarConfiguration !== 'undefined') {
      image.setPlanarConfiguration(planarConfiguration.value[0]);
    }

    // rescale slope and intercept
    let slope = 1;
    // RescaleSlope
    const rescaleSlope = dataElements['00281053'];
    if (typeof rescaleSlope !== 'undefined') {
      const value = parseFloat(rescaleSlope.value[0]);
      if (!isNaN(value)) {
        slope = value;
      }
    }
    let intercept = 0;
    // RescaleIntercept
    const rescaleIntercept = dataElements['00281052'];
    if (typeof rescaleIntercept !== 'undefined') {
      const value = parseFloat(rescaleIntercept.value[0]);
      if (!isNaN(value)) {
        intercept = value;
      }
    }

    // meta information
    const meta = {
      numberOfFiles: numberOfFiles
    };

    // Modality
    const modality = dataElements['00080060'];
    if (typeof modality !== 'undefined') {
      meta.Modality = modality.value[0];
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

    const safeGet = function (key) {
      let res;
      const element = dataElements[key];
      if (typeof element !== 'undefined') {
        res = element.value[0];
      }
      return res;
    };

    // defaults
    meta.TransferSyntaxUID = safeGet('00020010');
    meta.MediaStorageSOPClassUID = safeGet('00020002');
    meta.SOPClassUID = safeGet('00080016');
    meta.Modality = safeGet('00080060');
    meta.ImageType = safeGet('00080008');
    meta.SamplesPerPixel = safeGet('00280002');
    meta.PhotometricInterpretation = safeGet('00280004');
    meta.PixelRepresentation = safeGet('00280103');
    meta.BitsAllocated = safeGet('00280100');
    meta.BitsStored = safeGet('00280101');
    meta.HighBit = safeGet('00280102');

    // Study
    meta.StudyDate = safeGet('00080020');
    meta.StudyTime = safeGet('00080030');
    meta.StudyInstanceUID = safeGet('0020000D');
    meta.StudyID = safeGet('00200010');
    // Series
    meta.SeriesInstanceUID = safeGet('0020000E');
    meta.SeriesNumber = safeGet('00200011');
    // ReferringPhysicianName
    meta.ReferringPhysicianName = safeGet('00080090');
    // patient info
    meta.PatientName = safeGet('00100010');
    meta.PatientID = safeGet('00100020');
    meta.PatientBirthDate = safeGet('00100030');
    meta.PatientSex = safeGet('00100040');
    // General Equipment Module
    meta.Manufacturer = safeGet('00080070');
    meta.ManufacturerModelName = safeGet('00081090');
    meta.DeviceSerialNumber = safeGet('00181000');
    meta.SoftwareVersions = safeGet('00181020');

    meta.ImageOrientationPatient = safeGet('00200037');
    meta.FrameOfReferenceUID = safeGet('00200052');

    // PixelRepresentation -> is signed
    meta.IsSigned = meta.PixelRepresentation === 1;
    // local pixel unit
    if (isPetWithSuv) {
      meta.pixelUnit = 'SUV';
    } else {
      const pixelUnit = getPixelUnit(dataElements);
      if (typeof pixelUnit !== 'undefined') {
        meta.pixelUnit = pixelUnit;
      }
    }
    // window level presets
    const windowPresets = {};
    const windowCenter = dataElements['00281050'];
    const windowWidth = dataElements['00281051'];
    const windowCWExplanation = dataElements['00281055'];
    if (typeof windowCenter !== 'undefined' &&
      typeof windowWidth !== 'undefined') {
      let name;
      for (let j = 0; j < windowCenter.value.length; ++j) {
        const center = parseFloat(windowCenter.value[j]);
        let width = parseFloat(windowWidth.value[j]);
        if (center && width && width !== 0) {
          name = '';
          if (typeof windowCWExplanation !== 'undefined') {
            name = windowCWExplanation.value[j];
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
    meta.windowPresets = windowPresets;

    // PALETTE COLOR luts
    if (image.getPhotometricInterpretation() === 'PALETTE COLOR') {
      // Red Palette Color Lookup Table Data
      const redLutElement = dataElements['00281201'];
      // Green Palette Color Lookup Table Data
      const greenLutElement = dataElements['00281202'];
      // Blue Palette Color Lookup Table Data
      const blueLutElement = dataElements['00281203'];
      let redLut;
      let greenLut;
      let blueLut;
      // check red palette descriptor (should all be equal)
      // Red Palette Color Lookup Table Descriptor
      // 0: number of entries in the lookup table
      // 1: first input value mapped
      // 2: number of bits for each entry in the Lookup Table Data (8 or 16)
      const descriptor = dataElements['00281101'];
      if (typeof descriptor !== 'undefined' &&
        descriptor.value.length === 3) {
        if (descriptor.value[2] === 16) {
          let doScale = false;
          // (C.7.6.3.1.5 Palette Color Lookup Table Descriptor)
          // Some implementations have encoded 8 bit entries with 16 bits
          // allocated, padding the high bits;
          let descSize = descriptor.value[0];
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
            dataElements['00280100'].value[0], 10);
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
        } else if (descriptor.value[2] === 8) {
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
      }
      // set the palette
      luts['palette'] = {
        red: redLut,
        green: greenLut,
        blue: blueLut
      };
    }

    // RecommendedDisplayFrameRate
    const recommendedDisplayFrameRate = dataElements['00082144'];
    if (typeof recommendedDisplayFrameRate !== 'undefined') {
      meta.RecommendedDisplayFrameRate = parseInt(
        recommendedDisplayFrameRate.value[0], 10);
    }

    // store the meta data
    image.setMeta(meta);

    return image;
  }

}