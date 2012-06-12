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
    // paths are stored in reverse order
    var path = new dwv.math.Path();
    var currentPath = new dwv.math.Path();
    var parentPoints = [];
    var tolerance = 5;
    
    clearParentPoints = function() {
        for( var i = 0; i < app.getImage().getSize().getNumberOfRows(); ++i ) {
            parentPoints[i] = [];
        }
    };
    
    clearPaths = function() {
        path = new dwv.math.Path();
        currentPath = new dwv.math.Path();
    };
    
    var scissors = new dwv.math.Scissors();
    scissors.setDimensions(
        app.getImage().getSize().getNumberOfColumns(),
        app.getImage().getSize().getNumberOfRows() );
    scissors.setData(app.getImageData().data);
    
    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        // first time
        if( !self.started ) {
            self.started = true;
            self.x0 = ev._x;
            self.y0 = ev._y;
            // clear vars
            clearPaths();
            clearParentPoints();
            // do the training from the first point
            var p = new dwv.math.FastPoint2D(ev._x, ev._y);
            scissors.doTraining(p);
            // add the initial point to the path
            var p0 = new dwv.math.Point2D(ev._x, ev._y);
            path.addPoint(p0);
            path.addControlPoint(p0);
        }
        else {
            // final point: at 'tolerance' of the initial point
            if( (Math.abs(ev._x - self.x0) < tolerance) && (Math.abs(ev._y - self.y0) < tolerance) ) {
                // draw
                self.mousemove(ev);
                console.log("Done.");
                // save command in undo stack
                app.getUndoStack().add(command);
                // merge temporary layer
                app.getDrawLayer().merge(app.getTempLayer());
                // set flag
                self.started = false;
            }
            // anchor point
            else {
                path = currentPath;
                clearParentPoints();
                var pn = new dwv.math.FastPoint2D(ev._x, ev._y);
                scissors.doTraining(pn);
                path.addControlPoint(currentPath.getPoint(0));
            }
        }
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }
        // set the point to find the path to
        var p = new dwv.math.FastPoint2D(ev._x, ev._y);
        scissors.setPoint(p);
        // do the work
        var results = 0;
        var stop = false;
        while( !parentPoints[p.y][p.x] && !stop)
        {
            console.log("Getting ready...");
            results = scissors.doWork();
            
            if( results.length === 0 ) { 
                stop = true;
            }
            else {
                // fill parents
                for( var i = 0; i < results.length-1; i+=2 ) {
                    var _p = results[i];
                    var _q = results[i+1];
                    parentPoints[_p.y][_p.x] = _q;
                }
            }
        }
        console.log("Ready!");
        
        // get the path
        currentPath = new dwv.math.Path();
        stop = false;
        while (p && !stop) {
            currentPath.addPoint(new dwv.math.Point2D(p.x, p.y));
            if(!parentPoints[p.y]) { 
                stop = true;
            }
            else { 
                if(!parentPoints[p.y][p.x]) { 
                    stop = true;
                }
                else {
                    p = parentPoints[p.y][p.x];
                }
            }
        }
        currentPath.appenPath(path);
        
        // create draw command
        command = new dwv.tool.DrawLivewireCommand(currentPath, app);
        // clear the temporary layer
        app.getTempLayer().clearContextRect();
        // draw
        command.execute();
    };

    // This is called when you release the mouse button.
    this.mouseup = function(ev){
        // nothing to do
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
        var p = livewire.getPoint(0);
        context.moveTo( p.getX(), p.getY());
        for( var i=1; i < livewire.getLength(); ++i ) {
            p = livewire.getPoint(i);
            context.lineTo( p.getX(), p.getY());
        }
        for( var j=0; j < livewire.controlPointIndexArray.length; ++j ) { 
            p = livewire.getPoint(livewire.controlPointIndexArray[j]);
            context.fillRect(p.getX(), p.getY(), 5, 5);
        }
        context.stroke();
        //context.closePath();
    }; 
}; // DrawLivewireCommand class
