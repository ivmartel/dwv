/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
* roi.js
* Region of interest painting tool.
*/
dwv.tool.Roi = function(app)
{
    var self = this;
    this.started = false;
    var roi = null;

    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;

        var context = app.getTempLayer().getContext();
        context.strokeStyle = app.getStyle().getLineColor();
        context.fillStyle = app.getStyle().getLineColor();
        // start the roi
        context.beginPath();
        context.moveTo(ev._x, ev._y);
        // store it as object
        roi = new dwv.math.ROI();
        roi.addPoint(new dwv.math.Point2D(ev._x, ev._y));
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }
        // clear the temporary layer
        var context = app.getTempLayer().getContext();
        // continue roi
        context.lineTo(ev._x, ev._y);
        context.stroke();
        // store roi point
        roi.addPoint(new dwv.math.Point2D(ev._x, ev._y));
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            // draw
            self.mousemove(ev);
            // close the roi
            var context = app.getTempLayer().getContext();
            context.closePath();
            context.stroke();
            // save command in undo stack
            var command = new dwv.tool.DrawRoiCommand(roi, app);
            app.getUndoStack().add(command);
            // set flag
            self.started = false;
             // merge temporary layer
            app.getDrawLayer().merge(app.getTempLayer());
        }
    };
        
    this.enable = function(value){
        if( value ) {
            dwv.tool.draw.appendColourChooserHtml(app);
        }
        else {
            dwv.tool.draw.clearColourChooserHtml();
        }
    };

    this.keydown = function(event){
        app.handleKeyDown(event);
    };

}; // Roi function

/**
 * Draw ROI command.
 * @param roi The ROI to draw.
 * @param app The application to draw the line on.
 */
dwv.tool.DrawRoiCommand = function(roi, app)
{
    // app members can change 
    var lineColor = app.getStyle().getLineColor();
    var context = app.getTempLayer().getContext();
    
    // command name
    var name = "DrawRoiCommand";
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        // style
        context.fillStyle = lineColor;
        context.strokeStyle = lineColor;
        // path
        context.beginPath();
        context.moveTo(
                roi.getPoint(0).getX(), 
                roi.getPoint(0).getY());
        for( var i = 1; i < roi.getLength(); ++i )
        {
            context.lineTo(
                    roi.getPoint(i).getX(), 
                    roi.getPoint(i).getY());
            context.stroke();
        }
        context.closePath();
        context.stroke();
    }; 
}; // Roi command class
