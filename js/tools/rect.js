/**
* rect.js
* Rectangle painting tool.
* WARNING: depends on the folowing external vars:
* - gDrawContext
* - gDrawCanvas
* - gImage
* - gStyle
* - gImgUpdate()
*/
function tools_rect()
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

        var x = Math.min(ev._x, tool.x0);
        var y = Math.min(ev._y, tool.y0);
        var w = Math.abs(ev._x - tool.x0);
        var h = Math.abs(ev._y - tool.y0);

        gDrawContext.clearRect(0, 0, gDrawCanvas.width, gDrawCanvas.height);
        gDrawContext.fillStyle = gStyle.getLineColor();
        gDrawContext.strokeStyle = gStyle.getLineColor();

        if (!w || !h)
        {
            return;
        }

        gDrawContext.beginPath();
        gDrawContext.strokeRect(x, y, w, h);
    
        // surface
        var surf = Math.round((w*gImage.getSpacing()[0])*(h*gImage.getSpacing()[1]));
        gDrawContext.font = gStyle.getFontStr();
        gDrawContext.fillText(surf+"mm2",ev._x+gStyle.getFontSize(), ev._y+gStyle.getFontSize())
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            tool.started = false;
            gContextUpdate();
        }
    };
        
    this.enable = function(value){
        var str = "none";
        if( value ) str = "";
        document.getElementById("colourChooser").style.display=str;
    };

} // tools_rect

