import {
  dateToDateObj,
  getDicomDate,
  dateToTimeObj,
  getDicomTime,
} from '../dicom/dicomDate.js';
import {
  safeGet,
  safeGetAll
} from '../dicom/dataElement.js';
import {
  getImage2DSize,
  getSpacingFromMeasure,
  getDicomMeasureItem,
  getDicomPlaneOrientationItem,
  getReferencedSeriesUID
} from '../dicom/dicomImage.js';
import {Tag} from '../dicom/dicomTag.js';
import {
  getElementsFromJSONTags,
  mergeTags
} from '../dicom/simpleTagValues.js';
import {
  getSegment,
  getDicomSegmentItem,
} from '../dicom/dicomSegment.js';
import {
  DicomSegmentFrameInfo,
  getSegmentFrameInfo,
  getDicomSegmentFrameInfoItem,
  getDimensionOrganization,
} from '../dicom/dicomSegmentFrameInfo.js';
import {transferSyntaxKeywords} from '../dicom/dictionary.js';
import {Image} from '../image/image.js';
import {SegmentCollection} from './segmentCollection.js';
import {Geometry} from '../image/geometry.js';
import {getOrientationFromCosines} from '../math/orientation.js';
import {Point, Point3D} from '../math/point.js';
import {Index} from '../math/index.js';
import {
  REAL_WORLD_EPSILON,
  isAboveEpsilon
} from '../math/number.js';
import {logger} from '../utils/logger.js';
import {arraySortEquals} from '../utils/array.js';
import {Size} from './size.js';
import {ColourMap} from './luts.js';
import {DataElement} from '../dicom/dataElement.js';

/**
 * @import {Matrix33} from '../math/matrix.js';
 * @import {MaskSegment} from '../dicom/dicomSegment.js';
 * @import {Spacing} from '../image/spacing.js';
 * @import {SimpleTagValues} from '../dicom/simpleTagValues.js';
 */

/**
 * @typedef {Record<string, DataElement>} DataElements
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
  PerFrameFunctionalGroupsSequence: '52009230'
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
      throw new Error(`Missing or empty ${tagDefinition.name}`);
    }
  } else if (typeof element === 'undefined') {
    // non mandatory value, exit
    return;
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
      `Unsupported ${tagDefinition.name} value: ${tagValue}`);
  }
}

/**
 * List of DICOM Seg required tags.
 */
const RequiredDicomTags = [
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
 * @returns {SimpleTagValues} The default tags.
 */
export function getDefaultDicomSegJson() {
  /** @type {SimpleTagValues} */
  const tags = {};
  for (const tag of RequiredDicomTags) {
    tags[tag.name] = tag.enum[0];
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
   * @param {Record<string, DataElement>} _dicomElements The DICOM tags.
   * @returns {string|undefined} A possible warning.
   */
  checkElements(_dicomElements) {
    return undefined;
  }

  /**
   * Get an {@link Image} object from the read DICOM file.
   *
   * @param {Record<string, DataElement>} dataElements The DICOM tags.
   * @param {Uint8Array} pixelBuffer The pixel buffer.
   * @param {Image} [refImage] Reference image, code will use its
   *   origins if present (best) or try to calculate them.
   * @returns {Image} A new Image.
   * @throws {Error} Error for missing or wrong data.
   */
  create(dataElements, pixelBuffer, refImage) {
    // safe get shortcuts
    const safeGetLocal = function (key) {
      return safeGet(dataElements, key);
    };
    const safeGetAllLocal = function (key) {
      return safeGetAll(dataElements, key);
    };

    // check required and supported tags
    for (const tag of RequiredDicomTags) {
      checkTag(dataElements, tag);
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
        `Buffer and numberOfFrames meta are not equal ${
          numberOfFrames } ${pixelBuffer.length / sliceSize}`);
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

    const findPointIndex = function (arr, val) {
      return arr.findIndex(function (arrVal) {
        return val.equals(arrVal);
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
        } else if (!arraySortEquals(
          imageOrientationPatient, frameInfos[ii].imageOrientationPatient)) {
          throw new Error('Unsupported multi orientation dicom seg.');
        }
      }
      // store spacing if needed, avoid multi
      if (typeof frameInfos[ii].spacing !== 'undefined') {
        if (typeof spacing === 'undefined') {
          spacing = frameInfos[ii].spacing;
        } else if (!spacing.equals(frameInfos[ii].spacing)) {
          throw new Error('Unsupported multi resolution dicom seg.');
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
    // orientation
    const orientationMatrix = getOrientationFromCosines(
      imageOrientationPatient.map((item) => parseFloat(item))
    );
    if (typeof orientationMatrix === 'undefined') {
      throw new Error('Invalid imageOrientationPatient found for DICOM SEG');
    }

    // sort positions patient
    framePosPats.sort(getComparePosPat(orientationMatrix));

    const point3DFromArray = function (arr) {
      return new Point3D(arr[0], arr[1], arr[2]);
    };

    // frame origins
    const frameOrigins = [];
    for (const framePosPat of framePosPats) {
      frameOrigins.push(point3DFromArray(framePosPat));
    }

    let geometry;
    if (typeof refImage !== 'undefined') {
      geometry = this.#getGeometryFromReference(
        frameOrigins,
        size,
        spacing,
        orientationMatrix,
        refImage.getGeometry().getOrigins()
      );
    } else {
      geometry = this.#calculateGeometry(
        frameOrigins,
        size,
        spacing,
        orientationMatrix
      );
    }

    const numberOfSlices = geometry.getSize().get(2);

    const getFindSegmentFunc = function (number) {
      return function (item) {
        return item.number === number;
      };
    };

    // build segment collection: per-segment, per-slice pixel data
    const collection = new SegmentCollection(geometry);

    const maskOrigins = geometry.getOrigins();
    let sliceIndex;
    for (let f = 0; f < frameInfos.length; ++f) {
      // get the slice index from the position in the mask origins array
      const frameOrigin = point3DFromArray(frameInfos[f].imagePosPat);
      sliceIndex = findPointIndex(maskOrigins, frameOrigin);
      // should not be possible but just in case...
      if (sliceIndex === -1) {
        throw new Error('Cannot find frame origin in mask origins');
      }
      // get the frame display value
      const frameSegment = segments.find(
        getFindSegmentFunc(frameInfos[f].refSegmentNumber)
      );
      const value = hasDisplayRGBValue
        ? frameSegment.number
        : frameSegment.displayValue;
      collection.addFrame(
        frameSegment.number,
        pixelBuffer,
        sliceSize * f, // frameOffset
        sliceIndex,
        sliceSize,
        value
      );
    }

    // simple uids
    const uids = [];
    for (let m = 0; m < numberOfSlices; ++m) {
      uids.push(m.toString());
    }

    // create image from the merged label map
    const image = new Image(geometry, collection.getLabelMap(), uids);
    image.setSegmentCollection(collection);

    if (hasDisplayRGBValue) {
      image.setPhotometricInterpretation('PALETTE COLOR');
      image.setPaletteColourMap(paletteColourMap);
    }
    // meta information
    /** @type {Record<string, any>} */
    const meta = getDefaultDicomSegJson();

    // meta tags
    const metaKeys = Object.keys(MetaTagKeys);
    for (const key of metaKeys) {
      meta[key] = safeGetLocal(MetaTagKeys[key]);
    }

    // dicom seg dimension
    meta.DimensionOrganizationSequence = dimension.organizations;
    meta.DimensionIndexSequence = dimension.indices;
    // custom
    meta.custom = {
      segments,
      frameInfos,
      SOPInstanceUID: safeGetLocal(TagKeys.SOPInstanceUID),
      referencedSeriesUID: getReferencedSeriesUID(dataElements)
    };

    // get length unit from ref image
    meta.lengthUnit = refImage.getMeta().lengthUnit;

    // number of files: in this case equal to number slices,
    //   used to calculate buffer size
    meta.numberOfFiles = numberOfSlices;

    image.setMeta(meta);

    return image;
  }

  /**
   * Check the distance between a frame origin and a reference origin.
   *
   * @param {Point3D} frameOrigin The frame origin to check.
   * @param {Point3D} refOrigin The reference origin to check against.
   * @param {number} index The frame index, used for error message.
   * @throws {Error} If distance is too high.
   */
  #checkDistance(frameOrigin, refOrigin, index) {
    const dist = frameOrigin.getDistance(refOrigin);
    // warn is bigger than epsilon, error if bigger than 100*epsilon
    if (dist > REAL_WORLD_EPSILON) {
      if (dist < REAL_WORLD_EPSILON * 100) {
        logger.warn(
          `Mask frame origin ${index} is far from reference origin (${dist}).`
        );
      } else {
        throw new Error(`No reference origin for mask frame origin ${index}`);
      }
    }
  }

  /**
   * Get the mask geometry from reference image.
   *
   * @param {Point3D[]} frameOrigins The frame origins.
   * @param {Size} size The mask temporary size.
   * @param {Spacing} spacing The mask spcing.
   * @param {Matrix33} orientationMatrix The mask orientation.
   * @param {Point3D[]} refOrigins The reference image origins.
   * @returns {Geometry} The final mask geometry.
   */
  #getGeometryFromReference(
    frameOrigins, size, spacing, orientationMatrix, refOrigins) {

    const maskOrigins = [];
    maskOrigins.push(frameOrigins[0]);
    let previousIndex = frameOrigins[0].getClosest(refOrigins);
    this.#checkDistance(frameOrigins[0], refOrigins[previousIndex], 0);
    for (let i = 1; i < frameOrigins.length; ++i) {
      const frameOrigin = frameOrigins[i];
      const currentIndex = frameOrigin.getClosest(refOrigins);
      this.#checkDistance(frameOrigin, refOrigins[currentIndex], i);
      if (currentIndex !== previousIndex + 1) {
        for (let j = previousIndex + 1; j < currentIndex; ++j) {
          maskOrigins.push(refOrigins[j]);
        }
      }
      maskOrigins.push(frameOrigin);
      previousIndex = currentIndex;
    }

    // final geometry
    const geometry = new Geometry(
      [frameOrigins[0]], size, spacing, orientationMatrix);
    // append origins
    for (let m = 1; m < maskOrigins.length; ++m) {
      geometry.appendOrigin(maskOrigins[m], m);
    }

    return geometry;
  }

  /**
   * Calculate the mask geometry from frame origins.
   *
   * @param {Point3D[]} frameOrigins The frame origins.
   * @param {Size} size The mask temporary size.
   * @param {Spacing} spacing The mask spcing.
   * @param {Matrix33} orientationMatrix The mask orientation.
   * @returns {Geometry} The final mask geometry.
   */
  #calculateGeometry(frameOrigins, size, spacing, orientationMatrix) {
    logger.warn('Guessing image geometry for DICOM SEG');

    // tmp geometry with correct spacing but only one slice
    const tmpGeometry = new Geometry(
      [frameOrigins[0]], size, spacing, orientationMatrix);

    // add possibly missing origins
    const maskOrigins = [];
    maskOrigins.push(frameOrigins[0]);
    let sliceIndex = 0;
    for (let g = 1; g < frameOrigins.length; ++g) {
      ++sliceIndex;
      let index = new Index([0, 0, sliceIndex]);
      let point = tmpGeometry.indexToWorld(index).get3D();
      const frameOrigin = frameOrigins[g];
      // check if more pos pats are needed
      let dist = frameOrigin.getDistance(point);
      const distPrevious = dist;
      // TODO: good threshold?
      while (isAboveEpsilon(dist)) {
        logger.debug(`Adding intermediate pos pats for DICOM seg at ${
          point.toString() }`);
        maskOrigins.push(point);
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
      maskOrigins.push(frameOrigin);
    }

    // final geometry
    const geometry = new Geometry(
      [frameOrigins[0]], size, spacing, orientationMatrix);
    // append origins
    for (let m = 1; m < maskOrigins.length; ++m) {
      geometry.appendOrigin(maskOrigins[m], m);
    }

    return geometry;
  }

  /**
   * Convert a mask image into a DICOM segmentation object.
   *
   * @param {Image} image The mask image.
   * @param {MaskSegment[]} segments The mask segments.
   * @param {Image} sourceImage The source image.
   * @param {SimpleTagValues} [extraTags] Optional list of extra tags.
   * @returns {Record<string, DataElement>} A list of dicom elements.
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
    const roiBuffers = image.getSegmentCollection().getSegmentBuffers(segments);

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
        // const frameInfo = {
        //   dimIndex: [number40, keys1.length - k1],
        //   imagePosPat: posPatArray,
        //   refSegmentNumber: number40
        // };
        const frameInfo = new DicomSegmentFrameInfo(
          [number40, keys1.length - k1],
          posPatArray,
          undefined,
          number40
        );
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

/**
 * Merge two mask images into a new combined mask image.
 *
 * Segments from mask2 that share a segment number with mask1 are renumbered
 * (bumped to the next available number) to avoid conflicts. Both masks must
 * reference the same geometry (same spatial volume).
 * Brush-painted masks (no per-segment SegmentCollection data) are supported.
 *
 * The returned image can be saved with the standard
 * `new MaskFactory().toDicom(merged, undefined, sourceImage)` workflow.
 *
 * @param {Image} mask1 The first mask (provides base geometry and meta).
 * @param {Image} mask2 The second mask to merge into mask1.
 * @returns {Image} The new merged mask image.
 */
export function mergeMaskImages(mask1, mask2) {
  const geometry1 = mask1.getGeometry();
  const geometry2 = mask2.getGeometry();
  if (!geometry1.getSpacing().equals(geometry2.getSpacing())) {
    throw new Error('mergeMaskImages: masks must have similar spacings');
  }
  if (!geometry1.getOrientation().isSimilar(
    geometry2.getOrientation(), REAL_WORLD_EPSILON)) {
    throw new Error('mergeMaskImages: masks must have similar orientations');
  }
  const sliceSize = geometry1.getSize().getDimSize(2);
  const segments1 = mask1.getMeta().custom?.segments ?? [];
  const segments2 = mask2.getMeta().custom?.segments ?? [];

  // getSegmentBuffers handles both DICOM and brush paths; for brush masks
  // with no segments metadata it auto-discovers numbers from the label map
  const roiBuffers1 =
    mask1.getSegmentCollection().getSegmentBuffers(segments1);
  const roiBuffers2 =
    mask2.getSegmentCollection().getSegmentBuffers(segments2);

  // seg numbers from segments or roiBUffers
  let segNums1;
  if (segments1.length > 0) {
    segNums1 = segments1.map(s => s.number);
  } else {
    // roiBuffers keys are segIndex = segNum - 1
    segNums1 = Object.keys(roiBuffers1).map(k => Number(k) + 1);
  }
  let segNums2;
  if (segments2.length > 0) {
    segNums2 = segments2.map(s => s.number);
  } else {
    // roiBuffers keys are segIndex = segNum - 1
    segNums2 = Object.keys(roiBuffers2).map(k => Number(k) + 1);
  }

  // remap mask2 segment numbers that conflict with mask1
  const usedNumbers = new Set(segNums1);
  let nextNumber = usedNumbers.size > 0 ? Math.max(...usedNumbers) + 1 : 1;
  /** @type {Map<number, number>} */
  const remap = new Map();
  for (const num2 of segNums2) {
    if (usedNumbers.has(num2)) {
      const newNum = nextNumber++;
      logger.warn(
        'mergeMaskImages: segment number conflict, ' +
        `remapping ${num2} to ${newNum}`
      );
      remap.set(num2, newNum);
    } else {
      remap.set(num2, num2);
      usedNumbers.add(num2);
    }
  }

  const mergedSegments = [
    ...segments1,
    ...segments2.map(seg => ({...seg, number: remap.get(seg.number)}))
  ];

  const mergedCollection = new SegmentCollection(geometry1);

  // add frames from mask1
  const hasRGB1 = mask1.getPhotometricInterpretation() === 'PALETTE COLOR';
  for (const [segIdxStr, slices] of Object.entries(roiBuffers1)) {
    const segNum = Number(segIdxStr) + 1;
    const seg1 = segments1.find(s => s.number === segNum);
    const value = hasRGB1 ? segNum : (seg1?.displayValue ?? segNum);
    for (const [sliceIdxStr, sliceBuf] of Object.entries(slices)) {
      mergedCollection.addFrame(
        segNum, sliceBuf, 0, Number(sliceIdxStr), sliceSize, value
      );
    }
  }

  // add frames from mask2
  const hasRGB2 = mask2.getPhotometricInterpretation() === 'PALETTE COLOR';
  for (const [segIdxStr, slices] of Object.entries(roiBuffers2)) {
    const segNum = Number(segIdxStr) + 1;
    const newSegNum = remap.get(segNum);
    const seg2 = segments2.find(s => s.number === segNum);
    const value = hasRGB2 ? newSegNum : (seg2?.displayValue ?? newSegNum);
    for (const [sliceIdxStr, sliceBuf] of Object.entries(slices)) {
      mergedCollection.addFrame(
        newSegNum, sliceBuf, 0, Number(sliceIdxStr), sliceSize, value
      );
    }
  }

  const uids = geometry1.getOrigins().map((_, i) => i.toString());
  const mergedImage = new Image(
    geometry1, mergedCollection.getLabelMap(), uids);
  mergedImage.setSegmentCollection(mergedCollection);

  // set palette colour map if possible
  if (hasRGB1 || hasRGB2) {
    const p1 = mask1.getPaletteColourMap();
    const redLut = p1 ? [...p1.red] : new Array(256).fill(0);
    const greenLut = p1 ? [...p1.green] : new Array(256).fill(0);
    const blueLut = p1 ? [...p1.blue] : new Array(256).fill(0);
    const p2 = mask2.getPaletteColourMap();
    if (p2) {
      for (const num of segNums2) {
        const newSegNum = remap.get(num);
        redLut[newSegNum] = p2.red[num];
        greenLut[newSegNum] = p2.green[num];
        blueLut[newSegNum] = p2.blue[num];
      }
    }
    mergedImage.setPhotometricInterpretation('PALETTE COLOR');
    mergedImage.setPaletteColourMap(new ColourMap(redLut, greenLut, blueLut));
  } else {
    mergedImage.setPhotometricInterpretation(
      mask1.getPhotometricInterpretation()
    );
  }

  const mergedMeta = structuredClone(mask1.getMeta());
  if (typeof mergedMeta.custom === 'undefined') {
    mergedMeta.custom = {};
  }
  mergedMeta.custom.segments = mergedSegments;
  mergedImage.setMeta(mergedMeta);

  return mergedImage;
}
