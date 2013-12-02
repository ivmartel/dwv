/** 
 * Tool module.
 * @module tool
 */
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

// Filter list: to be completed after each tool definition 
dwv.tool.filters = dwv.tool.filters || {};

/**
 * Filter tool.
 * @class Filter
 * @namespace dwv.tool
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.Filter = function(app)
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
};

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Filter.getHelp = function()
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
    // disable last selected
    if( this.selectedFilter )
    {
        this.selectedFilter.enable(false);
    }
    // enable new one
    this.selectedFilter = new dwv.tool.filters[name](app);
    this.selectedFilter.enable(true);
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
dwv.tool.filter.Threshold = function(app) {};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} value Flag to enable or not.
 */
dwv.tool.filter.Threshold.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.appendThresholdHtml();
    }
    else { 
        dwv.gui.filter.clearThresholdHtml();
    }
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

// Add the filter to the filter list
dwv.tool.filters.threshold = dwv.tool.filter.Threshold;

/**
 * Sharpen filter tool.
 * @class Sharpen
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sharpen = function(app) {};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} value Flag to enable or not.
 */
dwv.tool.filter.Sharpen.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.appendSharpenHtml();
    }
    else { 
        dwv.gui.filter.clearSharpenHtml();
    }
};

/**
 * Run the filter.
 * @method run
 * @param {Mixed} args The filter arguments.
 */
dwv.tool.filter.Sharpen.prototype.run = function(args)
{
    var filter = new dwv.image.filter.Sharpen();
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

// Add the filter to the filter list
dwv.tool.filters.sharpen = dwv.tool.filter.Sharpen;

/**
 * Sobel filter tool.
 * @class Sharpen
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sobel = function(app) {};

/**
 * Enable the filter.
 * @method enable
 * @param {Boolean} value Flag to enable or not.
 */
dwv.tool.filter.Sobel.prototype.enable = function(value)
{
    if( value ) {
        dwv.gui.filter.appendSobelHtml();
    }
    else { 
        dwv.gui.filter.clearSobelHtml();
    }
};

/**
 * Run the filter.
 * @method run
 * @param {Mixed} args The filter arguments.
 */
dwv.tool.filter.Sobel.prototype.run = function(args)
{
    var filter = new dwv.image.filter.Sobel();
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.execute();
    // save command in undo stack
    app.getUndoStack().add(command);
};

// Add the filter to the filter list
dwv.tool.filters.sobel = dwv.tool.filter.Sobel;

// Add the tool to the tool list
dwv.tool.tools = dwv.tool.tools || {};
dwv.tool.tools.filter = dwv.tool.Filter;

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
