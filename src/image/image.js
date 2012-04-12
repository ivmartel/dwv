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
dwv.image.Image = function(size, spacing, buffer) {

    var self = this;
    // ImageSize
    this.size = size;
    // ImageSpacing
    this.spacing = spacing;
    // buffer
    this.buffer = buffer;
    // data range
    this.dataRange = undefined;
    // histogram
    this.histoPlot = undefined;
    
    // lookup
    this.lookup = null;
    this.lut = dwv.image.lut.plain;

    this.getSize = function() {
        return self.size;
    };

    this.getSpacing = function() {
        return self.spacing;
    };

    this.getLookup = function() {
        return self.lookup;
    };

    this.getLut = function() {
        return self.lut;
    };

    this.getBuffer = function() {
        return self.buffer;
    };
};

dwv.image.Image.prototype.getValue = function( i, j, k )
{
    var k1 = k || 0;
    // check size
    //this.size.checkCoordinates( i, j, k1 );
    // return
    return this.getValueAtOffset( i + ( j * this.size.getNumberOfColumns() ) + ( k1 * this.size.getSliceSize()) );
};

dwv.image.Image.prototype.getValueAtOffset = function( offset )
{
    return this.lookup.huLookup[ this.buffer[offset] ];
};

dwv.image.Image.prototype.setColourMap = function( lut )
{
    this.lut = lut;
};

dwv.image.Image.prototype.setLookup = function( windowPresets, rescaleSlope, rescaleIntercept )
{
    this.lookup = new dwv.image.LookupTable( windowPresets, rescaleSlope, rescaleIntercept);
    this.lookup.calculateHULookup();
};

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
