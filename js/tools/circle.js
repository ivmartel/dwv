/**
* circle.js
* Circle painting tool.
*/
tool.Circle = function(app)
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

        app.getDrawContext().clearRect(
        		0, 0, 
        		app.getDrawCanvas().width, 
        		app.getDrawCanvas().height);
        app.getDrawContext().fillStyle = app.getStyle().getLineColor();
        app.getDrawContext().strokeStyle = app.getStyle().getLineColor();

        var a = Math.abs(self.x0-ev._x);
        var b = Math.abs(self.y0-ev._y);
        var radius = Math.round(Math.sqrt(a*a+b*b));
        
        app.getDrawContext().beginPath();
        app.getDrawContext().arc(self.x0, self.y0, radius, 0, 2*Math.PI);
        app.getDrawContext().stroke();
        
        // surface
        a = a * app.getImage().getSpacing()[0];
        b = b * app.getImage().getSpacing()[1];
        radius = Math.sqrt(a*a+b*b);
        var surf = Math.round(Math.PI*radius*radius);
        app.getDrawContext().font = app.getStyle().getFontStr();
        app.getDrawContext().fillText(surf+"mm2",
        		ev._x+app.getStyle().getFontSize(),
        		ev._y+app.getStyle().getFontSize());
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

}; // Circle function
