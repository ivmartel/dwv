// Do not warn if these variables were not defined before.
/* global dwv */

// namespaces
var test = test || {};

/**
 * MPRPixGenerator
 * Generates pixel data from file with an input per orientation.
 *
 * @param {object} options The generator options.
 * @class
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
        throw new Error('Image width mismatch: ' +
          img.width + '!=' + halfNCols);
      }
      if (img.height !== halfNRows) {
        throw new Error('Image height mismatch: ' +
          img.height + '!=' + halfNRows);
      }
    }
    // store
    this.images = imgs;
    // store buffers
    this.buffers = [];
    for (var i0 = 0; i0 < imgs.length; ++i0) {
      this.buffers.push(test.getImageDataData(this.images[i0]));
    }
  };

  this.generate = function (pixelBuffer, sliceNumber) {
    if (sliceNumber > numberOfSlices) {
      throw new Error('Cannot generate slice, number is above size: ' +
        sliceNumber + ', ' + numberOfSlices);
    }
    var orientationName =
      dwv.dicom.getOrientationName(options.imageOrientationPatient);
    if (orientationName === 'axial') {
      this.generateAsAxial(pixelBuffer, sliceNumber);
    } else if (orientationName === 'coronal') {
      this.generateAsCoronal(pixelBuffer, sliceNumber);
    } else if (orientationName === 'sagittal') {
      this.generateAsSagittal(pixelBuffer, sliceNumber);
    }
  };

  this.generateAsAxial = function (pixelBuffer, sliceNumber) {
    // axial
    var offset = 0;
    for (var j0 = 0; j0 < halfNRows; ++j0) {
      for (var i0 = 0; i0 < halfNCols; ++i0) {
        pixelBuffer[offset] = getFunc('axial', i0, j0);
        ++offset;
      }
      offset += halfNCols;
    }
    if (sliceNumber < halfNSlices) {
      // coronal
      offset = halfNCols;
      for (var j1 = 0; j1 < numberOfRows; ++j1) {
        for (var i1 = 0; i1 < halfNCols; ++i1) {
          pixelBuffer[offset] = getFunc(
            'coronal', i1, (halfNSlices - 1 - sliceNumber));
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
            'sagittal', j2, (numberOfSlices - 1 - sliceNumber));
          ++offset;
        }
      }
    }
  };

  this.generateAsCoronal = function (pixelBuffer, sliceNumber) {
    // coronal
    var offset = numberOfColumns * halfNRows + halfNCols;
    for (var j0 = 0; j0 < halfNRows; ++j0) {
      for (var i0 = 0; i0 < halfNCols; ++i0) {
        pixelBuffer[offset] = getFunc('coronal', i0, j0);
        ++offset;
      }
      offset += halfNCols;
    }
    if (sliceNumber < halfNSlices) {
      // axial
      offset = 0;
      for (var j1 = 0; j1 < numberOfRows; ++j1) {
        for (var i1 = 0; i1 < halfNCols; ++i1) {
          pixelBuffer[offset] = getFunc(
            'axial', i1, sliceNumber);
          ++offset;
        }
        offset += halfNCols;
      }

    } else {
      // sagittal
      offset = 0;
      for (var j2 = 0; j2 < halfNRows; ++j2) {
        for (var i2 = 0; i2 < numberOfColumns; ++i2) {
          pixelBuffer[offset] = getFunc(
            'sagittal', sliceNumber, j2 - 1);
          ++offset;
        }
      }
    }
  };

  this.generateAsSagittal = function (pixelBuffer, sliceNumber) {
    // sagittal
    var offset = halfNCols;
    for (var j0 = 0; j0 < halfNRows; ++j0) {
      for (var i0 = 0; i0 < halfNCols; ++i0) {
        pixelBuffer[offset] = getFunc('sagittal', i0, j0);
        ++offset;
      }
      offset += halfNCols;
    }
    if (sliceNumber < halfNSlices) {
      // axial
      offset = 0;
      for (var j1 = 0; j1 < numberOfRows; ++j1) {
        for (var i1 = 0; i1 < halfNCols; ++i1) {
          pixelBuffer[offset] = getFunc(
            'axial', sliceNumber, i1);
          ++offset;
        }
        offset += halfNCols;
      }

    } else {
      // coronal
      offset = numberOfColumns * halfNRows;
      for (var j2 = 0; j2 < halfNRows; ++j2) {
        for (var i2 = 0; i2 < numberOfColumns; ++i2) {
          pixelBuffer[offset] = getFunc(
            'coronal', sliceNumber, j2 - 1);
          ++offset;
        }
      }
    }
  };

  /**
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {number} The offset for the given position.
   */
  function getOffset(i, j) {
    return i + j * halfNCols;
  }

  /**
   * @param {string} name The image orientation
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {number} The value at the given position.
   */
  function getFunc(name, i, j) {
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
 *
 * @param {object} tags The tags to check.
 * @param {object} image The associated image.
 * @returns {boolean} True if the tags are ok.
 */
function checkTags(tags, image) {
  /**
   * @param {number} value The value to check.
   * @returns {number} The expected value.
   */
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

test.pixelGenerators = test.pixelGenerators || {};
test.pixelGenerators.mpr = {
  generator: MPRPixGenerator,
  checkTags: checkTags
};
