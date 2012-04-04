/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
* circle.js
* Circle painting tool.
*/
dwv.tool.Circle = function(app)
{
    var self = this;
    this.started = false;
    var command = null;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        self.x0 = ev._x;
        self.y0 = ev._y;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }
        // radius
        var a = Math.abs(self.x0 - ev._x);
        var b = Math.abs(self.y0 - ev._y);
        var radius = Math.round( Math.sqrt( a * a + b * b ) );
        // check zero radius
        if( radius === 0 )
        {
            return;
        }
        // centre
        var centre = new dwv.math.Point2D(self.x0, self.y0);
        // create circle
        var circle = new dwv.math.Circle(centre, radius);
        // create draw command
        command = new dwv.tool.DrawCircleCommand(circle, app);
        // clear the temporary layer
        app.getTempLayer().clearContextRect();
        // draw
        command.execute();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            // draw
            self.mousemove(ev);
            // save command in undo stack
            app.getUndoStack().add(command);
            // set flag
            self.started = false;
            // merge temporary layer
            app.getDrawLayer().merge(app.getTempLayer());
        }
    };

    this.enable = function(value){
        if( value ) {
            dwv.tool.draw.appendColourChooserHtml(app);
        }
        else { 
            dwv.tool.draw.clearColourChooserHtml();
        }
    };
    
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

}; // Circle tool class

/**
 * Draw circle command.
 * @param circle The circle to draw.
 * @param app The application to draw the circle on.
 */
dwv.tool.DrawCircleCommand = function(circle, app)
{
    // app members can change 
    var lineColor = app.getStyle().getLineColor();
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
        context.font = app.getStyle().getFontStr();
        context.fillText( Math.round(surf) + "mm2",
                circle.getCenter().getX() + app.getStyle().getFontSize(),
                circle.getCenter().getY() + app.getStyle().getFontSize());
    };
}; // Circle command class
