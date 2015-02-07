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

// Default colour maps.
dwv.tool.colourMaps = {
    "plain": dwv.image.lut.plain,
    "invplain": dwv.image.lut.invPlain,
    "rainbow": dwv.image.lut.rainbow,
    "hot": dwv.image.lut.hot,
    "test": dwv.image.lut.test
};
// Default window level presets.
dwv.tool.defaultpresets = {};
dwv.tool.defaultpresets.CT = {
    "mediastinum": {"center": 40, "width": 400},
    "lung": {"center": -500, "width": 1500},
    "bone": {"center": 500, "width": 2000},
};
dwv.tool.defaultpresets.CTextra = {
    "brain": {"center": 40, "width": 80},
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
     * WindowLevel GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.WindowLevel(app);
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
        app.setCurrentPostion(event._x, event._y);
    };
    
    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        // check start flag
        if( !self.started ) {
            return;
        }
        // difference to last position
        var diffX = event._x - self.x0;
        var diffY = self.y0 - event._y;
        // calculate new window level
        var windowCenter = parseInt(app.getView().getWindowLut().getCenter(), 10) + diffY;
        var windowWidth = parseInt(app.getView().getWindowLut().getWidth(), 10) + diffX;
        // update GUI
        app.getViewController().setWindowLevel(windowCenter,windowWidth);
        // store position
        self.x0 = event._x;
        self.y0 = event._y;
    };
    
    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        // set start flag
        if( self.started ) {
            self.started = false;
            // store the manual preset
            var windowCenter = parseInt(app.getView().getWindowLut().getCenter(), 10);
            var windowWidth = parseInt(app.getView().getWindowLut().getWidth(), 10);
            app.getPresets().manual = {"center": windowCenter, "width": windowWidth};
            // update gui
            gui.initialise();
            // set selected
            dwv.gui.setSelected("presetSelect", "Manual");
        }
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
        self.mousedown(event);
    };
    
    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        self.mousemove(event);
    };
    
    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };
    
    /**
     * Handle double click event.
     * @method dblclick
     * @param {Object} event The double click event.
     */
    this.dblclick = function(event){
        // update GUI
        app.getViewController().setWindowLevel(
            parseInt(app.getImage().getRescaledValue(event._x, event._y, app.getView().getCurrentPosition().k), 10),
            parseInt(app.getView().getWindowLut().getWidth(), 10) );    
    };
    
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        // let the app handle it
        app.onKeydown(event);
    };
    
    /**
     * Setup the tool GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };
    
    /**
     * Display the tool.
     * @method display
     * @param {Boolean} bool The flag to display or not.
     */
    this.display = function (bool)
    {
        if( app.getImage().getPhotometricInterpretation().match(/MONOCHROME/) !== null ) {
            gui.display(bool);
        }
        else {
            gui.display(false);
        }
    };
    
    /**
     * Initialise the tool.
     * @method init
     */
    this.init = function() {
        app.updatePresets(true);
        gui.initialise();
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
        'title': "Window/Level",
        'brief': "Changes the Window and Level of the image.",
        'mouse': {
            'mouse_drag': "A single mouse drag changes the window in the horizontal direction and the level in the vertical one.",
            'double_click': "A double click will center the window and level on the clicked intensity.",
        },
        'touch': {
            'touch_drag': "A single touch drag changes the window in the horizontal direction and the level in the vertical one.",
        }
    };
};
