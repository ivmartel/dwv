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
        var tx = (ev._x - self.x0);
        var ty = (ev._y - self.y0);
        // apply translation
        app.getImageLayer().setTranslate(tx,ty);
        app.getImageLayer().draw();
        app.getDrawLayer().setTranslate(tx,ty);
        app.getDrawLayer().draw();
        
        // reset origin point
        self.x0 = ev._x;
        self.y0 = ev._y;
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };
    
    // This is called when you use the mouse wheel.
    this.DOMMouseScroll = function(ev){
        zoom(ev.detail, ev._x, ev._y);
    };

    // This is called when you use the mouse wheel on Firefox.
    this.mousewheel = function(ev){
        zoom(ev.wheelDelta/1200, ev._x, ev._y);
    };
    
    // Enable method.
    this.enable = function(value){
        // nothing to do.
    };

    // Keyboard shortcut.
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    // Really do the zoom
    function zoom(step, cx, cy)
    {
        var zoom = 1 + step/2;
        // apply zoom
        app.getImageLayer().setZoom(zoom,zoom,cx,cy);
        app.getImageLayer().draw();
        app.getDrawLayer().setZoom(zoom,zoom,cx,cy);
        app.getDrawLayer().draw();
    }

}; // Zoom function
