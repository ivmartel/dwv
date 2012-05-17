/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};

/**
* @class Livewire painting tool.
*/
dwv.tool.Livewire = function(app)
{
    var self = this;
    this.started = false;
    var command = null;
    
    var scissors = new Scissors();
    scissors.setDimensions(
        app.getImage().getSize().getNumberOfColumns(),
        app.getImage().getSize().getNumberOfRows() );
    scissors.setData(app.getImageData().data);
    
    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        self.x0 = ev._x;
        self.y0 = ev._y;
        var p = new Point(ev._x, ev._y);
        scissors.doTraining(p);
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }
        
        var p0 = new Point(ev._x, ev._y);

        scissors.setPoint(p0);
        var results = scissors.doWork();

        var parentPoints = [];
        for ( var i = 0; i < app.getImageLayer().getCanvas().height; i++ ) {
            var a = [];
            parentPoints.push(a);
        }
        
        for ( i = 0; i < results.length; i += 2 ) {
            var p = results[i]; 
            var q = results[i+1];
            parentPoints[p.y][p.x] = q;
        }
        
        var subpath = [];
        
        while (p0) {
            subpath.push(new Point(p0.x, p0.y));
            p0 = parentPoints[p0.y][p0.x];
        }

        for (  i = 0; i < subpath.length; i++ ) {
            var idx = (subpath[i].y*app.getImageData().width + subpath[i].x)*4;
            
            // Set pixel color
            for ( var j = 0; j < 4; j++ ) {
                app.getImageData().data[idx+j] = app.getStyle().getLineColor();
            }
        }

        
        
        /*// points
        var beginPoint = new dwv.math.Point2D(self.x0, self.y0);
        var endPoint = new dwv.math.Point2D(ev._x, ev._y);
        // check for equality
        if( beginPoint.equal(endPoint) )
        {
            return;
        }
        // create livewire
        var livewire = new dwv.math.Line(beginPoint, endPoint);
        // create draw command
        command = new dwv.tool.DrawLivewireCommand(livewire, app);
        // clear the temporary layer
        app.getTempLayer().clearContextRect();
        // draw
        command.execute();*/
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        if (self.started)
        {
            if( ev._x!==self.x0 && ev._y!==self.y0) {
                // draw
                self.mousemove(ev);
                // save command in undo stack
                app.getUndoStack().add(command);
                // merge temporary layer
                app.getDrawLayer().merge(app.getTempLayer());
            }
            // set flag
            self.started = false;
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

}; // Livewire class

/**
 * @class Draw livewire command.
 * @param livewire The livewire to draw.
 * @param app The application to draw the livewire on.
 */
dwv.tool.DrawLivewireCommand = function(livewire, app)
{
    // app members can change 
    var livewireColor = app.getStyle().getLineColor();
    var context = app.getTempLayer().getContext();
    
    // command name
    var name = "DrawLivewireCommand";
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        // style
        context.fillStyle = livewireColor;
        context.strokeStyle = livewireColor;
        // path
        context.beginPath();
        context.moveTo( livewire.getBegin().getX(), livewire.getBegin().getY());
        context.lineTo( livewire.getEnd().getX(), livewire.getEnd().getY());
        context.stroke();
        context.closePath();
        // length
        var length = livewire.getWorldLength( 
            app.getImage().getSpacing().getColumnSpacing(), 
            app.getImage().getSpacing().getRowSpacing() );
        context.font = app.getStyle().getFontStr();
        context.fillText( Math.round(length) + "mm",
                livewire.getEnd().getX() + app.getStyle().getFontSize(),
                livewire.getEnd().getY() + app.getStyle().getFontSize());
    }; 
}; // DrawLivewireCommand class
