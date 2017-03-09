// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * WindowLevel class.
 * References:
 * - DICOM [Window Center and Window Width]{@link http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.11.html#sect_C.11.2.1.2}
 * Pseudo-code:
 *  if (x <= c - 0.5 - (w-1)/2), then y = ymin
 *  else if (x > c - 0.5 + (w-1)/2), then y = ymax,
 *  else y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin) + ymin
 */
dwv.image.WindowLevel = function (center, width)
{
    // avoid zero width
    if ( width === 0 ) {
        throw new Error("A window level with a width of zero is not possible.");
    }

    /**
     * Output value minimum.
     * @private
     * @type Number
     */
    var ymin = 0;
    /**
     * Output value maximum.
     * @private
     * @type Number
     */
    var ymax = 255;

    /**
     * Input value minimum (calculated).
     * @private
     * @type Number
     */
    var xmin = null;
    /**
     * Input value maximum (calculated).
     * @private
     * @type Number
     */
    var xmax = null;
    /**
     * Window level equation slope (calculated).
     * @private
     * @type Number
     */
    var slope = null;
    /**
     * Window level equation intercept (calculated).
     * @private
     * @type Number
     */
    var inter = null;

    /**
     * Initialise members.
     */
    function init() {
        // from the standard
        xmin = center - 0.5 - ( (width-1) / 2 );
        xmax = center - 0.5 + ( (width-1) / 2 );
        // develop the equation:
        // y = ( ( x - (c - 0.5) ) / (w-1) + 0.5 ) * (ymax - ymin) + ymin
        // y = ( x / (w-1) ) * (ymax - ymin) + ( -(c - 0.5) / (w-1) + 0.5 ) * (ymax - ymin) + ymin
        slope = (ymax - ymin) / (width-1);
        inter = ( -(center - 0.5) / (width-1) + 0.5 ) * (ymax - ymin) + ymin;
    }

    // call init
    init();

    /**
     * Get the window center.
     * @return {Number} The window center.
     */
    this.getCenter = function () { return center; };
    /**
     * Get the window width.
     * @return {Number} The window width.
     */
    this.getWidth = function () { return width; };

    /**
     * Set the output value range.
     * @param {Number} min The output value minimum.
     * @param {Number} max The output value maximum.
     */
    this.setRange = function (min, max) {
        ymin = parseInt( min, 10 );
        ymax = parseInt( max, 10 ) ;
        // re-initialise
        init();
    };
    /**
     * Set the signed offset.
     * @param {Number} The signed data offset, typically: slope * ( size / 2).
     */
    this.addSignedOffset = function (offset) {
        center += offset;
        // re-initialise
        init();
    };

    /**
     * Apply the window level on an input value.
     * @param {Number} The value to rescale as an integer.
     * @return {Number} The leveled value, in the
     *  [ymin, ymax] range (default [0,255]).
     */
    this.apply = function (value)
    {
        if ( value <= xmin ) {
            return ymin;
        } else if ( value > xmax ) {
            return ymax;
        } else {
            return parseInt( ((value * slope) + inter), 10);
        }
    };

};

/**
 * Check for window level equality.
 * @param {Object} rhs The other window level to compare to.
 * @return {Boolean} True if both window level are equal.
 */
dwv.image.WindowLevel.prototype.equals = function (rhs) {
    return rhs !== null &&
        this.getCenter() === rhs.getCenter() &&
        this.getWidth() === rhs.getWidth();
};

/**
 * Get a string representation of the window level.
 * @return {String} The window level as a string.
 */
dwv.image.WindowLevel.prototype.toString = function () {
    return (this.getCenter() + ", " + this.getWidth());
};

/**
 * View class.
 * @constructor
 * @param {Image} image The associated image.
 * Need to set the window lookup table once created
 * (either directly or with helper methods).
 */
dwv.image.View = function (image)
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
     * Current window preset name.
     * @private
     * @type String
     */
    var currentPresetName = null;

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
     * Warning: can be undefined in no window/level was set.
     * @return {Window} The window LUT of the image.
     */
    this.getCurrentWindowLut = function (rsi) {
        var sliceNumber = this.getCurrentPosition().k;
        // use current rsi if not provided
        if ( typeof rsi === "undefined" ) {
            rsi = image.getRescaleSlopeAndIntercept(sliceNumber);
        }
        // get the lut
        var wlut = windowLuts[ rsi.toString() ];
        // special case for 'perslice' presets
        if (currentPresetName &&
            typeof windowPresets[currentPresetName].perslice !== "undefined" &&
            windowPresets[currentPresetName].perslice === true ) {
            // get the preset for this slice
            var wl = windowPresets[currentPresetName].wl[sliceNumber];
            // apply it if different from previous
            if (!wlut.getWindowLevel().equals(wl)) {
                // set slice window level
                wlut.setWindowLevel(wl);
                // update InfoController window/level by firing special event
                this.fireEvent({"type": "wl-change",
                    "wc": wl.getCenter(), "ww": wl.getWidth(),
                    "skipGenerate": true});
            }
        }
        // update in case of wl change
        wlut.update();
        // return
        return wlut;
    };
    /**
     * Add the window LUT to the list.
     * @param {Window} wlut The window LUT of the image.
     */
    this.addWindowLut = function (wlut)
    {
        var rsi = wlut.getRescaleLut().getRSI();
        windowLuts[rsi.toString()] = wlut;
    };

    /**
     * Get the window presets.
     * @return {Object} The window presets.
     */
    this.getWindowPresets = function () {
        return windowPresets;
    };

    /**
     * Get the window presets names.
     * @return {Object} The list of window presets names.
     */
    this.getWindowPresetsNames = function () {
        return Object.keys(windowPresets);
    };

    /**
     * Set the window presets.
     * @param {Object} presets The window presets.
     */
    this.setWindowPresets = function (presets) {
        windowPresets = presets;
    };
    /**
     * Add window presets to the existing ones.
     * @param {Object} presets The window presets.
     * @param {Number} k The slice the preset belong to.
     */
    this.addWindowPresets = function (presets, k) {
        var keys = Object.keys(presets);
        var key = null;
        for (var i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (typeof windowPresets[key] !== "undefined") {
                if (typeof windowPresets[key].perslice !== "undefined" &&
                    windowPresets[key].perslice === true) {
                    // use first new preset wl...
                    windowPresets[key].wl.splice(k, 0, presets[key].wl[0]);
                } else {
                    windowPresets[key] = presets[key];
                }
            } else {
                // add new
                windowPresets[key] = presets[key];
            }
        }
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
           "wc": this.getCurrentWindowLut().getWindowLevel().getCenter(),
           "ww": this.getCurrentWindowLut().getWindowLevel().getWidth() });
    };

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
       var newSliceNumber = this.getImage().appendSlice( rhs.getImage() );
       // update position if a slice was appended before
       if ( newSliceNumber <= this.getCurrentPosition().k ) {
           this.setCurrentPosition(
             {"i": this.getCurrentPosition().i,
             "j": this.getCurrentPosition().j,
             "k": this.getCurrentPosition().k + 1}, true );
       }
       // add window presets
       this.addWindowPresets( rhs.getWindowPresets(), newSliceNumber );
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
            var wl = new dwv.image.WindowLevel(center, width);
            var keys = Object.keys(windowLuts);

            // create the first lut if none exists
            if (keys.length === 0) {
                // create the rescale lookup table
                var rescaleLut = new dwv.image.lut.Rescale(
                    image.getRescaleSlopeAndIntercept(0), image.getMeta().BitsStored );
                // create the window lookup table
                var windowLut = new dwv.image.lut.Window(rescaleLut, image.getMeta().IsSigned);
                this.addWindowLut(windowLut);
            }

            // set window level on luts
            for ( var key in windowLuts ) {
                windowLuts[key].setWindowLevel(wl);
            }

            // fire window level change event
            this.fireEvent({"type": "wl-change", "wc": center, "ww": width });
        }
    };

    /**
     * Set the window level to the preset with the input name.
     * @param {String} name The name of the preset to activate.
     */
    this.setWindowLevelPreset = function (name) {
        var preset = this.getWindowPresets()[name];
        if ( typeof preset === "undefined" ) {
            throw new Error("Unknown window level preset: '" + name + "'");
        }
        // update member preset name
        currentPresetName = name;
        // special 'perslice' case
        if (typeof preset.perslice !== "undefined" &&
            preset.perslice === true) {
            preset = { "wl": preset.wl[this.getCurrentPosition().k] };
        }
        this.setWindowLevel( preset.wl.getCenter(), preset.wl.getWidth() );
    };

    /**
     * Set the window level to the preset with the input id.
     * @param {Number} id The id of the preset to activate.
     */
    this.setWindowLevelPresetById = function (id) {
        var keys = Object.keys(this.getWindowPresets());
        this.setWindowLevelPreset( keys[id] );
    };

    /**
     * Clone the image using all meta data and the original data buffer.
     * @return {View} A full copy of this {dwv.image.View}.
     */
    this.clone = function ()
    {
        var copy = new dwv.image.View(this.getImage());
        for ( var key in windowLuts ) {
            copy.addWindowLut(windowLuts[key]);
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
 * Get the image window/level that covers the full data range.
 * Warning: uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.getWindowLevelMinMax = function ()
{
    var range = this.getImage().getRescaledDataRange();
    var min = range.min;
    var max = range.max;
    var width = max - min;
    var center = min + width/2;
    return new dwv.image.WindowLevel(center, width);
};

/**
 * Set the image window/level to cover the full data range.
 * Warning: uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.setWindowLevelMinMax = function()
{
    // calculate center and width
    var wl = this.getWindowLevelMinMax();
    // set window level
    this.setWindowLevel(wl.getCenter(), wl.getWidth());
};

/**
 * Generate display image data to be given to a canvas.
 * @param {Array} array The array to fill in.
 */
dwv.image.View.prototype.generateImageData = function( array )
{
    var windowLut = this.getCurrentWindowLut();

    var image = this.getImage();
    var sliceSize = image.getGeometry().getSize().getSliceSize();
    var sliceOffset = sliceSize * this.getCurrentPosition().k;
    var frame = (this.getCurrentFrame()) ? this.getCurrentFrame() : 0;

    var index = 0;
    var pxValue = 0;
    var stepPos = 0;

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
                    image.getValueAtOffset(i, frame) ), 10 );
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
        stepPos = 3;
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
                    image.getValueAtOffset(posR, frame) ), 10 );
            array.data[index+1] = parseInt( windowLut.getValue(
                    image.getValueAtOffset(posG, frame) ), 10 );
            array.data[index+2] = parseInt( windowLut.getValue(
                    image.getValueAtOffset(posB, frame) ), 10 );
            array.data[index+3] = 0xff;
            index += 4;

            posR += stepPos;
            posG += stepPos;
            posB += stepPos;
        }
        break;

    case "YBR_FULL_422":
        // theory:
        // http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.7.html#sect_C.7.6.3.1.2
        // reverse equation:
        // https://en.wikipedia.org/wiki/YCbCr#JPEG_conversion

        // 3 times bigger...
        sliceOffset *= 3;
        // the planar configuration defines the memory layout
        var planarConfigYBR = image.getPlanarConfiguration();
        if( planarConfigYBR !== 0 && planarConfigYBR !== 1 ) {
            throw new Error("Unsupported planar configuration: "+planarConfigYBR);
        }
        // default: YBRYBRYBR...
        var posY = sliceOffset;
        var posCB = sliceOffset + 1;
        var posCR = sliceOffset + 2;
        stepPos = 3;
        // YYYY...BBBB...RRRR...
        if (planarConfigYBR === 1) {
            posY = sliceOffset;
            posCB = sliceOffset + sliceSize;
            posCR = sliceOffset + 2 * sliceSize;
            stepPos = 1;
        }

        var y, cb, cr;
        var r, g, b;
        for (var k=0; k < sliceSize; ++k)
        {
            y = image.getValueAtOffset(posY, frame);
            cb = image.getValueAtOffset(posCB, frame);
            cr = image.getValueAtOffset(posCR, frame);

            r = y + 1.402 * (cr - 128);
            g = y - 0.34414 * (cb - 128) - 0.71414 * (cr - 128);
            b = y + 1.772 * (cb - 128);

            array.data[index] = parseInt( windowLut.getValue(r), 10 );
            array.data[index+1] = parseInt( windowLut.getValue(g), 10 );
            array.data[index+2] = parseInt( windowLut.getValue(b), 10 );
            array.data[index+3] = 0xff;
            index += 4;

            posY += stepPos;
            posCB += stepPos;
            posCR += stepPos;
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
 * @param {Object} image The associated image.
 * @return {View} The new View.
 */
dwv.image.ViewFactory.prototype.create = function (dicomElements, image)
{
    // view
    var view = new dwv.image.View(image);

    // presets
    var windowPresets = {};

    // DICOM presets
    var windowCenter = dicomElements.getFromKey("x00281050", true);
    var windowWidth = dicomElements.getFromKey("x00281051", true);
    var windowCWExplanation = dicomElements.getFromKey("x00281055", true);
    if ( windowCenter && windowWidth ) {
        var name;
        for ( var j = 0; j < windowCenter.length; ++j) {
            var center = parseFloat( windowCenter[j], 10 );
            var width = parseFloat( windowWidth[j], 10 );
            if ( center && width ) {
                name = "Default"+j;
                if ( windowCWExplanation ) {
                    name = dwv.dicom.cleanString(windowCWExplanation[j]);
                }
                windowPresets[name] = {
                    "wl": [new dwv.image.WindowLevel(center, width)],
                    "name": name,
                    "perslice": true};
            }
        }
    }

    // min/max
    windowPresets.minmax = {
        "wl": [view.getWindowLevelMinMax()],
        "name": "minmax",
        "perslice": true };

    // optional modality presets
    if ( typeof dwv.tool.defaultpresets !== "undefined" ) {
        var modality = image.getMeta().Modality;
        for( var key in dwv.tool.defaultpresets[modality] ) {
            var preset = dwv.tool.defaultpresets[modality][key];
            windowPresets[key] = {
                "wl": new dwv.image.WindowLevel(preset.center, preset.width),
                "name": key};
        }
    }

    // store
    view.setWindowPresets( windowPresets );

    return view;
};
