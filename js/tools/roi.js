/**
* roi.js
* Region of interest painting tool.
*/
function tools_roi(app)
{
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
    	app.getDrawContext().strokeStyle = app.getStyle().getLineColor();
    	app.getDrawContext().fillStyle = app.getStyle().getLineColor();
    	app.getDrawContext().beginPath();
        app.getDrawContext().moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!tool.started)
        {
            return;
        }

        app.getDrawContext().lineTo(ev._x, ev._y);
        app.getDrawContext().stroke();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            app.getDrawContext().closePath();
            app.getDrawContext().stroke();
            tool.started = false;
            app.updateContext();
        }
    };
        
    this.enable = function(value){
        var str = "none";
        if( value ) str = "";
        document.getElementById("colourChooser").style.display=str;
    };

} // tools_roi

