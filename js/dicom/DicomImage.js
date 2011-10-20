/**
* DicomImage.js
*/

/**
* DicomImage.
*/
function DicomImage(size, spacing, buffer){

	var self = this;
	// size: [0]=row, [1]=column
    this.size = size;
    // size: [0]=row, [1]=column
    this.spacing = spacing;
    // buffer
    this.buffer = buffer;
    
    // lookup
    this.lookup = null;

    this.getSize = function() {
        return self.size;
    };

    this.getSpacing = function() {
        return self.spacing;
    };

    this.getLookup = function() {
        return self.lookup;
    };
    
    this.getBuffer = function() {
        return self.buffer;
    };
}

DicomImage.prototype.getValue = function( i, j )
{
	return this.getValueAtOffset( ( j * this.size[0] ) + i );
};

DicomImage.prototype.getValueAtOffset = function( offset )
{
	return this.lookup.huLookup[ this.buffer[offset] ];
};

DicomImage.prototype.setLookup = function( windowCenter, windowWidth, rescaleSlope, rescaleIntercept )
{
    this.lookup = new LookupTable();
    this.lookup.setData( windowCenter, windowWidth, rescaleSlope, rescaleIntercept );
    this.lookup.calculateHULookup();
};

DicomImage.prototype.generateImageData = function( array )
{        
    this.lookup.calculateLookup();
    var imageOffset = 0;
    var colorOffset = 0;
    var pxValue = 0;
    for(var j=0; j < this.size[1]; ++j)
    {
        for(var i=0; i < this.size[0]; ++i)
        {        
        	colorOffset = (j * this.size[0] + i) * 4;                    
            pxValue = parseInt( this.lookup.ylookup[ this.buffer[imageOffset] ] );    
            imageOffset++;               
            array.data[colorOffset] = pxValue;
            array.data[colorOffset+1] = pxValue;
            array.data[colorOffset+2] = pxValue;
        }
    }            
};

