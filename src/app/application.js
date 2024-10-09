import {viewEventNames} from '../image/view';
import {ViewFactory} from '../image/viewFactory';
import {
  getMatrixFromName,
  getOrientationStringLPS,
  Orientation
} from '../math/orientation';
import {Point3D} from '../math/point';
import {Stage} from '../gui/stage';
import {Style} from '../gui/style';
import {
  getViewOrientation,
  getLayerDetailsFromLayerDivId
} from '../gui/layerGroup';
import {ListenerHandler} from '../utils/listen';
import {State} from '../io/state';
import {logger} from '../utils/logger';
import {getUriQuery, decodeQuery} from '../utils/uri';
import {UndoStack} from '../utils/undoStack';
import {ToolboxController} from './toolboxController';
import {LoadController} from './loadController';
import {DataController} from './dataController';
import {OverlayData} from '../gui/overlayData';
import {
  toolList,
  defaultToolList,
  toolOptions,
  defaultToolOptions
} from '../tools';
import {binderList} from '../gui/stage';
import {WindowLevel} from '../image/windowLevel';
import {PlaneHelper} from '../image/planeHelper';
import {AnnotationGroup} from '../image/annotationGroup';
import {konvaToAnnotation} from '../gui/drawLayer';

// doc imports
/* eslint-disable no-unused-vars */
import {LayerGroup} from '../gui/layerGroup';
import {ViewLayer} from '../gui/viewLayer';
import {DrawLayer} from '../gui/drawLayer';
import {Image} from '../image/image';
import {Matrix33} from '../math/matrix';
import {DataElement} from '../dicom/dataElement';
import {Scalar3D} from '../math/scalar';
import {DicomData} from './dataController';
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
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * const viewConfig0 = new dwv.ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new dwv.AppOptions(viewConfigs);
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
   * @deprecated Please use the ViewController equivalent directly instead.
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
   * @deprecated Please use the ViewController equivalent directly instead.
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
   * // create the dwv app
   * const app = new dwv.App();
   * // initialise
   * const viewConfig0 = new dwv.ViewConfig('layerGroup0');
   * const viewConfigs = {'*': [viewConfig0]};
   * const options = new dwv.AppOptions(viewConfigs);
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
                // find the option in the default tool list
                let optionClass =
                  defaultToolOptions[toolNamespace][optionClassName];
                // or use external one
                if (typeof optionClass === 'undefined') {
                  optionClass = toolOptions[toolNamespace][optionClassName];
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
    this.#loadController.onabort = this.#onloadabort;

    // create data controller
    this.#dataController = new DataController();
    // propagate data events
    this.#dataController.addEventListener('dataadd', this.#fireEvent);
    this.#dataController.addEventListener('dataremove', this.#fireEvent);
    this.#dataController.addEventListener('dataimageset', this.#fireEvent);
    this.#dataController.addEventListener('dataupdate', this.#fireEvent);
    // propage individual data events
    this.#dataController.addEventListener(
      'imagecontentchange', this.#fireEvent);
    this.#dataController.addEventListener(
      'imagegeometrychange', this.#fireEvent);
    this.#dataController.addEventListener('annotationadd', this.#fireEvent);
    this.#dataController.addEventListener('annotationupdate', this.#fireEvent);
    this.#dataController.addEventListener('annotationremove', this.#fireEvent);
    this.#dataController.addEventListener(
      'annotationgroupeditablechange', this.#fireEvent);
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
   * @fires App#error
   * @fires App#abort
   * @function
   */
  loadFiles = (files) => {
    // Get new data id
    const dataId = this.#dataController.getNextDataId();
    if (files.length === 0) {
      logger.warn('Ignoring empty input file list.');
      return;
    }
    this.#loadController.loadFiles(files, dataId);
  };

  /**
   * Load a list of URLs. Can be image files or a state file.
   *
   * @param {string[]} urls The list of urls to load.
   * @param {object} [options] The options object, can contain:
   * - requestHeaders: an array of {name, value} to use as request headers,
   * - withCredentials: boolean xhr.withCredentials flag to pass to the request,
   * - batchSize: the size of the request url batch.
   * @fires App#loadstart
   * @fires App#loadprogress
   * @fires App#loaditem
   * @fires App#loadend
   * @fires App#error
   * @fires App#abort
   * @function
   */
  loadURLs = (urls, options) => {
    // Get new data id
    const dataId = this.#dataController.getNextDataId();
    if (urls.length === 0) {
      logger.warn('Ignoring empty input url list.');
      return;
    }
    this.#loadController.loadURLs(urls, dataId, options);
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
   * @fires App#error
   * @fires App#abort
   * @function
   */
  loadImageObject = (data) => {
    // Get new data id
    const dataId = this.#dataController.getNextDataId();
    this.#loadController.loadImageObject(data, dataId);
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
   * @deprecated Please set the opacity of the desired view layer directly.
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
   *
   * @param {string} dataId The data id.
   * @param {string} divId The div id.
   */
  removeDataViewConfig(dataId, divId) {
    // remove from list
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
    configs[dataId].splice(itemIndex, 1);
    if (configs[dataId].length === 0) {
      delete configs[dataId];
    }

    // data is loaded, remove view
    if (typeof this.#dataController.get(dataId) !== 'undefined') {
      const lg = this.#stage.getLayerGroupByDivId(divId);
      if (typeof lg !== 'undefined') {
        const vls = lg.getViewLayersByDataId(dataId);
        if (vls.length === 1) {
          lg.removeLayer(vls[0]);
        }
        const dls = lg.getDrawLayersByDataId(dataId);
        if (dls.length === 1) {
          lg.removeLayer(dls[0]);
        }
        if (vls.length === 0 && dls.length === 0) {
          throw new Error('Expected one layer, got none');
        }
        if (lg.getNumberOfLayers() === 0) {
          this.#stage.removeLayerGroup(lg);
        }
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

    // remove previous layers
    const lg = this.#stage.getLayerGroupByDivId(configToUpdate.divId);
    if (typeof lg !== 'undefined') {
      const vls = lg.getViewLayersByDataId(dataId);
      if (vls.length === 1) {
        lg.removeLayer(vls[0]);
      }
      const dls = lg.getDrawLayersByDataId(dataId);
      if (dls.length === 1) {
        lg.removeLayer(dls[0]);
      }
      if (vls.length === 0 && dls.length === 0) {
        throw new Error('Expected one layer, got none');
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
    const viewController = layerGroup.getActiveViewLayer().getViewController();
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
   * Set the active view layer (of the active layer group) opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   * @deprecated Please set the opacity of the desired view layer directly.
   */
  setOpacity(alpha) {
    const viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    viewLayer.setOpacity(alpha);
    viewLayer.draw();
  }

  /**
   * Set the drawings of the active layer group.
   *
   * @deprecated Please switch to DICOM SR annotations.
   * @param {Array} drawings An array of drawings.
   * @param {Array} drawingsDetails An array of drawings details.
   * @param {string} dataId The converted data id.
   */
  setDrawings(drawings, drawingsDetails, dataId) {
    const layerGroup = this.#stage.getActiveLayerGroup();
    const viewLayer = layerGroup.getActiveViewLayer();
    const refDataId = viewLayer.getDataId();
    const viewController = viewLayer.getViewController();

    // convert konva to annotation
    const annotations = konvaToAnnotation(drawings, drawingsDetails);
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
   * @deprecated
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
        const viewController =
          layerGroup.getActiveViewLayer().getViewController();
        if (event.key === 'ArrowLeft') { // crtl-shift-arrow-left
          if (viewController.moreThanOne(3)) {
            viewController.decrementIndex(3);
          }
        } else if (event.key === 'ArrowUp') { // crtl-shift-arrow-up
          if (layerGroup.canScroll()) {
            viewController.incrementScrollIndex();
          }
        } else if (event.key === 'ArrowRight') { // crtl-shift-arrow-right
          if (layerGroup.moreThanOne(3)) {
            viewController.incrementIndex(3);
          }
        } else if (event.key === 'ArrowDown') { // crtl-shift-arrow-down
          if (layerGroup.canScroll()) {
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
   * @deprecated Please use the ViewController equivalent directly instead.
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
   * @deprecated Please use the ViewController equivalent directly instead.
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
      // draw or view layer
      const isDrawTool = tool === 'Draw' ||
        tool === 'Livewire' ||
        tool === 'Floodfill';
      let layer;
      if (isDrawTool &&
        typeof layerGroup.getActiveDrawLayer() !== 'undefined') {
        layer = layerGroup.getActiveDrawLayer();
      } else {
        layer = layerGroup.getActiveViewLayer();
      }
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
    data.annotationGroup.setMetaValue(
      'PatientID', refMeta.PatientID);
    data.annotationGroup.setMetaValue(
      'StudyInstanceUID', refMeta.StudyInstanceUID);
    data.annotationGroup.setMetaValue(
      'ReferencedSeriesSequence', {
        value: [{
          SeriesInstanceUID: refMeta.SeriesInstanceUID
        }]
      });
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
    this.#listenerHandler.fireEvent(event);
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

    const isFirstLoadItem = event.isfirstitem;

    let eventMetaData = null;
    if (event.loadtype === 'image') {
      if (isFirstLoadItem) {
        this.#dataController.add(event.dataid, event.data);
      } else {
        this.#dataController.update(event.dataid, event.data);
      }
      eventMetaData = event.data.meta;
    } else if (event.loadtype === 'state') {
      this.applyJsonState(event.data, event.dataid);
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
      dataid: event.dataid,
      isfirstitem: event.isfirstitem,
      warn: event.warn
    });

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
        if (value[0] === 0 &&
          value[1] === 0 &&
          value[2] === 0) {
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
     * @event Application#viewlayeradd
     * @type {object}
     * @property {string} type The event type.
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

    // reference is the data of the view layer with the
    //   same StudyInstanceUID
    const data = this.#dataController.get(dataId);
    if (!data) {
      throw new Error('Cannot initialise layer with missing data, id: ' +
        dataId);
    }
    const refSeriesSeq =
      data.annotationGroup.getMetaValue('ReferencedSeriesSequence');
    const refSeriesInstanceUID = refSeriesSeq.value[0].SeriesInstanceUID;
    const viewLayers = layerGroup.searchViewLayers({
      SeriesInstanceUID: refSeriesInstanceUID
    });
    if (viewLayers.length === 0) {
      console.warn(
        'No loaded data that matches the measurement reference series UID');
      return;
    }
    const refViewLayer = viewLayers[0];
    const refDataId = refViewLayer.getDataId();

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

    /**
     * Add draw layer event.
     *
     * @event Application#drawlayeradd
     * @type {object}
     * @property {string} type The event type.
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
      logger.warn('Unsupported orientation code: ' +
        orientationCode + ', display could be incorrect');
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
