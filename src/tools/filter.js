/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};
/**
 * @namespace Filter classes.
 */
dwv.tool.filter = dwv.tool.filter || {};

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
