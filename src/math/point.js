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
 * @param {dwv.math.Point2D} rhs The other point to compare to.
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
 * @param {dwv.math.Point3D} rhs The other point to compare to.
 * @returns {boolean} True if both points are equal.
 */
dwv.math.Point3D.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getX() === rhs.getX() &&
    this.getY() === rhs.getY() &&
    this.getZ() === rhs.getZ();
};

/**
 * Check for Point3D similarity.
 *
 * @param {dwv.math.Point3D} rhs The other point to compare to.
 * @param {number} tol Optional comparison tolerance,
 *   default to Number.EPSILON.
 * @returns {boolean} True if both points are equal.
 */
dwv.math.Point3D.prototype.isSimilar = function (rhs, tol) {
  return rhs !== null &&
    dwv.math.isSimilar(this.getX(), rhs.getX(), tol) &&
    dwv.math.isSimilar(this.getY(), rhs.getY(), tol) &&
    dwv.math.isSimilar(this.getZ(), rhs.getZ(), tol);
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
 * @returns {dwv.math.Point3D} The 3D vector from the input point to this one.
 */
dwv.math.Point3D.prototype.minus = function (point3D) {
  return new dwv.math.Vector3D(
    (this.getX() - point3D.getX()),
    (this.getY() - point3D.getY()),
    (this.getZ() - point3D.getZ()));
};

/**
 * Get an array find callback for a given point.
 *
 * @param {dwv.math.Point3D} point The point to compare to.
 * @returns {Function} A function that compares its input point to the one
 *   given as input to this function.
 */
dwv.math.getEqualPoint3DFunction = function (point) {
  return function (element) {
    return element.equals(point);
  };
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
 * @param {dwv.math.Point} rhs The point to compare to.
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
 * @param {dwv.math.Point} rhs The point to compare to.
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
 * @param {dwv.math.Point} rhs The point to compare to.
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
 * @returns {dwv.math.Point3D} The Point3D.
 */
dwv.math.Point.prototype.get3D = function () {
  return new dwv.math.Point3D(this.get(0), this.get(1), this.get(2));
};

/**
 * Add another point to this one.
 *
 * @param {dwv.math.Point} rhs The point to add.
 * @returns {dwv.math.Point} The point representing the sum of both points.
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
 * @param {dwv.math.Point3D} rhs The Point3D to merge with.
 * @returns {dwv.math.Point} The merge result.
 */
dwv.math.Point.prototype.mergeWith3D = function (rhs) {
  var values = this.getValues();
  values[0] = rhs.getX();
  values[1] = rhs.getY();
  values[2] = rhs.getZ();
  return new dwv.math.Point(values);
};
