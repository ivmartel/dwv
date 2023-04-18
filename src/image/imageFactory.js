import {Size} from './size';
import {Geometry} from './geometry';
import {RescaleSlopeAndIntercept} from './rsi';
import {WindowLevel} from './windowLevel';
import {Image} from './image';
import {
  isJpeg2000TransferSyntax,
  isJpegBaselineTransferSyntax,
  isJpegLosslessTransferSyntax
} from '../dicom/dicomParser';
import {
  getImage2DSize,
  getPixelSpacing,
  getTime,
  getPixelUnit
} from '../dicom/dicomElementsWrapper';
import {Vector3D} from '../math/vector';
import {Matrix33} from '../math/matrix';
import {Point3D} from '../math/point';
import {logger} from '../utils/logger';

/**
 * {@link Image} factory.
 */
export class ImageFactory {

  /**
   * Check dicom elements. Throws an error if not suitable.
   *
   * @param {object} dicomElements The DICOM tags.
   */
  checkElements(dicomElements) {
    // will throw if columns or rows is not defined
    getImage2DSize(dicomElements);
  }

  /**
   * Get an {@link Image} object from the read DICOM file.
   *
   * @param {object} dicomElements The DICOM tags.
   * @param {Array} pixelBuffer The pixel buffer.
   * @param {number} numberOfFiles The input number of files.
   * @returns {Image} A new Image.
   */
  create(
    dicomElements, pixelBuffer, numberOfFiles) {
    const size2D = getImage2DSize(dicomElements);
    const sizeValues = [size2D[0], size2D[1], 1];

    // frames
    const frames = dicomElements['x00280008'];
    if (frames) {
      sizeValues.push(frames.value[0]);
    }

    // image size
    const size = new Size(sizeValues);

    // image spacing
    const spacing = getPixelSpacing(dicomElements);

    // TransferSyntaxUID
    const syntax = dicomElements['x00020010'].value[0];
    const jpeg2000 = isJpeg2000TransferSyntax(syntax);
    const jpegBase = isJpegBaselineTransferSyntax(syntax);
    const jpegLoss = isJpegLosslessTransferSyntax(syntax);

    // ImagePositionPatient
    const imagePositionPatient = dicomElements['x00200032'];
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
    const imageOrientationPatient = dicomElements['x00200037'];
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
    const time = getTime(dicomElements);
    const geometry = new Geometry(
      origin, size, spacing, orientationMatrix, time);

    // SOP Instance UID
    let sopInstanceUid;
    const siu = dicomElements['x00080018'];
    if (typeof siu !== 'undefined') {
      sopInstanceUid = siu.value[0];
    }

    // Sample per pixels
    let samplesPerPixel = 1;
    const spp = dicomElements['x00280002'];
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
    const photometricInterpretation = dicomElements['x00280004'];
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
    const planarConfiguration = dicomElements['x00280006'];
    if (typeof planarConfiguration !== 'undefined') {
      image.setPlanarConfiguration(planarConfiguration.value[0]);
    }

    // rescale slope and intercept
    let slope = 1;
    // RescaleSlope
    const rescaleSlope = dicomElements['x00281053'];
    if (typeof rescaleSlope !== 'undefined') {
      const value = parseFloat(rescaleSlope.value[0]);
      if (!isNaN(value)) {
        slope = value;
      }
    }
    let intercept = 0;
    // RescaleIntercept
    const rescaleIntercept = dicomElements['x00281052'];
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
      numberOfFiles: numberOfFiles,
      Modality: dicomElements['x00080060'].value[0],
    };
    const sopClassUID = dicomElements['x00080016'];
    if (typeof sopClassUID !== 'undefined') {
      meta.SOPClassUID = sopClassUID.value[0];
    }
    const studyUID = dicomElements['x0020000D'];
    if (typeof studyUID !== 'undefined') {
      meta.StudyInstanceUID = studyUID.value[0];
    }
    const seriesUID = dicomElements['x0020000E'];
    if (typeof seriesUID !== 'undefined') {
      meta.SeriesInstanceUID = seriesUID.value[0];
    }
    const bits = dicomElements['x00280101'];
    if (typeof bits !== 'undefined') {
      meta.BitsStored = bits.value[0];
    }
    const pixelRep = dicomElements['x00280103'];
    if (typeof pixelRep !== 'undefined') {
      meta.PixelRepresentation = pixelRep.value[0];
    }
    // PixelRepresentation -> is signed
    meta.IsSigned = meta.PixelRepresentation === 1;
    // local pixel unit
    const pixelUnit = getPixelUnit(dicomElements);
    if (typeof pixelUnit !== 'undefined') {
      meta.pixelUnit = pixelUnit;
    }
    // FrameOfReferenceUID (optional)
    const frameOfReferenceUID = dicomElements['x00200052'];
    if (typeof frameOfReferenceUID !== 'undefined') {
      meta.FrameOfReferenceUID = frameOfReferenceUID.value[0];
    }
    // window level presets
    const windowPresets = {};
    const windowCenter = dicomElements['x00281050'];
    const windowWidth = dicomElements['x00281051'];
    const windowCWExplanation = dicomElements['x00281055'];
    if (typeof windowCenter !== 'undefined' &&
      typeof windowWidth !== 'undefined') {
      let name;
      for (let j = 0; j < windowCenter.value.length; ++j) {
        const center = parseFloat(windowCenter.value[j], 10);
        const width = parseFloat(windowWidth.value[j], 10);
        if (center && width && width !== 0) {
          name = '';
          if (typeof windowCWExplanation !== 'undefined') {
            name = windowCWExplanation.value[j];
          }
          if (name === '') {
            name = 'Default' + j;
          }
          windowPresets[name] = {
            wl: [new WindowLevel(center, width)],
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
      let redLut = dicomElements['x00281201'];
      let greenLut = dicomElements['x00281202'];
      let blueLut = dicomElements['x00281203'];
      // check red palette descriptor (should all be equal)
      const descriptor = dicomElements['x00281101'];
      if (typeof descriptor !== 'undefined' &&
              descriptor.length === 3) {
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
          const vlSize = redLut.vl;
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
            dicomElements['x00280100'].value[0], 10);
          if (bitsAllocated === 8) {
            doScale = true;
            logger.info(
              'Scaling 16bits color lut since bits allocated is 8.');
          }

          if (doScale) {
            const scaleTo8 = function (value) {
              return value >> 8;
            };

            redLut = redLut.map(scaleTo8);
            greenLut = greenLut.map(scaleTo8);
            blueLut = blueLut.map(scaleTo8);
          }
        } else if (descriptor[2] === 8) {
          // lut with vr=OW was read as Uint16, convert it to Uint8
          logger.info(
            'Scaling 16bits color lut since the lut descriptor is 8.');
          let clone = redLut.slice(0);
          redLut = new Uint8Array(clone.buffer);
          clone = greenLut.slice(0);
          greenLut = new Uint8Array(clone.buffer);
          clone = blueLut.slice(0);
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
    const recommendedDisplayFrameRate = dicomElements['x00082144'];
    if (typeof recommendedDisplayFrameRate !== 'undefined') {
      meta.RecommendedDisplayFrameRate = parseInt(
        recommendedDisplayFrameRate.value[0], 10);
    }

    // store the meta data
    image.setMeta(meta);

    return image;
  }

}