// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Immutable Size class.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 *
 * @class
 * @param {Array} values The size values.
 */
dwv.image.Size = function (values) {
  if (!values || typeof values === 'undefined') {
    throw new Error('Cannot create size with no values.');
  }
  if (values.length === 0) {
    throw new Error('Cannot create size with empty values.');
  }
  var valueCheck = function (val) {
    return !isNaN(val) && val !== 0;
  };
  if (!values.every(valueCheck)) {
    throw new Error('Cannot create size with non number or zero values.');
  }

  /**
   * Get the size value at the given array index.
   *
   * @param {number} i The index to get.
   * @returns {number} The value.
   */
  this.get = function (i) {
    return values[i];
  };

  /**
   * Get the length of the index.
   *
   * @returns {number} The length.
   */
  this.length = function () {
    return values.length;
  };

  /**
   * Get a string representation of the size.
   *
   * @returns {string} The Size as a string.
   */
  this.toString = function () {
    return '(' + values.toString() + ')';
  };

  /**
   * Get the values of this index.
   *
   * @returns {Array} The array of values.
   */
  this.getValues = function () {
    return values.slice();
  };

}; // Size class

/**
 * Check if a dimension exists and has more than one element.
 *
 * @param {object} dimension The dimension to check.
 * @returns {boolean} True if the size is more than one.
 */
dwv.image.Size.prototype.moreThanOne = function (dimension) {
  return this.length() >= dimension + 1 && this.get(dimension) !== 1;
};

/**
 * Check if the third direction of an orientation matrix has a size
 * of more than one.
 *
 * @param {object} viewOrientation The orientation matrix.
 * @returns {boolean} True if scrollable.
 */
dwv.image.Size.prototype.canScroll = function (viewOrientation) {
  var dimension = 2;
  if (typeof viewOrientation !== 'undefined') {
    dimension = viewOrientation.getThirdColMajorDirection();
  }
  return this.moreThanOne(dimension);
};

/**
 * Get the size of a given dimension.
 *
 * @param {number} dimension The dimension.
 * @param {number} start Optional start dimension to start counting from.
 * @returns {number} The size.
 */
dwv.image.Size.prototype.getDimSize = function (dimension, start) {
  if (dimension > this.length()) {
    return null;
  }
  if (typeof start === 'undefined') {
    start = 0;
  } else {
    if (start < 0 || start > dimension) {
      throw new Error('Invalid start value for getDimSize');
    }
  }
  var size = 1;
  for (var i = start; i < dimension; ++i) {
    size *= this.get(i);
  }
  return size;
};

/**
 * Get the total size.
 *
 * @param {number} start Optional start dimension to base the offset on.
 * @returns {number} The total size.
 */
dwv.image.Size.prototype.getTotalSize = function (start) {
  return this.getDimSize(this.length(), start);
};

/**
 * Check for equality.
 *
 * @param {dwv.image.Size} rhs The object to compare to.
 * @returns {boolean} True if both objects are equal.
 */
dwv.image.Size.prototype.equals = function (rhs) {
  // check input
  if (!rhs) {
    return false;
  }
  // check length
  var length = this.length();
  if (length !== rhs.length()) {
    return false;
  }
  // check values
  for (var i = 0; i < length; ++i) {
    if (this.get(i) !== rhs.get(i)) {
      return false;
    }
  }
  // seems ok!
  return true;
};

/**
 * Check that an index is within bounds.
 *
 * @param {object} index The index to check.
 * @returns {boolean} True if the given coordinates are within bounds.
 */
dwv.image.Size.prototype.isInBounds = function (index) {
  // check input
  if (!index) {
    return false;
  }
  // check length
  var length = this.length();
  if (length !== index.length()) {
    return false;
  }
  // check values
  for (var i = 0; i < length; ++i) {
    if (index.get(i) < 0 || index.get(i) > this.get(i) - 1) {
      return false;
    }
  }
  // seems ok!
  return true;
};

/**
 * Convert an index to an offset in memory.
 *
 * @param {object} index The index to convert.
 * @param {number} start Optional start dimension to base the offset on.
 * @returns {number} The offset.
 */
dwv.image.Size.prototype.indexToOffset = function (index, start) {
  // TODO check for equality
  if (index.length() < this.length()) {
    throw new Error('Incompatible index and size length');
  }
  if (typeof start === 'undefined') {
    start = 0;
  } else {
    if (start < 0 || start > this.length() - 1) {
      throw new Error('Invalid start value for indexToOffset');
    }
  }
  var offset = 0;
  for (var i = start; i < this.length(); ++i) {
    offset += index.get(i) * this.getDimSize(i, start);
  }
  return offset;
};

/**
 * Convert an offset in memory to an index.
 *
 * @param {number} offset The offset to convert.
 * @returns {object} The index.
 */
dwv.image.Size.prototype.offsetToIndex = function (offset) {
  var values = new Array(this.length());
  var off = offset;
  var dimSize = 0;
  for (var i = this.length() - 1; i > 0; --i) {
    dimSize = this.getDimSize(i);
    values[i] = Math.floor(off / dimSize);
    off = off - values[i] * dimSize;
  }
  values[0] = off;
  return new dwv.math.Index(values);
};

/**
 * Get the 2D base of this size.
 *
 * @returns {object} The 2D base [0,1] as {x,y}.
 */
dwv.image.Size.prototype.get2D = function () {
  return {
    x: this.get(0),
    y: this.get(1)
  };
};
