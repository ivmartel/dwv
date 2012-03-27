/**
 * shapes.js
 * Definition of basic shapes.
 */

/**
 * 2D point.
 * @param x The X coordinate for the point.
 * @param y The Y coordinate for the point.
 */
Point2D = function(x,y)
{
    // Get the X position of the point.
    this.getX = function() { return x; };
    // Get the Y position of the point.
    this.getY = function() { return y; };
    /**
     * Check for equality.
     * @param other The other Point2D to compare to.
     * @return True if both points are equal.
     */ 
    this.equal = function(other) { return ( x === other.getX() && y === other.getY() ); };
}; // Point2D class

/**
 * Circle shape.
 * @param centre A Point2D representing the centre of the circle.
 * @param radius The radius of the circle.
 */
Circle = function(centre, radius)
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
 * Line shape.
 * @param begin A Point2D representing the beginning of the line.
 * @param end A Point2D representing the end of the line.
 */
Line = function(begin, end)
{
    // cache the length
    var length = Math.sqrt(
            Math.abs(end.getX() - begin.getX()) * Math.abs(end.getX() - begin.getX())
            * Math.abs(end.getY() - begin.getY()) * Math.abs(end.getY() - begin.getY() ) );
    
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
}; // Line class

/**
 * Rectangle shape.
 * @param begin A Point2D representing the beginning of the rectangle.
 * @param end A Point2D representing the end of the rectangle.
 */
Rectangle = function(begin, end)
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
 * Region Of Interest shape.
 */
ROI = function()
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
}; // ROI class
