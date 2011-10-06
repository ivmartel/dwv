/**
* line.js
* Line painting tool.
* WARNING: depends on the folowing external vars:
* - gContext
* - gCanvas
* - gLineColor
* - gImage
* - gFontSize
* - gImgUpdate()
*/
function tools_line()
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

        gContext.clearRect(0, 0, gCanvas.width, gCanvas.height);
        gContext.fillStyle = gLineColor;
        gContext.strokeStyle = gLineColor;

        gContext.beginPath();
        gContext.moveTo(tool.x0, tool.y0);
        gContext.lineTo(ev._x, ev._y);
        gContext.stroke();
        gContext.closePath();
        
        // size
        var a = Math.abs(tool.x0-ev._x)*gImage.getSpacing()[0];
        var b = Math.abs(tool.y0-ev._y)*gImage.getSpacing()[1];
        var size = Math.round(Math.sqrt(a*a+b*b));
        gContext.font = gFontStr
        gContext.fillText(size+"mm",ev._x+gFontSize, ev._y+gFontSize)
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            tool.started = false;
            gImgUpdate();
        }
    };
} // tools_line

