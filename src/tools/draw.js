/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

//! List of colors
dwv.tool.colors = [
    "Yellow", "Red", "White", "Green", "Blue", "Lime", "Fuchsia", "Black"
];

//! List of supported shapes
dwv.tool.shapes = {
    "line": dwv.tool.DrawLineCommand,
    "circle": dwv.tool.DrawCircleCommand,
    "rectangle": dwv.tool.DrawRectangleCommand,
    "roi": dwv.tool.DrawRoiCommand
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
        command = new dwv.tool.shapes[shapeName](shape, app, style);
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

}; // Draw class

// Set the line color of the drawing
dwv.tool.Draw.prototype.setShapeColour = function(colour)
{
    // set style var
    style.setLineColor(colour);
};

// Set the shape name of the drawing
dwv.tool.Draw.prototype.setShapeName = function(name)
{
    // check if we have it
    if( !this.hasShape(name) )
    {
        throw new Error("Unknown shape: '" + name + "'");
    }
    shapeName = name;
};

dwv.tool.Draw.prototype.hasShape = function(name) {
    return dwv.tool.shapes[name];
};
