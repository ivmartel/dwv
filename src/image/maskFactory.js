// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

dwv.dicom.getSegmentLabel = function (labelItem) {
  // number -> SegmentNumber
  // name -> SegmentLabel
  // algorithmType -> SegmentAlgorithmType
  var label = {
    number: labelItem.x00620004.value[0],
    name: dwv.dicom.cleanString(labelItem.x00620005.value[0]),
    algorithmType: dwv.dicom.cleanString(labelItem.x00620008.value[0])
  };
  // algorithmName -> SegmentAlgorithmName
  if (labelItem.x00620009) {
    label.algorithmName =
      dwv.dicom.cleanString(labelItem.x00620009.value[0]);
  }
  // colour -> RecommendedDisplayCIELabValue converted to RGB
  if (typeof labelItem.x0062000D !== 'undefined') {
    var cielabElement = labelItem.x0062000D.value;
    var rgb = dwv.utils.cielabToSrgb(dwv.utils.uintLabToLab({
      l: cielabElement[0],
      a: cielabElement[1],
      b: cielabElement[2]
    }));
    label.colour = rgb;
  }
  return label;
};

dwv.dicom.getSegmentLabelElement = function (label) {
  var cieLab = dwv.utils.labToUintLab(
    dwv.utils.srgbToCielab(label.colour));
  var algoType = label.algorithmType;
  if (typeof algoType === 'undefined') {
    algoType = 'MANUAL';
  }
  var labelElement = {
    SegmentNumber: label.number,
    SegmentLabel: label.name,
    SegmentAlgorithmType: algoType,
    RecommendedDisplayCIELabValue: new Uint16Array([
      Math.round(cieLab.l),
      Math.round(cieLab.a),
      Math.round(cieLab.b)
    ])
  };
  if (typeof label.algorithmName !== 'undefined') {
    labelElement.SegmentAlgorithmName = label.algorithmName;
  }
  return labelElement;
};

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
        ReferencedSegmentNumber: frameInfo.dimIndex[0]
      }
    }
  };
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
  var labels = [];
  var storeAsRGB = false;
  for (var i = 0; i < segSequence.length; ++i) {
    var label = dwv.dicom.getSegmentLabel(segSequence[i]);
    if (typeof label.colour !== 'undefined') {
      // create rgb image
      storeAsRGB = true;
    }

    // store
    labels.push(label);
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
        imageOrientationPatient = planeOrientationSeq.value[0].x00200037.value;
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

  // position patient utility functions
  var equalPosPat = function (pos1, pos2) {
    return JSON.stringify(pos1) === JSON.stringify(pos2);
  };

  var comparePosPat = function (pos1, pos2) {
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

  var includesPosPat = function (arr, val) {
    return arr.some(function (arrVal) {
      return equalPosPat(val, arrVal);
    });
  };

  var findIndexPosPat = function (arr, val) {
    return arr.findIndex(function (arrVal) {
      return equalPosPat(val, arrVal);
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
  framePosPats.sort(comparePosPat);

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
  var labelIndex = null;
  for (var f = 0; f < frameInfos.length; ++f) {
    // get the slice index from the position in the posPat array
    sliceIndex = findIndexPosPat(posPats, frameInfos[f].imagePosPat);
    frameOffset = sliceSize * f;
    labelIndex = frameInfos[f].dimIndex[0] - 1;
    sliceOffset = sliceSize * sliceIndex;
    var pixelValue;
    if (storeAsRGB) {
      pixelValue = labels[labelIndex].colour;
    } else {
      pixelValue = labels[labelIndex].number;
    }
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
    labels: labels,
    frameInfos: frameInfos,
    SeriesInstanceUID: dicomElements.getFromKey('x0020000E'),
    SOPInstanceUID: dicomElements.getFromKey('x00080018'),
    ImageOrientationPatient: imageOrientationPatient
  };
  image.setMeta(meta);

  return image;
};

/**
 * Convert a mask image into a DICOM segmentation object.
 * @param {dwv.image.Image} image The mask image.
 * @returns {object} A list of dicom elements.
 */
dwv.image.MaskFactory.prototype.toDicom = function (image) {

  var geometry = image.getGeometry();
  var size = geometry.getSize();
  var spacing = geometry.getSpacing();
  var numberOfComponents = image.getNumberOfComponents();
  var isRGB = numberOfComponents === 3;

  var labels = image.getMeta().labels;
  var frameInfos = image.getMeta().frameInfos;

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
    NumberOfFrames: frameInfos.length.toString(),
    BitsAllocated: 1
  };

  // labels
  var labelsTag = {};
  // array of different values
  var numbers = [];
  var values = {};
  for (var l = 0; l < labels.length; ++l) {
    // add number if not present
    if (!numbers.includes(labels[l].number)) {
      numbers.push(labels[l].number);
      if (isRGB) {
        values[labels[l].number] = labels[l].colour;
      } else {
        values[labels[l].number] = labels[l].number;
      }
    }
    labelsTag['item' + l] = dwv.dicom.getSegmentLabelElement(labels[l]);
  }
  tags.SegmentSequence = labelsTag;

  // sort numbers in case they were unordered
  function compareNumbers(a, b) {
    return a - b;
  }
  numbers.sort(compareNumbers);

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
          SpacingBetweenSlices: spacing.get(2)
        }
      }
    }
  };

  // frame infos
  var frameInfosTag = {};
  var numberCount = {};
  for (var nn = 0; nn < numbers.length; ++nn) {
    numberCount[numbers[nn]] = 0;
  }
  for (var f = 0; f < frameInfos.length; ++f) {
    ++numberCount[frameInfos[f].dimIndex[0]];
    frameInfosTag['item' + f] =
      dwv.dicom.getSegmentFrameInfoElement(frameInfos[f]);
  }
  tags.PerFrameFunctionalGroupsSequence = frameInfosTag;

  // image buffer to multi frame
  var sliceSize = size.getDimSize(2);
  function equalValues(a, b) {
    if (isRGB) {
      return a.r === b.r &&
        a.g === b.g &&
        a.b === b.b;
    } else {
      return a === b;
    }
  }
  var roiBuffers = new Array(numbers.length);
  for (var n0 = 0; n0 < numbers.length; ++n0) {
    roiBuffers[n0] = new Array(numberCount[numbers[n0]]);
  }
  for (var k = 0; k < size.get(2); ++k) {
    var sliceOffset = k * sliceSize;
    // bool array to know if the slice contains pixels with the index number
    var sliceWithNumber = new Array(numbers.length);
    sliceWithNumber.fill(false);
    // initialise buffers
    var buffers = [];
    for (var n1 = 0; n1 < numbers.length; ++n1) {
      buffers.push(new Uint8Array(sliceSize));
    }
    // search pixels
    for (var o = 0; o < sliceSize; ++o) {
      var inputOffset = (sliceOffset + o) * numberOfComponents;
      var pixelValue;
      if (isRGB) {
        pixelValue = {
          r: image.getValueAtOffset(inputOffset, 0),
          g: image.getValueAtOffset(inputOffset + 1, 0),
          b: image.getValueAtOffset(inputOffset + 2, 0)
        };
      } else {
        pixelValue = image.getValueAtOffset(inputOffset, 0);
      }
      for (var n2 = 0; n2 < numbers.length; ++n2) {
        if (equalValues(pixelValue, values[numbers[n2]])) {
          sliceWithNumber[n2] = true;
          buffers[n2][o] = 1;
        }
      }
    }
    // find label index
    var posPat = image.getGeometry().getOrigins()[k];
    var indx = {};
    for (var f0 = 0; f0 < frameInfos.length; ++f0) {
      var imagePosPat = frameInfos[f0].imagePosPat;
      var imagePosPatPoint = new dwv.math.Point3D(
        imagePosPat[0], imagePosPat[1], imagePosPat[2]);
      if (imagePosPatPoint.isSimilar(posPat)) {
        indx[frameInfos[f0].dimIndex[0]] = frameInfos[f0].dimIndex[1];
      }
    }
    // add to roi buffer if pixels were found
    for (var n3 = 0; n3 < numbers.length; ++n3) {
      if (sliceWithNumber[n3]) {
        //roiBuffers[n3].push(buffers[n3]);
        roiBuffers[n3][indx[numbers[n3]] - 1] = buffers[n3];
      }
    }
  }
  // flatten buffer array
  var finalBuffers = [];
  for (var n4 = 0; n4 < numbers.length; ++n4) {
    for (var i = 0; i < roiBuffers[n4].length; ++i) {
      finalBuffers.push(roiBuffers[n4][i]);
    }
  }

  console.log('save', tags);

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
