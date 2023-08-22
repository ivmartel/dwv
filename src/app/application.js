import {viewEventNames} from '../image/view';
import {ViewFactory} from '../image/viewFactory';
import {luts} from '../image/luts';
import {getMatrixFromName} from '../math/matrix';
import {Point3D} from '../math/point';
import {Stage} from '../gui/stage';
import {Style} from '../gui/style';
import {getViewOrientation} from '../gui/layerGroup';
import {ListenerHandler} from '../utils/listen';
import {State} from '../io/state';
import {logger} from '../utils/logger';
import {getUriQuery, decodeQuery} from '../utils/uri';
import {UndoStack} from '../tools/undo';
import {ToolboxController} from './toolboxController';
import {LoadController} from './loadController';
import {DataController} from './dataController';

import {toolList, toolOptions} from '../tools';
import {binderList} from '../gui/stage';

// doc imports
/* eslint-disable no-unused-vars */
import {LayerGroup} from '../gui/layerGroup';
import {Image} from '../image/image';
import {ColourMap} from '../image/luts';
/* eslint-enable no-unused-vars */

/**
 * View configuration: mainly defines the ´divId´
 * of the associated HTML div.
 */
export class ViewConfig {
  /**
   * Associated HTML div id.
   *
   * @type {string}
   */
  divId;
  /**
   * Optional orientation of the data; 'axial', 'coronal' or 'sagittal'.
   * If undefined, will use the data aquisition plane.
   *
   * @type {string|undefined}
   */
  orientation;
  /**
   * Optional view colour map.
   *
   * @type {ColourMap|undefined}
   */
  colourMap;
  /**
   * Optional layer opacity; in [0, 1] range.
   *
   * @type {number|undefined}
   */
  opacity;

  /**
   * @param {string} divId The associated HTML div id.
   */
  constructor(divId) {
    this.divId = divId;
  }
}

/**
 * Tool configuration.
 */
export class ToolConfig {
  /**
   * Optional tool options.
   * For Draw: list of shape names.
   * For Filter: list of filter names.
   *
   * @type {string[]|undefined}
   */
  options;

  /**
   * @param {string[]} [options] Optional tool options.
   */
  constructor(options) {
    this.options = options;
  }
}

/**
 * Application options.
 */
export class AppOptions {
  /**
   * DataId indexed object containing the data view configurations.
   *
   * @type {Object<string, ViewConfig[]>}
   */
  dataViewConfigs;
  /**
   * Tool name indexed object containing individual tool configurations.
   *
   * @type {Object<string, ToolConfig>|undefined}
   */
  tools;
  /**
   * Optional array of layerGroup binder names.
   *
   * @type {string[]|undefined}
   */
  binders;
  /**
   * Optional boolean flag to trigger the first data render
   *   after the first loaded data or not. Defaults to true;
   *
   * @type {boolean|undefined}
   */
  viewOnFirstLoadItem;
  /**
   * Optional default chraracter set string used for DICOM parsing if
   * not passed in DICOM file.
   * Valid values: https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings
   *
   * @type {string|undefined}
   */
  defaultCharacterSet;

  /**
   * @param {Object<string, ViewConfig[]>} dataViewConfigs DataId
   *   indexed object containing the data view configurations.
   */
  constructor(dataViewConfigs) {
    this.dataViewConfigs = dataViewConfigs;
  }
}

/**
 * List of ViewConfigs indexed by dataIds.
 *
 * @typedef {Object<string, ViewConfig[]>} DataViewConfigs
 */

/**
 * Main application class.
 *
 * @example
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * const viewConfig0 = new ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new AppOptions(viewConfigs);
 * app.init(options);
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 */
export class App {

  /**
   * App options.
   *
   * @type {AppOptions}
   */
  #options = null;

  // data controller
  #dataController = null;

  // toolbox controller
  #toolboxController = null;

  // load controller
  #loadController = null;

  // stage
  #stage = null;

  // UndoStack
  #undoStack = null;

  // Generic style
  #style = new Style();

  /**
   * Listener handler.
   *
   * @type {object}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Get the image.
   *
   * @param {number} index The data index.
   * @returns {Image} The associated image.
   */
  getImage(index) {
    return this.#dataController.get(index).image;
  }

  /**
   * Get the last loaded image.
   *
   * @returns {Image} The image.
   */
  getLastImage() {
    return this.#dataController.get(this.#dataController.length() - 1).image;
  }

  /**
   * Set the image at the given index.
   *
   * @param {number} index The data index.
   * @param {Image} img The associated image.
   */
  setImage(index, img) {
    this.#dataController.setImage(index, img);
  }

  /**
   * Set the last image.
   *
   * @param {Image} img The associated image.
   */
  setLastImage(img) {
    this.#dataController.setImage(this.#dataController.length() - 1, img);
  }

  /**
   * Add a new image.
   *
   * @param {Image} image The new image.
   * @param {object} meta The image meta.
   * @returns {number} The new image id.
   */
  addNewImage(image, meta) {
    const id = this.#dataController.length();

    // load start event
    this.#fireEvent({
      type: 'loadstart',
      loadtype: 'image',
      source: 'internal',
      loadid: id
    });

    // add image to data controller
    this.#dataController.addNew(id, image, meta);

    // load item event
    this.#fireEvent({
      type: 'loaditem',
      loadtype: 'image',
      data: meta,
      source: 'internal',
      loadid: id,
      isfirstitem: true
    });

    // optional render
    if (this.#options.viewOnFirstLoadItem) {
      this.render(id);
    }

    // load events
    this.#fireEvent({
      type: 'load',
      loadtype: 'image',
      source: 'internal',
      loadid: id
    });
    this.#fireEvent({
      type: 'loadend',
      loadtype: 'image',
      source: 'internal',
      loadid: id
    });

    return id;
  }

  /**
   * Get the meta data.
   *
   * @param {number} index The data index.
   * @returns {object} The list of meta data.
   */
  getMetaData(index) {
    return this.#dataController.get(index).meta;
  }

  /**
   * Get the number of loaded data.
   *
   * @returns {number} The number.
   */
  getNumberOfLoadedData() {
    return this.#dataController.length();
  }

  /**
   * Can the data be scrolled?
   *
   * @returns {boolean} True if the data has a third dimension greater than one.
   */
  canScroll() {
    const viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    const controller = viewLayer.getViewController();
    return controller.canScroll();
  }

  /**
   * Can window and level be applied to the data?
   *
   * @returns {boolean} True if the data is monochrome.
   */
  canWindowLevel() {
    const viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    const controller = viewLayer.getViewController();
    return controller.canWindowLevel();
  }

  /**
   * Get the layer scale on top of the base scale.
   *
   * @returns {object} The scale as {x,y}.
   */
  getAddedScale() {
    return this.#stage.getActiveLayerGroup().getAddedScale();
  }

  /**
   * Get the base scale.
   *
   * @returns {object} The scale as {x,y}.
   */
  getBaseScale() {
    return this.#stage.getActiveLayerGroup().getBaseScale();
  }

  /**
   * Get the layer offset.
   *
   * @returns {object} The offset.
   */
  getOffset() {
    return this.#stage.getActiveLayerGroup().getOffset();
  }

  /**
   * Get the toolbox controller.
   *
   * @returns {object} The controller.
   */
  getToolboxController() {
    return this.#toolboxController;
  }

  /**
   * Get the active layer group.
   * The layer is available after the first loaded item.
   *
   * @returns {LayerGroup} The layer group.
   */
  getActiveLayerGroup() {
    return this.#stage.getActiveLayerGroup();
  }

  /**
   * Get the view layers associated to a data index.
   * The layer are available after the first loaded item.
   *
   * @param {number} index The data index.
   * @returns {Array} The layers.
   */
  getViewLayersByDataIndex(index) {
    return this.#stage.getViewLayersByDataIndex(index);
  }

  /**
   * Get the draw layers associated to a data index.
   * The layer are available after the first loaded item.
   *
   * @param {number} index The data index.
   * @returns {Array} The layers.
   */
  getDrawLayersByDataIndex(index) {
    return this.#stage.getDrawLayersByDataIndex(index);
  }

  /**
   * Get a layer group by div id.
   * The layer is available after the first loaded item.
   *
   * @param {string} divId The div id.
   * @returns {LayerGroup} The layer group.
   */
  getLayerGroupByDivId(divId) {
    return this.#stage.getLayerGroupByDivId(divId);
  }

  /**
   * Get the number of layer groups.
   *
   * @returns {number} The number of groups.
   */
  getNumberOfLayerGroups() {
    return this.#stage.getNumberOfLayerGroups();
  }

  /**
   * Get the app style.
   *
   * @returns {object} The app style.
   */
  getStyle() {
    return this.#style;
  }

  /**
   * Add a command to the undo stack.
   *
   * @param {object} cmd The command to add.
   * @fires UndoStack#undoadd
   * @function
   */
  addToUndoStack = (cmd) => {
    if (this.#undoStack !== null) {
      this.#undoStack.add(cmd);
    }
  };

  /**
   * Initialise the application.
   *
   * @param {AppOptions} opt The application options
   * @example
   * // create the dwv app
   * const app = new dwv.App();
   * // initialise
   * const viewConfig0 = new ViewConfig('layerGroup0');
   * const viewConfigs = {'*': [viewConfig0]};
   * const options = new AppOptions(viewConfigs);
   * options.viewOnFirstLoadItem = false;
   * app.init(options);
   * // render button
   * const button = document.createElement('button');
   * button.id = 'render';
   * button.disabled = true;
   * button.appendChild(document.createTextNode('render'));
   * document.body.appendChild(button);
   * app.addEventListener('load', function () {
   *   const button = document.getElementById('render');
   *   button.disabled = false;
   *   button.onclick = function () {
   *     // render data #0
   *     app.render(0);
   *   };
   * });
   * // load dicom data
   * app.loadURLs([
   *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
   * ]);
   */
  init(opt) {
    // store
    this.#options = opt;
    // defaults
    if (typeof this.#options.viewOnFirstLoadItem === 'undefined') {
      this.#options.viewOnFirstLoadItem = true;
    }

    // undo stack
    this.#undoStack = new UndoStack();
    this.#undoStack.addEventListener('undoadd', this.#fireEvent);
    this.#undoStack.addEventListener('undo', this.#fireEvent);
    this.#undoStack.addEventListener('redo', this.#fireEvent);

    // tools
    if (typeof this.#options.tools !== 'undefined') {
      // setup the tool list
      const appToolList = {};
      const keys = Object.keys(this.#options.tools);
      for (let t = 0; t < keys.length; ++t) {
        const toolName = keys[t];
        // find the tool in the Tools list
        if (typeof toolList[toolName] !== 'undefined') {
          // create tool instance
          appToolList[toolName] = new toolList[toolName](this);
          // register listeners
          if (typeof appToolList[toolName].addEventListener !== 'undefined') {
            const names = appToolList[toolName].getEventNames();
            for (let j = 0; j < names.length; ++j) {
              appToolList[toolName].addEventListener(names[j], this.#fireEvent);
            }
          }
          // tool options
          const toolParams = this.#options.tools[toolName];
          if (typeof toolParams.options !== 'undefined' &&
            toolParams.options.length !== 0) {
            let type = 'raw';
            if (typeof appToolList[toolName].getOptionsType !== 'undefined') {
              type = appToolList[toolName].getOptionsType();
            }
            let appToolOptions;
            if (type === 'instance' || type === 'factory') {
              appToolOptions = {};
              for (let i = 0; i < toolParams.options.length; ++i) {
                const optionName = toolParams.options[i];
                let optionClassName = optionName;
                if (type === 'factory') {
                  optionClassName += 'Factory';
                }
                const toolNamespace = toolName.charAt(0).toLowerCase() +
                  toolName.slice(1);
                if (typeof toolOptions[toolNamespace][optionClassName] !==
                  'undefined') {
                  appToolOptions[optionName] =
                    toolOptions[toolNamespace][optionClassName];
                } else {
                  logger.warn('Could not find option class for: ' +
                    optionName);
                }
              }
            } else {
              appToolOptions = toolParams.options;
            }
            appToolList[toolName].setOptions(appToolOptions);
          }
        } else {
          logger.warn('Could not initialise unknown tool: ' + toolName);
        }
      }
      // add tools to the controller
      this.#toolboxController = new ToolboxController(appToolList);
    }

    // create load controller
    this.#loadController =
      new LoadController(this.#options.defaultCharacterSet);
    this.#loadController.onloadstart = this.#onloadstart;
    this.#loadController.onprogress = this.#onloadprogress;
    this.#loadController.onloaditem = this.#onloaditem;
    this.#loadController.onload = this.#onload;
    this.#loadController.onloadend = this.#onloadend;
    this.#loadController.onerror = this.#onloaderror;
    this.#loadController.onabort = this.#onloadabort;

    // create data controller
    this.#dataController = new DataController();
    // create stage
    this.#stage = new Stage();
    if (typeof this.#options.binders !== 'undefined') {
      this.#stage.setBinders(this.#options.binders);
    }
  }

  /**
   * Reset the application.
   */
  reset() {
    // clear objects
    this.#dataController.reset();
    this.#stage.empty();
    // reset undo/redo
    if (this.#undoStack) {
      this.#undoStack = new UndoStack();
      this.#undoStack.addEventListener('undoadd', this.#fireEvent);
      this.#undoStack.addEventListener('undo', this.#fireEvent);
      this.#undoStack.addEventListener('redo', this.#fireEvent);
    }
  }

  /**
   * Reset the layout of the application.
   */
  resetLayout() {
    this.#stage.reset();
    this.#stage.draw();
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

  // load API [begin] -------------------------------------------------------

  /**
   * Load a list of files. Can be image files or a state file.
   *
   * @param {File[]} files The list of files to load.
   * @fires App#loadstart
   * @fires App#loadprogress
   * @fires App#loaditem
   * @fires App#loadend
   * @fires App#loaderror
   * @fires App#loadabort
   * @function
   */
  loadFiles = (files) => {
    if (files.length === 0) {
      logger.warn('Ignoring empty input file list.');
      return;
    }
    this.#loadController.loadFiles(files);
  };

  /**
   * Load a list of URLs. Can be image files or a state file.
   *
   * @param {string[]} urls The list of urls to load.
   * @param {object} [options] The options object, can contain:
   *  - requestHeaders: an array of {name, value} to use as request headers
   *  - withCredentials: boolean xhr.withCredentials flag to pass to the request
   *  - batchSize: the size of the request url batch
   * @fires App#loadstart
   * @fires App#loadprogress
   * @fires App#loaditem
   * @fires App#loadend
   * @fires App#loaderror
   * @fires App#loadabort
   * @function
   */
  loadURLs = (urls, options) => {
    if (urls.length === 0) {
      logger.warn('Ignoring empty input url list.');
      return;
    }
    this.#loadController.loadURLs(urls, options);
  };

  /**
   * Load from an input uri.
   *
   * @param {string} uri The input uri, for example: 'window.location.href'.
   * @param {object} [options] Optional url request options.
   * @function
   */
  loadFromUri = (uri, options) => {
    const query = getUriQuery(uri);

    // load end callback: loads the state.
    const onLoadEnd = (/*event*/) => {
      this.removeEventListener('loadend', onLoadEnd);
      this.loadURLs([query.state]);
    };

    // check query
    if (query && typeof query.input !== 'undefined') {
      // optional display state
      if (typeof query.state !== 'undefined') {
        // queue after main data load
        this.addEventListener('loadend', onLoadEnd);
      }
      // load base image
      decodeQuery(query, this.loadURLs, options);
    }
    // no else to allow for empty uris
  };

  /**
   * Load a list of ArrayBuffers.
   *
   * @param {Array} data The list of ArrayBuffers to load
   *   in the form of [{name: "", filename: "", data: data}].
   * @fires App#loadstart
   * @fires App#loadprogress
   * @fires App#loaditem
   * @fires App#loadend
   * @fires App#loaderror
   * @fires App#loadabort
   * @function
   */
  loadImageObject = (data) => {
    this.#loadController.loadImageObject(data);
  };

  /**
   * Abort the current load.
   */
  abortLoad() {
    this.#loadController.abort();
  }

  // load API [end] ---------------------------------------------------------

  /**
   * Fit the display to the data of each layer group.
   * To be called once the image is loaded.
   */
  fitToContainer() {
    this.#stage.syncLayerGroupScale();
  }

  /**
   * Init the Window/Level display
   */
  initWLDisplay() {
    const viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    const controller = viewLayer.getViewController();
    controller.initialise();
  }

  /**
   * Get the layer group configuration from a data index.
   * Defaults to div id 'layerGroup' if no association object has been set.
   *
   * @param {number} dataIndex The data index.
   * @returns {ViewConfig[]} The list of associated configs.
   */
  #getViewConfigs(dataIndex) {
    // check options
    if (this.#options.dataViewConfigs === null ||
      typeof this.#options.dataViewConfigs === 'undefined') {
      throw new Error('No available data view configuration');
    }
    let configs = [];
    if (typeof this.#options.dataViewConfigs['*'] !== 'undefined') {
      configs = this.#options.dataViewConfigs['*'];
    } else if (
      typeof this.#options.dataViewConfigs[dataIndex] !== 'undefined') {
      configs = this.#options.dataViewConfigs[dataIndex];
    }
    return configs;
  }

  /**
   * Get the data view config.
   * Carefull, returns a reference, do not modify without resetting.
   *
   * @returns {Object<string, ViewConfig[]>} The configuration list.
   */
  getDataViewConfigs() {
    return this.#options.dataViewConfigs;
  }

  /**
   * Set the data view configuration.
   * Resets the stage and recreates all the views.
   *
   * @param {Object<string, ViewConfig[]>} configs The configuration list.
   */
  setDataViewConfigs(configs) {
    // clean up
    this.#stage.empty();
    // set new
    this.#options.dataViewConfigs = configs;
    // create layer groups
    this.#createLayerGroups(configs);
  }

  /**
   * Create layer groups according to a data view config:
   * adds them to stage and bind them.
   *
   * @param {DataViewConfigs} dataViewConfigs The data view config.
   */
  #createLayerGroups(dataViewConfigs) {
    const dataKeys = Object.keys(dataViewConfigs);
    const divIds = [];
    for (let i = 0; i < dataKeys.length; ++i) {
      const viewConfigs = dataViewConfigs[dataKeys[i]];
      for (let j = 0; j < viewConfigs.length; ++j) {
        const viewConfig = viewConfigs[j];
        // view configs can contain the same divIds, avoid duplicating
        if (!divIds.includes(viewConfig.divId)) {
          // create new layer group
          const element = document.getElementById(viewConfig.divId);
          const layerGroup = this.#stage.addLayerGroup(element);
          // bind events
          this.#bindLayerGroupToApp(layerGroup);
          // optional orientation
          if (typeof viewConfig.orientation !== 'undefined') {
            layerGroup.setTargetOrientation(
              getMatrixFromName(viewConfig.orientation));
          }
          divIds.push(viewConfig.divId);
        }
      }
    }
  }

  /**
   * Set the layer groups binders.
   *
   * @param {Array} list The list of binder names.
   */
  setLayerGroupsBinders(list) {
    // create instances
    const instances = [];
    for (let i = 0; i < list.length; ++i) {
      if (typeof binderList[list[i]] !== 'undefined') {
        instances.push(new binderList[list[i]]);
      }
    }
    // pass to stage
    this.#stage.setBinders(instances);
  }

  /**
   * Render the current data.
   *
   * @param {number} dataIndex The data index to render.
   */
  render(dataIndex) {
    if (typeof dataIndex === 'undefined' || dataIndex === null) {
      throw new Error('Cannot render without data index');
    }

    // create layer groups if not done yet
    // (create all to allow for ratio sync)
    if (this.#stage.getNumberOfLayerGroups() === 0) {
      this.#createLayerGroups(this.#options.dataViewConfigs);
    }

    // loop on all configs
    const viewConfigs = this.#getViewConfigs(dataIndex);
    // nothing to do if no view config
    if (viewConfigs.length === 0) {
      logger.info('Not rendering data: ' + dataIndex +
        ' (no data view config)');
      return;
    }
    for (let i = 0; i < viewConfigs.length; ++i) {
      const config = viewConfigs[i];
      const layerGroup =
      this.#stage.getLayerGroupByDivId(config.divId);
      // layer group must exist
      if (!layerGroup) {
        throw new Error('No layer group for ' + config.divId);
      }
      // initialise or add view
      // warn: needs a loaded DOM
      if (layerGroup.getViewLayersByDataIndex(dataIndex).length === 0) {
        if (layerGroup.getNumberOfLayers() === 0) {
          this.#initialiseBaseLayers(dataIndex, config);
        } else {
          this.#addViewLayer(dataIndex, config);
        }
      }
      // draw
      layerGroup.draw();
    }
  }

  /**
   * Zoom to the layers.
   *
   * @param {number} step The step to add to the current zoom.
   * @param {number} cx The zoom center X coordinate.
   * @param {number} cy The zoom center Y coordinate.
   */
  zoom(step, cx, cy) {
    const layerGroup = this.#stage.getActiveLayerGroup();
    const viewController = layerGroup.getActiveViewLayer().getViewController();
    const k = viewController.getCurrentScrollPosition();
    const center = new Point3D(cx, cy, k);
    layerGroup.addScale(step, center);
    layerGroup.draw();
  }

  /**
   * Apply a translation to the layers.
   *
   * @param {number} tx The translation along X.
   * @param {number} ty The translation along Y.
   */
  translate(tx, ty) {
    const layerGroup = this.#stage.getActiveLayerGroup();
    layerGroup.addTranslation({x: tx, y: ty});
    layerGroup.draw();
  }

  /**
   * Set the image layer opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   */
  setOpacity(alpha) {
    const viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    viewLayer.setOpacity(alpha);
    viewLayer.draw();
  }

  /**
   * Set the drawings on the current stage.
   *
   * @param {Array} drawings An array of drawings.
   * @param {Array} drawingsDetails An array of drawings details.
   */
  setDrawings(drawings, drawingsDetails) {
    const layerGroup = this.#stage.getActiveLayerGroup();
    const viewController =
      layerGroup.getActiveViewLayer().getViewController();
    const drawController =
      layerGroup.getActiveDrawLayer().getDrawController();

    drawController.setDrawings(
      drawings, drawingsDetails, this.#fireEvent, this.addToUndoStack);

    drawController.activateDrawLayer(
      viewController.getCurrentOrientedIndex(),
      viewController.getScrollIndex());
  }

  /**
   * Get the JSON state of the app.
   *
   * @returns {string} The state of the app as a JSON string.
   */
  getJsonState() {
    const state = new State();
    return state.toJSON(this);
  }

  /**
   * Apply a JSON state to this app.
   *
   * @param {string} jsonState The state of the app as a JSON string.
   */
  applyJsonState(jsonState) {
    const state = new State();
    state.apply(this, state.fromJSON(jsonState));
  }

  // Handler Methods -----------------------------------------------------------

  /**
   * Handle resize: fit the display to the window.
   * To be called once the image is loaded.
   * Can be connected to a window 'resize' event.
   *
   * @function
   */
  onResize = () => {
    this.fitToContainer();
  };

  /**
   * Key down callback. Meant to be used in tools.
   *
   * @param {KeyboardEvent} event The key down event.
   * @fires App#keydown
   * @function
   */
  onKeydown = (event) => {
    /**
     * Key down event.
     *
     * @event App#keydown
     * @type {KeyboardEvent}
     * @property {string} type The event type: keydown.
     * @property {string} context The tool where the event originated.
     */
    this.#fireEvent(event);
  };

  /**
   * Key down event handler example.
   * - CRTL-Z: undo
   * - CRTL-Y: redo
   * - CRTL-ARROW_LEFT: next element on fourth dim
   * - CRTL-ARROW_UP: next element on third dim
   * - CRTL-ARROW_RIGHT: previous element on fourth dim
   * - CRTL-ARROW_DOWN: previous element on third dim
   *
   * @param {KeyboardEvent} event The key down event.
   * @fires UndoStack#undo
   * @fires UndoStack#redo
   * @function
   */
  defaultOnKeydown = (event) => {
    if (event.ctrlKey) {
      if (event.shiftKey) {
        const viewController =
          this.#stage.getActiveLayerGroup()
            .getActiveViewLayer().getViewController();
        const size = viewController.getImageSize();
        if (event.key === 'ArrowLeft') { // crtl-shift-arrow-left
          if (size.moreThanOne(3)) {
            viewController.decrementIndex(3);
          }
        } else if (event.key === 'ArrowUp') { // crtl-shift-arrow-up
          if (viewController.canScroll()) {
            viewController.incrementScrollIndex();
          }
        } else if (event.key === 'ArrowRight') { // crtl-shift-arrow-right
          if (size.moreThanOne(3)) {
            viewController.incrementIndex(3);
          }
        } else if (event.key === 'ArrowDown') { // crtl-shift-arrow-down
          if (viewController.canScroll()) {
            viewController.decrementScrollIndex();
          }
        }
      } else if (event.key === 'y') { // crtl-y
        this.#undoStack.redo();
      } else if (event.key === 'z') { // crtl-z
        this.#undoStack.undo();
      } else if (event.key === ' ') { // crtl-space
        for (let i = 0; i < this.#stage.getNumberOfLayerGroups(); ++i) {
          this.#stage.getLayerGroup(i).setShowCrosshair(
            !this.#stage.getLayerGroup(i).getShowCrosshair()
          );
        }
      }
    }
  };

  // Internal members shortcuts-----------------------------------------------

  /**
   * Reset the display
   */
  resetDisplay() {
    this.resetLayout();
    this.initWLDisplay();
  }

  /**
   * Reset the app zoom.s
   */
  resetZoom() {
    this.resetLayout();
  }

  /**
   * Set the colour map.
   *
   * @param {string} name The colour map name.
   */
  setColourMap(name) {
    const viewController =
      this.#stage.getActiveLayerGroup()
        .getActiveViewLayer().getViewController();
    viewController.setColourMapFromName(name);
  }

  /**
   * Set the window/level preset.
   *
   * @param {object} preset The window/level preset.
   */
  setWindowLevelPreset(preset) {
    const viewController =
      this.#stage.getActiveLayerGroup()
        .getActiveViewLayer().getViewController();
    viewController.setWindowLevelPreset(preset);
  }

  /**
   * Set the tool
   *
   * @param {string} tool The tool.
   */
  setTool(tool) {
    // bind tool to active layer
    for (let i = 0; i < this.#stage.getNumberOfLayerGroups(); ++i) {
      const layerGroup = this.#stage.getLayerGroup(i);
      // draw or view layer
      let layer = null;
      if (tool === 'Draw' ||
        tool === 'Livewire' ||
        tool === 'Floodfill') {
        layer = layerGroup.getActiveDrawLayer();
      } else {
        layer = layerGroup.getActiveViewLayer();
      }
      if (layer) {
        this.#toolboxController.bindLayer(layer, layerGroup.getDivId());
      }
    }

    // set toolbox tool
    this.#toolboxController.setSelectedTool(tool);
  }

  /**
   * Set the tool live features.
   *
   * @param {object} list The list of features.
   */
  setToolFeatures(list) {
    this.#toolboxController.setToolFeatures(list);
  }

  /**
   * Undo the last action
   *
   * @fires UndoStack#undo
   */
  undo() {
    this.#undoStack.undo();
  }

  /**
   * Redo the last action
   *
   * @fires UndoStack#redo
   */
  redo() {
    this.#undoStack.redo();
  }

  /**
   * Get the undo stack size.
   *
   * @returns {number} The size of the stack.
   */
  getStackSize() {
    return this.#undoStack.getStackSize();
  }

  /**
   * Get the current undo stack index.
   *
   * @returns {number} The stack index.
   */
  getCurrentStackIndex() {
    return this.#undoStack.getCurrentStackIndex();
  }

  // Private Methods -----------------------------------------------------------

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    this.#listenerHandler.fireEvent(event);
  };

  /**
   * Data load start callback.
   *
   * @param {object} event The load start event.
   */
  #onloadstart = (event) => {
    /**
     * Load start event.
     *
     * @event App#loadstart
     * @type {object}
     * @property {string} type The event type: loadstart.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     */
    event.type = 'loadstart';
    this.#fireEvent(event);
  };

  /**
   * Data load progress callback.
   *
   * @param {object} event The progress event.
   */
  #onloadprogress = (event) => {
    /**
     * Load progress event.
     *
     * @event App#loadprogress
     * @type {object}
     * @property {string} type The event type: loadprogress.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     * @property {number} loaded The loaded percentage.
     * @property {number} total The total percentage.
     */
    event.type = 'loadprogress';
    this.#fireEvent(event);
  };

  /**
   * Data load callback.
   *
   * @param {object} event The load event.
   */
  #onloaditem = (event) => {
    // check event
    if (typeof event.data === 'undefined') {
      logger.error('Missing loaditem event data.');
    }
    if (typeof event.loadtype === 'undefined') {
      logger.error('Missing loaditem event load type.');
    }

    const isFirstLoadItem = event.isfirstitem;

    let eventMetaData = null;
    if (event.loadtype === 'image') {
      if (isFirstLoadItem) {
        this.#dataController.addNew(
          event.loadid, event.data.image, event.data.info);
      } else {
        this.#dataController.update(
          event.loadid, event.data.image, event.data.info);
      }
      eventMetaData = event.data.info;
    } else if (event.loadtype === 'state') {
      this.applyJsonState(event.data);
      eventMetaData = 'state';
    }

    /**
     * Load item event: fired when a load item is successfull.
     *
     * @event App#loaditem
     * @type {object}
     * @property {string} type The event type: loaditem.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     * @property {object} data The loaded meta data.
     */
    this.#fireEvent({
      type: 'loaditem',
      data: eventMetaData,
      source: event.source,
      loadtype: event.loadtype,
      loadid: event.loadid,
      isfirstitem: event.isfirstitem,
      warn: event.warn
    });

    // render if first and flag allows
    if (event.loadtype === 'image' &&
    this.#getViewConfigs(event.loadid).length !== 0 &&
      isFirstLoadItem && this.#options.viewOnFirstLoadItem) {
      this.render(event.loadid);
    }
  };

  /**
   * Data load callback.
   *
   * @param {object} event The load event.
   */
  #onload = (event) => {
    /**
     * Load event: fired when a load finishes successfully.
     *
     * @event App#load
     * @type {object}
     * @property {string} type The event type: load.
     * @property {string} loadType The load type: image or state.
     */
    event.type = 'load';
    this.#fireEvent(event);
  };

  /**
   * Data load end callback.
   *
   * @param {object} event The load end event.
   */
  #onloadend = (event) => {
    /**
     * Main load end event: fired when the load finishes,
     *   successfully or not.
     *
     * @event App#loadend
     * @type {object}
     * @property {string} type The event type: loadend.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     */
    event.type = 'loadend';
    this.#fireEvent(event);
  };

  /**
   * Data load error callback.
   *
   * @param {object} event The error event.
   */
  #onloaderror = (event) => {
    /**
     * Load error event.
     *
     * @event App#loaderror
     * @type {object}
     * @property {string} type The event type: error.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     * @property {object} error The error.
     * @property {object} target The event target.
     */
    event.type = 'loaderror';
    this.#fireEvent(event);
  };

  /**
   * Data load abort callback.
   *
   * @param {object} event The abort event.
   */
  #onloadabort = (event) => {
    /**
     * Load abort event.
     *
     * @event App#loadabort
     * @type {object}
     * @property {string} type The event type: abort.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     */
    event.type = 'loadabort';
    this.#fireEvent(event);
  };

  /**
   * Bind layer group events to app.
   *
   * @param {object} group The layer group.
   */
  #bindLayerGroupToApp(group) {
    // propagate layer group events
    group.addEventListener('zoomchange', this.#fireEvent);
    group.addEventListener('offsetchange', this.#fireEvent);
    // propagate viewLayer events
    group.addEventListener('renderstart', this.#fireEvent);
    group.addEventListener('renderend', this.#fireEvent);
    // propagate view events
    for (let j = 0; j < viewEventNames.length; ++j) {
      group.addEventListener(viewEventNames[j], this.#fireEvent);
    }
    // propagate drawLayer events
    if (this.#toolboxController && this.#toolboxController.hasTool('Draw')) {
      group.addEventListener('drawcreate', this.#fireEvent);
      group.addEventListener('drawdelete', this.#fireEvent);
    }
  }

  /**
   * Initialise the layers.
   * To be called once the DICOM data has been loaded.
   *
   * @param {number} dataIndex The data index.
   * @param {ViewConfig} viewConfig The view config.
   */
  #initialiseBaseLayers(dataIndex, viewConfig) {
    // add layers
    this.#addViewLayer(dataIndex, viewConfig);

    // initialise the toolbox
    if (this.#toolboxController) {
      this.#toolboxController.init();
    }
  }

  /**
   * Add a view layer.
   *
   * @param {number} dataIndex The data index.
   * @param {ViewConfig} viewConfig The data view config.
   */
  #addViewLayer(dataIndex, viewConfig) {
    const data = this.#dataController.get(dataIndex);
    if (!data) {
      throw new Error('Cannot initialise layer with data id: ' + dataIndex);
    }
    const layerGroup = this.#stage.getLayerGroupByDivId(viewConfig.divId);
    if (!layerGroup) {
      throw new Error('Cannot initialise layer with group id: ' +
        viewConfig.divId);
    }
    const imageGeometry = data.image.getGeometry();

    // un-bind
    this.#stage.unbindLayerGroups();

    // create and setup view
    const viewFactory = new ViewFactory();
    const view = viewFactory.create(data.meta, data.image);
    const viewOrientation = getViewOrientation(
      imageGeometry.getOrientation(),
      layerGroup.getTargetOrientation()
    );
    view.setOrientation(viewOrientation);

    // make pixel of value 0 transparent for segmentation
    // (assuming RGB data)
    if (data.image.getMeta().Modality === 'SEG') {
      view.setAlphaFunction(function (value /*, index*/) {
        if (value[0] === 0 &&
          value[1] === 0 &&
          value[2] === 0) {
          return 0;
        } else {
          return 0xff;
        }
      });
    }

    // colour map
    if (typeof viewConfig.colourMap !== 'undefined') {
      view.setColourMap(viewConfig.colourMap);
    }

    const isBaseLayer = layerGroup.getNumberOfLayers() === 0;

    // opacity
    let opacity = 1;
    // do we have more than one layer
    // (the layer has not been added to the layer group yet)
    if (!isBaseLayer) {
      opacity = 0.5;
      // set color map if non was provided
      if (typeof viewConfig.colourMap === 'undefined') {
        view.setColourMap(luts.rainbow);
      }
    }

    // view layer
    const viewLayer = layerGroup.addViewLayer();
    viewLayer.setView(view, dataIndex);
    const size2D = imageGeometry.getSize(viewOrientation).get2D();
    const spacing2D = imageGeometry.getSpacing(viewOrientation).get2D();
    viewLayer.initialise(size2D, spacing2D, opacity);
    const viewController = viewLayer.getViewController();

    // listen to controller events
    if (data.image.getMeta().Modality === 'SEG') {
      viewController.addEventListener('masksegmentdelete', this.#fireEvent);
      viewController.addEventListener('masksegmentredraw', this.#fireEvent);
    }

    // listen to image changes
    this.#dataController.addEventListener('imageset', viewLayer.onimageset);
    this.#dataController.addEventListener('imagechange', (event) => {
      viewLayer.onimagechange(event);
      this.render(event.dataid);
    });

    // bind
    this.#stage.bindLayerGroups();
    if (this.#toolboxController) {
      this.#toolboxController.bindLayer(viewLayer, layerGroup.getDivId());
    }

    // optional draw layer
    let drawLayer;
    if (this.#toolboxController && this.#toolboxController.hasTool('Draw')) {
      drawLayer = layerGroup.addDrawLayer();
      drawLayer.initialise(size2D, spacing2D, dataIndex);
      drawLayer.setPlaneHelper(viewLayer.getViewController().getPlaneHelper());
    }

    // sync layers position
    const value = [
      viewController.getCurrentIndex().getValues(),
      viewController.getCurrentPosition().getValues()
    ];
    layerGroup.updateLayersToPositionChange({
      value: value,
      srclayerid: viewLayer.getId()
    });

    // sync layer groups
    this.#stage.syncLayerGroupScale();

    // major orientation axis
    const major = imageGeometry.getOrientation().getThirdColMajorDirection();

    // view layer offset (done before scale)
    viewLayer.setOffset(layerGroup.getOffset());
    // extra flip offset for oriented views...
    if (typeof viewConfig.orientation !== 'undefined') {
      if (major === 2) {
        // flip offset Y for axial aquired data
        if (viewConfig.orientation !== 'axial') {
          viewLayer.addFlipOffsetY();
          if (typeof drawLayer !== 'undefined') {
            drawLayer.addFlipOffsetY();
          }
        }
      } else if (major === 0) {
        // flip offset X for sagittal aquired data
        if (viewConfig.orientation !== 'sagittal') {
          viewLayer.addFlipOffsetX();
          if (typeof drawLayer !== 'undefined') {
            drawLayer.addFlipOffsetX();
          }
        }
      }
    }

    // view layer scale
    // only flip scale for base layers
    if (isBaseLayer) {
      if (typeof viewConfig.orientation !== 'undefined') {
        if (major === 0 || major === 2) {
          // scale flip Z for oriented views...
          layerGroup.flipScaleZ();
        } else {
          viewLayer.setScale(layerGroup.getScale());
          if (typeof drawLayer !== 'undefined') {
            drawLayer.setScale(layerGroup.getScale());
          }
        }
      } else {
        if (major === 0) {
          // scale flip Z for sagittal and undefined target orientation
          layerGroup.flipScaleZ();
        } else {
          viewLayer.setScale(layerGroup.getScale());
          if (typeof drawLayer !== 'undefined') {
            drawLayer.setScale(layerGroup.getScale());
          }
        }
      }
    } else {
      viewLayer.setScale(layerGroup.getScale());
      if (typeof drawLayer !== 'undefined') {
        drawLayer.setScale(layerGroup.getScale());
      }
    }

  }

} // class App
