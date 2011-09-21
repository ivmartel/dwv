/**
* roi.js
* Region of interest painting tool.
* WARNING: draws on the context var.
*/
function tools_roi()
{
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        context.strokeStyle = lineColor;
        context.fillStyle = lineColor;
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!tool.started)
        {
            return;
        }

        context.lineTo(ev._x, ev._y);
        context.stroke();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            context.closePath();
            context.stroke();
            tool.started = false;
            img_update();
        }
    };
} // tools_roi

