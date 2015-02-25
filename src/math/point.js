/** 
 * Math module.
 * @module math
 */
var dwv = dwv || {};
/**
 * Namespace for math functions.
 * @class math
 * @namespace dwv
 * @static
 */
dwv.math = dwv.math || {};

/** 
 * Immutable 2D point.
 * @class Point2D
 * @namespace dwv.math
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 */
dwv.math.Point2D = function (x,y)
{
    /** 
     * Get the X position of the point.
     * @method getX
     * @return {Number} The X position of the point.
     */
    this.getX = function () { return x; };
    /** 
     * Get the Y position of the point.
     * @method getY
     * @return {Number} The Y position of the point. 
     */
    this.getY = function () { return y; };
}; // Point2D class

/** 
 * Check for Point2D equality.
 * @method equals
 * @param {Point2D} rhs The other Point2D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.Point2D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getX() === rhs.getX() &&
        this.getY() === rhs.getY();
};

/** 
 * Get a string representation of the Point2D.
 * @method toString
 * @return {String} The Point2D as a string.
 */ 
dwv.math.Point2D.prototype.toString = function () {
    return "(" + this.getX() + ", " + this.getY() + ")";
};

/** 
 * Mutable 2D point.
 * @class FastPoint2D
 * @namespace dwv.math
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
 * @method equals
 * @param {FastPoint2D} other The other FastPoint2D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.FastPoint2D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.x === rhs.x &&
        this.y === rhs.y;
};

/** 
 * Get a string representation of the FastPoint2D.
 * @method toString
 * @return {String} The Point2D as a string.
 */ 
dwv.math.FastPoint2D.prototype.toString = function () {
    return "(" + this.x + ", " + this.y + ")";
};

/** 
 * Immutable 3D point.
 * @class Point3D
 * @namespace dwv.math
 * @constructor
 * @param {Number} x The X coordinate for the point.
 * @param {Number} y The Y coordinate for the point.
 * @param {Number} z The Z coordinate for the point.
 */
dwv.math.Point3D = function (x,y,z)
{
    /** 
     * Get the X position of the point.
     * @method getX
     * @return {Number} The X position of the point.
     */
    this.getX = function () { return x; };
    /** 
     * Get the Y position of the point.
     * @method getY
     * @return {Number} The Y position of the point. 
     */
    this.getY = function () { return y; };
    /** 
     * Get the Z position of the point.
     * @method getZ
     * @return {Number} The Z position of the point. 
     */
    this.getZ = function () { return z; };
}; // Point3D class

/** 
 * Check for Point3D equality.
 * @method equals
 * @param {Point3D} rhs The other Point3D to compare to.
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
 * @method toString
 * @return {String} The Point3D as a string.
 */ 
dwv.math.Point3D.prototype.toString = function () {
    return "(" + this.getX() + 
        ", " + this.getY() +
        ", " + this.getZ() + ")";
};

/** 
 * Immutable 3D index.
 * @class Index3D
 * @namespace dwv.math
 * @constructor
 * @param {Number} i The column index.
 * @param {Number} j The row index.
 * @param {Number} k The slice index.
 */
dwv.math.Index3D = function (i,j,k)
{
    /** 
     * Get the column index.
     * @method getI
     * @return {Number} The column index.
     */
    this.getI = function () { return i; };
    /** 
     * Get the row index.
     * @method getJ
     * @return {Number} The row index. 
     */
    this.getJ = function () { return j; };
    /** 
     * Get the slice index.
     * @method getK
     * @return {Number} The slice index. 
     */
    this.getK = function () { return k; };
}; // Index3D class

/** 
 * Check for Index3D equality.
 * @method equals
 * @param {Index3D} rhs The other Index3D to compare to.
 * @return {Boolean} True if both points are equal.
 */ 
dwv.math.Index3D.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getI() === rhs.getI() &&
        this.getJ() === rhs.getJ() &&
        this.getK() === rhs.getK();
};

/** 
 * Get a string representation of the Index3D.
 * @method toString
 * @return {String} The Index3D as a string.
 */ 
dwv.math.Index3D.prototype.toString = function () {
    return "(" + this.getI() + 
        ", " + this.getJ() +
        ", " + this.getK() + ")";
};


