/**
* line.js
* Line painting tool.
*/
tool.Line = function(app)
{
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        tool.started = true;
        tool.x0 = ev._x;
        tool.y0 = ev._y;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!tool.started)
        {
            return;
        }

        app.getDrawContext().clearRect(
        		0, 0, 
        		app.getDrawCanvas().width, 
        		app.getDrawCanvas().height);
        app.getDrawContext().fillStyle = app.getStyle().getLineColor();
        app.getDrawContext().strokeStyle = app.getStyle().getLineColor();

        app.getDrawContext().beginPath();
        app.getDrawContext().moveTo(tool.x0, tool.y0);
        app.getDrawContext().lineTo(ev._x, ev._y);
        app.getDrawContext().stroke();
        app.getDrawContext().closePath();
        
        // size
        var a = Math.abs(tool.x0-ev._x) * app.getImage().getSpacing()[0];
        var b = Math.abs(tool.y0-ev._y) * app.getImage().getSpacing()[1];
        var size = Math.round(Math.sqrt(a*a+b*b));
        app.getDrawContext().font = app.getStyle().getFontStr();
        app.getDrawContext().fillText(
        		size+"mm",
        		ev._x + app.getStyle().getFontSize(), 
        		ev._y + app.getStyle().getFontSize());
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            tool.started = false;
            app.updateContext();
        }
    };
    
    this.enable = function(value){
        var str = "none";
        if( value ) str = "";
        document.getElementById("colourChooser").style.display=str;
    };

}; // Line

