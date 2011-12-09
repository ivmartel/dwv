/**
* zoom.js
* Zooming tool.
*/
tool.Zoom = function(app)
{
    var self = this;
    this.started = false;
    this.panX = 0;
    this.panY = 0;
    this.zoomf = 1;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        self.x0 = ev._x - self.panX;
        self.y0 = ev._y - self.panY;
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }

        var context = app.getImageLayer().getContext();
        
        // get the image data
        var imageData = app.getImageData();
       
        // translate the base context
        app.getImageLayer().clearContextRect();
        var tx = self.zoomf * (ev._x - self.x0);
        var ty = self.zoomf * (ev._y - self.y0);
        
        self.panX = tx;
        self.panY = ty;
		
        // put the draw canvas in the base context
        context.putImageData(imageData, tx, ty);
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
        zoom(ev.detail,  ev._x, ev._y);
    };

    this.mousewheel = function(ev){
        zoom(ev.wheelDelta/40, ev._x, ev._y);
    };
    
    this.enable = function(value){
        // nothing to do.
    };

    this.keydown = function(event){
    	app.handleKeyDown(event);
    };

    function zoom(step, cx, cy)
    {
        var context = app.getImageLayer().getContext();
        var tempContext = app.getTempLayer().getContext();
        var tempCanvas = app.getTempLayer().getCanvas();

        // get the image data
        var imageData = context.getImageData( 
        		0, 0, 
    			app.getImage().getSize()[0], 
    			app.getImage().getSize()[1]); 
        //var imageData = app.getImageData();
       
        // copy it to the temporary context
        app.getTempLayer().clearContextRect();
        tempContext.putImageData(imageData, 0, 0);
        
        // save base settings
        context.save();

        // translate the base context
        app.getImageLayer().clearContextRect();
        
        var localZoom = Math.pow(1.1, step);
        self.zoomf *= localZoom;
        context.translate(cx, cy);
        context.scale( localZoom, localZoom );
        
        // put the draw canvas in the base context
        context.drawImage(tempCanvas, 0, 0);

        context.translate(-cx*localZoom, -cy*localZoom);
        
        
        // restore base settings
        context.restore();
    }

}; // Zoom function
