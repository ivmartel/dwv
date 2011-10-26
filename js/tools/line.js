/**
* line.js
* Line painting tool.
*/
tool.Line = function(app)
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

    	var canvas = app.getTempLayer().getCanvas();
    	var context = app.getTempLayer().getContext();
        var style = app.getStyle();
        
        context.clearRect(
        		0, 0, 
        		canvas.width, 
        		canvas.height);
        context.fillStyle = style.getLineColor();
        context.strokeStyle = style.getLineColor();

        context.beginPath();
        context.moveTo(self.x0, self.y0);
        context.lineTo(ev._x, ev._y);
        context.stroke();
        context.closePath();
        
        // size
        var a = Math.abs(self.x0-ev._x) * app.getImage().getSpacing()[0];
        var b = Math.abs(self.y0-ev._y) * app.getImage().getSpacing()[1];
        var size = Math.round(Math.sqrt(a*a+b*b));
        context.font = style.getFontStr();
        context.fillText(
        		size+"mm",
        		ev._x + style.getFontSize(), 
        		ev._y + style.getFontSize());
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

}; // Line
