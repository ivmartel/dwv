/**
* line.js
* Line painting tool.
*/
function tools_line(app)
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

        app.gDrawContext.clearRect(
        		0, 0, 
        		app.gDrawCanvas.width, 
        		app.gDrawCanvas.height);
        app.gDrawContext.fillStyle = app.gStyle.getLineColor();
        app.gDrawContext.strokeStyle = app.gStyle.getLineColor();

        app.gDrawContext.beginPath();
        app.gDrawContext.moveTo(tool.x0, tool.y0);
        app.gDrawContext.lineTo(ev._x, ev._y);
        app.gDrawContext.stroke();
        app.gDrawContext.closePath();
        
        // size
        var a = Math.abs(tool.x0-ev._x) * app.gImage.getSpacing()[0];
        var b = Math.abs(tool.y0-ev._y) * app.gImage.getSpacing()[1];
        var size = Math.round(Math.sqrt(a*a+b*b));
        app.gDrawContext.font = app.gStyle.getFontStr();
        app.gDrawContext.fillText(
        		size+"mm",
        		ev._x + app.gStyle.getFontSize(), 
        		ev._y + app.gStyle.getFontSize());
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

} // tools_line

