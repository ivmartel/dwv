/**
 * @namespace Tool classes.
 */
dwv.tool = dwv.tool || {};
/**
 * @namespace Filter classes.
 */
dwv.tool.filter = dwv.tool.filter || {};

/**
* @class Filter tool.
*/
dwv.tool.Filter = function(app)
{
    this.filter = {};
    this.selectedFilter = 0;
    this.defaultFilterName = 'threshold';
};

dwv.tool.Filter.prototype.enable = function(bool)
{
    if( bool ) {
        dwv.gui.appendFilterHtml();
        this.init();
    }
    else {
        dwv.gui.clearFilterHtml();
    }
};

dwv.tool.Filter.prototype.keydown = function(event)
{
    app.handleKeyDown(event);
};

dwv.tool.Filter.prototype.getSelectedFilter = function() {
    return this.selectedFilter;
};

dwv.tool.Filter.prototype.setSelectedFilter = function(name) {
    // disable old one
    if( this.selectedFilter )
    {
        this.enableFilter(false);
    }
    // enable new one
    this.selectedFilter = new this.filters[name](app);
    this.enableFilter(true);
};

dwv.tool.Filter.prototype.hasFilter = function(name) {
    return this.filters[name];
};

dwv.tool.Filter.prototype.init = function()
{
    // filter list
    this.filters = {
        'threshold': dwv.tool.filter.Threshold,
        'sharpen': dwv.tool.filter.Sharpen,
        'sobel': dwv.tool.filter.Sobel
    };

    // Activate the default filter
    if (this.filters[this.defaultFilterName])
    {
        this.setSelectedFilter(this.defaultFilterName);
    }
};

dwv.tool.Filter.prototype.enableFilter= function(value)
{
    // enable selected filter
    this.selectedFilter.enable(value);
};

// The event handler for any changes made to the filter selector.
dwv.tool.Filter.prototype.eventFilterChange = function(event)
{
    filterName = this.value;
    if( app.getToolBox().getSelectedTool().hasFilter(filterName) )
    {
        app.getToolBox().getSelectedTool().setSelectedFilter(filterName);
    }
    else
    {
        throw new Error("Unknown filter: '" + filterName + "'");
    }
};

/**
* @class Threshold filter tool.
*/
dwv.tool.filter.Threshold = function(app) {};

dwv.tool.filter.Threshold.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.displayThreshold();
    }
    else { 
        dwv.gui.clearSubFilterDiv();
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

/**
* @class Sharpen filter tool.
*/
dwv.tool.filter.Sharpen = function(app) {};

dwv.tool.filter.Sharpen.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.displaySharpen();
    }
    else { 
        dwv.gui.clearSubFilterDiv();
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

/**
* @class Sobel filter tool.
*/
dwv.tool.filter.Sobel = function(app) {};

dwv.tool.filter.Sobel.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.displaySobel();
    }
    else { 
        dwv.gui.clearSubFilterDiv();
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
        filter.update();
    }; 
}; // RunFilterCommand class
