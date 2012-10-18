/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
 * @class Draw circle command.
 * @param circle The circle to draw.
 * @param app The application to draw the circle on.
 * @param style The drawing style.
 */
dwv.tool.DrawCircleCommand = function(circle, app, style)
{
    // app members can change 
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

//Add the shape command to the list
dwv.tool.shapes["circle"] = dwv.tool.DrawCircleCommand;

