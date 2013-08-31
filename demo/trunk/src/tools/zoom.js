/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
 * @function
 */
dwv.tool.zoomReset = function(event)
{
    app.getImageLayer().resetLayout();
    app.getImageLayer().draw();
    app.getDrawLayer().resetLayout();
    app.getDrawLayer().draw();
};

/**
 * @class Zoom class.
 */
dwv.tool.Zoom = function(app)
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

     this.twotouchdown = function(ev){
         self.started = true;
         // first line
         var point0 = new dwv.math.Point2D(ev._x, ev._y);
         var point1 = new dwv.math.Point2D(ev._x1, ev._y1);
         self.line0 = new dwv.math.Line(point0, point1);
         self.midPoint = self.line0.getMidpoint();         
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
        app.getImageLayer().translate(tx,ty);
        app.getDrawLayer().translate(tx,ty);
        
        // reset origin point
        self.x0 = ev._x;
        self.y0 = ev._y;
    };

    this.twotouchmove = function(ev){
       if (!self.started)
       {
           return;
       }
       var point0 = new dwv.math.Point2D(ev._x, ev._y);
       var point1 = new dwv.math.Point2D(ev._x1, ev._y1);
       var newLine = new dwv.math.Line(point0, point1);
       var lineDiff = ( newLine.getLength() - self.line0.getLength() ) / 1000;
       zoom(lineDiff, self.midPoint.getX(), self.midPoint.getY());
    };
    
    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };
    
    this.mouseout = function(ev){
        self.mouseup(ev);
    };

    this.touchstart = function(ev){
        if( event.targetTouches.length === 1 ){
            self.mousedown(ev);
        }
        else if( event.targetTouches.length === 2 ){
            self.twotouchdown(ev);
        }
    };

    this.touchmove = function(ev){
        if( event.targetTouches.length === 1 ){
            self.mousemove(ev);
        }
        else if( event.targetTouches.length === 2 ){
            self.twotouchmove(ev);
        }
    };

    this.touchend = function(ev){
        self.mouseup(ev);
    };

    // This is called when you use the mouse wheel on Firefox.
    this.DOMMouseScroll = function(ev){
        // ev.detail on firefox is 3
        zoom(ev.detail/30, ev._x, ev._y);
    };

    // This is called when you use the mouse wheel.
    this.mousewheel = function(ev){
        // ev.wheelDelta on chrome is 120
        zoom(ev.wheelDelta/1200, ev._x, ev._y);
    };
    
    // Enable method.
    this.enable = function(bool){
        if( bool ) { 
            dwv.gui.appendZoomHtml();
        }
        else { 
            dwv.gui.clearZoomHtml();
        }
    };

    // Keyboard shortcut.
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    // Really do the zoom
    // A good step is of 0.1.
    function zoom(step, cx, cy)
    {
        var zoomLevel = 1 + step;
        // apply zoom
        app.setLayersZoom(zoomLevel,zoomLevel,cx,cy);
     }

}; // Zoom class

//Add the tool to the list
dwv.tool.tools["zoom"] = dwv.tool.Zoom;
