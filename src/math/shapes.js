/**
 * @namespace Math related.
 */
dwv.math = dwv.math || {};

/**
 * shapes.js
 * Definition of basic shapes.
 */

/**
 * @class 2D point. Immutable.
 * @param x The X coordinate for the point.
 * @param y The Y coordinate for the point.
 */
dwv.math.Point2D = function(x,y)
{
    // Get the X position of the point.
    this.getX = function() { return x; };
    // Get the Y position of the point.
    this.getY = function() { return y; };
}; // Point2D class

/**
 * Check for Point2D equality.
 * @param other The other Point2D to compare to.
 * @return True if both points are equal.
 */ 
dwv.math.Point2D.prototype.equals = function(other) {
    if( !other ) { 
        return false;
    }
    return ( this.getX() === other.getX() && this.getY() === other.getY() );
};

/**
 * Get a string representation of the Point2D.
 * @return The Point2D as string.
 */ 
dwv.math.Point2D.prototype.toString = function() {
    return "(" + this.getX() + ", " + this.getY() + ")";
};

/**
 * @class Fast 2D point since it's mutable!
 * @param x The X coordinate for the point.
 * @param y The Y coordinate for the point.
 */
dwv.math.FastPoint2D = function(x,y)
{
    this.x = x;
    this.y = y;
}; // FastPoint2D class

/**
 * Check for FastPoint2D equality.
 * @param other The other FastPoint2D to compare to.
 * @return True if both points are equal.
 */ 
dwv.math.FastPoint2D.prototype.equals = function(other) {
    if( !other ) { 
        return false;
    }
    return ( this.x === other.x && this.y === other.y );
};

/**
 * Get a string representation of the FastPoint2D.
 * @return The Point2D as string.
 */ 
dwv.math.FastPoint2D.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
};

/**
 * @class Circle shape.
 * @param centre A Point2D representing the centre of the circle.
 * @param radius The radius of the circle.
 */
dwv.math.Circle = function(centre, radius)
{
    // Cache the surface
    var surface = Math.PI*radius*radius;

    // Get the centre of the circle.
    this.getCenter = function() { return centre; };
    // Get the radius of the circle.
    this.getRadius = function() { return radius; };
    // Get the surface of the circle.
    this.getSurface = function() { return surface; };
    // Get the surface of the circle with a spacing.
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Circle class

/**
 * @class Line shape.
 * @param begin A Point2D representing the beginning of the line.
 * @param end A Point2D representing the end of the line.
 */
dwv.math.Line = function(begin, end)
{
    // cache the length
    var length = Math.sqrt(
            Math.abs(end.getX() - begin.getX()) * Math.abs(end.getX() - begin.getX()) +
            Math.abs(end.getY() - begin.getY()) * Math.abs(end.getY() - begin.getY() ) );
    
    // Get the begin point of the line.
    this.getBegin = function() { return begin; };
    // Get the end point of the line.
    this.getEnd = function() { return end; };
    // Get the length of the line.
    this.getLength = function() { return length; };
    // Get the length of the line with a spacing.
    this.getWorldLength = function(spacingX, spacingY)
    {
        var lx = Math.abs(end.getX() - begin.getX()) * spacingX;
        var ly = Math.abs(end.getY() - begin.getY()) * spacingY;
        return Math.sqrt( lx * lx + ly * ly );
    };
    // Get the mid point of the line.
    this.getMidpoint = function()
    {
        return new dwv.math.Point2D( 
            parseInt( (begin.getX()+end.getX()) / 2, 10 ), 
            parseInt( (begin.getY()+end.getY()) / 2, 10 ) );
    };
}; // Line class

/**
 * @class Rectangle shape.
 * @param begin A Point2D representing the beginning of the rectangle.
 * @param end A Point2D representing the end of the rectangle.
 */
dwv.math.Rectangle = function(begin, end)
{
    // cache the length
    var surface = Math.abs(end.getX() - begin.getX()) * Math.abs(end.getY() - begin.getY() );

    // Get the begin point of the rectangle.
    this.getBegin = function() { return begin; };
    // Get the end point of the rectangle.
    this.getEnd = function() { return end; };
    // Get the real width of the rectangle.
    this.getRealWidth = function() { return end.getX() - begin.getX(); };
    // Get the real height of the rectangle.
    this.getRealHeight = function() { return end.getY() - begin.getY(); };
    // Get the width of the rectangle.
    this.getWidth = function() { return Math.abs(this.getRealWidth()); };
    // Get the height of the rectangle.
    this.getHeight = function() { return Math.abs(this.getRealHeight()); };
    // Get the surface of the rectangle.
    this.getSurface = function() { return surface; };
    // Get the surface of the rectangle with a spacing.
    this.getWorldSurface = function(spacingX, spacingY)
    {
        return surface * spacingX * spacingY;
    };
}; // Rectangle class

/**
 * @class Region Of Interest shape.
 * Note: should be a closed path.
 */
dwv.math.ROI = function()
{
    // list of points.
    var points = [];
    
    /**
     * Get a point of the list.
     * @param index The index of the point to get (beware, no size check).
     * @return The Point2D at the given index.
     */ 
    this.getPoint = function(index) { return points[index]; };
    // Get the length of the list
    this.getLength = function() { return points.length; };
    /**
     * Add a point to the ROI.
     * @param point The Point2D to add.
     */
    this.addPoint = function(point) { points.push(point); };
    /**
     * Add points to the ROI.
     * @param rhs The array of POints2D to add.
     */
    this.addPoints = function(rhs) { points=points.concat(rhs);};
}; // ROI class

/**
 * @class Path shape.
 * @param points The list of Point2D that make the path (optional).
 * @param points The list of control point of path, as indexes (optional).
 * Note: first and last point do not need to be equal.
 */
dwv.math.Path = function(inputPointArray, inputControlPointIndexArray)
{
    // list of points.
    this.pointArray = inputPointArray ? inputPointArray.slice() : [];
    // list of control points
    this.controlPointIndexArray = inputControlPointIndexArray ? inputControlPointIndexArray.slice() : [];
}; // Path class

/**
 * Get a point of the list.
 * @param index The index of the point to get (beware, no size check).
 * @return The Point2D at the given index.
 */ 
dwv.math.Path.prototype.getPoint = function(index) {
    return this.pointArray[index];
};

/**
 * Is is a control point.
 * @param point The Point2D to check.
 * @return True if a control point.
 */ 
dwv.math.Path.prototype.isControlPoint = function(point) {
    var index = this.pointArray.indexOf(point);
    if( index !== -1 ) {
        return this.controlPointIndexArray.indexOf(index) !== -1;
    }
    else {
        throw Error("Error: isControlPoint called with not in list point.");
    }
};

/**
 * Get the length of the path.
 */ 
dwv.math.Path.prototype.getLength = function() { 
    return this.pointArray.length;
};

/**
 * Add a point to the path.
 * @param point The Point2D to add.
 */
dwv.math.Path.prototype.addPoint = function(point) {
    this.pointArray.push(point);
};

/**
 * Add a control point to the path.
 * @param point The Point2D to make a control point.
 */
dwv.math.Path.prototype.addControlPoint = function(point) {
    var index = this.pointArray.indexOf(point);
    if( index !== -1 ) {
        this.controlPointIndexArray.push(index);
    }
    else {
        throw Error("Error: addControlPoint called with no point in list point.");
    }
};

/**
 * Add points to the path.
 * @param points The list of Point2D to add.
 */
dwv.math.Path.prototype.addPoints = function(newPointArray) { 
    this.pointArray = this.pointArray.concat(newPointArray);
};

/**
 * Append a Path to this one.
 * @param other The Path to append.
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
