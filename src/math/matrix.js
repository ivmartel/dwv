// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

// difference between 1 and the smallest floating point number greater than 1
if (typeof Number.EPSILON === 'undefined') {
  Number.EPSILON = Math.pow(2, -52);
}

/**
 * Immutable 3x3 Matrix.
 *
 * @param {number} m00 m[0][0]
 * @param {number} m01 m[0][1]
 * @param {number} m02 m[0][2]
 * @param {number} m10 m[1][0]
 * @param {number} m11 m[1][1]
 * @param {number} m12 m[1][2]
 * @param {number} m20 m[2][0]
 * @param {number} m21 m[2][1]
 * @param {number} m22 m[2][2]
 * @class
 */
dwv.math.Matrix33 = function (
  m00, m01, m02,
  m10, m11, m12,
  m20, m21, m22) {
  // row-major order
  var mat = new Float32Array(9);
  mat[0] = m00; mat[1] = m01; mat[2] = m02;
  mat[3] = m10; mat[4] = m11; mat[5] = m12;
  mat[6] = m20; mat[7] = m21; mat[8] = m22;

  /**
   * Get a value of the matrix.
   *
   * @param {number} row The row at wich to get the value.
   * @param {number} col The column at wich to get the value.
   * @returns {number} The value at the position.
   */
  this.get = function (row, col) {
    return mat[row * 3 + col];
  };
}; // Matrix33

/**
 * Check for Matrix33 equality.
 *
 * @param {object} rhs The other matrix to compare to.
 * @param {number} p A numeric expression for the precision to use in check
 *   (ex: 0.001). Defaults to Number.EPSILON if not provided.
 * @returns {boolean} True if both matrices are equal.
 */
dwv.math.Matrix33.prototype.equals = function (rhs, p) {
  if (typeof p === 'undefined') {
    p = Number.EPSILON;
  }

  return Math.abs(this.get(0, 0) - rhs.get(0, 0)) < p &&
    Math.abs(this.get(0, 1) - rhs.get(0, 1)) < p &&
    Math.abs(this.get(0, 2) - rhs.get(0, 2)) < p &&
    Math.abs(this.get(1, 0) - rhs.get(1, 0)) < p &&
    Math.abs(this.get(1, 1) - rhs.get(1, 1)) < p &&
    Math.abs(this.get(1, 2) - rhs.get(1, 2)) < p &&
    Math.abs(this.get(2, 0) - rhs.get(2, 0)) < p &&
    Math.abs(this.get(2, 1) - rhs.get(2, 1)) < p &&
    Math.abs(this.get(2, 2) - rhs.get(2, 2)) < p;
};

/**
 * Get a string representation of the Matrix33.
 *
 * @returns {string} The matrix as a string.
 */
dwv.math.Matrix33.prototype.toString = function () {
  return '[' + this.get(0, 0) + ', ' + this.get(0, 1) + ', ' + this.get(0, 2) +
    '\n ' + this.get(1, 0) + ', ' + this.get(1, 1) + ', ' + this.get(1, 2) +
    '\n ' + this.get(2, 0) + ', ' + this.get(2, 1) + ', ' + this.get(2, 2) +
    ']';
};

/**
 * Multiply this matrix by a 3D array.
 *
 * @param {Array} array3D The input 3D array.
 * @returns {Array} The result 3D array.
 */
dwv.math.Matrix33.prototype.multiplyArray3D = function (array3D) {
  // matrix values
  var m00 = this.get(0, 0); var m01 = this.get(0, 1); var m02 = this.get(0, 2);
  var m10 = this.get(1, 0); var m11 = this.get(1, 1); var m12 = this.get(1, 2);
  var m20 = this.get(2, 0); var m21 = this.get(2, 1); var m22 = this.get(2, 2);
  // array values
  var a0 = array3D[0];
  var a1 = array3D[1];
  var a2 = array3D[2];
  // multiply
  return [
    (m00 * a0) + (m01 * a1) + (m02 * a2),
    (m10 * a0) + (m11 * a1) + (m12 * a2),
    (m20 * a0) + (m21 * a1) + (m22 * a2)
  ];
};

/**
 * Multiply this matrix by a 3D vector.
 *
 * @param {object} vector3D The input 3D vector.
 * @returns {object} The result 3D vector.
 */
dwv.math.Matrix33.prototype.multiplyVector3D = function (vector3D) {
  var array3D = this.multiplyArray3D(
    [vector3D.getX(), vector3D.getY(), vector3D.getZ()]
  );
  return new dwv.math.Vector3D(array3D[0], array3D[1], array3D[2]);
};

/**
 * Multiply this matrix by a 3D index.
 *
 * @param {object} index3D The input 3D index.
 * @returns {object} The result 3D index.
 */
dwv.math.Matrix33.prototype.multiplyIndex3D = function (index3D) {
  if (index3D.length() !== 3) {
    throw new Error('Cannot multiply matrix 3x3 with non 3D index: ',
      index3D.length());
  }
  var array3D = this.multiplyArray3D(index3D.getValues());
  return new dwv.math.Index(array3D);
};

/**
 * Create a 3x3 identity matrix.
 *
 * @returns {object} The identity matrix.
 */
dwv.math.getIdentityMat33 = function () {
  return new dwv.math.Matrix33(
    1, 0, 0,
    0, 1, 0,
    0, 0, 1);
};
