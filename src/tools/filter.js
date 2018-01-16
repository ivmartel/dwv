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
     * Listener handler.
     * @type Object
     */
    var listenerHandler = new dwv.utils.ListenerHandler();

    /**
     * Setup the filter GUI. Called at app startup.
     */
    this.setup = function ()
    {
        if ( Object.keys(this.filterList).length !== 0 ) {
            gui = new dwv.gui.Filter(app);
            gui.setup(this.filterList);
            for( var key in this.filterList ){
                this.filterList[key].setup();
                this.filterList[key].addEventListener("filter-run", fireEvent);
                this.filterList[key].addEventListener("filter-undo", fireEvent);
            }
        }
    };

    /**
     * Display the tool.
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
     * Initialise the filter. Called once the image is loaded.
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

    /**
     * Add an event listener to this class.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type,
     *    will be called with the fired event.
     */
    this.addEventListener = function (type, callback) {
        listenerHandler.add(type, callback);
    };
    /**
     * Remove an event listener from this class.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type.
     */
    this.removeEventListener = function (type, callback) {
        listenerHandler.remove(type, callback);
    };
    /**
     * Fire an event: call all associated listeners with the input event object.
     * @param {Object} event The event to fire.
     * @private
     */
    function fireEvent (event) {
        listenerHandler.fireEvent(event);
    }

}; // class dwv.tool.Filter

/**
 * Help for this tool.
 * @return {Object} The help content.
 */
dwv.tool.Filter.prototype.getHelp = function ()
{
    return {
        "title": dwv.i18n("tool.Filter.name"),
        "brief": dwv.i18n("tool.Filter.brief")
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
    if ( !this.hasFilter(name) )
    {
        throw new Error("Unknown filter: '" + name + "'");
    }
    // hide last selected
    if ( this.displayed )
    {
        this.selectedFilter.display(false);
    }
    // enable new one
    this.selectedFilter = this.filterList[name];
    // display the selected filter
    if ( this.displayed )
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
     * Associated filter.
     * @type Object
     */
    var filter = new dwv.image.filter.Threshold();
    /**
     * Filter GUI.
     * @type Object
     */
    var gui = new dwv.gui.Threshold(app);
    /**
     * Flag to know wether to reset the image or not.
     * @type Boolean
     */
    var resetImage = true;
    /**
     * Listener handler.
     * @type Object
     */
    var listenerHandler = new dwv.utils.ListenerHandler();

    /**
     * Setup the filter GUI. Called at app startup.
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
        // reset the image when the tool is displayed
        if ( bool ) {
            resetImage = true;
        }
    };

    /**
     * Initialise the filter. Called once the image is loaded.
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
        filter.setMin(args.min);
        filter.setMax(args.max);
        // reset the image if asked
        if ( resetImage ) {
            filter.setOriginalImage(app.getImage());
            resetImage = false;
        }
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.onExecute = fireEvent;
        command.onUndo = fireEvent;
        command.execute();
        // save command in undo stack
        app.addToUndoStack(command);
    };

    /**
     * Add an event listener to this class.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type,
     *    will be called with the fired event.
     */
    this.addEventListener = function (type, callback) {
        listenerHandler.add(type, callback);
    };
    /**
     * Remove an event listener from this class.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type.
     */
    this.removeEventListener = function (type, callback) {
        listenerHandler.remove(type, callback);
    };
    /**
     * Fire an event: call all associated listeners with the input event object.
     * @param {Object} event The event to fire.
     * @private
     */
    function fireEvent (event) {
        listenerHandler.fireEvent(event);
    }

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
     * Listener handler.
     * @type Object
     */
    var listenerHandler = new dwv.utils.ListenerHandler();

    /**
     * Setup the filter GUI. Called at app startup.
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
     * Initialise the filter. Called once the image is loaded.
     */
    this.init = function ()
    {
        // nothing to do...
    };

    /**
     * Run the filter.
     * @param {Mixed} args The filter arguments.
     */
    this.run = function (/*args*/)
    {
        var filter = new dwv.image.filter.Sharpen();
        filter.setOriginalImage(app.getImage());
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.onExecute = fireEvent;
        command.onUndo = fireEvent;
        command.execute();
        // save command in undo stack
        app.addToUndoStack(command);
    };

    /**
     * Add an event listener to this class.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type,
     *    will be called with the fired event.
     */
    this.addEventListener = function (type, callback) {
        listenerHandler.add(type, callback);
    };
    /**
     * Remove an event listener from this class.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type.
     */
    this.removeEventListener = function (type, callback) {
        listenerHandler.remove(type, callback);
    };
    /**
     * Fire an event: call all associated listeners with the input event object.
     * @param {Object} event The event to fire.
     * @private
     */
    function fireEvent (event) {
        listenerHandler.fireEvent(event);
    }

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
     * Listener handler.
     * @type Object
     */
    var listenerHandler = new dwv.utils.ListenerHandler();

    /**
     * Setup the filter GUI. Called at app startup.
     */
    this.setup = function ()
    {
        gui.setup();
    };

    /**
     * Enable the filter.
     * @param {Boolean} bool Flag to enable or not.
     */
    this.display = function (bool)
    {
        gui.display(bool);
    };

    /**
     * Initialise the filter. Called once the image is loaded.
     */
    this.init = function ()
    {
        // nothing to do...
    };

    /**
     * Run the filter.
     * @param {Mixed} args The filter arguments.
     */
    dwv.tool.filter.Sobel.prototype.run = function (/*args*/)
    {
        var filter = new dwv.image.filter.Sobel();
        filter.setOriginalImage(app.getImage());
        var command = new dwv.tool.RunFilterCommand(filter, app);
        command.onExecute = fireEvent;
        command.onUndo = fireEvent;
        command.execute();
        // save command in undo stack
        app.addToUndoStack(command);
    };

    /**
     * Add an event listener to this class.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type,
     *    will be called with the fired event.
     */
    this.addEventListener = function (type, callback) {
        listenerHandler.add(type, callback);
    };
    /**
     * Remove an event listener from this class.
     * @param {String} type The event type.
     * @param {Object} callback The method associated with the provided event type.
     */
    this.removeEventListener = function (type, callback) {
        listenerHandler.remove(type, callback);
    };
    /**
     * Fire an event: call all associated listeners with the input event object.
     * @param {Object} event The event to fire.
     * @private
     */
    function fireEvent (event) {
        listenerHandler.fireEvent(event);
    }

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
        // run filter and set app image
        app.setImage(filter.update());
        // update display
        app.render();
        // callback
        this.onExecute({'type': 'filter-run', 'id': this.getName()});
    };

    /**
     * Undo the command.
     */
    this.undo = function () {
        // reset the image
        app.setImage(filter.getOriginalImage());
        // update display
        app.render();
        // callback
        this.onUndo({'type': 'filter-undo', 'id': this.getName()});
    };

}; // RunFilterCommand class

/**
 * Handle an execute event.
 * @param {Object} event The execute event with type and id.
 */
dwv.tool.RunFilterCommand.prototype.onExecute = function (/*event*/)
{
    // default does nothing.
};
/**
 * Handle an undo event.
 * @param {Object} event The undo event with type and id.
 */
dwv.tool.RunFilterCommand.prototype.onUndo = function (/*event*/)
{
    // default does nothing.
};
