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
  // matrix inverse, calculated at first ask
  var inverse = null;

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

  /**
   * Get the inverse of this matrix.
   *
   * @returns {dwv.math.Matrix33|undefined} The inverse matrix or undefined
   *   if the determinant is zero.
   */
  this.getInverse = function () {
    if (inverse === null) {
      inverse = dwv.math.getMatrixInverse(this);
    }
    return inverse;
  };

}; // Matrix33

/**
 * Check for Matrix33 equality.
 *
 * @param {dwv.math.Matrix33} rhs The other matrix to compare to.
 * @param {number} p A numeric expression for the precision to use in check
 *   (ex: 0.001). Defaults to Number.EPSILON if not provided.
 * @returns {boolean} True if both matrices are equal.
 */
dwv.math.Matrix33.prototype.equals = function (rhs, p) {
  // TODO: add type check
  // check values
  for (var i = 0; i < 3; ++i) {
    for (var j = 0; j < 3; ++j) {
      if (!dwv.math.isSimilar(this.get(i, j), rhs.get(i, j), p)) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Get a string representation of the Matrix33.
 *
 * @returns {string} The matrix as a string.
 */
dwv.math.Matrix33.prototype.toString = function () {
  var str = '[';
  for (var i = 0; i < 3; ++i) {
    if (i !== 0) {
      str += ', \n ';
    }
    for (var j = 0; j < 3; ++j) {
      if (j !== 0) {
        str += ', ';
      }
      str += this.get(i, j);
    }
  }
  str += ']';
  return str;
};

/**
 * Multiply this matrix by another.
 *
 * @param {dwv.math.Matrix33} rhs The matrix to multiply by.
 * @returns {dwv.math.Matrix33} The product matrix.
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
 * @returns {dwv.math.Matrix33} The result matrix.
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
 * @param {dwv.math.Vector3D} vector3D The input 3D vector.
 * @returns {dwv.math.Vector3D} The result 3D vector.
 */
dwv.math.Matrix33.prototype.multiplyVector3D = function (vector3D) {
  var array3D = this.multiplyArray3D(
    [vector3D.getX(), vector3D.getY(), vector3D.getZ()]
  );
  return new dwv.math.Vector3D(array3D[0], array3D[1], array3D[2]);
};

/**
 * Multiply this matrix by a 3D point.
 *
 * @param {dwv.math.Point3D} point3D The input 3D point.
 * @returns {dwv.math.Point3D} The result 3D point.
 */
dwv.math.Matrix33.prototype.multiplyPoint3D = function (point3D) {
  var array3D = this.multiplyArray3D(
    [point3D.getX(), point3D.getY(), point3D.getZ()]
  );
  return new dwv.math.Point3D(array3D[0], array3D[1], array3D[2]);
};

/**
 * Multiply this matrix by a 3D index.
 *
 * @param {dwv.math.Index} index3D The input 3D index.
 * @returns {dwv.math.Index} The result 3D index.
 */
dwv.math.Matrix33.prototype.multiplyIndex3D = function (index3D) {
  var array3D = this.multiplyArray3D(index3D.getValues());
  return new dwv.math.Index(array3D);
};

/**
 * Get the inverse of an input 3*3 matrix.
 *
 * @param {dwv.math.Matrix33} m The input matrix.
 * @returns {dwv.math.Matrix33|undefined} The inverse matrix or undefined
 *   if the determinant is zero.
 * @see https://en.wikipedia.org/wiki/Invertible_matrix#Inversion_of_3_%C3%97_3_matrices
 * @see https://github.com/willnode/N-Matrix-Programmer
 */
dwv.math.getMatrixInverse = function (m) {
  var m00 = m.get(0, 0);
  var m01 = m.get(0, 1);
  var m02 = m.get(0, 2);
  var m10 = m.get(1, 0);
  var m11 = m.get(1, 1);
  var m12 = m.get(1, 2);
  var m20 = m.get(2, 0);
  var m21 = m.get(2, 1);
  var m22 = m.get(2, 2);

  var a1212 = m11 * m22 - m12 * m21;
  var a2012 = m12 * m20 - m10 * m22;
  var a0112 = m10 * m21 - m11 * m20;

  var det = m00 * a1212 + m01 * a2012 + m02 * a0112;
  if (det === 0) {
    dwv.logger.warn('Cannot invert 3*3 matrix with zero determinant.');
    return;
  }
  det = 1 / det;

  var values = [
    det * a1212,
    det * (m02 * m21 - m01 * m22),
    det * (m01 * m12 - m02 * m11),
    det * a2012,
    det * (m00 * m22 - m02 * m20),
    det * (m02 * m10 - m00 * m12),
    det * a0112,
    det * (m01 * m20 - m00 * m21),
    det * (m00 * m11 - m01 * m10)
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
 * @returns {dwv.math.Matrix33} The simplified matrix.
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
 * @returns {dwv.math.Matrix33} The identity matrix.
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
 * @param {dwv.math.Matrix33} mat33 The matrix to test.
 * @returns {boolean} True if identity.
 */
dwv.math.isIdentityMat33 = function (mat33) {
  return mat33.equals(dwv.math.getIdentityMat33());
};

/**
 * Create a 3x3 coronal (xzy) matrix.
 *
 * @returns {dwv.math.Matrix33} The coronal matrix.
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
 * @returns {dwv.math.Matrix33} The sagittal matrix.
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
 * @returns {dwv.math.Matrix33} The orientation matrix.
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

/**
 * Get the oriented values of an input 3D array.
 *
 * @param {Array} array3D The 3D array.
 * @param {dwv.math.Matrix33} orientation The orientation 3D matrix.
 * @returns {Array} The values reordered according to the orientation.
 */
dwv.math.getOrientedArray3D = function (array3D, orientation) {
  // values = orientation * orientedValues
  // -> inv(orientation) * values = orientedValues
  return orientation.getInverse().getAbs().multiplyArray3D(array3D);
};

/**
 * Get the raw values of an oriented input 3D array.
 *
 * @param {Array} array3D The 3D array.
 * @param {dwv.math.Matrix33} orientation The orientation 3D matrix.
 * @returns {Array} The values reordered to compensate the orientation.
 */
dwv.math.getDeOrientedArray3D = function (array3D, orientation) {
  // values = orientation * orientedValues
  // -> inv(orientation) * values = orientedValues
  return orientation.getAbs().multiplyArray3D(array3D);
};
