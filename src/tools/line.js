//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
 * @class Draw line command.
 * @param points The points from which to extract the line.
 * @param app The application to draw the line on.
 * @param style The drawing style.
 */
dwv.tool.DrawLineCommand = function(points, app, style)
{
    var line = new dwv.math.Line(points[0], points[points.length-1]);
    var lineColor = style.getLineColor();
    var context = app.getTempLayer().getContext();
    
    // command name
    var name = "DrawLineCommand";
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        // style
        context.fillStyle = lineColor;
        context.strokeStyle = lineColor;
        // path
        context.beginPath();
        context.moveTo( line.getBegin().getX(), line.getBegin().getY());
        context.lineTo( line.getEnd().getX(), line.getEnd().getY());
        context.stroke();
        context.closePath();
        // length
        var length = line.getWorldLength( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = style.getFontStr();
        context.fillText( Math.round(length) + "mm",
                line.getEnd().getX() + style.getFontSize(),
                line.getEnd().getY() + style.getFontSize());
    }; 
}; // DrawLineCommand class

//Add the shape command to the list
dwv.tool.shapes.line = dwv.tool.DrawLineCommand;
