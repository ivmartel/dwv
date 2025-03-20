import {
  dateToDateObj,
  getDicomDate,
  dateToTimeObj,
  getDicomTime,
} from '../dicom/dicomDate';
import {
  safeGet,
  safeGetAll
} from '../dicom/dataElement';
import {
  getImage2DSize,
  getSpacingFromMeasure,
  getDicomMeasureItem,
  getDicomPlaneOrientationItem
} from '../dicom/dicomImage';
import {Tag} from '../dicom/dicomTag';
import {getElementsFromJSONTags} from '../dicom/dicomWriter';
import {
  getSegment,
  getDicomSegmentItem,
} from '../dicom/dicomSegment';
import {
  getSegmentFrameInfo,
  getDicomSegmentFrameInfoItem,
  getDimensionOrganization,
} from '../dicom/dicomSegmentFrameInfo';
import {transferSyntaxKeywords} from '../dicom/dictionary';
import {Image} from '../image/image';
import {Geometry} from '../image/geometry';
import {Point, Point3D} from '../math/point';
import {Vector3D} from '../math/vector';
import {Index} from '../math/index';
import {Matrix33, REAL_WORLD_EPSILON} from '../math/matrix';
import {logger} from '../utils/logger';
import {arraySortEquals} from '../utils/array';
import {Size} from './size';
import {ColourMap} from './luts';

// doc imports
/* eslint-disable no-unused-vars */
import {DataElement} from '../dicom/dataElement';
import {MaskSegment} from '../dicom/dicomSegment';
/* eslint-enable no-unused-vars */

/**
 * @typedef {Object<string, DataElement>} DataElements
 */

/**
 * Related DICOM tag keys.
 */
const TagKeys = {
  SOPInstanceUID: '00080018',
  NumberOfFrames: '00280008',
  SegmentSequence: '00620002',
  SharedFunctionalGroupsSequence: '52009229',
  PlaneOrientationSequence: '00209116',
  ImageOrientationPatient: '00200037',
  PixelMeasuresSequence: '00289110',
  PerFrameFunctionalGroupsSequence: '52009230',
  StudyDate: '00080020',
  StudyTime: '00080030',
  StudyInstanceUID: '0020000D',
  StudyID: '00200010',
  SeriesDate: '00080021',
  SeriesTime: '00080031',
  SeriesInstanceUID: '0020000E',
  SeriesNumber: '00200011',
  ReferringPhysicianName: '00080090',
  PatientName: '00100010',
  PatientID: '00100020',
  PatientBirthDate: '00100030',
  PatientSex: '00100040',
  Manufacturer: '00080070',
  ManufacturerModelName: '00081090',
  DeviceSerialNumber: '00181000',
  SoftwareVersions: '00181020',
  LossyImageCompression: '00282110',
  FrameOfReferenceUID: '00200052'
};

/**
 * Check two position patients for equality.
 *
 * @param {*} pos1 The first position patient.
 * @param {*} pos2 The second position patient.
 * @returns {boolean} True is equal.
 */
function equalPosPat(pos1, pos2) {
  return JSON.stringify(pos1) === JSON.stringify(pos2);
}

/**
 * @callback compareFn
 * @param {object} a The first object.
 * @param {object} b The first object.
 * @returns {number} >0 to sort a after b, <0 to sort a before b,
 *   0 to not change order.
 */

/**
 * Get a position patient compare function accroding to an
 * input orientation.
 *
 * @param {Matrix33} orientation The orientation matrix.
 * @returns {compareFn} The position compare function.
 */
function getComparePosPat(orientation) {
  const invOrientation = orientation.getInverse();
  return function (pos1, pos2) {
    const p1 = invOrientation.multiplyArray3D(pos1);
    const p2 = invOrientation.multiplyArray3D(pos2);
    return p1[2] - p2[2];
  };
}

/**
 * Merge two tag lists.
 *
 * @param {object} tags1 Base list, will be modified.
 * @param {object} tags2 List to merge.
 */
function mergeTags(tags1, tags2) {
  const keys2 = Object.keys(tags2);
  for (const tagName2 of keys2) {
    if (tags1[tagName2] !== undefined) {
      logger.trace('Overwritting tag: ' + tagName2);
    }
    tags1[tagName2] = tags2[tagName2];
  }
}

/**
 * Check that a DICOM tag definition is present in a parsed element.
 *
 * @param {DataElements} dataElements The root dicom element.
 * @param {object} tagDefinition The tag definition as {name, tag, type, enum}.
 */
function checkTag(dataElements, tagDefinition) {
  const element = dataElements[tagDefinition.tag];
  // check null and undefined
  if (tagDefinition.type === 1 || tagDefinition.type === 2) {
    if (typeof element === 'undefined') {
      throw new Error('Missing or empty ' + tagDefinition.name);
    }
  } else {
    if (typeof element === 'undefined') {
      // non mandatory value, exit
      return;
    }
  }
  let includes = false;
  let tagValue;
  if (element.value.length === 1) {
    tagValue = element.value[0];
  } else {
    tagValue = element.value;
  }
  if (Array.isArray(tagValue)) {
    for (let i = 0; i < tagDefinition.enum.length; ++i) {
      if (!Array.isArray(tagDefinition.enum[i])) {
        throw new Error('Cannot compare array and non array tag value.');
      }
      if (arraySortEquals(tagDefinition.enum[i], tagValue)) {
        includes = true;
        break;
      }
    }
  } else {
    includes = tagDefinition.enum.includes(tagValue);
  }
  if (!includes) {
    throw new Error(
      'Unsupported ' + tagDefinition.name + ' value: ' + tagValue);
  }
}

/**
 * Create ROI slice buffers.
 *
 * @param {Image} image The mask image.
 * @param {MaskSegment[]} segments The mask segments.
 * @param {number} sliceOffset The slice offset.
 * @returns {object} The ROI slice image buffers.
 */
function createRoiSliceBuffers(
  image,
  segments,
  sliceOffset
) {
  // create binary mask buffers
  const geometry = image.getGeometry();
  const size = geometry.getSize();
  const sliceSize = size.getDimSize(2);
  const buffers = {};
  for (let o = 0; o < sliceSize; ++o) {
    const inputOffset = sliceOffset + o;
    const pixelValue = image.getValueAtOffset(inputOffset);
    for (const segment of segments) {
      const segmentIndex = segment.number - 1;
      if (pixelValue === segment.number) {
        if (buffers[segmentIndex] === undefined) {
          buffers[segmentIndex] = new Uint8Array(sliceSize);
        }
        buffers[segmentIndex][o] = 1;
      }
    }
  }
  return buffers;
}

/**
 * Create ROI buffers.
 *
 * @param {Image} image The mask image.
 * @param {MaskSegment[]} segments The mask segments.
 * @returns {object} The ROI buffers.
 */
function createRoiBuffers(image, segments) {
  const geometry = image.getGeometry();
  const size = geometry.getSize();

  // image buffer to multi frame
  const sliceSize = size.getDimSize(2);
  const roiBuffers = {};
  for (let k = 0; k < size.get(2); ++k) {
    const sliceOffset = k * sliceSize;
    // create slice buffers
    const buffers = createRoiSliceBuffers(image, segments, sliceOffset);
    // store slice buffers
    const keys0 = Object.keys(buffers);
    for (const key0 of keys0) {
      if (roiBuffers[key0] === undefined) {
        roiBuffers[key0] = {};
      }
      // ordering by slice index (follows posPat)
      roiBuffers[key0][k] = buffers[key0];
    }
  }
  return roiBuffers;
}

/**
 * List of DICOM Seg required tags.
 */
const RequiredDicomSegTags = [
  {
    name: 'TransferSyntaxUID',
    tag: '00020010',
    type: '1',
    enum: [
      transferSyntaxKeywords.ImplicitVRLittleEndian,
      transferSyntaxKeywords.ExplicitVRLittleEndian,
      transferSyntaxKeywords.ExplicitVRBigEndian
    ]
  },
  {
    name: 'MediaStorageSOPClassUID',
    tag: '00020002',
    type: '1',
    enum: ['1.2.840.10008.5.1.4.1.1.66.4']
  },
  {
    name: 'SOPClassUID',
    tag: '00020002',
    type: '1',
    enum: ['1.2.840.10008.5.1.4.1.1.66.4']
  },
  {
    name: 'Modality',
    tag: '00080060',
    type: '1',
    enum: ['SEG']
  },
  {
    name: 'SegmentationType',
    tag: '00620001',
    type: '1',
    enum: ['BINARY']
  },
  {
    name: 'DimensionOrganizationType',
    tag: '00209311',
    type: '3',
    enum: ['3D']
  },
  {
    name: 'ImageType',
    tag: '00080008',
    type: '1',
    enum: [['DERIVED', 'PRIMARY']]
  },
  {
    name: 'SamplesPerPixel',
    tag: '00280002',
    type: '1',
    enum: [1]
  },
  {
    name: 'PhotometricInterpretation',
    tag: '00280004',
    type: '1',
    enum: ['MONOCHROME2']
  },
  {
    name: 'PixelRepresentation',
    tag: '00280103',
    type: '1',
    enum: [0]
  },
  {
    name: 'BitsAllocated',
    tag: '00280100',
    type: '1',
    enum: [1]
  },
  {
    name: 'BitsStored',
    tag: '00280101',
    type: '1',
    enum: [1]
  },
  {
    name: 'HighBit',
    tag: '00280102',
    type: '1',
    enum: [0]
  },
];

/**
 * Get the default DICOM seg tags as an object.
 *
 * @returns {object} The default tags.
 */
export function getDefaultDicomSegJson() {
  const tags = {};
  for (let i = 0; i < RequiredDicomSegTags.length; ++i) {
    const reqTag = RequiredDicomSegTags[i];
    tags[reqTag.name] = reqTag.enum[0];
  }
  return tags;
}

/**
 * Mask {@link Image} factory.
 */
export class MaskFactory {

  /**
   * Possible warning created by checkElements.
   *
   * @type {string|undefined}
   */
  #warning;

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
   * @param {Object<string, DataElement>} _dicomElements The DICOM tags.
   * @returns {string|undefined} A possible warning.
   * @throws Error for missing or wrong data.
   */
  checkElements(_dicomElements) {
    // does nothing
    return;
  }

  /**
   * Get an {@link Image} object from the read DICOM file.
   *
   * @param {Object<string, DataElement>} dataElements The DICOM tags.
   * @param {Uint8Array | Int8Array |
   *   Uint16Array | Int16Array |
   *   Uint32Array | Int32Array} pixelBuffer The pixel buffer.
   * @returns {Image} A new Image.
   * @throws Error for missing or wrong data.
   */
  create(dataElements, pixelBuffer) {
    // safe get shortcuts
    const safeGetLocal = function (key) {
      return safeGet(dataElements, key);
    };
    const safeGetAllLocal = function (key) {
      return safeGetAll(dataElements, key);
    };

    // check required and supported tags
    for (let d = 0; d < RequiredDicomSegTags.length; ++d) {
      checkTag(dataElements, RequiredDicomSegTags[d]);
    }

    // image size
    const size2D = getImage2DSize(dataElements);
    const size = new Size([size2D[0], size2D[1], 1]);

    const sliceSize = size.getTotalSize();

    // NumberOfFrames
    let numberOfFrames = safeGetLocal(TagKeys.NumberOfFrames);
    if (typeof numberOfFrames !== 'undefined') {
      numberOfFrames = parseInt(numberOfFrames, 10);
    } else {
      numberOfFrames = 1;
    }

    if (numberOfFrames !== pixelBuffer.length / sliceSize) {
      throw new Error(
        'Buffer and numberOfFrames meta are not equal.' +
        numberOfFrames + ' ' + pixelBuffer.length / sliceSize);
    }

    // Dimension Organization and Index
    const dimension = getDimensionOrganization(dataElements);

    // Segment Sequence
    const segSequence = safeGetAllLocal(TagKeys.SegmentSequence);
    if (typeof segSequence === 'undefined') {
      throw new Error('Missing or empty segmentation sequence');
    }
    const segments = [];
    // segment number is unique and starts at 1, use 0 as background
    const redLut = [0];
    const greenLut = [0];
    const blueLut = [0];
    for (let i = 0; i < segSequence.length; ++i) {
      const segment = getSegment(segSequence[i]);
      if (typeof segment.displayRGBValue !== 'undefined') {
        // add palette colour
        redLut[segment.number] = segment.displayRGBValue.r;
        greenLut[segment.number] = segment.displayRGBValue.g;
        blueLut[segment.number] = segment.displayRGBValue.b;
      }
      // store
      segments.push(segment);
    }

    let hasDisplayRGBValue = false;
    let paletteColourMap;
    if (redLut.length > 1) {
      hasDisplayRGBValue = true;
      paletteColourMap = new ColourMap(redLut, greenLut, blueLut);
    }

    // Shared Functional Groups Sequence
    let spacing;
    let imageOrientationPatient;
    const sharedFunctionalGroupsSeq =
      safeGetAllLocal(TagKeys.SharedFunctionalGroupsSequence);
    if (typeof sharedFunctionalGroupsSeq !== 'undefined') {
      // should be only one
      const funcGroup0 = sharedFunctionalGroupsSeq[0];
      // Plane Orientation Sequence
      if (typeof funcGroup0[TagKeys.PlaneOrientationSequence] !== 'undefined') {
        const planeOrientationSeq =
          funcGroup0[TagKeys.PlaneOrientationSequence];
        if (planeOrientationSeq.value.length !== 0) {
          // should be only one
          imageOrientationPatient =
            planeOrientationSeq.value[0][TagKeys.ImageOrientationPatient].value;
        } else {
          logger.warn(
            'No shared functional group plane orientation sequence items.');
        }
      }
      // Pixel Measures Sequence
      if (typeof funcGroup0[TagKeys.PixelMeasuresSequence] !== 'undefined') {
        const pixelMeasuresSeq = funcGroup0[TagKeys.PixelMeasuresSequence];
        if (pixelMeasuresSeq.value.length !== 0) {
          // should be only one
          spacing = getSpacingFromMeasure(pixelMeasuresSeq.value[0]);
        } else {
          logger.warn(
            'No shared functional group pixel measure sequence items.');
        }
      }
    }

    const includesPosPat = function (arr, val) {
      return arr.some(function (arrVal) {
        return equalPosPat(val, arrVal);
      });
    };

    const findIndexPosPat = function (arr, val) {
      return arr.findIndex(function (arrVal) {
        return equalPosPat(val, arrVal);
      });
    };

    // Per-frame Functional Groups Sequence
    const perFrameFuncGroupSequence =
      safeGetAllLocal(TagKeys.PerFrameFunctionalGroupsSequence);
    if (typeof perFrameFuncGroupSequence === 'undefined') {
      throw new Error('Missing or empty per frame functional sequence');
    }
    if (numberOfFrames !== perFrameFuncGroupSequence.length) {
      throw new Error(
        'perFrameFuncGroupSequence meta and numberOfFrames are not equal.');
    }
    // create frame info object from per frame func
    const frameInfos = [];
    for (let j = 0; j < perFrameFuncGroupSequence.length; ++j) {
      frameInfos.push(
        getSegmentFrameInfo(perFrameFuncGroupSequence[j]));
    }

    // check frame infos
    const framePosPats = [];
    for (let ii = 0; ii < frameInfos.length; ++ii) {
      if (!includesPosPat(framePosPats, frameInfos[ii].imagePosPat)) {
        framePosPats.push(frameInfos[ii].imagePosPat);
      }
      // store orientation if needed, avoid multi
      if (typeof frameInfos[ii].imageOrientationPatient !== 'undefined') {
        if (typeof imageOrientationPatient === 'undefined') {
          imageOrientationPatient = frameInfos[ii].imageOrientationPatient;
        } else {
          if (!arraySortEquals(
            imageOrientationPatient, frameInfos[ii].imageOrientationPatient)) {
            throw new Error('Unsupported multi orientation dicom seg.');
          }
        }
      }
      // store spacing if needed, avoid multi
      if (typeof frameInfos[ii].spacing !== 'undefined') {
        if (typeof spacing === 'undefined') {
          spacing = frameInfos[ii].spacing;
        } else {
          if (!spacing.equals(frameInfos[ii].spacing)) {
            throw new Error('Unsupported multi resolution dicom seg.');
          }
        }
      }
    }

    // check spacing and orientation
    if (typeof spacing === 'undefined') {
      throw new Error('No spacing found for DICOM SEG');
    }
    if (spacing.length() !== 3) {
      throw new Error('Incomplete spacing found for DICOM SEG');
    }
    if (typeof imageOrientationPatient === 'undefined') {
      throw new Error('No imageOrientationPatient found for DICOM SEG');
    }
    if (imageOrientationPatient.length !== 6) {
      throw new Error('Incomplete imageOrientationPatient found for DICOM SEG');
    }

    // orientation
    const rowCosines = new Vector3D(
      parseFloat(imageOrientationPatient[0]),
      parseFloat(imageOrientationPatient[1]),
      parseFloat(imageOrientationPatient[2]));
    const colCosines = new Vector3D(
      parseFloat(imageOrientationPatient[3]),
      parseFloat(imageOrientationPatient[4]),
      parseFloat(imageOrientationPatient[5]));
    const normal = rowCosines.crossProduct(colCosines);
    /* eslint-disable @stylistic/js/array-element-newline */
    const orientationMatrix = new Matrix33([
      rowCosines.getX(), colCosines.getX(), normal.getX(),
      rowCosines.getY(), colCosines.getY(), normal.getY(),
      rowCosines.getZ(), colCosines.getZ(), normal.getZ()
    ]);
    /* eslint-enable @stylistic/js/array-element-newline */

    // sort positions patient
    framePosPats.sort(getComparePosPat(orientationMatrix));

    const point3DFromArray = function (arr) {
      return new Point3D(arr[0], arr[1], arr[2]);
    };

    // frame origins
    const frameOrigins = [];
    for (let n = 0; n < framePosPats.length; ++n) {
      frameOrigins.push(point3DFromArray(framePosPats[n]));
    }

    // tmp geometry with correct spacing but only one slice
    const tmpGeometry = new Geometry(
      [frameOrigins[0]], size, spacing, orientationMatrix);

    // origin distance test
    // TODO: maybe use sliceSpacing / 10
    const isAboveEpsilon = function (value) {
      let res = value > REAL_WORLD_EPSILON;
      if (res) {
        // try larger epsilon
        res = value > REAL_WORLD_EPSILON * 10;
        if (!res) {
          // warn if epsilon < value < epsilon * 10
          logger.warn(
            'Using larger real world epsilon in SEG pos pat adding'
          );
        } else {
          res = value > REAL_WORLD_EPSILON * 100;
          if (!res) {
            // warn if epsilon < value < epsilon * 100
            logger.warn(
              'Using larger+ real world epsilon in SEG pos pat adding'
            );
          }
        }
      }
      return res;
    };

    // add possibly missing posPats
    const posPats = [];
    posPats.push(framePosPats[0]);
    let sliceIndex = 0;
    for (let g = 1; g < framePosPats.length; ++g) {
      ++sliceIndex;
      let index = new Index([0, 0, sliceIndex]);
      let point = tmpGeometry.indexToWorld(index).get3D();
      const frameOrigin = frameOrigins[g];
      // check if more pos pats are needed
      let dist = frameOrigin.getDistance(point);
      const distPrevious = dist;
      // TODO: good threshold?
      while (isAboveEpsilon(dist)) {
        logger.debug('Adding intermediate pos pats for DICOM seg at ' +
          point.toString());
        posPats.push([point.getX(), point.getY(), point.getZ()]);
        ++sliceIndex;
        index = new Index([0, 0, sliceIndex]);
        point = tmpGeometry.indexToWorld(index).get3D();
        dist = frameOrigin.getDistance(point);
        if (dist > distPrevious) {
          throw new Error(
            'Test distance is increasing when adding intermediate pos pats');
        }
      }
      // add frame pos pat
      posPats.push(framePosPats[g]);
    }

    // as many slices as posPats
    const numberOfSlices = posPats.length;

    // final geometry
    const geometry = new Geometry(
      [frameOrigins[0]], size, spacing, orientationMatrix);
    const uids = ['0'];
    for (let m = 1; m < numberOfSlices; ++m) {
      geometry.appendOrigin(point3DFromArray(posPats[m]), m);
      uids.push(m.toString());
    }

    const getFindSegmentFunc = function (number) {
      return function (item) {
        return item.number === number;
      };
    };

    // create output buffer
    const buffer =
      // @ts-ignore
      new pixelBuffer.constructor(sliceSize * numberOfSlices);
    buffer.fill(0);
    // merge frame buffers
    let sliceOffset = null;
    let frameOffset = null;
    for (let f = 0; f < frameInfos.length; ++f) {
      // get the slice index from the position in the posPat array
      sliceIndex = findIndexPosPat(posPats, frameInfos[f].imagePosPat);
      frameOffset = sliceSize * f;
      sliceOffset = sliceSize * sliceIndex;
      // get the frame display value
      const frameSegment = segments.find(
        getFindSegmentFunc(frameInfos[f].refSegmentNumber)
      );
      for (let l = 0; l < sliceSize; ++l) {
        if (pixelBuffer[frameOffset + l] !== 0) {
          const offset = sliceOffset + l;
          if (hasDisplayRGBValue) {
            buffer[offset] = frameSegment.number;
          } else {
            buffer[offset] = frameSegment.displayValue;
          }
        }
      }
    }

    // create image
    const image = new Image(geometry, buffer, uids);
    if (hasDisplayRGBValue) {
      image.setPhotometricInterpretation('PALETTE COLOR');
      image.setPaletteColourMap(paletteColourMap);
    }
    // meta information
    const meta = getDefaultDicomSegJson();

    // Study
    meta.StudyDate = safeGetLocal(TagKeys.StudyDate);
    meta.StudyTime = safeGetLocal(TagKeys.StudyTime);
    meta.StudyInstanceUID = safeGetLocal(TagKeys.StudyInstanceUID);
    meta.StudyID = safeGetLocal(TagKeys.StudyID);
    // Series
    meta.SeriesDate = safeGetLocal(TagKeys.SeriesDate);
    meta.SeriesTime = safeGetLocal(TagKeys.SeriesTime);
    meta.SeriesInstanceUID = safeGetLocal(TagKeys.SeriesInstanceUID);
    meta.SeriesNumber = safeGetLocal(TagKeys.SeriesNumber);
    // ReferringPhysicianName
    meta.ReferringPhysicianName = safeGetLocal(TagKeys.ReferringPhysicianName);
    // patient info
    meta.PatientName = safeGetLocal(TagKeys.PatientName);
    meta.PatientID = safeGetLocal(TagKeys.PatientID);
    meta.PatientBirthDate = safeGetLocal(TagKeys.PatientBirthDate);
    meta.PatientSex = safeGetLocal(TagKeys.PatientSex);
    // Enhanced General Equipment Module
    meta.Manufacturer = safeGetLocal(TagKeys.Manufacturer);
    meta.ManufacturerModelName = safeGetLocal(TagKeys.ManufacturerModelName);
    meta.DeviceSerialNumber = safeGetLocal(TagKeys.DeviceSerialNumber);
    meta.SoftwareVersions = safeGetLocal(TagKeys.SoftwareVersions);
    // dicom seg dimension
    meta.DimensionOrganizationSequence = dimension.organizations;
    meta.DimensionIndexSequence = dimension.indices;
    // custom
    meta.custom = {
      segments: segments,
      frameInfos: frameInfos,
      SOPInstanceUID: safeGetLocal(TagKeys.SOPInstanceUID)
    };

    // number of files: in this case equal to number slices,
    //   used to calculate buffer size
    meta.numberOfFiles = numberOfSlices;
    // FrameOfReferenceUID (optional)
    const frameOfReferenceUID = safeGetLocal(TagKeys.FrameOfReferenceUID);
    if (typeof frameOfReferenceUID !== 'undefined') {
      meta.FrameOfReferenceUID = frameOfReferenceUID;
    }
    // LossyImageCompression (optional)
    const lossyImageCompression = safeGetLocal(TagKeys.LossyImageCompression);
    if (typeof lossyImageCompression !== 'undefined') {
      meta.LossyImageCompression = lossyImageCompression;
    }

    image.setMeta(meta);

    return image;
  }

  /**
   * Convert a mask image into a DICOM segmentation object.
   *
   * @param {Image} image The mask image.
   * @param {MaskSegment[]} segments The mask segments.
   * @param {Image} sourceImage The source image.
   * @param {Object<string, any>} [extraTags] Optional list of extra tags.
   * @returns {Object<string, DataElement>} A list of dicom elements.
   */
  toDicom(
    image,
    segments,
    sourceImage,
    extraTags
  ) {
    // original image tags
    const tags = image.getMeta();

    // use image segments if not provided as input
    if (segments === undefined) {
      segments = tags.segments;
    }

    const geometry = image.getGeometry();
    const size = geometry.getSize();

    // (not in meta)
    tags.Rows = size.get(1);
    tags.Columns = size.get(0);
    // update content tags
    const now = new Date();
    tags.ContentDate = getDicomDate(dateToDateObj(now));
    tags.ContentTime = getDicomTime(dateToTimeObj(now));

    // keep source image StudyInstanceUID
    if (sourceImage !== undefined) {
      tags.StudyInstanceUID = (sourceImage.getMeta()).StudyInstanceUID;
    }

    // segments
    const segmentItems = [];
    for (const segment of segments) {
      segmentItems.push(getDicomSegmentItem(segment));
    }
    tags.SegmentSequence = {
      value: segmentItems
    };

    // Shared Functional Groups Sequence
    tags.SharedFunctionalGroupsSequence = {
      value: [
        {
          PlaneOrientationSequence: {
            value: [getDicomPlaneOrientationItem(geometry.getOrientation())]
          },
          PixelMeasuresSequence: {
            value: [getDicomMeasureItem(geometry.getSpacing())]
          }
        }
      ]
    };

    // image buffer to multi frame
    const roiBuffers = createRoiBuffers(image, segments);

    const frameInfos = [];

    // flatten buffer array
    const finalBuffers = [];
    const referencedSOPs = [];
    for (const segment of segments) {
      const number40 = segment.number;
      const number4 = number40 - 1;
      // check if buffer has values
      if (roiBuffers[number4] === undefined) {
        continue;
      }
      const keys1 = Object.keys(roiBuffers[number4]);
      // revert slice order
      for (let k1 = keys1.length - 1; k1 >= 0; --k1) {
        const key1 = Number.parseInt(keys1[k1], 10);
        finalBuffers.push(roiBuffers[number4][key1]);
        // frame info
        const posPat = image.getGeometry().getOrigins()[key1];
        const posPatArray = [posPat.getX(), posPat.getY(), posPat.getZ()];
        const frameInfo = {
          dimIndex: [number40, keys1.length - k1],
          imagePosPat: posPatArray,
          refSegmentNumber: number40
        };
        // derivation image info
        if (sourceImage !== undefined) {
          const sourceGeometry = sourceImage.getGeometry();
          const sourceIndex = sourceGeometry.worldToIndex(
            new Point([posPat.getX(), posPat.getY(), posPat.getZ()])
          );
          frameInfo.derivationImages = [
            {
              sourceImages: [
                {
                  referencedSOPInstanceUID:
                    sourceImage.getImageUid(sourceIndex),
                  referencedSOPClassUID:
                    (sourceImage.getMeta()).SOPClassUID
                }
              ]
            }
          ];
          // store as tag
          referencedSOPs.push({
            ReferencedSOPInstanceUID:
              sourceImage.getImageUid(sourceIndex),
            ReferencedSOPClassUID:
              (sourceImage.getMeta()).SOPClassUID
          });
        }
        frameInfos.push(frameInfo);
      }
    }

    tags.NumberOfFrames = finalBuffers.length.toString();

    // frame infos
    const frameInfosTag = [];
    for (const frameInfo of frameInfos) {
      frameInfosTag.push(getDicomSegmentFrameInfoItem(frameInfo));
    }
    tags.PerFrameFunctionalGroupsSequence = {
      value: frameInfosTag
    };

    // also store referenced SOPs in ReferencedSeriesSequence
    if (sourceImage !== undefined) {
      const refSeriesTag = [];
      refSeriesTag.push({
        ReferencedInstanceSequence: {
          value: referencedSOPs
        },
        SeriesInstanceUID: (sourceImage.getMeta()).SeriesInstanceUID
      });
      tags.ReferencedSeriesSequence = {
        value: refSeriesTag
      };
    }

    // merge extra tags if provided
    if (extraTags !== undefined) {
      mergeTags(tags, extraTags);
    }

    // convert JSON to DICOM element object
    const dicomElements = getElementsFromJSONTags(tags);

    // pixel value length: divide by 8 to trigger binary write
    const sliceSize = size.getDimSize(2);
    const pixVl = (finalBuffers.length * sliceSize) / 8;
    const de = new DataElement('OB');
    de.tag = new Tag('7FE0', '0010');
    de.vl = pixVl;
    de.value = finalBuffers;
    dicomElements['7FE00010'] = de;

    return dicomElements;
  }

} // class MaskFactory
