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
function tools_zoom(app)
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
        var imageData = app.gBaseContext.getImageData( 
    			0, 0, 
    			app.gImage.getSize()[0], 
    			app.gImage.getSize()[1]); 
       
        // copy it to the draw context
        app.gDrawContext.clearRect(
        		0, 0, 
        		app.gImage.getSize()[0],
        		app.gImage.getSize()[1]);
        app.gDrawContext.putImageData(imageData, 0, 0);
        
        // save base settings
        app.gBaseContext.save();

        // translate the base context
        app.gBaseContext.clearRect(
        		0, 0, 
        		app.gImage.getSize()[0],
        		app.gImage.getSize()[1]);
        var tx = ev._x - tool.x0;
        var ty = ev._y - tool.y0;
        app.gBaseContext.translate( tx, ty );
		
        // put the draw canvas in the base context
        app.gBaseContext.drawImage(app.gDrawCanvas, 0, 0);
        
        // restore base settings
        app.gBaseContext.restore();
        
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
        zoom(ev.detail, tool.x0, tool.y0);
    };

    this.mousewheel = function(ev){
        zoom(ev.wheelDelta/40, tool.x0, tool.y0);
    };
    
    this.enable = function(value){
        // nothing to do.
    };

    function zoom(step, cx, cy)
    {
         // get the image data
        var imageData = app.gBaseContext.getImageData( 
        		0, 0, 
    			app.gImage.getSize()[0], 
    			app.gImage.getSize()[1]); 
       
        // copy it to the draw context
        app.gDrawContext.clearRect(
        		0, 0, 
        		app.gImage.getSize()[0],
        		app.gImage.getSize()[1]);
        app.gDrawContext.putImageData(imageData, 0, 0);
        
        // save base settings
        app.gBaseContext.save();

        // translate the base context
        app.gBaseContext.clearRect(
        		0, 0, 
        		app.gImage.getSize()[0],
        		app.gImage.getSize()[1]);
        var zoom = Math.pow(1.1,step);
        
        app.gBaseContext.translate(cx, cy);
        app.gBaseContext.scale( zoom, zoom );
        app.gBaseContext.translate(-cx, -cy);
        
        // put the draw canvas in the base context
        app.gBaseContext.drawImage(app.gDrawCanvas, 0, 0);
        
        // restore base settings
        app.gBaseContext.restore();
    }

} // tools_zoom
