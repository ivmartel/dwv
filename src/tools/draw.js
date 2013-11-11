/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

// List of colors
dwv.tool.colors = [
    "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
];

// Shape list: to be completed after each tool definition 
dwv.tool.shapes = dwv.tool.shapes || {};

/**
 * Drawing tool.
 * @class Draw
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Draw = function(app)
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
    var started = false;
    
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
     * Shape name.
     * @property shapeName
     * @type String
     */
    this.shapeName = 0;
    /**
     * List of points
     * @property points
     * @type Array
     */
    var points = [];

    /**
     * Handle mouse down event.
     * @method mousedown
     * @param {Object} event The mouse down event.
     */
    this.mousedown = function(ev){
        started = true;
        // clear array
        points = [];
        // store point
        points.push(new dwv.math.Point2D(ev._x, ev._y));
    };

    /**
     * Handle mouse move event.
     * @method mousemove
     * @param {Object} event The mouse move event.
     */
    this.mousemove = function(ev){
        if (!started)
        {
            return;
        }
        if( ev._x !== points[0].getX() &&
            ev._y !== points[0].getY() )
        {
            // current point
            points.push(new dwv.math.Point2D(ev._x, ev._y));
            // create draw command
            command = new dwv.tool.shapes[self.shapeName](points, app, self.style);
            // clear the temporary layer
            app.getTempLayer().clearContextRect();
            // draw
            command.execute();
        }
    };

    /**
     * Handle mouse up event.
     * @method mouseup
     * @param {Object} event The mouse up event.
     */
    this.mouseup = function(ev){
        if (started)
        {
            // save command in undo stack
            app.getUndoStack().add(command);
            // merge temporary layer
            app.getDrawLayer().merge(app.getTempLayer());
            // set flag
            started = false;
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
        self.mousedown(ev);
    };

    /**
     * Handle touch move event.
     * @method touchmove
     * @param {Object} event The touch move event.
     */
    this.touchmove = function(ev){
        self.mousemove(ev);
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
     * @param {Boolean} value The flag to enable or not.
     */
    this.enable = function(value){
        if( value ) {
            this.init();
            dwv.gui.appendDrawHtml();
        }
        else { 
            dwv.gui.clearDrawHtml();
        }
    };

}; // Draw class

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Draw.getHelp = function()
{
    return {
        'title': "Draw",
        'brief': "Allows to draw shapes on the image.",
        'mouse': {
            'mouse_drag': "A single mouse drag draws the shape.",
        },
        'touch': {
            'touch_drag': "A single touch drag draws the shape.",
        }
    };
};

/**
 * Set the line color of the drawing.
 * @method setLineColour
 * @param {String} colour The colour to set.
 */
dwv.tool.Draw.prototype.setLineColour = function(colour)
{
    // set style var
    this.style.setLineColor(colour);
};

/**
 * Set the shape name of the drawing.
 * @method setShapeName
 * @param {String} name The name of the shape.
 */
dwv.tool.Draw.prototype.setShapeName = function(name)
{
    // check if we have it
    if( !this.hasShape(name) )
    {
        throw new Error("Unknown shape: '" + name + "'");
    }
    this.shapeName = name;
};

/**
 * Check if the shape is in the shape list.
 * @method hasShape
 * @param {String} name The name of the shape.
 */
dwv.tool.Draw.prototype.hasShape = function(name) {
    return dwv.tool.shapes[name];
};

/**
 * Initialise the tool.
 * @method init
 */
dwv.tool.Draw.prototype.init = function() {
    // set the default to the first in the list
    var shapeName = 0;
    for( var key in dwv.tool.shapes ){
        shapeName = key;
        break;
    }
    this.setShapeName(shapeName);
    // same for color
    this.setLineColour(dwv.tool.colors[0]);
};

// Add the tool to the tool list
dwv.tool.tools = dwv.tool.tools || {};
dwv.tool.tools.draw = dwv.tool.Draw;
