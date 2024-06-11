import {ListenerHandler} from '../utils/listen';
import {
  Threshold as ThresholdFilter,
  Sobel as SobelFilter,
  Sharpen as SharpenFilter
} from '../image/filter';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

/**
 * Filter tool.
 */
export class Filter {

  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Filter list.
   *
   * @type {object}
   */
  #filterList = null;

  /**
   * Selected filter.
   *
   * @type {object}
   */
  #selectedFilter = 0;

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Activate the tool.
   *
   * @param {boolean} bool Flag to activate or not.
   */
  activate(bool) {
    // setup event listening
    for (const key in this.#filterList) {
      if (bool) {
        this.#filterList[key].addEventListener('filterrun', this.#fireEvent);
        this.#filterList[key].addEventListener('filter-undo', this.#fireEvent);
      } else {
        this.#filterList[key].removeEventListener(
          'filterrun', this.#fireEvent);
        this.#filterList[key].removeEventListener(
          'filter-undo', this.#fireEvent);
      }
    }
  }

  /**
   * Set the tool options.
   *
   * @param {object} options The list of filter names amd classes.
   */
  setOptions(options) {
    this.#filterList = {};
    // try to instanciate filters from the options
    for (const key in options) {
      this.#filterList[key] = new options[key](this.#app);
    }
  }

  /**
   * Get the type of tool options: here 'instance' since the filter
   * list contains instances of each possible filter.
   *
   * @returns {string} The type.
   */
  getOptionsType() {
    return 'instance';
  }

  /**
   * Initialise the filter. Called once the image is loaded.
   */
  init() {
    // setup event listening
    for (const key in this.#filterList) {
      this.#filterList[key].init();
    }
  }

  /**
   * Handle keydown event.
   *
   * @param {object} event The keydown event.
   */
  keydown = (event) => {
    event.context = 'Filter';
    this.#app.onKeydown(event);
  };

  /**
   * Get the list of event names that this tool can fire.
   *
   * @returns {string[]} The list of event names.
   */
  getEventNames() {
    return ['filterrun', 'filterundo'];
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type.
   */
  removeEventListener(type, callback) {
    this.#listenerHandler.remove(type, callback);
  }

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    this.#listenerHandler.fireEvent(event);
  };

  /**
   * Get the selected filter.
   *
   * @returns {object} The selected filter.
   */
  getSelectedFilter() {
    return this.#selectedFilter;
  }

  /**
   * Set the tool live features: filter name.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.filterName !== 'undefined') {
      // check if we have it
      if (!this.hasFilter(features.filterName)) {
        throw new Error('Unknown filter: \'' + features.filterName + '\'');
      }
      // de-activate last selected
      if (this.#selectedFilter) {
        this.#selectedFilter.activate(false);
      }
      // enable new one
      this.#selectedFilter = this.#filterList[features.filterName];
      // activate the selected filter
      this.#selectedFilter.activate(true);
    }
    if (typeof features.run !== 'undefined' && features.run) {
      let args = {};
      if (typeof features.runArgs !== 'undefined') {
        args = features.runArgs;
      }
      this.getSelectedFilter().run(args);
    }
  }

  /**
   * Get the list of filters.
   *
   * @returns {Array} The list of filter objects.
   */
  getFilterList() {
    return this.#filterList;
  }

  /**
   * Check if a filter is in the filter list.
   *
   * @param {string} name The name to check.
   * @returns {string} The filter list element for the given name.
   */
  hasFilter(name) {
    return this.#filterList[name];
  }

} // class Filter

/**
 * Threshold filter tool.
 */
export class Threshold {
  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Associated filter.
   *
   * @type {object}
   */
  #filter = new ThresholdFilter();

  /**
   * Flag to know wether to reset the image or not.
   *
   * @type {boolean}
   */
  #resetImage = true;

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Activate the filter.
   *
   * @param {boolean} bool Flag to activate or not.
   */
  activate(bool) {
    // reset the image when the tool is activated
    if (bool) {
      this.#resetImage = true;
    }
  }

  /**
   * Initialise the filter. Called once the image is loaded.
   */
  init() {
    // does nothing
  }

  /**
   * Run the filter.
   *
   * @param {*} args The filter arguments.
   */
  run(args) {
    if (typeof args.dataId === 'undefined') {
      throw new Error('No dataId to run threshod filter on.');
    }
    this.#filter.setMin(args.min);
    this.#filter.setMax(args.max);
    // reset the image if asked
    if (this.#resetImage) {
      this.#filter.setOriginalImage(this.#app.getImage(args.dataId));
      this.#resetImage = false;
    }
    const command = new RunFilterCommand(this.#filter, args.dataId, this.#app);
    command.onExecute = this.#fireEvent;
    command.onUndo = this.#fireEvent;
    command.execute();
    // save command in undo stack
    this.#app.addToUndoStack(command);
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *  event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type.
   */
  removeEventListener(type, callback) {
    this.#listenerHandler.remove(type, callback);
  }

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    this.#listenerHandler.fireEvent(event);
  };

} // class Threshold

/**
 * Sharpen filter tool.
 */
export class Sharpen {
  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Activate the filter.
   *
   * @param {boolean} _bool Flag to activate or not.
   */
  activate(_bool) {
    // does nothing
  }

  /**
   * Initialise the filter. Called once the image is loaded.
   */
  init() {
    // does nothing
  }

  /**
   * Run the filter.
   *
   * @param {*} args The filter arguments.
   */
  run(args) {
    if (typeof args.dataId === 'undefined') {
      throw new Error('No dataId to run sharpen filter on.');
    }
    const filter = new SharpenFilter();
    filter.setOriginalImage(this.#app.getImage(args.dataId));
    const command = new RunFilterCommand(filter, args.dataId, this.#app);
    command.onExecute = this.#fireEvent;
    command.onUndo = this.#fireEvent;
    command.execute();
    // save command in undo stack
    this.#app.addToUndoStack(command);
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *    event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type.
   */
  removeEventListener(type, callback) {
    this.#listenerHandler.remove(type, callback);
  }

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    this.#listenerHandler.fireEvent(event);
  };

} // filter.Sharpen

/**
 * Sobel filter tool.
 */
export class Sobel {
  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Activate the filter.
   *
   * @param {boolean} _bool Flag to activate or not.
   */
  activate(_bool) {
    // does nothing
  }

  /**
   * Initialise the filter. Called once the image is loaded.
   */
  init() {
    // does nothing
  }

  /**
   * Run the filter.
   *
   * @param {*} args The filter arguments.
   */
  run(args) {
    if (typeof args.dataId === 'undefined') {
      throw new Error('No dataId to run sobel filter on.');
    }
    const filter = new SobelFilter();
    filter.setOriginalImage(this.#app.getImage(args.dataId));
    const command = new RunFilterCommand(filter, args.dataId, this.#app);
    command.onExecute = this.#fireEvent;
    command.onUndo = this.#fireEvent;
    command.execute();
    // save command in undo stack
    this.#app.addToUndoStack(command);
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *  event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {Function} callback The function associated with the provided
   *   event type.
   */
  removeEventListener(type, callback) {
    this.#listenerHandler.remove(type, callback);
  }

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    this.#listenerHandler.fireEvent(event);
  };

} // class filter.Sobel

/**
 * Run filter command.
 */
export class RunFilterCommand {

  /**
   * The filter to run.
   *
   * @type {object}
   */
  #filter;

  /**
   * Data id.
   *
   * @type {string}
   */
  #dataId;

  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {object} filter The filter to run.
   * @param {string} dataId The data to filter.
   * @param {App} app The associated application.
   */
  constructor(filter, dataId, app) {
    this.#filter = filter;
    this.#dataId = dataId;
    this.#app = app;
  }

  /**
   * Get the command name.
   *
   * @returns {string} The command name.
   */
  getName() {
    return 'Filter-' + this.#filter.getName();
  }

  /**
   * Execute the command.
   *
   * @fires RunFilterCommand#filterrun
   */
  execute() {
    // run filter and set app image
    this.#app.setImage(this.#dataId, this.#filter.update());
    // update display
    this.#app.render(this.#dataId);
    /**
     * Filter run event.
     *
     * @event RunFilterCommand#filterrun
     * @type {object}
     * @property {string} type The event type: filterrun.
     * @property {number} id The id of the run command.
     */
    const event = {
      type: 'filterrun',
      id: this.getName(),
      dataId: this.#dataId
    };
    // callback
    this.onExecute(event);
  }

  /**
   * Undo the command.
   *
   * @fires RunFilterCommand#filterundo
   */
  undo() {
    // reset the image
    this.#app.setImage(this.#dataId, this.#filter.getOriginalImage());
    // update display
    this.#app.render(this.#dataId);
    /**
     * Filter undo event.
     *
     * @event RunFilterCommand#filterundo
     * @type {object}
     * @property {string} type The event type: filterundo.
     * @property {number} id The id of the undone run command.
     */
    const event = {
      type: 'filterundo',
      id: this.getName(),
      dataid: this.#dataId
    }; // callback
    this.onUndo(event);
  }

  /**
   * Handle an execute event.
   *
   * @param {object} _event The execute event with type and id.
   */
  onExecute(_event) {
    // default does nothing.
  }

  /**
   * Handle an undo event.
   *
   * @param {object} _event The undo event with type and id.
   */
  onUndo(_event) {
    // default does nothing.
  }

} // RunFilterCommand class
