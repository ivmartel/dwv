// doc imports
/* eslint-disable no-unused-vars */
import {Image} from './image';
/* eslint-enable no-unused-vars */

/**
 * Threshold an image between an input minimum and maximum.
 */
export class Threshold {
  /**
   * Threshold minimum.
   *
   * @type {number}
   */
  #min = 0;

  /**
   * Threshold maximum.
   *
   * @type {number}
   */
  #max = 0;

  /**
   * Get the threshold minimum.
   *
   * @returns {number} The threshold minimum.
   */
  getMin() {
    return this.#min;
  }

  /**
   * Set the threshold minimum.
   *
   * @param {number} val The threshold minimum.
   */
  setMin(val) {
    this.#min = val;
  }

  /**
   * Get the threshold maximum.
   *
   * @returns {number} The threshold maximum.
   */
  getMax() {
    return this.#max;
  }

  /**
   * Set the threshold maximum.
   *
   * @param {number} val The threshold maximum.
   */
  setMax(val) {
    this.#max = val;
  }

  /**
   * Get the name of the filter.
   *
   * @returns {string} The name of the filter.
   */
  getName() {
    return 'Threshold';
  }

  /**
   * Original image.
   *
   * @type {Image}
   */
  #originalImage = null;

  /**
   * Set the original image.
   *
   * @param {Image} image The original image.
   */
  setOriginalImage(image) {
    this.#originalImage = image;
  }

  /**
   * Get the original image.
   *
   * @returns {Image} The original image.
   */
  getOriginalImage() {
    return this.#originalImage;
  }

  /**
   * Transform the main image using this filter.
   *
   * @returns {Image} The transformed image.
   */
  update() {
    const image = this.getOriginalImage();
    const imageMin = image.getDataRange().min;
    const threshFunction = (value) => {
      if (value < this.getMin() || value > this.getMax()) {
        return imageMin;
      } else {
        return value;
      }
    };
    return image.transform(threshFunction);
  }

} // class Threshold

/**
 * Sharpen an image using a sharpen convolution matrix.
 */
export class Sharpen {
  /**
   * Get the name of the filter.
   *
   * @returns {string} The name of the filter.
   */
  getName() {
    return 'Sharpen';
  }

  /**
   * Original image.
   *
   * @type {Image}
   */
  #originalImage = null;

  /**
   * Set the original image.
   *
   * @param {Image} image The original image.
   */
  setOriginalImage(image) {
    this.#originalImage = image;
  }

  /**
   * Get the original image.
   *
   * @returns {Image} The original image.
   */
  getOriginalImage() {
    return this.#originalImage;
  }

  /**
   * Transform the main image using this filter.
   *
   * @returns {Image} The transformed image.
   */
  update() {
    const image = this.getOriginalImage();
    /* eslint-disable array-element-newline */
    return image.convolute2D([
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]);
    /* eslint-enable array-element-newline */
  }

} // class Sharpen

/**
 * Apply a Sobel filter to an image.
 */
export class Sobel {
  /**
   * Get the name of the filter.
   *
   * @returns {string} The name of the filter.
   */
  getName() {
    return 'Sobel';
  }

  /**
   * Original image.
   *
   * @type {Image}
   */
  #originalImage = null;

  /**
   * Set the original image.
   *
   * @param {Image} image The original image.
   */
  setOriginalImage(image) {
    this.#originalImage = image;
  }

  /**
   * Get the original image.
   *
   * @returns {Image} The original image.
   */
  getOriginalImage() {
    return this.#originalImage;
  }

  /**
   * Transform the main image using this filter.
   *
   * @returns {Image} The transformed image.
   */
  update() {
    const image = this.getOriginalImage();
    /* eslint-disable array-element-newline */
    const gradX = image.convolute2D([
      1, 0, -1,
      2, 0, -2,
      1, 0, -1
    ]);
    const gradY = image.convolute2D([
      1, 2, 1,
      0, 0, 0,
      -1, -2, -1
    ]);
    /* eslint-enable array-element-newline */
    return gradX.compose(gradY, function (x, y) {
      return Math.sqrt(x * x + y * y);
    });
  }

} // class Sobel
