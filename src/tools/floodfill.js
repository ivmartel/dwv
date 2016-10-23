// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

//external
var Kinetic = Kinetic || {};
var MagicWand = MagicWand || {};

/**
 * Floodfill painting tool.
 * @constructor
 * @param {Object} app The associated application.
 * Found in {@link  https://github.com/Tamersoul/magic-wand-js}
 */
dwv.tool.Floodfill = function(app)
{
    /**
     * Original variables from external library. Used as in the lib example.
     * @private
     * @type Number
     */
    var blurRadius = 5;
    /**
     * Original variables from external library. Used as in the lib example.
     * @private
     * @type Number
     */
    var simplifyTolerant = 0;
    /**
     * Original variables from external library. Used as in the lib example.
     * @private
     * @type Number
     */
    var simplifyCount = 30;
    /**
     * Canvas info
     * @private
     * @type Object
     */
    var imageInfo = null;
    /**
     * Object created by MagicWand lib containing border points
     * @private
     * @type Object
     */
    var mask = null;
    /**
     * threshold default tolerance of the tool border
     * @private
     * @type Number
     */
    var initialthreshold = 15;
    /**
     * threshold tolerance of the tool border
     * @private
     * @type Number
     */
    var currentthreshold = null;
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
     * Livewire GUI.
     * @type Object
     */
    var gui = null;
    /**
     * Draw command.
     * @private
     * @type Object
     */
    var command = null;
    /**
     * Current shape group.
     * @private
     * @type Object
     */
    var shapeGroup = null;
    /**
     * Coordinates of the fist mousedown event.
     * @private
     * @type Object
     */
    var initialpoint;
    /**
     * Floodfill border.
     * @private
     * @type Object
     */
    var border = null;
    /**
     * List of parent points.
     * @private
     * @type Array
     */
    var parentPoints = [];
    /**
     * Assistant variable to paint border on all slices.
     * @private
     * @type Boolean
     */
    var extender = false;
    /**
     * Timeout for painting on mousemove.
     * @private
     */
    var painterTimeout;
    /**
     * Drawing style.
     * @type Style
     */
    this.style = new dwv.html.Style();

    /**
     * Event listeners.
     * @private
     */
    var listeners = [];

    /**
     * Set extend option for painting border on all slices.
     * @param {Boolean} The option to set
     */
    this.setExtend = function(Bool){
        extender = Bool;
    };

    /**
     * Get extend option for painting border on all slices.
     * @return {Boolean} The actual value of of the variable to use Floodfill on museup.
     */
    this.getExtend = function(){
        return extender;
    };

    /**
     * Get (x, y) coordinates referenced to the canvas
     * @param {Object} event The original event.
     */
    var getCoord = function(event){
        return { x: event._x, y: event._y };
    };

    /**
     * Calculate border.
     * @private
     * @param {Object} Start point.
     * @param {Number} Threshold tolerance.
     */
    var calcBorder = function(points, threshold){

        parentPoints = [];
        var image = {
            data: imageInfo.data,
            width: imageInfo.width,
            height: imageInfo.height,
            bytes: 4
        };

        // var p = new dwv.math.FastPoint2D(points.x, points.y);
        mask = MagicWand.floodFill(image, points.x, points.y, threshold);
        mask = MagicWand.gaussBlurOnlyBorder(mask, blurRadius);

        var cs = MagicWand.traceContours(mask);
        cs = MagicWand.simplifyContours(cs, simplifyTolerant, simplifyCount);

        if(cs.length > 0 && cs[0].points[0].x){
            for(var j=0, icsl=cs[0].points.length; j<icsl; j++){
                parentPoints.push(new dwv.math.Point2D(cs[0].points[j].x, cs[0].points[j].y));
            }
            return parentPoints;
        }
        else{
            return false;
        }
    };

    /**
     * Paint Floodfill.
     * @private
     * @param {Object} Start point.
     * @param {Number} Threshold tolerance.
     */
    var paintBorder = function(point, threshold){
        // Calculate the border
        border = calcBorder(point, threshold);
        // Paint the border
        if(border){
            var factory = new dwv.tool.RoiFactory();
            shapeGroup = factory.create(border, self.style);
            shapeGroup.id( dwv.math.guid() );
            // draw shape command
            command = new dwv.tool.DrawGroupCommand(shapeGroup, "floodfill", app.getDrawLayer());
            command.onExecute = fireEvent;
            command.onUndo = fireEvent;
            // // draw
            command.execute();
            // save it in undo stack
            app.addToUndoStack(command);

            return true;
        }
        else{
            return false;
        }
    };

    /**
     * Create Floodfill in all the prev and next slices while border is found
     */
    this.extend = function(){
        //avoid errors
        if(!initialpoint){
            throw "'initialpoint' not found. User must click before use extend!";
        }
        // remove previous draw
        if ( shapeGroup ) {
            shapeGroup.destroy();
        }

        var pos = app.getViewController().getCurrentPosition();
        var threshold = currentthreshold || initialthreshold;

        // Iterate over the next images and paint border on each slice.
        for(var i=pos.k, len=app.getImage().getGeometry().getSize().getNumberOfSlices(); i<len; i++){
            if(!paintBorder(initialpoint, threshold)){
                break;
            }
            app.getViewController().incrementSliceNb();
        }
        app.getViewController().setCurrentPosition(pos);

        // Iterate over the prev images and paint border on each slice.
        for(var j=pos.k; j>=0; j--){
            if(!paintBorder(initialpoint, threshold)){
                break;
            }
            app.getViewController().decrementSliceNb();
        }
        app.getViewController().setCurrentPosition(pos);
    };

    /**
     * Modify tolerance threshold and redraw ROI.
     * @param {Number} New threshold.
     */
    this.modifyThreshold = function(modifyThreshold){
        // remove previous draw
        clearTimeout(painterTimeout);
        painterTimeout = setTimeout( function () {
            if ( shapeGroup && self.started) {
                shapeGroup.destroy();
            }
            paintBorder(initialpoint, modifyThreshold);
        }, 100);
    };

    /**
     * Handle mouse down event.
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        imageInfo = app.getImageData();
        if (!imageInfo){ return console.error('No image found');}

        self.started = true;
        initialpoint = getCoord(event);
        paintBorder(initialpoint, initialthreshold);
    };

    /**
     * Handle mouse move event.
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(event){
        if (!self.started)
        {
            return;
        }
        var movedpoint   = getCoord(event);
        currentthreshold = Math.round(Math.sqrt( Math.pow((initialpoint.x-movedpoint.x), 2) + Math.pow((initialpoint.y-movedpoint.y), 2) )/2);
        currentthreshold = currentthreshold < initialthreshold ? initialthreshold : currentthreshold - initialthreshold;
        self.modifyThreshold(currentthreshold);
    };

    /**
     * Handle mouse up event.
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        self.started = false;
        if(extender){
            self.extend();
        }
    };

    /**
     * Handle mouse out event.
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(/*event*/){
        self.mouseup(/*event*/);
    };

    /**
     * Handle touch start event.
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        // treat as mouse down
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        // treat as mouse move
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @param {Object} event The touch end event.
     */
    this.touchend = function(/*event*/){
        // treat as mouse up
        self.mouseup(/*event*/);
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
        gui = new dwv.gui.ColourTool(app, "ff");
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
        // TODO why twice?
        this.init();
    };

    /**
     * Initialise the tool.
     */
    this.init = function()
    {
        if ( gui ) {
            // init with the app window scale
            this.style.setScale(app.getWindowScale());
            // set the default to the first in the list
            this.setLineColour(this.style.getLineColour());
            // init html
            gui.initialise();
        }

        return true;
    };

    /**
     * Add an event listener on the app.
     * @param {Object} listener The method associated with the provided event type.
     */
    this.addEventListener = function (listener)
    {
        listeners.push(listener);
    };

    /**
     * Remove an event listener from the app.
     * @param {Object} listener The method associated with the provided event type.
     */
    this.removeEventListener = function (listener)
    {
        for ( var i = 0; i < listeners.length; ++i )
        {
            if ( listeners[i] === listener ) {
                listeners.splice(i,1);
            }
        }
    };

    // Private Methods -----------------------------------------------------------

    /**
     * Fire an event: call all associated listeners.
     * @param {Object} event The event to fire.
     */
    function fireEvent (event)
    {
        for ( var i=0; i < listeners.length; ++i )
        {
            listeners[i](event);
        }
    }

}; // Floodfill class

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwv.tool.Floodfill.prototype.getHelp = function()
{
    return {
        'title': dwv.i18n("tool.Floodfill.name"),
        'brief': dwv.i18n("tool.Floodfill.brief"),
        "mouse": {
            "click": dwv.i18n("tool.Floodfill.click")
        },
        "touch": {
            "tap": dwv.i18n("tool.Floodfill.tap")
        }
    };
};

/**
 * Set the line colour of the drawing.
 * @param {String} colour The colour to set.
 */
dwv.tool.Floodfill.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColour(colour);
};
