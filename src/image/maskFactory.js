import {getImage2DSize} from '../dicom/dicomElementsWrapper';
import {Spacing} from '../image/spacing';
import {Image} from '../image/image';
import {Geometry, getSliceGeometrySpacing} from '../image/geometry';
import {Point3D} from '../math/point';
import {Vector3D} from '../math/vector';
import {Index} from '../math/index';
import {Matrix33, REAL_WORLD_EPSILON} from '../math/matrix';
import {logger} from '../utils/logger';
import {arraySortEquals} from '../utils/array';
import {
  isEqualRgb,
  cielabToSrgb,
  uintLabToLab
} from '../utils/colour';
import {Size} from './size';

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
 * @param {object} rootElement The root dicom element.
 * @param {object} tagDefinition The tag definition as {name, tag, type, enum}.
 */
function checkTag(rootElement, tagDefinition) {
  const element = rootElement[tagDefinition.tag];
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
 * List of DICOM Seg required tags.
 */
const RequiredDicomSegTags = [
  {
    name: 'TransferSyntaxUID',
    tag: 'x00020010',
    type: '1',
    enum: ['1.2.840.10008.1.2.1']
  },
  {
    name: 'MediaStorageSOPClassUID',
    tag: 'x00020002',
    type: '1',
    enum: ['1.2.840.10008.5.1.4.1.1.66.4']
  },
  {
    name: 'SOPClassUID',
    tag: 'x00020002',
    type: '1',
    enum: ['1.2.840.10008.5.1.4.1.1.66.4']
  },
  {
    name: 'Modality',
    tag: 'x00080060',
    type: '1',
    enum: ['SEG']
  },
  {
    name: 'SegmentationType',
    tag: 'x00620001',
    type: '1',
    enum: ['BINARY']
  },
  {
    name: 'DimensionOrganizationType',
    tag: 'x00209311',
    type: '3',
    enum: ['3D']
  },
  {
    name: 'ImageType',
    tag: 'x00080008',
    type: '1',
    enum: [['DERIVED', 'PRIMARY']]
  },
  {
    name: 'SamplesPerPixel',
    tag: 'x00280002',
    type: '1',
    enum: [1]
  },
  {
    name: 'PhotometricInterpretation',
    tag: 'x00280004',
    type: '1',
    enum: ['MONOCHROME2']
  },
  {
    name: 'PixelRepresentation',
    tag: 'x00280103',
    type: '1',
    enum: [0]
  },
  {
    name: 'BitsAllocated',
    tag: 'x00280100',
    type: '1',
    enum: [1]
  },
  {
    name: 'BitsStored',
    tag: 'x00280101',
    type: '1',
    enum: [1]
  },
  {
    name: 'HighBit',
    tag: 'x00280102',
    type: '1',
    enum: [0]
  },
];

/**
 * Get the default DICOM seg tags as an object.
 *
 * @returns {object} The default tags.
 */
function getDefaultDicomSegJson() {
  const tags = {};
  for (let i = 0; i < RequiredDicomSegTags.length; ++i) {
    const reqTag = RequiredDicomSegTags[i];
    tags[reqTag.name] = reqTag.enum[0];
  }
  return tags;
}

/**
 * Check the dimension organization from a dicom element.
 *
 * @param {object} rootElement The root dicom element.
 * @returns {object} The dimension organizations and indices.
 */
function getDimensionOrganization(rootElement) {
  // Dimension Organization Sequence (required)
  const orgSq = rootElement['00209221'];
  if (typeof orgSq === 'undefined' || orgSq.value.length !== 1) {
    throw new Error('Unsupported dimension organization sequence length');
  }
  // Dimension Organization UID
  const orgUID = orgSq.value[0]['00209164'].value[0];

  // Dimension Index Sequence (conditionally required)
  const indices = [];
  const indexSqElem = rootElement['00209222'];
  if (typeof indexSqElem !== 'undefined') {
    const indexSq = indexSqElem.value;
    // expecting 2D index
    if (indexSq.length !== 2) {
      throw new Error('Unsupported dimension index sequence length');
    }
    let indexPointer;
    for (let i = 0; i < indexSq.length; ++i) {
      // Dimension Organization UID (required)
      const indexOrg = indexSq[i]['00209164'].value[0];
      if (indexOrg !== orgUID) {
        throw new Error(
          'Dimension Index Sequence contains a unknown Dimension Organization');
      }
      // Dimension Index Pointer (required)
      indexPointer = indexSq[i]['00209165'].value[0];

      const index = {
        DimensionOrganizationUID: indexOrg,
        DimensionIndexPointer: indexPointer
      };
      // Dimension Description Label (optional)
      if (typeof indexSq[i]['00209421'] !== 'undefined') {
        index.DimensionDescriptionLabel = indexSq[i]['00209421'].value[0];
      }
      // store
      indices.push(index);
    }
    // expecting Image Position at last position
    if (indexPointer !== '(0020,0032)') {
      throw new Error('Unsupported non image position as last index');
    }
  }

  return {
    organizations: {
      value: [
        {
          DimensionOrganizationUID: orgUID
        }
      ]
    },
    indices: {
      value: indices
    }
  };
}

/**
 * Get a code object from a dicom element.
 *
 * @param {object} element The dicom element.
 * @returns {object} A code object.
 */
function getCode(element) {
  // meaning -> CodeMeaning (type1)
  const code = {
    meaning: element['00080104'].value[0]
  };
  // value -> CodeValue (type1C)
  // longValue -> LongCodeValue (type1C)
  // urnValue -> URNCodeValue (type1C)
  if (element['00080100']) {
    code.value = element['00080100'].value[0];
  } else if (element['00080119']) {
    code.longValue = element['00080119'].value[0];
  } else if (element['00080120']) {
    code.urnValue = element['00080120'].value[0];
  } else {
    throw Error('Invalid code with no value, no long value and no urn value.');
  }
  // schemeDesignator -> CodingSchemeDesignator (type1C)
  if (typeof code.value !== 'undefined' ||
    typeof code.longValue !== 'undefined') {
    if (element['00080102']) {
      code.schemeDesignator = element['00080102'].value[0];
    } else {
      throw Error(
        'No coding sheme designator when code value or long value is present');
    }
  }
  return code;
}

/**
 * Get a segment object from a dicom element.
 *
 * @param {object} element The dicom element.
 * @returns {object} A segment object.
 */
function getSegment(element) {
  // number -> SegmentNumber (type1)
  // label -> SegmentLabel (type1)
  // algorithmType -> SegmentAlgorithmType (type1)
  const segment = {
    number: element['00620004'].value[0],
    label: element['00620005'].value[0],
    algorithmType: element['00620008'].value[0]
  };
  // algorithmName -> SegmentAlgorithmName (type1C)
  if (element['00620009']) {
    segment.algorithmName = element['00620009'].value[0];
  }
  // // required if type is not MANUAL
  // if (segment.algorithmType !== 'MANUAL' &&
  //   (typeof segment.algorithmName === 'undefined' ||
  //   segment.algorithmName.length === 0)) {
  //   throw new Error('Empty algorithm name for non MANUAL algorithm type.');
  // }
  // displayValue ->
  // - RecommendedDisplayGrayscaleValue
  // - RecommendedDisplayCIELabValue converted to RGB
  if (typeof element['0062000C'] !== 'undefined') {
    segment.displayValue = element['006200C'].value;
  } else if (typeof element['0062000D'] !== 'undefined') {
    const cielabElement = element['0062000D'].value;
    const rgb = cielabToSrgb(uintLabToLab({
      l: cielabElement[0],
      a: cielabElement[1],
      b: cielabElement[2]
    }));
    segment.displayValue = rgb;
  }
  // Segmented Property Category Code Sequence (type1, only one)
  if (typeof element['00620003'] !== 'undefined') {
    segment.propertyCategoryCode =
      getCode(element['00620003'].value[0]);
  } else {
    throw Error('Missing Segmented Property Category Code Sequence.');
  }
  // Segmented Property Type Code Sequence (type1)
  if (typeof element['0062000F'] !== 'undefined') {
    segment.propertyTypeCode =
      getCode(element['0062000F'].value[0]);
  } else {
    throw Error('Missing Segmented Property Type Code Sequence.');
  }
  // tracking Id and UID (type1C)
  if (typeof element['00620020'] !== 'undefined') {
    segment.trackingId = element['00620020'].value[0];
    segment.trackingUid = element['00620021'].value[0];
  }

  return segment;
}

/**
 * Check if two segment objects are equal.
 *
 * @param {object} seg1 The first segment.
 * @param {object} seg2 The second segment.
 * @returns {boolean} True if both segment are equal.
 */
export function isEqualSegment(seg1, seg2) {
  // basics
  if (typeof seg1 === 'undefined' ||
    typeof seg2 === 'undefined' ||
    seg1 === null ||
    seg2 === null) {
    return false;
  }
  let isEqual = seg1.number === seg2.number &&
    seg1.label === seg2.label &&
    seg1.algorithmType === seg2.algorithmType;
  // rgb
  if (typeof seg1.displayValue.r !== 'undefined') {
    if (typeof seg2.displayValue.r === 'undefined') {
      isEqual = false;
    } else {
      isEqual = isEqual &&
        isEqualRgb(seg1.displayValue, seg2.displayValue);
    }
  } else {
    isEqual = isEqual &&
      seg1.displayValue === seg2.displayValue;
  }
  // algorithmName
  if (typeof seg1.algorithmName !== 'undefined') {
    if (typeof seg2.algorithmName === 'undefined') {
      isEqual = false;
    } else {
      isEqual = isEqual &&
        seg1.algorithmName === seg2.algorithmName;
    }
  }

  return isEqual;
}

/**
 * Check if two segment objects are similar: either the
 * number or the displayValue are equal.
 *
 * @param {object} seg1 The first segment.
 * @param {object} seg2 The second segment.
 * @returns {boolean} True if both segment are similar.
 */
export function isSimilarSegment(seg1, seg2) {
  // basics
  if (typeof seg1 === 'undefined' ||
    typeof seg2 === 'undefined' ||
    seg1 === null ||
    seg2 === null) {
    return false;
  }
  let isSimilar = seg1.number === seg2.number;
  // rgb
  if (typeof seg1.displayValue.r !== 'undefined') {
    if (typeof seg2.displayValue.r === 'undefined') {
      isSimilar = false;
    } else {
      isSimilar = isSimilar ||
        isEqualRgb(seg1.displayValue, seg2.displayValue);
    }
  } else {
    isSimilar = isSimilar ||
      seg1.displayValue === seg2.displayValue;
  }

  return isSimilar;
}

/**
 * Get a spacing object from a dicom measure element.
 *
 * @param {object} measure The dicom element.
 * @returns {Spacing} A spacing object.
 */
function getSpacingFromMeasure(measure) {
  // Pixel Spacing
  if (typeof measure['00280030'] === 'undefined') {
    return null;
  }
  const pixelSpacing = measure['00280030'];
  const spacingValues = [
    parseFloat(pixelSpacing.value[0]),
    parseFloat(pixelSpacing.value[1])
  ];
  // Slice Thickness
  if (typeof measure['00180050'] !== 'undefined') {
    spacingValues.push(parseFloat(measure['00180050'].value[0]));
  } else if (typeof measure['00180088'] !== 'undefined') {
    // Spacing Between Slices
    spacingValues.push(parseFloat(measure['00180088'].value[0]));
  }
  return new Spacing(spacingValues);
}

/**
 * Get a frame information object from a dicom element.
 *
 * @param {object} groupItem The dicom element.
 * @returns {object} A frame information object.
 */
function getSegmentFrameInfo(groupItem) {
  // Derivation Image Sequence
  const derivationImages = [];
  if (typeof groupItem['00089124'] !== 'undefined') {
    const derivationImageSq = groupItem['00089124'].value;
    // Source Image Sequence
    for (let i = 0; i < derivationImageSq.length; ++i) {
      const sourceImages = [];
      if (typeof derivationImageSq[i]['00082112'] !== 'undefined') {
        const sourceImageSq = derivationImageSq[i]['00082112'].value;
        for (let j = 0; j < sourceImageSq.length; ++j) {
          const sourceImage = {};
          // Referenced SOP Class UID
          if (typeof sourceImageSq[j]['00081150'] !== 'undefined') {
            sourceImage.referencedSOPClassUID =
              sourceImageSq[j]['00081150'].value[0];
          }
          // Referenced SOP Instance UID
          if (typeof sourceImageSq[j]['00081155'] !== 'undefined') {
            sourceImage.referencedSOPInstanceUID =
              sourceImageSq[j]['00081155'].value[0];
          }
          sourceImages.push(sourceImage);
        }
      }
      derivationImages.push(sourceImages);
    }
  }
  // Frame Content Sequence (required, only one)
  const frameContentSq = groupItem['00209111'].value;
  // Dimension Index Value
  const dimIndex = frameContentSq[0]['00209157'].value;
  // Segment Identification Sequence (required, only one)
  const segmentIdSq = groupItem['0062000A'].value;
  // Referenced Segment Number
  const refSegmentNumber = segmentIdSq[0]['0062000B'].value[0];
  // Plane Position Sequence (required, only one)
  const planePosSq = groupItem['00209113'].value;
  // Image Position (Patient) (conditionally required)
  const imagePosPat = planePosSq[0]['00200032'].value;
  for (let p = 0; p < imagePosPat.length; ++p) {
    imagePosPat[p] = parseFloat(imagePosPat[p]);
  }
  const frameInfo = {
    dimIndex: dimIndex,
    imagePosPat: imagePosPat,
    derivationImages: derivationImages,
    refSegmentNumber: refSegmentNumber
  };
  // Plane Orientation Sequence
  if (typeof groupItem['00209116'] !== 'undefined') {
    const framePlaneOrientationSeq = groupItem['00209116'];
    if (framePlaneOrientationSeq.value.length !== 0) {
      // should only be one Image Orientation (Patient)
      const frameImageOrientation =
        framePlaneOrientationSeq.value[0]['00200037'].value;
      if (typeof frameImageOrientation !== 'undefined') {
        frameInfo.imageOrientationPatient = frameImageOrientation;
      }
    }
  }
  // Pixel Measures Sequence
  if (typeof groupItem['00289110'] !== 'undefined') {
    const framePixelMeasuresSeq = groupItem['00289110'];
    if (framePixelMeasuresSeq.value.length !== 0) {
      // should only be one
      const frameSpacing =
        getSpacingFromMeasure(framePixelMeasuresSeq.value[0]);
      if (typeof frameSpacing !== 'undefined') {
        frameInfo.spacing = frameSpacing;
      }
    } else {
      logger.warn(
        'No shared functional group pixel measure sequence items.');
    }
  }

  return frameInfo;
}

/**
 * Mask {@link Image} factory.
 */
export class MaskFactory {

  /*
   * Check dicom elements. Throws an error if not suitable.
   *
   * @param {object} _dicomElements The DICOM tags.
   * @returns {object|undefined} A possible warning.
   */
  checkElements(_dicomElements) {
    // does nothing
  }

  /**
   * Get an {@link Image} object from the read DICOM file.
   *
   * @param {object} dicomElements The DICOM tags.
   * @param {Uint8Array | Int8Array |
   *   Uint16Array | Int16Array |
   *   Uint32Array | Int32Array} pixelBuffer The pixel buffer.
   * @returns {Image} A new Image.
   */
  create(dicomElements, pixelBuffer) {
    // check required and supported tags
    for (let d = 0; d < RequiredDicomSegTags.length; ++d) {
      checkTag(dicomElements, RequiredDicomSegTags[d]);
    }

    // image size
    const size2D = getImage2DSize(dicomElements);
    const size = new Size([size2D[0], size2D[1], 1]);

    const sliceSize = size.getTotalSize();

    // frames
    let frames = 1;
    const framesElem = dicomElements['00280008'];
    if (typeof framesElem !== 'undefined') {
      frames = parseInt(framesElem.value[0], 10);
    }

    if (frames !== pixelBuffer.length / sliceSize) {
      throw new Error(
        'Buffer and numberOfFrames meta are not equal.' +
        frames + ' ' + pixelBuffer.length / sliceSize);
    }

    // Dimension Organization and Index
    const dimension = getDimensionOrganization(dicomElements);

    // Segment Sequence
    const segSequence = dicomElements['00620002'];
    if (typeof segSequence === 'undefined') {
      throw new Error('Missing or empty segmentation sequence');
    }
    const segments = [];
    let storeAsRGB = false;
    for (let i = 0; i < segSequence.value.length; ++i) {
      const segment = getSegment(segSequence.value[i]);
      if (typeof segment.displayValue.r !== 'undefined' &&
        typeof segment.displayValue.g !== 'undefined' &&
        typeof segment.displayValue.b !== 'undefined') {
        // create rgb image
        storeAsRGB = true;
      }
      // store
      segments.push(segment);
    }


    // Shared Functional Groups Sequence
    let spacing;
    let imageOrientationPatient;
    const sharedFunctionalGroupsSeq = dicomElements['52009229'];
    if (typeof sharedFunctionalGroupsSeq !== 'undefined') {
      // should be only one
      const funcGroup0 = sharedFunctionalGroupsSeq.value[0];
      // Plane Orientation Sequence
      if (typeof funcGroup0['00209116'] !== 'undefined') {
        const planeOrientationSeq = funcGroup0['00209116'];
        if (planeOrientationSeq.value.length !== 0) {
          // should be only one
          imageOrientationPatient =
            planeOrientationSeq.value[0]['00200037'].value;
        } else {
          logger.warn(
            'No shared functional group plane orientation sequence items.');
        }
      }
      // Pixel Measures Sequence
      if (typeof funcGroup0['00289110'] !== 'undefined') {
        const pixelMeasuresSeq = funcGroup0['00289110'];
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
    const perFrameFuncGroupSequence = dicomElements['52009230'];
    if (typeof perFrameFuncGroupSequence === 'undefined') {
      throw new Error('Missing or empty per frame functional sequence');
    }
    if (frames !== perFrameFuncGroupSequence.value.length) {
      throw new Error(
        'perFrameFuncGroupSequence meta and numberOfFrames are not equal.');
    }
    // create frame info object from per frame func
    const frameInfos = [];
    for (let j = 0; j < perFrameFuncGroupSequence.value.length; ++j) {
      frameInfos.push(
        getSegmentFrameInfo(perFrameFuncGroupSequence.value[j]));
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
    if (typeof imageOrientationPatient === 'undefined') {
      throw new Error('No imageOrientationPatient found for DICOM SEG');
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
    /* eslint-disable array-element-newline */
    const orientationMatrix = new Matrix33([
      rowCosines.getX(), colCosines.getX(), normal.getX(),
      rowCosines.getY(), colCosines.getY(), normal.getY(),
      rowCosines.getZ(), colCosines.getZ(), normal.getZ()
    ]);

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

    // use calculated spacing
    let newSpacing = spacing;
    const geoSliceSpacing = getSliceGeometrySpacing(
      frameOrigins, orientationMatrix, false);
    const spacingValues = spacing.getValues();
    if (typeof geoSliceSpacing !== 'undefined' &&
      geoSliceSpacing !== spacingValues[2]) {
      spacingValues[2] = geoSliceSpacing;
      newSpacing = new Spacing(spacingValues);
    }

    // tmp geometry with correct spacing but only one slice
    const tmpGeometry = new Geometry(
      frameOrigins[0], size, newSpacing, orientationMatrix);

    // origin distance test
    // TODO: maybe use sliceSpacing / 10
    const isNotSmall = function (value) {
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
      while (isNotSmall(dist)) {
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
      frameOrigins[0], size, newSpacing, orientationMatrix);
    const uids = [0];
    for (let m = 1; m < numberOfSlices; ++m) {
      geometry.appendOrigin(point3DFromArray(posPats[m]), m);
      uids.push(m);
    }

    const getFindSegmentFunc = function (number) {
      return function (item) {
        return item.number === number;
      };
    };

    // create output buffer
    const mul = storeAsRGB ? 3 : 1;
    const buffer =
      // @ts-ignore
      new pixelBuffer.constructor(mul * sliceSize * numberOfSlices);
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
      const pixelValue = frameSegment.displayValue;
      for (let l = 0; l < sliceSize; ++l) {
        if (pixelBuffer[frameOffset + l] !== 0) {
          const offset = mul * (sliceOffset + l);
          if (storeAsRGB) {
            buffer[offset] = pixelValue.r;
            buffer[offset + 1] = pixelValue.g;
            buffer[offset + 2] = pixelValue.b;
          } else {
            buffer[offset] = pixelValue;
          }
        }
      }
    }

    // create image
    const image = new Image(geometry, buffer, uids);
    if (storeAsRGB) {
      image.setPhotometricInterpretation('RGB');
    }
    // meta information
    const meta = getDefaultDicomSegJson();
    // Study
    meta.StudyDate = dicomElements['00080020'].value[0];
    meta.StudyTime = dicomElements['00080030'].value[0];
    meta.StudyInstanceUID = dicomElements['0020000D'].value[0];
    meta.StudyID = dicomElements['00200010'].value[0];
    // Series
    meta.SeriesInstanceUID = dicomElements['0020000E'].value[0];
    meta.SeriesNumber = dicomElements['00200011'].value[0];
    // ReferringPhysicianName
    meta.ReferringPhysicianName = dicomElements['00080090'].value[0];
    // patient info
    meta.PatientName = dicomElements['00100010'].value[0];
    meta.PatientID = dicomElements['00100020'].value[0];
    meta.PatientBirthDate = dicomElements['00100030'].value[0];
    meta.PatientSex = dicomElements['00100040'].value[0];
    // Enhanced General Equipment Module
    meta.Manufacturer = dicomElements['00080070'].value[0];
    meta.ManufacturerModelName = dicomElements['00081090'].value[0];
    meta.DeviceSerialNumber = dicomElements['00181000'].value[0];
    meta.SoftwareVersions = dicomElements['00181020'].value[0];
    // dicom seg dimension
    meta.DimensionOrganizationSequence = dimension.organizations;
    meta.DimensionIndexSequence = dimension.indices;
    // custom
    meta.custom = {
      segments: segments,
      frameInfos: frameInfos,
      SOPInstanceUID: dicomElements['00080018'].value[0]
    };

    // number of files: in this case equal to number slices,
    //   used to calculate buffer size
    meta.numberOfFiles = numberOfSlices;
    // FrameOfReferenceUID (optional)
    const frameOfReferenceUID = dicomElements['00200052'];
    if (frameOfReferenceUID) {
      meta.FrameOfReferenceUID = frameOfReferenceUID.value[0];
    }
    // LossyImageCompression (optional)
    const lossyImageCompression = dicomElements['00282110'];
    if (lossyImageCompression) {
      meta.LossyImageCompression = lossyImageCompression.value[0];
    }

    image.setMeta(meta);

    return image;
  }

} // class MaskFactory
