/**
 * @namespace Image related.
 */
dwv.image = dwv.image || {};

/**
* @class Image Size class. 
* Supports 2D and 3D images.
* @param numberOfColumns The number of columns (number).
* @param numberOfRows The number of rows (number).
* @param numberOfSlices The number of slices (number).
*/
dwv.image.ImageSize = function( numberOfColumns, numberOfRows, numberOfSlices ) {
    return {
        getNumberOfColumns: function() {
            return numberOfColumns;
        },
        getNumberOfRows: function() {
            return numberOfRows;
        },
        getNumberOfSlices: function() {
            return (numberOfSlices || 1);
        },
        getSliceSize: function() {
            return numberOfColumns*numberOfRows;
        },
        checkCoordinates: function( i, j, k ) {
            if( i < 0 || i >= this.getNumberOfColumns() ) {
                throw new Error('Index (i) out of range.');
            }
            else if( j < 0 || j >= this.getNumberOfRows() ) {
                throw new Error('Index (j) out of range.');
            }
            else if( k < 0 || k >= this.getNumberOfSlices() ) {
                throw new Error('Index (k) out of range.');
            }
            return true;
        }
    };
};

/**
* @class Image Spacing class. 
* Supports 2D and 3D images.
* @param columnSpacing The column spacing (number).
* @param rowSpacing The row spacing (number).
* @param sliceSpacing The slice spacing (number).
*/
dwv.image.ImageSpacing = function( columnSpacing, rowSpacing, sliceSpacing ) {
    return {
        getColumnSpacing: function() {
            return columnSpacing;
        },
        getRowSpacing: function() {
            return rowSpacing;
        },
        getSliceSpacing: function() {
            return (sliceSpacing || 1);
        }
    };
};

/**
* @class Image class.
*/
dwv.image.Image = function(size, spacing, buffer)
{
    var self = this;
    // ImageSize
    this.size = size;
    // ImageSpacing
    this.spacing = spacing;
    // buffer
    this.originalBuffer = buffer;
    this.buffer = buffer.slice();
    // data range
    this.dataRange = undefined;
    // histogram
    this.histoPlot = undefined;
    
    // lookup: from raw to HU display data (rescale + w/l)
    this.lookup = null;
    // lut: colour lookup table
    this.lut = dwv.image.lut.plain;

    // Get the size of the image.
    this.getSize = function() {
        return self.size;
    };

    // Get the spacing of the image.
    this.getSpacing = function() {
        return self.spacing;
    };

    // Get the lookup table of the image.
    this.getLookup = function() {
        return self.lookup;
    };

    // Get the colour lookup table of the image.
    this.getLut = function() {
        return self.lut;
    };

    // Restore the original buffer data.
    this.restoreOrginalBuffer = function() {
        this.buffer = this.originalBuffer.slice();
    };
    
    // Get the data buffer of the image.
    this.getBuffer = function() {
        return self.buffer;
    };
    
};

/**
 * Get the value of the image at a specific coordinate.
 * @param i The X index.
 * @param j The Y index.
 * @param k The Z index.
 * @returns The value at the desired position.
 */
dwv.image.Image.prototype.getValue = function( i, j, k )
{
    var k1 = k || 0;
    // check size
    //this.size.checkCoordinates( i, j, k1 );
    // return
    return this.getValueAtOffset( i + ( j * this.size.getNumberOfColumns() ) + ( k1 * this.size.getSliceSize()) );
};

/**
 * Get the value of the image at a specific offset.
 * @param offset The offset in the buffer. 
 * @returns The value at the desired offset.
 */
dwv.image.Image.prototype.getValueAtOffset = function( offset )
{
    return this.lookup.huLookup[ this.buffer[offset] ];
};

/**
 * Set the colour lookup table.
 * @param lut The lookup table.
 */
dwv.image.Image.prototype.setColourMap = function( lut )
{
    this.lut = lut;
};

/**
 * Set the main lookup table.
 * @param lut The lookup table.
 */
dwv.image.Image.prototype.setLookup = function( lookup )
{
    this.lookup = lookup;
    this.lookup.calculateHULookup();
};

/**
 * Clone the image using all meta data and the original data buffer.
 * @returns A full copy of this {dwv.image.Image}.
 */
dwv.image.Image.prototype.clone = function()
{
    var copy = new dwv.image.Image(this.size, this.spacing, this.originalBuffer);
    copy.setLookup(this.lookup);
    return copy;
};

/**
 * Generate display image data to be given to a canvas.
 * @param array The array to fill in.
 * @param sliceNumber The slice position.
 */
dwv.image.Image.prototype.generateImageData = function( array, sliceNumber )
{        
    this.lookup.calculateLookup();
    var sliceOffset = (sliceNumber || 0) * this.size.getSliceSize();
    var iMax = sliceOffset + this.size.getSliceSize();
    var pxValue = 0;
    for(var i=sliceOffset; i < iMax; ++i)
    {        
        pxValue = parseInt( this.lookup.ylookup[ this.buffer[i] ], 10 );    
        array.data[4*i] = this.lut.red[pxValue];
        array.data[4*i+1] = this.lut.green[pxValue];
        array.data[4*i+2] = this.lut.blue[pxValue];
        array.data[4*i+3] = 0xff;
    }
};

/**
 * Get the image data range (after rescale).
 * @returns The range {min, max}.
 */
dwv.image.Image.prototype.getDataRange = function()
{
    if( !this.dataRange ) {
        var min = this.buffer[0];
        var max = min;
        var value = 0;
        for(var i=0; i < this.buffer.length; ++i)
        {    
            value = this.getValueAtOffset(i);
            if( value > max ) {
                max = value;
            }
            if( value < min ) {
                min = value;
            }
        }
        this.dataRange = { "min": min, "max": max };
    }
    return this.dataRange;
};

/**
 * Get the histogram of the image.
 * @returns An array representing the histogram.
 */
dwv.image.Image.prototype.getHistogram = function()
{
    if( !this.histoPlot ) {
        var histo = [];
        this.histoPlot = [];
        var value = 0;
        for(var i=0; i < this.buffer.length; ++i)
        {    
            value = this.getValueAtOffset(i);
            histo[value] = histo[value] || 0;
            histo[value] += 1;
        }
        // generate data for plotting
        for(var j=this.getDataRange().min; j < this.getDataRange().max; ++j)
        {    
            value = histo[j] || 0;
            this.histoPlot.push([j, value]);
        }
    }
    return this.histoPlot;
};

/**
 * Convolute the image with a given 2D kernel.
 * @param weights The weights of the 2D kernel.
 * @returns The convoluted image.
 * 
 * Note: Uses the raw buffer values and not the rescaled ones.
 */
dwv.image.Image.prototype.convolute = function(weights)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();

    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side/2);
    
    var ncols = this.getSize().getNumberOfColumns();
    var nrows = this.getSize().getNumberOfRows();
    
    // go through the destination image pixels
    for (var y=0; y<nrows; y++) {
        for (var x=0; x<ncols; x++) {
            var dstOff = y*ncols + x;
            // calculate the weighed sum of the source image pixels that
            // fall under the convolution matrix
            var newValue = 0;
            for (var cy=0; cy<side; cy++) {
                for (var cx=0; cx<side; cx++) {
                    var scy = y + cy - halfSide;
                    var scx = x + cx - halfSide;
                    if (scy >= 0 && scy < nrows && scx >= 0 && scx < ncols) {
                        var srcOff = scy*ncols + scx;
                        var wt = weights[cy*side+cx];
                        newValue += this.buffer[srcOff] * wt;
                    }
                }
            }
            newBuffer[dstOff] = newValue;
        }
    }
    return newImage;
};

/**
 * Transform an image using a specific operator.
 * @param operator The operator to use when transforming.
 * @returns The transformed image.
 * 
 * Note: Uses the rescaled buffer values and not the raw ones.
 */
dwv.image.Image.prototype.transform = function(operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();
    for(var i=0; i < newBuffer.length; ++i)
    {   
        // using the operator on the cloned buffer, i.e. the original data
        newBuffer[i] = ( operator( newImage.getValueAtOffset(i) ) - this.lookup.rescaleIntercept )
            / this.lookup.rescaleSlope;
    }
    return newImage;
};

/**
 * Compose this image with another one and using a specific operator.
 * @param rhs The image to compose with.
 * @param operator The operator to use when composing.
 * @returns The composed image.
 * 
 * Note: Uses the raw buffer values and not the rescaled ones.
 */
dwv.image.Image.prototype.compose = function(rhs, operator)
{
    var newImage = this.clone();
    var newBuffer = newImage.getBuffer();
    for(var i=0; i < newBuffer.length; ++i)
    {   
        // using the operator on the local buffer, i.e. the latest (not original) data
        newBuffer[i] = Math.floor( operator( this.buffer[i], rhs.getBuffer()[i] ) );
    }
    return newImage;
};
