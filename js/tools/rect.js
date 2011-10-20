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

        var x = Math.min(ev._x, self.x0);
        var y = Math.min(ev._y, self.y0);
        var w = Math.abs(ev._x - self.x0);
        var h = Math.abs(ev._y - self.y0);

        app.getDrawContext().clearRect(
        		0, 0, 
        		app.getDrawCanvas().width, 
        		app.getDrawCanvas().height);
        app.getDrawContext().fillStyle = app.getStyle().getLineColor();
        app.getDrawContext().strokeStyle = app.getStyle().getLineColor();

        if (!w || !h)
        {
            return;
        }

        app.getDrawContext().beginPath();
        app.getDrawContext().strokeRect(x, y, w, h);
    
        // surface
        var surf = Math.round((w*app.getImage().getSpacing()[0])*(h*app.getImage().getSpacing()[1]));
        app.getDrawContext().font = app.getStyle().getFontStr();
        app.getDrawContext().fillText(
        		surf+"mm2",
        		ev._x + app.getStyle().getFontSize(), 
        		ev._y + app.getStyle().getFontSize());
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            self.mousemove(ev);
            self.started = false;
            app.updateContext();
        }
    };
        
    this.enable = function(value){
        var str = "none";
        if( value ) str = "";
        document.getElementById("colourChooser").style.display=str;
    };

}; // Rect function
