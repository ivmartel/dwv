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
    
    var parents = [];
    // init parents
    parents = [];
    for( var i = 0; i < app.getImage().getSize().getNumberOfRows(); ++i ) {
        parents[i] = [];
    }
    
    var scissors = new dwv.math.Scissors();
    scissors.setDimensions(
        app.getImage().getSize().getNumberOfColumns(),
        app.getImage().getSize().getNumberOfRows() );
    scissors.setData(app.getImageData().data);
    
    // This is called when you start holding down the mouse button.
    this.mousedown = function(ev){
        self.started = true;
        self.x0 = ev._x;
        self.y0 = ev._y;
        
        var p = new dwv.math.FastPoint2D(ev._x, ev._y);
        scissors.doTraining(p);
        
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }
        
        var p = new dwv.math.FastPoint2D(ev._x, ev._y);
        scissors.setPoint(p);
        
        var results = 0;
        var stop = false;
        while( !parents[p.y][p.x] && !stop)
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
                    parents[_p.y][_p.x] = _q;
                }
            }
        }
        console.log("Ready!");
        
        // get path
        var path = [];
        stop = false;
        while (p && !stop) {
            path.push(new dwv.math.Point2D(p.x, p.y));
            if(!parents[p.y]) { 
                stop = true;
            }
            else { 
                if(!parents[p.y][p.x]) { 
                    stop = true;
                }
                else {
                    p = parents[p.y][p.x];
                }
            }
        }
        
        // create livewire
        var livewire = new dwv.math.Path(path);
        // create draw command
        command = new dwv.tool.DrawLivewireCommand(livewire, app);
        // clear the temporary layer
        app.getTempLayer().clearContextRect();
        // draw
        command.execute();
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
        var p = livewire.getPoint(0);
        context.moveTo( p.getX(), p.getY());
        for( var i=1; i < livewire.getLength(); ++i ) {
            p = livewire.getPoint(i);
            context.lineTo( p.getX(), p.getY());
        }
        context.stroke();
        //context.closePath();
    }; 
}; // DrawLivewireCommand class
