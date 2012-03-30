// image namespace
dwv.image = dwv.image || {};

/**
*image.js
*/

/**
* Image Size class. 
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
* Image Spacing class. 
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
* Image class.
*/
dwv.image.Image = function(size, spacing, buffer) {

    var self = this;
    // ImageSize
    this.size = size;
    // ImageSpacing
    this.spacing = spacing;
    // buffer
    this.buffer = buffer;
    
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

dwv.image.Image.prototype.setLookup = function( windowCenter, windowWidth, rescaleSlope, rescaleIntercept )
{
    this.lookup = new dwv.image.LookupTable(
            windowCenter, windowWidth, 
            rescaleSlope, rescaleIntercept);
    this.lookup.calculateHULookup();
};

dwv.image.Image.prototype.generateImageData = function( array, sliceNumber )
{        
    this.lookup.calculateLookup();
    var sliceOffset = (sliceNumber || 0) * this.size.getSliceSize();
    var rowOffset = 0;
    var imageOffset = sliceOffset;
    var colorOffset = 0;
    var pxValue = 0;
    for(var j=0; j < this.size.getNumberOfRows(); ++j)
    {
        rowOffset = j * this.size.getNumberOfColumns();
        for(var i=0; i < this.size.getNumberOfColumns(); ++i)
        {        
            colorOffset = (i + rowOffset + sliceOffset) * 4;                    
            pxValue = parseInt( this.lookup.ylookup[ this.buffer[imageOffset] ], 10 );    
            imageOffset++;               
            array.data[colorOffset] = this.lut.red[pxValue];
            array.data[colorOffset+1] = this.lut.green[pxValue];
            array.data[colorOffset+2] = this.lut.blue[pxValue];
        }
    }            
};

dwv.image.Image.prototype.getMinMax = function()
{
    var min = this.getValue(0,0,0);
    var max = min;
    var value = 0;
    for(var k=0; k < this.size.getNumberOfSlices(); ++k)
    {
        for(var j=0; j < this.size.getNumberOfRows(); ++j)
        {
            for(var i=0; i < this.size.getNumberOfColumns(); ++i)
            {    
                value = this.getValue(i,j,k);
                if( value > max ) {
                    max = value;
                }
                if( value < min ) {
                    min = value;
                }
            }
        }
    }
    return { "min": min, "max": max };
};

dwv.image.Image.prototype.getHistogram = function()
{
    var minMax = this.getMinMax();
    console.log(minMax.max);
    console.log(minMax.min);
    var range = minMax.max - minMax.max;
    var histo = [range];
    var value = 0;
    for(var k=0; k < this.size.getNumberOfSlices(); ++k)
    {
        for(var j=0; j < this.size.getNumberOfRows(); ++j)
        {
            for(var i=0; i < this.size.getNumberOfColumns(); ++i)
            {    
                value = this.getValue(i,j,k);
                histo[value] += 1;
            }
        }
    }
    return histo;
};
