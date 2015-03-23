/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * 2D/3D Size class.
 * @class Size
 * @namespace dwv.image
 * @constructor
 * @param {Number} numberOfColumns The number of columns.
 * @param {Number} numberOfRows The number of rows.
 * @param {Number} numberOfSlices The number of slices.
*/
dwv.image.Size = function ( numberOfColumns, numberOfRows, numberOfSlices )
{
    /**
     * Get the number of columns.
     * @method getNumberOfColumns
     * @return {Number} The number of columns.
     */ 
    this.getNumberOfColumns = function () { return numberOfColumns; };
    /**
     * Get the number of rows.
     * @method getNumberOfRows
     * @return {Number} The number of rows.
     */ 
    this.getNumberOfRows = function () { return numberOfRows; };
    /**
     * Get the number of slices.
     * @method getNumberOfSlices
     * @return {Number} The number of slices.
     */ 
    this.getNumberOfSlices = function () { return (numberOfSlices || 1.0); };
};

/**
 * Get the size of a slice.
 * @method getSliceSize
 * @return {Number} The size of a slice.
 */ 
dwv.image.Size.prototype.getSliceSize = function () {
    return this.getNumberOfColumns() * this.getNumberOfRows();
};

/**
 * Get the total size.
 * @method getTotalSize
 * @return {Number} The total size.
 */ 
dwv.image.Size.prototype.getTotalSize = function () {
    return this.getSliceSize() * this.getNumberOfSlices();
};

/**
 * Check for equality.
 * @method equals
 * @param {Size} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Size.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getNumberOfColumns() === rhs.getNumberOfColumns() &&
        this.getNumberOfRows() === rhs.getNumberOfRows() &&
        this.getNumberOfSlices() === rhs.getNumberOfSlices();
};

/**
 * Check that coordinates are within bounds.
 * @method isInBounds
 * @param {Number} i The column coordinate.
 * @param {Number} j The row coordinate.
 * @param {Number} k The slice coordinate.
 * @return {Boolean} True if the given coordinates are within bounds.
 */ 
dwv.image.Size.prototype.isInBounds = function ( i, j, k ) {
    if( i < 0 || i > this.getNumberOfColumns() - 1 ||
        j < 0 || j > this.getNumberOfRows() - 1 ||
        k < 0 || k > this.getNumberOfSlices() - 1 ) {
        return false;
    }
    return true;
};

/**
 * 2D/3D Spacing class. 
 * @class Spacing
 * @namespace dwv.image
 * @constructor
 * @param {Number} columnSpacing The column spacing.
 * @param {Number} rowSpacing The row spacing.
 * @param {Number} sliceSpacing The slice spacing.
 */
dwv.image.Spacing = function ( columnSpacing, rowSpacing, sliceSpacing )
{
    /**
     * Get the column spacing.
     * @method getColumnSpacing
     * @return {Number} The column spacing.
     */ 
    this.getColumnSpacing = function () { return columnSpacing; };
    /**
     * Get the row spacing.
     * @method getRowSpacing
     * @return {Number} The row spacing.
     */ 
    this.getRowSpacing = function () { return rowSpacing; };
    /**
     * Get the slice spacing.
     * @method getSliceSpacing
     * @return {Number} The slice spacing.
     */ 
    this.getSliceSpacing = function () { return (sliceSpacing || 1.0); };
};

/**
 * Check for equality.
 * @method equals
 * @param {Spacing} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Spacing.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getColumnSpacing() === rhs.getColumnSpacing() &&
        this.getRowSpacing() === rhs.getRowSpacing() &&
        this.getSliceSpacing() === rhs.getSliceSpacing();
};

/**
 * 2D/3D Geometry class. 
 * @class Geometry
 * @namespace dwv.image
 * @constructor
 * @param {Object} origin The object origin.
 * @param {Object} size The object size.
 * @param {Object} spacing The object spacing.
 */
dwv.image.Geometry = function ( origin, size, spacing )
{
    // check input origin.
    if( typeof(origin) === 'undefined' ) {
        origin = new dwv.math.Point3D(0,0,0);
    }
    var origins = [origin];
    
    /**
     * Get the object first origin.
     * @method getOrigin
     * @return {Object} The object first origin.
     */ 
    this.getOrigin = function () { return origin; };
    /**
     * Get the object origins.
     * @method getOrigins
     * @return {Array} The object origins.
     */ 
    this.getOrigins = function () { return origins; };
    /**
     * Get the object size.
     * @method getSize
     * @return {Object} The object size.
     */ 
    this.getSize = function () { return size; };
    /**
     * Get the object spacing.
     * @method getSpacing
     * @return {Object} The object spacing.
     */ 
    this.getSpacing = function () { return spacing; };
    
    /**
     * Get the slice position of a point in the current slice layout.
     * @method getSliceIndex
     * @param {Object} point The point to evaluate.
     */
    this.getSliceIndex = function (point)
    {
        // cannot use this.worldToIndex(point).getK() since
        // we cannot guaranty consecutive slices...
        
        // find the closest index
        var closestSliceIndex = 0;
        var minDiff = Math.abs( origins[0].getZ() - point.getZ() );
        var diff = 0;
        for( var i = 0; i < origins.length; ++i )
        {
            diff = Math.abs( origins[i].getZ() - point.getZ() );
            if( diff < minDiff ) 
            {
                minDiff = diff;
                closestSliceIndex = i;
            }
        }
        diff = origins[closestSliceIndex].getZ() - point.getZ();
        var sliceIndex = ( diff > 0 ) ? closestSliceIndex : closestSliceIndex + 1;
        return sliceIndex;
    };
    
    /**
     * Append an origin to the geometry.
     * @param {Object} origin The origin to append.
     * @param {Number} index The index at which to append.
     */
    this.appendOrigin = function (origin, index)
    {
        // add in origin array
        origins.splice(index, 0, origin);
        // increment slice number
        size = new dwv.image.Size(
            size.getNumberOfColumns(),
            size.getNumberOfRows(),
            size.getNumberOfSlices() + 1);
    };

};

/**
 * Check for equality.
 * @method equals
 * @param {Geometry} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Geometry.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getOrigin() === rhs.getOrigin() &&
        this.getSize() === rhs.getSize() &&
        this.getSpacing() === rhs.getSpacing();
};

/**
 * Convert an index to an offset in memory.
 * @param {Object} index The index to convert.
 */
dwv.image.Geometry.prototype.indexToOffset = function (index) {
    var size = this.getSize();
    return index.getI() +
       index.getJ() * size.getNumberOfColumns() +
       index.getK() * size.getSliceSize();
};

/**
 * Convert an index into world coordinates.
 * @param {Object} index The index to convert.
 */
dwv.image.Geometry.prototype.indexToWorld = function (index) {
    var origin = this.getOrigin();
    var spacing = this.getSpacing();
    return new dwv.math.Point3D(
        origin.getX() + index.getI() * spacing.getColumnSpacing(),
        origin.getY() + index.getJ() * spacing.getRowSpacing(),
        origin.getZ() + index.getK() * spacing.getSliceSpacing() );
};

/**
 * Convert world coordinates into an index.
 * @param {Object} THe point to convert.
 */
dwv.image.Geometry.prototype.worldToIndex = function (point) {
    var origin = this.getOrigin();
    var spacing = this.getSpacing();
    return new dwv.math.Point3D(
        point.getX() / spacing.getColumnSpacing() - origin.getX(),
        point.getY() / spacing.getRowSpacing() - origin.getY(),
        point.getZ() / spacing.getSliceSpacing() - origin.getZ() );
};
