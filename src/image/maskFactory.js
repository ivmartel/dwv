// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Check two position patients for equality.
 *
 * @param {*} pos1 The first position patient.
 * @param {*} pos2 The second position patient.
 * @returns {boolean} True is equal.
 */
dwv.dicom.equalPosPat = function (pos1, pos2) {
  return JSON.stringify(pos1) === JSON.stringify(pos2);
};

/**
 * Compare two position patients.
 *
 * @param {*} pos1 The first position patient.
 * @param {*} pos2 The second position patient.
 * @returns {number|null} A number used to sort elements.
 */
dwv.dicom.comparePosPat = function (pos1, pos2) {
  var diff = null;
  var posLen = pos1.length;
  var index = posLen;
  for (var i = 0; i < posLen; ++i) {
    --index;
    diff = pos2[index] - pos1[index];
    if (diff !== 0) {
      return diff;
    }
  }
  return diff;
};

/**
 * Check that a DICOM tag definition is present in a parsed element.
 *
 * @param {object} rootElement The root dicom element.
 * @param {object} tagDefinition The tag definition as {name, tag, type, enum}.
 */
dwv.dicom.checkTag = function (rootElement, tagDefinition) {
  var tagValue = rootElement.getFromKey(tagDefinition.tag);
  // check null and undefined
  if (tagDefinition.type === 1 || tagDefinition.type === 2) {
    if (tagValue === null || typeof tagValue === 'undefined') {
      throw new Error('Missing or empty ' + tagDefinition.name);
    }
  } else {
    if (tagValue === null || typeof tagValue === 'undefined') {
      // non mandatory value, exit
      return;
    }
  }
  var includes = false;
  if (Array.isArray(tagValue)) {
    // trim
    tagValue = tagValue.map(function (item) {
      return dwv.dicom.cleanString(item);
    });
    for (var i = 0; i < tagDefinition.enum.length; ++i) {
      if (!Array.isArray(tagDefinition.enum[i])) {
        throw new Error('Cannot compare array and non array tag value.');
      }
      if (dwv.utils.arrayEquals(tagDefinition.enum[i], tagValue)) {
        includes = true;
        break;
      }
    }
  } else {
    // trim
    if (typeof tagValue === 'string') {
      tagValue = dwv.dicom.cleanString(tagValue);
    }

    includes = tagDefinition.enum.includes(tagValue);
  }
  if (!includes) {
    throw new Error(
      'Unsupported ' + tagDefinition.name + ' value: ' + tagValue);
  }
};

/**
 * List of DICOM Seg required tags.
 */
dwv.dicom.requiredSegDicomTags = [
  {
    name: 'Transfer Syntax UID',
    tag: 'x00020010',
    type: '1',
    enum: ['1.2.840.10008.1.2.1']
  },
  {
    name: 'Media Storage SOP Class UID',
    tag: 'x00020002',
    type: '1',
    enum: ['1.2.840.10008.5.1.4.1.1.66.4']
  },
  {
    name: 'SOP Class UID',
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
    name: 'Segmentation Type',
    tag: 'x00620001',
    type: '1',
    enum: ['BINARY']
  },
  {
    name: 'Dimension Organization Type',
    tag: 'x00209311',
    type: '3',
    enum: ['3D']
  },
  {
    name: 'Image Type',
    tag: 'x00080008',
    type: '1',
    enum: [['DERIVED', 'PRIMARY']]
  },
  {
    name: 'Samples Per Pixel',
    tag: 'x00280002',
    type: '1',
    enum: [1]
  },
  {
    name: 'Photometric Interpretation',
    tag: 'x00280004',
    type: '1',
    enum: ['MONOCHROME2']
  },
  {
    name: 'Pixel Representation',
    tag: 'x00280103',
    type: '1',
    enum: [0]
  },
  {
    name: 'Bits Allocated',
    tag: 'x00280100',
    type: '1',
    enum: [1]
  },
  {
    name: 'Bits Stored',
    tag: 'x00280101',
    type: '1',
    enum: [1]
  },
  {
    name: 'High Bit',
    tag: 'x00280102',
    type: '1',
    enum: [0]
  },
];

/**
 * Check the dimension organization from a dicom element.
 *
 * @param {object} rootElement The root dicom element.
 * @returns {object} The dimension organizations and indices.
 */
dwv.dicom.getDimensionOrganization = function (rootElement) {
  // Dimension Organization Sequence (required)
  var orgSq = rootElement.getFromKey('x00209221', true);
  if (!orgSq || orgSq.length !== 1) {
    throw new Error('Unsupported dimension organization sequence length');
  }
  // Dimension Organization UID
  var orgs = [dwv.dicom.cleanString(orgSq[0].x00209164.value[0])];

  // Dimension Index Sequence (conditionally required)
  var indices = [];
  var indexSq = rootElement.getFromKey('x00209222', true);
  if (indexSq) {
    // expecting 2D index
    if (indexSq.length !== 2) {
      throw new Error('Unsupported dimension index sequence length');
    }
    for (var i = 0; i < indexSq.length; ++i) {
      // Dimension Organization UID (required)
      var indexOrg = dwv.dicom.cleanString(indexSq[i].x00209164.value[0]);
      if (indexOrg !== orgs[0]) {
        throw new Error(
          'Dimension Index Sequence contains a unknown Dimension Organization');
      }
      // Dimension Index Pointer (required)
      var indexPointer =
        dwv.dicom.cleanString(indexSq[i].x00209165.value[0]);

      var index = {
        organization: indexOrg,
        pointer: indexPointer
      };
      // Dimension Description Label (optional)
      if (typeof indexSq[i].x00209421 !== 'undefined') {
        index.label =
          dwv.dicom.cleanString(indexSq[i].x00209421.value[0]);
      }
      // store
      indices.push(index);
    }
    // expecting Image Position at last position
    if (indices[1].pointer !== '(0020,0032)') {
      throw new Error('Unsupported non image position as last index');
    }
  }

  return {
    organizations: orgs,
    indices: indices
  };
};

/**
 * Get a code object from a dicom element.
 *
 * @param {object} element The dicom element.
 * @returns {object} A code object.
 */
dwv.dicom.getCode = function (element) {
  // meaning -> CodeMeaning (type1)
  var code = {
    meaning: dwv.dicom.cleanString(element.x00080104.value[0])
  };
  // value -> CodeValue (type1C)
  // longValue -> LongCodeValue (type1C)
  // urnValue -> URNCodeValue (type1C)
  if (element.x00080100) {
    code.value = element.x00080100.value[0];
  } else if (element.x00080119) {
    code.longValue = element.x00080119.value[0];
  } else if (element.x00080120) {
    code.urnValue = element.x00080120.value[0];
  } else {
    throw Error('Invalid code with no value, no long value and no urn value.');
  }
  // schemeDesignator -> CodingSchemeDesignator (type1C)
  if (typeof code.value !== 'undefined' ||
    typeof code.longValue !== 'undefined') {
    if (element.x00080102) {
      code.schemeDesignator = element.x00080102.value[0];
    } else {
      throw Error(
        'No coding sheme designator when code value or long value is present');
    }
  }
  return code;
};

/**
 * Get a segment object from a dicom element.
 *
 * @param {object} element The dicom element.
 * @returns {object} A segment object.
 */
dwv.dicom.getSegment = function (element) {
  // number -> SegmentNumber (type1)
  // label -> SegmentLabel (type1)
  // algorithmType -> SegmentAlgorithmType (type1)
  var segment = {
    number: element.x00620004.value[0],
    label: dwv.dicom.cleanString(element.x00620005.value[0]),
    algorithmType: dwv.dicom.cleanString(element.x00620008.value[0])
  };
  // algorithmName -> SegmentAlgorithmName (type1C)
  if (element.x00620009) {
    segment.algorithmName =
      dwv.dicom.cleanString(element.x00620009.value[0]);
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
  if (typeof element.x0062000C !== 'undefined') {
    segment.displayValue = element.x006200C.value;
  } else if (typeof element.x0062000D !== 'undefined') {
    var cielabElement = element.x0062000D.value;
    var rgb = dwv.utils.cielabToSrgb(dwv.utils.uintLabToLab({
      l: cielabElement[0],
      a: cielabElement[1],
      b: cielabElement[2]
    }));
    segment.displayValue = rgb;
  }
  // Segmented Property Category Code Sequence (type1, only one)
  if (element.x00620003) {
    segment.propertyCategoryCode =
      dwv.dicom.getCode(element.x00620003.value[0]);
  } else {
    throw Error('Missing Segmented Property Category Code Sequence.');
  }
  // Segmented Property Type Code Sequence (type1)
  if (element.x0062000F) {
    segment.propertyTypeCode =
      dwv.dicom.getCode(element.x0062000F.value[0]);
  } else {
    throw Error('Missing Segmented Property Type Code Sequence.');
  }

  return segment;
};

/**
 * Check if two segment objects are equal.
 *
 * @param {object} seg1 The first segment.
 * @param {object} seg2 The second segment.
 * @returns {boolean} True if both segment are equal.
 */
dwv.dicom.isEqualSegment = function (seg1, seg2) {
  // basics
  if (typeof seg1 === 'undefined' ||
    typeof seg2 === 'undefined' ||
    seg1 === null ||
    seg2 === null) {
    return false;
  }
  var isEqual = seg1.number === seg2.number &&
    seg1.label === seg2.label &&
    seg1.algorithmType === seg2.algorithmType;
  // rgb
  if (typeof seg1.displayValue.r !== 'undefined') {
    if (typeof seg2.displayValue.r === 'undefined') {
      isEqual = false;
    } else {
      isEqual = isEqual &&
        dwv.utils.isEqualRgb(seg1.displayValue, seg2.displayValue);
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
};

/**
 * Check if two segment objects are similar: either the
 * number or the displayValue are equal.
 *
 * @param {object} seg1 The first segment.
 * @param {object} seg2 The second segment.
 * @returns {boolean} True if both segment are similar.
 */
dwv.dicom.isSimilarSegment = function (seg1, seg2) {
  // basics
  if (typeof seg1 === 'undefined' ||
    typeof seg2 === 'undefined' ||
    seg1 === null ||
    seg2 === null) {
    return false;
  }
  var isSimilar = seg1.number === seg2.number;
  // rgb
  if (typeof seg1.displayValue.r !== 'undefined') {
    if (typeof seg2.displayValue.r === 'undefined') {
      isSimilar = false;
    } else {
      isSimilar = isSimilar ||
        dwv.utils.isEqualRgb(seg1.displayValue, seg2.displayValue);
    }
  } else {
    isSimilar = isSimilar ||
      seg1.displayValue === seg2.displayValue;
  }

  return isSimilar;
};

/**
 * Get a spacing object from a dicom measure element.
 *
 * @param {object} measure The dicom element.
 * @returns {dwv.image.Spacing} A spacing object.
 */
dwv.dicom.getSpacingFromMeasure = function (measure) {
  // Pixel Spacing
  if (typeof measure.x00280030 === 'undefined') {
    return null;
  }
  var pixelSpacing = measure.x00280030;
  var spacingValues = [
    parseFloat(pixelSpacing.value[0]),
    parseFloat(pixelSpacing.value[1])
  ];
  // Spacing Between Slices
  if (typeof measure.x00180088 !== 'undefined') {
    var sliceThickness = measure.x00180088;
    spacingValues.push(parseFloat(sliceThickness.value[0]));
  }
  return new dwv.image.Spacing(spacingValues);
};

/**
 * Get a frame information object from a dicom element.
 *
 * @param {object} groupItem The dicom element.
 * @returns {object} A frame information object.
 */
dwv.dicom.getSegmentFrameInfo = function (groupItem) {
  // Derivation Image Sequence
  var derivationImages = [];
  if (typeof groupItem.x00089124 !== 'undefined') {
    var derivationImageSq = groupItem.x00089124.value;
    // Source Image Sequence
    for (var i = 0; i < derivationImageSq.length; ++i) {
      var sourceImages = [];
      if (typeof derivationImageSq[i].x00082112 !== 'undefined') {
        var sourceImageSq = derivationImageSq[i].x00082112.value;
        for (var j = 0; j < sourceImageSq.length; ++j) {
          var sourceImage = {};
          // Referenced SOP Class UID
          if (typeof sourceImageSq[j].x00081150 !== 'undefined') {
            sourceImage.referencedSOPClassUID =
              sourceImageSq[j].x00081150.value[0];
          }
          // Referenced SOP Instance UID
          if (typeof sourceImageSq[j].x00081155 !== 'undefined') {
            sourceImage.referencedSOPInstanceUID =
              sourceImageSq[j].x00081155.value[0];
          }
          sourceImages.push(sourceImage);
        }
      }
      derivationImages.push(sourceImages);
    }
  }
  // Frame Content Sequence (required, only one)
  var frameContentSq = groupItem.x00209111.value;
  // Dimension Index Value
  var dimIndex = frameContentSq[0].x00209157.value;
  // Segment Identification Sequence (required, only one)
  var segmentIdSq = groupItem.x0062000A.value;
  // Referenced Segment Number
  var refSegmentNumber = segmentIdSq[0].x0062000B.value[0];
  // Plane Position Sequence (required, only one)
  var planePosSq = groupItem.x00209113.value;
  // Image Position (Patient) (conditionally required)
  var imagePosPat = planePosSq[0].x00200032.value;
  for (var p = 0; p < imagePosPat.length; ++p) {
    imagePosPat[p] = parseFloat(imagePosPat[p], 10);
  }
  var frameInfo = {
    dimIndex: dimIndex,
    imagePosPat: imagePosPat,
    derivationImages: derivationImages,
    refSegmentNumber: refSegmentNumber
  };
  // Plane Orientation Sequence
  if (typeof groupItem.x00209116 !== 'undefined') {
    var framePlaneOrientationSeq = groupItem.x00209116;
    if (framePlaneOrientationSeq.value.length !== 0) {
      // should only be one Image Orientation (Patient)
      var frameImageOrientation =
        framePlaneOrientationSeq.value[0].x00200037.value;
      if (typeof frameImageOrientation !== 'undefined') {
        frameInfo.imageOrientationPatient = frameImageOrientation;
      }
    }
  }
  // Pixel Measures Sequence
  if (typeof groupItem.x00289110 !== 'undefined') {
    var framePixelMeasuresSeq = groupItem.x00289110;
    if (framePixelMeasuresSeq.value.length !== 0) {
      // should only be one
      var frameSpacing =
        dwv.dicom.getSpacingFromMeasure(framePixelMeasuresSeq.value[0]);
      if (typeof frameSpacing !== 'undefined') {
        frameInfo.spacing = frameSpacing;
      }
    } else {
      dwv.logger.warn(
        'No shared functional group pixel measure sequence items.');
    }
  }

  return frameInfo;
};

/**
 * Mask {@link dwv.image.Image} factory.
 *
 * @class
 */
dwv.image.MaskFactory = function () {};

/**
 * Get an {@link dwv.image.Image} object from the read DICOM file.
 *
 * @param {object} dicomElements The DICOM tags.
 * @param {Array} pixelBuffer The pixel buffer.
 * @returns {dwv.image.Image} A new Image.
 */
dwv.image.MaskFactory.prototype.create = function (
  dicomElements, pixelBuffer) {
  // check required and supported tags
  for (var d = 0; d < dwv.dicom.requiredSegDicomTags.length; ++d) {
    dwv.dicom.checkTag(dicomElements, dwv.dicom.requiredSegDicomTags[d]);
  }

  // columns
  var columns = dicomElements.getFromKey('x00280011');
  if (!columns) {
    throw new Error('Missing or empty DICOM image number of columns');
  }
  // rows
  var rows = dicomElements.getFromKey('x00280010');
  if (!rows) {
    throw new Error('Missing or empty DICOM image number of rows');
  }
  var sliceSize = columns * rows;

  // frames
  var frames = dicomElements.getFromKey('x00280008');
  if (!frames) {
    frames = 1;
  } else {
    frames = parseInt(frames, 10);
  }

  if (frames !== pixelBuffer.length / sliceSize) {
    throw new Error(
      'Buffer and numberOfFrames meta are not equal.' +
      frames + ' ' + pixelBuffer.length / sliceSize);
  }

  // Dimension Organization and Index
  var dimension = dwv.dicom.getDimensionOrganization(dicomElements);

  // Segment Sequence
  var segSequence = dicomElements.getFromKey('x00620002', true);
  if (!segSequence || typeof segSequence === 'undefined') {
    throw new Error('Missing or empty segmentation sequence');
  }
  var segments = [];
  var storeAsRGB = false;
  for (var i = 0; i < segSequence.length; ++i) {
    var segment = dwv.dicom.getSegment(segSequence[i]);
    if (typeof segment.displayValue.r !== 'undefined' &&
      typeof segment.displayValue.g !== 'undefined' &&
      typeof segment.displayValue.b !== 'undefined') {
      // create rgb image
      storeAsRGB = true;
    }
    // store
    segments.push(segment);
  }

  // image size
  var size = dicomElements.getImageSize();

  // Shared Functional Groups Sequence
  var spacing;
  var imageOrientationPatient;
  var sharedFunctionalGroupsSeq = dicomElements.getFromKey('x52009229', true);
  if (sharedFunctionalGroupsSeq && sharedFunctionalGroupsSeq.length !== 0) {
    // should be only one
    var funcGroup0 = sharedFunctionalGroupsSeq[0];
    // Plane Orientation Sequence
    if (typeof funcGroup0.x00209116 !== 'undefined') {
      var planeOrientationSeq = funcGroup0.x00209116;
      if (planeOrientationSeq.value.length !== 0) {
        // should be only one
        var orientArray = planeOrientationSeq.value[0].x00200037.value;
        imageOrientationPatient = orientArray.map(
          function (x) {
            return parseFloat(x);
          }
        );
      } else {
        dwv.logger.warn(
          'No shared functional group plane orientation sequence items.');
      }
    }
    // Pixel Measures Sequence
    if (typeof funcGroup0.x00289110 !== 'undefined') {
      var pixelMeasuresSeq = funcGroup0.x00289110;
      if (pixelMeasuresSeq.value.length !== 0) {
        // should be only one
        spacing = dwv.dicom.getSpacingFromMeasure(pixelMeasuresSeq.value[0]);
      } else {
        dwv.logger.warn(
          'No shared functional group pixel measure sequence items.');
      }
    }
  }

  var includesPosPat = function (arr, val) {
    return arr.some(function (arrVal) {
      return dwv.dicom.equalPosPat(val, arrVal);
    });
  };

  var findIndexPosPat = function (arr, val) {
    return arr.findIndex(function (arrVal) {
      return dwv.dicom.equalPosPat(val, arrVal);
    });
  };

  // Per-frame Functional Groups Sequence
  var perFrameFuncGroupSequence = dicomElements.getFromKey('x52009230', true);
  if (!perFrameFuncGroupSequence ||
    typeof perFrameFuncGroupSequence === 'undefined') {
    throw new Error('Missing or empty per frame functional sequence');
  }
  if (frames !== perFrameFuncGroupSequence.length) {
    throw new Error(
      'perFrameFuncGroupSequence meta and numberOfFrames are not equal.');
  }
  // create frame info object from per frame func
  var frameInfos = [];
  for (var j = 0; j < perFrameFuncGroupSequence.length; ++j) {
    frameInfos.push(
      dwv.dicom.getSegmentFrameInfo(perFrameFuncGroupSequence[j]));
  }

  // check frame infos
  var framePosPats = [];
  for (var ii = 0; ii < frameInfos.length; ++ii) {
    if (!includesPosPat(framePosPats, frameInfos[ii].imagePosPat)) {
      framePosPats.push(frameInfos[ii].imagePosPat);
    }
    // store orientation if needed, avoid multi
    if (typeof frameInfos[ii].imageOrientationPatient !== 'undefined') {
      if (typeof imageOrientationPatient === 'undefined') {
        imageOrientationPatient = frameInfos[ii].imageOrientationPatient;
      } else {
        if (!dwv.utils.arrayEquals(
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
  // sort positions patient
  framePosPats.sort(dwv.dicom.comparePosPat);

  // check spacing and orientation
  if (typeof spacing === 'undefined') {
    throw new Error('No spacing found for DICOM SEG');
  }
  if (typeof imageOrientationPatient === 'undefined') {
    throw new Error('No imageOrientationPatient found for DICOM SEG');
  }

  // add missing posPats
  var posPats = [];
  var sliceSpacing = spacing.get(2);
  for (var g = 0; g < framePosPats.length - 1; ++g) {
    posPats.push(framePosPats[g]);
    var nextZ = framePosPats[g][2] - sliceSpacing;
    var diff = Math.abs(nextZ - framePosPats[g + 1][2]);
    while (diff >= sliceSpacing) {
      posPats.push([framePosPats[g][0], framePosPats[g][1], nextZ]);
      nextZ -= sliceSpacing;
      diff = Math.abs(nextZ - framePosPats[g + 1][2]);
    }
  }
  posPats.push(framePosPats[framePosPats.length - 1]);

  var getFindSegmentFunc = function (number) {
    return function (item) {
      return item.number === number;
    };
  };

  // create output buffer
  // as many slices as posPats
  var numberOfSlices = posPats.length;
  var mul = storeAsRGB ? 3 : 1;
  var buffer = new pixelBuffer.constructor(mul * sliceSize * numberOfSlices);
  buffer.fill(0);
  // merge frame buffers
  var sliceOffset = null;
  var sliceIndex = null;
  var frameOffset = null;
  for (var f = 0; f < frameInfos.length; ++f) {
    // get the slice index from the position in the posPat array
    sliceIndex = findIndexPosPat(posPats, frameInfos[f].imagePosPat);
    frameOffset = sliceSize * f;
    sliceOffset = sliceSize * sliceIndex;
    // get the frame display value
    var frameSegment = segments.find(
      getFindSegmentFunc(frameInfos[f].refSegmentNumber)
    );
    var pixelValue = frameSegment.displayValue;
    for (var l = 0; l < sliceSize; ++l) {
      if (pixelBuffer[frameOffset + l] !== 0) {
        var offset = mul * (sliceOffset + l);
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

  if (typeof spacing === 'undefined') {
    throw Error('No spacing found in DICOM seg file.');
  }

  // geometry
  var point3DFromArray = function (arr) {
    return new dwv.math.Point3D(arr[0], arr[1], arr[2]);
  };
  var origin = point3DFromArray(posPats[0]);
  var geometry = new dwv.image.Geometry(origin, size, spacing);
  var uids = [0];
  for (var m = 1; m < numberOfSlices; ++m) {
    // args: origin, volumeNumber, uid, index, increment
    geometry.appendOrigin(point3DFromArray(posPats[m]), m);
    uids.push(m);
  }

  // create image
  var image = new dwv.image.Image(geometry, buffer, uids);
  if (storeAsRGB) {
    image.setPhotometricInterpretation('RGB');
  }
  // meta information
  var meta = {
    Modality: 'SEG',
    SegmentationType: 'BINARY',
    DimensionOrganizationType: '3D',
    DimensionOrganizations: dimension.organizations,
    DimensionIndices: dimension.indices,
    BitsStored: 1,
    PatientName: dwv.dicom.cleanString(dicomElements.getFromKey('x00100010')),
    PatientID: dwv.dicom.cleanString(dicomElements.getFromKey('x00100020')),
    PatientBirthDate: dicomElements.getFromKey('x00100030'),
    PatientSex: dwv.dicom.cleanString(dicomElements.getFromKey('x00100040')),
    StudyInstanceUID: dicomElements.getFromKey('x0020000D'),
    SeriesInstanceUID: dicomElements.getFromKey('x0020000E'),
    SeriesNumber: dicomElements.getFromKey('x00200011'),
    ImageOrientationPatient: imageOrientationPatient,
    custom: {
      segments: segments,
      frameInfos: frameInfos,
      SOPInstanceUID: dicomElements.getFromKey('x00080018')
    }
  };
  // FrameOfReferenceUID (optional)
  var frameOfReferenceUID = dicomElements.getFromKey('x00200052');
  if (frameOfReferenceUID) {
    meta.FrameOfReferenceUID = frameOfReferenceUID;
  }

  image.setMeta(meta);

  return image;
};
