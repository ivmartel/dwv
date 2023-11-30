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
   * Add another index to this one.
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
   * Get the current index with a new 2D base.
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

  /**
   * Get a string id from the index values in the form of: '#0-1_#1-2'.
   *
   * @param {number[]} [dims] Optional list of dimensions to use.
   * @returns {string} The string id.
   */
  toStringId(dims) {
    if (typeof dims === 'undefined') {
      dims = [];
      for (let j = 0; j < this.length(); ++j) {
        dims.push(j);
      }
    }
    for (let ii = 0; ii < dims.length; ++ii) {
      if (dims[ii] >= this.length()) {
        throw new Error('Non valid dimension for toStringId.');
      }
    }
    let res = '';
    for (let i = 0; i < dims.length; ++i) {
      if (i !== 0) {
        res += '_';
      }
      res += '#' + dims[i] + '-' + this.get(dims[i]);
    }
    return res;
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

/**
 * Get an index from an id string in the form of: '#0-1_#1-2'
 * (result of index.toStringId).
 *
 * @param {string} inputStr The input string.
 * @returns {Index} The corresponding index (minimum size is 3D).
 */
export function getIndexFromStringId(inputStr) {
  // split ids
  const strIds = inputStr.split('_');
  // get the size of the index (minimum 3)
  let numberOfDims = 3;
  let dim;
  for (let i = 0; i < strIds.length; ++i) {
    // expecting dim < 10
    dim = parseInt(strIds[i].substring(1, 2), 10);
    // dim is zero based
    if (dim + 1 > numberOfDims) {
      numberOfDims = dim + 1;
    }
  }
  // default values
  const values = new Array(numberOfDims);
  values.fill(0);
  // get other values from the input string
  for (let j = 0; j < strIds.length; ++j) {
    // expecting dim < 10
    dim = parseInt(strIds[j].substring(1, 2), 10);
    const value = parseInt(strIds[j].substring(3), 10);
    values[dim] = value;
  }

  return new Index(values);
}
