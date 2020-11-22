// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};
/** @namespace */
dwv.image.filter = dwv.image.filter || {};

/**
 * Threshold an image between an input minimum and maximum.
 * @constructor
 */
dwv.image.filter.Threshold = function () {
  /**
     * Threshold minimum.
     * @private
     * @type Number
     */
  var min = 0;
  /**
     * Threshold maximum.
     * @private
     * @type Number
     */
  var max = 0;

  /**
     * Get the threshold minimum.
     * @return {Number} The threshold minimum.
     */
  this.getMin = function () {
    return min;
  };
  /**
     * Set the threshold minimum.
     * @param {Number} val The threshold minimum.
     */
  this.setMin = function (val) {
    min = val;
  };
  /**
     * Get the threshold maximum.
     * @return {Number} The threshold maximum.
     */
  this.getMax = function () {
    return max;
  };
  /**
     * Set the threshold maximum.
     * @param {Number} val The threshold maximum.
     */
  this.setMax = function (val) {
    max = val;
  };
  /**
     * Get the name of the filter.
     * @return {String} The name of the filter.
     */
  this.getName = function () {
    return 'Threshold';
  };

  /**
     * Original image.
     * @private
     * @type Object
     */
  var originalImage = null;
  /**
     * Set the original image.
     * @param {Object} image The original image.
     */
  this.setOriginalImage = function (image) {
    originalImage = image;
  };
  /**
     * Get the original image.
     * @return {Object} image The original image.
     */
  this.getOriginalImage = function () {
    return originalImage;
  };
};

/**
 * Transform the main image using this filter.
 * @return {Object} The transformed image.
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
 * @constructor
 */
dwv.image.filter.Sharpen = function () {
  /**
     * Get the name of the filter.
     * @return {String} The name of the filter.
     */
  this.getName = function () {
    return 'Sharpen';
  };
  /**
     * Original image.
     * @private
     * @type Object
     */
  var originalImage = null;
  /**
     * Set the original image.
     * @param {Object} image The original image.
     */
  this.setOriginalImage = function (image) {
    originalImage = image;
  };
  /**
     * Get the original image.
     * @return {Object} image The original image.
     */
  this.getOriginalImage = function () {
    return originalImage;
  };
};

/**
 * Transform the main image using this filter.
 * @return {Object} The transformed image.
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
 * @constructor
 */
dwv.image.filter.Sobel = function () {
  /**
     * Get the name of the filter.
     * @return {String} The name of the filter.
     */
  this.getName = function () {
    return 'Sobel';
  };
  /**
     * Original image.
     * @private
     * @type Object
     */
  var originalImage = null;
  /**
     * Set the original image.
     * @param {Object} image The original image.
     */
  this.setOriginalImage = function (image) {
    originalImage = image;
  };
  /**
     * Get the original image.
     * @return {Object} image The original image.
     */
  this.getOriginalImage = function () {
    return originalImage;
  };
};

/**
 * Transform the main image using this filter.
 * @return {Object} The transformed image.
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
