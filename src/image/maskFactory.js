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
 * Get a segment object from a dicom element.
 *
 * @param {object} element The dicom element.
 * @returns {object} A segment object.
 */
dwv.dicom.getSegment = function (element) {
  // number -> SegmentNumber
  // label -> SegmentLabel
  // algorithmType -> SegmentAlgorithmType
  var segment = {
    number: element.x00620004.value[0],
    label: dwv.dicom.cleanString(element.x00620005.value[0]),
    algorithmType: dwv.dicom.cleanString(element.x00620008.value[0])
  };
  // algorithmName -> SegmentAlgorithmName
  if (element.x00620009) {
    segment.algorithmName =
      dwv.dicom.cleanString(element.x00620009.value[0]);
  }
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
  return segment;
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
  var referencedSOPInstanceUID;
  if (typeof groupItem.x00089124 !== 'undefined') {
    var derivationImageSq = groupItem.x00089124.value;
    // Source Image Sequence
    if (typeof derivationImageSq[0].x00082112 !== 'undefined') {
      var sourceImageSq = derivationImageSq[0].x00082112.value;
      // Referenced SOP Instance UID
      if (typeof sourceImageSq[0].x00081155 !== 'undefined') {
        referencedSOPInstanceUID = sourceImageSq[0].x00081155.value[0];
      }
    }
  }
  // Frame Content Sequence
  var frameContentSq = groupItem.x00209111.value;
  // Dimension Index Value
  // (not using Segment Identification Sequence)
  var dimIndex = frameContentSq[0].x00209157.value;
  // Plane Position Sequence
  var planePosSq = groupItem.x00209113.value;
  // Image Position (Patient)
  var imagePosPat = planePosSq[0].x00200032.value;
  for (var p = 0; p < imagePosPat.length; ++p) {
    imagePosPat[p] = parseFloat(imagePosPat[p], 10);
  }
  var frameInfo = {
    dimIndex: dimIndex,
    imagePosPat: imagePosPat,
    referencedSOPInstanceUID: referencedSOPInstanceUID
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

  // Segmentation Type
  var segType = dicomElements.getFromKey('x00620001');
  if (!segType) {
    throw new Error('Missing or empty DICOM segmentation type');
  } else {
    segType = dwv.dicom.cleanString(segType);
  }
  if (segType !== 'BINARY') {
    throw new Error('Unsupported segmentation type: ' + segType);
  }

  // check if compressed
  var syntax = dwv.dicom.cleanString(dicomElements.getFromKey('x00020010'));
  var algoName = dwv.dicom.getSyntaxDecompressionName(syntax);
  if (algoName !== null) {
    throw new Error('Unsupported compressed segmentation: ' + algoName);
  }

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

  var arrayEquals = function (arr0, arr1) {
    if (arr0 === null || arr1 === null) {
      return false;
    }
    if (arr0.length !== arr1.length) {
      return false;
    }
    return arr0.every(function (element, index) {
      return element === arr1[index];
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
        if (!arrayEquals(
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
  var segmentIndex = null;
  for (var f = 0; f < frameInfos.length; ++f) {
    // get the slice index from the position in the posPat array
    sliceIndex = findIndexPosPat(posPats, frameInfos[f].imagePosPat);
    frameOffset = sliceSize * f;
    segmentIndex = frameInfos[f].dimIndex[0] - 1;
    sliceOffset = sliceSize * sliceIndex;
    var pixelValue = segments[segmentIndex].displayValue;
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
  // image meta
  var meta = {
    Modality: 'SEG',
    BitsStored: 8,
    SeriesInstanceUID: dicomElements.getFromKey('x0020000E'),
    ImageOrientationPatient: imageOrientationPatient,
    custom: {
      segments: segments,
      frameInfos: frameInfos
    }
  };
  image.setMeta(meta);

  return image;
};

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Save methods
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Get a dicom element from a segment object.
 *
 * @param {object} segment The segment object.
 * @returns {object} The dicom element.
 */
dwv.dicom.getSegmentElement = function (segment) {
  var algoType = segment.algorithmType;
  if (typeof algoType === 'undefined') {
    algoType = 'MANUAL';
  }
  var segmentElement = {
    SegmentNumber: segment.number,
    SegmentLabel: segment.label,
    SegmentAlgorithmType: algoType
  };
  // display value
  if (typeof segment.displayValue.r !== 'undefined' &&
    typeof segment.displayValue.g !== 'undefined' &&
    typeof segment.displayValue.b !== 'undefined') {
    var cieLab = dwv.utils.labToUintLab(
      dwv.utils.srgbToCielab(segment.displayValue));
    segmentElement.RecommendedDisplayCIELabValue = new Uint16Array([
      Math.round(cieLab.l),
      Math.round(cieLab.a),
      Math.round(cieLab.b)
    ]);
  } else {
    segmentElement.RecommendedDisplayGrayscaleValue = segment.displayValue;
  }
  // algo name
  if (typeof segment.algorithmName !== 'undefined') {
    segmentElement.SegmentAlgorithmName = segment.algorithmName;
  }
  return segmentElement;
};

/**
 * Get a dicom element from a frame information object.
 *
 * @param {object} frameInfo The frame information object.
 * @returns {object} The dicom element.
 */
dwv.dicom.getSegmentFrameInfoElement = function (frameInfo) {
  return {
    FrameContentSequence: {
      item0: {
        DimensionIndexValues: frameInfo.dimIndex
      }
    },
    PlanePositionSequence: {
      item0: {
        ImagePositionPatient: frameInfo.imagePosPat
      }
    },
    SegmentIdentificationSequence: {
      item0: {
        ReferencedSegmentNumber: frameInfo.dimIndex[0].toString()
      }
    }
  };
};

/**
 * Convert a mask image into a DICOM segmentation object.
 * @param {dwv.image.Image} image The mask image.
 * @param {Array} segments The mask segments.
 * @returns {object} A list of dicom elements.
 */
dwv.image.MaskFactory.prototype.toDicom = function (image, segments) {

  if (typeof segments === 'undefined') {
    segments = image.getMeta().segments;
  }

  var geometry = image.getGeometry();
  var size = geometry.getSize();
  var spacing = geometry.getSpacing();
  var numberOfComponents = image.getNumberOfComponents();
  var isRGB = numberOfComponents === 3;

  // base tags
  var tags = {
    TransferSyntaxUID: '1.2.840.10008.1.2.1',
    Modality: 'SEG',
    SegmentationType: 'BINARY',
    PhotometricInterpretation: 'MONOCHROME2',
    SamplesPerPixel: 1,
    PixelRepresentation: 0,
    Rows: size.get(1),
    Columns: size.get(0),
    BitsAllocated: 1
  };

  // segments
  var segmentsTag = {};
  for (var l = 0; l < segments.length; ++l) {
    segmentsTag['item' + l] = dwv.dicom.getSegmentElement(segments[l]);
  }
  tags.SegmentSequence = segmentsTag;

  // Shared Functional Groups Sequence
  tags.SharedFunctionalGroupsSequence = {
    item0: {
      PlaneOrientationSequence: {
        item0: {
          ImageOrientationPatient: image.getMeta().ImageOrientationPatient
        }
      },
      PixelMeasuresSequence: {
        item0: {
          PixelSpacing: [spacing.get(1), spacing.get(0)],
          SpacingBetweenSlices: spacing.get(2).toString()
        }
      }
    }
  };

  var getPixelValue;
  var equalValues;
  if (isRGB) {
    getPixelValue = function (inputOffset) {
      return {
        r: image.getValueAtOffset(inputOffset, 0),
        g: image.getValueAtOffset(inputOffset + 1, 0),
        b: image.getValueAtOffset(inputOffset + 2, 0)
      };
    };
    equalValues = function (a, b) {
      return a.r === b.r &&
        a.g === b.g &&
        a.b === b.b;
    };
  } else {
    getPixelValue = function (inputOffset) {
      return image.getValueAtOffset(inputOffset, 0);
    };
    equalValues = function (a, b) {
      return a === b;
    };
  }

  // image buffer to multi frame
  var sliceSize = size.getDimSize(2);
  var roiBuffers = {};
  for (var k = 0; k < size.get(2); ++k) {
    var sliceOffset = k * sliceSize;
    // initialise buffers
    var buffers = {};
    // search pixels
    for (var o = 0; o < sliceSize; ++o) {
      var inputOffset = (sliceOffset + o) * numberOfComponents;
      var pixelValue = getPixelValue(inputOffset);
      for (var n2 = 0; n2 < segments.length; ++n2) {
        var number2 = segments[n2].number - 1;
        if (equalValues(pixelValue, segments[n2].displayValue)) {
          if (typeof buffers[number2] === 'undefined') {
            buffers[number2] = new Uint8Array(sliceSize);
          }
          buffers[number2][o] = 1;
        }
      }
    }

    // store slice buffers
    var keys0 = Object.keys(buffers);
    for (var k0 = 0; k0 < keys0.length; ++k0) {
      var key0 = keys0[k0];
      if (typeof roiBuffers[key0] === 'undefined') {
        roiBuffers[key0] = {};
      }
      // ordering by slice index (follows posPat)
      roiBuffers[key0][k] = buffers[key0];
    }
  }

  var frameInfos = [];

  // flatten buffer array
  var finalBuffers = [];
  for (var n4 = 0; n4 < segments.length; ++n4) {
    var number40 = segments[n4].number;
    var number4 = number40 - 1;
    var keys1 = Object.keys(roiBuffers[number4]);
    // revert slice order
    for (var k1 = keys1.length - 1; k1 >= 0; --k1) {
      var key1 = keys1[k1];
      finalBuffers.push(roiBuffers[number4][key1]);
      // frame info
      var posPat = image.getGeometry().getOrigins()[key1];
      frameInfos.push({
        dimIndex: [number40, keys1.length - k1],
        imagePosPat: [posPat.getX(), posPat.getY(), posPat.getZ()]
      });
    }
  }

  tags.NumberOfFrames = finalBuffers.length.toString();

  // frame infos
  var frameInfosTag = {};
  for (var f = 0; f < frameInfos.length; ++f) {
    frameInfosTag['item' + f] =
      dwv.dicom.getSegmentFrameInfoElement(frameInfos[f]);
  }
  tags.PerFrameFunctionalGroupsSequence = frameInfosTag;

  // convert JSON to DICOM element object
  var res = dwv.dicom.getElementsFromJSONTags(tags);
  var dicomElements = res.elements;

  // pixel value length: divide by 8 to trigger binary write
  var pixVl = finalBuffers.length * sliceSize / 8;
  dicomElements.x7FE00010 = {
    tag: {group: '0x7FE0', element: '0x0010', name: 'x7FE00010'},
    vr: 'OB',
    vl: pixVl,
    value: finalBuffers,
    startOffset: res.offset,
    endOffset: res.offset + pixVl
  };

  return dicomElements;
};
