import {imageEventNames} from '../image/image.js';
import {annotationGroupEventNames} from '../image/annotationGroup.js';
import {dataEventNames} from '../app/dataController.js';
import {Style} from '../gui/style.js';
import {State} from '../io/state.js';
import {logger} from '../utils/logger.js';
import {getUriQuery, decodeQuery} from '../utils/uri.js';
import {UndoStack} from '../command/undoStack.js';
import {ToolboxController} from './toolboxController.js';
import {LoadController} from './loadController.js';
import {DataController} from './dataController.js';
import {InfoData} from '../gui/infoData.js';
import {
  toolList,
  defaultToolList,
} from '../tools/toolList.js';
import {
  toolOptions,
  defaultToolOptions
} from '../tools/toolOptions.js';
import {binderList} from '../gui/binders.js';
import {AnnotationGroup} from '../image/annotationGroup.js';
import {konvaToAnnotation} from '../gui/drawLayer.js';
import {DicomData} from './dataController.js';
import {
  StageController,
  stageControllerEventNames,
} from './stageController.js';

/**
 * @import {LayerGroup} from '../gui/layerGroup.js';
 * @import {ViewLayer} from '../gui/viewLayer.js';
 * @import {DrawLayer} from '../gui/drawLayer.js';
 * @import {Image} from '../image/image.js';
 * @import {Matrix33} from '../math/matrix.js';
 * @import {DataElement} from '../dicom/dataElement.js';
 * @import {Scalar3D} from '../math/scalar.js';
 * @import {Command} from '../command/undoStack.js';
 */

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
   * Optional segmentation layer fill opacity; in [0, 1] range.
   *
   * @type {number|undefined}
   */
  fillOpacity;
  /**
   * Optional segmentation contour thickness; in [0, 10] range.
   *
   * @type {number|undefined}
   */
  contourThickness;
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
   * @type {Record<string, ViewConfig[]>|undefined}
   */
  dataViewConfigs;
  /**
   * Tool name indexed object containing individual tool configurations.
   *
   * @type {Record<string, ToolConfig>|undefined}
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
   * Optional overlay layer config.
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
   * @param {Record<string, ViewConfig[]>} [dataViewConfigs] Optional dataId
   *   indexed object containing the data view configurations.
   */
  constructor(dataViewConfigs) {
    this.dataViewConfigs = dataViewConfigs;
  }
}

/**
 * List of ViewConfigs indexed by dataIds.
 *
 * @typedef {Record<string, ViewConfig[]>} DataViewConfigs
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
export class App extends EventTarget {

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
   * Stage controller.
   *
   * @type {StageController}
   */
  #stageController = null;

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

  /**
   * Info datas.
   *
   * @type {Record<string, InfoData>}
   */
  #infoDatas = {};

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
   * Get the next data id.
   *
   * @returns {string} The data id.
   */
  getNextDataId() {
    return this.#dataController.getNextDataId();
  }

  /**
   * Add a new DicomData.
   *
   * @param {string} dataId The data id.
   * @param {DicomData} data The new data.
   * @returns {boolean} False if the data cannot be added.
   */
  addData(dataId, data) {
    return this.#dataController.add(dataId, data);
  }

  /**
   * Get the meta data.
   *
   * @param {string} dataId The data id.
   * @returns {Record<string, DataElement>|undefined} The list of meta data.
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
   * Get the first data id with the given SeriesInstanceUID.
   *
   * @param {string} uid The SeriesInstanceUID.
   * @returns {string} The data id.
   */
  getDataIdFromSeriesUid(uid) {
    return this.#dataController.getDataIdFromSeriesUid(uid);
  }

  /**
   * Can the data (of the active view of the active layer) be scrolled?
   *
   * @returns {boolean} True if the data has a third dimension greater than one.
   * @deprecated Since v0.33, please use the ViewController
   *   equivalent directly instead.
   */
  canScroll() {
    const viewLayer =
      this.#stageController.getActiveLayerGroup().getActiveViewLayer();
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
    const viewLayer =
      this.#stageController.getActiveLayerGroup().getActiveViewLayer();
    const controller = viewLayer.getViewController();
    return controller.canWindowLevel();
  }

  /**
   * Get the active layer group scale on top of the base scale.
   *
   * @returns {Scalar3D} The scale as {x,y,z}.
   * @deprecated Since v0.37, please access from the active layer group.
   */
  getAddedScale() {
    logger.debug(
      'App.getAddedScale: deprecated since v0.37, ' +
      'please access from the active layer group.');
    return this.#stageController.getAddedScale();
  }

  /**
   * Get the base scale of the active layer group.
   *
   * @returns {Scalar3D} The scale as {x,y,z}.
   * @deprecated Since v0.37, please access from the active layer group.
   */
  getBaseScale() {
    logger.debug(
      'App.getBaseScale: deprecated since v0.37, ' +
      'please access from the active layer group.');
    return this.#stageController.getBaseScale();
  }

  /**
   * Get the layer offset of the active layer group.
   *
   * @returns {Scalar3D} The offset as {x,y,z}.
   * @deprecated Since v0.37, please access from the active layer group.
   */
  getOffset() {
    logger.debug(
      'App.getOffset: deprecated since v0.37, ' +
      'please access from the active layer group.');
    return this.#stageController.getOffset();
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
   * Get the stage controller.
   *
   * @returns {StageController} The stage controller.
   */
  getStageController() {
    return this.#stageController;
  }

  /**
   * Get the active layer group.
   * The layer is available after the first loaded item.
   *
   * @returns {LayerGroup|undefined} The layer group.
   * @deprecated Since v0.37, use
   *   `app.getStageController().getActiveLayerGroup()` instead.
   */
  getActiveLayerGroup() {
    logger.debug(
      'App.getActiveLayerGroup: deprecated since v0.37, ' +
      'use app.getStageController().getActiveLayerGroup()');
    return this.#stageController.getActiveLayerGroup();
  }

  /**
   * Set the active layer group.
   *
   * @param {number} index The layer group index.
   * @deprecated Since v0.37, use
   *   `app.getStageController().setActiveLayerGroup()` instead.
   */
  setActiveLayerGroup(index) {
    logger.debug(
      'App.setActiveLayerGroup: deprecated since v0.37, ' +
      'use app.getStageController().setActiveLayerGroup()');
    this.#stageController.setActiveLayerGroup(index);
  }

  /**
   * Get the view layers associated to a data id.
   * The layer are available after the first loaded item.
   *
   * @param {string} dataId The data id.
   * @returns {ViewLayer[]} The layers.
   * @deprecated Since v0.37, use
   *   `app.getStageController().getViewLayersByDataId()` instead.
   */
  getViewLayersByDataId(dataId) {
    logger.debug(
      'App.getViewLayersByDataId: deprecated since v0.37, ' +
      'use app.getStageController().getViewLayersByDataId()');
    return this.#stageController.getViewLayersByDataId(dataId);
  }

  /**
   * Get a list of view layers according to an input callback function.
   *
   * @param {Function} [callbackFn] A function that takes
   *   a ViewLayer as input and returns a boolean. If undefined,
   *   returns all view layers.
   * @returns {ViewLayer[]} The layers that
   *   satisfy the callbackFn.
   * @deprecated Since v0.37, use
   *   `app.getStageController().getViewLayers()` instead.
   */
  getViewLayers(callbackFn) {
    logger.debug(
      'App.getViewLayers: deprecated since v0.37, ' +
      'use app.getStageController().getViewLayers()');
    return this.#stageController.getViewLayers(callbackFn);
  }

  /**
   * Get the draw layers associated to a data id.
   * The layer are available after the first loaded item.
   *
   * @param {string} dataId The data id.
   * @returns {DrawLayer[]} The layers.
   * @deprecated Since v0.37, use
   *   `app.getStageController().getDrawLayersByDataId()` instead.
   */
  getDrawLayersByDataId(dataId) {
    logger.debug(
      'App.getDrawLayersByDataId: deprecated since v0.37, ' +
      'use app.getStageController().getDrawLayersByDataId()');
    return this.#stageController.getDrawLayersByDataId(dataId);
  }

  /**
   * Get a list of draw layers according to an input callback function.
   *
   * @param {Function} [callbackFn] A function that takes
   *   a DrawLayer as input and returns a boolean. If undefined,
   *   returns all draw layers.
   * @returns {DrawLayer[]} The layers that
   *   satisfy the callbackFn.
   * @deprecated Since v0.37, use
   *   `app.getStageController().getDrawLayers()` instead.
   */
  getDrawLayers(callbackFn) {
    logger.debug(
      'App.getDrawLayers: deprecated since v0.37, ' +
      'use app.getStageController().getDrawLayers()');
    return this.#stageController.getDrawLayers(callbackFn);
  }

  /**
   * Get a layer group by div id.
   * The layer is available after the first loaded item.
   *
   * @param {string} divId The div id.
   * @returns {LayerGroup|undefined} The layer group.
   * @deprecated Since v0.37, use
   *   `app.getStageController().getLayerGroupByDivId()` instead.
   */
  getLayerGroupByDivId(divId) {
    logger.debug(
      'App.getLayerGroupByDivId: deprecated since v0.37, ' +
      'use app.getStageController().getLayerGroupByDivId()');
    return this.#stageController.getLayerGroupByDivId(divId);
  }

  /**
   * Get the number of layer groups.
   *
   * @returns {number} The number of groups.
   * @deprecated Since v0.37, use
   *   `app.getStageController().getNumberOfLayerGroups()` instead.
   */
  getNumberOfLayerGroups() {
    logger.debug(
      'App.getNumberOfLayerGroups: deprecated since v0.37, ' +
      'use app.getStageController().getNumberOfLayerGroups()');
    return this.#stageController.getNumberOfLayerGroups();
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
   * @param {Command} cmd The command to add.
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
   *     app.getStageController().render(0);
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
    if (typeof this.#options.rootDocument === 'undefined' &&
      typeof document !== 'undefined'
    ) {
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
                  logger.warn(`Could not find option class for: ${
                    optionName }`);
                }
              }
            } else {
              appToolOptions = toolParams.options;
            }
            appToolList[toolName].setOptions(appToolOptions);
          }
        } else {
          logger.warn(`Could not initialise unknown tool: ${toolName}`);
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
    // create stage controller
    this.#stageController = new StageController(
      this.#dataController, this.#options);
    if (this.#toolboxController) {
      this.#stageController.setToolboxController(this.#toolboxController);
    }
    this.#stageController.setAddToUndoStack(this.addToUndoStack);
    this.#stageController.setGetInfoData((id) => this.getInfoData(id));
    // propagate stage controller events
    for (const name of stageControllerEventNames) {
      this.#stageController.addEventListener(name, this.#fireEvent);
    }
  }

  /**
   * Reset the application.
   */
  reset() {
    // clear objects
    this.#stageController.empty();
    this.#infoDatas = {};
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
    logger.debug(
      'App.resetLayout: deprecated since v0.35, prefer resetZoomPan.');
    this.#stageController.resetLayout();
  }

  /**
   * Reset the zoom and pan of the stage.
   *
   * @deprecated Since v0.37, use
   *   `app.getStageController().resetZoomPan()` instead.
   */
  resetZoomPan() {
    logger.debug(
      'App.resetZoomPan: deprecated since v0.37, ' +
      'use app.getStageController().resetZoomPan()');
    this.#stageController.resetZoomPan();
  }

  /**
   * Reset the position and window level of the stage.
   *
   * @deprecated Since v0.37, use
   *   `app.getStageController().resetViews()` instead.
   */
  resetViews() {
    logger.debug(
      'App.resetViews: deprecated since v0.37, ' +
      'use app.getStageController().resetViews()');
    this.#stageController.resetViews();
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
   * @deprecated Since v0.36, please extract the file list and
   *   pass it to loadURLs. State from uri is no longer supported.
   * @function
   */
  loadFromUri = (uri, options) => {
    const query = getUriQuery(uri);
    // check query
    if (query && typeof query.input !== 'undefined') {
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
    this.#stageController.removeLayersByDataId(dataId);
  }

  // load API [end] ---------------------------------------------------------

  /**
   * Fit the display to the data of each layer group.
   * To be called once the image is loaded.
   *
   * @deprecated Since v0.37, use
   *   `app.getStageController().fitToContainer()` instead.
   */
  fitToContainer() {
    logger.debug(
      'App.fitToContainer: deprecated since v0.37, ' +
      'use app.getStageController().fitToContainer()');
    this.#stageController.fitToContainer();
  }

  /**
   * Init the Window/Level display
   * (of the active layer of the active layer group).
   *
   * @deprecated Since v0.33, please set the opacity
   *   of the desired view layer directly.
   */
  initWLDisplay() {
    const viewLayer =
      this.#stageController.getActiveLayerGroup().getActiveViewLayer();
    const controller = viewLayer.getViewController();
    controller.initialise();
  }

  /**
   * Set the imageSmoothing flag value. Default is false.
   *
   * @param {boolean} flag True to enable smoothing.
   * @deprecated Since v0.37, use
   *   `app.getStageController().setImageSmoothing()` instead.
   */
  setImageSmoothing(flag) {
    logger.debug(
      'App.setImageSmoothing: deprecated since v0.37, ' +
      'use app.getStageController().setImageSmoothing()');
    this.#stageController.setImageSmoothing(flag);
  }

  /**
   * Get the layer group configuration from a data id.
   *
   * @param {string} dataId The data id.
   * @param {boolean} [excludeStarConfig] Exclude the star config
   *  (default to false).
   * @returns {ViewConfig[]} The list of associated configs.
   * @deprecated Since v0.37, use
   *   `app.getStageController().getViewConfigs()` instead.
   */
  getViewConfigs(dataId, excludeStarConfig) {
    logger.debug(
      'App.getViewConfigs: deprecated since v0.37, ' +
      'use app.getStageController().getViewConfigs()');
    return this.#stageController.getViewConfigs(dataId, excludeStarConfig);
  }

  /**
   * Get the layer group configuration for a data id and group div id.
   *
   * @param {string} dataId The data id.
   * @param {string} groupDivId The layer group div id.
   * @param {boolean} [excludeStarConfig] Exclude the star config
   *  (default to false).
   * @returns {ViewConfig|undefined} The associated config.
   * @deprecated Since v0.37, use
   *   `app.getStageController().getViewConfig()` instead.
   */
  getViewConfig(dataId, groupDivId, excludeStarConfig) {
    logger.debug(
      'App.getViewConfig: deprecated since v0.37, ' +
      'use app.getStageController().getViewConfig()');
    return this.#stageController.getViewConfig(
      dataId, groupDivId, excludeStarConfig);
  }

  /**
   * Get the data view config.
   * Careful, returns a reference; do not modify without resetting.
   *
   * @returns {Record<string, ViewConfig[]>} The configuration list.
   * @deprecated Since v0.37, use
   *   `app.getStageController().getDataViewConfigs()` instead.
   */
  getDataViewConfigs() {
    logger.debug(
      'App.getDataViewConfigs: deprecated since v0.37, ' +
      'use app.getStageController().getDataViewConfigs()');
    return this.#stageController.getDataViewConfigs();
  }

  /**
   * Set the data view configuration.
   * Resets the stage and recreates all the views.
   *
   * @param {Record<string, ViewConfig[]>} configs The configuration list.
   * @deprecated Since v0.37, use
   *   `app.getStageController().setDataViewConfigs()` instead.
   */
  setDataViewConfigs(configs) {
    logger.debug(
      'App.setDataViewConfigs: deprecated since v0.37, ' +
      'use app.getStageController().setDataViewConfigs()');
    this.#stageController.setDataViewConfigs(configs);
  }

  /**
   * Add a data view config.
   *
   * @param {string} dataId The data id.
   * @param {ViewConfig} config The view configuration.
   * @param {boolean} [doRender] Render data after configuration
   *   add. Defaults to true.
   * @deprecated Since v0.37, use
   *   `app.getStageController().addDataViewConfig()` instead.
   */
  addDataViewConfig(dataId, config, doRender) {
    logger.debug(
      'App.addDataViewConfig: deprecated since v0.37, ' +
      'use app.getStageController().addDataViewConfig()');
    this.#stageController.addDataViewConfig(dataId, config, doRender);
  }

  /**
   * Remove a data view config.
   * Removes the associated layer if found, removes
   *   the layer group if empty.
   *
   * @param {string} dataId The data id.
   * @param {string} divId The div id.
   * @deprecated Since v0.37, use
   *   `app.getStageController().removeDataViewConfig()` instead.
   */
  removeDataViewConfig(dataId, divId) {
    logger.debug(
      'App.removeDataViewConfig: deprecated since v0.37, ' +
      'use app.getStageController().removeDataViewConfig()');
    this.#stageController.removeDataViewConfig(dataId, divId);
  }

  /**
   * Update an existing data view config.
   * Removes and re-creates the layer if found.
   *
   * @param {string} dataId The data id.
   * @param {string} divId The div id.
   * @param {ViewConfig} config The view configuration.
   * @deprecated Since v0.37, use
   *   `app.getStageController().updateDataViewConfig()` instead.
   */
  updateDataViewConfig(dataId, divId, config) {
    logger.debug(
      'App.updateDataViewConfig: deprecated since v0.37, ' +
      'use app.getStageController().updateDataViewConfig()');
    this.#stageController.updateDataViewConfig(dataId, divId, config);
  }

  /**
   * Set the layer groups binders.
   *
   * @param {string[]} list The list of binder names.
   */
  setLayerGroupsBinders(list) {
    const instances = [];
    for (let i = 0; i < list.length; ++i) {
      if (typeof binderList[list[i]] !== 'undefined') {
        instances.push(new binderList[list[i]]);
      }
    }
    this.#stageController.setBinders(instances);
  }

  /**
   * Render the current data.
   *
   * @param {string} dataId The data id to render.
   * @param {ViewConfig[]} [viewConfigs] The list of configs to render.
   * @deprecated Since v0.37, use
   *   `app.getStageController().render()` instead.
   */
  render(dataId, viewConfigs) {
    logger.debug(
      'App.render: deprecated since v0.37, ' +
      'use app.getStageController().render()');
    this.#stageController.render(dataId, viewConfigs);
  }

  /**
   * Zoom the layers of the active layer group.
   *
   * @param {number} step The step to add to the current zoom.
   * @param {number} cx The zoom center X coordinate.
   * @param {number} cy The zoom center Y coordinate.
   * @deprecated Since v0.37, please access from the active layer group.
   */
  zoom(step, cx, cy) {
    logger.debug(
      'App.zoom: deprecated since v0.37, ' +
      'please access from the active layer group.');
    this.#stageController.zoom(step, cx, cy);
  }

  /**
   * Apply a translation to the layers of the active layer group.
   *
   * @param {number} tx The translation along X.
   * @param {number} ty The translation along Y.
   * @deprecated Since v0.37, please access from the active layer group.
   */
  translate(tx, ty) {
    logger.debug(
      'App.translate: deprecated since v0.37, ' +
      'please access from the active layer group.');
    this.#stageController.translate(tx, ty);
  }

  /**
   * Resample one image to match the orientation of another.
   *
   * @param {string} dataIdTarget The target image id to resample.
   * @param {string} dataIdSource The source image id to copy the
   *  orientation from.
   */
  resampleMatch(dataIdTarget, dataIdSource) {
    // target (to do orientation check)
    const targetData = this.#dataController.get(dataIdTarget);
    if (typeof targetData === 'undefined') {
      logger.debug(
        `Cannot resample match, target data '${
          dataIdTarget}' is undefined`);
      return;
    }
    if (typeof targetData.image === 'undefined') {
      logger.debug(
        `Cannot resample match, target image '${
          dataIdTarget}' is undefined`);
      return;
    }
    // source
    const sourceData = this.#dataController.get(dataIdSource);
    if (typeof sourceData === 'undefined') {
      logger.debug(
        `Cannot resample match, source data '${
          dataIdSource}' is undefined`);
      return;
    }
    if (typeof sourceData.image === 'undefined') {
      logger.debug(
        `Cannot resample match, source image '${
          dataIdSource}' is undefined`);
      return;
    }
    // check orientation
    const targetOrientation =
      targetData.image.getGeometry().getOrientation();
    const sourceOrientation =
      sourceData.image.getGeometry().getOrientation();
    if (targetOrientation.equals(sourceOrientation)) {
      logger.info(
        `Same orientation, no resample match for data '${
          dataIdTarget }' and '${dataIdSource}'`);
      return;
    }
    // resample
    this.resample(dataIdTarget, sourceOrientation);
  }

  /**
   * Resample an image to match an arbitrary orientation.
   *
   * @param {string} dataIdTarget The target image id to resample.
   * @param {Matrix33} orientation The orientation to resample to.
   */
  resample(dataIdTarget, orientation) {
    // target
    const targetData = this.#dataController.get(dataIdTarget);
    if (typeof targetData === 'undefined') {
      logger.debug(
        `Cannot resample, target data '${
          dataIdTarget }' is undefined`);
      return;
    }
    if (typeof targetData.image === 'undefined') {
      logger.debug(
        `Cannot resample, target image '${
          dataIdTarget }' is undefined`);
      return;
    }
    // check orientation
    const targetOrientation =
      targetData.image.getGeometry().getOrientation();
    if (targetOrientation.equals(orientation)) {
      logger.info(
        `Same orientation, no resample for data '${
          dataIdTarget }'`);
      return;
    }

    targetData.image.resample(orientation);

    const configs = this.#options.dataViewConfigs;

    const metaTarget = targetData.image.getMeta();
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
    const stgCtrl = this.getStageController();
    stgCtrl.setDataViewConfigs(configs);
    // render data (creates layers)
    const newDataIds = this.#dataController.getDataIds();
    for (let i = 0; i < newDataIds.length; ++i) {
      stgCtrl.render(newDataIds[i]);
    }
  }

  /**
   * Revert an image back to its original orientation.
   *
   * @param {string} dataIdTarget The target image id to revert.
   */
  revertResample(dataIdTarget) {
    const targetData = this.#dataController.get(dataIdTarget);
    if (typeof targetData === 'undefined') {
      logger.debug(
        `Cannot revert resample, target data '${
          dataIdTarget }' is undefined`);
      return;
    }
    if (typeof targetData.image === 'undefined') {
      logger.debug(
        `Cannot revert resample, target image '${
          dataIdTarget }' is undefined`);
      return;
    }
    // exit if not resampled
    if (!targetData.image.isResampled()) {
      logger.info(
        `No revert resample needed for data '${
          dataIdTarget }'`);
      return;
    }

    targetData.image.revert();

    const configs = this.#options.dataViewConfigs;

    const metaTarget = targetData.image.getMeta();
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
    const stgCtrl = this.getStageController();
    stgCtrl.setDataViewConfigs(configs);
    // render data (creates layers)
    const newDataIds = this.#dataController.getDataIds();
    for (let i = 0; i < newDataIds.length; ++i) {
      stgCtrl.render(newDataIds[i]);
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
    const viewLayer =
      this.#stageController.getActiveLayerGroup().getActiveViewLayer();
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
    const layerGroup = this.#stageController.getActiveLayerGroup();
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
    this.#stageController.render(dataId);
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
    this.getStageController().fitToContainer();
  };

  /**
   * Key down callback. Meant to be used in tools.
   *
   * @param {object} event The KeyboardEvent down event
   * augmented with a context.
   * @fires App#keydown
   * @function
   */
  onKeydown = (event) => {
    /**
     * Key down event.
     *
     * @event App#keydown
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.key The key value.
     * @property {string} detail.code The code value.
     * @property {boolean} detail.ctrlKey True if ctrl key is down.
     * @property {boolean} detail.altKey True if alt key is down.
     * @property {boolean} detail.shiftKey True if shift key is down.
     * @property {string} detail.context The tool where the event originated.
     */
    this.dispatchEvent(new CustomEvent('keydown', {
      detail: {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        context: event.context,
      }
    }));
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
        const layerGroup = this.#stageController.getActiveLayerGroup();
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
        const nGroups = this.#stageController.getNumberOfLayerGroups();
        for (let i = 0; i < nGroups; ++i) {
          this.#stageController.getLayerGroup(i).setShowCrosshair(
            !this.#stageController.getLayerGroup(i).getShowCrosshair()
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
      this.#stageController.getActiveLayerGroup()
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
      this.#stageController.getActiveLayerGroup()
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
    for (let i = 0; i < this.#stageController.getNumberOfLayerGroups(); ++i) {
      const layerGroup = this.#stageController.getLayerGroup(i);
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
   * Get the info data for a data id.
   *
   * @param {string} dataId The data id.
   * @returns {InfoData|undefined} The info data.
   */
  getInfoData(dataId) {
    let data;
    if (typeof this.#infoDatas !== 'undefined') {
      data = this.#infoDatas[dataId];
    }
    return data;
  }

  /**
   * Toggle info data listeners.
   *
   * @param {string} dataId The data id.
   */
  toggleInfoDataListeners(dataId) {
    const data = this.getInfoData(dataId);
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
    const dataId = this.getNextDataId();
    const added = this.addData(dataId, data);
    if (!added) {
      throw new Error('Cannot add annotation data');
    }
    // add data view config based on reference data
    const refDataViewConfigs = this.#stageController.getViewConfigs(refDataId);
    const refDataViewConfig = refDataViewConfigs.find(
      element => element.divId === divId);
    if (typeof refDataViewConfig === 'undefined') {
      throw new Error('No reference data view config for draw');
    }
    const drawDataViewConfig = new ViewConfig(divId);
    drawDataViewConfig.orientation = refDataViewConfig.orientation;
    this.#stageController.addDataViewConfig(dataId, drawDataViewConfig);
    // render (will create draw layer)
    this.#stageController.render(dataId);
  }

  // Private Methods -----------------------------------------------------------

  /**
   * Fire an event: call all associated listeners with the input event object.
   * Collects detail from CustomEvents and top-level plain object properties,
   * then dispatches a new CustomEvent with the flattened detail on this App.
   *
   * @param {CustomEvent} event The event to fire.
   */
  #fireEvent = (event) => {
    if (event.detail?.propagate === false) {
      return;
    }
    const detail = Object.assign({}, event.detail);
    delete detail.propagate;
    this.dispatchEvent(new CustomEvent(event.type, {detail}));
  };

  /**
   * Data load start callback.
   *
   * @param {object} event The load start event.
   */
  #onloadstart = (event) => {
    // create info data
    if (typeof this.#options.overlayConfig !== 'undefined') {
      this.#infoDatas[event.dataid] = new InfoData(
        this, event.dataid, this.#options.overlayConfig);
    }
    /**
     * Load start event.
     *
     * @event App#loadstart
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.loadtype The load type: image or state.
     * @property {*} detail.source The load source: string for an url,
     *   File for a file.
     * @property {string} detail.dataid The data id.
     */
    this.dispatchEvent(new CustomEvent('loadstart', {
      detail: {
        loadtype: event.loadtype,
        dataid: event.dataid,
        source: event.source,
      }
    }));
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
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.loadtype The load type: image or state.
     * @property {*} detail.source The load source: string for an url,
     *   File for a file.
     * @property {string} detail.dataid The data id.
     * @property {number} detail.loaded The loaded percentage.
     * @property {number} detail.total The total percentage.
     */
    this.dispatchEvent(new CustomEvent('loadprogress', {
      detail: {
        loadtype: event.loadtype,
        dataid: event.dataid,
        source: event.source,
        loaded: event.loaded,
        total: event.total,
      }
    }));
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

    const isFirstLoadItem = event.isfirstitem;

    if (event.loadtype === 'image') {
      try {
        if (isFirstLoadItem) {
          this.#dataController.add(event.dataid, event.data);
        } else {
          this.#dataController.update(event.dataid, event.data);
        }
      } catch (error) {
        this.#onloaderror({
          dataid: event.dataid,
          error,
          source: event.source
        });
        this.#onloadend({
          dataid: event.dataid,
          source: event.source
        });
        return;
      }
    } else if (event.loadtype === 'state') {
      this.applyJsonState(event.data, event.dataid);
    }

    /**
     * Load item event: fired when an item has been successfully loaded.
     *
     * @event App#loaditem
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.loadtype The load type: image or state.
     * @property {*} detail.source The load source: string for an url,
     *   File for a file.
     * @property {string} detail.dataid The data id.
     * @property {object} detail.data The loaded meta data.
     */
    this.dispatchEvent(new CustomEvent('loaditem', {
      detail: {
        data: eventMetaData,
        source: event.source,
        loadtype: event.loadtype,
        dataid: event.dataid,
        isfirstitem: event.isfirstitem,
        warn: event.warn,
      }
    }));

    // update info data if present
    if (typeof this.#infoDatas !== 'undefined' &&
      typeof this.#infoDatas[event.dataid] !== 'undefined') {
      this.#infoDatas[event.dataid].addItemMeta(eventMetaData);
    }

    // render if first and flag allows
    if (event.loadtype === 'image' &&
      this.#stageController.getViewConfigs(event.dataid).length !== 0 &&
      isFirstLoadItem && this.#options.viewOnFirstLoadItem) {
      this.#stageController.render(event.dataid);
    }
  };

  /**
   * Data load callback.
   *
   * @param {object} event The load event.
   */
  #onload = (event) => {
    // mark data as complete
    const res = this.#dataController.markDataAsComplete(event.dataid);

    // render if image has changed
    if (this.#options.viewOnFirstLoadItem &&
      typeof res.imageHasChanged !== 'undefined' &&
      res.imageHasChanged) {
      this.#stageController.render(event.dataid);
    }

    /**
     * Load event: fired when a load finishes successfully.
     *
     * @event App#load
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.loadtype The load type: image or state.
     * @property {string} detail.dataid The data id.
     */
    this.dispatchEvent(new CustomEvent('load', {
      detail: {
        loadtype: event.loadtype,
        dataid: event.dataid,
      }
    }));
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
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.loadtype The load type: image or state.
     * @property {string} detail.dataid The data id.
     * @property {*} detail.source The load source: string for an url,
     *   File for a file.
     */
    this.dispatchEvent(new CustomEvent('loadend', {
      detail: {
        loadtype: event.loadtype,
        dataid: event.dataid,
        source: event.source,
      }
    }));
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
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.loadtype The load type: image or state.
     * @property {string} detail.dataid The data id.
     * @property {*} detail.source The load source: string for an url,
     *   File for a file.
     * @property {object} detail.error The error.
     * @property {object} detail.target The event target.
     */
    this.dispatchEvent(new CustomEvent('error', {
      detail: {
        loadtype: event.loadtype,
        dataid: event.dataid,
        source: event.source,
        error: event.error,
        target: event.target,
      }
    }));
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
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.loadtype The load type: image or state.
     * @property {string} detail.dataid The data id.
     * @property {*} detail.source The load source: an url as a string.
     * @property {object} detail.target The event target.
     */
    this.dispatchEvent(new CustomEvent('timeout', {
      detail: {
        loadtype: event.loadtype,
        dataid: event.dataid,
        source: event.source,
        target: event.target,
      }
    }));
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
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {string} detail.loadtype The load type: image or state.
     * @property {string} detail.dataid The data id.
     * @property {*} detail.source The load source: string for an url,
     *   File for a file.
     */
    this.dispatchEvent(new CustomEvent('abort', {
      detail: {
        loadtype: event.loadtype,
        dataid: event.dataid,
        source: event.source,
      }
    }));
  };

} // class App
