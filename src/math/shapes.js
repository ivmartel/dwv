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
 * Circle shape.
 * @class Circle
 * @namespace dwv.math
 * @constructor
 * @param {Object} centre A Point2D representing the centre of the circle.
 * @param {Number} radius The radius of the circle.
 */
dwv.math.Circle = function(centre, radius)
{
    /**
     * Circle surface.
     * @property surface
     * @private
     * @type Number
     */
    var surface = Math.PI*radius*radius;

    /**
     * Get the centre (point) of the circle.
     * @method getCenter
     * @return {Object} The center (point) of the circle.
     */
    this.getCenter = function() { return centre; };
    /**
     * Get the radius of the circle.
     * @method getRadius
     * @return {Number} The radius of the circle.
     */
    this.getRadius = function() { return radius; };
    /**
     * Get the surface of the circle.
     * @method getSurface
     * @return {Number} The surface of the circle.
     */
    this.getSurface = function() { return surface; };
    /**
     * Get the surface of the circle with a spacing.
     * @method getWorldSurface
     * @param {Number} spacingX The X spacing.
     * @param {Number} spacingY The Y spacing.
     * @return {Number} The surface of the circle multiplied by the given spacing.
     */
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Circle class

/** 
 * Ellipse shape.
 * @class Ellipse
 * @namespace dwv.math
 * @constructor
 * @param {Object} centre A Point2D representing the centre of the ellipse.
 * @param {Number} a The radius of the ellipse on the horizontal axe.
 * @param {Number} b The radius of the ellipse on the vertical axe.
 */
dwv.math.Ellipse = function(centre, a, b)
{
    /**
     * Circle surface.
     * @property surface
     * @private
     * @type Number
     */
    var surface = Math.PI*a*b;

    /**
     * Get the centre (point) of the ellipse.
     * @method getCenter
     * @return {Object} The center (point) of the ellipse.
     */
    this.getCenter = function() { return centre; };
    /**
     * Get the radius of the ellipse on the horizontal axe.
     * @method getA
     * @return {Number} The radius of the ellipse on the horizontal axe.
     */
    this.getA = function() { return a; };
    /**
     * Get the radius of the ellipse on the vertical axe.
     * @method getB
     * @return {Number} The radius of the ellipse on the vertical axe.
     */
    this.getB = function() { return b; };
    /**
     * Get the surface of the ellipse.
     * @method getSurface
     * @return {Number} The surface of the ellipse.
     */
    this.getSurface = function() { return surface; };
    /**
     * Get the surface of the ellipse with a spacing.
     * @method getWorldSurface
     * @param {Number} spacingX The X spacing.
     * @param {Number} spacingY The Y spacing.
     * @return {Number} The surface of the ellipse multiplied by the given spacing.
     */
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Circle class

/**
 * Line shape.
 * @class Line
 * @namespace dwv.math
 * @constructor
 * @param {Object} begin A Point2D representing the beginning of the line.
 * @param {Object} end A Point2D representing the end of the line.
 */
dwv.math.Line = function(begin, end)
{
    /**
     * Line delta in the X direction.
     * @property dx
     * @private
     * @type Number
     */
    var dx = end.getX() - begin.getX();
    /**
     * Line delta in the Y direction.
     * @property dy
     * @private
     * @type Number
     */
    var dy = end.getY() - begin.getY();
    /**
     * Line length.
     * @property length
     * @private
     * @type Number
     */
    var length = Math.sqrt( dx * dx + dy * dy );
        
    /**
     * Get the begin point of the line.
     * @method getBegin
     * @return {Object} The beginning point of the line.
     */
    this.getBegin = function() { return begin; };
    /**
     * Get the end point of the line.
     * @method getEnd
     * @return {Object} The ending point of the line.
     */
    this.getEnd = function() { return end; };
    /**
     * Get the line delta in the X direction.
     * @method getDeltaX
     * @return {Number} The delta in the X direction.
     */
    this.getDeltaX = function() { return dx; };
    /**
     * Get the line delta in the Y direction.
     * @method getDeltaX
     * @return {Number} The delta in the Y direction.
     */
    this.getDeltaY = function() { return dy; };
    /**
     * Get the length of the line.
     * @method getLength
     * @return {Number} The length of the line.
     */
    this.getLength = function() { return length; };
    /**
     * Get the length of the line with spacing.
     * @method getWorldLength
     * @param {Number} spacingX The X spacing.
     * @param {Number} spacingY The Y spacing.
     * @return {Number} The length of the line with spacing.
     */
    this.getWorldLength = function(spacingX, spacingY)
    {
        var dxs = dx * spacingX;
        var dys = dy * spacingY;
        return Math.sqrt( dxs * dxs + dys * dys );
    };
    /**
     * Get the mid point of the line.
     * @method getMidpoint
     * @return {Object} The mid point of the line.
     */
    this.getMidpoint = function()
    {
        return new dwv.math.Point2D( 
            parseInt( (begin.getX()+end.getX()) / 2, 10 ), 
            parseInt( (begin.getY()+end.getY()) / 2, 10 ) );
    };
    /**
     * Get the slope of the line.
     * @method getSlope
     * @return {Number} The slope of the line.
     */
    this.getSlope = function()
    { 
        return dy / dx;
    };
    /**
     * Get the inclination of the line.
     * @method getInclination
     * @return {Number} The inclination of the line.
     */
    this.getInclination = function()
    { 
        // tan(theta) = slope
        var angle = Math.atan2( dy, dx ) * 180 / Math.PI;
        // shift?
        return 180 - angle;
    };
}; // Line class

/**
 * Get the angle between two lines.
 * @param line0 The first line.
 * @param line1 The second line.
 */
dwv.math.getAngle = function (line0, line1)
{
    var dx0 = line0.getDeltaX();
    var dy0 = line0.getDeltaY();
    var dx1 = line1.getDeltaX();
    var dy1 = line1.getDeltaY();
    // dot = ||a||*||b||*cos(theta)
    var dot = dx0 * dx1 + dy0 * dy1;
    // cross = ||a||*||b||*sin(theta)
    var det = dx0 * dy1 - dy0 * dx1;
    // tan = sin / cos
    var angle = Math.atan2( det, dot ) * 180 / Math.PI;
    // complementary angle
    // shift?
    return 360 - (180 - angle);
};

/**
 * Rectangle shape.
 * @class Rectangle
 * @namespace dwv.math
 * @constructor
 * @param {Object} begin A Point2D representing the beginning of the rectangle.
 * @param {Object} end A Point2D representing the end of the rectangle.
 */
dwv.math.Rectangle = function(begin, end)
{
    if ( end.getX() < begin.getX() ) {
        var tmpX = begin.getX();
        begin = new dwv.math.Point2D( end.getX(), begin.getY() );
        end = new dwv.math.Point2D( tmpX, end.getY() );
    }
    if ( end.getY() < begin.getY() ) {
        var tmpY = begin.getY();
        begin = new dwv.math.Point2D( begin.getX(), end.getY() );
        end = new dwv.math.Point2D( end.getX(), tmpY );
    }
    
    /**
     * Rectangle surface.
     * @property surface
     * @private
     * @type Number
     */
    var surface = Math.abs(end.getX() - begin.getX()) * Math.abs(end.getY() - begin.getY() );

    /**
     * Get the begin point of the rectangle.
     * @method getBegin
     * @return {Object} The begin point of the rectangle
     */
    this.getBegin = function() { return begin; };
    /**
     * Get the end point of the rectangle.
     * @method getEnd
     * @return {Object} The end point of the rectangle
     */
    this.getEnd = function() { return end; };
    /**
     * Get the real width of the rectangle.
     * @method getRealWidth
     * @return {Number} The real width of the rectangle.
     */
    this.getRealWidth = function() { return end.getX() - begin.getX(); };
    /**
     * Get the real height of the rectangle.
     * @method getRealHeight
     * @return {Number} The real height of the rectangle.
     */
    this.getRealHeight = function() { return end.getY() - begin.getY(); };
    /**
     * Get the width of the rectangle.
     * @method getWidth
     * @return {Number} The width of the rectangle.
     */
    this.getWidth = function() { return Math.abs(this.getRealWidth()); };
    /**
     * Get the height of the rectangle.
     * @method getHeight
     * @return {Number} The height of the rectangle.
     */
    this.getHeight = function() { return Math.abs(this.getRealHeight()); };
    /**
     * Get the surface of the rectangle.
     * @method getSurface
     * @return {Number} The surface of the rectangle.
     */
    this.getSurface = function() { return surface; };
    /**
     * Get the surface of the rectangle with a spacing.
     * @method getWorldSurface
     * @return {Number} The surface of the rectangle with a spacing.
     */
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Rectangle class

/**
 * Region Of Interest shape.
 * @class ROI
 * @namespace dwv.math
 * @constructor
 * Note: should be a closed path.
 */
dwv.math.ROI = function()
{
    /**
     * List of points.
     * @property points
     * @private
     * @type Array
     */
    var points = [];
    
    /**
     * Get a point of the list at a given index.
     * @method getPoint
     * @param {Number} index The index of the point to get (beware, no size check).
     * @return {Object} The Point2D at the given index.
     */ 
    this.getPoint = function(index) { return points[index]; };
    /**
     * Get the length of the point list.
     * @method getLength
     * @return {Number} The length of the point list.
     */ 
    this.getLength = function() { return points.length; };
    /**
     * Add a point to the ROI.
     * @method addPoint
     * @param {Object} point The Point2D to add.
     */
    this.addPoint = function(point) { points.push(point); };
    /**
     * Add points to the ROI.
     * @method addPoints
     * @param {Array} rhs The array of POints2D to add.
     */
    this.addPoints = function(rhs) { points=points.concat(rhs);};
}; // ROI class

/**
 * Path shape.
 * @class Path
 * @namespace dwv.math
 * @constructor
 * @param {Array} inputPointArray The list of Point2D that make the path (optional).
 * @param {Array} inputControlPointIndexArray The list of control point of path, 
 *  as indexes (optional).
 * Note: first and last point do not need to be equal.
 */
dwv.math.Path = function(inputPointArray, inputControlPointIndexArray)
{
    /**
     * List of points.
     * @property pointArray
     * @type Array
     */
    this.pointArray = inputPointArray ? inputPointArray.slice() : [];
    /**
     * List of control points.
     * @property controlPointIndexArray
     * @type Array
     */
    this.controlPointIndexArray = inputControlPointIndexArray ?
        inputControlPointIndexArray.slice() : [];
}; // Path class

/**
 * Get a point of the list.
 * @method getPoint
 * @param {Number} index The index of the point to get (beware, no size check).
 * @return {Object} The Point2D at the given index.
 */ 
dwv.math.Path.prototype.getPoint = function(index) {
    return this.pointArray[index];
};

/**
 * Is the given point a control point.
 * @method isControlPoint
 * @param {Object} point The Point2D to check.
 * @return {Boolean} True if a control point.
 */ 
dwv.math.Path.prototype.isControlPoint = function(point) {
    var index = this.pointArray.indexOf(point);
    if( index !== -1 ) {
        return this.controlPointIndexArray.indexOf(index) !== -1;
    }
    else {
        throw new Error("Error: isControlPoint called with not in list point.");
    }
};

/**
 * Get the length of the path.
 * @method getLength
 * @return {Number} The length of the path.
 */ 
dwv.math.Path.prototype.getLength = function() { 
    return this.pointArray.length;
};

/**
 * Add a point to the path.
 * @method addPoint
 * @param {Object} point The Point2D to add.
 */
dwv.math.Path.prototype.addPoint = function(point) {
    this.pointArray.push(point);
};

/**
 * Add a control point to the path.
 * @method addControlPoint
 * @param {Object} point The Point2D to make a control point.
 */
dwv.math.Path.prototype.addControlPoint = function(point) {
    var index = this.pointArray.indexOf(point);
    if( index !== -1 ) {
        this.controlPointIndexArray.push(index);
    }
    else {
        throw new Error("Error: addControlPoint called with no point in list point.");
    }
};

/**
 * Add points to the path.
 * @method addPoints
 * @param {Array} points The list of Point2D to add.
 */
dwv.math.Path.prototype.addPoints = function(newPointArray) { 
    this.pointArray = this.pointArray.concat(newPointArray);
};

/**
 * Append a Path to this one.
 * @method appenPath
 * @param {Path} other The Path to append.
 */
dwv.math.Path.prototype.appenPath = function(other) {
    var oldSize = this.pointArray.length;
    this.pointArray = this.pointArray.concat(other.pointArray);
    var indexArray = [];
    for( var i=0; i < other.controlPointIndexArray.length; ++i ) {
        indexArray[i] = other.controlPointIndexArray[i] + oldSize;
    }
    this.controlPointIndexArray = this.controlPointIndexArray.concat(indexArray);
};
