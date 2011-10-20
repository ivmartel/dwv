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
    	app.getDrawContext().strokeStyle = app.getStyle().getLineColor();
    	app.getDrawContext().fillStyle = app.getStyle().getLineColor();
    	app.getDrawContext().beginPath();
        app.getDrawContext().moveTo(ev._x, ev._y);
        self.started = true;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }

        app.getDrawContext().lineTo(ev._x, ev._y);
        app.getDrawContext().stroke();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            self.mousemove(ev);
            app.getDrawContext().closePath();
            app.getDrawContext().stroke();
            self.started = false;
            app.updateContext();
        }
    };
        
    this.enable = function(value){
        if( value ) tool.draw.appendColourChooserHtml(app);
        else tool.draw.clearColourChooserHtml();
    };

}; // Roi function
