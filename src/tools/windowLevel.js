//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
* @fileOverview WindowLevel tool.
*/

/**
 * @function Update the views' current position.
 */
dwv.tool.updatePostionValue = function(i,j)
{
    app.getView().setCurrentPosition({"i": i, "j": j, "k": app.getView().getCurrentPosition().k});
};

/**
 * @function Update the views' windowing data
 */
dwv.tool.updateWindowingData = function(wc,ww)
{
    app.getView().setWindowLevel(wc,ww);
};

/**
 * @function Update the views' colour map.
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
 * @class WindowLevel tool: handle window/level related events.
 */
dwv.tool.WindowLevel = function(app)
{
    // Closure to self: to be used by event handlers.
    var self = this;
    // Interaction start flag.
    this.started = false;
    // Initialise presets.
    this.updatePresets();
    
    // Called on mouse down event.
    this.mousedown = function(event){
        // set start flag
        self.started = true;
        // store initial position
        self.x0 = event._x;
        self.y0 = event._y;
        // update GUI
        dwv.tool.updatePostionValue(event._x, event._y);
    };
    
    // Called on touch start event with two fingers.
    this.twotouchdown = function(event){
        // set start flag
        self.started = true;
        // store initial positions
        self.x0 = event._x;
        self.y0 = event._y;
        self.x1 = event._x1;
        self.y1 = event._y1;
    };
    
    // Called on mouse move event.
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
    
    // Called on touch move event with two fingers.
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
    
    // Called on mouse up event.
    this.mouseup = function(event){
        // set start flag
        if( self.started ) self.started = false;
    };
    
    // Called on mouse out event.
    this.mouseout = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    // Called on touch start event.
    this.touchstart = function(event){
        // dispatch to one or two touch handler
        if( event.targetTouches.length === 1 ) self.mousedown(event);
        else if( event.targetTouches.length === 2 ) self.twotouchdown(event);
    };
    
    // Called on touch move event.
    this.touchmove = function(event){
        // dispatch to one or two touch handler
        if( event.targetTouches.length === 1 ) self.mousemove(event);
        else if( event.targetTouches.length === 2 ) self.twotouchmove(event);
    };
    
    // Called on touch end event.
    this.touchend = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    // Called on double click event.
    this.dblclick = function(event){
        // update GUI
        dwv.tool.updateWindowingData(
            parseInt(app.getImage().getRescaledValue(event._x, event._y, app.getView().getCurrentPosition().k), 10),
            parseInt(app.getView().getWindowLut().getWidth(), 10) );    
    };
    
    // Called on mouse (wheel) scroll event on Firefox.
    this.DOMMouseScroll = function(event){
        // update GUI
        if( event.detail > 0 ) app.getView().incrementSliceNb();
        else app.getView().decrementSliceNb();
    };
    
    // Called on mouse wheel event.
    this.mousewheel = function(event){
        // update GUI
        if( event.wheelDelta > 0 ) app.getView().incrementSliceNb();
        else app.getView().decrementSliceNb();
    };
    
    // Called on key down event.
    this.keydown = function(event){
        // let the app handle it
        app.handleKeyDown(event);
    };
    
    // Enable the tool: prepare HTML for it.
    this.enable = function(bool){
        // update GUI
        if( bool ) dwv.gui.appendWindowLevelHtml();
        else dwv.gui.clearWindowLevelHtml();
    };
    
}; // WindowLevel class

/**
 * @function Update the window/level presets.
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
 * @function Set the window/level presets.
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
 * @function Set the colour map.
 */
dwv.tool.WindowLevel.prototype.setColourMap = function(name)
{
    // check if we have it
    if( !dwv.tool.colourMaps[name] )
        throw new Error("Unknown colour map: '" + name + "'");
    // enable it
    dwv.tool.updateColourMap( dwv.tool.colourMaps[name] );
};

//Tool list
dwv.tool.tools = dwv.tool.tools || {};
//Add the tool to the list
dwv.tool.tools.windowlevel = dwv.tool.WindowLevel;
