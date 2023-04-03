import {Size} from './size';
import {Geometry} from './geometry';
import {RescaleSlopeAndIntercept} from './rsi';
import {WindowLevel} from './windowLevel';
import {Image} from './image';
import {
  cleanString,
  isJpeg2000TransferSyntax,
  isJpegBaselineTransferSyntax,
  isJpegLosslessTransferSyntax
} from '../dicom/dicomParser';
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
    // columns
    const columns = dicomElements.getFromKey('x00280011');
    if (!columns) {
      throw new Error('Missing or empty DICOM image number of columns');
    }
    // rows
    const rows = dicomElements.getFromKey('x00280010');
    if (!rows) {
      throw new Error('Missing or empty DICOM image number of rows');
    }
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
    // columns
    const columns = dicomElements.getFromKey('x00280011');
    if (!columns) {
      throw new Error('Missing or empty DICOM image number of columns');
    }
    // rows
    const rows = dicomElements.getFromKey('x00280010');
    if (!rows) {
      throw new Error('Missing or empty DICOM image number of rows');
    }

    const sizeValues = [columns, rows, 1];

    // frames
    const frames = dicomElements.getFromKey('x00280008');
    if (frames) {
      sizeValues.push(frames);
    }

    // image size
    const size = new Size(sizeValues);

    // image spacing
    const spacing = dicomElements.getPixelSpacing();

    // TransferSyntaxUID
    const transferSyntaxUID = dicomElements.getFromKey('x00020010');
    const syntax = cleanString(transferSyntaxUID);
    const jpeg2000 = isJpeg2000TransferSyntax(syntax);
    const jpegBase = isJpegBaselineTransferSyntax(syntax);
    const jpegLoss = isJpegLosslessTransferSyntax(syntax);

    // ImagePositionPatient
    const imagePositionPatient = dicomElements.getFromKey('x00200032');
    // slice position
    let slicePosition = new Array(0, 0, 0);
    if (imagePositionPatient) {
      slicePosition = [parseFloat(imagePositionPatient[0]),
        parseFloat(imagePositionPatient[1]),
        parseFloat(imagePositionPatient[2])];
    }

    // slice orientation (cosines are matrices' columns)
    // http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.7.6.2.html#sect_C.7.6.2.1.1
    const imageOrientationPatient = dicomElements.getFromKey('x00200037');
    let orientationMatrix;
    if (imageOrientationPatient) {
      const rowCosines = new Vector3D(
        parseFloat(imageOrientationPatient[0]),
        parseFloat(imageOrientationPatient[1]),
        parseFloat(imageOrientationPatient[2]));
      const colCosines = new Vector3D(
        parseFloat(imageOrientationPatient[3]),
        parseFloat(imageOrientationPatient[4]),
        parseFloat(imageOrientationPatient[5]));
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
    const time = dicomElements.getTime();
    const geometry = new Geometry(
      origin, size, spacing, orientationMatrix, time);

    // sop instance UID
    const sopInstanceUid = cleanString(
      dicomElements.getFromKey('x00080018'));

    // Sample per pixels
    let samplesPerPixel = dicomElements.getFromKey('x00280002');
    if (!samplesPerPixel) {
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
    const photometricInterpretation = dicomElements.getFromKey('x00280004');
    if (photometricInterpretation) {
      let photo = cleanString(photometricInterpretation)
        .toUpperCase();
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
    const planarConfiguration = dicomElements.getFromKey('x00280006');
    if (planarConfiguration) {
      image.setPlanarConfiguration(planarConfiguration);
    }

    // rescale slope and intercept
    let slope = 1;
    // RescaleSlope
    const rescaleSlope = dicomElements.getFromKey('x00281053');
    if (rescaleSlope) {
      slope = parseFloat(rescaleSlope);
    }
    let intercept = 0;
    // RescaleIntercept
    const rescaleIntercept = dicomElements.getFromKey('x00281052');
    if (rescaleIntercept) {
      intercept = parseFloat(rescaleIntercept);
    }
    const rsi = new RescaleSlopeAndIntercept(slope, intercept);
    image.setRescaleSlopeAndIntercept(rsi);

    // meta information
    const meta = {
      numberOfFiles: numberOfFiles,
      Modality: dicomElements.getFromKey('x00080060'),
      SOPClassUID: dicomElements.getFromKey('x00080016'),
      StudyInstanceUID: dicomElements.getFromKey('x0020000D'),
      SeriesInstanceUID: dicomElements.getFromKey('x0020000E'),
      BitsStored: dicomElements.getFromKey('x00280101'),
      PixelRepresentation: dicomElements.getFromKey('x00280103')
    };
    // PixelRepresentation -> is signed
    meta.IsSigned = meta.PixelRepresentation === 1;
    // local pixel unit
    const pixelUnit = dicomElements.getPixelUnit();
    if (pixelUnit) {
      meta.pixelUnit = pixelUnit;
    }
    // FrameOfReferenceUID (optional)
    const frameOfReferenceUID = dicomElements.getFromKey('x00200052');
    if (frameOfReferenceUID) {
      meta.FrameOfReferenceUID = frameOfReferenceUID;
    }
    // window level presets
    const windowPresets = {};
    const windowCenter = dicomElements.getFromKey('x00281050', true);
    const windowWidth = dicomElements.getFromKey('x00281051', true);
    const windowCWExplanation = dicomElements.getFromKey('x00281055', true);
    if (windowCenter && windowWidth) {
      let name;
      for (let j = 0; j < windowCenter.length; ++j) {
        const center = parseFloat(windowCenter[j], 10);
        const width = parseFloat(windowWidth[j], 10);
        if (center && width && width !== 0) {
          name = '';
          if (windowCWExplanation) {
            name = cleanString(windowCWExplanation[j]);
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
      let redLut = dicomElements.getFromKey('x00281201');
      let greenLut = dicomElements.getFromKey('x00281202');
      let blueLut = dicomElements.getFromKey('x00281203');
      // check red palette descriptor (should all be equal)
      const descriptor = dicomElements.getFromKey('x00281101');
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
          const redLutDE = dicomElements.getDEFromKey('x00281201');
          const vlSize = redLutDE.vl;
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
            dicomElements.getFromKey('x00280100'), 10);
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
    const recommendedDisplayFrameRate = dicomElements.getFromKey('x00082144');
    if (recommendedDisplayFrameRate) {
      meta.RecommendedDisplayFrameRate = parseInt(
        recommendedDisplayFrameRate, 10);
    }

    // store the meta data
    image.setMeta(meta);

    return image;
  }

}