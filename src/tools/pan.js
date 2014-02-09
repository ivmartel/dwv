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
 * Pan class.
 * @class Pan
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Pan = function(app)
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
        self.x0 = event._x;
        self.y0 = event._y;
     };

     /**
      * Handle mouse move event.
      * @method mousemove
      * @param {Object} event The mouse move event.
      */
     this.mousemove = function(event){
        if (!self.started) return;

        // calculate translation
        var tx = (event._x - self.x0);
        var ty = (event._y - self.y0);
        // apply translation
        translateLayers(tx, ty);
        
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
        dwv.gui.displayPanHtml(bool);
    };

    /**
     * Apply a translation to the layers.
     * @method translateLayers
     * @param {Number} tx The translation along X.
     * @param {Number} ty The translation along Y.
     */ 
    function translateLayers(tx, ty)
    {
        if( app.getImageLayer() ) 
            app.getImageLayer().translate(tx, ty);
        if( app.getDrawLayer() ) 
            app.getDrawLayer().translate(tx, ty);
    }

}; // Navigate class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Pan.prototype.getHelp = function()
{
    return {
        'title': "Pan",
        'brief': "The pan tool allows to drag the image.",
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
dwv.tool.Pan.prototype.init = function() {
    // nothing to do.
};