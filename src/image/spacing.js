// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * 2D/3D Spacing class.
 *
 * @class
 * @param {number} columnSpacing The column spacing.
 * @param {number} rowSpacing The row spacing.
 * @param {number} sliceSpacing The slice spacing.
 */
dwv.image.Spacing = function (columnSpacing, rowSpacing, sliceSpacing) {
  /**
   * Get the column spacing.
   *
   * @returns {number} The column spacing.
   */
  this.getColumnSpacing = function () {
    return columnSpacing;
  };
  /**
   * Get the row spacing.
   *
   * @returns {number} The row spacing.
   */
  this.getRowSpacing = function () {
    return rowSpacing;
  };
  /**
   * Get the slice spacing.
   *
   * @returns {number} The slice spacing.
   */
  this.getSliceSpacing = function () {
    return (sliceSpacing || 1.0);
  };
};

/**
 * Check for equality.
 *
 * @param {dwv.image.Spacing} rhs The object to compare to.
 * @returns {boolean} True if both objects are equal.
 */
dwv.image.Spacing.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getColumnSpacing() === rhs.getColumnSpacing() &&
    this.getRowSpacing() === rhs.getRowSpacing() &&
    this.getSliceSpacing() === rhs.getSliceSpacing();
};

/**
 * Get a string representation of the Vector3D.
 *
 * @returns {string} The vector as a string.
 */
dwv.image.Spacing.prototype.toString = function () {
  return '(' + this.getColumnSpacing() +
    ', ' + this.getRowSpacing() +
    ', ' + this.getSliceSpacing() + ')';
};

/**
 * Get the 2D base of this size.
 *
 * @returns {object} The 2D base [col,row] as {x,y}.
 */
dwv.image.Spacing.prototype.get2D = function () {
  return {
    x: this.getColumnSpacing(),
    y: this.getRowSpacing()
  };
};
