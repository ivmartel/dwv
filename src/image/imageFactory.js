import {RescaleSlopeAndIntercept} from './rsi.js';
import {WindowLevel} from './windowLevel.js';
import {WindowPreset} from './windowPreset.js';
import {Image} from './image.js';
import {Size} from './size.js';
import {Geometry} from './geometry.js';
import {ColourMap} from './luts.js';
import {MaskImage} from './maskImage.js';
import {
  DataElement,
  safeGet,
  safeGetAll
} from '../dicom/dataElement.js';
import {
  getImage2DSize,
  getPixelSpacing,
  getTagPixelUnit,
  getPhotometricInterpretation,
  isMonochrome,
  isSecondatyCapture
} from '../dicom/dicomImage.js';
import {
  getAllPixelDataTagKeys,
  getTagFromKey,
  hasAnyPixelDataElement
} from '../dicom/dicomTag.js';
import {
  getRootGeometry,
  getSortedFramesGeometry
} from '../dicom/dicomGeometry.js';
import {
  isJpeg2000TransferSyntax,
  isJpegBaselineTransferSyntax
} from '../dicom/dicomParser.js';
import {transferSyntaxKeywords} from '../dicom/dictionary.js';
import {
  DcmCodes,
  getDcmDicomCode,
  getDicomCodeItem
} from '../dicom/dicomCode.js';
import {getElementsFromSimpleTagValues} from '../dicom/simpleTagValues.js';
import {getSuvFactor} from '../dicom/dicomPet.js';
import {logger} from '../utils/logger.js';

/**
 * @import {TypedArray} from '../math/types.js';
 * @import {SimpleTagValues} from '../dicom/types.js';
 * @import {PixelRegion} from './types.js';
 */

/**
 * @typedef {Record<string, DataElement>} DataElements
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  TransferSyntaxUID: '00020010',
  SOPClassUID: '00080016',
  SOPInstanceUID: '00080018',
  Modality: '00080060',
  SamplesPerPixel: '00280002',
  PlanarConfiguration: '00280006',
  NumberOfFrames: '00280008',
  Rows: '00280010',
  Columns: '00280011',
  SmallestImagePixelValue: '00280106',
  LargestImagePixelValue: '00280107',
  SmallestPixelValueInSeries: '00280108',
  LargestPixelValueInSeries: '00280109',
  LossyImageCompression: '00282110',
  ExtendedOffsetTable: '7FE00001',
  ExtendedOffsetTableLengths: '7FE00002',
  EncapsulatedPixelDataValueTotalLength: '7FE00003',
  RescaleSlope: '00281053',
  RescaleIntercept: '00281052',
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
  AccessionNumber: '00080050',
  // general series
  SeriesDate: '00080021',
  SeriesTime: '00080031',
  SeriesInstanceUID: '0020000E',
  SeriesNumber: '00200011',
  // frame of reference
  FrameOfReferenceUID: '00200052',
  PositionReferenceIndicator: '00201040',
  // general equipment
  Manufacturer: '00080070',
  ManufacturerModelName: '00081090',
  DeviceSerialNumber: '00181000',
  SoftwareVersions: '00181020',
  // general image
  LossyImageCompression: '00282110',
  // voi lut
  VOILUTFunction: '00281056'
};

/**
 * Get the palette colour map.
 *
 * @param {Record<string, DataElement>} dataElements The data elements.
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
        logger.info(`16bits lut but size is not double. desc: ${
          descSize } vl: ${vlSize}`);
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
      // @ts-expect-error -- clone is a plain number[], it has no buffer
      redLut = Array.from(new Uint8Array(clone.buffer));
      clone = greenLutElement.value.slice(0);
      // @ts-expect-error -- clone is a plain number[], it has no buffer
      greenLut = Array.from(new Uint8Array(clone.buffer));
      clone = blueLutElement.value.slice(0);
      // @ts-expect-error -- clone is a plain number[], it has no buffer
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
 * @param {Record<string, DataElement>} dataElements The data elements.
 * @param {number} intensityFactor The intensity factor.
 * @returns {Record<string, WindowPreset>|undefined} The presets.
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
      if (!isNaN(center) && !isNaN(width) && width !== 0) {
        name = '';
        if (typeof windowCWExplanation !== 'undefined') {
          name = windowCWExplanation[j];
        }
        if (name === '') {
          name = `Default${j}`;
        }
        // the width minimum depends on the VOI LUT function:
        // it is applied by the view
        width *= intensityFactor;
        windowPresets[name] = new WindowPreset(
          name,
          [new WindowLevel(
            center * intensityFactor,
            width
          )]
        );
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
 * Frames geometry cache: frames of a multi-frame data share
 * the same data elements, avoid calculating it for each frame.
 *
 * @type {WeakMap<DataElements, Geometry[]|undefined>}
 */
const framesGeometryCache = new WeakMap();

/**
 * Get the geometry of one frame of a multi-frame data.
 *
 * Frames with per-frame positions get their geometry from
 * getSortedFramesGeometry: the frame position and the data time,
 * or the volume index as time if frames share positions. Other
 * frames are time frames: the frame geometry has the root position
 * and the frame number as time. Once all frames are appended
 * (see Image.appendSlice), the image has the same layout as the one
 * created from the full buffer.
 *
 * @param {DataElements} dataElements The DICOM tags.
 * @param {number} frameNumber The frame number.
 * @returns {Geometry} The frame geometry.
 */
function getFrameGeometry(dataElements, frameNumber) {
  if (!framesGeometryCache.has(dataElements)) {
    framesGeometryCache.set(
      dataElements, getSortedFramesGeometry(dataElements));
  }
  const framesGeometry = framesGeometryCache.get(dataElements);

  let res;
  if (typeof framesGeometry !== 'undefined') {
    // clone: the geometry of the first frame is modified by appends
    res = framesGeometry[frameNumber].clone();
  } else {
    const geometry = getRootGeometry(dataElements);
    const size2D = getImage2DSize(dataElements);
    res = new Geometry(
      [geometry.getOrigin()],
      new Size([size2D[0], size2D[1], 1]),
      geometry.getSpacing(),
      geometry.getOrientation(),
      {id: {value: frameNumber}}
    );
  }
  return res;
}

/**
 * Deep copy a data element value: data elements, sequence items,
 * arrays and typed arrays are copied, other values (strings,
 * numbers, tags) are not modified by the writer and are shared.
 *
 * @param {any} value The value to copy.
 * @returns {any} The copy.
 */
function copyElementValue(value) {
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    return /** @type {TypedArray} */ (value).slice();
  }
  if (Array.isArray(value)) {
    return value.map(copyElementValue);
  }
  if (value instanceof DataElement ||
    (value !== null &&
      typeof value === 'object' &&
      Object.getPrototypeOf(value) === Object.prototype)) {
    const copy = value instanceof DataElement
      ? new DataElement(value.vr) : {};
    for (const key of Object.keys(value)) {
      copy[key] = copyElementValue(value[key]);
    }
    return copy;
  }
  return value;
}

/**
 * Create a data element.
 *
 * @param {string} key The tag key, for example '00280004'.
 * @param {string} vr The element VR.
 * @param {Array} value The element value.
 * @returns {DataElement} The data element.
 */
function createDataElement(key, vr, value) {
  const element = new DataElement(vr);
  element.tag = getTagFromKey(key);
  element.value = value;
  return element;
}

/**
 * Get the number of 2D slices of an image (all dimensions above
 * the second one, for example slices and volumes).
 *
 * @param {Image} image The image.
 * @returns {number} The number of slices.
 */
function getNumberOfSlices(image) {
  const size = image.getGeometry().getSize();
  return size.getTotalSize() / size.getDimSize(2);
}

/**
 * Check that the pixels of an image can be modified or written:
 * not a mask, not resampled and with all its slices loaded.
 *
 * @param {Image} image The image to check.
 * @throws {Error} If the image cannot be used.
 */
function checkImagePixels(image) {
  if (image instanceof MaskImage) {
    throw new Error('Mask images are not supported');
  }
  if (image.isResampled()) {
    throw new Error('Resampled images are not supported, revert it first');
  }
  const sliceCapacity = image.getMeta().sliceCapacity;
  if (typeof sliceCapacity !== 'undefined' &&
    getNumberOfSlices(image) < sliceCapacity) {
    throw new Error('The image is not complete, wait for the end of the load');
  }
}

/**
 * Get the photometric interpretation and planar configuration of
 * the pixel buffer of an image created from data elements: the
 * JPEG Baseline and JPEG 2000 decoders output colour data as RGB
 * and all JPEG decoders output colour-by-pixel data
 * (see the files in src/decoders), other data is not converted.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part05/sect_8.2.html}.
 *
 * @param {Record<string, DataElement>} dataElements The data elements.
 * @returns {{photometricInterpretation: string,
 *   planarConfiguration: number|undefined}} The buffer description.
 * @throws {Error} For a photometric interpretation that cannot
 *   be written uncompressed.
 */
function getBufferPhotometric(dataElements) {
  const syntax = safeGet(dataElements, TagKeys.TransferSyntaxUID);
  let photo = safeGet(dataElements, TagKeys.PhotometricInterpretation);
  if (typeof photo === 'undefined') {
    throw new Error('Missing PhotometricInterpretation');
  }
  photo = photo.trim().toUpperCase();
  let samplesPerPixel = safeGet(dataElements, TagKeys.SamplesPerPixel);
  if (typeof samplesPerPixel === 'undefined') {
    samplesPerPixel = 1;
  }
  let planarConfiguration;
  let supported;
  if (samplesPerPixel === 1) {
    supported = ['MONOCHROME1', 'MONOCHROME2', 'PALETTE COLOR'];
  } else {
    supported = ['RGB', 'YBR_FULL'];
    planarConfiguration = safeGet(dataElements, TagKeys.PlanarConfiguration);
    const isJpeg = typeof syntax !== 'undefined' &&
      (isJpegBaselineTransferSyntax(syntax) ||
        isJpeg2000TransferSyntax(syntax) ||
        syntax === transferSyntaxKeywords.JPEGLossless ||
        syntax === transferSyntaxKeywords.JPEGLosslessSV1);
    if (isJpeg) {
      planarConfiguration = 0;
      if (isJpegBaselineTransferSyntax(syntax) ||
        isJpeg2000TransferSyntax(syntax)) {
        photo = 'RGB';
      }
    }
  }
  if (!supported.includes(photo)) {
    throw new Error(`Unsupported PhotometricInterpretation: ${photo
    } with SamplesPerPixel: ${samplesPerPixel}`);
  }
  return {photometricInterpretation: photo, planarConfiguration};
}

/**
 * Get the image slice index of each frame of a file: frames are
 * sorted by position and volume when they are appended to the
 * image (see Image.appendSlice), so the image slice order can
 * differ from the file frame order. The image volumes are in
 * ascending volume id order and share the same origins
 * (see Geometry.checkTimeOrigins).
 *
 * @param {Image} image The image created from the file.
 * @param {Record<string, DataElement>} dataElements The file
 *   data elements.
 * @param {number} numberOfFrames The number of frames of the file.
 * @returns {number[]} The image slice index of each frame.
 * @throws {Error} If the frames do not match the image slices.
 */
function getFramesSliceIndex(image, dataElements, numberOfFrames) {
  if (numberOfFrames === 1) {
    return [0];
  }
  const origins = image.getGeometry().getOrigins();
  const frameGeometries = [];
  for (let f = 0; f < numberOfFrames; ++f) {
    frameGeometries.push(getFrameGeometry(dataElements, f));
  }
  // frame volume ids (a frame index for frames without position),
  // undefined for a single volume
  const frameTimeIds = frameGeometries.map(
    (geometry) => geometry.getInitialTime()?.id.value);
  const timeIds = [...new Set(frameTimeIds)].sort((a, b) => a - b);
  const res = [];
  for (let f = 0; f < numberOfFrames; ++f) {
    const frameOrigin = frameGeometries[f].getOrigin();
    const sliceIndex = origins.findIndex((item) => item.equals(frameOrigin));
    const volumeIndex = timeIds.indexOf(frameTimeIds[f]);
    res.push(sliceIndex === -1
      ? -1 : volumeIndex * origins.length + sliceIndex);
  }
  // each image slice should be used by one frame
  const sorted = res.slice().sort((a, b) => a - b);
  if (sorted.some((value, i) => value !== i)) {
    throw new Error('Cannot match the image slices with the frames');
  }
  return res;
}

/**
 * Get the tags of an image whose burned in annotation has been
 * removed with the Clean Pixel Data Option.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part15/sect_E.3.html#sect_E.3.1}.
 *
 * @returns {SimpleTagValues} The tags.
 */
function getCleanPixelDataTags() {
  return {
    BurnedInAnnotation: 'NO',
    DeidentificationMethodCodeSequence: {
      value: [
        getDicomCodeItem(getDcmDicomCode(DcmCodes.CleanPixelDataOption))
      ]
    }
  };
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
   * @param {Record<string, DataElement>} dataElements The DICOM data
   *   elements.
   * @returns {string|undefined} A possible warning.
   * @throws {Error} Error for missing or wrong data.
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
   * @param {Record<string, DataElement>} dataElements The DICOM tags.
   * @param {TypedArray} pixelBuffer The pixel buffer.
   * @param {number} numberOfItems The number of load items.
   * @param {number} [frameNumber] The frame number if the pixel buffer
   *   only contains one frame of a multi-frame data: the image is
   *   then one frame, the other ones are to be appended to it.
   * @returns {Image} A new Image.
   * @throws {Error} Error for missing or wrong data.
   */
  create(dataElements, pixelBuffer, numberOfItems, frameNumber) {
    // safe get shortcuts
    const safeGetLocal = function (key) {
      return safeGet(dataElements, key);
    };

    // Sample per pixels
    let samplesPerPixel = safeGetLocal(TagKeys.SamplesPerPixel);
    if (typeof samplesPerPixel === 'undefined') {
      samplesPerPixel = 1;
    }

    // geometry: frames of multi-frame data are created one by one
    // and assembled by the image (see Image.appendSlice)
    let geometry;
    if (typeof frameNumber !== 'undefined') {
      geometry = getFrameGeometry(dataElements, frameNumber);
    } else {
      geometry = getRootGeometry(dataElements);
    }

    // number of pixels
    const numberOfPixels = geometry.getSize().getTotalSize();
    // needed for unit
    const spacing2D = getPixelSpacing(dataElements);

    // SOP Instance UID
    const sopInstanceUid = safeGetLocal(TagKeys.SOPInstanceUID);

    // check buffer size
    const bufferSize = numberOfPixels * samplesPerPixel;
    if (bufferSize !== pixelBuffer.length) {
      logger.warn(`Badly sized pixel buffer: ${
        pixelBuffer.length } != ${bufferSize}`);
      if (bufferSize < pixelBuffer.length) {
        pixelBuffer = pixelBuffer.slice(0, numberOfPixels);
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
      logger.info(`Applying PET SUV calibration: ${intensityFactor}`);
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
    // (slice capacity is used to allocate the full buffer
    // when appending slices, for frames: the total number of frames)
    const meta = {
      sliceCapacity: numberOfItems
    };
    if (typeof frameNumber !== 'undefined') {
      const numberOfFrames = parseInt(
        safeGetLocal(TagKeys.NumberOfFrames), 10);
      meta.sliceCapacity *= numberOfFrames;
    }

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

    // store the meta data
    image.setMeta(meta);

    return image;
  }

  /**
   * Convert an image into DICOM data elements, for example to save
   * it with a `DicomWriter` after {@link eraseRegions}.
   *
   * The result is a copy of the data elements the image was created
   * from with the pixel data rebuilt from the image buffer,
   * the input data elements are not modified. Pixel data is not
   * encoded: compressed data (decoded when loaded) is written
   * uncompressed with the Explicit VR Little Endian transfer syntax and
   * the photometric interpretation and planar configuration of the
   * decoded data; uncompressed data keeps its transfer syntax.
   * The tags describing the pixel values range ((0028,0106) to
   * (0028,0109)), that could be wrong for the new values, and
   * the ones only used with compressed data are removed.
   *
   * Limitation: only supports images created from a single file,
   * single or multi-frame, not a series of files.
   *
   * @param {Image} image The image, created from the data elements.
   * @param {Record<string, DataElement>} dataElements The data elements
   *   of the file the image was created from (`DicomData.meta`).
   * @param {SimpleTagValues} [extraTags] Optional list of extra tags,
   *   for example the ones returned by {@link eraseRegions}. They
   *   replace the tags with the same name, apart from the pixel data
   *   and its encoding tags (transfer syntax, photometric
   *   interpretation...) that are set from the image.
   * @returns {Record<string, DataElement>} A list of dicom elements.
   * @throws {Error} If the image cannot be converted.
   */
  toDicom(image, dataElements, extraTags) {
    checkImagePixels(image);
    // single file data
    if (typeof dataElements.mergeId !== 'undefined') {
      throw new Error('Data elements of several files are not supported');
    }
    const pixelKey = getAllPixelDataTagKeys().find(
      (key) => typeof dataElements[key] !== 'undefined');
    if (typeof pixelKey === 'undefined') {
      throw new Error('No pixel data in DICOM elements');
    }
    // check the image matches the data elements
    const size = image.getGeometry().getSize();
    if (size.get(0) !== safeGet(dataElements, TagKeys.Columns) ||
      size.get(1) !== safeGet(dataElements, TagKeys.Rows)) {
      throw new Error('The image and the elements have different sizes');
    }
    const sopInstanceUid = safeGet(dataElements, TagKeys.SOPInstanceUID);
    if (!image.includesImageUid(sopInstanceUid)) {
      throw new Error('The image was not created from the elements');
    }
    let numberOfFrames = parseInt(
      safeGet(dataElements, TagKeys.NumberOfFrames), 10);
    if (isNaN(numberOfFrames)) {
      numberOfFrames = 1;
    }
    if (getNumberOfSlices(image) !== numberOfFrames) {
      throw new Error(
        'The image does not have one slice per frame of the elements, ' +
        'only images of a single file are supported');
    }
    const photometric = getBufferPhotometric(dataElements);
    let samplesPerPixel = safeGet(dataElements, TagKeys.SamplesPerPixel);
    if (typeof samplesPerPixel === 'undefined') {
      samplesPerPixel = 1;
    }
    if (image.getNumberOfComponents() !== samplesPerPixel) {
      throw new Error('The image and the elements have different ' +
        'samples per pixel');
    }
    const bitsAllocated = safeGet(dataElements, TagKeys.BitsAllocated);
    const buffer = image.getBuffer();
    const bufferBits = bitsAllocated === 1
      ? 1 : buffer.BYTES_PER_ELEMENT * 8;
    if (bufferBits !== bitsAllocated ||
      (bitsAllocated === 1 && !(buffer instanceof Uint8Array))) {
      throw new Error(`The image buffer does not have ${
        bitsAllocated} bits allocated`);
    }

    // copy the elements apart from the pixel data and the tags
    // that cannot be kept
    const removedKeys = [
      ...getAllPixelDataTagKeys(),
      TagKeys.ExtendedOffsetTable,
      TagKeys.ExtendedOffsetTableLengths,
      TagKeys.EncapsulatedPixelDataValueTotalLength,
      TagKeys.SmallestImagePixelValue,
      TagKeys.LargestImagePixelValue,
      TagKeys.SmallestPixelValueInSeries,
      TagKeys.LargestPixelValueInSeries
    ];
    /** @type {Record<string, DataElement>} */
    const elements = {};
    for (const key of Object.keys(dataElements)) {
      if (!removedKeys.includes(key)) {
        elements[key] = copyElementValue(dataElements[key]);
      }
    }

    // merge extra tags if provided
    if (typeof extraTags !== 'undefined') {
      const extraElements = getElementsFromSimpleTagValues(extraTags);
      for (const key of Object.keys(extraElements)) {
        elements[key] = extraElements[key];
      }
    }

    // transfer syntax: encapsulated (compressed) data is written
    // uncompressed with Explicit VR Little Endian
    const syntax = safeGet(dataElements, TagKeys.TransferSyntaxUID);
    const nativeSyntaxes = [
      transferSyntaxKeywords.ImplicitVRLittleEndian,
      transferSyntaxKeywords.ExplicitVRLittleEndian,
      transferSyntaxKeywords.ExplicitVRBigEndian
    ];
    const outSyntax = nativeSyntaxes.includes(syntax)
      ? syntax : transferSyntaxKeywords.ExplicitVRLittleEndian;
    elements[TagKeys.TransferSyntaxUID] = createDataElement(
      TagKeys.TransferSyntaxUID, 'UI', [outSyntax]);
    // decoded data description
    elements[TagKeys.PhotometricInterpretation] = createDataElement(
      TagKeys.PhotometricInterpretation, 'CS',
      [photometric.photometricInterpretation]);
    if (typeof photometric.planarConfiguration !== 'undefined') {
      elements[TagKeys.PlanarConfiguration] = createDataElement(
        TagKeys.PlanarConfiguration, 'US',
        [photometric.planarConfiguration]);
    }
    // once lossy compressed, an image stays lossy (see PS3.3 C.7.6.1.1.5)
    if (typeof syntax !== 'undefined' &&
      isJpegBaselineTransferSyntax(syntax)) {
      elements[TagKeys.LossyImageCompression] = createDataElement(
        TagKeys.LossyImageCompression, 'CS', ['01']);
    }

    // pixel data: frames in file order
    const frameSize = size.getDimSize(2) * samplesPerPixel;
    const slicesIndex =
      getFramesSliceIndex(image, dataElements, numberOfFrames);
    const pixelBuffer = buffer.slice(0, numberOfFrames * frameSize);
    for (let f = 0; f < numberOfFrames; ++f) {
      const offset = slicesIndex[f] * frameSize;
      pixelBuffer.set(
        buffer.subarray(offset, offset + frameSize), f * frameSize);
    }
    let pixelVr;
    if (pixelKey === '7FE00008') {
      pixelVr = 'OF';
    } else if (pixelKey === '7FE00009') {
      pixelVr = 'OD';
    } else {
      pixelVr = bitsAllocated > 8 ? 'OW' : 'OB';
    }
    elements[pixelKey] = createDataElement(pixelKey, pixelVr, [pixelBuffer]);

    return elements;
  }

}

/**
 * Erase rectangular regions of an image, for example burned in
 * annotation that identifies the patient: the stored pixel values
 * inside the regions are set to 0 (black for MONOCHROME2 and RGB
 * data) in every slice and frame of the image.
 *
 * The image buffer is replaced by an erased copy: the views of the
 * image are updated and the data elements the image was created from
 * are not modified. Clone the image before to keep the original one.
 * Use {@link ImageFactory#toDicom} with the returned tags to get
 * the DICOM data elements to write. Only the image pixel data is
 * modified: other places that can contain identifying information
 * such as the Icon Image Sequence (0088,0200) or overlays are not,
 * they can be removed with `DicomWriter` rules.
 *
 * The returned tags are the ones of the Clean Pixel Data Option:
 * Burned In Annotation (0028,0301) set to 'NO' and the
 * De-identification Method Code Sequence (0012,0064) with the
 * (113101, DCM, 'Clean Pixel Data Option') code. They state that
 * no burned in annotation remains: only use them if the regions
 * cover all of it. Patient Identity Removed (0012,0062) is not set,
 * that is the role of the anonymisation of the other tags.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2024a/output/chtml/part15/sect_E.3.html#sect_E.3.1}.
 *
 * @param {Image} image The image to modify.
 * @param {PixelRegion[]} regions The regions to erase, in pixel
 *   indices. Regions must be inside the image: there is no
 *   clipping, a region partly or fully outside throws an error and
 *   the image is not modified.
 * @returns {SimpleTagValues} The tags to add to the DICOM data, to
 *   be passed as `extraTags` to {@link ImageFactory#toDicom}.
 * @throws {Error} For an invalid region or an image that cannot be
 *   modified (mask, resampled or not completely loaded image).
 */
export function eraseRegions(image, regions) {
  checkImagePixels(image);
  if (!Array.isArray(regions) || regions.length === 0) {
    throw new Error('No region to erase');
  }
  const size = image.getGeometry().getSize();
  const columns = size.get(0);
  const rows = size.get(1);
  // check all regions before modifying the image
  for (let i = 0; i < regions.length; ++i) {
    const region = regions[i];
    for (const key of ['x', 'y', 'width', 'height']) {
      if (!Number.isInteger(region?.[key])) {
        throw new Error(`Region ${i}: ${key} is not an integer`);
      }
    }
    if (region.width < 1 || region.height < 1) {
      throw new Error(`Region ${i}: width and height must be at least 1`);
    }
    if (region.x < 0 || region.y < 0 ||
      region.x + region.width > columns ||
      region.y + region.height > rows) {
      throw new Error(`Region ${i}: outside of the image (${
        columns}x${rows})`);
    }
  }

  // the image buffer can be the pixel data of the data elements
  // (single frame data): modify a copy
  const buffer = image.getBuffer().slice();
  const sliceSize = size.getDimSize(2);
  const numberOfComponents = image.getNumberOfComponents();
  // RRR...GGG...BBB... for planar configuration 1
  const isPlanar = numberOfComponents !== 1 &&
    image.getPlanarConfiguration() === 1;
  const numberOfSlices = getNumberOfSlices(image);
  for (let s = 0; s < numberOfSlices; ++s) {
    const sliceOffset = s * sliceSize * numberOfComponents;
    for (const region of regions) {
      for (let j = region.y; j < region.y + region.height; ++j) {
        const rowOffset = j * columns + region.x;
        if (isPlanar) {
          for (let c = 0; c < numberOfComponents; ++c) {
            const start = sliceOffset + c * sliceSize + rowOffset;
            buffer.fill(0, start, start + region.width);
          }
        } else {
          const start = sliceOffset + rowOffset * numberOfComponents;
          buffer.fill(0, start, start + region.width * numberOfComponents);
        }
      }
    }
  }
  // also fires imagecontentchange to update the views
  image.replaceBuffer(buffer);

  return getCleanPixelDataTags();
}

/**
 * Demo Image creation from DICOM elements: takes
 * elements and first element of the pixel buffer
 * to create an image.
 *
 * Warning: not to be used in production code.
 *
 * @param {Record<string, DataElement>} elements The DICOM elements.
 * @returns {Image} The Image object.
 */
export function demoCreateImage(elements) {
  const factory = new ImageFactory();
  return factory.create(
    elements,
    elements['7FE00010'].value[0],
    1
  );
}