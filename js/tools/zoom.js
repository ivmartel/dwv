/**
* zoom.js
* Zooming tool.
*/
tool.Zoom = function(app)
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
        var imageData = app.getBaseContext().getImageData( 
    			0, 0, 
    			app.getImage().getSize()[0], 
    			app.getImage().getSize()[1]); 
       
        // copy it to the draw context
        app.getDrawContext().clearRect(
        		0, 0, 
        		app.getImage().getSize()[0],
        		app.getImage().getSize()[1]);
        app.getDrawContext().putImageData(imageData, 0, 0);
        
        // save base settings
        app.getBaseContext().save();

        // translate the base context
        app.getBaseContext().clearRect(
        		0, 0, 
        		app.getImage().getSize()[0],
        		app.getImage().getSize()[1]);
        var tx = ev._x - tool.x0;
        var ty = ev._y - tool.y0;
        app.getBaseContext().translate( tx, ty );
		
        // put the draw canvas in the base context
        app.getBaseContext().drawImage(app.getDrawCanvas(), 0, 0);
        
        // restore base settings
        app.getBaseContext().restore();
        
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
        var imageData = app.getBaseContext().getImageData( 
        		0, 0, 
    			app.getImage().getSize()[0], 
    			app.getImage().getSize()[1]); 
       
        // copy it to the draw context
        app.getDrawContext().clearRect(
        		0, 0, 
        		app.getImage().getSize()[0],
        		app.getImage().getSize()[1]);
        app.getDrawContext().putImageData(imageData, 0, 0);
        
        // save base settings
        app.getBaseContext().save();

        // translate the base context
        app.getBaseContext().clearRect(
        		0, 0, 
        		app.getImage().getSize()[0],
        		app.getImage().getSize()[1]);
        var zoom = Math.pow(1.1,step);
        
        app.getBaseContext().translate(cx, cy);
        app.getBaseContext().scale( zoom, zoom );
        app.getBaseContext().translate(-cx, -cy);
        
        // put the draw canvas in the base context
        app.getBaseContext().drawImage(app.getDrawCanvas(), 0, 0);
        
        // restore base settings
        app.getBaseContext().restore();
    }

}; // Zoom function
