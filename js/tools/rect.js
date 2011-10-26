/**
* rect.js
* Rectangle painting tool.
*/
tool.Rect = function(app)
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
            return;
        }

        var x = Math.min(ev._x, self.x0);
        var y = Math.min(ev._y, self.y0);
        var w = Math.abs(ev._x - self.x0);
        var h = Math.abs(ev._y - self.y0);

        if (!w || !h)
        {
            return;
        }

    	var context = app.getTempLayer().getContext();
        var style = app.getStyle();
        
        app.getTempLayer().clearContextRect();
        context.fillStyle = style.getLineColor();
        context.strokeStyle = style.getLineColor();

        context.beginPath();
        context.strokeRect(x, y, w, h);
    
        // surface
        var surf = Math.round((w*app.getImage().getSpacing()[0])*(h*app.getImage().getSpacing()[1]));
        context.font = style.getFontStr();
        context.fillText(
        		surf+"mm2",
        		ev._x + style.getFontSize(), 
        		ev._y + style.getFontSize());
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            self.mousemove(ev);
            self.started = false;
            app.mergeTempLayer();
        }
    };
        
    this.enable = function(value){
        if( value ) tool.draw.appendColourChooserHtml(app);
        else tool.draw.clearColourChooserHtml();
    };

}; // Rect function
