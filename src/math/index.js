// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Immutable 3D index.
 *
 * @class
 * @param {number} i The column index.
 * @param {number} j The row index.
 * @param {number} k The slice index.
 */
dwv.math.Index = function (i, j, k) {
  /**
   * Get the column index.
   *
   * @returns {number} The column index.
   */
  this.getI = function () {
    return i;
  };
  /**
   * Get the row index.
   *
   * @returns {number} The row index.
   */
  this.getJ = function () {
    return j;
  };
  /**
   * Get the slice index.
   *
   * @returns {number} The slice index.
   */
  this.getK = function () {
    return k;
  };
}; // Index class

/**
 * Check for Index equality.
 *
 * @param {object} rhs The other index to compare to.
 * @returns {boolean} True if both indices are equal.
 */
dwv.math.Index.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getI() === rhs.getI() &&
    this.getJ() === rhs.getJ() &&
    this.getK() === rhs.getK();
};

/**
 * Get a string representation of the Index.
 *
 * @returns {string} The Index as a string.
 */
dwv.math.Index.prototype.toString = function () {
  return '(' + this.getI() +
    ', ' + this.getJ() +
    ', ' + this.getK() + ')';
};
