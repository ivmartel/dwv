import {getImageDataData} from './dicomGenerator.js';

/**
 * FilePixGenerator: generates pixel data from file(s).
 */
export class FilePixGenerator {

  #numberOfColumns;
  #numberOfRows;

  #isRGB;

  #images;

  /**
   * @param {object} options The generator options.
   */
  constructor(options) {
    this.#numberOfColumns = options.numberOfColumns;
    this.#numberOfRows = options.numberOfRows;
    this.#isRGB = options.photometricInterpretation === 'RGB';
  }

  setImages(imgs) {
    // check sizes
    let img;
    for (let i = 0; i < imgs.length; ++i) {
      img = imgs[i];
      if (img.width !== this.#numberOfColumns) {
        throw new Error('Image width mismatch: ' +
          img.width + '!=' + this.#numberOfColumns);
      }
      if (img.height !== this.#numberOfRows) {
        throw new Error('Image height mismatch: ' +
          img.height + '!=' + this.#numberOfRows);
      }
    }
    // store
    this.#images = imgs;
  };

  /**
   * @param {number[]} pixelBuffer The buffer.
   * @param {number} sliceNumber The slice index.
   */
  generate(pixelBuffer, sliceNumber) {
    let image = null;
    if (sliceNumber < this.images.length) {
      image = this.#images[sliceNumber];
    } else {
      image = this.#images[0];
    }
    // get the image data
    const imageData = getImageDataData(image);
    // extract fist component for the pixelBuffer
    const dataLen = imageData.length;
    let j = 0;
    for (let i = 0; i < dataLen; i += 4) {
      pixelBuffer[j] = imageData[i];
      j += 1;
      if (this.#isRGB) {
        pixelBuffer[j + 1] = imageData[i + 1];
        pixelBuffer[j + 2] = imageData[i + 2];
        j += 2;
      }
    }
  };
};

/**
 * Check tags are coherent with image size.
 *
 * @param {object} tags The tags to check.
 * @param {object} image The associated image.
 * @returns {boolean} True if the tags are ok.
 */
export function fileCheckTags(tags, image) {
  /**
   * @param {number} value The value to check.
   * @returns {number} The expected value.
   */
  function getExpectedSize(value) {
    return value;
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