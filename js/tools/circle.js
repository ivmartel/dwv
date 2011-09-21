/**
* circle.js
* Circle painting tool.
* WARNING: draws on the context var.
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

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = lineColor;
        context.strokeStyle = lineColor;

        var a = Math.abs(tool.x0-ev._x);
        var b = Math.abs(tool.y0-ev._y);
        var radius = Math.round(Math.sqrt(a*a+b*b));
        
        context.beginPath();
        context.arc(tool.x0, tool.y0, radius, 0, 2*Math.PI);
        context.stroke();
        
        // surface
        a = a*spacingX;
        b = b*spacingY;
        radius = Math.sqrt(a*a+b*b);
        var surf = Math.round(Math.PI*radius*radius);
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
} // tools_circle

