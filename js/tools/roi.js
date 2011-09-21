/**
* rect.js
* This painting tool works like a drawing pencil which tracks the mouse 
*  movements.
* WARNING: draws on the context var.
*/
function tools_pencil()
{
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function(ev){
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function(ev){
        if (tool.started)
        {
            context.lineTo(ev._x, ev._y);
            context.stroke();
        }
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
} // tools_pencil
   

