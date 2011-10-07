/**
* circle.js
* Circle painting tool.
* WARNING: depends on the folowing external vars:
* - gDrawContext
* - gDrawCanvas
* - gImage
* - gStyle
* - gImgUpdate()
*/
function tools_circle()
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

        gDrawContext.clearRect(0, 0, gDrawCanvas.width, gDrawCanvas.height);
        gDrawContext.fillStyle = gStyle.getLineColor();
        gDrawContext.strokeStyle = gStyle.getLineColor();

        var a = Math.abs(tool.x0-ev._x);
        var b = Math.abs(tool.y0-ev._y);
        var radius = Math.round(Math.sqrt(a*a+b*b));
        
        gDrawContext.beginPath();
        gDrawContext.arc(tool.x0, tool.y0, radius, 0, 2*Math.PI);
        gDrawContext.stroke();
        
        // surface
        a = a*gImage.getSpacing()[0];
        b = b*gImage.getSpacing()[1];
        radius = Math.sqrt(a*a+b*b);
        var surf = Math.round(Math.PI*radius*radius);
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

} // tools_circle

