/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};
/**
 * @namespace Drawing Tool classes.
 */
dwv.tool.draw = dwv.tool.draw || {};

/**
 * @class Draw command factory.
 */
dwv.tool.draw.CommandFactory = function() {};

/**
 * Create a draw shape command according to a name and some arguments.
 * @param shapeName The name of the shape.
 * @param shape The shape to draw.
 * @param app The application.
 * @param style The style of the drawing.
 * @returns The created command.
 */
dwv.tool.draw.CommandFactory.prototype.create = function(shapeName, shape, app, style)
{
    var object = null;
    if( shapeName === "line")
    {
        object = new dwv.tool.DrawLineCommand(shape, app, style);
    }
    else if( shapeName === "circle")
    {
        object = new dwv.tool.DrawCircleCommand(shape, app, style);
    }
    else if( shapeName === "rectangle")
    {
        object = new dwv.tool.DrawRectangleCommand(shape, app, style);
    }
    else if( shapeName === "roi")
    {
        object = new dwv.tool.DrawRoiCommand(shape, app, style);
    }
    else
    {
        throw new Error("Unknown shape name when creating draw command.");
    }
    return object;
};

/**
* @class Drawing tool.
*/
dwv.tool.Draw = function(app)
{
    var self = this;
    // start drawing flag
    var started = false;
    // draw command
    var command = null;
    // draw style
    var style = new dwv.html.Style();
    // shape name
    var shapeName = "line";
    // list of points
    var points = [];

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        started = true;
        // clear array
        points = [];
        // store point
        points.push(new dwv.math.Point2D(ev._x, ev._y));
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!started)
        {
            return;
        }
        // current point
        points.push(new dwv.math.Point2D(ev._x, ev._y));
        // create shape
        var shapeFactory = new dwv.math.ShapeFactory();
        var shape = shapeFactory.create(shapeName, points);
        // create draw command
        var commandFactory = new dwv.tool.draw.CommandFactory();
        command = commandFactory.create(shapeName, shape, app, style);
        // clear the temporary layer
        app.getTempLayer().clearContextRect();
        // draw
        command.execute();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (started)
        {
            if( ev._x !== points[0].getX() 
                && ev._y !== points[0].getY() )
            {
                // draw last point
                self.mousemove(ev);
                // save command in undo stack
                app.getUndoStack().add(command);
                // merge temporary layer
                app.getDrawLayer().merge(app.getTempLayer());
            }
            // set flag
            started = false;
        }
    };

    // Enable the draw tool
    this.enable = function(value){
        if( value ) {
            dwv.gui.appendShapeChooserHtml();
            dwv.gui.appendColourChooserHtml();
        }
        else { 
            dwv.gui.clearColourChooserHtml();
            dwv.gui.clearShapeChooserHtml();
        }
    };
    
    // Handle key down event
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    // Set the line color of the drawing
    this.setShapeColour = function(colour)
    {
        // set style var
        style.setLineColor(colour);
    };
    
    // Set the shape name of the drawing
    this.setShapeName = function(name)
    {
        shapeName = name;
    };
    
}; // Draw class
