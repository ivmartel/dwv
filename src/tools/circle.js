//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

/**
 * @class Draw circle command.
 * @param points The points from which to extract the circle.
 * @param app The application to draw the circle on.
 * @param style The drawing style.
 */
dwv.tool.DrawCircleCommand = function(points, app, style)
{
    // radius
    var a = Math.abs(points[0].getX() - points[points.length-1].getX());
    var b = Math.abs(points[0].getY() - points[points.length-1].getY());
    var radius = Math.round( Math.sqrt( a * a + b * b ) );
    // check zero radius
    if( radius === 0 )
    {
        // silent fail...
        return;
    }
    // create circle
    var circle = new dwv.math.Circle(points[0], radius);
    var lineColor = style.getLineColor();
    var context = app.getTempLayer().getContext();
    
    // command name
    var name = "DrawCircleCommand";
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
        context.arc(
                circle.getCenter().getX(), 
                circle.getCenter().getY(), 
                circle.getRadius(),
                0, 2*Math.PI);
        context.stroke();
        // surface
        var surf = circle.getWorldSurface( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = style.getFontStr();
        context.fillText( Math.round(surf) + "mm2",
                circle.getCenter().getX() + style.getFontSize(),
                circle.getCenter().getY() + style.getFontSize());
    };
}; // DrawCircleCommand class

//Shape list
dwv.tool.shapes = dwv.tool.shapes || {};
//Add the shape command to the list
dwv.tool.shapes.circle = dwv.tool.DrawCircleCommand;
