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
 * ZoomAndPan class.
 * @class ZoomAndPan
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.ZoomAndPan = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @property self
     * @private
     * @type Object
     */
    var self = this;
    /**
     * ZoomAndPan GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.ZoomAndPan(app);
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
        self.x0 = event._xs;
        self.y0 = event._ys;
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
        var tx = event._xs - self.x0;
        var ty = event._ys - self.y0;
        // apply translation
        translateLayers(tx, ty);
        // reset origin point
        self.x0 = event._xs;
        self.y0 = event._ys;
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
            if( Math.abs(diffY) < 15 ) {
                return;
            }
            // update GUI
            if( diffY > 0 ) {
                app.getView().incrementSliceNb();
            }
            else {
                app.getView().decrementSliceNb();
            }
        }
        else
        {
            // zoom mode
            var zoom = (lineRatio - 1) / 2;
            if( Math.abs(zoom) % 0.1 <= 0.05 ) {
                zoomLayers(zoom, self.midPoint.getX(), self.midPoint.getY(),event._xs, event._ys);
            }
        }
    };
    
    /**
     * Handle mouse up event.
     * @method mouseup
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
        var step = - event.detail / 30;
        zoomLayers(step, event._x, event._y, event._xs, event._ys);
    };

    /**
     * Handle mouse wheel event.
     * @method mousewheel
     * @param {Object} event The mouse wheel event.
     */
    this.mousewheel = function(event){
        // ev.wheelDelta on chrome is 120
        var step = event.wheelDelta / 1200;
        zoomLayers(step, event._x, event._y, event._xs, event._ys);
    };
    
    /**
     * Handle key down event.
     * @method keydown
     * @param {Object} event The key down event.
     */
    this.keydown = function(event){
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
     * Enable the tool.
     * @method enable
     * @param {Boolean} bool The flag to enable or not.
     */
    this.display = function(bool){
        gui.display(bool);
    };

    /**
     * Apply the zoom to the layers.
     * @method zoomLayers
     * @param {Number} step The zoom step increment. A good step is of 0.1.
     * @param {Number} cx The zoom center X coordinate.
     * @param {Number} cy The zoom center Y coordinate.
     */ 
    function zoomLayers(step, cx, cy, cx2, cy2)
    {
        if( app.getImageLayer() ) {
            var oldZoom = app.getImageLayer().getZoom();
            var newZoom = {'x': (oldZoom.x + step), 'y': (oldZoom.y + step)};
            app.getImageLayer().zoom(newZoom.x, newZoom.y, cx2, cy2);
            app.getImageLayer().draw();
        }
        if( app.getDrawStage() ) { 
            
            var stage = app.getDrawStage();
            var oldKZoom = stage.scale();
            var newKZoom = {'x': (oldKZoom.x + step), 'y': (oldKZoom.y + step)};
            
            var oldOffset = stage.offset();
            var newOffsetX = (cx2 / oldKZoom.x) + oldOffset.x - (cx2 / newKZoom.x);
            var newOffsetY = (cy2 / oldKZoom.y) + oldOffset.y - (cy2 / newKZoom.y);
            var newOffset = { 'x': newOffsetX, 'y': newOffsetY };
            
            stage.offset( newOffset );
            stage.scale( newKZoom );
            stage.draw();
        }
    }

    /**
     * Apply a translation to the layers.
     * @method translateLayers
     * @param {Number} tx The translation along X.
     * @param {Number} ty The translation along Y.
     */ 
    function translateLayers(tx, ty)
    {
        if( app.getImageLayer() ) {
            var layer = app.getImageLayer();
            var zoom = layer.getZoom();
            var txx = tx / zoom.x;
            var tyy = ty / zoom.y;
            layer.translate(txx, tyy);
            layer.draw();
        }
        if( app.getDrawStage() ) { 
            var stage = app.getDrawStage();
            var offset = stage.offset();
            var kzoom = stage.scale();
            offset.x -= tx / kzoom.x;
            offset.y -= ty / kzoom.y;
            stage.offset( offset );
            stage.draw();
        }
    }

}; // ZoomAndPan class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.ZoomAndPan.prototype.getHelp = function()
{
    return {
        'title': "Zoom/Pan",
        'brief': "The Zoom/Pan tool allows to zoom and pan the image.",
        'mouse': {
            'mouse_wheel': "The mouse wheel is used to zoom the image.",
            'mouse_drag': "A single mouse drag drags the image in the desired direction."
        },
        'touch': {
            'twotouch_pinch': "A pinch in or out allows to zoom the image.",
            'touch_drag': "A single touch drag drags the image in the desired direction."
        }
    };
};

/**
 * Initialise the tool.
 * @method init
 */
dwv.tool.ZoomAndPan.prototype.init = function() {
    // nothing to do.
};