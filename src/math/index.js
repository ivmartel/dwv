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
 * Check for Index equality.
 *
 * @param {object} rhs The other index to compare to.
 * @returns {boolean} True if both indices are equal.
 */
dwv.math.Index.prototype.equals = function (rhs) {
  // check input is not falsy
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
 * Add another index to this one.
 *
 * @param {object} rhs The index to add.
 * @returns {object} The sum of both indices.
 */
dwv.math.Index.prototype.add = function (rhs) {
  // check input is not falsy
  if (!rhs) {
    return null;
  }
  // check length
  var length = this.length();
  if (length !== rhs.length()) {
    return null;
  }
  // values
  var values = [];
  for (var i = 0; i < length; ++i) {
    values.push(this.get(i) + rhs.get(i));
  }
  // seems ok!
  return new dwv.math.Index(values);
};
