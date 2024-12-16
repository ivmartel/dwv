/**
 * Immutable index.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 */
export class Index {

  /**
   * Index values.
   *
   * @type {number[]}
   */
  #values;

  /**
   * @param {number[]} values The index values.
   */
  constructor(values) {
    if (!values || typeof values === 'undefined') {
      throw new Error('Cannot create index with no values.');
    }
    if (values.length === 0) {
      throw new Error('Cannot create index with empty values.');
    }
    const valueCheck = function (val) {
      return !isNaN(val);
    };
    if (!values.every(valueCheck)) {
      throw new Error('Cannot create index with non number values.');
    }
    this.#values = values;
  }

  /**
   * Get the index value at the given array index.
   *
   * @param {number} i The index to get.
   * @returns {number|undefined} The value or undefined if not in range.
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
   * Check if the input index can be compared to this one.
   *
   * @param {Index} rhs The index to compare to.
   * @returns {boolean} True if both indices are comparable.
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
   * Check for Index equality.
   *
   * @param {Index} rhs The index to compare to.
   * @returns {boolean} True if both indices are equal.
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
   * Compare indices and return different dimensions.
   *
   * @param {Index} rhs The index to compare to.
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
   * Add another index to this one and return
   *   the result as a new index.
   *
   * @param {Index} rhs The index to add.
   * @returns {Index} The index representing the sum of both indices.
   */
  add(rhs) {
    // check if can compare
    if (!this.canCompare(rhs)) {
      return null;
    }
    // add values
    const values = [];
    for (let i = 0, leni = this.length(); i < leni; ++i) {
      values.push(this.get(i) + rhs.get(i));
    }
    // seems ok!
    return new Index(values);
  }

  /**
   * Add the input value to this index at the given
   *   dimension number and return the result
   *   as a new index.
   *
   * @param {number} dim The dimension number.
   * @param {number} value The value to add.
   * @returns {Index} The result index.
   */
  #addToDim(dim, value) {
    const values = this.#values.slice();
    if (dim < values.length) {
      values[dim] += value;
    } else {
      console.warn('Cannot add to given dimension: ', dim, values.length);
    }
    return new Index(values);
  }

  /**
   * Increment this index by 1 at the given dimension
   *   and return the result as a new index.
   *
   * @param {number} dim The dimension number.
   * @returns {Index} The result index.
   */
  next(dim) {
    return this.#addToDim(dim, 1);
  }

  /**
   * Decrement this index by 1 at the given dimension
   *   and return the result as a new index.
   *
   * @param {number} dim The dimension number.
   * @returns {Index} The result index.
   */
  previous(dim) {
    return this.#addToDim(dim, -1);
  }

  /**
   * Get the current index with a new 2D base
   *   and return the result as a new index.
   *
   * @param {number} i The new 0 index.
   * @param {number} j The new 1 index.
   * @returns {Index} The new index.
   */
  getWithNew2D(i, j) {
    const values = [i, j];
    for (let l = 2, lenl = this.length(); l < lenl; ++l) {
      values.push(this.get(l));
    }
    return new Index(values);
  }

} // Index class

/**
 * Get an index with values set to 0 and the input size.
 *
 * @param {number} size The size of the index.
 * @returns {Index} The zero index.
 */
export function getZeroIndex(size) {
  const values = new Array(size);
  values.fill(0);
  return new Index(values);
}
