/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
* @fileOverview WindowLevel tool.
*/

/**
 * @function
 */
dwv.tool.updatePostionValue = function(i,j)
{
	app.getView().setCurrentPosition({"i": i, "j": j, "k": app.getView().getCurrentPosition().k});
};

/**
 * @function
 */
dwv.tool.updateWindowingData = function(wc,ww)
{
    app.getView().setWindowLevel(wc,ww);
};

/**
 * @function
 */
dwv.tool.updateColourMap = function(colourMap)    
{    
    app.getView().setColorMap(colourMap);
};

dwv.tool.colourMaps = {
    "plain": dwv.image.lut.plain,
    "invplain": dwv.image.lut.invPlain,
    "rainbow": dwv.image.lut.rainbow,
    "hot": dwv.image.lut.hot,
    "test": dwv.image.lut.test
};

dwv.tool.presets = {
        "abdomen": {"center": 350, "width": 40},
        "lung": {"center": -600, "width": 1500},
        "brain": {"center": 40, "width": 80},
        "bone": {"center": 480, "width": 2500},
        "head": {"center": 90, "width": 350}
    };

/**
 * @class WindowLevel class.
 */
dwv.tool.WindowLevel = function(app)
{
    var self = this;
    this.started = false;
    this.displayed = false;
    this.updatePresets();

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        self.x0 = ev._x;
        self.y0 = ev._y;
        dwv.tool.updatePostionValue(ev._x, ev._y);
    };
    
    this.twotouchdown = function(ev){
        self.started = true;
        self.x0 = ev._x;
    };
    
    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }

        var diffX = ev._x - self.x0;
        var diffY = self.y0 - ev._y;                                
        var windowCenter = parseInt(app.getView().getWindowLut().getCenter(), 10) + diffY;
        var windowWidth = parseInt(app.getView().getWindowLut().getWidth(), 10) + diffX;                        
        
        dwv.tool.updateWindowingData(windowCenter,windowWidth);    
        
        self.x0 = ev._x;             
        self.y0 = ev._y;
    };

    this.twotouchmove = function(ev){
        if (!self.started)
        {
            return;
        }
        var diffX = ev._x - self.x0;
        // do not trigger for small moves
        if( Math.abs(diffX) < 10 ) return;
    	if( diffX > 0 ) app.getView().incrementSliceNb();
    	else app.getView().decrementSliceNb();
    };
    
    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            self.started = false;
        }
    };
    
    this.mouseout = function(ev){
        self.mouseup(ev);
    };

    this.touchstart = function(ev){
        if( event.targetTouches.length === 1 ){
            self.mousedown(ev);
        }
        else if( event.targetTouches.length === 2 ){
            self.twotouchdown(ev);
        }
    };

    this.touchmove = function(ev){
        if( event.targetTouches.length === 1 ){
            self.mousemove(ev);
        }
        else if( event.targetTouches.length === 2 ){
            self.twotouchmove(ev);
        }
    };

    this.touchend = function(ev){
        self.mouseup(ev);
    };

    this.dblclick = function(ev){
        dwv.tool.updateWindowingData(
                parseInt(app.getImage().getRescaledValue(ev._x, ev._y), 10),
                parseInt(app.getView().getWindowLut().getWidth(), 10) );    
    };
    
    // This is called when you use the mouse wheel on Firefox.
    this.DOMMouseScroll = function(ev){
    	if( ev.detail > 0 ) app.getView().incrementSliceNb();
    	else app.getView().decrementSliceNb();
    };

    // This is called when you use the mouse wheel.
    this.mousewheel = function(ev){
    	if( ev.wheelDelta > 0 ) app.getView().incrementSliceNb();
    	else app.getView().decrementSliceNb();
    };
    
    this.enable = function(bool){
        if( bool ) {
            dwv.gui.appendWindowLevelHtml();
        }
        else {
            dwv.gui.clearWindowLevelHtml();
        }
    };

    this.keydown = function(event){
        app.handleKeyDown(event);
    };

}; // WindowLevel class

dwv.tool.WindowLevel.prototype.updatePresets = function()
{    
    // copy the presets and reinitialize the external one
	// (hoping to control the order of the presets)
	var presets = dwv.tool.presets;
    dwv.tool.presets = {};
	// DICOM presets
    var dicomPresets = app.getView().getWindowPresets();
    if( dicomPresets )
    {
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
    for( var key in presets ) {
    	dwv.tool.presets[key] = presets[key];
    }
};

/**
 * @function
 */
dwv.tool.WindowLevel.prototype.setPreset = function(name)
{    
    // check if we have it
    if( !dwv.tool.presets[name] )
    {
        throw new Error("Unknown window level preset: '" + name + "'");
    }
    // enable it
    dwv.tool.updateWindowingData(
    		dwv.tool.presets[name].center, 
    		dwv.tool.presets[name].width );
};

/**
 * @function
 */
dwv.tool.WindowLevel.prototype.setColourMap = function(name)
{    
    // check if we have it
    if( !dwv.tool.colourMaps[name] )
    {
        throw new Error("Unknown colour map: '" + name + "'");
    }
    // enable it
    dwv.tool.updateColourMap( dwv.tool.colourMaps[name] );
};

// Add the tool to the list
dwv.tool.tools["windowlevel"] = dwv.tool.WindowLevel;
