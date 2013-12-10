/** 
 * Image module.
 * @module image
 */
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * View class.
 * @class View
 * @namespace dwv.image
 * @constructor
 * @param {Image} image The associated image.
 * @param {Boolean} isSigned Is the data signed.
 * Need to set the window lookup table once created
 * (either directly or with helper methods). 
 */
dwv.image.View = function(image, isSigned)
{
    /**
     * Rescale lookup table.
     * @property rescaleLut
     * @private
     * @type Rescale
     */
    var rescaleLut = new dwv.image.lut.Rescale(
        image.getRescaleSlope(), image.getRescaleIntercept() );
    // initialise it
    rescaleLut.initialise(image.getMeta().BitsStored);
    
    /**
     * Window lookup table.
     * @property windowLut
     * @private
     * @type Window
     */
    var windowLut = new dwv.image.lut.Window(rescaleLut, isSigned);
    
    /**
     * Window presets.
     * @property windowPresets
     * @private
     * @type Object
     */
    var windowPresets = null;
    /**
     * Color map
     * @property colorMap
     * @private
     * @type Object
     */
    var colorMap = dwv.image.lut.plain;
    /**
     * Current position
     * @property currentPosition
     * @private
     * @type Object
     */
    var currentPosition = {"i":0,"j":0,"k":0};
    
    /**
     * Get the associated image.
     * @method getImage
     * @return {Image} The associated image.
     */ 
    this.getImage = function() { return image; };
    /**
     * Set the associated image.
     * @method setImage
     * @param {Image} inImage The associated image.
     */ 
    this.setImage = function(inImage) { image = inImage; };
    
    /**
     * Get the rescale LUT of the image.
     * @method getRescaleLut
     * @return {Rescale} The rescale LUT of the image.
     */ 
    this.getRescaleLut = function() { return rescaleLut; };
    /**
     * Set the rescale LUT of the image.
     * @method setRescaleLut
     * @param {Rescale} lut The rescale LUT of the image.
     */ 
    this.setRescaleLut = function(lut) { rescaleLut = lut; };

    /**
     * Get the window LUT of the image.
     * @method getWindowLut
     * @return {Window} The window LUT of the image.
     */ 
    this.getWindowLut = function() { return windowLut; };
    /**
     * Set the window LUT of the image.
     * @method setWindowLut
     * @param {Window} lut The window LUT of the image.
     */ 
    this.setWindowLut = function(lut) { windowLut = lut; };
    
    /**
     * Get the window presets.
     * @method getWindowPresets
     * @return {Object} The window presets.
     */ 
    this.getWindowPresets = function() { return windowPresets; };
    /**
     * Set the window presets.
     * @method setWindowPresets
     * @param {Object} presets The window presets.
     */ 
    this.setWindowPresets = function(presets) { 
        windowPresets = presets;
        this.setWindowLevel(presets[0].center, presets[0].width);
    };
    
    /**
     * Get the color map of the image.
     * @method getColorMap
     * @return {Object} The color map of the image.
     */ 
    this.getColorMap = function() { return colorMap; };
    /**
     * Set the color map of the image.
     * @method setColorMap
     * @param {Object} map The color map of the image.
     */ 
    this.setColorMap = function(map) { 
        colorMap = map;
        // TODO Better handle this...
        if( this.getImage().getPhotometricInterpretation() === "MONOCHROME1") 
            colorMap = dwv.image.lut.invPlain;
        this.fireEvent({"type": "colorchange", 
            "wc": this.getWindowLut().getCenter(),
           "ww": this.getWindowLut().getWidth() });
    };
    
    /**
     * Is the data signed data.
     * @method isSigned
     * @return {Boolean} The signed data flag.
     */ 
    this.isSigned = function() { return isSigned; };
    
    /**
     * Get the current position.
     * @method getCurrentPosition
     * @return {Object} The current position.
     */ 
    this.getCurrentPosition = function() { return currentPosition; };
    /**
     * Set the current position. Returns false if not in bounds.
     * @method setCurrentPosition
     * @param {Object} pos The current position.
     */ 
    this.setCurrentPosition = function(pos) { 
        if( !image.getSize().isInBounds(pos.i,pos.j,pos.k) ) return false;
        var oldPosition = currentPosition;
        currentPosition = pos;
        // only display value for monochrome data
        if( app.getImage().getPhotometricInterpretation().match(/MONOCHROME/) !== null )
        {
            this.fireEvent({"type": "positionchange", 
                "i": pos.i, "j": pos.j, "k": pos.k,
                "value": image.getRescaledValue(pos.i,pos.j,pos.k)});
        }
        else
        {
            this.fireEvent({"type": "positionchange", 
                "i": pos.i, "j": pos.j, "k": pos.k});
        }
        // slice change event (used to trigger redraw)
        if( oldPosition.k !== currentPosition.k ) {
            this.fireEvent({"type": "slicechange"});
        }
        return true;
    };
    
    /**
     * View listeners
     * @property listeners
     * @private
     * @type Array
     */
    var listeners = {};
    /**
     * Get the view listeners.
     * @method getListeners
     * @return {Array} The view listeners.
     */ 
    this.getListeners = function() { return listeners; };
    /**
     * Set the view listeners.
     * @method setListeners
     * @param {Object} list The view listeners.
     */ 
    this.setListeners = function(list) { listeners = list; };
};

/**
 * Set the view window/level.
 * @method setWindowLevel
 * @param {Number} center The window center.
 * @param {Number} width The window width.
 * Warning: uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.setWindowLevel = function( center, width )
{
    this.getWindowLut().setCenterAndWidth(center, width);
    this.fireEvent({"type": "wlchange", "wc": center, "ww": width });
};

/**
 * Set the image window/level to cover the full data range.
 * @method setWindowLevelMinMax
 * Warning: uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.setWindowLevelMinMax = function()
{
    // calculate center and width
    var range = this.getImage().getRescaledDataRange();
    var min = range.min;
    var max = range.max;
    var width = max - min;
    var center = min + width/2;
    // set window level
    this.setWindowLevel(center,width);
};

/**
 * Increment the current slice number.
 * @method incrementSliceNb
 * @return {Boolean} False if not in bounds.
 */
dwv.image.View.prototype.incrementSliceNb = function()
{
    return this.setCurrentPosition({
        "i": this.getCurrentPosition().i,
        "j": this.getCurrentPosition().j,
        "k": this.getCurrentPosition().k + 1 });
};

/**
 * Decrement the current slice number.
 * @method decrementSliceNb
 * @return {Boolean} False if not in bounds.
 */
dwv.image.View.prototype.decrementSliceNb = function()
{
    return this.setCurrentPosition({
        "i": this.getCurrentPosition().i,
        "j": this.getCurrentPosition().j,
        "k": this.getCurrentPosition().k - 1 });
};

/**
 * Clone the image using all meta data and the original data buffer.
 * @method clone
 * @return {View} A full copy of this {dwv.image.Image}.
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
 * @method generateImageData
 * @param {Array} array The array to fill in.
 * @param {Number} sliceNumber The slice position.
 */
dwv.image.View.prototype.generateImageData = function( array )
{        
    var sliceNumber = this.getCurrentPosition().k;
    var image = this.getImage();
    var pxValue = 0;
    var photoInterpretation = image.getPhotometricInterpretation();
    var planarConfig = image.getPlanarConfiguration();
    var windowLut = this.getWindowLut();
    var colorMap = this.getColorMap();
    var index = 0;
    var sliceSize = 0;
    var sliceOffset = 0;
    switch (photoInterpretation) {
        case "MONOCHROME1":
        case "MONOCHROME2":
            sliceSize = image.getSize().getSliceSize();
            sliceOffset = (sliceNumber || 0) * sliceSize;
            var iMax = sliceOffset + sliceSize;
            for(var i=sliceOffset; i < iMax; ++i)
            {        
                pxValue = parseInt( windowLut.getValue( 
                        image.getValueAtOffset(i) ), 10 );
                array.data[index] = colorMap.red[pxValue];
                array.data[index+1] = colorMap.green[pxValue];
                array.data[index+2] = colorMap.blue[pxValue];
                array.data[index+3] = 0xff;
                index += 4;
            }
        break;
        
        case "RGB":
            // the planar configuration defines the memory layout
            if( planarConfig !== 0 && planarConfig !== 1 ) {
                throw new Error("Unsupported planar configuration: "+planarConfig);
            }
            sliceSize = image.getSize().getSliceSize();
            sliceOffset = (sliceNumber || 0) * 3 * sliceSize;
            // default: RGBRGBRGBRGB...
            var posR = sliceOffset;
            var posG = sliceOffset + 1;
            var posB = sliceOffset + 2;
            var stepPos = 3;
            // RRRR...GGGG...BBBB...
            if (planarConfig === 1) { 
                posR = sliceOffset;
                posG = sliceOffset + sliceSize;
                posB = sliceOffset + 2 * sliceSize;
                stepPos = 1;
            }
            
            var redValue = 0;
            var greenValue = 0;
            var blueValue = 0;
            for(var j=0; j < image.getSize().getSliceSize(); ++j)
            {        
                redValue = parseInt( windowLut.getValue( 
                        image.getValueAtOffset(posR) ), 10 );
                greenValue = parseInt( windowLut.getValue( 
                        image.getValueAtOffset(posG) ), 10 );
                blueValue = parseInt( windowLut.getValue( 
                        image.getValueAtOffset(posB) ), 10 );
                
                array.data[index] = redValue;
                array.data[index+1] = greenValue;
                array.data[index+2] = blueValue;
                array.data[index+3] = 0xff;
                index += 4;
                
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
 * @method addEventListener
 * @param {String} type The event type.
 * @param {Object} listener The method associated with the provided event type.
 */
dwv.image.View.prototype.addEventListener = function(type, listener)
{
    var listeners = this.getListeners();
    if( !listeners[type] ) listeners[type] = [];
    listeners[type].push(listener);
};

/**
 * Remove an event listener on the view.
 * @method removeEventListener
 * @param {String} type The event type.
 * @param {Object} listener The method associated with the provided event type.
 */
dwv.image.View.prototype.removeEventListener = function(type, listener)
{
    var listeners = this.getListeners();
    if( !listeners[type] ) return;
    for(var i=0; i < listeners[type].length; ++i)
    {   
        if( listeners[type][i] === listener )
            listeners[type].splice(i,1);
    }
};

/**
 * Fire an event: call all associated listeners.
 * @method fireEvent
 * @param {Object} event The event to fire.
 */
dwv.image.View.prototype.fireEvent = function(event)
{
    var listeners = this.getListeners();
    if( !listeners[event.type] ) return;
    for(var i=0; i < listeners[event.type].length; ++i)
    {   
        listeners[event.type][i](event);
    }
};

