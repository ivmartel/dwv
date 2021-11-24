// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Immutable 2D point.
 *
 * @class
 * @param {number} x The X coordinate for the point.
 * @param {number} y The Y coordinate for the point.
 */
dwv.math.Point2D = function (x, y) {
  /**
   * Get the X position of the point.
   *
   * @returns {number} The X position of the point.
   */
  this.getX = function () {
    return x;
  };
  /**
   * Get the Y position of the point.
   *
   * @returns {number} The Y position of the point.
   */
  this.getY = function () {
    return y;
  };
}; // Point2D class

/**
 * Check for Point2D equality.
 *
 * @param {object} rhs The other point to compare to.
 * @returns {boolean} True if both points are equal.
 */
dwv.math.Point2D.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getX() === rhs.getX() &&
    this.getY() === rhs.getY();
};

/**
 * Get a string representation of the Point2D.
 *
 * @returns {string} The point as a string.
 */
dwv.math.Point2D.prototype.toString = function () {
  return '(' + this.getX() + ', ' + this.getY() + ')';
};

/**
 * Get the distance to another Point2D.
 *
 * @param {dwv.math.Point2D} point2D The input point.
 * @returns {number} The distance to the input point.
 */
dwv.math.Point2D.prototype.getDistance = function (point2D) {
  return Math.sqrt(
    (this.getX() - point2D.getX()) * (this.getX() - point2D.getX()) +
    (this.getY() - point2D.getY()) * (this.getY() - point2D.getY()));
};

/**
 * Round a Point2D.
 *
 * @returns {dwv.math.Point2D} The rounded point.
 */
dwv.math.Point2D.prototype.getRound = function () {
  return new dwv.math.Point2D(
    Math.round(this.getX()),
    Math.round(this.getY())
  );
};

/**
 * Immutable 3D point.
 *
 * @class
 * @param {number} x The X coordinate for the point.
 * @param {number} y The Y coordinate for the point.
 * @param {number} z The Z coordinate for the point.
 */
dwv.math.Point3D = function (x, y, z) {
  /**
   * Get the X position of the point.
   *
   * @returns {number} The X position of the point.
   */
  this.getX = function () {
    return x;
  };
  /**
   * Get the Y position of the point.
   *
   * @returns {number} The Y position of the point.
   */
  this.getY = function () {
    return y;
  };
  /**
   * Get the Z position of the point.
   *
   * @returns {number} The Z position of the point.
   */
  this.getZ = function () {
    return z;
  };
}; // Point3D class

/**
 * Check for Point3D equality.
 *
 * @param {object} rhs The other point to compare to.
 * @returns {boolean} True if both points are equal.
 */
dwv.math.Point3D.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getX() === rhs.getX() &&
    this.getY() === rhs.getY() &&
    this.getZ() === rhs.getZ();
};

/**
 * Get a string representation of the Point3D.
 *
 * @returns {string} The point as a string.
 */
dwv.math.Point3D.prototype.toString = function () {
  return '(' + this.getX() +
    ', ' + this.getY() +
    ', ' + this.getZ() + ')';
};

/**
 * Get the distance to another Point3D.
 *
 * @param {dwv.math.Point3D} point3D The input point.
 * @returns {number} Ths distance to the input point.
 */
dwv.math.Point3D.prototype.getDistance = function (point3D) {
  return Math.sqrt(
    (this.getX() - point3D.getX()) * (this.getX() - point3D.getX()) +
    (this.getY() - point3D.getY()) * (this.getY() - point3D.getY()) +
    (this.getZ() - point3D.getZ()) * (this.getZ() - point3D.getZ()));
};

/**
 * Get the difference to another Point3D.
 *
 * @param {dwv.math.Point3D} point3D The input point.
 * @returns {object} The 3D vector from the input point to this one.
 */
dwv.math.Point3D.prototype.minus = function (point3D) {
  return new dwv.math.Vector3D(
    (this.getX() - point3D.getX()),
    (this.getY() - point3D.getY()),
    (this.getZ() - point3D.getZ()));
};

/**
 * Check that a point is within input bounds.
 *
 * @param {object} min The minimum point.
 * @param {object} max The maximum point.
 * @returns {boolean} True if the given coordinates are within bounds.
 */
dwv.math.Point3D.prototype.isInBounds = function (min, max) {
  return this.getX() >= min.getX() &&
    this.getY() >= min.getY() &&
    this.getZ() >= min.getZ() &&
    this.getX() <= max.getX() &&
    this.getY() <= max.getY() &&
    this.getZ() <= max.getZ();
};


/**
 * Immutable point.
 * Warning: the input array is NOT cloned, modifying it will
 *  modify the index values.
 *
 * @class
 * @param {Array} values The point values.
 */
dwv.math.Point = function (values) {
  if (!values || typeof values === 'undefined') {
    throw new Error('Cannot create point with no values.');
  }
  if (values.length === 0) {
    throw new Error('Cannot create point with empty values.');
  }
  var valueCheck = function (val) {
    return !isNaN(val);
  };
  if (!values.every(valueCheck)) {
    throw new Error('Cannot create point with non number values.');
  }

  /**
   * Get the index value at the given array index.
   *
   * @param {number} i The index to get.
   * @returns {number} The value.
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

}; // Point class

/**
 * Check if the input point can be compared to this one.
 *
 * @param {object} rhs The point to compare to.
 * @returns {boolean} True if both points are comparable.
 */
dwv.math.Point.prototype.canCompare = function (rhs) {
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
 * Check for Point equality.
 *
 * @param {object} rhs The point to compare to.
 * @returns {boolean} True if both points are equal.
 */
dwv.math.Point.prototype.equals = function (rhs) {
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
 * Compare points and return different dimensions.
 *
 * @param {object} rhs The point to compare to.
 * @returns {Array} The list of different dimensions.
 */
dwv.math.Point.prototype.compare = function (rhs) {
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
 * Get the 3D part of this point.
 *
 * @returns {object} The Point3D.
 */
dwv.math.Point.prototype.get3D = function () {
  return new dwv.math.Point3D(this.get(0), this.get(1), this.get(2));
};

/**
 * Add another point to this one.
 *
 * @param {object} rhs The point to add.
 * @returns {object} The point representing the sum of both indices.
 */
dwv.math.Point.prototype.add = function (rhs) {
  // check if can compare
  if (!this.canCompare(rhs)) {
    return null;
  }
  var values = [];
  var values0 = this.getValues();
  var values1 = rhs.getValues();
  for (var i = 0; i < values0.length; ++i) {
    values.push(values0[i] + values1[i]);
  }
  return new dwv.math.Point(values);
};

/**
 * Merge this point with a Point3D to create a new point.
 *
 * @param {object} rhs The Point3D to merge with.
 * @returns {object} The merge result.
 */
dwv.math.Point.prototype.mergeWith3D = function (rhs) {
  var values = this.getValues();
  values[0] = rhs.getX();
  values[1] = rhs.getY();
  values[2] = rhs.getZ();
  return new dwv.math.Point(values);
};

/**
 * Check that a point is within bounds.
 *
 * @param {object} min The minimum point.
 * @param {object} max The maximum point.
 * @returns {boolean} True if the given coordinates are within bounds.
 */
dwv.math.Point.prototype.isInBounds = function (min, max) {
  // check if can compare
  if (!this.canCompare(min) || !this.canCompare(max)) {
    return null;
  }
  // check values
  for (var i = 0; i < this.length(); ++i) {
    if (this.get(i) < min.get(i) || this.get(i) > max.get(i)) {
      return false;
    }
  }
  // all good
  return true;
};

/**
 * Get a string id from the index values in the form of: '#0-1_#1-2'.
 *
 * @param {number} minDim The start dimension.
 * @param {number} precision The number of significant digits used in
 *   number to string conversion.
 * @returns {string} The string id.
 */
dwv.math.Point.prototype.toStringId = function (minDim, precision) {
  if (typeof minDim === 'undefined') {
    minDim = 0;
  }
  if (minDim >= this.length()) {
    throw new Error('Minimum dim cannot be equal or greater than length.');
  }
  if (typeof precision === 'undefined') {
    precision = 5;
  }
  var toString = function (x) {
    return Number.parseFloat(x).toPrecision(precision);
  };
  var res = '';
  for (var i = minDim; i < this.length(); ++i) {
    if (i !== minDim) {
      res += '_';
    }
    res += '#' + i + '-' + toString(this.get(i));
  }
  return res;
};

/**
 * Get an point from an id string in the form of: '#0-1_#1-2'
 * (result of point.toStringId).
 *
 * @param {string} inputStr The input string.
 * @returns {object} The corresponding index.
 */
dwv.math.getPointFromStringId = function (inputStr) {
  // split ids
  var strIds = inputStr.split('_');
  // get the first dim of the string
  var minDim = strIds[0].substring(1, 2);
  // set first values
  var values = [];
  for (var i = 0; i < minDim; ++i) {
    values.push(0);
  }
  // get other values from the input string
  for (var j = 0; j < strIds.length; ++j) {
    values.push(parseInt(strIds[j].substring(3), 10));
  }
  if (values.length !== 3) {
    throw new Error('Cannot create point from string: ' + inputStr);
  }
  return new dwv.math.Point(values);
};
