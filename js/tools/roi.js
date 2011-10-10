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
    	app.gDrawContext.strokeStyle = app.gStyle.getLineColor();
    	app.gDrawContext.fillStyle = app.gStyle.getLineColor();
    	app.gDrawContext.beginPath();
        app.gDrawContext.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!tool.started)
        {
            return;
        }

        app.gDrawContext.lineTo(ev._x, ev._y);
        app.gDrawContext.stroke();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            app.gDrawContext.closePath();
            app. gDrawContext.stroke();
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

