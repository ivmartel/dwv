// dicom namespace
dwv.dicom = dwv.dicom || {};

/**
 *  LookupTable.js
 *  Version 0.5
 *  Author: BabuHussain<babuhussain.a@raster.in>
 */

dwv.dicom.setWindowingdata = function(wc,ww)
{
    this.windowCenter = wc;
    this.windowWidth = ww;    
};

dwv.dicom.calculateHULookup = function()
{
    this.huLookup = new Array(4096);         
    for(var inputValue=0; inputValue<=4095; inputValue++)
    {        
        this.huLookup[inputValue] = inputValue * this.rescaleSlope + this.rescaleIntercept;        
    }        
};

dwv.dicom.calculateLookup = function()
{    
    xMin = this.windowCenter - 0.5 - (this.windowWidth-1) / 2;
    xMax = this.windowCenter - 0.5 + (this.windowWidth-1) / 2;    
    yMax = 255;
    yMin = 0;
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

/**
 * LookupTable class.
 * @returns {LookupTable}
 */
dwv.dicom.LookupTable = function()
{
    // methods
    this.calculateHULookup = dwv.dicom.calculateHULookup;
    this.calculateLookup = dwv.dicom.calculateLookup;
    this.setWindowingdata = dwv.dicom.setWindowingdata;
};

dwv.dicom.LookupTable.prototype.setData = function(wc,ww,rs,ri)
{    
    this.windowCenter = wc;
    this.windowWidth = ww;
    this.defaultWindowCenter = wc;
    this.defaultWindowWidth = ww;
    this.rescaleSlope = rs;
    this.rescaleIntercept = ri;    
};
