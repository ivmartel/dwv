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
 * @param {Array} filterList The list of filter objects.
 * @param {Object} gui The associated gui.
 */
dwv.tool.Filter = function ( filterList, app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Filter(app);
    /**
     * Filter list
     * @property filterList
     * @type Object
     */
    this.filterList = filterList;
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
    /**
     * Display Flag.
     * @property displayed
     * @type Boolean
     */
    this.displayed = false;
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        if ( Object.keys(this.filterList).length !== 0 ) {
            gui.setup(this.filterList);
            for( var key in this.filterList ){
                this.filterList[key].setup();
            }
        }
    };

    /**
     * Enable the filter.
     * @method enable
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function (bool)
    {
        gui.display(bool);
        this.displayed = bool;
        // display the selected filter
        this.selectedFilter.display(bool);
    };

    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function ()
    {
        // set the default to the first in the list
        for( var key in this.filterList ){
            this.defaultFilterName = key;
            break;
        }
        this.setSelectedFilter(this.defaultFilterName);
        // init all filters
        for( key in this.filterList ) {
            this.filterList[key].init();
        }    
        // init html
        gui.initialise();
    };

}; // class dwv.tool.Filter

/**
 * Help for this tool.
 * @method getHelp
 * @returns {Object} The help content.
 */
dwv.tool.Filter.prototype.getHelp = function ()
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
 * Get the selected filter.
 * @method getSelectedFilter
 * @return {Object} The selected filter.
 */
dwv.tool.Filter.prototype.getSelectedFilter = function ()
{
    return this.selectedFilter;
};

/**
 * Set the selected filter.
 * @method setSelectedFilter
 * @return {String} The name of the filter to select.
 */
dwv.tool.Filter.prototype.setSelectedFilter = function (name)
{
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
    this.selectedFilter = this.filterList[name];
    // display the selected filter
    if( this.displayed )
    {
        this.selectedFilter.display(true);
    }
};

/**
 * Get the list of filters.
 * @method getFilterList
 * @return {Array} The list of filter objects.
 */
dwv.tool.Filter.prototype.getFilterList = function ()
{
    return this.filterList;
};

/**
 * Check if a filter is in the filter list.
 * @method hasFilter
 * @param {String} name The name to check.
 * @return {String} The filter list element for the given name.
 */
dwv.tool.Filter.prototype.hasFilter = function (name)
{
    return this.filterList[name];
};

/**
 * Handle keydown event.
 * @method keydown
 * @param {Object} event The keydown event.
 */
dwv.tool.Filter.prototype.keydown = function (event)
{
    app.onKeydown(event);
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
dwv.tool.filter.Threshold = function ( app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Threshold(app);
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Display the filter.
     * @method display
     * @param {Boolean} bool Flag to display or not.
     */
    this.display = function (bool)
    {
        gui.display(bool);
    };
    
    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function ()
    {
        gui.initialise();
    };
    
    /**
     * Run the filter.
     * @method run
     * @param {Mixed} args The filter arguments.
     */
    this.run = function (args)
    {
        var filter = new dwv.image.filter.Threshold();
        filter.setMin(args.min);
        filter.setMax(args.max);
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.execute();
        // save command in undo stack
        app.getUndoStack().add(command);
    };
    
}; // class dwv.tool.filter.Threshold


/**
 * Sharpen filter tool.
 * @class Sharpen
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sharpen = function ( app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Sharpen(app);
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Display the filter.
     * @method display
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function (bool)
    {
        gui.display(bool);
    };
    
    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function()
    {
        // nothing to do...
    };
    
    /**
     * Run the filter.
     * @method run
     * @param {Mixed} args The filter arguments.
     */
    this.run = function(/*args*/)
    {
        var filter = new dwv.image.filter.Sharpen();
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.execute();
        // save command in undo stack
        app.getUndoStack().add(command);
    };

}; // dwv.tool.filter.Sharpen

/**
 * Sobel filter tool.
 * @class Sobel
 * @namespace dwv.tool.filter
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sobel = function ( app )
{
    /**
     * Filter GUI.
     * @property gui
     * @type Object
     */
    var gui = new dwv.gui.Sobel(app);
    
    /**
     * Setup the filter GUI.
     * @method setup
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Enable the filter.
     * @method enable
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function(bool)
    {
        gui.display(bool);
    };
    
    /**
     * Initialise the filter.
     * @method init
     */
    this.init = function()
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

}; // class dwv.tool.filter.Sobel

/**
 * Run filter command.
 * @class RunFilterCommand
 * @namespace dwv.tool
 * @constructor
 * @param {Object} filter The filter to run.
 * @param {Object} app The associated application.
 */
dwv.tool.RunFilterCommand = function (filter, app) {
    
    /**
     * Get the command name.
     * @method getName
     * @return {String} The command name.
     */
    this.getName = function () { return "Filter-" + filter.getName(); };

    /**
     * Execute the command.
     * @method execute
     */
    this.execute = function ()
    {
        app.setImage(filter.update());
        app.render();
    }; 
    /**
     * Undo the command.
     * @method undo
     */
    this.undo = function () {
        app.setImage(filter.getOriginalImage());
        app.render();
    };
    
}; // RunFilterCommand class
