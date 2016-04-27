// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
/** @namespace */
dwv.tool.filter = dwv.tool.filter || {};

/**
 * Filter tool.
 * @constructor
 * @param {Array} filterList The list of filter objects.
 * @param {Object} app The associated app.
 */
dwv.tool.Filter = function ( filterList, app )
{
    /**
     * Filter GUI.
     * @type Object
     */
    var gui = null;
    /**
     * Filter list
     * @type Object
     */
    this.filterList = filterList;
    /**
     * Selected filter.
     * @type Object
     */
    this.selectedFilter = 0;
    /**
     * Default filter name.
     * @type String
     */
    this.defaultFilterName = 0;
    /**
     * Display Flag.
     * @type Boolean
     */
    this.displayed = false;

    /**
     * Setup the filter GUI.
     */
    this.setup = function ()
    {
        if ( Object.keys(this.filterList).length !== 0 ) {
            gui = new dwv.gui.Filter(app);
            gui.setup(this.filterList);
            for( var key in this.filterList ){
                this.filterList[key].setup();
            }
        }
    };

    /**
     * Enable the filter.
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function (bool)
    {
        if ( gui ) {
            gui.display(bool);
        }
        this.displayed = bool;
        // display the selected filter
        this.selectedFilter.display(bool);
    };

    /**
     * Initialise the filter.
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
        if ( gui ) {
            gui.initialise();
        }
        return true;
    };

    /**
     * Handle keydown event.
     * @param {Object} event The keydown event.
     */
    this.keydown = function (event)
    {
        app.onKeydown(event);
    };

}; // class dwv.tool.Filter

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwv.tool.Filter.prototype.getHelp = function ()
{
    return {
        "title": dwv.i18n("tool.filter.name"),
        "brief": dwv.i18n("tool.filter.brief")
    };
};

/**
 * Get the selected filter.
 * @return {Object} The selected filter.
 */
dwv.tool.Filter.prototype.getSelectedFilter = function ()
{
    return this.selectedFilter;
};

/**
 * Set the selected filter.
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
 * @return {Array} The list of filter objects.
 */
dwv.tool.Filter.prototype.getFilterList = function ()
{
    return this.filterList;
};

/**
 * Check if a filter is in the filter list.
 * @param {String} name The name to check.
 * @return {String} The filter list element for the given name.
 */
dwv.tool.Filter.prototype.hasFilter = function (name)
{
    return this.filterList[name];
};

/**
 * Threshold filter tool.
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Threshold = function ( app )
{
    /**
     * Filter GUI.
     * @type Object
     */
    var gui = new dwv.gui.Threshold(app);

    /**
     * Setup the filter GUI.
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Display the filter.
     * @param {Boolean} bool Flag to display or not.
     */
    this.display = function (bool)
    {
        gui.display(bool);
    };

    /**
     * Initialise the filter.
     */
    this.init = function ()
    {
        gui.initialise();
    };

    /**
     * Run the filter.
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
        app.addToUndoStack(command);
    };

}; // class dwv.tool.filter.Threshold


/**
 * Sharpen filter tool.
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sharpen = function ( app )
{
    /**
     * Filter GUI.
     * @type Object
     */
    var gui = new dwv.gui.Sharpen(app);

    /**
     * Setup the filter GUI.
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Display the filter.
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function (bool)
    {
        gui.display(bool);
    };

    /**
     * Initialise the filter.
     */
    this.init = function()
    {
        // nothing to do...
    };

    /**
     * Run the filter.
     * @param {Mixed} args The filter arguments.
     */
    this.run = function(/*args*/)
    {
        var filter = new dwv.image.filter.Sharpen();
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.execute();
        // save command in undo stack
        app.addToUndoStack(command);
    };

}; // dwv.tool.filter.Sharpen

/**
 * Sobel filter tool.
 * @constructor
 * @param {Object} app The associated application.
 */
dwv.tool.filter.Sobel = function ( app )
{
    /**
     * Filter GUI.
     * @type Object
     */
    var gui = new dwv.gui.Sobel(app);

    /**
     * Setup the filter GUI.
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Enable the filter.
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function(bool)
    {
        gui.display(bool);
    };

    /**
     * Initialise the filter.
     */
    this.init = function()
    {
        // nothing to do...
    };

    /**
     * Run the filter.
     * @param {Mixed} args The filter arguments.
     */
    dwv.tool.filter.Sobel.prototype.run = function(/*args*/)
    {
        var filter = new dwv.image.filter.Sobel();
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.execute();
        // save command in undo stack
        app.addToUndoStack(command);
    };

}; // class dwv.tool.filter.Sobel

/**
 * Run filter command.
 * @constructor
 * @param {Object} filter The filter to run.
 * @param {Object} app The associated application.
 */
dwv.tool.RunFilterCommand = function (filter, app) {

    /**
     * Get the command name.
     * @return {String} The command name.
     */
    this.getName = function () { return "Filter-" + filter.getName(); };

    /**
     * Execute the command.
     */
    this.execute = function ()
    {
        filter.setOriginalImage(app.getImage());
        app.setImage(filter.update());
        app.render();
    };
    /**
     * Undo the command.
     */
    this.undo = function () {
        app.setImage(filter.getOriginalImage());
        app.render();
    };

}; // RunFilterCommand class
