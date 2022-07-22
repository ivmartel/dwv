// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

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
      'Buffer and numberOfFrames meta are not equal.');
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
    // value -> Segment Number
    // name -> Segment Label
    var label = {
      value: segSequence[i].x00620004.value[0],
      name: dwv.dicom.cleanString(segSequence[i].x00620005.value[0]),
      algorithmType: dwv.dicom.cleanString(segSequence[i].x00620008.value[0])
    };
    // Segment Algorithm Name
    if (segSequence[i].x00620009) {
      label.algorithmName =
        dwv.dicom.cleanString(segSequence[i].x00620009.value[0]);
    }
    // Recommended Display CIELab Value
    if (typeof segSequence[i].x0062000D !== 'undefined') {
      var cielabElement = segSequence[i].x0062000D.value;
      var rgb = dwv.utils.cielabToSrgb(dwv.utils.uintLabToLab({
        l: cielabElement[0],
        a: cielabElement[1],
        b: cielabElement[2]
      }));
      label.colour = rgb;
      // create rgb image
      storeAsRGB = true;
    }
    // store
    labels.push(label);
  }

  // image size
  var size = dicomElements.getImageSize();

  var getSpacingFromMeasure = function (measure) {
    if (typeof measure.x00280030 === 'undefined') {
      return null;
    }
    var pixelSpacing = measure.x00280030;
    var spacingValues = [
      parseFloat(pixelSpacing.value[0]),
      parseFloat(pixelSpacing.value[1])
    ];
    if (typeof measure.x00180088 !== 'undefined') {
      var sliceThickness = measure.x00180088;
      spacingValues.push(parseFloat(sliceThickness.value[0]));
    }
    return new dwv.image.Spacing(spacingValues);
  };

  // Shared Functional Groups Sequence
  var spacing;
  var imageOrientationPatient;
  var sharedFunctionalGroupsSeq = dicomElements.getFromKey('x52009229', true);
  if (sharedFunctionalGroupsSeq.length !== 0) {
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
        spacing = getSpacingFromMeasure(pixelMeasuresSeq.value[0]);
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
  var framePosPats = [];
  for (var j = 0; j < perFrameFuncGroupSequence.length; ++j) {
    var frameFunc = perFrameFuncGroupSequence[j];
    // Derivation Image Sequence
    var referencedSOPInstanceUID;
    if (typeof frameFunc.x00089124 !== 'undefined') {
      var derivationImageSq = frameFunc.x00089124.value;
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
    var frameContentSq = frameFunc.x00209111.value;
    // Dimension Index Value
    var dimIndex = frameContentSq[0].x00209157.value;
    // Plane Position Sequence
    var planePosSq = frameFunc.x00209113.value;
    // Image Position (Patient)
    var imagePosPat = planePosSq[0].x00200032.value;
    for (var p = 0; p < imagePosPat.length; ++p) {
      imagePosPat[p] = parseFloat(imagePosPat[p], 10);
    }
    if (!includesPosPat(framePosPats, imagePosPat)) {
      framePosPats.push(imagePosPat);
    }
    frameInfos.push({
      dimIndex: dimIndex,
      imagePosPat: imagePosPat,
      referencedSOPInstanceUID: referencedSOPInstanceUID
    });
    // Plane Orientation Sequence
    if (typeof frameFunc.x00209116 !== 'undefined') {
      var framePlaneOrientationSeq = frameFunc.x00209116;
      if (framePlaneOrientationSeq.value.length !== 0) {
        // should only be one
        var frameImageOrientation =
          framePlaneOrientationSeq.value[0].x00200037.value;
        if (typeof imageOrientationPatient === 'undefined') {
          imageOrientationPatient = frameImageOrientation;
        } else {
          if (!arrayEquals(frameImageOrientation, imageOrientationPatient)) {
            throw new Error('Unsupported multi orientation dicom seg.');
          }
        }
      }
    }
    // Pixel Measures Sequence
    if (typeof frameFunc.x00289110 !== 'undefined') {
      var framePixelMeasuresSeq = frameFunc.x00289110;
      if (framePixelMeasuresSeq.value.length !== 0) {
        // should only be one
        var frameSpacing =
          getSpacingFromMeasure(framePixelMeasuresSeq.value[0]);
        if (typeof spacing === 'undefined') {
          spacing = frameSpacing;
        } else {
          if (!spacing.equals(frameSpacing)) {
            throw new Error('Unsupported multi resolution dicom seg.');
          }
        }
      } else {
        dwv.logger.warn(
          'No shared functional group pixel measure sequence items.');
      }
    }
  }
  // sort positions patient
  framePosPats.sort(comparePosPat);

  // add missing posPats
  var posPats = [];
  var sliceSpacing = spacing.get(2);
  for (var g = 0; g < framePosPats.length - 1; ++g) {
    posPats.push(framePosPats[g]);
    var nextZ = framePosPats[g][2] - sliceSpacing;
    var diff = Math.abs(nextZ - framePosPats[g + 1][2]);
    while (diff > sliceSpacing) {
      posPats.push([framePosPats[g][0], framePosPats[g][1], nextZ]);
      nextZ -= sliceSpacing;
      diff = Math.abs(nextZ - framePosPats[g + 1][2]);
    }
  }
  posPats.push(framePosPats[framePosPats.length - 1]);

  // create output buffer
  // as many slices as posPats -> gap slices between groups are not represented
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
      pixelValue = labels[labelIndex].value;
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
    SeriesInstanceUID: dicomElements.getFromKey('x0020000E'),
    ImageOrientationPatient: imageOrientationPatient,
    custom: {
      labels: labels,
      frameInfos: frameInfos
    }
  };
  image.setMeta(meta);

  return image;
};
