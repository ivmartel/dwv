/**
* roi.js
* Region of interest painting tool.
*/
tool.Roi = function(app)
{
    var self = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
    	var context = app.getTempLayer().getContext();
    	context.strokeStyle = app.getStyle().getLineColor();
    	context.fillStyle = app.getStyle().getLineColor();
    	context.beginPath();
    	context.moveTo(ev._x, ev._y);
        self.started = true;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }

    	var context = app.getTempLayer().getContext();
        context.lineTo(ev._x, ev._y);
        context.stroke();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            self.mousemove(ev);
        	var context = app.getTempLayer().getContext();
            context.closePath();
            context.stroke();
            self.started = false;
            app.mergeTempLayer();
        }
    };
        
    this.enable = function(value){
        if( value ) tool.draw.appendColourChooserHtml(app);
        else tool.draw.clearColourChooserHtml();
    };

}; // Roi function
