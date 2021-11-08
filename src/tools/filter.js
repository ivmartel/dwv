// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
/** @namespace */
dwv.tool.filter = dwv.tool.filter || {};

/**
 * Filter tool.
 *
 * @class
 * @param {object} app The associated app.
 */
dwv.tool.Filter = function (app) {
  /**
   * Filter list
   *
   * @type {object}
   */
  this.filterList = null;
  /**
   * Selected filter.
   *
   * @type {object}
   */
  this.selectedFilter = 0;
  /**
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Activate the tool.
   *
   * @param {boolean} bool Flag to activate or not.
   */
  this.activate = function (bool) {
    // setup event listening
    for (var key in this.filterList) {
      if (bool) {
        this.filterList[key].addEventListener('filterrun', fireEvent);
        this.filterList[key].addEventListener('filter-undo', fireEvent);
      } else {
        this.filterList[key].removeEventListener('filterrun', fireEvent);
        this.filterList[key].removeEventListener('filter-undo', fireEvent);
      }
    }
  };

  /**
   * Set the tool options.
   *
   * @param {object} options The list of filter names amd classes.
   */
  this.setOptions = function (options) {
    this.filterList = {};
    // try to instanciate filters from the options
    for (var key in options) {
      this.filterList[key] = new options[key](app);
    }
  };

  /**
   * Initialise the filter. Called once the image is loaded.
   */
  this.init = function () {
    // setup event listening
    for (var key in this.filterList) {
      this.filterList[key].init();
    }
  };

  /**
   * Handle keydown event.
   *
   * @param {object} event The keydown event.
   */
  this.keydown = function (event) {
    event.context = 'dwv.tool.Filter';
    app.onKeydown(event);
  };

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type, will be called with the fired event.
   */
  this.addEventListener = function (type, callback) {
    listenerHandler.add(type, callback);
  };
  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, callback) {
    listenerHandler.remove(type, callback);
  };
  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    listenerHandler.fireEvent(event);
  }

}; // class dwv.tool.Filter

/**
 * Help for this tool.
 *
 * @returns {object} The help content.
 */
dwv.tool.Filter.prototype.getHelpKeys = function () {
  return {
    title: 'tool.Filter.name',
    brief: 'tool.Filter.brief'
  };
};

/**
 * Get the selected filter.
 *
 * @returns {object} The selected filter.
 */
dwv.tool.Filter.prototype.getSelectedFilter = function () {
  return this.selectedFilter;
};

/**
 * Set the selected filter.
 *
 * @param {string} name The name of the filter to select.
 */
dwv.tool.Filter.prototype.setSelectedFilter = function (name) {
  // check if we have it
  if (!this.hasFilter(name)) {
    throw new Error('Unknown filter: \'' + name + '\'');
  }
  // de-activate last selected
  if (this.selectedFilter) {
    this.selectedFilter.activate(false);
  }
  // enable new one
  this.selectedFilter = this.filterList[name];
  // activate the selected filter
  this.selectedFilter.activate(true);
};

/**
 * Get the list of filters.
 *
 * @returns {Array} The list of filter objects.
 */
dwv.tool.Filter.prototype.getFilterList = function () {
  return this.filterList;
};

/**
 * Check if a filter is in the filter list.
 *
 * @param {string} name The name to check.
 * @returns {string} The filter list element for the given name.
 */
dwv.tool.Filter.prototype.hasFilter = function (name) {
  return this.filterList[name];
};

/**
 * Threshold filter tool.
 *
 * @class
 * @param {object} app The associated application.
 */
dwv.tool.filter.Threshold = function (app) {
  /**
   * Associated filter.
   *
   * @type {object}
   * @private
   */
  var filter = new dwv.image.filter.Threshold();
  /**
   * Flag to know wether to reset the image or not.
   *
   * @type {boolean}
   * @private
   */
  var resetImage = true;
  /**
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Activate the filter.
   *
   * @param {boolean} bool Flag to activate or not.
   */
  this.activate = function (bool) {
    // reset the image when the tool is activated
    if (bool) {
      resetImage = true;
    }
  };

  /**
   * Initialise the filter. Called once the image is loaded.
   */
  this.init = function () {
    // does nothing
  };

  /**
   * Run the filter.
   *
   * @param {*} args The filter arguments.
   */
  this.run = function (args) {
    filter.setMin(args.min);
    filter.setMax(args.max);
    // reset the image if asked
    if (resetImage) {
      filter.setOriginalImage(app.getLastImage());
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
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *  event type, will be called with the fired event.
   */
  this.addEventListener = function (type, callback) {
    listenerHandler.add(type, callback);
  };
  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, callback) {
    listenerHandler.remove(type, callback);
  };
  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    listenerHandler.fireEvent(event);
  }

}; // class dwv.tool.filter.Threshold


/**
 * Sharpen filter tool.
 *
 * @class
 * @param {object} app The associated application.
 */
dwv.tool.filter.Sharpen = function (app) {
  /**
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Activate the filter.
   *
   * @param {boolean} _bool Flag to activate or not.
   */
  this.activate = function (_bool) {
    // does nothing
  };

  /**
   * Initialise the filter. Called once the image is loaded.
   */
  this.init = function () {
    // does nothing
  };

  /**
   * Run the filter.
   *
   * @param {*} _args The filter arguments.
   */
  this.run = function (_args) {
    var filter = new dwv.image.filter.Sharpen();
    filter.setOriginalImage(app.getLastImage());
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.onExecute = fireEvent;
    command.onUndo = fireEvent;
    command.execute();
    // save command in undo stack
    app.addToUndoStack(command);
  };

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *    event type, will be called with the fired event.
   */
  this.addEventListener = function (type, callback) {
    listenerHandler.add(type, callback);
  };
  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, callback) {
    listenerHandler.remove(type, callback);
  };
  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    listenerHandler.fireEvent(event);
  }

}; // dwv.tool.filter.Sharpen

/**
 * Sobel filter tool.
 *
 * @class
 * @param {object} app The associated application.
 */
dwv.tool.filter.Sobel = function (app) {
  /**
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Activate the filter.
   *
   * @param {boolean} _bool Flag to activate or not.
   */
  this.activate = function (_bool) {
    // does nothing
  };

  /**
   * Initialise the filter. Called once the image is loaded.
   */
  this.init = function () {
    // does nothing
  };

  /**
   * Run the filter.
   *
   * @param {*} _args The filter arguments.
   */
  dwv.tool.filter.Sobel.prototype.run = function (_args) {
    var filter = new dwv.image.filter.Sobel();
    filter.setOriginalImage(app.getLastImage());
    var command = new dwv.tool.RunFilterCommand(filter, app);
    command.onExecute = fireEvent;
    command.onUndo = fireEvent;
    command.execute();
    // save command in undo stack
    app.addToUndoStack(command);
  };

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *  event type, will be called with the fired event.
   */
  this.addEventListener = function (type, callback) {
    listenerHandler.add(type, callback);
  };
  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, callback) {
    listenerHandler.remove(type, callback);
  };
  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    listenerHandler.fireEvent(event);
  }

}; // class dwv.tool.filter.Sobel

/**
 * Run filter command.
 *
 * @class
 * @param {object} filter The filter to run.
 * @param {object} app The associated application.
 */
dwv.tool.RunFilterCommand = function (filter, app) {

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  this.getName = function () {
    return 'Filter-' + filter.getName();
  };

  /**
   * Execute the command.
   *
   * @fires dwv.tool.RunFilterCommand#filterrun
   */
  this.execute = function () {
    // run filter and set app image
    app.setLastImage(filter.update());
    // update display
    app.render();
    /**
     * Filter run event.
     *
     * @event dwv.tool.RunFilterCommand#filterrun
     * @type {object}
     * @property {string} type The event type: filterrun.
     * @property {number} id The id of the run command.
     */
    var event = {
      type: 'filterrun',
      id: this.getName()
    };
    // callback
    this.onExecute(event);
  };

  /**
   * Undo the command.
   *
   * @fires dwv.tool.RunFilterCommand#filterundo
   */
  this.undo = function () {
    // reset the image
    app.setLastImage(filter.getOriginalImage());
    // update display
    app.render();
    /**
     * Filter undo event.
     *
     * @event dwv.tool.RunFilterCommand#filterundo
     * @type {object}
     * @property {string} type The event type: filterundo.
     * @property {number} id The id of the undone run command.
     */
    var event = {
      type: 'filterundo',
      id: this.getName()
    }; // callback
    this.onUndo(event);
  };

}; // RunFilterCommand class

/**
 * Handle an execute event.
 *
 * @param {object} _event The execute event with type and id.
 */
dwv.tool.RunFilterCommand.prototype.onExecute = function (_event) {
  // default does nothing.
};
/**
 * Handle an undo event.
 *
 * @param {object} _event The undo event with type and id.
 */
dwv.tool.RunFilterCommand.prototype.onUndo = function (_event) {
  // default does nothing.
};
