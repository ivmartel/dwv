/**
* zoom.js
* Zooming tool.
* WARNING: depends on the folowing external vars:
* - gContext
* - gCanvas
* - gImage
* - gStyle
* - gImgUpdate()
*/
function tools_zoom()
{
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        tool.started = true;
        tool.x0 = ev._x;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!tool.started)
        {
            return;
        }

        var imageData = gBaseContext.getImageData(0, 0, gImage.getSize()[0], gImage.getSize()[1]);
        var newCanvas = document.getElementById("imageView");
        newCanvas.width = imageData.width;
        newCanvas.height = imageData.height;
        newCanvas.getContext("2d").putImageData(imageData, 0, 0);

        var zoom = 1 + (ev._x - tool.x0)/1000;
        if( zoom > 1.1 ) zoom = 1;
        gContext.scale(zoom, zoom);
        
        gContext.drawImage(newCanvas, ev._x, ev._y);
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            tool.started = false;
        }
    };
    
    this.enable = function(value){
        // nothing to do.
    };

} // tools_zoom

