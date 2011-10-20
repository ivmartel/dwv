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

DicomImage.prototype.getValue = function( x, y )
{
	return this.getValueAtOffset( ( y * this.size[0] ) + x );
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
    var n = 0;
    var offset = 0;
    var pxValue = 0;
    for(var yPix=0; yPix < this.size[1]; yPix++)
    {
        for(var xPix=0; xPix < this.size[0]; xPix++)
        {        
            offset = (yPix * this.size[0] + xPix) * 4;                    
            pxValue = this.lookup.ylookup[ this.buffer[n] ];    
            n++;               
            array.data[offset] = parseInt(pxValue);
            array.data[offset+1] = parseInt(pxValue);
            array.data[offset+2] = parseInt(pxValue);
        }
    }            
};

