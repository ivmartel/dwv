import {
  getOrientationName,
  Orientation
} from '../../src/math/orientation.js';

import {getImageDataData} from './dicomGenerator.js';

/**
 * MPRPixGenerator: generates pixel data from file
 *   with an input per orientation.
 */
export class MPRPixGenerator {

  #numberOfColumns;
  #numberOfRows;
  #numberOfSlices = 0;

  #halfNCols;
  #halfNRows;
  #halfNSlices = 0;

  #isRGB;
  #orientationName;

  #images = [];
  #buffers = [];

  /**
   * @param {object} options The generator options.
   */
  constructor(options) {
    this.#numberOfColumns = options.numberOfColumns;
    this.#numberOfRows = options.numberOfRows;
    this.#isRGB = options.photometricInterpretation === 'RGB';

    if (this.#isRGB) {
      throw new Error('The MPRPixGenerator does not support RGB data.');
    }

    this.#halfNCols = this.#numberOfColumns * 0.5;
    this.#halfNRows = this.#numberOfRows * 0.5;

    this.#orientationName =
      getOrientationName(options.imageOrientationPatient);
  }

  setNumberOfSlices(num) {
    this.#numberOfSlices = num;
    this.#halfNSlices = num * 0.5;
  };

  setImages(imgs) {
    // check sizes
    let img;
    for (let i = 0; i < imgs.length; ++i) {
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
    this.#images = imgs;
    // store buffers
    this.#buffers = [];
    for (let i0 = 0; i0 < imgs.length; ++i0) {
      this.#buffers.push(getImageDataData(this.#images[i0]));
    }
  };

  generate(pixelBuffer, sliceNumber) {
    if (sliceNumber > this.#numberOfSlices) {
      throw new Error('Cannot generate slice, number is above size: ' +
        sliceNumber + ', ' + this.#numberOfSlices);
    }
    if (this.#orientationName === Orientation.Axial) {
      this.#generateAsAxial(pixelBuffer, sliceNumber);
    } else if (this.#orientationName === Orientation.Coronal) {
      this.#generateAsCoronal(pixelBuffer, sliceNumber);
    } else if (this.#orientationName === Orientation.Sagittal) {
      this.#generateAsSagittal(pixelBuffer, sliceNumber);
    }
  };

  #generateAsAxial(pixelBuffer, sliceNumber) {
    // axial
    let offset = 0;
    for (let j0 = 0; j0 < this.#halfNRows; ++j0) {
      for (let i0 = 0; i0 < this.#halfNCols; ++i0) {
        pixelBuffer[offset] = this.#getFunc(Orientation.Axial, i0, j0);
        ++offset;
      }
      offset += this.#halfNCols;
    }
    if (sliceNumber < this.#halfNSlices) {
      // coronal
      offset = this.#halfNCols;
      for (let j1 = 0; j1 < this.#numberOfRows; ++j1) {
        for (let i1 = 0; i1 < this.#halfNCols; ++i1) {
          pixelBuffer[offset] = this.#getFunc(
            Orientation.Coronal, i1, (this.#halfNSlices - 1 - sliceNumber));
          ++offset;
        }
        offset += this.#halfNCols;
      }
    } else {
      // sagittal
      offset = this.#numberOfColumns * this.#halfNRows;
      for (let j2 = 0; j2 < this.#halfNRows; ++j2) {
        for (let i2 = 0; i2 < this.#numberOfColumns; ++i2) {
          pixelBuffer[offset] = this.#getFunc(
            Orientation.Sagittal, j2, (this.#numberOfSlices - 1 - sliceNumber));
          ++offset;
        }
      }
    }
  };

  #generateAsCoronal(pixelBuffer, sliceNumber) {
    // coronal
    let offset = this.#numberOfColumns * this.#halfNRows + this.#halfNCols;
    for (let j0 = 0; j0 < this.#halfNRows; ++j0) {
      for (let i0 = 0; i0 < this.#halfNCols; ++i0) {
        pixelBuffer[offset] = this.#getFunc(Orientation.Coronal, i0, j0);
        ++offset;
      }
      offset += this.#halfNCols;
    }
    if (sliceNumber < this.#halfNSlices) {
      // axial
      offset = 0;
      for (let j1 = 0; j1 < this.#numberOfRows; ++j1) {
        for (let i1 = 0; i1 < this.#halfNCols; ++i1) {
          pixelBuffer[offset] = this.#getFunc(
            Orientation.Axial, i1, sliceNumber);
          ++offset;
        }
        offset += this.#halfNCols;
      }

    } else {
      // sagittal
      offset = 0;
      for (let j2 = 0; j2 < this.#halfNRows; ++j2) {
        for (let i2 = 0; i2 < this.#numberOfColumns; ++i2) {
          pixelBuffer[offset] = this.#getFunc(
            Orientation.Sagittal, sliceNumber, j2 - 1);
          ++offset;
        }
      }
    }
  };

  #generateAsSagittal(pixelBuffer, sliceNumber) {
    // sagittal
    let offset = this.#halfNCols;
    for (let j0 = 0; j0 < this.#halfNRows; ++j0) {
      for (let i0 = 0; i0 < this.#halfNCols; ++i0) {
        pixelBuffer[offset] = this.#getFunc(Orientation.Sagittal, i0, j0);
        ++offset;
      }
      offset += this.#halfNCols;
    }
    if (sliceNumber < this.#halfNSlices) {
      // axial
      offset = 0;
      for (let j1 = 0; j1 < this.#numberOfRows; ++j1) {
        for (let i1 = 0; i1 < this.#halfNCols; ++i1) {
          pixelBuffer[offset] = this.#getFunc(
            Orientation.Axial, sliceNumber, i1);
          ++offset;
        }
        offset += this.#halfNCols;
      }

    } else {
      // coronal
      offset = this.#numberOfColumns * this.#halfNRows;
      for (let j2 = 0; j2 < this.#halfNRows; ++j2) {
        for (let i2 = 0; i2 < this.#numberOfColumns; ++i2) {
          pixelBuffer[offset] = this.#getFunc(
            Orientation.Coronal, sliceNumber, j2 - 1);
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
  #getOffset(i, j) {
    return i + j * this.#halfNCols;
  }

  /**
   * @param {string} name The image orientation.
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {number} The value at the given position.
   */
  #getFunc(name, i, j) {
    let imgIdx = 0;
    if (name === Orientation.Axial) {
      imgIdx = 0;
    } else if (name === Orientation.Coronal) {
      imgIdx = 1;
    } else if (name === Orientation.Sagittal) {
      imgIdx = 2;
    }
    return this.#buffers[imgIdx][this.#getOffset(i, j) * 4];
  }
};

/**
 * Check tags are coherent with image size.
 *
 * @param {object} tags The tags to check.
 * @param {object} image The associated image.
 * @returns {boolean} True if the tags are ok.
 */
export function mprCheckTags(tags, image) {
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
