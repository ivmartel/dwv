// Do not warn if these variables were not defined before.
/* global dwv */

// namespace
// eslint-disable-next-line no-var
var test = test || {};

/**
 * MPRPixGenerator
 * Generates pixel data from file with an input per orientation.
 *
 * @param {object} options The generator options.
 * @class
 */
const MPRPixGenerator = function (options) {

  const self = this;

  const numberOfColumns = options.numberOfColumns;
  const numberOfRows = options.numberOfRows;
  const isRGB = options.photometricInterpretation === 'RGB';

  if (isRGB) {
    throw new Error('The MPRPixGenerator does not support RGB data.');
  }

  const halfNCols = numberOfColumns * 0.5;
  const halfNRows = numberOfRows * 0.5;

  this.images = [];
  this.buffers = [];

  let numberOfSlices = 0;
  let halfNSlices = 0;
  this.setNumberOfSlices = function (num) {
    numberOfSlices = num;
    halfNSlices = num * 0.5;
  };

  this.setImages = function (imgs) {
    // check sizes
    let img;
    for (let i = 0; i < imgs.length; ++i) {
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
    for (let i0 = 0; i0 < imgs.length; ++i0) {
      this.buffers.push(test.getImageDataData(this.images[i0]));
    }
  };

  this.generate = function (pixelBuffer, sliceNumber) {
    if (sliceNumber > numberOfSlices) {
      throw new Error('Cannot generate slice, number is above size: ' +
        sliceNumber + ', ' + numberOfSlices);
    }
    const orientationName =
      dwv.getOrientationName(options.imageOrientationPatient);
    if (orientationName === dwv.Orientation.Axial) {
      this.generateAsAxial(pixelBuffer, sliceNumber);
    } else if (orientationName === dwv.Orientation.Coronal) {
      this.generateAsCoronal(pixelBuffer, sliceNumber);
    } else if (orientationName === dwv.Orientation.Sagittal) {
      this.generateAsSagittal(pixelBuffer, sliceNumber);
    }
  };

  this.generateAsAxial = function (pixelBuffer, sliceNumber) {
    // axial
    let offset = 0;
    for (let j0 = 0; j0 < halfNRows; ++j0) {
      for (let i0 = 0; i0 < halfNCols; ++i0) {
        pixelBuffer[offset] = getFunc(dwv.Orientation.Axial, i0, j0);
        ++offset;
      }
      offset += halfNCols;
    }
    if (sliceNumber < halfNSlices) {
      // coronal
      offset = halfNCols;
      for (let j1 = 0; j1 < numberOfRows; ++j1) {
        for (let i1 = 0; i1 < halfNCols; ++i1) {
          pixelBuffer[offset] = getFunc(
            dwv.Orientation.Coronal, i1, (halfNSlices - 1 - sliceNumber));
          ++offset;
        }
        offset += halfNCols;
      }
    } else {
      // sagittal
      offset = numberOfColumns * halfNRows;
      for (let j2 = 0; j2 < halfNRows; ++j2) {
        for (let i2 = 0; i2 < numberOfColumns; ++i2) {
          pixelBuffer[offset] = getFunc(
            dwv.Orientation.Sagittal, j2, (numberOfSlices - 1 - sliceNumber));
          ++offset;
        }
      }
    }
  };

  this.generateAsCoronal = function (pixelBuffer, sliceNumber) {
    // coronal
    let offset = numberOfColumns * halfNRows + halfNCols;
    for (let j0 = 0; j0 < halfNRows; ++j0) {
      for (let i0 = 0; i0 < halfNCols; ++i0) {
        pixelBuffer[offset] = getFunc(dwv.Orientation.Coronal, i0, j0);
        ++offset;
      }
      offset += halfNCols;
    }
    if (sliceNumber < halfNSlices) {
      // axial
      offset = 0;
      for (let j1 = 0; j1 < numberOfRows; ++j1) {
        for (let i1 = 0; i1 < halfNCols; ++i1) {
          pixelBuffer[offset] = getFunc(
            dwv.Orientation.Axial, i1, sliceNumber);
          ++offset;
        }
        offset += halfNCols;
      }

    } else {
      // sagittal
      offset = 0;
      for (let j2 = 0; j2 < halfNRows; ++j2) {
        for (let i2 = 0; i2 < numberOfColumns; ++i2) {
          pixelBuffer[offset] = getFunc(
            dwv.Orientation.Sagittal, sliceNumber, j2 - 1);
          ++offset;
        }
      }
    }
  };

  this.generateAsSagittal = function (pixelBuffer, sliceNumber) {
    // sagittal
    let offset = halfNCols;
    for (let j0 = 0; j0 < halfNRows; ++j0) {
      for (let i0 = 0; i0 < halfNCols; ++i0) {
        pixelBuffer[offset] = getFunc(dwv.Orientation.Sagittal, i0, j0);
        ++offset;
      }
      offset += halfNCols;
    }
    if (sliceNumber < halfNSlices) {
      // axial
      offset = 0;
      for (let j1 = 0; j1 < numberOfRows; ++j1) {
        for (let i1 = 0; i1 < halfNCols; ++i1) {
          pixelBuffer[offset] = getFunc(
            dwv.Orientation.Axial, sliceNumber, i1);
          ++offset;
        }
        offset += halfNCols;
      }

    } else {
      // coronal
      offset = numberOfColumns * halfNRows;
      for (let j2 = 0; j2 < halfNRows; ++j2) {
        for (let i2 = 0; i2 < numberOfColumns; ++i2) {
          pixelBuffer[offset] = getFunc(
            dwv.Orientation.Coronal, sliceNumber, j2 - 1);
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
   * @param {string} name The image orientation.
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {number} The value at the given position.
   */
  function getFunc(name, i, j) {
    let imgIdx = 0;
    if (name === dwv.Orientation.Axial) {
      imgIdx = 0;
    } else if (name === dwv.Orientation.Coronal) {
      imgIdx = 1;
    } else if (name === dwv.Orientation.Sagittal) {
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
function mprCheckTags(tags, image) {
  /**
   * @param {number} value The value to check.
   * @returns {number} The expected value.
   */
  function getExpectedSize(value) {
    return 2 * value;
  }

  let needUpdate = false;
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
  checkTags: mprCheckTags
};
