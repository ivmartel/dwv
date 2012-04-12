/**
 * @namespace Image related.
 */
dwv.image = dwv.image || {};

/**
 * @class LookupTable class.
 * @returns {LookupTable}
 */
dwv.image.LookupTable = function(windowPresets,rs,ri)
{
    // default values if no presets
    this.windowCenter = 100;
    this.windowWidth = 1000;
    if( windowPresets.length > 0 ) {
        this.windowCenter = windowPresets[0].center;
        this.windowWidth = windowPresets[0].width;
    }
    this.windowPresets = windowPresets;
    this.rescaleSlope = rs;
    this.rescaleIntercept = ri;    
};

dwv.image.LookupTable.prototype.setWindowingdata = function(wc,ww)
{
    this.windowCenter = wc;
    this.windowWidth = ww;    
};

dwv.image.LookupTable.prototype.calculateHULookup = function()
{
    this.huLookup = new Array(4096);         
    for(var inputValue=0; inputValue<=4095; inputValue++)
    {        
        this.huLookup[inputValue] = inputValue * this.rescaleSlope + this.rescaleIntercept;        
    }        
};

dwv.image.LookupTable.prototype.calculateLookup = function()
{    
    var xMin = this.windowCenter - 0.5 - (this.windowWidth-1) / 2;
    var xMax = this.windowCenter - 0.5 + (this.windowWidth-1) / 2;    
    var yMax = 255;
    var yMin = 0;
    this.ylookup = new Array(4096);
    for(var inputValue=0; inputValue<=4095; inputValue++)
     {         
         if(this.huLookup[inputValue] <= xMin)
         {                            
            this.ylookup[inputValue] = yMin;                        
        }
        else if (this.huLookup[inputValue] > xMax)
        {
            this.ylookup[inputValue] = yMax;         
        }
        else
        {                
            var y = ( (this.huLookup[inputValue] - (this.windowCenter-0.5) ) / (this.windowWidth-1) + 0.5 )
                * (yMax-yMin) + yMin;                        
            this.ylookup[inputValue]= parseInt(y, 10);
        }
     }
};
