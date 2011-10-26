/**
* zoom.js
* Zooming tool.
*/
tool.Zoom = function(app)
{
    var self = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        self.x0 = ev._x;
        self.y0 = ev._y;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            // zoom mode
            self.x0 = ev._x;
            self.y0 = ev._y;
            return;
        }

        var drawContext = app.getDrawLayer().getContext();
        var tempContext = app.getTempLayer().getContext();
        var tempCanvas = app.getTempLayer().getCanvas();
        
        // get the image data
        var imageData = drawContext.getImageData( 
    			0, 0, 
    			app.getImage().getSize()[0], 
    			app.getImage().getSize()[1]); 
       
        // copy it to the draw context
        app.getTempLayer().clearContextRect();
        tempContext.putImageData(imageData, 0, 0);
        
        // save base settings
        drawContext.save();

        // translate the base context
        app.getDrawLayer().clearContextRect();
        var tx = ev._x - self.x0;
        var ty = ev._y - self.y0;
        drawContext.translate( tx, ty );
		
        // put the draw canvas in the base context
        drawContext.drawImage(tempCanvas, 0, 0);
        
        // restore base settings
        drawContext.restore();
        
        // do not cumulate
        self.x0 = ev._x;
        self.y0 = ev._y;
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            self.mousemove(ev);
            self.started = false;
        }
    };
    
    // This is called when you use the mouse wheel.
    this.DOMMouseScroll = function(ev){
        zoom(ev.detail, self.x0, self.y0);
    };

    this.mousewheel = function(ev){
        zoom(ev.wheelDelta/40, self.x0, self.y0);
    };
    
    this.enable = function(value){
        // nothing to do.
    };

    function zoom(step, cx, cy)
    {
        var drawContext = app.getDrawLayer().getContext();
        var tempContext = app.getTempLayer().getContext();
        var tempCanvas = app.getTempLayer().getCanvas();

        // get the image data
        var imageData = drawContext.getImageData( 
        		0, 0, 
    			app.getImage().getSize()[0], 
    			app.getImage().getSize()[1]); 
       
        // copy it to the draw context
        app.getTempLayer().clearContextRect();
        tempContext.putImageData(imageData, 0, 0);
        
        // save base settings
        drawContext.save();

        // translate the base context
        app.getDrawLayer().clearContextRect();
        var zoom = Math.pow(1.1,step);
        
        drawContext.translate(cx, cy);
        drawContext.scale( zoom, zoom );
        drawContext.translate(-cx, -cy);
        
        // put the draw canvas in the base context
        drawContext.drawImage(tempCanvas, 0, 0);
        
        // restore base settings
        drawContext.restore();
    }

}; // Zoom function
