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
  getDicomMeasureItem,
  getDicomPlaneOrientationItem,
  getReferencedSeriesUID
} from '../dicom/dicomImage.js';
import {Tag} from '../dicom/dicomTag.js';
import {
  getElementsFromSimpleTagValues,
  mergeTagValues
} from '../dicom/simpleTagValues.js';
import {
  getSegment,
  getDicomSegmentItem,
} from '../dicom/dicomSegment.js';
import {
  DicomFunctionalGroup,
  getPerFrameFunctionalGroups,
  getDicomFunctionalGroupItem,
  getDimensionOrganization,
} from '../dicom/dicomFunctionalGroup.js';
import {getFramesGeometry} from '../dicom/dicomGeometry.js';
import {transferSyntaxKeywords} from '../dicom/dictionary.js';
import {Image} from '../image/image.js';
import {SegmentCollection} from './segmentCollection.js';
import {Point, point3DFromArray} from '../math/point.js';
import {
  REAL_WORLD_EPSILON
} from '../math/number.js';
import {logger} from '../utils/logger.js';
import {arraySortEquals} from '../utils/array.js';
import {ColourMap} from './luts.js';
import {DataElement} from '../dicom/dataElement.js';

/**
 * @import {MaskSegment} from '../dicom/dicomSegment.js';
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

    // slice size, used to validate the pixel buffer length
    const size2D = getImage2DSize(dataElements);
    const sliceSize = size2D[0] * size2D[1];

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

    const findPointIndex = function (arr, val) {
      return arr.findIndex(function (arrVal) {
        return val.equals(arrVal);
      });
    };

    // Per-frame Functional Groups Sequence
    const funcGroups =
      getPerFrameFunctionalGroups(dataElements, numberOfFrames);
    if (typeof funcGroups === 'undefined') {
      throw new Error('Missing or empty per frame functional sequence');
    }

    // geometry
    let refOrigins;
    if (typeof refImage !== 'undefined') {
      refOrigins = refImage.getGeometry().getOrigins();
    }
    const geometry = getFramesGeometry(
      dataElements,
      funcGroups,
      true,
      refOrigins
    );
    geometry.sortOrigins();

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
    for (let f = 0; f < funcGroups.length; ++f) {
      // get the slice index from the position in the mask origins array
      const frameOrigin = point3DFromArray(funcGroups[f].imagePosPat);
      sliceIndex = findPointIndex(maskOrigins, frameOrigin);
      // should not be possible but just in case...
      if (sliceIndex === -1) {
        throw new Error('Cannot find frame origin in mask origins');
      }
      // get the frame display value
      const frameSegment = segments.find(
        getFindSegmentFunc(funcGroups[f].refSegmentNumber)
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
      frameInfos: funcGroups,
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

    const funcGroups = [];

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
        const funcGroup = new DicomFunctionalGroup(
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
          funcGroup.derivationImages = [
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
        funcGroups.push(funcGroup);
      }
    }

    tags.NumberOfFrames = finalBuffers.length.toString();

    // frame functional groups
    const funcGroupsTag = [];
    for (const funcGroup of funcGroups) {
      funcGroupsTag.push(getDicomFunctionalGroupItem(funcGroup));
    }
    tags.PerFrameFunctionalGroupsSequence = {
      value: funcGroupsTag
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
      mergeTagValues(tags, extraTags);
    }

    // convert JSON to DICOM element object
    const dicomElements = getElementsFromSimpleTagValues(tags);

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
 * share the same spacing and orientation; the wider of the two geometries
 * (the one with more slices) is used as the merged geometry, so a mask
 * that only covers a sub-range of the other's slices does not get clipped.
 * Brush-painted masks (no per-segment SegmentCollection data) are supported.
 *
 * The returned image can be saved with the standard
 * `new MaskFactory().toDicom(merged, undefined, sourceImage)` workflow.
 *
 * @param {Image} mask1 The first mask (provides meta).
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

  // use the wider geometry (more slices) as the merged geometry so that
  // a mask covering fewer slices than the other does not get clipped
  const mask2IsWider =
    geometry2.getSize().get(2) > geometry1.getSize().get(2);
  const baseGeometry = mask2IsWider ? geometry2 : geometry1;
  const baseOrigins = baseGeometry.getOrigins();
  const sliceSize = baseGeometry.getSize().getDimSize(2);

  // slice indices from getSegmentBuffers are local to each mask's own
  // geometry; map the non-base mask's indices to their matching slice
  // in the base geometry by origin position, since the two masks are
  // not guaranteed to share the same slice count, ordering or coverage
  const getSliceIndexMap = function (fromGeometry, fromLabel) {
    const fromOrigins = fromGeometry.getOrigins();
    return fromOrigins.map((fromOrigin, index) => {
      let closestIndex = -1;
      let minDist = Infinity;
      for (let i = 0; i < baseOrigins.length; ++i) {
        const dist = fromOrigin.getDistance(baseOrigins[i]);
        if (dist < minDist) {
          minDist = dist;
          closestIndex = i;
        }
      }
      if (minDist > REAL_WORLD_EPSILON * 100) {
        throw new Error(
          `mergeMaskImages: mask${fromLabel} slice ${index
          } has no matching slice in the merged geometry`
        );
      }
      if (minDist > REAL_WORLD_EPSILON) {
        logger.warn(
          `mergeMaskImages: mask${fromLabel} slice ${index
          } is far from its closest merged-geometry slice (${minDist}).`
        );
      }
      return closestIndex;
    });
  };
  const sliceIndexMap1 = mask2IsWider
    ? getSliceIndexMap(geometry1, '1') : undefined;
  const sliceIndexMap2 = mask2IsWider
    ? undefined : getSliceIndexMap(geometry2, '2');

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

  const mergedCollection = new SegmentCollection(baseGeometry);

  // add frames from mask1
  const hasRGB1 = mask1.getPhotometricInterpretation() === 'PALETTE COLOR';
  for (const [segIdxStr, slices] of Object.entries(roiBuffers1)) {
    const segNum = Number(segIdxStr) + 1;
    const seg1 = segments1.find(s => s.number === segNum);
    const value = hasRGB1 ? segNum : (seg1?.displayValue ?? segNum);
    for (const [sliceIdxStr, sliceBuf] of Object.entries(slices)) {
      const localIndex = Number(sliceIdxStr);
      const baseIndex = sliceIndexMap1
        ? sliceIndexMap1[localIndex] : localIndex;
      mergedCollection.addFrame(
        segNum, sliceBuf, 0, baseIndex, sliceSize, value
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
      const localIndex = Number(sliceIdxStr);
      const baseIndex = sliceIndexMap2
        ? sliceIndexMap2[localIndex] : localIndex;
      mergedCollection.addFrame(
        newSegNum, sliceBuf, 0, baseIndex, sliceSize, value
      );
    }
  }

  const uids = baseOrigins.map((_, i) => i.toString());
  const mergedImage = new Image(
    baseGeometry, mergedCollection.getLabelMap(), uids);
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
