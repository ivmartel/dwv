// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Immutable 3D vector.
 *
 * @class
 * @param {number} x The X component of the vector.
 * @param {number} y The Y component of the vector.
 * @param {number} z The Z component of the vector.
 */
dwv.math.Vector3D = function (x, y, z) {
  /**
   * Get the X component of the vector.
   *
   * @returns {number} The X component of the vector.
   */
  this.getX = function () {
    return x;
  };
  /**
   * Get the Y component of the vector.
   *
   * @returns {number} The Y component of the vector.
   */
  this.getY = function () {
    return y;
  };
  /**
   * Get the Z component of the vector.
   *
   * @returns {number} The Z component of the vector.
   */
  this.getZ = function () {
    return z;
  };
}; // Vector3D class

/**
 * Check for Vector3D equality.
 *
 * @param {object} rhs The other vector to compare to.
 * @returns {boolean} True if both vectors are equal.
 */
dwv.math.Vector3D.prototype.equals = function (rhs) {
  return rhs !== null &&
    this.getX() === rhs.getX() &&
    this.getY() === rhs.getY() &&
    this.getZ() === rhs.getZ();
};

/**
 * Get a string representation of the Vector3D.
 *
 * @returns {string} The vector as a string.
 */
dwv.math.Vector3D.prototype.toString = function () {
  return '(' + this.getX() +
    ', ' + this.getY() +
    ', ' + this.getZ() + ')';
};

/**
 * Get the norm of the vector.
 *
 * @returns {number} The norm.
 */
dwv.math.Vector3D.prototype.norm = function () {
  return Math.sqrt(
    (this.getX() * this.getX()) +
    (this.getY() * this.getY()) +
    (this.getZ() * this.getZ())
  );
};

/**
 * Get the cross product with another Vector3D, ie the
 * vector that is perpendicular to both a and b.
 * If both vectors are parallel, the cross product is a zero vector.
 *
 * @see https://en.wikipedia.org/wiki/Cross_product
 * @param {object} vector3D The input vector.
 * @returns {object} The result vector.
 */
dwv.math.Vector3D.prototype.crossProduct = function (vector3D) {
  return new dwv.math.Vector3D(
    (this.getY() * vector3D.getZ()) - (vector3D.getY() * this.getZ()),
    (this.getZ() * vector3D.getX()) - (vector3D.getZ() * this.getX()),
    (this.getX() * vector3D.getY()) - (vector3D.getX() * this.getY()));
};

/**
 * Get the dot product with another Vector3D.
 *
 * @see https://en.wikipedia.org/wiki/Dot_product
 * @param {object} vector3D The input vector.
 * @returns {number} The dot product.
 */
dwv.math.Vector3D.prototype.dotProduct = function (vector3D) {
  return (this.getX() * vector3D.getX()) +
    (this.getY() * vector3D.getY()) +
    (this.getZ() * vector3D.getZ());
};

/**
 * Get a string id from the index values in the form of: '#0-1_#1-2'.
 *
 * @param {number} minDim The start dimension.
 * @returns {string} The string id.
 */
dwv.math.Vector3D.prototype.toStringId = function (minDim) {
  if (typeof minDim === 'undefined') {
    minDim = 0;
  }
  if (minDim >= 3) {
    throw new Error('Minimum dim cannot be equal or greater than length.');
  }
  var res = '';
  for (var i = minDim; i < 3; ++i) {
    if (i !== minDim) {
      res += '_';
    }
    res += '#' + i + '-';
    if (i === 0) {
      res += this.getX();
    } else if (i === 1) {
      res += this.getY();
    } else if (i === 2) {
      res += this.getZ();
    }
  }
  return res;
};

/**
 * Get an index from an id string in the form of: '#0-1_#1-2'
 * (result of index.toStringId).
 *
 * @param {string} inputStr The input string.
 * @returns {object} The corresponding index.
 */
dwv.math.getVectorFromStringId = function (inputStr) {
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
    throw new Error('Cannot create vector from string: ' + inputStr);
  }
  return new dwv.math.Vector3D(values[0], values[1], values[2]);
};
