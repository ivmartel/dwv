// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Scroll class.
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Scroll = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Scroll GUI.
     * @type Object
     */
    var gui = null;
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
        self.started = true;
        // first position
        self.x0 = event._x;
        self.y0 = event._y;
    };

    /**
     * Handle mouse move event.
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!self.started) {
            return;
        }

        // difference to last position
        var diffY = event._y - self.y0;
        // do not trigger for small moves
        if( Math.abs(diffY) < 15 ) {
            return;
        }
        // update GUI
        if( diffY > 0 ) {
            app.getViewController().incrementSliceNb();
        }
        else {
            app.getViewController().decrementSliceNb();
        }
        // reset origin point
        self.x0 = event._x;
        self.y0 = event._y;
    };

    /**
     * Handle mouse up event.
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };

    /**
     * Handle mouse out event.
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
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
     * Handle mouse scroll event (fired by Firefox).
     * @param {Object} event The mouse scroll event.
     */
    this.DOMMouseScroll = function(event){
        // ev.detail on firefox is 3
        if( event.detail < 0 ) {
            app.getViewController().incrementSliceNb();
        }
        else {
            app.getViewController().decrementSliceNb();
        }
    };

    /**
     * Handle mouse wheel event.
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function(event){
        // ev.wheelDelta on chrome is 120
        if( event.wheelDelta > 0 ) {
            app.getViewController().incrementSliceNb();
        }
        else {
            app.getViewController().decrementSliceNb();
        }
    };
    /**
     * Handle key down event.
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };

    /**
     * Setup the tool GUI.
     */
    this.setup = function ()
    {
        gui = new dwv.gui.Scroll(app);
        gui.setup();
    };

    /**
     * Enable the tool.
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        if ( gui ) {
            gui.display(bool);
        }
    };

    /**
     * Initialise the tool.
     */
    this.init = function() {
        if ( app.getNSlicesToLoad() === 1 ) {
            return false;
        }
        return true;
    };

}; // Scroll class

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwv.tool.Scroll.prototype.getHelp = function()
{
    return {
        "title": dwv.i18n("tool.scroll.name"),
        "brief": dwv.i18n("tool.scroll.brief"),
        "mouse": {
            "mouse_drag": dwv.i18n("tool.scroll.mouse_drag")
        },
        "touch": {
            'touch_drag': dwv.i18n("tool.scroll.touch_drag")
        }
    };
};
