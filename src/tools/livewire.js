// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
//external
var Kinetic = Kinetic || {};

/**
 * Livewire painting tool.
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Livewire = function(app)
{
    /**
     * Closure to self: to be used by event handlers.
     * @private
     * @type WindowLevel
     */
    var self = this;
    /**
     * Livewire GUI.
     * @type Object
     */
    var gui = null;
    /**
     * Interaction start flag.
     * @type Boolean
     */
    this.started = false;

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
     * Drawing style.
     * @type Style
     */
    this.style = new dwv.html.Style();

    /**
     * Path storage. Paths are stored in reverse order.
     * @private
     * @type Path
     */
    var path = new dwv.math.Path();
    /**
     * Current path storage. Paths are stored in reverse order.
     * @private
     * @type Path
     */
    var currentPath = new dwv.math.Path();
    /**
     * List of parent points.
     * @private
     * @type Array
     */
    var parentPoints = [];
    /**
     * Tolerance.
     * @private
     * @type Number
     */
    var tolerance = 5;

    /**
     * Clear the parent points list.
     * @private
     */
    function clearParentPoints() {
        var nrows = app.getImage().getGeometry().getSize().getNumberOfRows();
        for( var i = 0; i < nrows; ++i ) {
            parentPoints[i] = [];
        }
    }

    /**
     * Clear the stored paths.
     * @private
     */
    function clearPaths() {
        path = new dwv.math.Path();
        currentPath = new dwv.math.Path();
    }

    /**
     * Scissor representation.
     * @private
     * @type Scissors
     */
    var scissors = new dwv.math.Scissors();

    /**
     * Handle mouse down event.
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(event){
        // first time
        if( !self.started ) {
            self.started = true;
            self.x0 = event._x;
            self.y0 = event._y;
            // clear vars
            clearPaths();
            clearParentPoints();
            // do the training from the first point
            var p = new dwv.math.FastPoint2D(event._x, event._y);
            scissors.doTraining(p);
            // add the initial point to the path
            var p0 = new dwv.math.Point2D(event._x, event._y);
            path.addPoint(p0);
            path.addControlPoint(p0);
        }
        else {
            // final point: at 'tolerance' of the initial point
            if( (Math.abs(event._x - self.x0) < tolerance) && (Math.abs(event._y - self.y0) < tolerance) ) {
                // draw
                self.mousemove(event);
                console.log("Done.");
                // save command in undo stack
                app.addToUndoStack(command);
                // set flag
                self.started = false;
            }
            // anchor point
            else {
                path = currentPath;
                clearParentPoints();
                var pn = new dwv.math.FastPoint2D(event._x, event._y);
                scissors.doTraining(pn);
                path.addControlPoint(currentPath.getPoint(0));
            }
        }
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
        // set the point to find the path to
        var p = new dwv.math.FastPoint2D(event._x, event._y);
        scissors.setPoint(p);
        // do the work
        var results = 0;
        var stop = false;
        while( !parentPoints[p.y][p.x] && !stop)
        {
            console.log("Getting ready...");
            results = scissors.doWork();

            if( results.length === 0 ) {
                stop = true;
            }
            else {
                // fill parents
                for( var i = 0; i < results.length-1; i+=2 ) {
                    var _p = results[i];
                    var _q = results[i+1];
                    parentPoints[_p.y][_p.x] = _q;
                }
            }
        }
        console.log("Ready!");

        // get the path
        currentPath = new dwv.math.Path();
        stop = false;
        while (p && !stop) {
            currentPath.addPoint(new dwv.math.Point2D(p.x, p.y));
            if(!parentPoints[p.y]) {
                stop = true;
            }
            else {
                if(!parentPoints[p.y][p.x]) {
                    stop = true;
                }
                else {
                    p = parentPoints[p.y][p.x];
                }
            }
        }
        currentPath.appenPath(path);

        // remove previous draw
        if ( shapeGroup ) {
            shapeGroup.destroy();
        }
        // create shape
        var factory = new dwv.tool.RoiFactory();
        shapeGroup = factory.create(currentPath.pointArray, self.style);
        // draw shape command
        command = new dwv.tool.DrawGroupCommand(shapeGroup, "livewire", app.getDrawLayer());
        // draw
        command.execute();
    };

    /**
     * Handle mouse up event.
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(/*event*/){
        // nothing to do
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
    this.touchend = function(event){
        // treat as mouse up
        self.mouseup(event);
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
        gui = new dwv.gui.Livewire(app);
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
            // set the default to the first in the list
            this.setLineColour(gui.getColours()[0]);
            // init html
            gui.initialise();
        }

        //scissors = new dwv.math.Scissors();
        var size = app.getImage().getGeometry().getSize();
        scissors.setDimensions(
                size.getNumberOfColumns(),
                size.getNumberOfRows() );
        scissors.setData(app.getImageData().data);

        return true;
    };

}; // Livewire class

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwv.tool.Livewire.prototype.getHelp = function()
{
    return {
        "title": dwv.i18n("tool.Livewire.name"),
        "brief": dwv.i18n("tool.Livewire.brief")
    };
};

/**
 * Set the line colour of the drawing.
 * @param {String} colour The colour to set.
 */
dwv.tool.Livewire.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColour(colour);
};
