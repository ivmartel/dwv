// doc imports
/* eslint-disable no-unused-vars */
import {Scalar2D} from '../math/scalar';
/* eslint-enable no-unused-vars */

/**
 * Immutable Spacing class.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 */
export class Spacing {

  /**
   * The spacing values.
   *
   * @type {number[]}
   */
  #values;

  /**
   * @param {number[]} values The spacing values.
   */
  constructor(values) {
    if (!values || typeof values === 'undefined') {
      throw new Error('Cannot create spacing with no values.');
    }
    if (values.length === 0) {
      throw new Error('Cannot create spacing with empty values.');
    }
    const valueCheck = function (val) {
      return !isNaN(val) && val !== 0;
    };
    if (!values.every(valueCheck)) {
      throw new Error('Cannot create spacing with non number or zero values.');
    }
    this.#values = values;
  }

  /**
   * Get the spacing value at the given array index.
   *
   * @param {number} i The index to get.
   * @returns {number} The value.
   */
  get(i) {
    return this.#values[i];
  }

  /**
   * Get the length of the spacing.
   *
   * @returns {number} The length.
   */
  length() {
    return this.#values.length;
  }

  /**
   * Get a string representation of the spacing.
   *
   * @returns {string} The spacing as a string.
   */
  toString() {
    return '(' + this.#values.toString() + ')';
  }

  /**
   * Get the values of this spacing.
   *
   * @returns {number[]} The array of values.
   */
  getValues() {
    return this.#values.slice();
  }

  /**
   * Check for equality.
   *
   * @param {Spacing} rhs The object to compare to.
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
   * Get the 2D base of this size.
   *
   * @returns {Scalar2D} The 2D base [col,row] as {x,y}.
   */
  get2D() {
    return {
      x: this.get(0),
      y: this.get(1)
    };
  }

} // Spacing class
