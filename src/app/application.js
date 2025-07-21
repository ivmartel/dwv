import {viewEventNames} from '../image/view.js';
import {imageEventNames} from '../image/image.js';
import {annotationGroupEventNames} from '../image/annotationGroup.js';
import {dataEventNames} from '../app/dataController.js';
import {ViewFactory} from '../image/viewFactory.js';
import {
  getMatrixFromName,
  getOrientationStringLPS,
  Orientation,
  getViewOrientation
} from '../math/orientation.js';
import {Point3D} from '../math/point.js';
import {Stage} from '../gui/stage.js';
import {Style} from '../gui/style.js';
import {getLayerDetailsFromLayerDivId} from '../gui/layerGroup.js';
import {ListenerHandler} from '../utils/listen.js';
import {State} from '../io/state.js';
import {logger} from '../utils/logger.js';
import {getUriQuery, decodeQuery} from '../utils/uri.js';
import {UndoStack} from '../utils/undoStack.js';
import {ToolboxController} from './toolboxController.js';
import {LoadController} from './loadController.js';
import {DataController} from './dataController.js';
import {OverlayData} from '../gui/overlayData.js';
import {
  toolList,
  defaultToolList,
  toolOptions,
  defaultToolOptions
} from '../tools/index.js';
import {binderList} from '../gui/stage.js';
import {WindowLevel} from '../image/windowLevel.js';
import {PlaneHelper} from '../image/planeHelper.js';
import {AnnotationGroup} from '../image/annotationGroup.js';
import {konvaToAnnotation} from '../gui/drawLayer.js';

// doc imports
/* eslint-disable no-unused-vars */
import {LayerGroup} from '../gui/layerGroup.js';
import {ViewLayer} from '../gui/viewLayer.js';
import {DrawLayer} from '../gui/drawLayer.js';
import {Image} from '../image/image.js';
import {Matrix33} from '../math/matrix.js';
import {DataElement} from '../dicom/dataElement.js';
import {Scalar3D} from '../math/scalar.js';
import {DicomData} from './dataController.js';
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
   * Optional view colour map name.
   *
   * @type {string|undefined}
   */
  colourMap;
  /**
   * Optional layer opacity; in [0, 1] range.
   *
   * @type {number|undefined}
   */
  opacity;
  /**
   * Optional layer window level preset name.
   * If present, the preset name will be used and
   * the window centre and width ignored.
   *
   * @type {string|undefined}
   */
  wlPresetName;
  /**
   * Optional layer window center.
   *
   * @type {number|undefined}
   */
  windowCenter;
  /**
   * Optional layer window width.
   *
   * @type {number|undefined}
   */
  windowWidth;

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
   * @type {Object<string, ViewConfig[]>|undefined}
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
   *   after the first loaded data or not. Defaults to true.
   *
   * @type {boolean|undefined}
   */
  viewOnFirstLoadItem;
  /**
   * Optional default chraracterset string used for DICOM parsing if
   *   not passed in DICOM file.
   *
   * Valid values: {@link https://developer.mozilla.org/en-US/docs/Web/API/Encoding_API/Encodings}.
   *
   * @type {string|undefined}
   */
  defaultCharacterSet;
  /**
   * Optional overlay config.
   *
   * @type {object|undefined}
   */
  overlayConfig;
  /**
   * DOM root document.
   *
   * @type {DocumentFragment}
   */
  rootDocument;

  /**
   * @param {Object<string, ViewConfig[]>} [dataViewConfigs] Optional dataId
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
 * import {App, AppOptions, ViewConfig} from '//esm.sh/dwv';
 * // create the dwv app
 * const app = new App();
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

  /**
   * Data controller.
   *
   * @type {DataController}
   */
  #dataController = null;

  /**
   * Toolbox controller.
   *
   * @type {ToolboxController}
   */
  #toolboxController = null;

  /**
   * Load controller.
   *
   * @type {LoadController}
   */
  #loadController = null;

  /**
   * Stage.
   *
   * @type {Stage}
   */
  #stage = null;

  /**
   * Undo stack.
   *
   * @type {UndoStack}
   */
  #undoStack = null;

  /**
   * Style.
   *
   * @type {Style}
   */
  #style = new Style();

  // overlay datas
  #overlayDatas = {};

  /**
   * Listener handler.
   *
   * @type {ListenerHandler}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Get a DicomData.
   *
   * @param {string} dataId The data id.
   * @returns {DicomData|undefined} The data.
   */
  getData(dataId) {
    return this.#dataController.get(dataId);
  }

  /**
   * Get the image.
   *
   * @param {string} dataId The data id.
   * @returns {Image|undefined} The associated image.
   * @deprecated Since v0.34, please use the getData method.
   */
  getImage(dataId) {
    let res;
    if (typeof this.getData(dataId) !== 'undefined') {
      res = this.getData(dataId).image;
    }
    return res;
  }

  /**
   * Set the image at the given id.
   *
   * @param {string} dataId The data id.
   * @param {Image} img The associated image.
   */
  setImage(dataId, img) {
    this.#dataController.setImage(dataId, img);
  }

  /**
   * Add a new DicomData.
   *
   * @param {DicomData} data The new data.
   * @returns {string} The data id.
   */
  addData(data) {
    // get a new dataId
    const dataId = this.#dataController.getNextDataId();
    // add image to data controller
    this.#dataController.add(
      dataId,
      data
    );
    // optional render
    // if (this.#options.viewOnFirstLoadItem) {
    //   this.render(dataId);
    // }
    // return
    return dataId;
  }

  /**
   * Get the meta data.
   *
   * @param {string} dataId The data id.
   * @returns {Object<string, DataElement>|undefined} The list of meta data.
   */
  getMetaData(dataId) {
    let res;
    if (typeof this.#dataController.get(dataId) !== 'undefined') {
      res = this.#dataController.get(dataId).meta;
    }
    return res;
  }

  /**
   * Get the list of ids in the data storage.
   *
   * @returns {string[]} The list of data ids.
   */
  getDataIds() {
    return this.#dataController.getDataIds();
  }

  /**
   * Get the list of dataIds that contain the input UIDs.
   *
   * @param {string[]} uids A list of UIDs.
   * @returns {string[]} The list of dataIds that contain the UIDs.
   */
  getDataIdsFromSopUids(uids) {
    return this.#dataController.getDataIdsFromSopUids(uids);
  }

  /**
   * Can the data (of the active view of the active layer) be scrolled?
   *
   * @returns {boolean} True if the data has a third dimension greater than one.
   * @deprecated Since v0.33, please use the ViewController
   *   equivalent directly instead.
   */
  canScroll() {
    const viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    const controller = viewLayer.getViewController();
    return controller.canScroll();
  }

  /**
   * Can window and level be applied to the data
   * (of the active view of the active layer)?
   *
   * @returns {boolean} True if the data is monochrome.
   * @deprecated Since v0.33, please use the ViewController
   *   equivalent directly instead.
   */
  canWindowLevel() {
    const viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    const controller = viewLayer.getViewController();
    return controller.canWindowLevel();
  }

  /**
   * Get the active layer group scale on top of the base scale.
   *
   * @returns {Scalar3D} The scale as {x,y,z}.
   */
  getAddedScale() {
    return this.#stage.getActiveLayerGroup().getAddedScale();
  }

  /**
   * Get the base scale of the active layer group.
   *
   * @returns {Scalar3D} The scale as {x,y,z}.
   */
  getBaseScale() {
    return this.#stage.getActiveLayerGroup().getBaseScale();
  }

  /**
   * Get the layer offset of the active layer group.
   *
   * @returns {Scalar3D} The offset as {x,y,z}.
   */
  getOffset() {
    return this.#stage.getActiveLayerGroup().getOffset();
  }

  /**
   * Get the toolbox controller.
   *
   * @returns {ToolboxController} The controller.
   */
  getToolboxController() {
    return this.#toolboxController;
  }

  /**
   * Get the active layer group.
   * The layer is available after the first loaded item.
   *
   * @returns {LayerGroup|undefined} The layer group.
   */
  getActiveLayerGroup() {
    return this.#stage.getActiveLayerGroup();
  }

  /**
   * Set the active layer group.
   *
   * @param {number} index The layer group index.
   */
  setActiveLayerGroup(index) {
    this.#stage.setActiveLayerGroup(index);
  }

  /**
   * Get the view layers associated to a data id.
   * The layer are available after the first loaded item.
   *
   * @param {string} dataId The data id.
   * @returns {ViewLayer[]} The layers.
   */
  getViewLayersByDataId(dataId) {
    return this.#stage.getViewLayersByDataId(dataId);
  }

  /**
   * Get a list of view layers according to an input callback function.
   *
   * @param {Function} [callbackFn] A function that takes
   *   a ViewLayer as input and returns a boolean. If undefined,
   *   returns all view layers.
   * @returns {ViewLayer[]} The layers that
   *   satisfy the callbackFn.
   */
  getViewLayers(callbackFn) {
    return this.#stage.getViewLayers(callbackFn);
  }

  /**
   * Get the draw layers associated to a data id.
   * The layer are available after the first loaded item.
   *
   * @param {string} dataId The data id.
   * @returns {DrawLayer[]} The layers.
   */
  getDrawLayersByDataId(dataId) {
    return this.#stage.getDrawLayersByDataId(dataId);
  }

  /**
   * Get a list of draw layers according to an input callback function.
   *
   * @param {Function} [callbackFn] A function that takes
   *   a DrawLayer as input and returns a boolean. If undefined,
   *   returns all draw layers.
   * @returns {DrawLayer[]} The layers that
   *   satisfy the callbackFn.
   */
  getDrawLayers(callbackFn) {
    return this.#stage.getDrawLayers(callbackFn);
  }

  /**
   * Get a layer group by div id.
   * The layer is available after the first loaded item.
   *
   * @param {string} divId The div id.
   * @returns {LayerGroup|undefined} The layer group.
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
   * Remove a command from the undo stack.
   *
   * @param {string} name The name of the command to remove.
   * @returns {boolean} True if the command was found and removed.
   * @fires UndoStack#undoremove
   * @function
   */
  removeFromUndoStack = (name) => {
    let res = false;
    if (this.#undoStack !== null) {
      res = this.#undoStack.remove(name);
    }
    return res;
  };

  /**
   * Initialise the application.
   *
   * @param {AppOptions} opt The application options.
   * @example
   * import {App, AppOptions, ViewConfig} from '//esm.sh/dwv';
   * // create the dwv app
   * const app = new App();
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
    if (typeof this.#options.dataViewConfigs === 'undefined') {
      this.#options.dataViewConfigs = {};
    }
    if (typeof this.#options.rootDocument === 'undefined') {
      this.#options.rootDocument = document;
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
        // find the tool in the default tool list
        let toolClass = defaultToolList[toolName];
        // or use external one
        if (typeof toolClass === 'undefined') {
          toolClass = toolList[toolName];
        }
        if (typeof toolClass !== 'undefined') {
          // create tool instance
          appToolList[toolName] = new toolClass(this);
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
                // find the option in the external tool list
                let tOptions = toolOptions[toolNamespace];
                let optionClass;
                if (typeof tOptions !== 'undefined') {
                  optionClass = tOptions[optionClassName];
                }
                // or use the default one
                if (typeof optionClass === 'undefined') {
                  tOptions = defaultToolOptions[toolNamespace];
                  if (typeof tOptions !== 'undefined') {
                    optionClass = tOptions[optionClassName];
                  }
                }
                if (typeof optionClass !== 'undefined') {
                  appToolOptions[optionName] = optionClass;
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
    this.#loadController.ontimeout = this.#onloadtimeout;
    this.#loadController.onabort = this.#onloadabort;

    // create data controller
    this.#dataController = new DataController();
    // propagate data events
    for (const eventName of dataEventNames) {
      this.#dataController.addEventListener(eventName, this.#fireEvent);
    }
    // propage image events
    for (const eventName of imageEventNames) {
      this.#dataController.addEventListener(eventName, this.#fireEvent);
    }
    // propage annotation events
    for (const eventName of annotationGroupEventNames) {
      this.#dataController.addEventListener(eventName, this.#fireEvent);
    }
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
    this.#stage.empty();
    this.#overlayDatas = {};
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
   *
   * @deprecated Since v0.35, prefer resetZoomPan.
   */
  resetLayout() {
    this.#stage.reset();
    this.#stage.draw();
  }

  /**
   * Reset the zoom and pan of the stage.
   */
  resetZoomPan() {
    this.#stage.resetZoomPan();
    this.#stage.draw();
  }

  /**
   * Reset the position and window level of the stage.
   */
  resetViews() {
    this.#stage.resetViews();
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
   * @returns {string} The data ID, '-1' if problem.
   * @fires App#loadstart
   * @fires App#loadprogress
   * @fires App#loaditem
   * @fires App#loadend
   * @fires App#error
   * @fires App#abort
   * @function
   */
  loadFiles = (files) => {
    if (files.length === 0) {
      logger.warn('Ignoring empty input file list.');
      return '-1';
    }
    const dataId = this.#dataController.getNextDataId();
    this.#loadController.loadFiles(files, dataId);
    return dataId;
  };

  /**
   * Load a list of URLs. Can be image files or a state file.
   *
   * @param {string[]} urls The list of urls to load.
   * @param {object} [options] The options object, can contain:
   * - requestHeaders: an array of {name, value} to use as request headers,
   * - withCredentials: boolean xhr.withCredentials flag to pass to the request,
   * - batchSize: the size of the request url batch.
   * @returns {string} The data ID, '-1' if problem.
   * @fires App#loadstart
   * @fires App#loadprogress
   * @fires App#loaditem
   * @fires App#loadend
   * @fires App#error
   * @fires App#abort
   * @function
   */
  loadURLs = (urls, options) => {
    if (urls.length === 0) {
      logger.warn('Ignoring empty input url list.');
      return '-1';
    }
    const dataId = this.#dataController.getNextDataId();
    this.#loadController.loadURLs(urls, dataId, options);
    return dataId;
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
   * @returns {string} The data ID.
   * @fires App#loadstart
   * @fires App#loadprogress
   * @fires App#loaditem
   * @fires App#loadend
   * @fires App#error
   * @fires App#abort
   * @function
   */
  loadImageObject = (data) => {
    const dataId = this.#dataController.getNextDataId();
    this.#loadController.loadImageObject(data, dataId);
    return dataId;
  };

  /**
   * Abort all the current loads.
   */
  abortAllLoads() {
    const ids = this.#loadController.getLoadingDataIds();
    for (const id of ids) {
      this.abortLoad(id);
    }
  }

  /**
   * Abort an individual data load.
   *
   * @param {string} dataId The data to stop loading.
   */
  abortLoad(dataId) {
    // abort load
    this.#loadController.abort(dataId);
    // remove data
    this.#dataController.remove(dataId);
    // clean up stage
    this.#stage.removeLayersByDataId(dataId);
  }

  // load API [end] ---------------------------------------------------------

  /**
   * Fit the display to the data of each layer group.
   * To be called once the image is loaded.
   */
  fitToContainer() {
    this.#stage.fitToContainer();
  }

  /**
   * Init the Window/Level display
   * (of the active layer of the active layer group).
   *
   * @deprecated Since v0.33, please set the opacity
   *   of the desired view layer directly.
   */
  initWLDisplay() {
    const viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    const controller = viewLayer.getViewController();
    controller.initialise();
  }

  /**
   * Set the imageSmoothing flag value. Default is false.
   *
   * @param {boolean} flag True to enable smoothing.
   */
  setImageSmoothing(flag) {
    this.#stage.setImageSmoothing(flag);
    this.#stage.draw();
  }

  /**
   * Get the layer group configuration from a data id.
   *
   * @param {string} dataId The data id.
   * @param {boolean} [excludeStarConfig] Exclude the star config
   *  (default to false).
   * @returns {ViewConfig[]} The list of associated configs.
   */
  getViewConfigs(dataId, excludeStarConfig) {
    if (typeof excludeStarConfig === 'undefined') {
      excludeStarConfig = false;
    }
    // check options
    if (this.#options.dataViewConfigs === null ||
      typeof this.#options.dataViewConfigs === 'undefined') {
      throw new Error('No available data view configuration');
    }
    let configs = [];
    if (typeof this.#options.dataViewConfigs[dataId] !== 'undefined') {
      configs = this.#options.dataViewConfigs[dataId];
    } else if (!excludeStarConfig &&
      typeof this.#options.dataViewConfigs['*'] !== 'undefined') {
      configs = this.#options.dataViewConfigs['*'];
    }
    return configs;
  }

  /**
   * Get the layer group configuration for a data id and group
   * div id.
   *
   * @param {string} dataId The data id.
   * @param {string} groupDivId The layer group div id.
   * @param {boolean} [excludeStarConfig] Exclude the star config
   *  (default to false).
   * @returns {ViewConfig|undefined} The associated config.
   */
  getViewConfig(dataId, groupDivId, excludeStarConfig) {
    const configs = this.getViewConfigs(dataId, excludeStarConfig);
    return configs.find(function (item) {
      return item.divId === groupDivId;
    });
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
   * Add a data view config.
   *
   * @param {string} dataId The data id.
   * @param {ViewConfig} config The view configuration.
   */
  addDataViewConfig(dataId, config) {
    // add to list
    const configs = this.#options.dataViewConfigs;
    if (typeof configs[dataId] === 'undefined') {
      configs[dataId] = [];
    }
    const equalDivId = function (item) {
      return item.divId === config.divId;
    };
    const itemIndex = configs[dataId].findIndex(equalDivId);
    if (itemIndex === -1) {
      this.#options.dataViewConfigs[dataId].push(config);
    } else {
      throw new Error('Duplicate view config for data ' + dataId +
        ' and div ' + config.divId);
    }

    // add layer group if not done
    if (typeof this.#stage.getLayerGroupByDivId(config.divId) === 'undefined') {
      this.#createLayerGroup(config);
    }

    // render (will create layers)
    if (typeof this.#dataController.get(dataId) !== 'undefined') {
      this.render(dataId, [config]);
    }
  }

  /**
   * Remove a data view config.
   * Removes the associated layer if found, removes
   *   the layer group if empty.
   *
   * @param {string} dataId The data id.
   * @param {string} divId The div id.
   */
  removeDataViewConfig(dataId, divId) {
    // input checks
    const configs = this.#options.dataViewConfigs;
    if (typeof configs[dataId] === 'undefined') {
      // no config for dataId
      return;
    }
    const equalDivId = function (item) {
      return item.divId === divId;
    };
    const itemIndex = configs[dataId].findIndex(equalDivId);
    if (itemIndex === -1) {
      // no config for divId
      return;
    }

    // remove from config list
    configs[dataId].splice(itemIndex, 1);
    if (configs[dataId].length === 0) {
      delete configs[dataId];
    }

    // update layer group
    const layerGroup = this.#stage.getLayerGroupByDivId(divId);
    if (typeof layerGroup !== 'undefined') {
      // remove layer if possible
      const vls = layerGroup.getViewLayersByDataId(dataId);
      if (vls.length === 1) {
        layerGroup.removeLayer(vls[0]);
      }
      const dls = layerGroup.getDrawLayersByDataId(dataId);
      if (dls.length === 1) {
        layerGroup.removeLayer(dls[0]);
      }
      // remove layer group if empty
      if (layerGroup.getNumberOfLayers() === 0) {
        this.#stage.removeLayerGroup(layerGroup);
      }
    }
  }

  /**
   * Update an existing data view config.
   * Removes and re-creates the layer if found.
   *
   * @param {string} dataId The data id.
   * @param {string} divId The div id.
   * @param {ViewConfig} config The view configuration.
   */
  updateDataViewConfig(dataId, divId, config) {
    // input checks
    const configs = this.#options.dataViewConfigs;
    // check data id
    if (typeof configs[dataId] === 'undefined') {
      throw new Error('No config for dataId: ' + dataId);
    }
    // check div id
    const equalDivId = function (item) {
      return item.divId === divId;
    };
    const itemIndex = configs[dataId].findIndex(equalDivId);
    if (itemIndex === -1) {
      throw new Error('No config for dataId: ' +
        dataId + ' and divId: ' + divId);
    }

    // update config
    const configToUpdate = configs[dataId][itemIndex];
    for (const prop in config) {
      configToUpdate[prop] = config[prop];
    }

    // update layer group
    const layerGroup = this.#stage.getLayerGroupByDivId(configToUpdate.divId);
    if (typeof layerGroup !== 'undefined') {
      // remove layer if possible
      const vls = layerGroup.getViewLayersByDataId(dataId);
      if (vls.length === 1) {
        layerGroup.removeLayer(vls[0]);
      }
      const dls = layerGroup.getDrawLayersByDataId(dataId);
      if (dls.length === 1) {
        layerGroup.removeLayer(dls[0]);
      }
    }

    // render (will create layer)
    if (typeof this.#dataController.get(dataId) !== 'undefined') {
      this.render(dataId, [configToUpdate]);
    }
  }

  /**
   * Create layer groups according to a data view config:
   * adds them to stage and binds them.
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
          this.#createLayerGroup(viewConfig);
          divIds.push(viewConfig.divId);
        }
      }
    }
  }

  /**
   * Create a layer group according to a view config:
   * adds it to stage and binds it.
   *
   * @param {ViewConfig} viewConfig The view config.
   */
  #createLayerGroup(viewConfig) {
    // create new layer group
    const element = this.#options.rootDocument.getElementById(viewConfig.divId);
    const layerGroup = this.#stage.addLayerGroup(element);
    // bind events
    this.#bindLayerGroupToApp(layerGroup);
  }

  /**
   * Set the layer groups binders.
   *
   * @param {string[]} list The list of binder names.
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
   * @param {string} dataId The data id to render.
   * @param {ViewConfig[]} [viewConfigs] The list of configs to render.
   */
  render(dataId, viewConfigs) {
    if (typeof dataId === 'undefined' || dataId === null) {
      throw new Error('Cannot render without data id');
    }
    // guess data type
    const isImage =
      typeof this.getData(dataId).image !== 'undefined';
    const isMeasurement =
      typeof this.getData(dataId).annotationGroup !== 'undefined';

    // create layer groups if not done yet
    // (create all to allow for ratio sync)
    if (this.#stage.getNumberOfLayerGroups() === 0) {
      this.#createLayerGroups(this.#options.dataViewConfigs);
    }

    // use options list if non provided
    if (typeof viewConfigs === 'undefined') {
      viewConfigs = this.getViewConfigs(dataId);
    }

    // nothing to do if no view config
    if (viewConfigs.length === 0) {
      logger.info('Not rendering data: ' + dataId +
        ' (no data view config)');
      return;
    }

    // loop on configs
    for (let i = 0; i < viewConfigs.length; ++i) {
      const config = viewConfigs[i];
      const layerGroup =
        this.#stage.getLayerGroupByDivId(config.divId);
      // layer group must exist
      if (!layerGroup) {
        throw new Error('No layer group for ' + config.divId);
      }
      // create layer if needed
      // warn: needs a loaded DOM
      if (typeof this.#dataController.get(dataId) !== 'undefined') {
        if (isImage &&
          layerGroup.getViewLayersByDataId(dataId).length === 0
        ) {
          this.#addViewLayer(dataId, config);
        } else if (isMeasurement &&
          layerGroup.getDrawLayersByDataId(dataId).length === 0
        ) {
          this.addDrawLayer(dataId, config);
        }
      }
      // draw
      layerGroup.draw();
    }
  }

  /**
   * Zoom the layers of the active layer group.
   *
   * @param {number} step The step to add to the current zoom.
   * @param {number} cx The zoom center X coordinate.
   * @param {number} cy The zoom center Y coordinate.
   */
  zoom(step, cx, cy) {
    const layerGroup = this.#stage.getActiveLayerGroup();
    const viewController = layerGroup.getBaseViewLayer().getViewController();
    const k = viewController.getCurrentScrollPosition();
    const center = new Point3D(cx, cy, k);
    layerGroup.addScale(step, center);
    layerGroup.draw();
  }

  /**
   * Apply a translation to the layers of the active layer group.
   *
   * @param {number} tx The translation along X.
   * @param {number} ty The translation along Y.
   */
  translate(tx, ty) {
    const layerGroup = this.#stage.getActiveLayerGroup();
    layerGroup.addTranslation({x: tx, y: ty, z: 0});
    layerGroup.draw();
  }

  /**
   * Resample one image to match the orientation of another.
   *
   * @param {string} dataIdTarget The target image id to resample.
   * @param {string} dataIdSource The source image id to copy the
   *  orientation from.
   */
  resampleMatch(dataIdTarget, dataIdSource) {
    const sourceImage = this.#dataController.get(dataIdSource);

    if (
      typeof sourceImage !== 'undefined'
    ) {
      const sourceOrientation =
        sourceImage.image.getGeometry().getOrientation();
      this.resample(dataIdTarget, sourceOrientation);
    }
  }

  /**
   * Resample an image to match an arbitrary orientation.
   *
   * @param {string} dataIdTarget The target image id to resample.
   * @param {Matrix33} orientation The orientation to resample to.
   */
  resample(dataIdTarget, orientation) {
    const targetImage = this.#dataController.get(dataIdTarget);

    if (
      typeof targetImage !== 'undefined'
    ) {
      targetImage.image.resample(orientation);

      const configs = this.#options.dataViewConfigs;

      const metaTarget = targetImage.image.getMeta();
      const dataIds = this.#dataController.getDataIds();
      for (let i = 0; i < dataIds.length; i++) {
        const data = this.#dataController.get(dataIds[i]);

        const meta = data.image.getMeta();
        if (meta.Modality === 'SEG' &&
            meta.SeriesInstanceUID === metaTarget.SeriesInstanceUID) {
          this.#dataController.stash(dataIds[i]);
        }
      }

      // the image drastically changed, it is much easier to just
      // take the view config and forcefully re-initialize it

      // Only updating the configs of the affected images can cause
      // layers to inherit some configs from their segmentation layers
      // for some unknown reason. For now we just update all of them.
      this.setDataViewConfigs(configs);
      // render data (creates layers)
      const newDataIds = this.#dataController.getDataIds();
      for (let i = 0; i < newDataIds.length; ++i) {
        this.render(newDataIds[i]);
      }
    }
  }

  /**
   * Revert an image back to its original orientation.
   *
   * @param {string} dataIdTarget The target image id to revert.
   */
  revertResample(dataIdTarget) {
    const targetImage = this.#dataController.get(dataIdTarget);

    targetImage.image.revert();

    const configs = this.#options.dataViewConfigs;

    const metaTarget = targetImage.image.getMeta();
    const dataIds = this.#dataController.getStashedDataIds();
    for (let i = 0; i < dataIds.length; i++) {
      const data = this.#dataController.getStashed(dataIds[i]);

      const meta = data.image.getMeta();
      if (meta.Modality === 'SEG' &&
          meta.SeriesInstanceUID === metaTarget.SeriesInstanceUID) {
        this.#dataController.unstash(dataIds[i]);
      }
    }

    // the image drastically changed, it is much easier to just
    // take the view config and forcefully re-initialize it

    // Only updating the configs of the affected images can cause
    // layers to inherit some configs from their segmentation layers
    // for some unknown reason. For now we just update all of them.
    this.setDataViewConfigs(configs);
    // render data (creates layers)
    const newDataIds = this.#dataController.getDataIds();
    for (let i = 0; i < newDataIds.length; ++i) {
      this.render(newDataIds[i]);
    }
  }

  /**
   * Set the active view layer (of the active layer group) opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   * @deprecated Since v0.33, pplease set the opacity
   *   of the desired view layer directly.
   */
  setOpacity(alpha) {
    const viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    viewLayer.setOpacity(alpha);
    viewLayer.draw();
  }

  /**
   * Set the drawings of the active layer group.
   *
   * @deprecated Since v0.34, please switch to DICOM SR annotations.
   * @param {Array} drawings An array of drawings.
   * @param {Array} drawingsDetails An array of drawings details.
   * @param {string} dataId The converted data id.
   */
  setDrawings(drawings, drawingsDetails, dataId) {
    const layerGroup = this.#stage.getActiveLayerGroup();
    const viewLayer = layerGroup.getBaseViewLayer();
    const refDataId = viewLayer.getDataId();
    const refData = this.getData(refDataId);
    const viewController = viewLayer.getViewController();

    // convert konva to annotation
    // (assume current image is ref image)
    const annotations = konvaToAnnotation(
      drawings, drawingsDetails, refData.image);
    // create data
    const data = this.createAnnotationData(refDataId);
    // add annotations to data
    for (const annotation of annotations) {
      annotation.setViewController(viewController);
      data.annotationGroup.add(annotation);
    }
    // add to data controller
    this.#dataController.add(dataId, data);
    // render
    this.render(dataId);
  }

  /**
   * Apply a JSON state to this app.
   *
   * @deprecated Since v0.34, please switch to DICOM SR
   *   for annotations.
   * @param {string} jsonState The state of the app as a JSON string.
   * @param {string} dataId The state data id.
   */
  applyJsonState(jsonState, dataId) {
    const state = new State(dataId);
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
   * - CRTL-Z: undo,
   * - CRTL-Y: redo,
   * - CRTL-ARROW_LEFT: next element on fourth dim,
   * - CRTL-ARROW_UP: next element on third dim,
   * - CRTL-ARROW_RIGHT: previous element on fourth dim,
   * - CRTL-ARROW_DOWN: previous element on third dim.
   *
   * Applies to the active view of the active layer group.
   *
   * @param {KeyboardEvent} event The key down event.
   * @fires UndoStack#undo
   * @fires UndoStack#redo
   * @function
   */
  defaultOnKeydown = (event) => {
    if (event.ctrlKey) {
      if (event.shiftKey) {
        const layerGroup = this.#stage.getActiveLayerGroup();
        const positionHelper = layerGroup.getPositionHelper();
        if (event.key === 'ArrowLeft') { // crtl-shift-arrow-left
          if (layerGroup.moreThanOne(3)) {
            positionHelper.decrementPosition(3);
          }
        } else if (event.key === 'ArrowUp') { // crtl-shift-arrow-up
          if (layerGroup.canScroll()) {
            positionHelper.incrementPositionAlongScroll();
          }
        } else if (event.key === 'ArrowRight') { // crtl-shift-arrow-right
          if (layerGroup.moreThanOne(3)) {
            positionHelper.incrementPosition(3);
          }
        } else if (event.key === 'ArrowDown') { // crtl-shift-arrow-down
          if (layerGroup.canScroll()) {
            positionHelper.decrementPositionAlongScroll();
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
   * Reset the display.
   */
  resetDisplay() {
    this.resetLayout();
    this.initWLDisplay();
  }

  /**
   * Reset the app zoom.
   */
  resetZoom() {
    this.resetLayout();
  }

  /**
   * Set the colour map of the active view of the active layer group.
   *
   * @param {string} name The colour map name.
   * @deprecated Since v0.33, please use the ViewController
   *   equivalent directly instead.
   */
  setColourMap(name) {
    const viewController =
      this.#stage.getActiveLayerGroup()
        .getActiveViewLayer().getViewController();
    viewController.setColourMap(name);
  }

  /**
   * Set the window/level preset of the active view of the active layer group.
   *
   * @param {string} preset The window/level preset.
   * @deprecated Since v0.33, please use the ViewController
   *   equivalent directly instead.
   */
  setWindowLevelPreset(preset) {
    const viewController =
      this.#stage.getActiveLayerGroup()
        .getActiveViewLayer().getViewController();
    viewController.setWindowLevelPreset(preset);
  }

  /**
   * Set the tool.
   *
   * @param {string} tool The tool.
   */
  setTool(tool) {
    // bind tool to active layer
    for (let i = 0; i < this.#stage.getNumberOfLayerGroups(); ++i) {
      const layerGroup = this.#stage.getLayerGroup(i);
      const layer = layerGroup.getActiveLayer();
      if (typeof layer !== 'undefined') {
        this.#toolboxController.bindLayerGroup(layerGroup, layer);
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
   * Undo the last action.
   *
   * @fires UndoStack#undo
   */
  undo() {
    this.#undoStack.undo();
  }

  /**
   * Redo the last action.
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

  /**
   * Get the overlay data for a data id.
   *
   * @param {string} dataId The data id.
   * @returns {OverlayData|undefined} The overlay data.
   */
  getOverlayData(dataId) {
    let data;
    if (typeof this.#overlayDatas !== 'undefined') {
      data = this.#overlayDatas[dataId];
    }
    return data;
  }

  /**
   * Toggle overlay listeners.
   *
   * @param {string} dataId The data id.
   */
  toggleOverlayListeners(dataId) {
    const data = this.getOverlayData(dataId);
    if (typeof data !== 'undefined') {
      if (data.isListening()) {
        data.removeAppListeners();
      } else {
        data.addAppListeners();
      }
    }
  }

  /**
   * Create new annotation data based on the data of
   *   the active view layer.
   *
   * @param {string} refDataId The reference data id.
   * @returns {DicomData} The new data.
   */
  createAnnotationData(refDataId) {
    const refData = this.getData(refDataId);
    const refMeta = refData.image.getMeta();

    const data = new DicomData({});
    data.annotationGroup = new AnnotationGroup();
    data.annotationGroup.setMetaValue('Modality', 'SR');

    const tagsToCopy = [
      'PatientName',
      'PatientID',
      'PatientBirthDate',
      'PatientSex',
      'StudyDate',
      'StudyTime',
      'StudyInstanceUID',
      'StudyID',
      'StudyDescription'
    ];
    for (const tag of tagsToCopy) {
      data.annotationGroup.setMetaValue(tag, refMeta[tag]);
    }

    // used to associate with a view layer
    data.annotationGroup.setMetaValue(
      'CurrentRequestedProcedureEvidenceSequence', {
        value: [{
          ReferencedSeriesSequence: {
            value: [{
              // ReferencedSOPSequence: left to fill in later
              SeriesInstanceUID: refMeta.SeriesInstanceUID
            }]
          },
          StudyInstanceUID: refMeta.StudyInstanceUID
        }]
      }
    );

    return data;
  }

  /**
   * Add new data and render it with a simple new data view config.
   *
   * @param {DicomData} data The data to add.
   * @param {string} divId The div where to draw.
   * @param {string} refDataId The reference data id.
   */
  addAndRenderAnnotationData(data, divId, refDataId) {
    // add new data
    const dataId = this.addData(data);
    // add data view config based on reference data
    const refDataViewConfigs = this.getViewConfigs(refDataId);
    const refDataViewConfig = refDataViewConfigs.find(
      element => element.divId === divId);
    if (typeof refDataViewConfig === 'undefined') {
      throw new Error('No reference data view config for draw');
    }
    const drawDataViewConfig = new ViewConfig(divId);
    drawDataViewConfig.orientation = refDataViewConfig.orientation;
    this.addDataViewConfig(dataId, drawDataViewConfig);
    // render (will create draw layer)
    this.render(dataId);
  }

  // Private Methods -----------------------------------------------------------

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    let propagate = true;
    if (typeof event.propagate !== 'undefined') {
      propagate = event.propagate;
      delete event.propagate;
    }
    if (propagate) {
      this.#listenerHandler.fireEvent(event);
    }
  };

  /**
   * Data load start callback.
   *
   * @param {object} event The load start event.
   */
  #onloadstart = (event) => {
    // create overlay data
    if (typeof this.#options.overlayConfig !== 'undefined') {
      this.#overlayDatas[event.dataid] = new OverlayData(
        this, event.dataid, this.#options.overlayConfig);
    }
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

    let eventMetaData;
    if (event.loadtype === 'image') {
      eventMetaData = event.data.meta;
    } else if (event.loadtype === 'state') {
      eventMetaData = 'state';
    }

    /**
     * Load item event: fired when an item has been successfully loaded.
     *
     * @event App#loaditem
     * @type {object}
     * @property {string} type The event type.
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
      dataid: event.dataid,
      isfirstitem: event.isfirstitem,
      warn: event.warn
    });

    const isFirstLoadItem = event.isfirstitem;

    if (event.loadtype === 'image') {
      if (isFirstLoadItem) {
        this.#dataController.add(event.dataid, event.data);
      } else {
        this.#dataController.update(event.dataid, event.data);
      }
    } else if (event.loadtype === 'state') {
      this.applyJsonState(event.data, event.dataid);
    }

    // update overlay data if present
    if (typeof this.#overlayDatas !== 'undefined' &&
      typeof this.#overlayDatas[event.dataid] !== 'undefined') {
      this.#overlayDatas[event.dataid].addItemMeta(eventMetaData);
    }

    // render if first and flag allows
    if (event.loadtype === 'image' &&
      this.getViewConfigs(event.dataid).length !== 0 &&
      isFirstLoadItem && this.#options.viewOnFirstLoadItem) {
      this.render(event.dataid);
    }
  };

  /**
   * Data load callback.
   *
   * @param {object} event The load event.
   */
  #onload = (event) => {
    // mark data as complete
    this.#dataController.markDataAsComplete(event.dataid);

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
     * @event App#error
     * @type {object}
     * @property {string} type The event type: error.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     * @property {object} error The error.
     * @property {object} target The event target.
     */
    if (typeof event.type === 'undefined') {
      event.type = 'error';
    }
    this.#fireEvent(event);
  };

  /**
   * Data load timeout callback.
   *
   * @param {object} event The timeout event.
   */
  #onloadtimeout = (event) => {
    /**
     * Load timeout event.
     *
     * @event App#timeout
     * @type {object}
     * @property {string} type The event type: timeout.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: an url as a string.
     * @property {object} target The event target.
     */
    if (typeof event.type === 'undefined') {
      event.type = 'timeout';
    }
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
     * @event App#abort
     * @type {object}
     * @property {string} type The event type: abort.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     */
    if (typeof event.type === 'undefined') {
      event.type = 'abort';
    }
    this.#fireEvent(event);
  };

  /**
   * Bind layer group events to app.
   *
   * @param {LayerGroup} group The layer group.
   */
  #bindLayerGroupToApp(group) {
    // propagate layer group events
    group.addEventListener('zoomchange', this.#fireEvent);
    group.addEventListener('offsetchange', this.#fireEvent);
    group.addEventListener('layerremove', this.#fireEvent);
    // propagate viewLayer events
    group.addEventListener('renderstart', this.#fireEvent);
    group.addEventListener('renderend', this.#fireEvent);
    // propagate view events
    for (const eventName of viewEventNames) {
      group.addEventListener(eventName, this.#fireEvent);
    }
    // updata data view config
    group.addEventListener('wlchange', (event) => {
      const layerDetails = getLayerDetailsFromLayerDivId(event.srclayerid);
      const groupId = layerDetails.groupDivId;
      const config = this.getViewConfig(event.dataid, groupId, true);
      if (typeof config !== 'undefined') {
        // reset previous values
        config.windowCenter = undefined;
        config.windowWidth = undefined;
        config.wlPresetName = undefined;
        // window width, center and name
        if (event.value.length === 3) {
          config.windowCenter = event.value[0];
          config.windowWidth = event.value[1];
          config.wlPresetName = event.value[2];
        }
      }
    });
    group.addEventListener('opacitychange', (event) => {
      const layerDetails = getLayerDetailsFromLayerDivId(event.srclayerid);
      const groupId = layerDetails.groupDivId;
      const config = this.getViewConfig(event.dataid, groupId, true);
      if (typeof config !== 'undefined') {
        config.opacity = event.value[0];
      }
    });
    group.addEventListener('colourmapchange', (event) => {
      const layerDetails = getLayerDetailsFromLayerDivId(event.srclayerid);
      const groupId = layerDetails.groupDivId;
      const config = this.getViewConfig(event.dataid, groupId, true);
      if (typeof config !== 'undefined') {
        config.colourMap = event.value[0];
      }
    });
  }

  /**
   * Add a view layer.
   *
   * @param {string} dataId The data id.
   * @param {ViewConfig} viewConfig The data view config.
   */
  #addViewLayer(dataId, viewConfig) {
    const data = this.#dataController.get(dataId);
    if (!data) {
      throw new Error('Cannot initialise layer with missing data, id: ' +
        dataId);
    }
    const layerGroup = this.#stage.getLayerGroupByDivId(viewConfig.divId);
    if (!layerGroup) {
      throw new Error('Cannot initialise layer with missing group, id: ' +
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
      getMatrixFromName(viewConfig.orientation)
    );
    view.setOrientation(viewOrientation);

    // make pixel of value 0 transparent for segmentation
    // (assuming RGB data)
    if (data.image.getMeta().Modality === 'SEG') {
      view.setAlphaFunction(function (value /*, index*/) {
        if (value === 0) {
          return 0;
        } else {
          return 0xff;
        }
      });
    }

    // do we have more than one layer
    // (the layer has not been added to the layer group yet)
    const isBaseLayer = layerGroup.getNumberOfViewLayers() === 0;

    // opacity
    let opacity = 1;
    if (typeof viewConfig.opacity !== 'undefined') {
      opacity = viewConfig.opacity;
    } else {
      if (!isBaseLayer) {
        opacity = 0.5;
      }
    }

    // view layer
    const viewLayer = layerGroup.addViewLayer();
    viewLayer.setView(view, dataId);
    const size2D = imageGeometry.getSize(viewOrientation).get2D();
    const spacing2D = imageGeometry.getSpacing(viewOrientation).get2D();
    viewLayer.initialise(size2D, spacing2D, opacity);

    // view controller
    const viewController = viewLayer.getViewController();
    // window/level
    if (typeof viewConfig.wlPresetName !== 'undefined') {
      viewController.setWindowLevelPreset(viewConfig.wlPresetName);
    } else if (typeof viewConfig.windowCenter !== 'undefined' &&
      typeof viewConfig.windowWidth !== 'undefined') {
      const wl = new WindowLevel(
        viewConfig.windowCenter, viewConfig.windowWidth);
      viewController.setWindowLevel(wl);
    }
    // colour map
    if (typeof viewConfig.colourMap !== 'undefined') {
      viewController.setColourMap(viewConfig.colourMap);
    } else {
      if (!isBaseLayer) {
        if (data.image.getMeta().Modality === 'PT') {
          viewController.setColourMap('hot');
        } else {
          viewController.setColourMap('rainbow');
        }
      }
    }

    // listen to image set
    this.#dataController.addEventListener(
      'dataimageset', viewLayer.onimageset);

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
    this.#stage.fitToContainer();

    // layer offset (done before scale)
    viewLayer.setOffset(layerGroup.getOffset());

    // get and apply flip flags
    const flipFlags = this.#getViewFlipFlags(
      imageGeometry.getOrientation(),
      viewConfig.orientation);
    this.#applyFlipFlags(flipFlags, viewLayer);

    // layer scale (done after possible flip)
    if (!isBaseLayer) {
      // use zoom offset of base layer
      const baseViewLayer = layerGroup.getBaseViewLayer();
      viewLayer.initScale(
        layerGroup.getScale(),
        baseViewLayer.getAbsoluteZoomOffset()
      );
    } else {
      viewLayer.setScale(layerGroup.getScale());
    }

    // bind
    this.#stage.bindLayerGroups();
    if (this.#toolboxController) {
      this.#toolboxController.bindLayerGroup(layerGroup, viewLayer);
    }

    /**
     * Add view layer event.
     *
     * @event App#viewlayeradd
     * @type {object}
     * @property {string} type The event type.
     * @property {string} layerid The layer id.
     * @property {string} layergroupid The layer group id.
     * @property {string} dataid The data id.
     */
    this.#fireEvent({
      type: 'viewlayeradd',
      layerid: viewLayer.getId(),
      layergroupid: layerGroup.getDivId(),
      dataid: dataId
    });

    // initialise the toolbox for base
    if (isBaseLayer) {
      if (this.#toolboxController) {
        this.#toolboxController.init();
      }
    }
  }

  /**
   * Get the reference layer of an annotation group.
   *
   * @param {AnnotationGroup} annotationGroup The annotation group to attach.
   * @param {LayerGroup} layerGroup The group where to find the reference.
   * @returns {ViewLayer} The reference view layer.
   */
  #getReferenceLayer(annotationGroup, layerGroup) {
    let refViewLayer;

    // use meta
    // -> will match empty groups created with createAnnotationData
    const evidenceSeq =
      annotationGroup.getMetaValue('CurrentRequestedProcedureEvidenceSequence');
    if (typeof evidenceSeq !== 'undefined') {
      const evidenceSeqItem0 = evidenceSeq.value[0];
      const refSeriesSeq = evidenceSeqItem0?.ReferencedSeriesSequence;
      const refSeriesSeqItem0 = refSeriesSeq?.value[0];
      const refSeriesInstanceUID = refSeriesSeqItem0?.SeriesInstanceUID;
      const metaSearch = {
        SeriesInstanceUID: refSeriesInstanceUID
      };
      const viewLayers = layerGroup.searchViewLayers(metaSearch);
      if (viewLayers.length !== 0) {
        refViewLayer = viewLayers[0];
      }
    }

    // dwv034 wrongly uses ReferencedSeriesSequence tag at root
    // and does not set the SOPClassUID of annotation reference...
    const refSeriesSeq =
      annotationGroup.getMetaValue('ReferencedSeriesSequence');
    if (typeof refSeriesSeq !== 'undefined') {
      const refSeriesSeqItem0 = refSeriesSeq.value[0];
      const refSeriesInstanceUID = refSeriesSeqItem0?.SeriesInstanceUID;
      const metaSearch = {
        SeriesInstanceUID: refSeriesInstanceUID
      };
      const viewLayers = layerGroup.searchViewLayers(metaSearch);
      if (viewLayers.length !== 0) {
        refViewLayer = viewLayers[0];
      }
    }

    // if no meta, go through annotations
    if (typeof refViewLayer === 'undefined') {
      for (const annotation of annotationGroup.getList()) {
        const metaSearch = {
          SOPInstanceUID: annotation.referencedSopInstanceUID,
          SOPClassUID: annotation.referencedSopClassUID
        };
        const viewLayers = layerGroup.searchViewLayers(metaSearch);
        if (viewLayers.length !== 0) {
          // exit at first match
          refViewLayer = viewLayers[0];
          break;
        }
      }
    }

    return refViewLayer;
  }

  /**
   * Add a draw layer.
   *
   * @param {string} dataId The data id.
   * @param {ViewConfig} viewConfig The data view config.
   */
  addDrawLayer(dataId, viewConfig) {
    const layerGroup = this.#stage.getLayerGroupByDivId(viewConfig.divId);
    if (!layerGroup) {
      throw new Error('Cannot initialise layer with missing group, id: ' +
        viewConfig.divId);
    }

    const data = this.#dataController.get(dataId);
    if (!data) {
      throw new Error('Cannot initialise layer with missing data, id: ' +
        dataId);
    }
    const annotationGroup = data.annotationGroup;

    // find referenced view layer
    const refViewLayer = this.#getReferenceLayer(annotationGroup, layerGroup);
    if (typeof refViewLayer === 'undefined') {
      console.warn(
        'No loaded data that matches the measurements reference series UID');
      return;
    }
    const refDataId = refViewLayer.getDataId();

    // un-bind
    this.#stage.unbindLayerGroups();

    // set annotation view controller (allows quantification)
    const refViewController = refViewLayer.getViewController();
    data.annotationGroup.setViewController(refViewController);

    // reference data to use as base for layer properties
    const refData = this.#dataController.get(refDataId);
    if (!refData) {
      throw new Error(
        'Cannot initialise layer without reference data, id: ' +
        refDataId);
    }
    const imageGeometry = refData.image.getGeometry();

    const viewOrientation = getViewOrientation(
      imageGeometry.getOrientation(),
      getMatrixFromName(viewConfig.orientation)
    );
    const size2D = imageGeometry.getSize(viewOrientation).get2D();
    const spacing2D = imageGeometry.getSpacing(viewOrientation).get2D();

    const drawLayer = layerGroup.addDrawLayer();
    drawLayer.initialise(size2D, spacing2D, refViewLayer.getId());

    const planeHelper = new PlaneHelper(
      imageGeometry,
      viewOrientation
    );
    drawLayer.setPlaneHelper(planeHelper);

    // sync layers position
    const value = [
      refViewController.getCurrentIndex().getValues(),
      refViewController.getCurrentPosition().getValues()
    ];
    layerGroup.updateLayersToPositionChange({
      value: value,
      srclayerid: drawLayer.getId()
    });

    // sync layer groups
    this.#stage.fitToContainer();

    // layer offset (done before scale)
    drawLayer.setOffset(layerGroup.getOffset());

    // get and apply flip flags
    const flipFlags = this.#getViewFlipFlags(
      imageGeometry.getOrientation(),
      viewConfig.orientation);
    this.#applyFlipFlags(flipFlags, drawLayer);

    // layer scale (done after possible flip)
    // use zoom offset of ref layer
    drawLayer.initScale(
      layerGroup.getScale(),
      refViewLayer.getAbsoluteZoomOffset()
    );

    // add possible existing data
    drawLayer.setAnnotationGroup(
      data.annotationGroup,
      dataId,
      this.addToUndoStack);

    drawLayer.setCurrentPosition(
      refViewController.getCurrentPosition(),
      refViewController.getCurrentIndex()
    );

    // bind
    this.#stage.bindLayerGroups();
    if (this.#toolboxController) {
      this.#toolboxController.bindLayerGroup(layerGroup, drawLayer);
    }

    /**
     * Add draw layer event.
     *
     * @event App#drawlayeradd
     * @type {object}
     * @property {string} type The event type.
     * @property {string} layerid The layer id.
     * @property {string} layergroupid The layer group id.
     * @property {string} dataid The data id.
     */
    this.#fireEvent({
      type: 'drawlayeradd',
      layerid: drawLayer.getId(),
      layergroupid: layerGroup.getDivId(),
      dataid: dataId
    });
  }

  /**
   * Get the view flip flags: offset (x, y) and scale (x, y, z) flags.
   *
   * @param {Matrix33} imageOrientation The image orientation.
   * @param {string} viewConfigOrientation The view config orientation.
   * @returns {object} Offset and scale flip flags.
   */
  #getViewFlipFlags(imageOrientation, viewConfigOrientation) {
    // 'simple' orientation code (does not take into account angles)
    const orientationCode =
      getOrientationStringLPS(imageOrientation.asOneAndZeros());
    if (typeof orientationCode === 'undefined') {
      throw new Error('Unsupported undefined orientation code');
    }

    // view orientation flags
    const isViewUndefined = typeof viewConfigOrientation === 'undefined';
    const isViewAxial = !isViewUndefined &&
      viewConfigOrientation === Orientation.Axial;
    const isViewCoronal = !isViewUndefined &&
      viewConfigOrientation === Orientation.Coronal;
    const isViewSagittal = !isViewUndefined &&
      viewConfigOrientation === Orientation.Sagittal;

    // default flags
    const flipOffset = {
      x: false,
      y: false
    };
    const flipScale = {
      x: false,
      y: false,
      z: false
    };

    if (orientationCode === 'LPS') {
      // axial
      if (isViewCoronal || isViewSagittal) {
        flipScale.z = true;
        flipOffset.y = true;
      }
    } else if (orientationCode === 'LAI') {
      // axial
      if (isViewUndefined || isViewAxial) {
        flipOffset.y = true;
      } else if (isViewCoronal) {
        flipScale.z = true;
      } else if (isViewSagittal) {
        flipScale.z = true;
        flipOffset.x = true;
      }
    } else if (orientationCode === 'RPI') {
      // axial
      if (isViewUndefined || isViewAxial) {
        flipOffset.x = true;
      } else if (isViewCoronal) {
        flipScale.z = true;
        flipOffset.x = true;
      } else if (isViewSagittal) {
        flipScale.z = true;
      }
    } else if (orientationCode === 'RAS') {
      // axial
      flipOffset.x = true;
      flipOffset.y = true;
      if (isViewCoronal || isViewSagittal) {
        flipScale.z = true;
      }
    } else if (orientationCode === 'LSA') {
      // coronal
      flipOffset.y = true;
      if (isViewUndefined || isViewCoronal) {
        flipScale.z = true;
      } else if (isViewAxial) {
        flipScale.y = true;
      } else if (isViewSagittal) {
        flipOffset.x = true;
        flipScale.y = true;
        flipScale.z = true;
      }
    // } else if (orientationCode === 'LIP') { // nothing to do
    } else if (orientationCode === 'RSP') {
      // coronal
      if (isViewUndefined || isViewCoronal) {
        flipOffset.x = true;
        flipOffset.y = true;
        flipScale.x = true;
        flipScale.z = true;
      } else if (isViewAxial) {
        flipOffset.x = true;
        flipScale.x = true;
      } else if (isViewSagittal) {
        flipOffset.y = true;
        flipScale.z = true;
      }
    } else if (orientationCode === 'RIA') {
      // coronal
      flipOffset.x = true;
      if (isViewUndefined || isViewCoronal) {
        flipScale.x = true;
      } else if (isViewAxial) {
        flipOffset.y = true;
        flipScale.x = true;
        flipScale.y = true;
      } else if (isViewSagittal) {
        flipScale.y = true;
      }
    } else if (orientationCode === 'PSL') {
      // sagittal
      flipScale.z = true;
      if (isViewUndefined || isViewSagittal) {
        flipOffset.y = true;
      } else if (isViewCoronal) {
        flipOffset.y = true;
      }
    } else if (orientationCode === 'PIR') {
      // sagittal
      flipScale.z = true;
      if (isViewAxial || isViewCoronal) {
        flipOffset.x = true;
      }
    } else if (orientationCode === 'ASR') {
      // sagittal
      flipOffset.x = true;
      flipOffset.y = true;
      if (isViewUndefined || isViewSagittal) {
        flipScale.z = true;
      } else if (isViewCoronal) {
        flipScale.z = true;
      }
    } else if (orientationCode === 'AIL') {
      // sagittal
      if (isViewUndefined || isViewSagittal) {
        flipOffset.x = true;
        flipScale.z = true;
      } else if (isViewAxial) {
        flipOffset.y = true;
      } else if (isViewCoronal) {
        flipScale.z = true;
      }
    } else {
      // LIP uses default scale and offset
      if (orientationCode !== 'LIP') {
        logger.warn('Unsupported orientation code: ' +
          orientationCode + ', display could be incorrect');
      }
    }

    return {
      scale: flipScale,
      offset: flipOffset
    };
  }

  #applyFlipFlags(flipFlags, layer) {
    if (flipFlags.offset.x) {
      layer.addFlipOffsetX();
    }
    if (flipFlags.offset.y) {
      layer.addFlipOffsetY();
    }
    if (flipFlags.scale.x) {
      layer.flipScaleX();
    }
    if (flipFlags.scale.y) {
      layer.flipScaleY();
    }
    if (flipFlags.scale.z) {
      layer.flipScaleZ();
    }
  }

} // class App
