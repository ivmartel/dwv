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
 * Reset the application zoom.
 * @method zoomReset
 * @static
 */
dwv.tool.zoomReset = function(event)
{
    app.getImageLayer().resetLayout();
    app.getImageLayer().draw();
    app.getDrawLayer().resetLayout();
    app.getDrawLayer().draw();
};

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
    this.mousedown = function(ev){
        self.started = true;
        // first position
        self.x0 = ev._x;
        self.y0 = ev._y;
     };

     /**
      * Handle two touch down event.
      * @method twotouchdown
      * @param {Object} event The touch down event.
      */
     this.twotouchdown = function(ev){
         self.started = true;
         // first line
         var point0 = new dwv.math.Point2D(ev._x, ev._y);
         var point1 = new dwv.math.Point2D(ev._x1, ev._y1);
         self.line0 = new dwv.math.Line(point0, point1);
         self.midPoint = self.line0.getMidpoint();         
     };

     /**
      * Handle mouse move event.
      * @method mousemove
      * @param {Object} event The mouse move event.
      */
     this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }

        // calculate translation
        var tx = (ev._x - self.x0);
        var ty = (ev._y - self.y0);
        // apply translation
        app.getImageLayer().translate(tx,ty);
        app.getDrawLayer().translate(tx,ty);
        
        // reset origin point
        self.x0 = ev._x;
        self.y0 = ev._y;
    };

    /**
     * Handle two touch move event.
     * @method twotouchmove
     * @param {Object} event The touch move event.
     */
    this.twotouchmove = function(ev){
       if (!self.started)
       {
           return;
       }
       var point0 = new dwv.math.Point2D(ev._x, ev._y);
       var point1 = new dwv.math.Point2D(ev._x1, ev._y1);
       var newLine = new dwv.math.Line(point0, point1);
       var lineRatio = newLine.getLength() / self.line0.getLength();
       
       var zoom = (lineRatio - 1) / 2;
       if( Math.abs(zoom) % 0.1 <= 0.05 )
           zoomLayers(zoom, self.midPoint.getX(), self.midPoint.getY());
    };
    
    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(ev){
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
    this.mouseout = function(ev){
        self.mouseup(ev);
    };

    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(ev){
        if( event.targetTouches.length === 1 ){
            self.mousedown(ev);
        }
        else if( event.targetTouches.length === 2 ){
            self.twotouchdown(ev);
        }
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(ev){
        if( event.targetTouches.length === 1 ){
            self.mousemove(ev);
        }
        else if( event.targetTouches.length === 2 ){
            self.twotouchmove(ev);
        }
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(ev){
        self.mouseup(ev);
    };

    /**
     * Handle mouse scroll event (fired by Firefox).
     * @method DOMMouseScroll
     * @param {Object} event The mouse scroll event.
     */
    this.DOMMouseScroll = function(ev){
        // ev.detail on firefox is 3
        var step = ev.detail/30;
        zoomLayers(step, ev._x, ev._y);
    };

    /**
     * Handle mouse wheel event.
     * @method mousewheel
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function(ev){
        // ev.wheelDelta on chrome is 120
        var step = ev.wheelDelta/1200;
        zoomLayers(step, ev._x, ev._y);
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
    this.enable = function(bool){
        if( bool ) { 
            dwv.gui.appendZoomHtml();
        }
        else { 
            dwv.gui.clearZoomHtml();
        }
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
        app.setLayersZoom(step,step,cx,cy);
    }

}; // Zoom class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Zoom.getHelp = function()
{
    return {
        'title': "Zoom",
        'brief': "This is the help of the Zoom tool."
    };
};

// Add the tool to the tool list
dwv.tool.tools = dwv.tool.tools || {};
dwv.tool.tools.zoom = dwv.tool.Zoom;
