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
 * Zoom class.
 * @class Zoom
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Zoom = function(app)
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
        self.started = true;
        // first position
        self.cx = event._x;
        self.cy = event._y;
        self.x0 = event._x;
        self.y0 = event._y;
     };

     /**
      * Handle mouse move event.
      * @method mousemove
      * @param {Object} event The mouse move event.
      */
     this.mousemove = function(event){
        // check start flag
        if( !self.started ) return;
        // calculate translation in Y
        var ty = (event._y - self.y0);
        // zoom
        var step = - ty / 100;
        zoomLayers(step, self.cx, self.cy);
        // reset origin point
        self.x0 = event._x;
        self.y0 = event._y;
    };

    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(event){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
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
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    /**
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        dwv.gui.displayZoomHtml(bool);
    };

    /**
     * Apply the zoom to the layers.
     * @method zoomLayers
     * @param {Number} step The zoom step increment. A good step is of 0.1.
     * @param {Number} cx The zoom center X coordinate.
     * @param {Number} cy The zoom center Y coordinate.
     */ 
    function zoomLayers(step, cx, cy)
    {
        if( app.getImageLayer() ) 
            app.getImageLayer().zoom(step, step, cx, cy);
        if( app.getDrawLayer() ) 
            app.getDrawLayer().zoom(step, step, cx, cy);
    }

}; // Zoom class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Zoom.prototype.getHelp = function()
{
    return {
        'title': "Zoom",
        'brief': "The zoom tool allows to zoom the image.",
        'mouse': {
            'mouse_drag': "A single mouse drag drags the image in the desired direction.",
        },
        'touch': {
            'touch_drag': "A single touch drag drags the image in the desired direction.",
        }
    };
};

/**
 * Initialise the tool.
 * @method init
 */
dwv.tool.Zoom.prototype.init = function() {
    // nothing to do.
};