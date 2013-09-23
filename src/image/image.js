/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Image Size class.
 * Supports 2D and 3D images.
 * @class Size
 * @namespace dwv.image
 * @constructor
 * @param {Number} numberOfColumns The number of columns.
 * @param {Number} numberOfRows The number of rows.
 * @param {Number} numberOfSlices The number of slices.
*/
dwv.image.Size = function( numberOfColumns, numberOfRows, numberOfSlices )
{
    /**
     * Get the number of columns.
     * @method getNumberOfColumns
     * @return {Number} The number of columns.
     */ 
    this.getNumberOfColumns = function() { return numberOfColumns; };
    /**
     * Get the number of rows.
     * @method getNumberOfRows
     * @return {Number} The number of rows.
     */ 
    this.getNumberOfRows = function() { return numberOfRows; };
    /**
     * Get the number of slices.
     * @method getNumberOfSlices
     * @return {Number} The number of slices.
     */ 
    this.getNumberOfSlices = function() { return (numberOfSlices || 1.0); };
};

/**
 * Get the size of a slice.
 * @method getSliceSize
 * @return {Number} The size of a slice.
 */ 
dwv.image.Size.prototype.getSliceSize = function() {
    return this.getNumberOfColumns()*this.getNumberOfRows();
};

/**
 * Get the total size.
 * @method getTotalSize
 * @return {Number} The total size.
 */ 
dwv.image.Size.prototype.getTotalSize = function() {
    return this.getSliceSize()*this.getNumberOfSlices();
};

/**
 * Check for equality.
 * @method equals
 * @param {Size} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Size.prototype.equals = function(rhs) {
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
dwv.image.Size.prototype.isInBounds = function( i, j, k ) {
    if( i < 0 || i > this.getNumberOfColumns() - 1 ||
        j < 0 || j > this.getNumberOfRows() - 1 ||
        k < 0 || k > this.getNumberOfSlices() - 1 ) return false;
    return true;
};

/**
 * Image Spacing class. 
 * Supports 2D and 3D images.
 * @class Spacing
 * @namespace dwv.image
 * @constructor
 * @param {Number} columnSpacing The column spacing.
 * @param {Number} rowSpacing The row spacing.
 * @param {Number} sliceSpacing The slice spacing.
 */
dwv.image.Spacing = function( columnSpacing, rowSpacing, sliceSpacing )
{
    /**
     * Get the column spacing.
     * @method getColumnSpacing
     * @return {Number} The column spacing.
     */ 
    this.getColumnSpacing = function() { return columnSpacing; };
    /**
     * Get the row spacing.
     * @method getRowSpacing
     * @return {Number} The row spacing.
     */ 
    this.getRowSpacing = function() { return rowSpacing; };
    /**
     * Get the slice spacing.
     * @method getSliceSpacing
     * @return {Number} The slice spacing.
     */ 
    this.getSliceSpacing = function() { return (sliceSpacing || 1.0); };
};

/**
 * Check for equality.
 * @method equals
 * @param {Spacing} rhs The object to compare to.
 * @return {Boolean} True if both objects are equal.
 */ 
dwv.image.Spacing.prototype.equals = function(rhs) {
    return rhs !== null &&
        this.getColumnSpacing() === rhs.getColumnSpacing() &&
        this.getRowSpacing() === rhs.getRowSpacing() &&
        this.getSliceSpacing() === rhs.getSliceSpacing();
};

/**
 * Image class.
 * Usable once created, optional are:
 * - rescale slope and intercept (default 1:0), 
 * - photometric interpretation (default MONOCHROME2),
 * - planar configuration (default RGBRGB...).
 * @class Image
 * @namespace dwv.image
 * @constructor
 * @param {Size} size The size of the image.
 * @param {Spacing} spacing The spacing of the image.
 * @param {Array} buffer The image data.
 * @param {Array} slicePositions The slice positions.
 */
dwv.image.Image = function(size, spacing, buffer, slicePositions)
{
    /**
     * Rescale slope.
     * @property rescaleSlope
     * @private
     * @type Number
     */
    var rescaleSlope = 1;
    /**
     * Rescale intercept.
     * @property rescaleIntercept
     * @private
     * @type Number
     */
    var rescaleIntercept = 0;
    /**
     * Photometric interpretation (MONOCHROME, RGB...).
     * @property photometricInterpretation
     * @private
     * @type String
     */
    var photometricInterpretation = "MONOCHROME2";
    /**
     * Planar configuration for RGB data (0:RGBRGBRGBRGB... or 1:RRR...GGG...BBB...).
     * @property planarConfiguration
     * @private
     * @type Number
     */
    var planarConfiguration = 0;
    /**
     * Meta information.
     * @property meta
     * @private
     * @type Object
     */
    var meta = {};
    
    /**
     * Original buffer.
     * @property originalBuffer
     * @private
     * @type Array
     */
    var originalBuffer = new Int16Array(buffer);
    
    // check slice positions.
    if( typeof(slicePositions) === 'undefined' ) slicePositions = [[0,0,0]];
    
    /**
     * Data range.
     * @property dataRange
     * @private
     * @type Object
     */
    var dataRange = null;
    /**
     * Histogram.
     * @property histogram
     * @private
     * @type Array
     */
    var histogram = null;
     
    /**
     * Get the size of the image.
     * @method getSize
     * @return {Size} The size of the image.
     */ 
    this.getSize = function() { return size; };
    /**
     * Get the spacing of the image.
     * @method getSpacing
     * @return {Spacing} The spacing of the image.
     */ 
    this.getSpacing = function() { return spacing; };
    /**
     * Get the data buffer of the image. TODO dangerous...
     * @method getBuffer
     * @return {Array} The data buffer of the image.
     */ 
    this.getBuffer = function() { return buffer; };
    /**
     * Get the slice positions.
     * @method getSlicePositions
     * @return {Array} The slice positions.
     */ 
    this.getSlicePositions = function() { return slicePositions; };
    
    /**
     * Get the rescale slope.
     * @method getRescaleSlope
     * @return {Number} The rescale slope.
     */ 
    this.getRescaleSlope = function() { return rescaleSlope; };
    /**
     * Set the rescale slope.
     * @method setRescaleSlope
     * @param {Number} rs The rescale slope.
     */ 
    this.setRescaleSlope = function(rs) { rescaleSlope = rs; };
    /**
     * Get the rescale intercept.
     * @method getRescaleIntercept
     * @return {Number} The rescale intercept.
     */ 
    this.getRescaleIntercept = function() { return rescaleIntercept; };
    /**
     * Set the rescale intercept.
     * @method setRescaleIntercept
     * @param {Number} ri The rescale intercept.
     */ 
    this.setRescaleIntercept = function(ri) { rescaleIntercept = ri; };
    /**
     * Get the photometricInterpretation of the image.
     * @method getPhotometricInterpretation
     * @return {String} The photometricInterpretation of the image.
     */ 
    this.getPhotometricInterpretation = function() { return photometricInterpretation; };
    /**
     * Set the photometricInterpretation of the image.
     * @method setPhotometricInterpretation
     * @pqrqm {String} interp The photometricInterpretation of the image.
     */ 
    this.setPhotometricInterpretation = function(interp) { photometricInterpretation = interp; };
    /**
     * Get the planarConfiguration of the image.
     * @method getPlanarConfiguration
     * @return {Number} The planarConfiguration of the image.
     */ 
    this.getPlanarConfiguration = function() { return planarConfiguration; };
    /**
     * Set the planarConfiguration of the image.
     * @method setPlanarConfiguration
     * @param {Number} config The planarConfiguration of the image.
     */ 
    this.setPlanarConfiguration = function(config) { planarConfiguration = config; };

    /**
     * Get the meta information of the image.
     * @method getMeta
     * @return {Object} The meta information of the image.
     */ 
    this.getMeta = function() { return meta; };
    /**
     * Set the meta information of the image.
     * @method setMeta
     * @param {Object} rhs The meta information of the image.
     */ 
    this.setMeta = function(rhs) { meta = rhs; };

    /**
     * Get value at offset. Warning: No size check...
     * @method getValueAtOffset
     * @param {Number} offset The desired offset.
     * @return {Number} The value at offset.
     */ 
    this.getValueAtOffset = function(offset) {
        return buffer[offset];
    };
    
    /**
     * Clone the image.
     * @method clone
     * @return {Image} A clone of this image.
     */ 
    this.clone = function()
    {
        var copy = new dwv.image.Image(this.getSize(), this.getSpacing(), originalBuffer, slicePositions);
        copy.setRescaleSlope(this.getRescaleSlope());
        copy.setRescaleIntercept(this.getRescaleIntercept());
        copy.setPhotometricInterpretation(this.getPhotometricInterpretation());
        copy.setPlanarConfiguration(this.getPlanarConfiguration());
        copy.setMeta(this.getMeta());
        return copy;
    };
    
    /**
     * Append a slice to the image.
     * @method appendSlice
     * @param {Image} The slice to append.
     */ 
    this.appendSlice = function(rhs)
    {
        // check input
        if( rhs === null )
            throw new Error("Cannot append null slice");
        if( rhs.getSize().getNumberOfSlices() !== 1 )
            throw new Error("Cannot append more than one slice");
        if( size.getNumberOfColumns() !== rhs.getSize().getNumberOfColumns() )
            throw new Error("Cannot append a slice with different number of columns");
        if( size.getNumberOfRows() !== rhs.getSize().getNumberOfRows() )
            throw new Error("Cannot append a slice with different number of rows");
        if( photometricInterpretation !== rhs.getPhotometricInterpretation() )
            throw new Error("Cannot append a slice with different photometric interpretation");
        // all meta should be equal
        for( var key in meta ) {
            if( meta[key] !== rhs.getMeta()[key] )
                throw new Error("Cannot append a slice with different "+key);
        }
        
        // find index where to append slice
        var closestSliceIndex = 0;
        var slicePosition = rhs.getSlicePositions()[0];
        var minDiff = Math.abs( slicePositions[0][2] - slicePosition[2] );
        var diff = 0;
        for( var i = 0; i < slicePositions.length; ++i )
        {
            diff = Math.abs( slicePositions[i][2] - slicePosition[2] );
            if( diff < minDiff ) 
            {
                minDiff = diff;
                closestSliceIndex = i;
            }
        }
        diff = slicePositions[closestSliceIndex][2] - slicePosition[2];
        var newSliceNb = ( diff > 0 ) ? closestSliceIndex : closestSliceIndex + 1;
        
        // new size
        var newSize = new dwv.image.Size(size.getNumberOfColumns(),
                size.getNumberOfRows(),
                size.getNumberOfSlices() + 1 );
        
        // calculate slice size
        var mul = 1;
        if( photometricInterpretation === "RGB" ) mul = 3;
        var sliceSize = mul * size.getSliceSize();
        
        // create the new buffer
        var newBuffer = new Int16Array(sliceSize * newSize.getNumberOfSlices());
        
        // append slice at new position
        if( newSliceNb === 0 )
        {
            newBuffer.set(rhs.getBuffer());
            newBuffer.set(buffer, sliceSize);
        }
        else if( newSliceNb === size.getNumberOfSlices() )
        {
            newBuffer.set(buffer);
            newBuffer.set(rhs.getBuffer(), size.getNumberOfSlices() * sliceSize);
        }
        else
        {
            var offset = newSliceNb * sliceSize;
            newBuffer.set(buffer.subarray(0, offset - 1));
            newBuffer.set(rhs.getBuffer(), offset);
            newBuffer.set(buffer.subarray(offset), offset + sliceSize);
        }
        
        // update slice positions
        slicePositions.splice(newSliceNb, 0, slicePosition);
        
        // copy to class variables
        size = newSize;
        buffer = newBuffer;
        originalBuffer = new Int16Array(newBuffer);
    };
    
    /**
     * Get the data range.
     * @method getDataRange
     * @return {Object} The data range.
     */ 
    this.getDataRange = function() { 
        if( !dataRange ) dataRange = this.calculateDataRange();
        return dataRange;
    };

    /**
     * Get the histogram.
     * @method getHistogram
     * @return {Array} The histogram.
     */ 
    this.getHistogram = function() { 
        if( !histogram ) histogram = this.calculateHistogram();
        return histogram;
    };
};

/**
 * Get the value of the image at a specific coordinate.
 * @method getValue
 * @param {Number} i The X index.
 * @param {Number} j The Y index.
 * @param {Number} k The Z index.
 * @return {Number} The value at the desired position.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getValue = function( i, j, k )
{
    return this.getValueAtOffset( i +
        ( j * this.getSize().getNumberOfColumns() ) +
        ( k * this.getSize().getSliceSize()) );
};

/**
 * Get the rescaled value of the image at a specific offset.
 * @method getRescaledValueAtOffset
 * @param {Number} offset The offset in the buffer. 
 * @return {Number} The rescaled value at the desired offset.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getRescaledValueAtOffset = function( offset )
{
    return (this.getValueAtOffset(offset)*this.getRescaleSlope())+this.getRescaleIntercept();
};

/**
 * Get the rescaled value of the image at a specific coordinate.
 * @method getRescaledValue
 * @param {Number} i The X index.
 * @param {Number} j The Y index.
 * @param {Number} k The Z index.
 * @return {Number} The rescaled value at the desired position.
 * Warning: No size check...
 */
dwv.image.Image.prototype.getRescaledValue = function( i, j, k )
{
    return (this.getValue(i,j,k)*this.getRescaleSlope())+this.getRescaleIntercept();
};

/**
 * Calculate the raw image data range.
 * @method calculateDataRange
 * @return {Object} The range {min, max}.
 */
dwv.image.Image.prototype.calculateDataRange = function()
{
    var min = this.getValueAtOffset(0);
    var max = min;
    var value = 0;
    for(var i=0; i < this.getSize().getTotalSize(); ++i)
    {    
        value = this.getValueAtOffset(i);
        if( value > max ) { max = value; }
        if( value < min ) { min = value; }
    }
    return { "min": min, "max": max };
};

/**
 * Calculate the image data range after rescale.
 * @method getRescaledDataRange
 * @return {Object} The rescaled data range {min, max}.
 */
dwv.image.Image.prototype.getRescaledDataRange = function()
{
    var rawRange = this.getDataRange();
    return { "min": rawRange.min*this.getRescaleSlope()+this.getRescaleIntercept(),
        "max": rawRange.max*this.getRescaleSlope()+this.getRescaleIntercept()};
};

/**
 * Calculate the histogram of the image.
 * @method calculateHistogram
 * @return {Array} An array representing the histogram.
 */
dwv.image.Image.prototype.calculateHistogram = function()
{
    var histo = [];
    var histoPlot = [];
    var value = 0;
    var size = this.getSize().getTotalSize();
    for(var i=0; i < size; ++i)
    {    
        value = this.getRescaledValueAtOffset(i);
        histo[value] = histo[value] || 0;
        histo[value] += 1;
    }
    // generate data for plotting
    var min = this.getRescaledDataRange().min;
    var max = this.getRescaledDataRange().max;
    for(var j=min; j < max; ++j)
    {    
        value = histo[j] || 0;
        histoPlot.push([j, value]);
    }
    return histoPlot;
};

/**
 * Convolute the image with a given 2D kernel.
 * @method convolute2D
 * @param {Array} weights The weights of the 2D kernel as a square matrix.
 * @return {Image} The convoluted image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.convolute2D = function(weights)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();

    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side/2);
    
    var ncols = this.getSize().getNumberOfColumns();
    var nrows = this.getSize().getNumberOfRows();
    var nslices = this.getSize().getNumberOfSlices();
    
    // loop vars
    var dstOff = 0;
    var newValue = 0;
    var sci = 0;
    var scj = 0;
    var srcOff = 0;
    var wt = 0;
    
    // go through the destination image pixels
    for (var k=0; k<nslices; k++) {
        for (var j=0; j<nrows; j++) {
            for (var i=0; i<ncols; i++) {
                dstOff = k*ncols*nrows + j*ncols + i;
                // calculate the weighed sum of the source image pixels that
                // fall under the convolution matrix
                newValue = 0;
                for (var cj=0; cj<side; cj++) {
                    for (var ci=0; ci<side; ci++) {
                        sci = i + ci - halfSide;
                        scj = j + cj - halfSide;
                        if (sci >= 0 && sci < ncols && scj >= 0 && scj < nrows ) {
                            srcOff = k*ncols*nrows + scj*ncols + sci;
                            wt = weights[cj*side+ci];
                            newValue += this.getValueAtOffset(srcOff) * wt;
                        }
                    }
                }
                newBuffer[dstOff] = newValue;
            }
        }
    }
    return newImage;
};

/**
 * Transform an image using a specific operator.
 * @method transform
 * @param {Function} operator The operator to use when transforming.
 * @return {Image} The transformed image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.transform = function(operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();
    for(var i=0; i < this.getSize().getTotalSize(); ++i)
    {   
        newBuffer[i] = operator( newImage.getValueAtOffset(i) );
    }
    return newImage;
};

/**
 * Compose this image with another one and using a specific operator.
 * @method compose
 * @param {Image} rhs The image to compose with.
 * @param {Function} operator The operator to use when composing.
 * @return {Image} The composed image.
 * Note: Uses the raw buffer values.
 */
dwv.image.Image.prototype.compose = function(rhs, operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();
    for(var i=0; i < this.getSize().getTotalSize(); ++i)
    {   
        // using the operator on the local buffer, i.e. the latest (not original) data
        newBuffer[i] = Math.floor( operator( this.getValueAtOffset(i), rhs.getValueAtOffset(i) ) );
    }
    return newImage;
};

