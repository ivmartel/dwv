// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Immutable Spacing class.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 *
 * @class
 * @param {Array} values The size values.
 */
dwv.image.Spacing = function (values) {
  if (!values || typeof values === 'undefined') {
    throw new Error('Cannot create spacing with no values.');
  }
  if (values.length === 0) {
    throw new Error('Cannot create spacing with empty values.');
  }
  var valueCheck = function (val) {
    return !isNaN(val) && val !== 0;
  };
  if (!values.every(valueCheck)) {
    throw new Error('Cannot create spacing with non number or zero values.');
  }

  /**
   * Get the spacing value at the given array index.
   *
   * @param {number} i The index to get.
   * @returns {number} The value.
   */
  this.get = function (i) {
    return values[i];
  };

  /**
   * Get the length of the spacing.
   *
   * @returns {number} The length.
   */
  this.length = function () {
    return values.length;
  };

  /**
   * Get a string representation of the spacing.
   *
   * @returns {string} The spacing as a string.
   */
  this.toString = function () {
    return '(' + values.toString() + ')';
  };

  /**
   * Get the values of this spacing.
   *
   * @returns {Array} The array of values.
   */
  this.getValues = function () {
    return values.slice();
  };

}; // Spacing class

/**
 * Check for equality.
 *
 * @param {dwv.image.Spacing} rhs The object to compare to.
 * @returns {boolean} True if both objects are equal.
 */
dwv.image.Spacing.prototype.equals = function (rhs) {
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
 * Get the 2D base of this size.
 *
 * @returns {object} The 2D base [col,row] as {x,y}.
 */
dwv.image.Spacing.prototype.get2D = function () {
  return {
    x: this.get(0),
    y: this.get(1)
  };
};
