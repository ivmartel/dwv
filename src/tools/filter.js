//! @namespace Main DWV namespace.
var dwv = dwv || {};
//! @namespace Tool classes.
dwv.tool = dwv.tool || {};

//filter list: to be completed after each tool definition 
dwv.tool.filters = {};

/**
* @class Filter tool.
*/
dwv.tool.Filter = function(app)
{
    this.selectedFilter = 0;
    this.defaultFilterName = 0;
};

dwv.tool.Filter.prototype.enable = function(bool)
{
    if( bool ) {
        dwv.gui.appendFilterHtml();
        this.init();
    }
    else {
        if( this.selectedFilter )
        {
            this.selectedFilter.enable(false);
        }
        dwv.gui.clearFilterHtml();
    }
};

dwv.tool.Filter.prototype.getSelectedFilter = function() {
    return this.selectedFilter;
};

dwv.tool.Filter.prototype.setSelectedFilter = function(name) {
    // check if we have it
    if( !this.hasFilter(name) )
    {
        throw new Error("Unknown filter: '" + name + "'");
    }
    // disable last selected
    if( this.selectedFilter )
    {
        this.selectedFilter.enable(false);
    }
    // enable new one
    this.selectedFilter = new dwv.tool.filters[name](app);
    this.selectedFilter.enable(true);
};

dwv.tool.Filter.prototype.hasFilter = function(name) {
    return dwv.tool.filters[name];
};

dwv.tool.Filter.prototype.init = function()
{
    // set the default to the first in the list
    for( var key in dwv.tool.filters ){
        this.defaultFilterName = key;
        break;
    }
    this.setSelectedFilter(this.defaultFilterName);
};

dwv.tool.Filter.prototype.keydown = function(event){
    app.handleKeyDown(event);
};

/**
 * @namespace Filter classes.
 */
dwv.tool.filter = dwv.tool.filter || {};

/**
* @class Threshold filter tool.
*/
dwv.tool.filter.Threshold = function(app) {};

dwv.tool.filter.Threshold.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.appendThresholdHtml();
    }
    else { 
        dwv.gui.filter.clearThresholdHtml();
    }
};

dwv.tool.filter.Threshold.prototype.run = function(args)
{
    var filter = new dwv.image.filter.Threshold();
    filter.setMin(args.min);
    filter.setMax(args.max);
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

// Add the tool to the list
dwv.tool.filters.threshold = dwv.tool.filter.Threshold;

/**
* @class Sharpen filter tool.
*/
dwv.tool.filter.Sharpen = function(app) {};

dwv.tool.filter.Sharpen.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.appendSharpenHtml();
    }
    else { 
        dwv.gui.filter.clearSharpenHtml();
    }
};

dwv.tool.filter.Sharpen.prototype.run = function(args)
{
    var filter = new dwv.image.filter.Sharpen();
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

// Add the tool to the list
dwv.tool.filters.sharpen = dwv.tool.filter.Sharpen;

/**
* @class Sobel filter tool.
*/
dwv.tool.filter.Sobel = function(app) {};

dwv.tool.filter.Sobel.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.appendSobelHtml();
    }
    else { 
        dwv.gui.filter.clearSobelHtml();
    }
};

dwv.tool.filter.Sobel.prototype.run = function(args)
{
    var filter = new dwv.image.filter.Sobel();
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

//Add the tool to the list
dwv.tool.filters.sobel = dwv.tool.filter.Sobel;

//Add the filters to the tools
dwv.tool.tools.filter = dwv.tool.Filter;

/**
 * @class Run filter command.
 * @param filter The filter to run.
 * @param app The application to draw the line on.
 */
dwv.tool.RunFilterCommand = function(filter, app)
{
    // command name
    var name = "RunFilter: " + filter.getName();
    this.setName = function(str) { name = str; };
    this.getName = function() { return name; };

    // main method
    this.execute = function()
    {
        app.setImage(filter.update());
        app.generateAndDrawImage();
    }; 
}; // RunFilterCommand class
