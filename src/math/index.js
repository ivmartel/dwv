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
  if (!values || typeof values === 'undefined') {
    throw new Error('Cannot create index with no values.');
  }
  if (values.length === 0) {
    throw new Error('Cannot create index with empty values.');
  }
  var valueCheck = function (val) {
    return !isNaN(val);
  };
  if (!values.every(valueCheck)) {
    throw new Error('Cannot create index with non number values.');
  }

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

  /**
   * Get the values of this index.
   *
   * @returns {Array} The array of values.
   */
  this.getValues = function () {
    return values.slice();
  };

}; // Index class

/**
 * Check if the input index can be compared to this one.
 *
 * @param {dwv.math.Index} rhs The index to compare to.
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
 * @param {dwv.math.Index} rhs The index to compare to.
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
 * @param {dwv.math.Index} rhs The index to add.
 * @returns {dwv.math.Index} The index representing the sum of both indices.
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
 * Get the current index with a new 2D base.
 *
 * @param {number} i The new 0 index.
 * @param {number} j The new 1 index.
 * @returns {dwv.math.Index} The new index.
 */
dwv.math.Index.prototype.getWithNew2D = function (i, j) {
  var values = [i, j];
  for (var l = 2, lenl = this.length(); l < lenl; ++l) {
    values.push(this.get(l));
  }
  return new dwv.math.Index(values);
};

/**
 * Get an index with values set to 0 and the input size.
 *
 * @param {number} size The size of the index.
 * @returns {dwv.math.Index} The zero index.
 */
dwv.math.getZeroIndex = function (size) {
  var values = new Array(size);
  values.fill(0);
  return new dwv.math.Index(values);
};
