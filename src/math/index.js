// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Immutable index.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 *
 * @class
 * @param {Array} values The index values.
 */
dwv.math.Index = function (values) {
  if (!values || typeof values === 'undefined') {
    throw new Error('Cannot create index with no values.');
  }
  if (values.length === 0) {
    throw new Error('Cannot create index with empty values.');
  }
  var valueCheck = function (val) {
    return !isNaN(val);
  };
  if (!values.every(valueCheck)) {
    throw new Error('Cannot create index with non number values.');
  }

  /**
   * Get the index value at the given array index.
   *
   * @param {number} i The index to get.
   * @returns {number|undefined} The value or undefined if not in range.
   */
  this.get = function (i) {
    return values[i];
  };

  /**
   * Get the length of the index.
   *
   * @returns {number} The length.
   */
  this.length = function () {
    return values.length;
  };

  /**
   * Get a string representation of the Index.
   *
   * @returns {string} The Index as a string.
   */
  this.toString = function () {
    return '(' + values.toString() + ')';
  };

  /**
   * Get the values of this index.
   *
   * @returns {Array} The array of values.
   */
  this.getValues = function () {
    return values.slice();
  };

}; // Index class

/**
 * Check if the input index can be compared to this one.
 *
 * @param {dwv.math.Index} rhs The index to compare to.
 * @returns {boolean} True if both indices are comparable.
 */
dwv.math.Index.prototype.canCompare = function (rhs) {
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
};

/**
 * Check for Index equality.
 *
 * @param {dwv.math.Index} rhs The index to compare to.
 * @returns {boolean} True if both indices are equal.
 */
dwv.math.Index.prototype.equals = function (rhs) {
  // check if can compare
  if (!this.canCompare(rhs)) {
    return false;
  }
  // check values
  for (var i = 0, leni = this.length(); i < leni; ++i) {
    if (this.get(i) !== rhs.get(i)) {
      return false;
    }
  }
  // seems ok!
  return true;
};

/**
 * Compare indices and return different dimensions.
 *
 * @param {dwv.math.Index} rhs The index to compare to.
 * @returns {Array} The list of different dimensions.
 */
dwv.math.Index.prototype.compare = function (rhs) {
  // check if can compare
  if (!this.canCompare(rhs)) {
    return null;
  }
  // check values
  var diffDims = [];
  for (var i = 0, leni = this.length(); i < leni; ++i) {
    if (this.get(i) !== rhs.get(i)) {
      diffDims.push(i);
    }
  }
  return diffDims;
};

/**
 * Add another index to this one.
 *
 * @param {dwv.math.Index} rhs The index to add.
 * @returns {dwv.math.Index} The index representing the sum of both indices.
 */
dwv.math.Index.prototype.add = function (rhs) {
  // check if can compare
  if (!this.canCompare(rhs)) {
    return null;
  }
  // add values
  var values = [];
  for (var i = 0, leni = this.length(); i < leni; ++i) {
    values.push(this.get(i) + rhs.get(i));
  }
  // seems ok!
  return new dwv.math.Index(values);
};

/**
 * Get the current index with a new 2D base.
 *
 * @param {number} i The new 0 index.
 * @param {number} j The new 1 index.
 * @returns {dwv.math.Index} The new index.
 */
dwv.math.Index.prototype.getWithNew2D = function (i, j) {
  var values = [i, j];
  for (var l = 2, lenl = this.length(); l < lenl; ++l) {
    values.push(this.get(l));
  }
  return new dwv.math.Index(values);
};

/**
 * Get an index with values set to 0 and the input size.
 *
 * @param {number} size The size of the index.
 * @returns {dwv.math.Index} The zero index.
 */
dwv.math.getZeroIndex = function (size) {
  var values = new Array(size);
  values.fill(0);
  return new dwv.math.Index(values);
};

/**
 * Get an array sort callback.
 * f(a,b) > 0 -> b,a
 * f(a,b) < 0 -> a,b
 * f(a,b) = 0 -> original order
 *
 * @param {number} direction The direction to use to compare indices.
 * @returns {Function} A function that compares two dwv.math.Index.
 */
dwv.math.getIndexCompareFunction = function (direction) {
  return function (a, b) {
    return a.get(direction) - b.get(direction);
  };
};

/**
 * Get a string id from the index values in the form of: '#0-1_#1-2'.
 *
 * @param {Array} dims Optional list of dimensions to use.
 * @returns {string} The string id.
 */
dwv.math.Index.prototype.toStringId = function (dims) {
  if (typeof dims === 'undefined') {
    dims = [];
    for (var j = 0; j < this.length(); ++j) {
      dims.push(j);
    }
  }
  for (var ii = 0; ii < dims.length; ++ii) {
    if (dims[ii] >= this.length()) {
      throw new Error('Non valid dimension for toStringId.');
    }
  }
  var res = '';
  for (var i = 0; i < dims.length; ++i) {
    if (i !== 0) {
      res += '_';
    }
    res += '#' + dims[i] + '-' + this.get(dims[i]);
  }
  return res;
};

/**
 * Get an index from an id string in the form of: '#0-1_#1-2'
 * (result of index.toStringId).
 *
 * @param {string} inputStr The input string.
 * @returns {dwv.math.Index} The corresponding index.
 */
dwv.math.getIndexFromStringId = function (inputStr) {
  // split ids
  var strIds = inputStr.split('_');
  // get the size of the index
  var pointLength = 0;
  var dim;
  for (var i = 0; i < strIds.length; ++i) {
    dim = parseInt(strIds[i].substring(1, 2), 10);
    if (dim > pointLength) {
      pointLength = dim;
    }
  }
  if (pointLength === 0) {
    throw new Error('No dimension found in point stringId');
  }
  // default values
  var values = new Array(pointLength);
  values.fill(0);
  // get other values from the input string
  for (var j = 0; j < strIds.length; ++j) {
    dim = parseInt(strIds[j].substring(1, 3), 10);
    var value = parseInt(strIds[j].substring(3), 10);
    values[dim] = value;
  }
  return new dwv.math.Point(values);
};
