// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Immutable index.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 *
 * @class
 * @param {Array} values The index values.
 */
dwv.math.Index = function (values) {
  /**
   * Get the index value at the given array index.
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
   * Get a string representation of the Index.
   *
   * @returns {string} The Index as a string.
   */
  this.toString = function () {
    return '(' + values.toString() + ')';
  };

}; // Index class

/**
 * Check if the input index can be compared to this one.
 *
 * @param {object} rhs The index to compare to.
 * @returns {boolean} True if both indices are comparable.
 */
dwv.math.Index.prototype.canCompare = function (rhs) {
  // check input
  if (!rhs) {
    return false;
  }
  // check length
  if (this.length() !== rhs.length()) {
    return false;
  }
  // seems ok!
  return true;
};

/**
 * Check for Index equality.
 *
 * @param {object} rhs The index to compare to.
 * @returns {boolean} True if both indices are equal.
 */
dwv.math.Index.prototype.equals = function (rhs) {
  // check if can compare
  if (!this.canCompare(rhs)) {
    return false;
  }
  // check values
  for (var i = 0, leni = this.length(); i < leni; ++i) {
    if (this.get(i) !== rhs.get(i)) {
      return false;
    }
  }
  // seems ok!
  return true;
};

/**
 * Add another index to this one.
 *
 * @param {object} rhs The index to add.
 * @returns {object} The index representing the sum of both indices.
 */
dwv.math.Index.prototype.add = function (rhs) {
  // check if can compare
  if (!this.canCompare(rhs)) {
    return null;
  }
  // add values
  var values = [];
  for (var i = 0, leni = this.length(); i < leni; ++i) {
    values.push(this.get(i) + rhs.get(i));
  }
  // seems ok!
  return new dwv.math.Index(values);
};

/**
 * Ge the different dimensions.
 *
 * @param {object} rhs The index to compare to.
 * @returns {Array} The different dimensions.
 */
dwv.math.Index.prototype.differentDims = function (rhs) {
  // check if can compare
  if (!this.canCompare(rhs)) {
    return false;
  }
  // values
  var diffDims = [];
  for (var i = 0, leni = this.length(); i < leni; ++i) {
    if (this.get(i) !== rhs.get(i)) {
      diffDims.push(i);
    }
  }
  return diffDims;
};

/**
 * Get the current index with a new 2D base.
 *
 * @param {number} i The new 0 index.
 * @param {number} j The new 1 index.
 * @returns {object} The new index.
 */
dwv.math.Index.prototype.getWithNew2D = function (i, j) {
  var values = [i, j];
  for (var l = 2; l < this.length(); ++l) {
    values.push(this.get(l));
  }
  return new dwv.math.Index(values);
};
