/**
* rect.js
* Rectangle painting tool.
* WARNING: draws on the context var.
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

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = lineColor;
        context.strokeStyle = lineColor;

        if (!w || !h)
        {
            return;
        }

        context.beginPath();
        context.strokeRect(x, y, w, h);
    
        // surface
        var surf = Math.round((w*spacingX)*(h*spacingY));
        context.font = fontStr
        context.fillText(surf+"mm2",ev._x+fontSize, ev._y+fontSize)
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
} // tools_rect

