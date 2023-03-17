import {getOrientationName} from '../../src/dicom/dicomParser';
import {getImageDataData} from './dicomGenerator';

/**
 * MPRPixGenerator
 * Generates pixel data from file with an input per orientation.
 *
 * @param {object} options The generator options.
 * @class
 */
export class MPRPixGenerator {

  #options;
  #numberOfColumns;
  #numberOfRows;
  #isRGB;

  #halfNCols;
  #halfNRows;

  images = [];
  buffers = [];

  #numberOfSlices = 0;
  #halfNSlices = 0;

  constructor(options) {
    this.#options = options;
    this.#numberOfColumns = options.numberOfColumns;
    this.#numberOfRows = options.numberOfRows;
    this.#isRGB = options.photometricInterpretation === 'RGB';
    if (this.#isRGB) {
      throw new Error('The MPRPixGenerator does not support RGB data.');
    }
    this.#halfNCols = this.#numberOfColumns * 0.5;
    this.#halfNRows = this.#numberOfRows * 0.5;
  }

  setNumberOfSlices(num) {
    this.#numberOfSlices = num;
    this.#halfNSlices = num * 0.5;
  }

  setImages(imgs) {
    // check sizes
    var img;
    for (var i = 0; i < imgs.length; ++i) {
      img = imgs[i];
      if (img.width !== this.#halfNCols) {
        throw new Error('Image width mismatch: ' +
          img.width + '!=' + this.#halfNCols);
      }
      if (img.height !== this.#halfNRows) {
        throw new Error('Image height mismatch: ' +
          img.height + '!=' + this.#halfNRows);
      }
    }
    // store
    this.images = imgs;
    // store buffers
    this.buffers = [];
    for (var i0 = 0; i0 < imgs.length; ++i0) {
      this.buffers.push(getImageDataData(this.images[i0]));
    }
  }

  generate(pixelBuffer, sliceNumber) {
    if (sliceNumber > this.#numberOfSlices) {
      throw new Error('Cannot generate slice, number is above size: ' +
        sliceNumber + ', ' + this.#numberOfSlices);
    }
    var orientationName =
      getOrientationName(this.#options.imageOrientationPatient);
    if (orientationName === 'axial') {
      this.generateAsAxial(pixelBuffer, sliceNumber);
    } else if (orientationName === 'coronal') {
      this.generateAsCoronal(pixelBuffer, sliceNumber);
    } else if (orientationName === 'sagittal') {
      this.generateAsSagittal(pixelBuffer, sliceNumber);
    }
  }

  generateAsAxial(pixelBuffer, sliceNumber) {
    // axial
    var offset = 0;
    for (var j0 = 0; j0 < this.#halfNRows; ++j0) {
      for (var i0 = 0; i0 < this.#halfNCols; ++i0) {
        pixelBuffer[offset] = this.#getFunc('axial', i0, j0);
        ++offset;
      }
      offset += this.#halfNCols;
    }
    if (sliceNumber < this.#halfNSlices) {
      // coronal
      offset = this.#halfNCols;
      for (var j1 = 0; j1 < this.#numberOfRows; ++j1) {
        for (var i1 = 0; i1 < this.#halfNCols; ++i1) {
          pixelBuffer[offset] = this.#getFunc(
            'coronal', i1, (this.#halfNSlices - 1 - sliceNumber));
          ++offset;
        }
        offset += this.#halfNCols;
      }
    } else {
      // sagittal
      offset = this.#numberOfColumns * this.#halfNRows;
      for (var j2 = 0; j2 < this.#halfNRows; ++j2) {
        for (var i2 = 0; i2 < this.#numberOfColumns; ++i2) {
          pixelBuffer[offset] = this.#getFunc(
            'sagittal', j2, (this.#numberOfSlices - 1 - sliceNumber));
          ++offset;
        }
      }
    }
  }

  generateAsCoronal(pixelBuffer, sliceNumber) {
    // coronal
    var offset = this.#numberOfColumns * this.#halfNRows + this.#halfNCols;
    for (var j0 = 0; j0 < this.#halfNRows; ++j0) {
      for (var i0 = 0; i0 < this.#halfNCols; ++i0) {
        pixelBuffer[offset] = this.#getFunc('coronal', i0, j0);
        ++offset;
      }
      offset += this.#halfNCols;
    }
    if (sliceNumber < this.#halfNSlices) {
      // axial
      offset = 0;
      for (var j1 = 0; j1 < this.#numberOfRows; ++j1) {
        for (var i1 = 0; i1 < this.#halfNCols; ++i1) {
          pixelBuffer[offset] = this.#getFunc(
            'axial', i1, sliceNumber);
          ++offset;
        }
        offset += this.#halfNCols;
      }

    } else {
      // sagittal
      offset = 0;
      for (var j2 = 0; j2 < this.#halfNRows; ++j2) {
        for (var i2 = 0; i2 < this.#numberOfColumns; ++i2) {
          pixelBuffer[offset] = this.#getFunc(
            'sagittal', sliceNumber, j2 - 1);
          ++offset;
        }
      }
    }
  }

  generateAsSagittal(pixelBuffer, sliceNumber) {
    // sagittal
    var offset = this.#halfNCols;
    for (var j0 = 0; j0 < this.#halfNRows; ++j0) {
      for (var i0 = 0; i0 < this.#halfNCols; ++i0) {
        pixelBuffer[offset] = this.#getFunc('sagittal', i0, j0);
        ++offset;
      }
      offset += this.#halfNCols;
    }
    if (sliceNumber < this.#halfNSlices) {
      // axial
      offset = 0;
      for (var j1 = 0; j1 < this.#numberOfRows; ++j1) {
        for (var i1 = 0; i1 < this.#halfNCols; ++i1) {
          pixelBuffer[offset] = this.#getFunc(
            'axial', sliceNumber, i1);
          ++offset;
        }
        offset += this.#halfNCols;
      }

    } else {
      // coronal
      offset = this.#numberOfColumns * this.#halfNRows;
      for (var j2 = 0; j2 < this.#halfNRows; ++j2) {
        for (var i2 = 0; i2 < this.#numberOfColumns; ++i2) {
          pixelBuffer[offset] = this.#getFunc(
            'coronal', sliceNumber, j2 - 1);
          ++offset;
        }
      }
    }
  }

  /**
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {number} The offset for the given position.
   */
  #getOffset(i, j) {
    return i + j * this.#halfNCols;
  }

  /**
   * @param {string} name The image orientation
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {number} The value at the given position.
   */
  #getFunc(name, i, j) {
    var imgIdx = 0;
    if (name === 'axial') {
      imgIdx = 0;
    } else if (name === 'coronal') {
      imgIdx = 1;
    } else if (name === 'sagittal') {
      imgIdx = 2;
    }
    return this.buffers[imgIdx][this.#getOffset(i, j) * 4];
  }

  /**
   * Check tags are coherent with image size.
   *
   * @param {object} tags The tags to check.
   * @param {object} image The associated image.
   * @returns {boolean} True if the tags are ok.
   */
  static checkTags(tags, image) {
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

} // class MPRPixGenerator
