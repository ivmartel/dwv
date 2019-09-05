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
     * Interaction start flag.
     * @type Boolean
     */
    this.started = false;
    // touch timer ID (created by setTimeout)
    var touchTimerID = null;

    /**
     * Handle mouse down event.
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // stop viewer if playing
        if ( app.getViewController().isPlaying() ) {
            app.getViewController().stop();
        }
        // start flag
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

        // difference to last Y position
        var diffY = event._y - self.y0;
        var yMove = (Math.abs(diffY) > 15);
        // do not trigger for small moves
        if( yMove ) {
            // update view controller
            if( diffY > 0 ) {
                app.getViewController().decrementSliceNb();
            }
            else {
                app.getViewController().incrementSliceNb();
            }
        }

        // difference to last X position
        var diffX = event._x - self.x0;
        var xMove = (Math.abs(diffX) > 15);
        // do not trigger for small moves
        if( xMove ) {
            // update view controller
            if( diffX > 0 ) {
                app.getViewController().incrementFrameNb();
            }
            else {
                app.getViewController().decrementFrameNb();
            }
        }

        // reset origin point
        if (xMove) {
            self.x0 = event._x;
        }
        if (yMove) {
            self.y0 = event._y;
        }
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
        // long touch triggers the dblclick
        touchTimerID = setTimeout(self.dblclick, 500);
        // call mouse equivalent
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        // abort timer if move
        if (touchTimerID !== null) {
            clearTimeout(touchTimerID);
            touchTimerID = null;
        }
        // call mouse equivalent
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        // abort timer
        if (touchTimerID !== null) {
            clearTimeout(touchTimerID);
            touchTimerID = null;
        }
        // call mouse equivalent
        self.mouseup(event);
    };

    /**
     * Handle mouse scroll event (fired by Firefox).
     * @param {Object} event The mouse scroll event.
     */
    this.DOMMouseScroll = function (event) {
        // ev.detail on firefox is 3
        if ( event.detail < 0 ) {
            mouseScroll(true);
        } else {
            mouseScroll(false);
        }
    };

    /**
     * Handle mouse wheel event.
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function (event) {
        // ev.wheelDelta on chrome is 120
        if ( event.wheelDelta > 0 ) {
            mouseScroll(true);
        } else {
            mouseScroll(false);
        }
    };

    /**
     * Mouse scroll action.
     * @param {Boolean} up True to increment, false to decrement.
     */
    function mouseScroll (up) {
        var hasSlices = (app.getImage().getGeometry().getSize().getNumberOfSlices() !== 1);
        var hasFrames = (app.getImage().getNumberOfFrames() !== 1);
        if ( up ) {
            if (hasSlices) {
                app.getViewController().incrementSliceNb();
            } else if (hasFrames) {
                app.getViewController().incrementFrameNb();
            }
        } else {
            if (hasSlices) {
                app.getViewController().decrementSliceNb();
            } else if (hasFrames) {
                app.getViewController().decrementFrameNb();
            }
        }
    }

    /**
     * Handle key down event.
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.onKeydown(event);
    };
    /**
     * Handle double click.
     * @param {Object} event The key down event.
     */
     this.dblclick = function (/*event*/) {
         app.getViewController().play();
     };

    /**
     * Activate the tool.
     * @param {Boolean} bool The flag to activate or not.
     */
    this.activate = function (bool) {
        // does nothing
    };

    /**
     * Initialise the tool.
     */
    this.init = function() {
        // does nothing
    };

}; // Scroll class

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwv.tool.Scroll.prototype.getHelp = function()
{
    return {
        "title": dwv.i18n("tool.Scroll.name"),
        "brief": dwv.i18n("tool.Scroll.brief"),
        "mouse": {
            "mouse_drag": dwv.i18n("tool.Scroll.mouse_drag"),
            "double_click": dwv.i18n("tool.Scroll.double_click")
        },
        "touch": {
            'touch_drag': dwv.i18n("tool.Scroll.touch_drag"),
            'tap_and_hold': dwv.i18n("tool.Scroll.tap_and_hold")
        }
    };
};
