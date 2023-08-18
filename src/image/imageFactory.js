import {Size} from './size';
import {Geometry} from './geometry';
import {RescaleSlopeAndIntercept} from './rsi';
import {WindowCenterAndWidth} from './windowCenterAndWidth';
import {Image} from './image';
import {
  isJpeg2000TransferSyntax,
  isJpegBaselineTransferSyntax,
  isJpegLosslessTransferSyntax
} from '../dicom/dicomParser';
import {
  getImage2DSize,
  getPixelSpacing,
  getPixelUnit,
  TagValueExtractor
} from '../dicom/dicomElementsWrapper';
import {Vector3D} from '../math/vector';
import {Matrix33} from '../math/matrix';
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
   * Check dicom elements. Throws an error if not suitable.
   *
   * @param {DataElements} dataElements The DICOM data elements.
   * @returns {object|undefined} A possible warning.
   */
  checkElements(dataElements) {
    // will throw if columns or rows is not defined
    getImage2DSize(dataElements);
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

    // frames
    const frames = dataElements['00280008'];
    if (frames) {
      sizeValues.push(frames.value[0]);
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

    // slice orientation (cosines are matrices' columns)
    // http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.7.6.2.html#sect_C.7.6.2.1.1
    const imageOrientationPatient = dataElements['00200037'];
    let orientationMatrix;
    if (typeof imageOrientationPatient !== 'undefined') {
      const rowCosines = new Vector3D(
        parseFloat(imageOrientationPatient.value[0]),
        parseFloat(imageOrientationPatient.value[1]),
        parseFloat(imageOrientationPatient.value[2]));
      const colCosines = new Vector3D(
        parseFloat(imageOrientationPatient.value[3]),
        parseFloat(imageOrientationPatient.value[4]),
        parseFloat(imageOrientationPatient.value[5]));
      const normal = rowCosines.crossProduct(colCosines);
      /* eslint-disable array-element-newline */
      orientationMatrix = new Matrix33([
        rowCosines.getX(), colCosines.getX(), normal.getX(),
        rowCosines.getY(), colCosines.getY(), normal.getY(),
        rowCosines.getZ(), colCosines.getZ(), normal.getZ()
      ]);
      /* eslint-enable array-element-newline */
    }

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
    const rsi = new RescaleSlopeAndIntercept(slope, intercept);
    image.setRescaleSlopeAndIntercept(rsi);

    // meta information
    const meta = {
      numberOfFiles: numberOfFiles
    };
    const modality = dataElements['00080060'];
    if (typeof modality !== 'undefined') {
      meta.Modality = modality.value[0];
    }
    const sopClassUID = dataElements['00080016'];
    if (typeof sopClassUID !== 'undefined') {
      meta.SOPClassUID = sopClassUID.value[0];
    }
    const studyUID = dataElements['0020000D'];
    if (typeof studyUID !== 'undefined') {
      meta.StudyInstanceUID = studyUID.value[0];
    }
    const seriesUID = dataElements['0020000E'];
    if (typeof seriesUID !== 'undefined') {
      meta.SeriesInstanceUID = seriesUID.value[0];
    }
    const bits = dataElements['00280101'];
    if (typeof bits !== 'undefined') {
      meta.BitsStored = bits.value[0];
    }
    const pixelRep = dataElements['00280103'];
    if (typeof pixelRep !== 'undefined') {
      meta.PixelRepresentation = pixelRep.value[0];
    }
    // PixelRepresentation -> is signed
    meta.IsSigned = meta.PixelRepresentation === 1;
    // local pixel unit
    const pixelUnit = getPixelUnit(dataElements);
    if (typeof pixelUnit !== 'undefined') {
      meta.pixelUnit = pixelUnit;
    }
    // FrameOfReferenceUID (optional)
    const frameOfReferenceUID = dataElements['00200052'];
    if (typeof frameOfReferenceUID !== 'undefined') {
      meta.FrameOfReferenceUID = frameOfReferenceUID.value[0];
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
        const width = parseFloat(windowWidth.value[j]);
        if (center && width && width !== 0) {
          name = '';
          if (typeof windowCWExplanation !== 'undefined') {
            name = windowCWExplanation.value[j];
          }
          if (name === '') {
            name = 'Default' + j;
          }
          windowPresets[name] = {
            wl: [new WindowCenterAndWidth(center, width)],
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
      const redLutElement = dataElements['00281201'];
      const greenLutElement = dataElements['00281202'];
      const blueLutElement = dataElements['00281203'];
      let redLut;
      let greenLut;
      let blueLut;
      // check red palette descriptor (should all be equal)
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
          redLut = new Uint8Array(clone.buffer);
          clone = greenLutElement.value.slice(0);
          // @ts-expect-error
          greenLut = new Uint8Array(clone.buffer);
          clone = blueLutElement.value.slice(0);
          // @ts-expect-error
          blueLut = new Uint8Array(clone.buffer);
        }
      }
      // set the palette
      meta.paletteLut = {
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