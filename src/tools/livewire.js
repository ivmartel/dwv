/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Livewire painting tool.
 * @class Livewire
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Livewire = function(app)
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
     * Draw command.
     * @property command
     * @private
     * @type Object
     */
    var command = null;
    /**
     * Drawing style.
     * @property style
     * @type Style
     */
    this.style = new dwv.html.Style();
    
    /**
     * Path storage. Paths are stored in reverse order.
     * @property path
     * @private
     * @type Path
     */
    var path = new dwv.math.Path();
    /**
     * Current path storage. Paths are stored in reverse order.
     * @property currentPath
     * @private
     * @type Path
     */
    var currentPath = new dwv.math.Path();
    /**
     * List of parent points.
     * @property parentPoints
     * @private
     * @type Array
     */
    var parentPoints = [];
    /**
     * Tolerance.
     * @property tolerance
     * @private
     * @type Number
     */
    var tolerance = 5;
    
    /**
     * Clear the parent points list.
     * @method clearParentPoints
     * @private
     */
    function clearParentPoints() {
        for( var i = 0; i < app.getImage().getSize().getNumberOfRows(); ++i ) {
            parentPoints[i] = [];
        }
    }
    
    /**
     * Clear the stored paths.
     * @method clearPaths
     * @private
     */
    function clearPaths() {
        path = new dwv.math.Path();
        currentPath = new dwv.math.Path();
    }
    
    /**
     * Scissor representation.
     * @property scissors
     * @private
     * @type Scissors
     */
    var scissors = new dwv.math.Scissors();
    scissors.setDimensions(
        app.getImage().getSize().getNumberOfColumns(),
        app.getImage().getSize().getNumberOfRows() );
    scissors.setData(app.getImageData().data);
    
    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(ev){
        // first time
        if( !self.started ) {
            self.started = true;
            self.x0 = ev._x;
            self.y0 = ev._y;
            // clear vars
            clearPaths();
            clearParentPoints();
            // do the training from the first point
            var p = new dwv.math.FastPoint2D(ev._x, ev._y);
            scissors.doTraining(p);
            // add the initial point to the path
            var p0 = new dwv.math.Point2D(ev._x, ev._y);
            path.addPoint(p0);
            path.addControlPoint(p0);
        }
        else {
            // final point: at 'tolerance' of the initial point
            if( (Math.abs(ev._x - self.x0) < tolerance) && (Math.abs(ev._y - self.y0) < tolerance) ) {
                // draw
                self.mousemove(ev);
                console.log("Done.");
                // save command in undo stack
                app.getUndoStack().add(command);
                // merge temporary layer
                app.getDrawLayer().merge(app.getTempLayer());
                // set flag
                self.started = false;
            }
            // anchor point
            else {
                path = currentPath;
                clearParentPoints();
                var pn = new dwv.math.FastPoint2D(ev._x, ev._y);
                scissors.doTraining(pn);
                path.addControlPoint(currentPath.getPoint(0));
            }
        }
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
        // set the point to find the path to
        var p = new dwv.math.FastPoint2D(ev._x, ev._y);
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
        
        // create draw command
        command = new dwv.tool.DrawLivewireCommand(currentPath, app, self.style);
        // clear the temporary layer
        app.getTempLayer().clearContextRect();
        // draw
        command.execute();
    };

    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(ev){
        // nothing to do
    };
    
    /**
     * Handle mouse out event.
     * @method mouseout
     * @param {Object} event The mouse out event.
     */
    this.mouseout = function(event){
        // treat as mouse up
        self.mouseup(event);
    };
    
    /**
     * Handle touch start event.
     * @method touchstart
     * @param {Object} event The touch start event.
     */
    this.touchstart = function(event){
        // treat as mouse down
        self.mousedown(event);
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(event){
        // treat as mouse move
        self.mousemove(event);
    };

    /**
     * Handle touch end event.
     * @method touchend
     * @param {Object} event The touch end event.
     */
    this.touchend = function(event){
        // treat as mouse up
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
    this.enable = function(value){
        if( value ) {
            this.init();
            dwv.gui.appendLivewireHtml();
        }
        else {
            dwv.gui.clearLivewireHtml();
        }
    };


}; // Livewire class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Livewire.getHelp = function()
{
    return {
        'title': "Livewire",
        'brief': "This is the help of the Livewire tool."
    };
};

/**
 * Set the line color of the drawing.
 * @method setLineColour
 * @param {String} colour The colour to set.
 */
dwv.tool.Livewire.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColor(colour);
};

/**
 * Initialise the tool.
 * @method init
 */
dwv.tool.Livewire.prototype.init = function()
{
    // set the default to the first in the list
    this.setLineColour(dwv.tool.colors[0]);
};

// Add the tool to the tool list
dwv.tool.tools = dwv.tool.tools || {};
dwv.tool.tools.livewire = dwv.tool.Livewire;

/**
 * Draw livewire command.
 * @class DrawLivewireCommand
 * @namespace dwv.tool
 * @param {Object} livewire The livewire to draw.
 * @param {Object} app The application to draw the livewire on.
 * @param {Object} style The style of the livewire.
 */
dwv.tool.DrawLivewireCommand = function(livewire, app, style)
{
    /**
     * The livewire color.
     * @property livewireColor
     * @private
     * @type String
     */
    var livewireColor = style.getLineColor();
    /**
     * The HTML context.
     * @property context
     * @private
     * @type Object
     */
    var context = app.getTempLayer().getContext();
    
    /**
     * Command name.
     * @property name
     * @private
     * @type String
     */
    var name = "DrawLivewireCommand";
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function() { return name; };
    /**
     * Set the command name.
     * @method setName
     * @param {String} str The command name.
     */
    this.setName = function(str) { name = str; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function()
    {
        // style
        context.fillStyle = livewireColor;
        context.strokeStyle = livewireColor;
        // path
        context.beginPath();
        var p = livewire.getPoint(0);
        context.moveTo( p.getX(), p.getY());
        for( var i=1; i < livewire.getLength(); ++i ) {
            p = livewire.getPoint(i);
            context.lineTo( p.getX(), p.getY());
        }
        for( var j=0; j < livewire.controlPointIndexArray.length; ++j ) { 
            p = livewire.getPoint(livewire.controlPointIndexArray[j]);
            context.fillRect(p.getX()-3, p.getY()-3, 5, 5);
        }
        context.stroke();
        //context.closePath();
    }; 
}; // DrawLivewireCommand class
