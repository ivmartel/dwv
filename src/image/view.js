/**
 * @namespace Image related.
 */
dwv.image = dwv.image || {};

/**
* @class View class.
* @param image The associated image.
* Need to set the window lookup table once created
* (either directly or with helper methods). 
*/
dwv.image.View = function(image)
{
    // rescale lookup table
    var rescaleLut = new dwv.image.lut.Rescale(
        image.getRescaleSlope(), image.getRescaleIntercept() );
    rescaleLut.initialise();
    // window lookup table
    var windowLut = null;
    // window presets
    var windowPresets = null;
    // color map
    var colorMap = dwv.image.lut.plain;
    
    // Get the associated image.
    this.getImage = function() { return image; };
    this.setImage = function(inimage) { image = inimage; };
    
    // Get the rescale LUT of the image.
    this.getRescaleLut = function() { return rescaleLut; };
    // Set the rescale LUT of the image.
    this.setRescaleLut = function(lut) { rescaleLut = lut; };
    // Get the window LUT of the image.
    this.getWindowLut = function() { return windowLut; };
    // Set the window LUT of the image.
    this.setWindowLut = function(lut) { windowLut = lut; };
    // Get the window presets.
    this.getWindowPresets = function() { return windowPresets; };
    // Set the window presets.
    this.setWindowPresets = function(presets) { 
        windowPresets = presets;
        this.setWindowLevel(presets[0].center, presets[0].width);
    };
    // Get the color map of the image.
    this.getColorMap = function() { return colorMap; };
    // Set the color map of the image.
    this.setColorMap = function(map) { 
        colorMap = map;
        // TODO Better handle this...
        if( this.getImage().getPhotometricInterpretation() === "MONOCHROME1") 
            colorMap = dwv.image.lut.invPlain;
        this.fireEvent({"type": "colorchange", 
            "wc": this.getWindowLut().getCenter(),
            "ww": this.getWindowLut().getWidth() });
    };
    
    // view listeners
    var listeners = {};
    // Get the view listeners.
    this.getListeners = function() { return listeners; };
    // Set the view listeners.
    this.setListeners = function(list) { listeners = list; };
};

/**
 * Set the view window/level.
 * @param center The window center.
 * @param width The window width.
 * @warning Uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.setWindowLevel = function( center, width )
{
    var lut = new dwv.image.lut.Window(center, width, this.getRescaleLut());
    lut.initialise();
    this.setWindowLut( lut );
    this.fireEvent({"type": "wlchange", 
        "wc": this.getWindowLut().getCenter(),
        "ww": this.getWindowLut().getWidth() });
};

/**
 * Set the image window/level to cover the full data range.
 * @warning Uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.setWindowLevelMinMax = function()
{
    // calculate center and width
    var range = this.getImage().getDataRange();
    var min = range.min;
    var max = range.max;
    var width = max - min;
    var center = min + width/2;
    // set window level
    this.setWindowLevel(center,width);
};

/**
 * Clone the image using all meta data and the original data buffer.
 * @returns A full copy of this {dwv.image.Image}.
 */
dwv.image.View.prototype.clone = function()
{
    var copy = new dwv.image.View(this.getImage());
    copy.setRescaleLut(this.getRescaleLut());
    copy.setWindowLut(this.getWindowLut());
    copy.setListeners(this.getListeners());
    return copy;
};

/**
 * Generate display image data to be given to a canvas.
 * @param array The array to fill in.
 * @param sliceNumber The slice position.
 */
dwv.image.View.prototype.generateImageData = function( array, sliceNumber )
{        
    var image = this.getImage();
    var sliceSize = image.getSize().getSliceSize();
    var sliceOffset = (sliceNumber || 0) * sliceSize;
    var iMax = sliceOffset + sliceSize;
    var pxValue = 0;
    var photoInterpretation = image.getPhotometricInterpretation();
    var planarConfig = image.getPlanarConfiguration();
    var windowLut = this.getWindowLut();
    var colorMap = this.getColorMap();
    var index = 0;
    switch (photoInterpretation) {
        case "MONOCHROME1":
        case "MONOCHROME2":
            for(var i=sliceOffset; i < iMax; ++i)
            {        
                pxValue = parseInt( windowLut.getValue( 
                		image.getValueAtOffset(i) ), 10 );
                index = 4*i;
                array.data[index] = colorMap.red[pxValue];
                array.data[index+1] = colorMap.green[pxValue];
                array.data[index+2] = colorMap.blue[pxValue];
                array.data[index+3] = 0xff;
            }
        break;
        
        case "RGB":
            // the planar configuration defines the memory layout
            if( planarConfig !== 0 && planarConfig !== 1 ) {
                throw new Error("Unsupported planar configuration: "+planarConfig);
            }
            // default: RGBRGBRGBRGB...
            var posR = 0;
            var posG = 1;
            var posB = 2;
            var stepPos = 3;
            // RRRR...GGGG...BBBB...
            if (planarConfig === 1) { 
                posR = 0;
                posG = iMax;
                posB = 2 * iMax;
                stepPos = 1;
            }
            
            var redValue = 0;
            var greenValue = 0;
            var blueValue = 0;
            for(var i=sliceOffset; i < iMax; ++i)
            {        
                redValue = parseInt( this.getWindowLut().getValue( 
                        this.getImage().getValueAtOffset(posR) ), 10 );
                greenValue = parseInt( this.getWindowLut().getValue( 
                        this.getImage().getValueAtOffset(posG) ), 10 );
                blueValue = parseInt( this.getWindowLut().getValue( 
                        this.getImage().getValueAtOffset(posB) ), 10 );
                
                array.data[4*i] = redValue;
                array.data[4*i+1] = greenValue;
                array.data[4*i+2] = blueValue;
                array.data[4*i+3] = 0xff;
                
                posR += stepPos;
                posG += stepPos;
                posB += stepPos;
            }
        break;
        
        default: 
            throw new Error("Unsupported photometric interpretation: "+photoInterpretation);
    }
};

/**
 * Add an event listener on the view.
 * @param type The event type.
 * @param listener The method associated with the provided event type.
 */
dwv.image.View.prototype.addEventListener = function(type, listener)
{
    if( !this.getListeners()[type] ) this.getListeners()[type] = [];
    this.getListeners()[type].push(listener);
};

/**
 * Remove an event listener on the view.
 * @param type The event type.
 * @param listener The method associated with the provided event type.
 */
dwv.image.View.prototype.removeEventListener = function(type, listener)
{
    if( !this.getListeners()[type] ) return;
    for(var i=0; i < this.getListeners()[type].length; ++i)
    {   
        if( this.getListeners()[type][i] === listener )
            this.getListeners()[type].splice(i,1);
    }
};

/**
 * Fire an event: call all associated listeners.
 * @param event The event to fire.
 */
dwv.image.View.prototype.fireEvent = function(event)
{
    if( !this.getListeners()[event.type] ) return;
    for(var i=0; i < this.getListeners()[event.type].length; ++i)
    {   
        this.getListeners()[event.type][i](event);
    }
};
