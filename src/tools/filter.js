/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};
/**
 * @namespace Filter classes.
 */
dwv.tool.filter = dwv.tool.filter || {};

dwv.tool.filter.threshold = function(min, max)
{
    var imageMin = app.getImage().getLookup().rescaleIntercept;
    var threshFunction = function(x){
        if(x<min||x>max) { return imageMin; } 
        else { return x; }
    };
    var newImage = app.getImage().transform( threshFunction );
    
    app.setImage(newImage);
    app.generateAndDrawImage();
};

dwv.tool.filter.sharpen = function()
{
    var newImage = app.getImage().convolute(
        [  0, -1,  0,
          -1,  5, -1,
           0, -1,  0 ] );
    
    app.setImage(newImage);
    app.generateAndDrawImage();
};

dwv.tool.filter.sobel = function()
{
    var gradX = app.getImage().convolute(
        [ 1,  0,  -1,
          2,  0,  -2,
          1,  0,  -1 ] );

    var gradY = app.getImage().convolute(
        [  1,  2,  1,
           0,  0,  0,
          -1, -2, -1 ] );
    
    var sobel = gradX.compose( gradY, function(x,y){return Math.sqrt(x*x+y*y);} );
    
    app.setImage(sobel);
    app.generateAndDrawImage();
};


/**
 * @function
 */
dwv.tool.displayFilter = function(id)
{    
    var filterUI = 0;
    dwv.gui.clearSubFilterDiv();
    
    switch (id)
    {
        case 1: // threshold
            filterUI = new dwv.gui.Threshold();
            break;
        case 2: // sharpen
            filterUI = new dwv.gui.Sharpen();
            break;
        case 3: // sobel
            filterUI = new dwv.gui.Sobel();
            break;
    }
    
    filterUI.display();
};

/**
* @class Filter tool.
*/
dwv.tool.Filter = function(app)
{
    this.enable = function(bool){
        if( bool ) {
            dwv.gui.appendFilterHtml();
        }
        else {
            dwv.gui.clearFilterHtml();
        }
    };

    this.keydown = function(event){
        app.handleKeyDown(event);
    };
};

/**
 * @class Run filter command.
 * @param filter The filter to run.
 * @param app The application to draw the line on.
 */
dwv.tool.RunFilterCommand = function(filter, app)
{
    // command name
    var name = "RunFilterCommand";
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        filter.run(app.getImage().getBuffer(), args);
    }; 
}; // RunFilterCommand class
