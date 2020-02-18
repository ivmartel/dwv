// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * WindowLevel tool: handle window/level related events.
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.WindowLevel = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Interaction start flag.
     * @type Boolean
     */
    this.started = false;

    /**
     * Handle mouse down event.
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // set start flag
        self.started = true;
        // store initial position
        self.x0 = event._x;
        self.y0 = event._y;
        // update view controller
        app.getViewController().setCurrentPosition2D(event._x, event._y);
    };

    /**
     * Handle mouse move event.
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
        var windowCenter = parseInt(app.getViewController().getWindowLevel().center, 10) + diffY;
        var windowWidth = parseInt(app.getViewController().getWindowLevel().width, 10) + diffX;

        // add the manual preset to the view
        app.getViewController().addWindowLevelPresets( { "manual": {
            "wl": new dwv.image.WindowLevel(windowCenter, windowWidth),
            "name": "manual"} } );
        app.getViewController().setWindowLevelPreset("manual");

        // store position
        self.x0 = event._x;
        self.y0 = event._y;
    };

    /**
     * Handle mouse up event.
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        // set start flag
        if( self.started ) {
            self.started = false;
        }
    };

    /**
     * Handle mouse out event.
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        // treat as mouse up
        self.mouseup(event);
    };

    /**
     * Handle touch start event.
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        self.mouseup(event);
    };

    /**
     * Handle double click event.
     * @param {Object} event The double click event.
     */
    this.dblclick = function(event){
        // update view controller
        app.getViewController().setWindowLevel(
            parseInt(app.getImage().getRescaledValue(
                event._x, event._y, app.getViewController().getCurrentPosition().k), 10),
            parseInt(app.getViewController().getWindowLevel().width, 10) );
    };

    /**
     * Handle key down event.
     * @param {Object} event The key down event.
     */
    this.keydown = function (event) {
        event.context = "dwv.tool.WindowLevel";
        app.onKeydown(event);
    };

    /**
     * Activate the tool.
     * @param {Boolean} bool The flag to activate or not.
     */
    this.activate = function (/*bool*/) {
        // does nothing
    };

    /**
     * Initialise the tool.
     */
    this.init = function() {
        // does nothing
    };

}; // WindowLevel class

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwv.tool.WindowLevel.prototype.getHelpKeys = function()
{
    return {
        "title": "tool.WindowLevel.name",
        "brief": "tool.WindowLevel.brief",
        "mouse": {
            "mouse_drag": "tool.WindowLevel.mouse_drag",
            "double_click": "tool.WindowLevel.double_click"
        },
        "touch": {
            "touch_drag": "tool.WindowLevel.touch_drag"
        }
    };
};
