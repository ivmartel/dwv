// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};
/** @namespace */
dwv.image.filter = dwv.image.filter || {};

/**
 * Threshold an image between an input minimum and maximum.
 *
 * @class
 */
dwv.image.filter.Threshold = function () {
  /**
   * Threshold minimum.
   *
   * @private
   * @type {number}
   */
  var min = 0;
  /**
   * Threshold maximum.
   *
   * @private
   * @type {number}
   */
  var max = 0;

  /**
   * Get the threshold minimum.
   *
   * @returns {number} The threshold minimum.
   */
  this.getMin = function () {
    return min;
  };
  /**
   * Set the threshold minimum.
   *
   * @param {number} val The threshold minimum.
   */
  this.setMin = function (val) {
    min = val;
  };
  /**
   * Get the threshold maximum.
   *
   * @returns {number} The threshold maximum.
   */
  this.getMax = function () {
    return max;
  };
  /**
   * Set the threshold maximum.
   *
   * @param {number} val The threshold maximum.
   */
  this.setMax = function (val) {
    max = val;
  };
  /**
   * Get the name of the filter.
   *
   * @returns {string} The name of the filter.
   */
  this.getName = function () {
    return 'Threshold';
  };

  /**
   * Original image.
   *
   * @private
   * @type {object}
   */
  var originalImage = null;
  /**
   * Set the original image.
   *
   * @param {object} image The original image.
   */
  this.setOriginalImage = function (image) {
    originalImage = image;
  };
  /**
   * Get the original image.
   *
   * @returns {object} image The original image.
   */
  this.getOriginalImage = function () {
    return originalImage;
  };
};

/**
 * Transform the main image using this filter.
 *
 * @returns {object} The transformed image.
 */
dwv.image.filter.Threshold.prototype.update = function () {
  var image = this.getOriginalImage();
  var imageMin = image.getDataRange().min;
  var self = this;
  var threshFunction = function (value) {
    if (value < self.getMin() || value > self.getMax()) {
      return imageMin;
    } else {
      return value;
    }
  };
  return image.transform(threshFunction);
};

/**
 * Sharpen an image using a sharpen convolution matrix.
 *
 * @class
 */
dwv.image.filter.Sharpen = function () {
  /**
   * Get the name of the filter.
   *
   * @returns {string} The name of the filter.
   */
  this.getName = function () {
    return 'Sharpen';
  };
  /**
   * Original image.
   *
   * @private
   * @type {object}
   */
  var originalImage = null;
  /**
   * Set the original image.
   *
   * @param {object} image The original image.
   */
  this.setOriginalImage = function (image) {
    originalImage = image;
  };
  /**
   * Get the original image.
   *
   * @returns {object} image The original image.
   */
  this.getOriginalImage = function () {
    return originalImage;
  };
};

/**
 * Transform the main image using this filter.
 *
 * @returns {object} The transformed image.
 */
dwv.image.filter.Sharpen.prototype.update = function () {
  var image = this.getOriginalImage();

  return image.convolute2D(
    [0,
      -1,
      0,
      -1,
      5,
      -1,
      0,
      -1,
      0]);
};

/**
 * Apply a Sobel filter to an image.
 *
 * @class
 */
dwv.image.filter.Sobel = function () {
  /**
   * Get the name of the filter.
   *
   * @returns {string} The name of the filter.
   */
  this.getName = function () {
    return 'Sobel';
  };
  /**
   * Original image.
   *
   * @private
   * @type {object}
   */
  var originalImage = null;
  /**
   * Set the original image.
   *
   * @param {object} image The original image.
   */
  this.setOriginalImage = function (image) {
    originalImage = image;
  };
  /**
   * Get the original image.
   *
   * @returns {object} image The original image.
   */
  this.getOriginalImage = function () {
    return originalImage;
  };
};

/**
 * Transform the main image using this filter.
 *
 * @returns {object} The transformed image.
 */
dwv.image.filter.Sobel.prototype.update = function () {
  var image = this.getOriginalImage();

  var gradX = image.convolute2D(
    [1,
      0,
      -1,
      2,
      0,
      -2,
      1,
      0,
      -1]);

  var gradY = image.convolute2D(
    [1,
      2,
      1,
      0,
      0,
      0,
      -1,
      -2,
      -1]);

  return gradX.compose(gradY, function (x, y) {
    return Math.sqrt(x * x + y * y);
  });
};
