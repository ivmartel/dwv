// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Immutable 3x3 Matrix.
 * @constructor
 */
dwv.math.Matrix33 = function (
    m00, m01, m02,
    m10, m11, m12,
    m20, m21, m22)
{
    // row-major order
    var mat = new Float32Array(9);
    mat[0] = m00; mat[1] = m01; mat[2] = m02;
    mat[3] = m10; mat[4] = m11; mat[5] = m12;
    mat[6] = m20; mat[7] = m21; mat[8] = m22;

    /**
     * Get a value of the matrix.
     * @param {Number} row The row at wich to get the value.
     * @param {Number} col The column at wich to get the value.
     */
    this.get = function (row, col) {
        return mat[row*3 + col];
    };
}; // Matrix33

/**
 * Check for Matrix33 equality.
 * @param {Object} rhs The other matrix to compare to.
 * @param {Number} p A numeric expression for the precision to use in check  (ex: 0.001). Defaults to Number.EPSILON if not provided.
 * @return {Boolean} True if both matrices are equal.
 */
dwv.math.Matrix33.prototype.equals = function (rhs, p) {
    if (p === undefined) { p = Number.EPSILON; }

    return Math.abs(this.get(0, 0) - rhs.get(0, 0)) < p && Math.abs(this.get(0, 1) - rhs.get(0, 1)) < p &&
        Math.abs(this.get(0, 2) - rhs.get(0, 2)) < p && Math.abs(this.get(1, 0) - rhs.get(1, 0)) < p &&
        Math.abs(this.get(1, 1) - rhs.get(1, 1)) < p && Math.abs(this.get(1, 2) - rhs.get(1, 2)) < p &&
        Math.abs(this.get(2, 0) - rhs.get(2, 0)) < p && Math.abs(this.get(2, 1) - rhs.get(2, 1)) < p &&
        Math.abs(this.get(2, 2) - rhs.get(2, 2)) < p;
};

/**
 * Get a string representation of the Matrix33.
 * @return {String} The matrix as a string.
 */
dwv.math.Matrix33.prototype.toString = function () {
    return "[" + this.get(0,0) + ", " + this.get(0,1) + ", " + this.get(0,2) +
        "\n " + this.get(1,0) + ", " + this.get(1,1) + ", " + this.get(1,2) +
        "\n " + this.get(2,0) + ", " + this.get(2,1) + ", " + this.get(2,2) + "]";
};

/**
 * Multiply this matrix by a 3D vector.
 * @param {Object} vector3D The input 3D vector
 * @return {Object} The result 3D vector
 */
dwv.math.Matrix33.multiplyVector3D = function (vector3D) {
    // cache matrix values
    var m00 = this.get(0,0); var m01 = this.get(0,1); var m02 = this.get(0,2);
    var m10 = this.get(1,0); var m11 = this.get(1,1); var m12 = this.get(1,2);
    var m20 = this.get(2,0); var m21 = this.get(2,1); var m22 = this.get(2,2);
    // cache vector values
    var vx = vector3D.getX();
    var vy = vector3D.getY();
    var vz = vector3D.getZ();
    // calculate
    return new dwv.math.Vector3D(
        (m00 * vx) + (m01 * vy) + (m02 * vz),
        (m10 * vx) + (m11 * vy) + (m12 * vz),
        (m20 * vx) + (m21 * vy) + (m22 * vz) );
};

/**
 * Create a 3x3 identity matrix.
 * @return {Object} The identity matrix.
 */
dwv.math.getIdentityMat33= function () {
    return new dwv.math.Matrix33(
        1, 0, 0,
        0, 1, 0,
        0, 0, 1 );
};
