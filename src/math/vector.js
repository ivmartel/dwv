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
  return Math.sqrt((this.getX() * this.getX()) +
        (this.getY() * this.getY()) +
        (this.getZ() * this.getZ()));
};

/**
 * Get the cross product with another Vector3D, ie the
 * vector that is perpendicular to both a and b.
 * If both vectors are parallel, the cross product is a zero vector.
 *
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
 * @param {object} vector3D The input vector.
 * @returns {number} The dot product.
 */
dwv.math.Vector3D.prototype.dotProduct = function (vector3D) {
  return (this.getX() * vector3D.getX()) +
        (this.getY() * vector3D.getY()) +
        (this.getZ() * vector3D.getZ());
};
