import {Index} from '../math/index';

// doc imports
/* eslint-disable no-unused-vars */
import {Matrix33} from '../math/matrix';
import {Scalar2D} from '../math/scalar';
/* eslint-enable no-unused-vars */

/**
 * Immutable Size class.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 */
export class Size {

  /**
   * The size values.
   *
   * @type {number[]}
   */
  #values;

  /**
   * @param {number[]} values The size values.
   */
  constructor(values) {
    if (!values || typeof values === 'undefined') {
      throw new Error('Cannot create size with no values.');
    }
    if (values.length === 0) {
      throw new Error('Cannot create size with empty values.');
    }
    const valueCheck = function (val) {
      return !isNaN(val) && val !== 0;
    };
    if (!values.every(valueCheck)) {
      throw new Error('Cannot create size with non number or zero values.');
    }
    this.#values = values;
  }

  /**
   * Get the size value at the given array index.
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
   * Get a string representation of the size.
   *
   * @returns {string} The Size as a string.
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
   * Check if a dimension exists and has more than one element.
   *
   * @param {number} dimension The dimension to check.
   * @returns {boolean} True if the size is more than one.
   */
  moreThanOne(dimension) {
    return this.length() >= dimension + 1 && this.get(dimension) !== 1;
  }

  /**
   * Check if the associated data is scrollable in 3D.
   *
   * @param {Matrix33} [viewOrientation] The orientation matrix.
   * @returns {boolean} True if scrollable.
   */
  canScroll3D(viewOrientation) {
    let dimension = 2;
    if (typeof viewOrientation !== 'undefined') {
      dimension = viewOrientation.getThirdColMajorDirection();
    }
    return this.moreThanOne(dimension);
  }

  /**
   * Check if the associated data is scrollable: either in 3D or
   * in other directions.
   *
   * @param {Matrix33} viewOrientation The orientation matrix.
   * @returns {boolean} True if scrollable.
   */
  canScroll(viewOrientation) {
    let canScroll = this.canScroll3D(viewOrientation);
    // check possible other dimensions
    for (let i = 3; i < this.length(); ++i) {
      canScroll = canScroll || this.moreThanOne(i);
    }
    return canScroll;
  }

  /**
   * Get the size of a given dimension.
   *
   * @param {number} dimension The dimension.
   * @param {number} [start] Optional start dimension to start counting from.
   * @returns {number} The size.
   */
  getDimSize(dimension, start) {
    if (dimension > this.length()) {
      return null;
    }
    if (typeof start === 'undefined') {
      start = 0;
    } else {
      if (start < 0 || start > dimension) {
        throw new Error('Invalid start value for getDimSize');
      }
    }
    let size = 1;
    for (let i = start; i < dimension; ++i) {
      size *= this.get(i);
    }
    return size;
  }

  /**
   * Get the total size.
   *
   * @param {number} [start] Optional start dimension to base the offset on.
   * @returns {number} The total size.
   */
  getTotalSize(start) {
    return this.getDimSize(this.length(), start);
  }

  /**
   * Check for equality.
   *
   * @param {Size} rhs The object to compare to.
   * @returns {boolean} True if both objects are equal.
   */
  equals(rhs) {
    // check input
    if (!rhs) {
      return false;
    }
    // check length
    const length = this.length();
    if (length !== rhs.length()) {
      return false;
    }
    // check values
    for (let i = 0; i < length; ++i) {
      if (this.get(i) !== rhs.get(i)) {
        return false;
      }
    }
    // seems ok!
    return true;
  }

  /**
   * Check that an index is within bounds.
   *
   * @param {Index} index The index to check.
   * @param {number[]} dirs Optional list of directions to check.
   * @returns {boolean} True if the given coordinates are within bounds.
   */
  isInBounds(index, dirs) {
    // check input
    if (!index) {
      return false;
    }
    // check length
    const length = this.length();
    if (length !== index.length()) {
      return false;
    }
    // create dirs if not there
    if (typeof dirs === 'undefined') {
      dirs = [];
      for (let j = 0; j < length; ++j) {
        dirs.push(j);
      }
    } else {
      for (let k = 0; k < length; ++k) {
        if (dirs[k] > length - 1) {
          throw new Error('Wrong input dir value: ' + dirs[k]);
        }
      }
    }
    // check values is 0 <= v < size
    const inBound = function (value, size) {
      return value >= 0 && value < size;
    };
    // check
    for (let i = 0; i < dirs.length; ++i) {
      if (!inBound(index.get(dirs[i]), this.get(dirs[i]))) {
        return false;
      }
    }
    // seems ok!
    return true;
  }

  /**
   * Convert an index to an offset in memory.
   *
   * @param {Index} index The index to convert.
   * @param {number} [start] Optional start dimension to base the offset on.
   * @returns {number} The offset.
   */
  indexToOffset(index, start) {
    // TODO check for equality
    if (index.length() < this.length()) {
      throw new Error('Incompatible index and size length');
    }
    if (typeof start === 'undefined') {
      start = 0;
    } else {
      if (start < 0 || start > this.length() - 1) {
        throw new Error('Invalid start value for indexToOffset');
      }
    }
    let offset = 0;
    for (let i = start; i < this.length(); ++i) {
      offset += index.get(i) * this.getDimSize(i, start);
    }
    return offset;
  }

  /**
   * Convert an offset in memory to an index.
   *
   * @param {number} offset The offset to convert.
   * @returns {Index} The index.
   */
  offsetToIndex(offset) {
    const values = new Array(this.length());
    let off = offset;
    let dimSize = 0;
    for (let i = this.length() - 1; i > 0; --i) {
      dimSize = this.getDimSize(i);
      values[i] = Math.floor(off / dimSize);
      off = off - values[i] * dimSize;
    }
    values[0] = off;
    return new Index(values);
  }

  /**
   * Get the 2D base of this size.
   *
   * @returns {Scalar2D} The 2D base [0,1] as {x,y}.
   */
  get2D() {
    return {
      x: this.get(0),
      y: this.get(1)
    };
  }

} // Size class
