// doc imports
/* eslint-disable no-unused-vars */
import {Point2D} from '../math/point';
/* eslint-enable no-unused-vars */

/**
 * Path shape.
 */
export class Path {

  /**
   * @param {Point2D[]} [inputPointArray] The list of Point2D that make
   *   the path (optional).
   * @param {number[]} [inputControlPointIndexArray] The list of control
   *  point of path, as indexes (optional).
   * Note: first and last point do not need to be equal.
   */
  constructor(inputPointArray, inputControlPointIndexArray) {
    /**
     * List of points.
     *
     * @type {Point2D[]}
     */
    this.pointArray = inputPointArray ? inputPointArray.slice() : [];
    /**
     * List of control points.
     *
     * @type {number[]}
     */
    this.controlPointIndexArray = inputControlPointIndexArray
      ? inputControlPointIndexArray.slice() : [];
  }

  /**
   * Get a point of the list.
   *
   * @param {number} index The index of the point
   *   to get (beware, no size check).
   * @returns {Point2D} The Point2D at the given index.
   */
  getPoint(index) {
    return this.pointArray[index];
  }

  /**
   * Is the given point a control point.
   *
   * @param {Point2D} point The Point2D to check.
   * @returns {boolean} True if a control point.
   */
  isControlPoint(point) {
    const index = this.pointArray.indexOf(point);
    if (index !== -1) {
      return this.controlPointIndexArray.indexOf(index) !== -1;
    } else {
      throw new Error('Error: isControlPoint called with not in list point.');
    }
  }

  /**
   * Get the length of the path.
   *
   * @returns {number} The length of the path.
   */
  getLength() {
    return this.pointArray.length;
  }

  /**
   * Add a point to the path.
   *
   * @param {Point2D} point The Point2D to add.
   */
  addPoint(point) {
    this.pointArray.push(point);
  }

  /**
   * Add a control point to the path.
   *
   * @param {Point2D} point The Point2D to make a control point.
   */
  addControlPoint(point) {
    const index = this.pointArray.indexOf(point);
    if (index !== -1) {
      this.controlPointIndexArray.push(index);
    } else {
      throw new Error(
        'Cannot mark a non registered point as control point.');
    }
  }

  /**
   * Add points to the path.
   *
   * @param {Point2D[]} newPointArray The list of Point2D to add.
   */
  addPoints(newPointArray) {
    this.pointArray = this.pointArray.concat(newPointArray);
  }

  /**
   * Append a Path to this one.
   *
   * @param {Path} other The Path to append.
   */
  appenPath(other) {
    const oldSize = this.pointArray.length;
    this.pointArray = this.pointArray.concat(other.pointArray);
    const indexArray = [];
    for (let i = 0; i < other.controlPointIndexArray.length; ++i) {
      indexArray[i] = other.controlPointIndexArray[i] + oldSize;
    }
    this.controlPointIndexArray =
      this.controlPointIndexArray.concat(indexArray);
  }

} // Path class
