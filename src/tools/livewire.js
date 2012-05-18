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
    var path = [];
    
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
        console.log("p: "+p);
        scissors.doTraining(p);
    };

    // This function is called every time you move the mouse.
    this.mousemove = function(ev){
        if (!self.started)
        {
            return;
        }
        
        var i = 0;
        
        var p = new Point(ev._x, ev._y);
        scissors.setPoint(p);
        console.log("new p: "+p);

        var results = scissors.doWork();
        console.log("results: "+results);
        
        // init parents
        var parents = [];
        for( i = 0; i < app.getImage().getSize().getNumberOfRows(); ++i ) {
            parents[i] = [];
        }
        
        // fill parents
        for( i = 0; i < results.length-1; i+=2 ) {
            var _p = results[i];
            if( _p.x === p.x && _p.y === p.y ) {
                console.log("found match in results.");
            }
            var _q = results[i+1];
            parents[_p.y][_p.x] = _q;
        }
        //console.log("parents: "+parents);
        
        // get path
        i = 0;
        p = results[2];
        while (p) {
            console.log(i++);
            path.push(new dwv.math.Point2D(p.x, p.y));
            if(!parents[p.y]) { 
                console.log("No parent y...");
            }
            else { 
                console.log("number parents y: "+parents[p.y].length); 
                //console.log("parents y: "+parents[p.y]); 
                if(!parents[p.y][p.x]) { 
                    console.log("No parent x..."); 
                }
                else {
                    console.log("Got parent!");
                }
            }
            console.log(parents[p.y][p.x]); 
            p = parents[p.y][p.x];
        }
        
        /*// points
        var beginPoint = new dwv.math.Point2D(self.x0, self.y0);
        var endPoint = new dwv.math.Point2D(ev._x, ev._y);
        // check for equality
        if( beginPoint.equal(endPoint) )
        {
            return;
        }*/
        
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
        for( var i=0; i < livewire.getLength()-1; ++i ) {
            var begin = livewire.getPoint(i);
            var end = livewire.getPoint(i+1);
            context.beginPath();
            context.moveTo( begin.getX(), begin.getY());
            context.lineTo( end.getX(), end.getY());
            context.stroke();
            context.closePath();
        }
    }; 
}; // DrawLivewireCommand class
