// namespaces
var dwv = dwv || {};
dwv.math = dwv.math || {};

/**
 * Immutable 2D point.
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 */
dwv.math.Point2D = function (x,y)
{
    /**
     * Get the X position of the point.
     * @return {Number} The X position of the point.
     */
    this.getX = function () { return x; };
    /**
     * Get the Y position of the point.
     * @return {Number} The Y position of the point.
     */
    this.getY = function () { return y; };
}; // Point2D class

/**
 * Check for Point2D equality.
 * @param {Object} rhs The other point to compare to.
 * @return {Boolean} True if both points are equal.
 */
dwv.math.Point2D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getX() === rhs.getX() &&
        this.getY() === rhs.getY();
};

/**
 * Get a string representation of the Point2D.
 * @return {String} The point as a string.
 */
dwv.math.Point2D.prototype.toString = function () {
    return "(" + this.getX() + ", " + this.getY() + ")";
};

/**
 * Get the distance to another Point2D.
 * @param {Object} point2D The input point.
 */
dwv.math.Point2D.prototype.getDistance = function (point2D) {
    return Math.sqrt(
        (this.getX() - point2D.getX()) * (this.getX() - point2D.getX()) +
        (this.getY() - point2D.getY()) * (this.getY() - point2D.getY()) );
};

/**
 * Mutable 2D point.
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 */
dwv.math.FastPoint2D = function (x,y)
{
    this.x = x;
    this.y = y;
}; // FastPoint2D class

/**
 * Check for FastPoint2D equality.
 * @param {Object} other The other point to compare to.
 * @return {Boolean} True if both points are equal.
 */
dwv.math.FastPoint2D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.x === rhs.x &&
        this.y === rhs.y;
};

/**
 * Get a string representation of the FastPoint2D.
 * @return {String} The point as a string.
 */
dwv.math.FastPoint2D.prototype.toString = function () {
    return "(" + this.x + ", " + this.y + ")";
};

/**
 * Immutable 3D point.
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 * @param {Number} z The Z coordinate for the point.
 */
dwv.math.Point3D = function (x,y,z)
{
    /**
     * Get the X position of the point.
     * @return {Number} The X position of the point.
     */
    this.getX = function () { return x; };
    /**
     * Get the Y position of the point.
     * @return {Number} The Y position of the point.
     */
    this.getY = function () { return y; };
    /**
     * Get the Z position of the point.
     * @return {Number} The Z position of the point.
     */
    this.getZ = function () { return z; };
}; // Point3D class

/**
 * Check for Point3D equality.
 * @param {Object} rhs The other point to compare to.
 * @return {Boolean} True if both points are equal.
 */
dwv.math.Point3D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getX() === rhs.getX() &&
        this.getY() === rhs.getY() &&
        this.getZ() === rhs.getZ();
};

/**
 * Get a string representation of the Point3D.
 * @return {String} The point as a string.
 */
dwv.math.Point3D.prototype.toString = function () {
    return "(" + this.getX() +
        ", " + this.getY() +
        ", " + this.getZ() + ")";
};

/**
 * Get the distance to another Point3D.
 * @param {Object} point3D The input point.
 */
dwv.math.Point3D.prototype.getDistance = function (point3D) {
    return Math.sqrt(
        (this.getX() - point3D.getX()) * (this.getX() - point3D.getX()) +
        (this.getY() - point3D.getY()) * (this.getY() - point3D.getY()) +
        (this.getZ() - point3D.getZ()) * (this.getZ() - point3D.getZ()) );
};

/**
 * Get the difference to another Point3D.
 * @param {Object} point3D The input point.
 * @return {Object} The 3D vector from the input point to this one.
 */
dwv.math.Point3D.prototype.minus = function (point3D) {
    return new dwv.math.Vector3D(
        (this.getX() - point3D.getX()),
        (this.getY() - point3D.getY()),
        (this.getZ() - point3D.getZ()) );
};

/**
 * Immutable 3D index.
 * @constructor
 * @param {Number} i The column index.
 * @param {Number} j The row index.
 * @param {Number} k The slice index.
 */
dwv.math.Index3D = function (i,j,k)
{
    /**
     * Get the column index.
     * @return {Number} The column index.
     */
    this.getI = function () { return i; };
    /**
     * Get the row index.
     * @return {Number} The row index.
     */
    this.getJ = function () { return j; };
    /**
     * Get the slice index.
     * @return {Number} The slice index.
     */
    this.getK = function () { return k; };
}; // Index3D class

/**
 * Check for Index3D equality.
 * @param {Object} rhs The other index to compare to.
 * @return {Boolean} True if both indices are equal.
 */
dwv.math.Index3D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getI() === rhs.getI() &&
        this.getJ() === rhs.getJ() &&
        this.getK() === rhs.getK();
};

/**
 * Get a string representation of the Index3D.
 * @return {String} The Index3D as a string.
 */
dwv.math.Index3D.prototype.toString = function () {
    return "(" + this.getI() +
        ", " + this.getJ() +
        ", " + this.getK() + ")";
};
