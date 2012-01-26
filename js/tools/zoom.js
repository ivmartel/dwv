/**
* zoom.js
* Zooming tool.
*/
tool.Zoom = function(app)
{
    var self = this;
    this.started = false;
    this.zoomX = 1;
    this.zoomY = 1;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        // first position
        self.x0 = ev._x;
        self.y0 = ev._y;
     };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }

        // calculate translation
        var tx = self.zoomX * (ev._x - self.x0);
        var ty = self.zoomY * (ev._y - self.y0);
        // apply translation
        app.getImageLayer().setTranslate(tx,ty);
        app.getImageLayer().draw();
    	// reset origin point
        self.x0 = ev._x;
        self.y0 = ev._y;
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            // store the last move
        	self.mousemove(ev);
        	// stop recording
            self.started = false;
        }
    };
    
    // This is called when you use the mouse wheel.
    this.DOMMouseScroll = function(ev){
        zoom(ev.detail, ev._x, ev._y);
    };

    this.mousewheel = function(ev){
        zoom(ev.wheelDelta/1200, ev._x, ev._y);
    };
    
    this.enable = function(value){
        // nothing to do.
    };

    this.keydown = function(event){
    	app.handleKeyDown(event);
    };

    function zoom(step, cx, cy)
    {
        /*
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
        */
    	
    	var zoom = 1 + step/2;
    	console.log("step:"+step)
    	console.log("zoom:"+zoom)
        // apply zoom
        app.getImageLayer().setZoom(zoom,zoom,cx,cy);
        app.getImageLayer().draw();
    }

}; // Zoom function
