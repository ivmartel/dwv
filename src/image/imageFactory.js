// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * {@link dwv.image.Image} factory.
 *
 * @class
 */
dwv.image.ImageFactory = function () {};

/**
 * {@link dwv.image.Image} factory. Defaults to local one.
 *
 * @see dwv.image.ImageFactory
 */
dwv.ImageFactory = dwv.image.ImageFactory;

/**
 * Check dicom elements. Throws an error if not suitable.
 *
 * @param {object} dicomElements The DICOM tags.
 */
dwv.image.ImageFactory.prototype.checkElements = function (dicomElements) {
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
};

/**
 * Get an {@link dwv.image.Image} object from the read DICOM file.
 *
 * @param {object} dicomElements The DICOM tags.
 * @param {Array} pixelBuffer The pixel buffer.
 * @param {number} numberOfFiles The input number of files.
 * @returns {dwv.image.Image} A new Image.
 */
dwv.image.ImageFactory.prototype.create = function (
  dicomElements, pixelBuffer, numberOfFiles) {
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

  var sizeValues = [columns, rows];

  // frames
  var frames = dicomElements.getFromKey('x00280008');
  if (frames) {
    sizeValues.push(frames);
  } else {
    sizeValues.push(1);
  }

  // image size
  var size = new dwv.image.Size(sizeValues);

  // image spacing
  var spacing = dicomElements.getPixelSpacing();

  // TransferSyntaxUID
  var transferSyntaxUID = dicomElements.getFromKey('x00020010');
  var syntax = dwv.dicom.cleanString(transferSyntaxUID);
  var jpeg2000 = dwv.dicom.isJpeg2000TransferSyntax(syntax);
  var jpegBase = dwv.dicom.isJpegBaselineTransferSyntax(syntax);
  var jpegLoss = dwv.dicom.isJpegLosslessTransferSyntax(syntax);

  // ImagePositionPatient
  var imagePositionPatient = dicomElements.getFromKey('x00200032');
  // InstanceNumber
  var instanceNumber = dicomElements.getFromKey('x00200013');

  // slice position
  var slicePosition = new Array(0, 0, 0);
  if (imagePositionPatient) {
    slicePosition = [parseFloat(imagePositionPatient[0]),
      parseFloat(imagePositionPatient[1]),
      parseFloat(imagePositionPatient[2])];
  } else if (instanceNumber) {
    // use instanceNumber as slice index if no imagePositionPatient was provided
    dwv.logger.warn('Using instanceNumber as imagePositionPatient.');
    slicePosition[2] = parseInt(instanceNumber, 10);
  }

  // slice orientation (cosines are matrices' columns)
  // http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.7.6.2.html#sect_C.7.6.2.1.1
  var imageOrientationPatient = dicomElements.getFromKey('x00200037');
  var orientationMatrix;
  if (imageOrientationPatient) {
    var rowCosines = new dwv.math.Vector3D(
      parseFloat(imageOrientationPatient[0]),
      parseFloat(imageOrientationPatient[1]),
      parseFloat(imageOrientationPatient[2]));
    var colCosines = new dwv.math.Vector3D(
      parseFloat(imageOrientationPatient[3]),
      parseFloat(imageOrientationPatient[4]),
      parseFloat(imageOrientationPatient[5]));
    var normal = rowCosines.crossProduct(colCosines);
    /* eslint-disable array-element-newline */
    orientationMatrix = new dwv.math.Matrix33([
      rowCosines.getX(), colCosines.getX(), normal.getX(),
      rowCosines.getY(), colCosines.getY(), normal.getY(),
      rowCosines.getZ(), colCosines.getZ(), normal.getZ()
    ]);
    /* eslint-enable array-element-newline */
  }

  // geometry
  var origin = new dwv.math.Point3D(
    slicePosition[0], slicePosition[1], slicePosition[2]);
  var geometry = new dwv.image.Geometry(
    origin, size, spacing, orientationMatrix);

  // sop instance UID
  var sopInstanceUid = dwv.dicom.cleanString(
    dicomElements.getFromKey('x00080018'));

  // Sample per pixels
  var samplesPerPixel = dicomElements.getFromKey('x00280002');
  if (!samplesPerPixel) {
    samplesPerPixel = 1;
  }

  // check buffer size
  var bufferSize = size.getTotalSize() * samplesPerPixel;
  if (bufferSize !== pixelBuffer.length) {
    dwv.logger.warn('Badly sized pixel buffer: ' +
      pixelBuffer.length + ' != ' + bufferSize);
    if (bufferSize < pixelBuffer.length) {
      pixelBuffer = pixelBuffer.slice(0, size.getTotalSize());
    } else {
      throw new Error('Underestimated buffer size, can\'t fix it...');
    }
  }

  // image
  var image = new dwv.image.Image(geometry, pixelBuffer, [sopInstanceUid]);
  // PhotometricInterpretation
  var photometricInterpretation = dicomElements.getFromKey('x00280004');
  if (photometricInterpretation) {
    var photo = dwv.dicom.cleanString(photometricInterpretation).toUpperCase();
    // jpeg decoders output RGB data
    if ((jpeg2000 || jpegBase || jpegLoss) &&
      (photo !== 'MONOCHROME1' && photo !== 'MONOCHROME2')) {
      photo = 'RGB';
    }
    // check samples per pixels
    if (photo === 'RGB' && samplesPerPixel === 1) {
      photo = 'PALETTE COLOR';
    }
    image.setPhotometricInterpretation(photo);
  }
  // PlanarConfiguration
  var planarConfiguration = dicomElements.getFromKey('x00280006');
  if (planarConfiguration) {
    image.setPlanarConfiguration(planarConfiguration);
  }

  // rescale slope and intercept
  var slope = 1;
  // RescaleSlope
  var rescaleSlope = dicomElements.getFromKey('x00281053');
  if (rescaleSlope) {
    slope = parseFloat(rescaleSlope);
  }
  var intercept = 0;
  // RescaleIntercept
  var rescaleIntercept = dicomElements.getFromKey('x00281052');
  if (rescaleIntercept) {
    intercept = parseFloat(rescaleIntercept);
  }
  var rsi = new dwv.image.RescaleSlopeAndIntercept(slope, intercept);
  image.setRescaleSlopeAndIntercept(rsi);

  // meta information
  var meta = {};
  // data length
  meta.numberOfFiles = numberOfFiles;
  // Modality
  var modality = dicomElements.getFromKey('x00080060');
  if (modality) {
    meta.Modality = modality;
  }
  // StudyInstanceUID
  var studyInstanceUID = dicomElements.getFromKey('x0020000D');
  if (studyInstanceUID) {
    meta.StudyInstanceUID = studyInstanceUID;
  }
  // SeriesInstanceUID
  var seriesInstanceUID = dicomElements.getFromKey('x0020000E');
  if (seriesInstanceUID) {
    meta.SeriesInstanceUID = seriesInstanceUID;
  }
  // BitsStored
  var bitsStored = dicomElements.getFromKey('x00280101');
  if (bitsStored) {
    meta.BitsStored = parseInt(bitsStored, 10);
  }
  // PixelRepresentation -> is signed
  var pixelRepresentation = dicomElements.getFromKey('x00280103');
  meta.IsSigned = false;
  if (pixelRepresentation) {
    meta.IsSigned = (pixelRepresentation === 1);
  }
  // PatientPosition
  var patientPosition = dicomElements.getFromKey('x00185100');
  meta.PatientPosition = false;
  if (patientPosition) {
    meta.PatientPosition = patientPosition;
  }

  // window level presets
  var windowPresets = {};
  var windowCenter = dicomElements.getFromKey('x00281050', true);
  var windowWidth = dicomElements.getFromKey('x00281051', true);
  var windowCWExplanation = dicomElements.getFromKey('x00281055', true);
  if (windowCenter && windowWidth) {
    var name;
    for (var j = 0; j < windowCenter.length; ++j) {
      var center = parseFloat(windowCenter[j], 10);
      var width = parseFloat(windowWidth[j], 10);
      if (center && width && width !== 0) {
        name = '';
        if (windowCWExplanation) {
          name = dwv.dicom.cleanString(windowCWExplanation[j]);
        }
        if (name === '') {
          name = 'Default' + j;
        }
        windowPresets[name] = {
          wl: [new dwv.image.WindowLevel(center, width)],
          name: name,
          perslice: true
        };
      }
      if (width === 0) {
        dwv.logger.warn('Zero window width found in DICOM.');
      }
    }
  }
  meta.windowPresets = windowPresets;

  // PALETTE COLOR luts
  if (image.getPhotometricInterpretation() === 'PALETTE COLOR') {
    var redLut = dicomElements.getFromKey('x00281201');
    var greenLut = dicomElements.getFromKey('x00281202');
    var blueLut = dicomElements.getFromKey('x00281203');
    // check red palette descriptor (should all be equal)
    var descriptor = dicomElements.getFromKey('x00281101');
    if (typeof descriptor !== 'undefined' &&
            descriptor.length === 3) {
      if (descriptor[2] === 16) {
        var doScale = false;
        // (C.7.6.3.1.5 Palette Color Lookup Table Descriptor)
        // Some implementations have encoded 8 bit entries with 16 bits
        // allocated, padding the high bits;
        var descSize = descriptor[0];
        // (C.7.6.3.1.5 Palette Color Lookup Table Descriptor)
        // The first Palette Color Lookup Table Descriptor value is the
        // number of entries in the lookup table. When the number of table
        // entries is equal to 216 then this value shall be 0.
        if (descSize === 0) {
          descSize = 65536;
        }
        // red palette VL
        var redLutDE = dicomElements.getDEFromKey('x00281201');
        var vlSize = redLutDE.vl;
        // check double size
        if (vlSize !== 2 * descSize) {
          doScale = true;
          dwv.logger.info('16bits lut but size is not double. desc: ' +
            descSize + ' vl: ' + vlSize);
        }
        // (C.7.6.3.1.6 Palette Color Lookup Table Data)
        // Palette color values must always be scaled across the full
        // range of available intensities
        var bitsAllocated = parseInt(dicomElements.getFromKey('x00280100'), 10);
        if (bitsAllocated === 8) {
          doScale = true;
          dwv.logger.info(
            'Scaling 16bits color lut since bits allocated is 8.');
        }

        if (doScale) {
          var scaleTo8 = function (value) {
            return value >> 8;
          };

          redLut = redLut.map(scaleTo8);
          greenLut = greenLut.map(scaleTo8);
          blueLut = blueLut.map(scaleTo8);
        }
      } else if (descriptor[2] === 8) {
        // lut with vr=OW was read as Uint16, convert it to Uint8
        dwv.logger.info(
          'Scaling 16bits color lut since the lut descriptor is 8.');
        var clone = redLut.slice(0);
        redLut = new Uint8Array(clone.buffer);
        clone = greenLut.slice(0);
        greenLut = new Uint8Array(clone.buffer);
        clone = blueLut.slice(0);
        blueLut = new Uint8Array(clone.buffer);
      }
    }
    // set the palette
    meta.paletteLut = {
      red: redLut,
      green: greenLut,
      blue: blueLut
    };
  }

  // RecommendedDisplayFrameRate
  var recommendedDisplayFrameRate = dicomElements.getFromKey('x00082144');
  if (recommendedDisplayFrameRate) {
    meta.RecommendedDisplayFrameRate = parseInt(
      recommendedDisplayFrameRate, 10);
  }

  // store the meta data
  image.setMeta(meta);

  return image;
};
