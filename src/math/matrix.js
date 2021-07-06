// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

// difference between 1 and the smallest floating point number greater than 1
// -> ~2e-16
if (typeof Number.EPSILON === 'undefined') {
  Number.EPSILON = Math.pow(2, -52);
}
// -> ~2e-12
dwv.math.BIG_EPSILON = Number.EPSILON * 1e4;

/**
 * Check if two numbers are similar.
 *
 * @param {number} a The first number.
 * @param {number} b The second number.
 * @param {number} tol The comparison tolerance.
 */
dwv.math.isSimilar = function (a, b, tol) {
  if (typeof tol === 'undefined') {
    tol = Number.EPSILON;
  }
  return Math.abs(a - b) < tol;
};

/**
 * Immutable 3x3 Matrix.
 *
 * @param {Array} values row-major ordered 9 values.
 * @class
 */
dwv.math.Matrix33 = function (values) {
  /**
   * Get a value of the matrix.
   *
   * @param {number} row The row at wich to get the value.
   * @param {number} col The column at wich to get the value.
   * @returns {number} The value at the position.
   */
  this.get = function (row, col) {
    return values[row * 3 + col];
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
  return dwv.math.isSimilar(this.get(0, 0), rhs.get(0, 0), p) &&
    dwv.math.isSimilar(this.get(0, 1), rhs.get(0, 1), p) &&
    dwv.math.isSimilar(this.get(0, 2), rhs.get(0, 2), p) &&
    dwv.math.isSimilar(this.get(1, 0), rhs.get(1, 0), p) &&
    dwv.math.isSimilar(this.get(1, 1), rhs.get(1, 1), p) &&
    dwv.math.isSimilar(this.get(1, 2), rhs.get(1, 2), p) &&
    dwv.math.isSimilar(this.get(2, 0), rhs.get(2, 0), p) &&
    dwv.math.isSimilar(this.get(2, 1), rhs.get(2, 1), p) &&
    dwv.math.isSimilar(this.get(2, 2), rhs.get(2, 2), p);
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
  /* eslint-disable array-element-newline */
  return new dwv.math.Matrix33([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]);
  /* eslint-enable array-element-newline */
};

dwv.math.Matrix33.prototype.getRowAbsMax = function (row) {
  var values = [
    Math.abs(this.get(row, 0)),
    Math.abs(this.get(row, 1)),
    Math.abs(this.get(row, 2))
  ];
  var absMax = Math.max.apply(null, values);
  var index = values.indexOf(absMax);
  return {
    value: this.get(row, index),
    index: index
  };
};

/**
 * Get the major directions of an orientation matrix.
 *
 * @returns {array} A 3D array of indices.
 */
dwv.math.Matrix33.prototype.getMajorDirections = function () {
  var res = [];
  for (var i = 0; i < 3; ++i) {
    res.push(this.getRowAbsMax(i).index);
  }
  return res;
};

/**
 * Get the third direction index of an orientation matrix.
 *
 * @returns {number} The index.
 */
dwv.math.Matrix33.prototype.getThirdRowMajorDirection = function () {
  return this.getRowAbsMax(2).index;
};

/**
 * Get the major directions of an oritentation matrix as a string.
 *
 * @returns {string} The major directions as a combination of 'x', 'y' and 'z'.
 */
dwv.math.Matrix33.prototype.getMajorDirectionsAsString = function () {
  var getLetter = function (index) {
    if (index === 0) {
      return 'x';
    } else if (index === 1) {
      return 'y';
    } else if (index === 2) {
      return 'z';
    } else {
      throw new Error('Bad matrix row index.');
    }
  };
  var res = '';
  var majorDirs = this.getMajorDirections();
  for (var i = 0; i < majorDirs.length; ++i) {
    res += getLetter(majorDirs[i]);
  }
  return res;
};

/**
 * Get an orientation matrix that compensates an input one to show axial views
 * as along Z.
 *
 * @param {array} inputDirs The major directions indices of the matrix to
 *   compensate.
 * @returns {object} The compensating matrix.
 */
dwv.math.Matrix33.prototype.getCompensatingViewOrientation = function (
  inputDirs) {
  var majorDirs = this.getMajorDirections();
  var normalDirs = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
  var res = new Array(9);
  for (var i = 0; i < 3; ++i) {
    var posInInputDirs = inputDirs.indexOf(i);
    var posInMajorDirs = majorDirs.indexOf(i);
    // insert the normal dir at the position of the input dir
    res.splice.apply(
      res, [posInInputDirs * 3, 3].concat(normalDirs[posInMajorDirs]));
  }
  return new dwv.math.Matrix33(res);
};
