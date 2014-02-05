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
 * Navigate class.
 * @class Navigate
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Navigate = function(app)
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
      * Handle two touch down event.
      * @method twotouchdown
      * @param {Object} event The touch down event.
      */
     this.twotouchdown = function(event){
         self.started = true;
         // store first point
         self.x0 = event._x;
         self.y0 = event._y;
         // first line
         var point0 = new dwv.math.Point2D(event._x, event._y);
         var point1 = new dwv.math.Point2D(event._x1, event._y1);
         self.line0 = new dwv.math.Line(point0, point1);
         self.midPoint = self.line0.getMidpoint();         
     };

     /**
      * Handle mouse move event.
      * @method mousemove
      * @param {Object} event The mouse move event.
      */
     this.mousemove = function(event){
        if (!self.started)
        {
            return;
        }

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
     * Handle two touch move event.
     * @method twotouchmove
     * @param {Object} event The touch move event.
     */
    this.twotouchmove = function(event){
       if (!self.started)
       {
           return;
       }
       var point0 = new dwv.math.Point2D(event._x, event._y);
       var point1 = new dwv.math.Point2D(event._x1, event._y1);
       var newLine = new dwv.math.Line(point0, point1);
       var lineRatio = newLine.getLength() / self.line0.getLength();
       
       if( lineRatio === 1 )
       {
           // scroll mode
           // difference  to last position
           var diffY = event._y - self.y0;
           // do not trigger for small moves
           if( Math.abs(diffY) < 15 ) return;
           // update GUI
           if( diffY > 0 ) app.getView().incrementSliceNb();
           else app.getView().decrementSliceNb();
       }
       else
       {
           // zoom mode
           var zoom = (lineRatio - 1) / 2;
           if( Math.abs(zoom) % 0.1 <= 0.05 )
               zoomLayers(zoom, self.midPoint.getX(), self.midPoint.getY());
       }
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
        var touches = event.targetTouches;
        if( touches.length === 1 ){
            self.mousedown(event);
        }
        else if( touches.length === 2 ){
            self.twotouchdown(event);
        }
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        var touches = event.targetTouches;
        if( touches.length === 1 ){
            self.mousemove(event);
        }
        else if( touches.length === 2 ){
            self.twotouchmove(event);
        }
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
     * Handle mouse scroll event (fired by Firefox).
     * @method DOMMouseScroll
     * @param {Object} event The mouse scroll event.
     */
    this.DOMMouseScroll = function(event){
        // ev.detail on firefox is 3
        var step = event.detail/30;
        zoomLayers(step, event._x, event._y);
        
        // TODO slice scroll
        //if( event.detail > 0 ) app.getView().incrementSliceNb();
        //else app.getView().decrementSliceNb();
    };

    /**
     * Handle mouse wheel event.
     * @method mousewheel
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function(event){
        // ev.wheelDelta on chrome is 120
        var step = event.wheelDelta/1200;
        zoomLayers(step, event._x, event._y);
        
        // TODO slice scroll
        //if( event.wheelDelta > 0 ) app.getView().incrementSliceNb();
        //else app.getView().decrementSliceNb();
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
        dwv.gui.displayNavigateHtml(bool);
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
dwv.tool.Navigate.prototype.getHelp = function()
{
    return {
        'title': "Navigate",
        'brief': "The navigate tool allows to zoom and drag the image.",
        'mouse': {
            'mouse_drag': "A single mouse drag drags the image in the desired direction.",
            'mouse_wheel': "The mouse wheel is used to zoom the image."
        },
        'touch': {
            'touch_drag': "A single touch drag drags the image in the desired direction.",
            'twotouch_pinch': "A pinch or spread allows to zoom the image."
        }
    };
};

/**
 * Initialise the tool.
 * @method init
 */
dwv.tool.Navigate.prototype.init = function() {
    // nothing to do.
};