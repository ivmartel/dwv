/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
/**
 * Namespace for tool functions.
 * @class tool
 * @namespace dwv
 * @static
 */
dwv.tool = dwv.tool || {};

/**
 * Update the views' current position.
 * @method updatePostionValue
 * @static
 * @param {Number} i The column index.
 * @param {Number} j The row index.
 */
dwv.tool.updatePostionValue = function(i,j)
{
    app.getView().setCurrentPosition({"i": i, "j": j, "k": app.getView().getCurrentPosition().k});
};

/**
 * Update the views' windowing data.
 * @method updateWindowingData
 * @static
 * @param {Number} wc The window center.
 * @param {Number} ww The window width.
 */
dwv.tool.updateWindowingData = function(wc,ww)
{
    app.getView().setWindowLevel(wc,ww);
};

/**
 * Update the views' colour map.
 * @method updateColourMap
 * @static
 * @param {Object} colourMap The colour map.
 */
dwv.tool.updateColourMap = function(colourMap)
{
    app.getView().setColorMap(colourMap);
};

// Default colour maps.
dwv.tool.colourMaps = {
    "plain": dwv.image.lut.plain,
    "invplain": dwv.image.lut.invPlain,
    "rainbow": dwv.image.lut.rainbow,
    "hot": dwv.image.lut.hot,
    "test": dwv.image.lut.test
};
// Default window level presets.
dwv.tool.presets = {};
dwv.tool.defaultpresets = {};
dwv.tool.defaultpresets.CT = {
    "abdomen": {"center": 350, "width": 40},
    "lung": {"center": -600, "width": 1500},
    "brain": {"center": 40, "width": 80},
    "bone": {"center": 480, "width": 2500},
    "head": {"center": 90, "width": 350}
};

/**
 * WindowLevel tool: handle window/level related events.
 * @class WindowLevel
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.WindowLevel = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Interaction start flag.
     * @property started
     * @type Boolean
     */
    this.started = false;

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // set start flag
        self.started = true;
        // store initial position
        self.x0 = event._x;
        self.y0 = event._y;
        // update GUI
        dwv.tool.updatePostionValue(event._x, event._y);
    };
    
    /**
     * Handle two touch down event.
     * @method twotouchdown
     * @param {Object} event The touch down event.
     */
    this.twotouchdown = function(event){
        // set start flag
        self.started = true;
        // store initial positions
        self.x0 = event._x;
        self.y0 = event._y;
        self.x1 = event._x1;
        self.y1 = event._y1;
    };
    
    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        // check start flag
        if( !self.started ) return;
        // difference to last position
        var diffX = event._x - self.x0;
        var diffY = self.y0 - event._y;
        // calculate new window level
        var windowCenter = parseInt(app.getView().getWindowLut().getCenter(), 10) + diffY;
        var windowWidth = parseInt(app.getView().getWindowLut().getWidth(), 10) + diffX;
        // update GUI
        dwv.tool.updateWindowingData(windowCenter,windowWidth);
        // store position
        self.x0 = event._x;
        self.y0 = event._y;
    };
    
    /**
     * Handle two touch move event.
     * @method twotouchmove
     * @param {Object} event The touch move event.
     */
    this.twotouchmove = function(event){
        // check start flag
        if( !self.started ) return;
        // difference  to last position
        var diffY = event._y - self.y0;
        // do not trigger for small moves
        if( Math.abs(diffY) < 15 ) return;
        // update GUI
        if( diffY > 0 ) app.getView().incrementSliceNb();
        else app.getView().decrementSliceNb();
        // store position
        self.y0 = event._y;
    };
    
    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(event){
        // set start flag
        if( self.started ) self.started = false;
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        // dispatch to one or two touch handler
        if( event.targetTouches.length === 1 ) self.mousedown(event);
        else if( event.targetTouches.length === 2 ) self.twotouchdown(event);
    };
    
    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        // dispatch to one or two touch handler
        if( event.targetTouches.length === 1 ) self.mousemove(event);
        else if( event.targetTouches.length === 2 ) self.twotouchmove(event);
    };
    
    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    /**
     * Handle double click event.
     * @method dblclick
     * @param {Object} event The double click event.
     */
    this.dblclick = function(event){
        // update GUI
        dwv.tool.updateWindowingData(
            parseInt(app.getImage().getRescaledValue(event._x, event._y, app.getView().getCurrentPosition().k), 10),
            parseInt(app.getView().getWindowLut().getWidth(), 10) );    
    };
    
    /**
     * Handle mouse scroll event (fired by Firefox).
     * @method DOMMouseScroll
     * @param {Object} event The mouse scroll event.
     */
    this.DOMMouseScroll = function(event){
        // update GUI
        if( event.detail > 0 ) app.getView().incrementSliceNb();
        else app.getView().decrementSliceNb();
    };
    
    /**
     * Handle mouse wheel event.
     * @method mousewheel
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function(event){
        // update GUI
        if( event.wheelDelta > 0 ) app.getView().incrementSliceNb();
        else app.getView().decrementSliceNb();
    };
    
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        // let the app handle it
        app.handleKeyDown(event);
    };
    
    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        if( app.getImage().getPhotometricInterpretation().match(/MONOCHROME/) !== null )
        {
            dwv.gui.displayWindowLevelHtml(bool);
        }
    };
    
    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function() {
        this.updatePresets();
        dwv.gui.initWindowLevelHtml();
    };
}; // WindowLevel class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.WindowLevel.prototype.getHelp = function()
{
    return {
        'title': "WindowLevel",
        'brief': "Changes the Window and Level of the image.",
        'mouse': {
            'mouse_drag': "A single mouse drag changes the window in the horizontal direction and the level in the vertical one.",
            'double_click': "A double click will center the window and level on the clicked intensity.",
            'mouse_wheel': "The mouse wheel is used to navigate through slices."
        },
        'touch': {
            'touch_drag': "A single touch drag changes the window in the horizontal direction and the level in the vertical one.",
            'twotouch_drag': "A double finger drag allows to navigate through slices."
        }
    };
};

/**
 * Update the window/level presets.
 * @method updatePresets
 */
dwv.tool.WindowLevel.prototype.updatePresets = function()
{    
    // copy the presets and reinitialize the external one
    // (hoping to control the order of the presets)
    dwv.tool.presets = {};
    // DICOM presets
    var dicomPresets = app.getView().getWindowPresets();
    if( dicomPresets ) {
        for( var i = 0; i < dicomPresets.length; ++i ) {
            dwv.tool.presets[dicomPresets[i].name.toLowerCase()] = dicomPresets[i];
        }
    }
    // min/max preset
    var range = app.getImage().getRescaledDataRange();
    var min = range.min;
    var max = range.max;
    var width = max - min;
    var center = min + width/2;
    dwv.tool.presets["min/max"] = {"center": center, "width": width};
    // re-populate the external array
    var modality = app.getImage().getMeta().Modality;
    for( var key in dwv.tool.defaultpresets[modality] ) {
        dwv.tool.presets[key] = dwv.tool.defaultpresets[modality][key];
    }
};

/**
 * Set the active window/level preset.
 * @method setPreset
 * @param {String} name The name of the preset to set.
 */
dwv.tool.WindowLevel.prototype.setPreset = function(name)
{
    // check if we have it
    if( !dwv.tool.presets[name] )
        throw new Error("Unknown window level preset: '" + name + "'");
    // enable it
    dwv.tool.updateWindowingData( 
        dwv.tool.presets[name].center, 
        dwv.tool.presets[name].width );
};

/**
 * Set the active colour map.
 * @function setColourMap
 * @param {String} name The name of the colour map to set.
 */
dwv.tool.WindowLevel.prototype.setColourMap = function(name)
{
    // check if we have it
    if( !dwv.tool.colourMaps[name] )
        throw new Error("Unknown colour map: '" + name + "'");
    // enable it
    dwv.tool.updateColourMap( dwv.tool.colourMaps[name] );
};
