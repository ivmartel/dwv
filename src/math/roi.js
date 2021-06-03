// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Region Of Interest shape.
 * Note: should be a closed path.
 *
 * @class
 */
dwv.math.ROI = function () {
  /**
   * List of points.
   *
   * @private
   * @type {Array}
   */
  var points = [];

  /**
   * Get a point of the list at a given index.
   *
   * @param {number} index The index of the point to get
   *   (beware, no size check).
   * @returns {object} The Point2D at the given index.
   */
  this.getPoint = function (index) {
    return points[index];
  };
  /**
   * Get the length of the point list.
   *
   * @returns {number} The length of the point list.
   */
  this.getLength = function () {
    return points.length;
  };
  /**
   * Add a point to the ROI.
   *
   * @param {object} point The Point2D to add.
   */
  this.addPoint = function (point) {
    points.push(point);
  };
  /**
   * Add points to the ROI.
   *
   * @param {Array} rhs The array of POints2D to add.
   */
  this.addPoints = function (rhs) {
    points = points.concat(rhs);
  };
}; // ROI class
