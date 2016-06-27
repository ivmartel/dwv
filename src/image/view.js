// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * View class.
 * @constructor
 * @param {Image} image The associated image.
 * @param {Boolean} isSigned Is the data signed.
 * Need to set the window lookup table once created
 * (either directly or with helper methods).
 */
dwv.image.View = function(image, isSigned)
{
    /**
     * Window lookup tables, indexed per Rescale Slope and Intercept (RSI).
     * @private
     * @type Window
     */
    var windowLuts = {};

    /**
     * Window presets.
     * @private
     * @type Object
     */
    var windowPresets = null;
    /**
     * colour map.
     * @private
     * @type Object
     */
    var colourMap = dwv.image.lut.plain;
    /**
     * Current position.
     * @private
     * @type Object
     */
    var currentPosition = {"i":0,"j":0,"k":0};
    /**
     * Current frame. Zero based.
     * @private
     * @type Number
     */
    var currentFrame = null;

    /**
     * Get the associated image.
     * @return {Image} The associated image.
     */
    this.getImage = function() { return image; };
    /**
     * Set the associated image.
     * @param {Image} inImage The associated image.
     */
    this.setImage = function(inImage) { image = inImage; };

    /**
     * Get the window LUT of the image.
     * @return {Window} The window LUT of the image.
     */
    this.getWindowLut = function (rsi) {
        if ( typeof rsi === "undefined" ) {
            var sliceNumber = this.getCurrentPosition().k;
            rsi = image.getRescaleSlopeAndIntercept(sliceNumber);
        }
        return windowLuts[ rsi.toString() ];
    };
    /**
     * Set the window LUT of the image.
     * @param {Window} wlut The window LUT of the image.
     */
    this.setWindowLut = function (wlut)
    {
        var rsi = wlut.getRescaleLut().getRSI();
        windowLuts[rsi.toString()] = wlut;
    };

    var self = this;

    /**
     * Initialise the view. Only called at construction.
     * @private
     */
    function initialise()
    {
        // create the rescale lookup table
        var rescaleLut = new dwv.image.lut.Rescale(
            image.getRescaleSlopeAndIntercept(0) );
        // initialise the rescale lookup table
        rescaleLut.initialise(image.getMeta().BitsStored);
        // create the window lookup table
        var windowLut = new dwv.image.lut.Window(rescaleLut, isSigned);
        self.setWindowLut(windowLut);
    }

    // default constructor
    initialise();

    /**
     * Get the window presets.
     * @return {Object} The window presets.
     */
    this.getWindowPresets = function() { return windowPresets; };
    /**
     * Set the window presets.
     * @param {Object} presets The window presets.
     */
    this.setWindowPresets = function(presets) {
        windowPresets = presets;
        this.setWindowLevel(presets[0].center, presets[0].width);
    };

    /**
     * Get the colour map of the image.
     * @return {Object} The colour map of the image.
     */
    this.getColourMap = function() { return colourMap; };
    /**
     * Set the colour map of the image.
     * @param {Object} map The colour map of the image.
     */
    this.setColourMap = function(map) {
        colourMap = map;
        // TODO Better handle this...
        if( this.getImage().getPhotometricInterpretation() === "MONOCHROME1") {
            colourMap = dwv.image.lut.invPlain;
        }
        this.fireEvent({"type": "colour-change",
           "wc": this.getWindowLut().getCenter(),
           "ww": this.getWindowLut().getWidth() });
    };

    /**
     * Is the data signed data.
     * @return {Boolean} The signed data flag.
     */
    this.isSigned = function() { return isSigned; };

    /**
     * Get the current position.
     * @return {Object} The current position.
     */
    this.getCurrentPosition = function() {
        // return a clone to avoid reference problems
        return {"i": currentPosition.i, "j": currentPosition.j, "k": currentPosition.k};
    };
    /**
     * Set the current position.
     * @param {Object} pos The current position.
     * @param {Boolean} silent If true, does not fire a slice-change event.
     * @return {Boolean} False if not in bounds
     */
    this.setCurrentPosition = function(pos, silent) {
        // default silent flag to false
        if ( typeof silent === "undefined" ) {
            silent = false;
        }
        // check if possible
        if( !image.getGeometry().getSize().isInBounds(pos.i,pos.j,pos.k) ) {
            return false;
        }
        var oldPosition = currentPosition;
        currentPosition = pos;

        // fire a 'position-change' event
        if( image.getPhotometricInterpretation().match(/MONOCHROME/) !== null )
        {
            this.fireEvent({"type": "position-change",
                "i": pos.i, "j": pos.j, "k": pos.k,
                "value": image.getRescaledValue(pos.i,pos.j,pos.k, this.getCurrentFrame())});
        }
        else
        {
            this.fireEvent({"type": "position-change",
                "i": pos.i, "j": pos.j, "k": pos.k});
        }

        // fire a slice change event (used to trigger redraw)
        if ( !silent ) {
          if( oldPosition.k !== currentPosition.k ) {
              this.fireEvent({"type": "slice-change"});
          }
        }

        // all good
        return true;
    };

    /**
     * Get the current frame number.
     * @return {Number} The current frame number.
     */
    this.getCurrentFrame = function() {
        return currentFrame;
    };

    /**
     * Set the current frame number.
     * @param {Number} The current frame number.
     * @return {Boolean} False if not in bounds
     */
    this.setCurrentFrame = function (frame) {
        // check if possible
        if( frame < 0 || frame >= image.getNumberOfFrames() ) {
            return false;
        }
        // assign
        var oldFrame = currentFrame;
        currentFrame = frame;
        // fire event
        if( oldFrame !== currentFrame && image.getNumberOfFrames() !== 1 ) {
            this.fireEvent({"type": "frame-change", "frame": currentFrame});
            // silent set current position to update info text
            this.setCurrentPosition(this.getCurrentPosition(),true);
        }
        // all good
        return true;
    };

    /**
     * Append another view to this one.
     * @param {Object} rhs The view to append.
     */
    this.append = function( rhs )
    {
       // append images
       var newSLiceNumber = this.getImage().appendSlice( rhs.getImage() );
       // update position if a slice was appended before
       if ( newSLiceNumber <= this.getCurrentPosition().k ) {
           this.setCurrentPosition(
             {"i": this.getCurrentPosition().i,
             "j": this.getCurrentPosition().j,
             "k": this.getCurrentPosition().k + 1}, true );
       }
       // init to update self
       this.setWindowLut(rhs.getWindowLut());
    };

    /**
     * Set the view window/level.
     * @param {Number} center The window center.
     * @param {Number} width The window width.
     * Warning: uses the latest set rescale LUT or the default linear one.
     */
    this.setWindowLevel = function ( center, width )
    {
        // window width shall be >= 1 (see https://www.dabsoft.ch/dicom/3/C.11.2.1.2/)
        if ( width >= 1 ) {
            for ( var key in windowLuts ) {
                windowLuts[key].setCenterAndWidth(center, width);
            }
            this.fireEvent({"type": "wl-change", "wc": center, "ww": width });
        }
    };

    /**
     * Clone the image using all meta data and the original data buffer.
     * @return {View} A full copy of this {dwv.image.View}.
     */
    this.clone = function ()
    {
        var copy = new dwv.image.View(this.getImage());
        for ( var key in windowLuts ) {
            copy.setWindowLut(windowLuts[key]);
        }
        copy.setListeners(this.getListeners());
        return copy;
    };

    /**
     * View listeners
     * @private
     * @type Object
     */
    var listeners = {};
    /**
     * Get the view listeners.
     * @return {Object} The view listeners.
     */
    this.getListeners = function() { return listeners; };
    /**
     * Set the view listeners.
     * @param {Object} list The view listeners.
     */
    this.setListeners = function(list) { listeners = list; };
};

/**
 * Set the image window/level to cover the full data range.
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
 * Generate display image data to be given to a canvas.
 * @param {Array} array The array to fill in.
 * @param {Number} sliceNumber The slice position.
 */
dwv.image.View.prototype.generateImageData = function( array )
{
    var image = this.getImage();
    var windowLut = this.getWindowLut();
    windowLut.update();
    var sliceSize = image.getGeometry().getSize().getSliceSize();
    var sliceOffset = image.getGeometry().getSize().getTotalSize() * this.getCurrentFrame() +
        sliceSize * this.getCurrentPosition().k;

    var index = 0;
    var pxValue = 0;

    var photoInterpretation = image.getPhotometricInterpretation();
    switch (photoInterpretation)
    {
    case "MONOCHROME1":
    case "MONOCHROME2":
        var colourMap = this.getColourMap();
        var iMax = sliceOffset + sliceSize;
        for(var i=sliceOffset; i < iMax; ++i)
        {
            pxValue = parseInt( windowLut.getValue(
                    image.getValueAtOffset(i) ), 10 );
            array.data[index] = colourMap.red[pxValue];
            array.data[index+1] = colourMap.green[pxValue];
            array.data[index+2] = colourMap.blue[pxValue];
            array.data[index+3] = 0xff;
            index += 4;
        }
        break;

    case "RGB":
        // 3 times bigger...
        sliceOffset *= 3;
        // the planar configuration defines the memory layout
        var planarConfig = image.getPlanarConfiguration();
        if( planarConfig !== 0 && planarConfig !== 1 ) {
            throw new Error("Unsupported planar configuration: "+planarConfig);
        }
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

        for(var j=0; j < sliceSize; ++j)
        {
            array.data[index] = parseInt( windowLut.getValue(
                    image.getValueAtOffset(posR) ), 10 );
            array.data[index+1] = parseInt( windowLut.getValue(
                    image.getValueAtOffset(posG) ), 10 );
            array.data[index+2] = parseInt( windowLut.getValue(
                    image.getValueAtOffset(posB) ), 10 );
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
 * @param {String} type The event type.
 * @param {Object} listener The method associated with the provided event type.
 */
dwv.image.View.prototype.addEventListener = function(type, listener)
{
    var listeners = this.getListeners();
    if( !listeners[type] ) {
        listeners[type] = [];
    }
    listeners[type].push(listener);
};

/**
 * Remove an event listener on the view.
 * @param {String} type The event type.
 * @param {Object} listener The method associated with the provided event type.
 */
dwv.image.View.prototype.removeEventListener = function(type, listener)
{
    var listeners = this.getListeners();
    if( !listeners[type] ) {
        return;
    }
    for(var i=0; i < listeners[type].length; ++i)
    {
        if( listeners[type][i] === listener ) {
            listeners[type].splice(i,1);
        }
    }
};

/**
 * Fire an event: call all associated listeners.
 * @param {Object} event The event to fire.
 */
dwv.image.View.prototype.fireEvent = function(event)
{
    var listeners = this.getListeners();
    if( !listeners[event.type] ) {
        return;
    }
    for(var i=0; i < listeners[event.type].length; ++i)
    {
        listeners[event.type][i](event);
    }
};

/**
 * View factory.
 * @constructor
 */
dwv.image.ViewFactory = function () {};

/**
 * Get an View object from the read DICOM file.
 * @param {Object} dicomElements The DICOM tags.
 * @param {Array} pixelBuffer The pixel buffer.
 * @return {View} The new View.
 */
dwv.image.ViewFactory.prototype.create = function (dicomElements, pixelBuffer)
{
    // create the image
    var imageFactory = new dwv.image.ImageFactory();
    var image = imageFactory.create(dicomElements, pixelBuffer);

    // PixelRepresentation
    var isSigned = false;
    var pixelRepresentation = dicomElements.getFromKey("x00280103");
    if ( pixelRepresentation === 1 ) {
        isSigned = true;
    }
    // view
    var view = new dwv.image.View(image, isSigned);
    // presets
    var windowPresets = [];
    // WindowCenter and WindowWidth
    var windowCenter = dicomElements.getFromKey("x00281050", true);
    var windowWidth = dicomElements.getFromKey("x00281051", true);
    if ( windowCenter && windowWidth ) {
        var name;
        for ( var j = 0; j < windowCenter.length; ++j) {
            var width = parseFloat( windowWidth[j], 10 );
            var center = parseFloat( windowCenter[j], 10 );
            if ( width ) {
                name = "Default"+j;
                var windowCenterWidthExplanation = dicomElements.getFromKey("x00281055");
                if ( windowCenterWidthExplanation ) {
                    name = windowCenterWidthExplanation[j];
                }
                windowPresets.push({
                    "center": center,
                    "width": width,
                    "name": name
                });
            }
        }
    }
    if ( windowPresets.length !== 0 ) {
        view.setWindowPresets( windowPresets );
    }
    else {
        view.setWindowLevelMinMax();
    }

    return view;
};
