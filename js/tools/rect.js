/**
* rect.js
* Rectangle painting tool.
*/
tool.Rect = function(app)
{
    var self = this;
    this.started = false;

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
        // points
        var beginPoint = new Point2D(self.x0, self.y0);
        var endPoint = new Point2D(ev._x, ev._y);
        // check for equality
        if( beginPoint.equal(endPoint) )
    	{
        	return;
    	}
        // create line
        var line = new Rectangle(beginPoint, endPoint);
        // create draw command
        command = new DrawRectangleCommand(line, app);
        // clear the temporary layer
        app.getTempLayer().clearContextRect();
        // draw
        command.draw();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            // draw
        	self.mousemove(ev);
            // save command in undo stack
        	app.getUndoStack().add(command.draw);
            // set flag
        	self.started = false;
            // merge temporary layer
        	app.mergeTempLayer();
        }
    };
        
    this.enable = function(value){
        if( value ) tool.draw.appendColourChooserHtml(app);
        else tool.draw.clearColourChooserHtml();
    };

    this.keydown = function(event){
    	app.handleKeyDown(event);
    };

}; // Rect function

/**
 * Draw rectangle command.
 * @param rectangle The rectangle to draw.
 * @param app The application to draw the line on.
 */
DrawRectangleCommand = function(rectangle, app)
{
	// app members can change 
	var lineColor = app.getStyle().getLineColor();
	var context = app.getTempLayer().getContext();
	
    // Get the X position of the point.
	var name = "";
	this.setName = function(str) { name = str; };
	this.getName = function() { return name; };

	this.draw = function()
	{
		// style
		context.fillStyle = lineColor;
		context.strokeStyle = lineColor;
		// path
        context.beginPath();
        context.strokeRect( 
        		rectangle.getBegin().getX(), 
        		rectangle.getBegin().getY(),
        		rectangle.getWidth(),
        		rectangle.getHeight() );
		// length
        var surf = rectangle.getWorldSurface( 
        	app.getImage().getSpacing()[0], 
        	app.getImage().getSpacing()[1] );
        context.font = app.getStyle().getFontStr();
        context.fillText( Math.round(surf) + "mm2",
        		rectangle.getEnd().getX() + app.getStyle().getFontSize(),
        		rectangle.getEnd().getY() + app.getStyle().getFontSize());
	}; 
}; // Rectangle command class
