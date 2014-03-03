/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Filter tool.
 * @class Filter
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Filter = function(/*app*/)
{
    /**
     * Selected filter.
     * @property selectedFilter
     * @type Object
     */
    this.selectedFilter = 0;
    /**
     * Default filter name.
     * @property defaultFilterName
     * @type String
     */
    this.defaultFilterName = 0;
    
    this.displayed = false;
};

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Filter.prototype.getHelp = function()
{
    return {
        'title': "Filter",
        'brief': "A few simple image filters are available: a Threshold filter to " +
            "limit the image intensities between a chosen minimum and maximum, " +
            "a Sharpen filter to convolute the image with a sharpen matrix, " +
            "a Sobel filter to get the gradient of the image in both directions."
    };
};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} bool Flag to enable or not.
 */
dwv.tool.Filter.prototype.display = function(bool)
{
    dwv.gui.displayFilterHtml(bool);
    this.displayed = bool;
    // display the selected filter
    this.selectedFilter.display(bool);
};

/**
 * Get the selected filter.
 * @method getSelectedFilter
 * @return {Object} The selected filter.
 */
dwv.tool.Filter.prototype.getSelectedFilter = function() {
    return this.selectedFilter;
};

/**
 * Set the selected filter.
 * @method setSelectedFilter
 * @return {String} The name of the filter to select.
 */
dwv.tool.Filter.prototype.setSelectedFilter = function(name) {
    // check if we have it
    if( !this.hasFilter(name) )
    {
        throw new Error("Unknown filter: '" + name + "'");
    }
    // hide last selected
    if( this.displayed )
    {
        this.selectedFilter.display(false);
    }
    // enable new one
    this.selectedFilter = dwv.tool.filters[name];
    // display the selected filter
    if( this.displayed )
    {
        this.selectedFilter.display(true);
    }
};

/**
 * Check if a filter is in the filter list.
 * @method hasFilter
 * @param {String} name The name to check.
 * @return {String} The filter list element for the given name.
 */
dwv.tool.Filter.prototype.hasFilter = function(name) {
    return dwv.tool.filters[name];
};

/**
 * Initialise the filter.
 * @method init
 */
dwv.tool.Filter.prototype.init = function()
{
    // set the default to the first in the list
    for( var key in dwv.tool.filters ){
        this.defaultFilterName = key;
        break;
    }
    this.setSelectedFilter(this.defaultFilterName);
    // init all filters
    for( key in dwv.tool.filters ) {
        dwv.tool.filters[key].init();
    }    
    // init html
    dwv.gui.initFilterHtml();
};

/**
 * Handle keydown event.
 * @method keydown
 * @param {Object} event The keydown event.
 */
dwv.tool.Filter.prototype.keydown = function(event){
    app.handleKeyDown(event);
};

// Filter namespace
dwv.tool.filter = dwv.tool.filter || {};

/**
 * Threshold filter tool.
 * @class Threshold
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Threshold = function(/*app*/) {};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} bool Flag to enable or not.
 */
dwv.tool.filter.Threshold.prototype.display = function(bool)
{
    dwv.gui.filter.displayThresholdHtml(bool);
};

dwv.tool.filter.Threshold.prototype.init = function()
{
    // init html
    dwv.gui.filter.initThresholdHtml();
};

/**
 * Run the filter.
 * @method run
 * @param {Mixed} args The filter arguments.
 */
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
 * Sharpen filter tool.
 * @class Sharpen
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sharpen = function(/*app*/) {};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} bool Flag to enable or not.
 */
dwv.tool.filter.Sharpen.prototype.display = function(bool)
{
    dwv.gui.filter.displaySharpenHtml(bool);
};

dwv.tool.filter.Sharpen.prototype.init = function()
{
    // nothing to do...
};

/**
 * Run the filter.
 * @method run
 * @param {Mixed} args The filter arguments.
 */
dwv.tool.filter.Sharpen.prototype.run = function(/*args*/)
{
    var filter = new dwv.image.filter.Sharpen();
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

/**
 * Sobel filter tool.
 * @class Sharpen
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sobel = function(/*app*/) {};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} bool Flag to enable or not.
 */
dwv.tool.filter.Sobel.prototype.display = function(bool)
{
    dwv.gui.filter.displaySobelHtml(bool);
};

dwv.tool.filter.Sobel.prototype.init = function()
{
    // nothing to do...
};

/**
 * Run the filter.
 * @method run
 * @param {Mixed} args The filter arguments.
 */
dwv.tool.filter.Sobel.prototype.run = function(/*args*/)
{
    var filter = new dwv.image.filter.Sobel();
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

/**
 * Run filter command.
 * @class RunFilterCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Object} filter The filter to run.
 * @param {Object} app The associated application.
 */
dwv.tool.RunFilterCommand = function(filter, app)
{
    /**
     * Command name.
     * @property name
     * @private
     * @type String
     */
    var name = "RunFilter: " + filter.getName();
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function() { return name; };
    /**
     * Set the command name.
     * @method setName
     * @param {String} str The command name.
     */
    this.setName = function(str) { name = str; };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function()
    {
        app.setImage(filter.update());
        app.generateAndDrawImage();
    }; 
}; // RunFilterCommand class
