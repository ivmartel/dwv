import {ListenerHandler} from '../utils/listen.js';
import {
  ThresholdFilter,
  SobelFilter,
  SharpenFilter
} from '../image/filter.js';
import {RunFilterCommand} from '../command/runFilterCommand.js';

/**
 * @import {App} from '../app/application.js';
 */

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
  #filterList;

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
        this.#filterList[key].addEventListener('filterundo', this.#fireEvent);
      } else {
        this.#filterList[key].removeEventListener(
          'filterrun', this.#fireEvent);
        this.#filterList[key].removeEventListener(
          'filterundo', this.#fireEvent);
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
        throw new Error(`Unknown filter: '${features.filterName}'`);
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
   * @returns {object|undefined} The list of filter objects.
   */
  getFilterList() {
    return this.#filterList;
  }

  /**
   * Check if a filter is in the filter list.
   *
   * @param {string} name The name to check.
   * @returns {boolean} True if the filter is present.
   */
  hasFilter(name) {
    return this.#filterList?.[name] !== undefined;
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
      const image = this.#app.getData(args.dataId).image;
      this.#filter.setOriginalImage(image);
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
    const image = this.#app.getData(args.dataId).image;
    filter.setOriginalImage(image);
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
    const image = this.#app.getData(args.dataId).image;
    filter.setOriginalImage(image);
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
