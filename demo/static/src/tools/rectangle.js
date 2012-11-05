/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
 * @class Draw rectangle command.
 * @param points The points from which to extract the circle.
 * @param app The application to draw the line on.
 * @param style The drawing style.
 */
dwv.tool.DrawRectangleCommand = function(points, app, style)
{
    var rectangle = new dwv.math.Rectangle(points[0], points[points.length-1]);
    var lineColor = style.getLineColor();
    var context = app.getTempLayer().getContext();
    
    // command name
    var name = "DrawRectangleCommand";
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
        context.strokeRect( 
                rectangle.getBegin().getX(), 
                rectangle.getBegin().getY(),
                rectangle.getRealWidth(),
                rectangle.getRealHeight() );
        // length
        var surf = rectangle.getWorldSurface( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = style.getFontStr();
        context.fillText( Math.round(surf) + "mm2",
                rectangle.getEnd().getX() + style.getFontSize(),
                rectangle.getEnd().getY() + style.getFontSize());
    }; 
}; // DrawRectangleCommand class

//Add the shape command to the list
dwv.tool.shapes["rectangle"] = dwv.tool.DrawRectangleCommand;
