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
  // frames
  var frames = dicomElements.getFromKey('x00280008');
  if (!frames) {
    frames = 1;
  } else {
    frames = parseInt(frames, 10);
  }

  var sliceSize = columns * rows;
  if (frames !== pixelBuffer.length / sliceSize) {
    throw new Error(
      'Buffer and numberOfFrames meta are not equal.');
  }

  // check segmentation type
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

  // segmentation sequence
  var segSequence = dicomElements.getFromKey('x00620002', true);
  if (!segSequence || typeof segSequence === 'undefined') {
    throw new Error('Missing or empty segmentation sequence');
  }
  var labels = [];
  for (var i = 0; i < segSequence.length; ++i) {
    var cielabElement = segSequence[i].x0062000D.value;
    var label = {
      number: segSequence[i].x00620004.value[0],
      name: dwv.dicom.cleanString(segSequence[i].x00620005.value[0]),
      algorithmType: dwv.dicom.cleanString(segSequence[i].x00620008.value[0]),
      colour: dwv.utils.cielabToSrgb(dwv.utils.uintLabToLab({
        l: cielabElement[0],
        a: cielabElement[1],
        b: cielabElement[2]
      }))
    };
    if (segSequence[i].x00620009) {
      label.algorithmName =
        dwv.dicom.cleanString(segSequence[i].x00620009.value[0]);
    }
    labels.push(label);
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

  // per frame functional group sequence
  var perFrameFuncGroupSequence = dicomElements.getFromKey('x52009230', true);
  if (!perFrameFuncGroupSequence ||
    typeof perFrameFuncGroupSequence === 'undefined') {
    throw new Error('Missing or empty per frame group sequence');
  }
  if (frames !== perFrameFuncGroupSequence.length) {
    throw new Error(
      'perFrameFuncGroupSequence meta and numberOfFrames are not equal.');
  }
  // create frame info object from per frame func
  var frameInfos = [];
  var posPats = [];
  for (var j = 0; j < perFrameFuncGroupSequence.length; ++j) {
    var frameFunc = perFrameFuncGroupSequence[j];
    var frameContentSq = frameFunc.x00209111.value;
    var dimIndex = frameContentSq[0].x00209157.value;
    var planePosSq = frameFunc.x00209113.value;
    var imagePosPat = planePosSq[0].x00200032.value;
    for (var p = 0; p < imagePosPat.length; ++p) {
      imagePosPat[p] = parseFloat(imagePosPat[p], 10);
    }
    if (!includesPosPat(posPats, imagePosPat)) {
      posPats.push(imagePosPat);
    }
    frameInfos.push({
      dimIndex: dimIndex,
      imagePosPat: imagePosPat
    });
    // multi resolution?
    if (typeof frameFunc.x00289110 !== 'undefined') {
      throw new Error(
        'Unsupported multi resolution dicom seg.');
    }

  }
  // sort positions patient
  posPats.sort(comparePosPat);

  // create output buffer
  // as many slices as posPats -> gap slices between groups are not represented
  var numberOfSlices = posPats.length;
  var asRGB = true;
  var mul = asRGB ? 3 : 1;
  var buffer = new pixelBuffer.constructor(mul * sliceSize * numberOfSlices);
  buffer.fill(0);
  // merge frame buffers
  var sliceOffset = null;
  var frameOffset = null;
  var sliceIndex = null;
  for (var f = 0; f < frameInfos.length; ++f) {
    // get the slice index from the position in the posPat array
    sliceIndex = findIndexPosPat(posPats, frameInfos[f].imagePosPat);
    frameOffset = sliceSize * f;
    sliceOffset = sliceSize * sliceIndex;
    var index = frameInfos[f].dimIndex[0];
    var pixelValue;
    if (asRGB) {
      pixelValue = labels[index - 1].colour;
    } else {
      pixelValue = index;
    }
    for (var l = 0; l < sliceSize; ++l) {
      if (pixelBuffer[frameOffset + l] !== 0) {
        var offset = mul * (sliceOffset + l);
        if (asRGB) {
          buffer[offset] = pixelValue.r;
          buffer[offset + 1] = pixelValue.g;
          buffer[offset + 2] = pixelValue.b;
        } else {
          buffer[offset] = pixelValue;
        }
      }
    }
  }

  // image size
  var size = dicomElements.getImageSize();

  // shared functionad group sequence
  var spacingValues = [1, 1, 1];
  var sharedFunctionalGroupsSeq = dicomElements.getFromKey('x52009229', true);
  if (sharedFunctionalGroupsSeq.length !== 0) {
    // only one
    // https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.7.6.28.html#table_C.7.6.28-1
    if (sharedFunctionalGroupsSeq.length !== 1) {
      console.error(sharedFunctionalGroupsSeq);
      throw new Error(
        'Shared Functional Groups sequence should only contain one item.');
    }
    var funcGroup0 = sharedFunctionalGroupsSeq[0];
    if (typeof funcGroup0.x00289110 !== 'undefined') {
      var pixelMeasuresSeq = funcGroup0.x00289110;
      if (pixelMeasuresSeq.value.length !== 0) {
        // only one
        // https://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.7.6.16.2.html#table_C.7.6.16-2
        if (pixelMeasuresSeq.value.length !== 1) {
          console.error(pixelMeasuresSeq);
          throw new Error(
            'Pixel Measures sequence should only contain one item.');
        }
        var measure0 = pixelMeasuresSeq.value[0];
        if (typeof measure0.x00280030 !== 'undefined') {
          var pixelSpacing = measure0.x00280030;
          spacingValues[0] = parseFloat(pixelSpacing.value[0]);
          spacingValues[1] = parseFloat(pixelSpacing.value[1]);
        } else {
          dwv.logger.warn(
            'No pixel spacing in the shared functional group pixel measure.');
        }
        if (typeof measure0.x00180088 !== 'undefined') {
          var sliceThickness = measure0.x00180088;
          spacingValues[2] = parseFloat(sliceThickness.value[0]);
        }
      } else {
        dwv.logger.warn(
          'No shared functional group pixel measure sequence.');
      }
    } else {
      dwv.logger.warn(
        'No shared functional group sequence.');
    }
  }
  var spacing = new dwv.image.Spacing(spacingValues);

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
  if (asRGB) {
    image.setPhotometricInterpretation('RGB');
  }
  // image meta
  var meta = {
    Modality: 'SEG',
    BitsStored: 8,
    labels: labels,
    frameInfos: frameInfos
  };
  image.setMeta(meta);

  return image;
};
