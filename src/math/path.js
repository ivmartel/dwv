// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Path shape.
 *
 * @class
 * @param {Array} inputPointArray The list of Point2D that make
 *   the path (optional).
 * @param {Array} inputControlPointIndexArray The list of control point of path,
 *  as indexes (optional).
 * Note: first and last point do not need to be equal.
 */
dwv.math.Path = function (inputPointArray, inputControlPointIndexArray) {
  /**
   * List of points.
   *
   * @type {Array}
   */
  this.pointArray = inputPointArray ? inputPointArray.slice() : [];
  /**
   * List of control points.
   *
   * @type {Array}
   */
  this.controlPointIndexArray = inputControlPointIndexArray
    ? inputControlPointIndexArray.slice() : [];
}; // Path class

/**
 * Get a point of the list.
 *
 * @param {number} index The index of the point to get (beware, no size check).
 * @returns {object} The Point2D at the given index.
 */
dwv.math.Path.prototype.getPoint = function (index) {
  return this.pointArray[index];
};

/**
 * Is the given point a control point.
 *
 * @param {object} point The Point2D to check.
 * @returns {boolean} True if a control point.
 */
dwv.math.Path.prototype.isControlPoint = function (point) {
  var index = this.pointArray.indexOf(point);
  if (index !== -1) {
    return this.controlPointIndexArray.indexOf(index) !== -1;
  } else {
    throw new Error('Error: isControlPoint called with not in list point.');
  }
};

/**
 * Get the length of the path.
 *
 * @returns {number} The length of the path.
 */
dwv.math.Path.prototype.getLength = function () {
  return this.pointArray.length;
};

/**
 * Add a point to the path.
 *
 * @param {object} point The Point2D to add.
 */
dwv.math.Path.prototype.addPoint = function (point) {
  this.pointArray.push(point);
};

/**
 * Add a control point to the path.
 *
 * @param {object} point The Point2D to make a control point.
 */
dwv.math.Path.prototype.addControlPoint = function (point) {
  var index = this.pointArray.indexOf(point);
  if (index !== -1) {
    this.controlPointIndexArray.push(index);
  } else {
    throw new Error(
      'Cannot mark a non registered point as control point.');
  }
};

/**
 * Add points to the path.
 *
 * @param {Array} newPointArray The list of Point2D to add.
 */
dwv.math.Path.prototype.addPoints = function (newPointArray) {
  this.pointArray = this.pointArray.concat(newPointArray);
};

/**
 * Append a Path to this one.
 *
 * @param {dwv.math.Path} other The Path to append.
 */
dwv.math.Path.prototype.appenPath = function (other) {
  var oldSize = this.pointArray.length;
  this.pointArray = this.pointArray.concat(other.pointArray);
  var indexArray = [];
  for (var i = 0; i < other.controlPointIndexArray.length; ++i) {
    indexArray[i] = other.controlPointIndexArray[i] + oldSize;
  }
  this.controlPointIndexArray = this.controlPointIndexArray.concat(indexArray);
};
