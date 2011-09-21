/**
* line.js
* Line painting tool.
* WARNING: draws on the context var.
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

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = lineColor;

        context.beginPath();
        context.moveTo(tool.x0, tool.y0);
        context.lineTo(ev._x, ev._y);
        context.stroke();
        context.closePath();
        
        // size
        var a = Math.abs(tool.x0-ev._x)*spacingX;
        var b = Math.abs(tool.y0-ev._y)*spacingY;
        var size = Math.round(Math.sqrt(a*a+b*b));
        context.font = fontStr
        context.fillText(size+"mm",ev._x+fontSize, ev._y+fontSize)
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            tool.started = false;
            img_update();
        }
    };
} // tools_line

