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
        tool.y0 = ev._y;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!tool.started)
        {
            // zoom mode
            tool.x0 = ev._x;
            tool.y0 = ev._y;
            return;
        }

        // get the image data
        var imageData = gBaseContext.getImageData( 0, 0, gImage.getSize()[0], gImage.getSize()[1]); 
       
        // copy it to the draw context
        gDrawContext.clearRect(0, 0, gImage.getSize()[0],gImage.getSize()[1]);
        gDrawContext.putImageData(imageData, 0, 0);
        
        // save base settings
        gBaseContext.save();

        // translate the base context
        gBaseContext.clearRect(0, 0, gImage.getSize()[0],gImage.getSize()[1]);
        var tx = ev._x - tool.x0;
        var ty = ev._y - tool.y0;
        gBaseContext.translate( tx, ty );
		
        // put the draw canvas in the base context
        gBaseContext.drawImage(gDrawCanvas, 0, 0);
        
        // restore base settings
        gBaseContext.restore();
        
        // do not cumulate
        tool.x0 = ev._x;
        tool.y0 = ev._y;
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (tool.started)
        {
            tool.mousemove(ev);
            tool.started = false;
        }
    };
    
    // This is called when you use the mouse wheel.
    this.DOMMouseScroll = function(ev){
        gZoom(ev.detail, tool.x0, tool.y0);
    };

    this.mousewheel = function(ev){
        gZoom(ev.wheelDelta/40, tool.x0, tool.y0);
    };
    
    this.enable = function(value){
        // nothing to do.
    };

} // tools_zoom

function gZoom(step, cx, cy)
{
     // get the image data
    var imageData = gBaseContext.getImageData( 0, 0, gImage.getSize()[0], gImage.getSize()[1]); 
   
    // copy it to the draw context
    gDrawContext.clearRect(0, 0, gImage.getSize()[0],gImage.getSize()[1]);
    gDrawContext.putImageData(imageData, 0, 0);
    
    // save base settings
    gBaseContext.save();

    // translate the base context
    gBaseContext.clearRect(0, 0, gImage.getSize()[0],gImage.getSize()[1]);
    var zoom = Math.pow(1.1,step);
    
    gBaseContext.translate(cx, cy);
    gBaseContext.scale( zoom, zoom );
    gBaseContext.translate(-cx, -cy);
    
    // put the draw canvas in the base context
    gBaseContext.drawImage(gDrawCanvas, 0, 0);
    
    // restore base settings
    gBaseContext.restore();
}
