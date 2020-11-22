/**
 * MPRPixGenerator
 * Generates pixel data from file with an input per orientation.
 * @constructor
 */
var MPRPixGenerator = function (options) {

  var self = this;

  var numberOfColumns = options.numberOfColumns;
  var numberOfRows = options.numberOfRows;
  var isRGB = options.photometricInterpretation === 'RGB';

  if (isRGB) {
    throw new Error('The MPRPixGenerator does not support RGB data.');
  }

  var halfNCols = numberOfColumns * 0.5;
  var halfNRows = numberOfRows * 0.5;

  this.images = [];
  this.buffers = [];

  var numberOfSlices = 0;
  var halfNSlices = 0;
  this.setNumberOfSlices = function (num) {
    numberOfSlices = num;
    halfNSlices = num * 0.5;
  };

  this.setImages = function (imgs) {
    // check sizes
    var img;
    for (var i = 0; i < imgs.length; ++i) {
      img = imgs[i];
      if (img.width !== halfNCols) {
        throw Error('Image width mismatch: ' + img.width + '!=' + halfNCols);
      }
      if (img.height !== halfNRows) {
        throw Error('Image height mismatch: ' + img.height + '!=' + halfNRows);
      }
    }
    // store
    this.images = imgs;
    // store buffers
    this.buffers = [];
    for (var i0 = 0; i0 < imgs.length; ++i0) {
      this.buffers.push(dwv.dicom.getImageDataData(this.images[i0]));
    }
  };

  this.generate = function (pixelBuffer, sliceNumber) {
    if (sliceNumber > numberOfSlices) {
      throw Error('Cannot generate slice, number is above size: ' +
      sliceNumber + ', ' + numberOfSlices);
    }
    // axial
    var offset = 0;
    for (var j0 = 0; j0 < halfNRows; ++j0) {
      for (var i0 = 0; i0 < halfNCols; ++i0) {
        pixelBuffer[offset] = getFunc('axial', i0, j0, sliceNumber);
        ++offset;
      }
      offset += halfNCols;
    }
    if (sliceNumber <= halfNSlices) {
      // coronal
      offset = halfNCols;
      for (var j1 = 0; j1 < numberOfRows; ++j1) {
        for (var i1 = 0; i1 < halfNCols; ++i1) {
          pixelBuffer[offset] = getFunc(
            'coronal', i1, (halfNSlices - sliceNumber), j1);
          ++offset;
        }
        offset += halfNCols;
      }
    } else {
      // sagittal
      offset = numberOfColumns * halfNRows;
      for (var j2 = 0; j2 < halfNRows; ++j2) {
        for (var i2 = 0; i2 < numberOfColumns; ++i2) {
          pixelBuffer[offset] = getFunc(
            'sagittal', j2, (numberOfSlices - sliceNumber), i2);
          ++offset;
        }
      }
    }
  };

  function getOffset(i, j) {
    return i + j * halfNCols;
  }

  function getFunc(name, i, j/*, k*/) {
    var imgIdx = 0;
    if (name === 'axial') {
      imgIdx = 0;
    } else if (name === 'coronal') {
      imgIdx = 1;
    } else if (name === 'sagittal') {
      imgIdx = 2;
    }
    return self.buffers[imgIdx][getOffset(i, j) * 4];
  }
};

/**
 * Check tags are coherent with image size.
 */
function checkTags(tags, image) {
  function getExpectedSize(value) {
    return 2 * value;
  }

  var needUpdate = false;
  if (tags.Columns !== getExpectedSize(image.width)) {
    tags.Columns = getExpectedSize(image.width);
    needUpdate = true;
  }
  if (tags.Rows !== getExpectedSize(image.height)) {
    tags.Rows = getExpectedSize(image.height);
    needUpdate = true;
  }
  return needUpdate;
}

dwv.dicom.pixelGenerators = dwv.dicom.pixelGenerators || {};
dwv.dicom.pixelGenerators.mpr = {
  generator: MPRPixGenerator,
  checkTags: checkTags
};
