/**
* line.js
* Line painting tool.
*/
tool.Line = function(app)
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
        // points
        var beginPoint = new Point2D(self.x0, self.y0);
        var endPoint = new Point2D(ev._x, ev._y);
        // check for equality
        if( beginPoint.equal(endPoint) )
    	{
        	return;
    	}
        // create line
        var line = new Line(beginPoint, endPoint);
        // create draw command
        command = new DrawLineCommand(line, app);
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

}; // Line tool class

/**
 * Draw line command.
 * @param line The line to draw.
 * @param app The application to draw the line on.
 */
DrawLineCommand = function(line, app)
{
	// app members can change 
	var lineColor = app.getStyle().getLineColor();
	var context = app.getTempLayer().getContext();
	
	this.draw = function()
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
        	app.getImage().getSpacing()[0], 
        	app.getImage().getSpacing()[1] );
        context.font = app.getStyle().getFontStr();
        context.fillText( Math.round(length) + "mm",
        		line.getEnd().getX() + app.getStyle().getFontSize(),
        		line.getEnd().getY() + app.getStyle().getFontSize());
	}; 
}; // Line command class
