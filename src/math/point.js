import {isSimilar} from './matrix';
import {Vector3D} from './vector';

/**
 * Immutable 2D point.
 */
export class Point2D {

  /**
   * X position.
   *
   * @type {number}
   */
  #x;

  /**
   * Y position.
   *
   * @type {number}
   */
  #y;

  /**
   * @param {number} x The X coordinate for the point.
   * @param {number} y The Y coordinate for the point.
   */
  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  /**
   * Get the X position of the point.
   *
   * @returns {number} The X position of the point.
   */
  getX() {
    return this.#x;
  }

  /**
   * Get the Y position of the point.
   *
   * @returns {number} The Y position of the point.
   */
  getY() {
    return this.#y;
  }

  /**
   * Check for Point2D equality.
   *
   * @param {Point2D} rhs The other point to compare to.
   * @returns {boolean} True if both points are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      typeof rhs !== 'undefined' &&
      this.#x === rhs.getX() &&
      this.#y === rhs.getY();
  }

  /**
   * Get a string representation of the Point2D.
   *
   * @returns {string} The point as a string.
   */
  toString() {
    return '(' + this.#x + ', ' + this.#y + ')';
  }

} // Point2D class

/**
 * Immutable 3D point.
 */
export class Point3D {

  /**
   * X position.
   *
   * @type {number}
   */
  #x;

  /**
   * Y position.
   *
   * @type {number}
   */
  #y;

  /**
   * Z position.
   *
   * @type {number}
   */
  #z;

  /**
   * @param {number} x The X coordinate for the point.
   * @param {number} y The Y coordinate for the point.
   * @param {number} z The Z coordinate for the point.
   */
  constructor(x, y, z) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
  }

  /**
   * Get the X position of the point.
   *
   * @returns {number} The X position of the point.
   */
  getX() {
    return this.#x;
  }

  /**
   * Get the Y position of the point.
   *
   * @returns {number} The Y position of the point.
   */
  getY() {
    return this.#y;
  }

  /**
   * Get the Z position of the point.
   *
   * @returns {number} The Z position of the point.
   */
  getZ() {
    return this.#z;
  }


  /**
   * Check for Point3D equality.
   *
   * @param {Point3D} rhs The other point to compare to.
   * @returns {boolean} True if both points are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      this.#x === rhs.getX() &&
      this.#y === rhs.getY() &&
      this.#z === rhs.getZ();
  }

  /**
   * Check for Point3D similarity.
   *
   * @param {Point3D} rhs The other point to compare to.
   * @param {number} tol Optional comparison tolerance,
   *   default to Number.EPSILON.
   * @returns {boolean} True if both points are equal.
   */
  isSimilar(rhs, tol) {
    return rhs !== null &&
      isSimilar(this.#x, rhs.getX(), tol) &&
      isSimilar(this.#y, rhs.getY(), tol) &&
      isSimilar(this.#z, rhs.getZ(), tol);
  }

  /**
   * Get a string representation of the Point3D.
   *
   * @returns {string} The point as a string.
   */
  toString() {
    return '(' + this.#x +
      ', ' + this.#y +
      ', ' + this.#z + ')';
  }

  /**
   * Get the distance to another Point3D.
   *
   * @param {Point3D} point3D The input point.
   * @returns {number} Ths distance to the input point.
   */
  getDistance(point3D) {
    return Math.sqrt(this.#getSquaredDistance(point3D));
  }

  /**
   * Get the square of the distance between this and
   * an input point. Used for sorting.
   *
   * @param {Point3D} point3D The input point.
   * @returns {number} The square of the distance.
   */
  #getSquaredDistance(point3D) {
    const dx = this.#x - point3D.getX();
    const dy = this.#y - point3D.getY();
    const dz = this.#z - point3D.getZ();
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Get the closest point to this in a Point3D list.
   *
   * @param {Point3D[]} pointList The list to check.
   * @returns {number} The index of the closest point in the input list.
   */
  getClosest(pointList) {
    let minIndex = 0;
    // the order between squared distances and distances is the same
    let minDist = this.#getSquaredDistance(pointList[minIndex]);
    for (let i = 0; i < pointList.length; ++i) {
      const dist = this.#getSquaredDistance(pointList[i]);
      if (dist < minDist) {
        minIndex = i;
        minDist = dist;
      }
    }
    return minIndex;
  }

  /**
   * Get the difference to another Point3D.
   *
   * @param {Point3D} point3D The input point.
   * @returns {Vector3D} The 3D vector from the input point to this one.
   */
  minus(point3D) {
    return new Vector3D(
      (this.#x - point3D.getX()),
      (this.#y - point3D.getY()),
      (this.#z - point3D.getZ()));
  }

} // Point3D class

/**
 * Get an array find callback for an equal input point.
 *
 * @param {Point3D} point The point to compare to.
 * @returns {Function} A function that compares, using `equals`,
 *   its input point to the one given as input to this function.
 */
export function getEqualPoint3DFunction(point) {
  return function (element) {
    return element.equals(point);
  };
}

/**
 * Immutable point.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 */
export class Point {

  /**
   * Point values.
   *
   * @type {number[]}
   */
  #values;

  /**
   * @param {number[]} values The point values.
   */
  constructor(values) {
    if (!values || typeof values === 'undefined') {
      throw new Error('Cannot create point with no values.');
    }
    if (values.length === 0) {
      throw new Error('Cannot create point with empty values.');
    }
    const valueCheck = function (val) {
      return !isNaN(val);
    };
    if (!values.every(valueCheck)) {
      throw new Error('Cannot create point with non number values.');
    }
    this.#values = values;
  }

  /**
   * Get the index value at the given array index.
   *
   * @param {number} i The index to get.
   * @returns {number} The value.
   */
  get(i) {
    return this.#values[i];
  }

  /**
   * Get the length of the index.
   *
   * @returns {number} The length.
   */
  length() {
    return this.#values.length;
  }

  /**
   * Get a string representation of the Index.
   *
   * @returns {string} The Index as a string.
   */
  toString() {
    return '(' + this.#values.toString() + ')';
  }

  /**
   * Get the values of this index.
   *
   * @returns {number[]} The array of values.
   */
  getValues() {
    return this.#values.slice();
  }

  /**
   * Check if the input point can be compared to this one.
   *
   * @param {Point} rhs The point to compare to.
   * @returns {boolean} True if both points are comparable.
   */
  canCompare(rhs) {
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
  }

  /**
   * Check for Point equality.
   *
   * @param {Point} rhs The point to compare to.
   * @returns {boolean} True if both points are equal.
   */
  equals(rhs) {
    // check if can compare
    if (!this.canCompare(rhs)) {
      return false;
    }
    // check values
    for (let i = 0, leni = this.length(); i < leni; ++i) {
      if (this.get(i) !== rhs.get(i)) {
        return false;
      }
    }
    // seems ok!
    return true;
  }

  /**
   * Compare points and return different dimensions.
   *
   * @param {Point} rhs The point to compare to.
   * @returns {number[]} The list of different dimensions.
   */
  compare(rhs) {
    // check if can compare
    if (!this.canCompare(rhs)) {
      return null;
    }
    // check values
    const diffDims = [];
    for (let i = 0, leni = this.length(); i < leni; ++i) {
      if (this.get(i) !== rhs.get(i)) {
        diffDims.push(i);
      }
    }
    return diffDims;
  }

  /**
   * Get the 3D part of this point.
   *
   * @returns {Point3D} The Point3D.
   */
  get3D() {
    return new Point3D(this.get(0), this.get(1), this.get(2));
  }

  /**
   * Add another point to this one.
   *
   * @param {Point} rhs The point to add.
   * @returns {Point} The point representing the sum of both points.
   */
  add(rhs) {
    // check if can compare
    if (!this.canCompare(rhs)) {
      return null;
    }
    const values = [];
    const values0 = this.getValues();
    const values1 = rhs.getValues();
    for (let i = 0; i < values0.length; ++i) {
      values.push(values0[i] + values1[i]);
    }
    return new Point(values);
  }

  /**
   * Merge this point with a Point3D to create a new point.
   *
   * @param {Point3D} rhs The Point3D to merge with.
   * @returns {Point} The merge result.
   */
  mergeWith3D(rhs) {
    const values = this.getValues();
    values[0] = rhs.getX();
    values[1] = rhs.getY();
    values[2] = rhs.getZ();
    return new Point(values);
  }

} // Point class
