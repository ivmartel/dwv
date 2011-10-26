/**
* circle.js
* Circle painting tool.
*/
tool.Circle = function(app)
{
    var self = this;
    this.started = false;
    this.undoStack = new UndoStack();

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

        var a = Math.abs(self.x0-ev._x);
        var b = Math.abs(self.y0-ev._y);
        var radius = Math.round(Math.sqrt(a*a+b*b));

        var centre = new Point2D(self.x0, self.y0);
        var circle = new Circle(centre, radius);
        
        var command = new DrawCircleCommand(circle, app);
        self.undoStack.add(command.draw);
        command.draw();
        
        // surface
        a = a * app.getImage().getSpacing()[0];
        b = b * app.getImage().getSpacing()[1];
        radius = Math.sqrt(a*a+b*b);
        var surf = Math.round(Math.PI*radius*radius);
        var context = app.getTempLayer().getContext();
        context.font = app.getStyle().getFontStr();
        context.fillText(surf+"mm2",
        		ev._x+app.getStyle().getFontSize(),
        		ev._y+app.getStyle().getFontSize());
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
        	self.mousemove(ev);
        	self.started = false;
            app.mergeTempLayer();
        }
    };

    this.enable = function(value){
        if( value ) tool.draw.appendColourChooserHtml(app);
        else tool.draw.clearColourChooserHtml();
    };
    
    this.keydown = function(event){
    	if( event.keyCode == 85 ) // u
		{
    		self.undoStack.undo();
		}
    	else if( event.keyCode == 82 ) // r
		{
    		self.undoStack.redo();
		}
    };

}; // Circle function


Point2D = function(x,y)
{
    this.getX = function() { return x; };
    this.getY = function() { return y; };
}; // Point2D

Circle = function(center, radius)
{
	var surface = Math.PI*radius*radius;

    this.getCenter = function() { return center; };
    this.getRadius = function() { return radius; };
    this.getSurface = function() { return surface; };
}; // Circle

DrawCircleCommand = function(circle, app)
{
	// app members can change 
	var lineColor = app.getStyle().getLineColor();
	var context = app.getTempLayer().getContext();
	
	this.draw = function()
	{
		app.getTempLayer().clearContextRect();
		context.fillStyle = lineColor;
		context.strokeStyle = lineColor;
	
		context.beginPath();
		context.arc(
	    		circle.getCenter().getX(), 
	    		circle.getCenter().getY(), 
	    		circle.getRadius(),
	    		0, 2*Math.PI);
		context.stroke();
	};
}; // Circle command

function UndoStack()
{ 
	this.stack = []; 
	this.maxCmds = 0;
	this.curCmd = 0;
} 
UndoStack.prototype.add = function(cmd) { 
	this.stack[this.curCmd++] = cmd;
	this.maxCmds = this.curCmd;
};
UndoStack.prototype.undo = function(){ 
	this.stack[--this.curCmd]();
}; 
UndoStack.prototype.redo = function(){ 
	this.stack[this.curCmd++]();
};
