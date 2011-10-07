/**
* roi.js
* Region of interest painting tool.
* WARNING: depends on the folowing external vars:
* - gDrawContext
* - gStyle
* - gImgUpdate()
*/
function tools_roi()
{
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        gDrawContext.strokeStyle = gStyle.getLineColor();
        gDrawContext.fillStyle = gStyle.getLineColor();
        gDrawContext.beginPath();
        gDrawContext.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!tool.started)
        {
            return;
        }

        gDrawContext.lineTo(ev._x, ev._y);
        gDrawContext.stroke();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            gDrawContext.closePath();
            gDrawContext.stroke();
            tool.started = false;
            gContextUpdate();
        }
    };
        
    this.enable = function(value){
        var str = "none";
        if( value ) str = "";
        document.getElementById("colourChooser").style.display=str;
    };

} // tools_roi

