/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
* @fileOverview Zooming tool.
*/

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

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            // stop recording
            self.started = false;
        }
    };
    
    // This is called when you use the mouse wheel on Firefox.
    this.DOMMouseScroll = function(ev){
        zoom(ev.detail/10, ev._x, ev._y);
    };

    // This is called when you use the mouse wheel.
    this.mousewheel = function(ev){
        zoom(ev.wheelDelta/1200, ev._x, ev._y);
    };
    
    // Enable method.
    this.enable = function(bool){
        if( bool ) { 
            this.appendHtml();
        }
        else { 
            this.clearHtml();
        }
    };

    // Keyboard shortcut.
    this.keydown = function(event){
        app.handleKeyDown(event);
    };

    // Really do the zoom
    function zoom(step, cx, cy)
    {
        var zoomLevel = 1 + step/2;
        // apply zoom
        app.getImageLayer().zoom(zoomLevel,zoomLevel,cx,cy);
        app.getDrawLayer().zoom(zoomLevel,zoomLevel,cx,cy);
    }

}; // Zoom class

dwv.tool.Zoom.prototype.appendHtml = function()
{
    var div = document.createElement("div");
    div.id = 'zoomResetDiv';
    
    var paragraph = document.createElement("p");  
    paragraph.id = 'zoomReset';
    paragraph.name = 'zoomReset';
    
    var button = document.createElement("button");
    button.id = "zoomResetButton";
    button.name = "zoomResetButton";
    button.onclick = dwv.tool.zoomReset;
    var text = document.createTextNode('Reset');
    button.appendChild(text);
    
    paragraph.appendChild(button);
    div.appendChild(paragraph);
    document.getElementById('toolbox').appendChild(div);
};

dwv.tool.Zoom.prototype.clearHtml = function()
{
    // find the tool specific node
    var node = document.getElementById('zoomResetDiv');
    // delete its content
    while (node.hasChildNodes()) { 
        node.removeChild(node.firstChild);
    }
    // remove the tool specific node
    var top = document.getElementById('toolbox');
    top.removeChild(node);
};
