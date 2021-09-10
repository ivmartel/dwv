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
 * @returns {boolean} True if similar.
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
 * Multiply this matrix by another.
 *
 * @param {object} rhs The matrix to multiply by.
 * @returns {object} The product matrix.
 */
dwv.math.Matrix33.prototype.multiply = function (rhs) {
  var values = [];
  for (var i = 0; i < 3; ++i) {
    for (var j = 0; j < 3; ++j) {
      var tmp = 0;
      for (var k = 0; k < 3; ++k) {
        tmp += this.get(i, k) * rhs.get(k, j);
      }
      values.push(tmp);
    }
  }
  return new dwv.math.Matrix33(values);
};

/**
 * Get the absolute value of this matrix.
 *
 * @returns {object} The result matrix.
 */
dwv.math.Matrix33.prototype.getAbs = function () {
  var values = [];
  for (var i = 0; i < 3; ++i) {
    for (var j = 0; j < 3; ++j) {
      values.push(Math.abs(this.get(i, j)));
    }
  }
  return new dwv.math.Matrix33(values);
};

/**
 * Multiply this matrix by a 3D array.
 *
 * @param {Array} array3D The input 3D array.
 * @returns {Array} The result 3D array.
 */
dwv.math.Matrix33.prototype.multiplyArray3D = function (array3D) {
  if (array3D.length !== 3) {
    throw new Error('Cannot multiply 3x3 matrix with non 3D array: ',
      array3D.length);
  }
  var values = [];
  for (var i = 0; i < 3; ++i) {
    var tmp = 0;
    for (var j = 0; j < 3; ++j) {
      tmp += this.get(i, j) * array3D[j];
    }
    values.push(tmp);
  }
  return values;
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
  var array3D = this.multiplyArray3D(index3D.getValues());
  return new dwv.math.Index(array3D);
};

/**
 * Get the inverse of this matrix.
 *
 * @returns {object} The inverse matrix.
 * @see https://en.wikipedia.org/wiki/Invertible_matrix#Inversion_of_3_%C3%97_3_matrices
 */
dwv.math.Matrix33.prototype.getInverse = function () {
  var a = this.get(0, 0);
  var b = this.get(0, 1);
  var c = this.get(0, 2);
  var d = this.get(1, 0);
  var e = this.get(1, 1);
  var f = this.get(1, 2);
  var g = this.get(2, 0);
  var h = this.get(2, 1);
  var i = this.get(2, 2);

  var a2 = e * i - f * h;
  var b2 = f * g - d * i;
  var c2 = d * h - e * g;

  var det = a * a2 + b * b2 + c * c2;
  if (det === 0) {
    dwv.logger.warn('Cannot invert matrix with zero determinant.');
    return;
  }

  var values = [
    a2 / det,
    (c * h - b * i) / det,
    (b * f - c * e) / det,
    b2 / det,
    (a * i - c * g) / det,
    (c * d - a * f) / det,
    c2 / det,
    (b * g - a * h) / det,
    (a * e - b * d) / det
  ];

  return new dwv.math.Matrix33(values);
};

/**
 * Get the index of the maximum in absolute value of a row.
 *
 * @param {number} row The row to get the maximum from.
 * @returns {object} The {value,index} of the maximum.
 */
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
 * Get the index of the maximum in absolute value of a column.
 *
 * @param {number} col The column to get the maximum from.
 * @returns {object} The {value,index} of the maximum.
 */
dwv.math.Matrix33.prototype.getColAbsMax = function (col) {
  var values = [
    Math.abs(this.get(0, col)),
    Math.abs(this.get(1, col)),
    Math.abs(this.get(2, col))
  ];
  var absMax = Math.max.apply(null, values);
  var index = values.indexOf(absMax);
  return {
    value: this.get(index, col),
    index: index
  };
};

/**
 * Get this matrix with only zero and +/- ones instead of the maximum,
 *
 * @returns {object} The simplified matrix.
 */
dwv.math.Matrix33.prototype.asOneAndZeros = function () {
  var res = [];
  for (var j = 0; j < 3; ++j) {
    var max = this.getRowAbsMax(j);
    var sign = max.value > 0 ? 1 : -1;
    for (var i = 0; i < 3; ++i) {
      if (i === max.index) {
        //res.push(1);
        res.push(1 * sign);
      } else {
        res.push(0);
      }
    }
  }
  return new dwv.math.Matrix33(res);
};

/**
 * Get the third column direction index of an orientation matrix.
 *
 * @returns {number} The index of the absolute maximum of the last column.
 */
dwv.math.Matrix33.prototype.getThirdColMajorDirection = function () {
  return this.getColAbsMax(2).index;
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

/**
 * Check if a matrix is a 3x3 identity matrix.
 *
 * @param {object} mat33 The matrix to test.
 * @returns {boolean} True if identity.
 */
dwv.math.isIdentityMat33 = function (mat33) {
  return mat33.equals(dwv.math.getIdentityMat33());
};

/**
 * Create a 3x3 coronal (xzy) matrix.
 *
 * @returns {object} The coronal matrix.
 */
dwv.math.getCoronalMat33 = function () {
  /* eslint-disable array-element-newline */
  return new dwv.math.Matrix33([
    1, 0, 0,
    0, 0, 1,
    0, 1, 0
  ]);
  /* eslint-enable array-element-newline */
};

/**
 * Create a 3x3 sagittal (yzx) matrix.
 *
 * @returns {object} The sagittal matrix.
 */
dwv.math.getSagittalMat33 = function () {
  /* eslint-disable array-element-newline */
  return new dwv.math.Matrix33([
    0, 0, 1,
    1, 0, 0,
    0, 1, 0
  ]);
  /* eslint-enable array-element-newline */
};

/**
 * Get an orientation matrix from a name.
 *
 * @param {string} name The orientation name.
 * @returns {object} The orientation matrix.
 */
dwv.math.getMatrixFromName = function (name) {
  var matrix = null;
  if (name === 'axial') {
    matrix = dwv.math.getIdentityMat33();
  } else if (name === 'coronal') {
    matrix = dwv.math.getCoronalMat33();
  } else if (name === 'sagittal') {
    matrix = dwv.math.getSagittalMat33();
  }
  return matrix;
};
