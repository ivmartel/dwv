import {viewEventNames} from '../image/view';
import {ViewFactory} from '../image/viewFactory';
import {lut} from '../image/luts';
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
import {OverlayData} from '../gui/overlayData';
import {toolList, toolOptions} from '../tools';
import {binderList} from '../gui/stage';

// doc imports
/* eslint-disable no-unused-vars */
import {LayerGroup} from '../gui/layerGroup';
import {Image} from '../image/image';
/* eslint-enable no-unused-vars */

/**
 * Main application class.
 *
 * @example
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * app.init({
 *   dataViewConfigs: {'*': [{divId: 'layerGroup0'}]}
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 */
export class App {

  // app options
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

  // overlay datas
  #overlayDatas = {};

  /**
   * Listener handler.
   *
   * @type {object}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * Get the image.
   *
   * @param {string} dataId The data id.
   * @returns {Image} The associated image.
   */
  getImage(dataId) {
    return this.#dataController.get(dataId).image;
  }

  /**
   * Get the last loaded image.
   *
   * @returns {Image} The image.
   */
  getLastImage() {
    const dataIds = this.#dataController.getDataIds();
    return this.#dataController.get(dataIds[dataIds.length - 1]).image;
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
   * Set the last image.
   *
   * @param {Image} img The associated image.
   */
  setLastImage(img) {
    const dataIds = this.#dataController.getDataIds();
    this.#dataController.setImage(dataIds[dataIds.length - 1], img);
  }

  /**
   * Add a new image.
   *
   * @param {Image} image The new image.
   * @param {object} meta The image meta.
   * @returns {string} The new image data id.
   */
  addNewImage(image, meta) {
    const dataId = this.#dataController.getDataIds().length;

    // load start event
    this.#fireEvent({
      type: 'loadstart',
      loadtype: 'image',
      source: 'internal',
      dataid: dataId
    });

    // add image to data controller
    this.#dataController.addNew(dataId, image, meta);

    // load item event
    this.#fireEvent({
      type: 'loaditem',
      loadtype: 'image',
      data: meta,
      source: 'internal',
      dataid: dataId,
      isfirstitem: true
    });

    // optional render
    if (this.#options.viewOnFirstLoadItem) {
      this.render(dataId);
    }

    // load events
    this.#fireEvent({
      type: 'load',
      loadtype: 'image',
      source: 'internal',
      dataid: dataId
    });
    this.#fireEvent({
      type: 'loadend',
      loadtype: 'image',
      source: 'internal',
      dataid: dataId
    });

    return dataId;
  }

  /**
   * Get the meta data.
   *
   * @param {string} dataId The data id.
   * @returns {object} The list of meta data.
   */
  getMetaData(dataId) {
    return this.#dataController.get(dataId).meta;
  }

  /**
   * Get the list of ids in the data storage.
   *
   * @returns {Array} The list of data ids.
   */
  getDataIds() {
    return this.#dataController.getDataIds();
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
   * Get the view layers associated to a data id.
   * The layer are available after the first loaded item.
   *
   * @param {string} dataId The data id.
   * @returns {Array} The layers.
   */
  getViewLayersByDataId(dataId) {
    return this.#stage.getViewLayersByDataId(dataId);
  }

  /**
   * Get the draw layers associated to a data id.
   * The layer are available after the first loaded item.
   *
   * @param {string} dataId The data id.
   * @returns {Array} The layers.
   */
  getDrawLayersByDataId(dataId) {
    return this.#stage.getDrawLayersByDataId(dataId);
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
   */
  addToUndoStack = (cmd) => {
    if (this.#undoStack !== null) {
      this.#undoStack.add(cmd);
    }
  };

  /**
   * Initialise the application.
   *
   * @param {object} opt The application option with:
   * - `dataViewConfigs`: dataId indexed object containing the data view
   *   configurations in the form of a list of objects containing:
   *   - divId: the HTML div id
   *   - orientation: optional 'axial', 'coronal' or 'sagittal' orientation
   *     string (default undefined keeps the original slice order)
   * - `binders`: array of layerGroup binders
   * - `tools`: tool name indexed object containing individual tool
   *   configurations in the form of a list of objects containing:
   *   - options: array of tool options
   * - `viewOnFirstLoadItem`: boolean flag to trigger the first data render
   *   after the first loaded data or not
   * - `defaultCharacterSet`: the default chraracter set string used for DICOM
   *   parsing
   * - `overlayConfig`: list of tags / properties used as overlay information.
   * @example
   * // create the dwv app
   * const app = new dwv.App();
   * // initialise
   * app.init({
   *   dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
   *   viewOnFirstLoadItem: false
   * });
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

    // undo stack
    this.#undoStack = new UndoStack();
    this.#undoStack.addEventListener('undoadd', this.#fireEvent);
    this.#undoStack.addEventListener('undo', this.#fireEvent);
    this.#undoStack.addEventListener('redo', this.#fireEvent);

    // tools
    if (this.#options.tools && this.#options.tools.length !== 0) {
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
          if (typeof toolParams.options !== 'undefined') {
            let type = 'raw';
            if (typeof appToolList[toolName].getOptionsType !== 'undefined') {
              type = appToolList[toolName].getOptionsType();
            }
            let appToolOptions = toolParams.options;
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
   * @param {object} callback The method associated with the provided
   *   event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  removeEventListener(type, callback) {
    this.#listenerHandler.remove(type, callback);
  }

  // load API [begin] -------------------------------------------------------

  /**
   * Load a list of files. Can be image files or a state file.
   *
   * @param {FileList} files The list of files to load.
   * @fires App#loadstart
   * @fires App#loadprogress
   * @fires App#loaditem
   * @fires App#loadend
   * @fires App#loaderror
   * @fires App#loadabort
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
   * @param {Array} urls The list of urls to load.
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
   * Defaults to div id 'layerGroup' if no association object has been set.
   *
   * @param {string} dataId The data id.
   * @returns {Array} The list of associated configs.
   */
  #getViewConfigs(dataId) {
    // check options
    if (this.#options.dataViewConfigs === null ||
      typeof this.#options.dataViewConfigs === 'undefined') {
      throw new Error('No available data view configuration');
    }
    let configs = [];
    if (typeof this.#options.dataViewConfigs[dataId] !== 'undefined') {
      configs = this.#options.dataViewConfigs[dataId];
    } else if (typeof this.#options.dataViewConfigs['*'] !== 'undefined') {
      configs = this.#options.dataViewConfigs['*'];
    }
    return configs;
  }

  /**
   * Get the data view config.
   * Carefull, returns a reference, do not modify without resetting.
   *
   * @returns {object} The configuration list.
   */
  getDataViewConfig() {
    return this.#options.dataViewConfigs;
  }

  /**
   * Set the data view configuration (see the init options for details).
   *
   * @param {object} configs The configuration list.
   */
  setDataViewConfig(configs) {
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
   * @param {object} config The view configuration.
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
    this.render(dataId, [config]);
  }

  /**
   * Remove a data view config.
   *
   * @param {string} dataId The data id.
   * @param {object} config The view configuration.
   */
  removeDataViewConfig(dataId, config) {
    // remove from list
    const configs = this.#options.dataViewConfigs;
    if (typeof configs[dataId] === 'undefined') {
      // no config for dataId
      return;
    }
    const equalDivId = function (item) {
      return item.divId === config.divId;
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
      const lg = this.#stage.getLayerGroupByDivId(config.divId);
      if (typeof lg !== 'undefined') {
        const vls = lg.getViewLayersByDataId(dataId);
        if (vls.length === 1) {
          lg.removeLayer(vls[0]);
        } else {
          throw new Error('Expected one view layer, got ' + vls.length);
        }
        const dls = lg.getDrawLayersByDataId(dataId);
        if (dls.length === 1) {
          lg.removeLayer(dls[0]);
        } else {
          throw new Error('Expected one draw layer, got ' + dls.length);
        }
        if (lg.getNumberOfLayers() === 0) {
          this.#stage.removeLayerGroup(lg);
        }
      }
    }
  }

  /**
   * Update a data view config.
   * Removes and re-creates the layer if found.
   *
   * @param {string} dataId The data id.
   * @param {string} divId The div id.
   * @param {object} config The view configuration.
   */
  updateDataViewConfig(dataId, divId, config) {
    const configs = this.#options.dataViewConfigs;
    if (typeof configs[dataId] === 'undefined') {
      throw new Error('No config for dataId: ' + dataId);
    }
    const equalDivId = function (item) {
      return item.divId === divId;
    };
    const itemIndex = configs[dataId].findIndex(equalDivId);
    if (itemIndex === -1) {
      throw new Error('No config for dataId: ' +
        dataId + ' and divId: ' + divId);
    }

    configs[dataId][itemIndex] = config;

    // remove previous layers
    const lg = this.#stage.getLayerGroupByDivId(config.divId);
    if (typeof lg !== 'undefined') {
      const vls = lg.getViewLayersByDataId(dataId);
      if (vls.length === 1) {
        lg.removeLayer(vls[0]);
      } else {
        throw new Error('Expected one view layer, got ' + vls.length);
      }
      const dls = lg.getDrawLayersByDataId(dataId);
      if (dls.length === 1) {
        lg.removeLayer(dls[0]);
      } else {
        throw new Error('Expected one draw layer, got ' + dls.length);
      }
    }

    // render (will create layer)
    this.render(dataId, [config]);
  }

  /**
   * Create layer groups according to a data view config:
   * adds them to stage and binds them.
   *
   * @param {object} dataViewConfigs The data view config.
   */
  #createLayerGroups(dataViewConfigs) {
    const dataKeys = Object.keys(dataViewConfigs);
    const divIds = [];
    for (let i = 0; i < dataKeys.length; ++i) {
      const dataConfigs = dataViewConfigs[dataKeys[i]];
      for (let j = 0; j < dataConfigs.length; ++j) {
        const viewConfig = dataConfigs[j];
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
   * @param {object} viewConfig The view config.
   */
  #createLayerGroup(viewConfig) {
    // create new layer group
    const element = document.getElementById(viewConfig.divId);
    const layerGroup = this.#stage.addLayerGroup(element);
    // bind events
    this.#bindLayerGroupToApp(layerGroup);
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
   * @param {string} dataId The data id to render.
   * @param {Array} [viewConfigs] The list of configs to render.
   */
  render(dataId, viewConfigs) {
    if (typeof dataId === 'undefined' || dataId === null) {
      throw new Error('Cannot render without data id');
    }

    // create layer groups if not done yet
    // (create all to allow for ratio sync)
    if (this.#stage.getNumberOfLayerGroups() === 0) {
      this.#createLayerGroups(this.#options.dataViewConfigs);
    }

    // use options list if non provided
    if (typeof viewConfigs === 'undefined') {
      viewConfigs = this.#getViewConfigs(dataId);
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
      // add view
      // warn: needs a loaded DOM
      if (typeof this.#dataController.get(dataId) !== 'undefined' &&
        layerGroup.getViewLayersByDataId(dataId).length === 0) {
        this.#addViewLayer(dataId, config);
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
   */
  onResize = () => {
    this.fitToContainer();
  };

  /**
   * Key down callback. Meant to be used in tools.
   *
   * @param {KeyboardEvent} event The key down event.
   * @fires App#keydown
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
   * @param {string} colourMap The colour map name.
   */
  setColourMap(colourMap) {
    const viewController =
      this.#stage.getActiveLayerGroup()
        .getActiveViewLayer().getViewController();
    viewController.setColourMapFromName(colourMap);
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
        this.#dataController.addNew(
          event.dataid, event.data.image, event.data.info);
      } else {
        this.#dataController.update(
          event.dataid, event.data.image, event.data.info);
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
      this.#getViewConfigs(event.dataid).length !== 0 &&
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
   * Add a view layer.
   *
   * @param {string} dataId The data id.
   * @param {object} dataViewConfig The data view config.
   */
  #addViewLayer(dataId, dataViewConfig) {
    const data = this.#dataController.get(dataId);
    if (!data) {
      throw new Error('Cannot initialise layer with missing data, id: ' +
      dataId);
    }
    const layerGroup = this.#stage.getLayerGroupByDivId(dataViewConfig.divId);
    if (!layerGroup) {
      throw new Error('Cannot initialise layer with missing group, id: ' +
        dataViewConfig.divId);
    }
    const imageGeometry = data.image.getGeometry();

    // un-bind
    this.#stage.unbindLayerGroups();

    // create and setup view
    const viewFactory = new ViewFactory();
    const view = viewFactory.create(data.meta, data.image);
    const viewOrientation = getViewOrientation(
      imageGeometry.getOrientation(),
      getMatrixFromName(dataViewConfig.orientation)
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
    const isBaseLayer = layerGroup.getNumberOfLayers() === 0;

    // colour map
    if (typeof dataViewConfig.colourMap !== 'undefined') {
      view.setColourMap(dataViewConfig.colourMap);
    } else {
      if (!isBaseLayer) {
        if (data.image.getMeta().Modality === 'PT') {
          view.setColourMap(lut.hot);
        } else {
          view.setColourMap(lut.rainbow);
        }
      }
    }

    // opacity
    let opacity = 1;
    if (typeof dataViewConfig.opacity !== 'undefined') {
      opacity = dataViewConfig.opacity;
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

    // optional draw layer
    let drawLayer;
    if (this.#toolboxController && this.#toolboxController.hasTool('Draw')) {
      drawLayer = layerGroup.addDrawLayer();
      drawLayer.initialise(size2D, spacing2D, dataId);
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

    // view layer offset (done before scale)
    viewLayer.setOffset(layerGroup.getOffset());

    // major orientation axis
    const major = imageGeometry.getOrientation().getThirdColMajorDirection();

    // flip
    let flipOffsetX = false;
    let flipOffsetY = false;
    let flipScaleZ = false;
    if (typeof dataViewConfig.orientation !== 'undefined') {
      if (major === 2) {
        // scale flip Z for oriented views...
        flipScaleZ = true;
        // flip offset Y for axial aquired data
        if (dataViewConfig.orientation !== 'axial') {
          flipOffsetY = true;
        }
      } else if (major === 0) {
        // scale flip Z for oriented views...
        flipScaleZ = true;
        // flip offset X for sagittal aquired data
        if (dataViewConfig.orientation !== 'sagittal') {
          flipOffsetX = true;
        }
      }
    } else {
      if (major === 0) {
        // scale flip Z for sagittal and undefined target orientation
        flipScaleZ = true;
      }
    }
    // apply
    if (flipOffsetX) {
      viewLayer.addFlipOffsetX();
      if (typeof drawLayer !== 'undefined') {
        drawLayer.addFlipOffsetX();
      }
    }
    if (flipOffsetY) {
      viewLayer.addFlipOffsetY();
      if (typeof drawLayer !== 'undefined') {
        drawLayer.addFlipOffsetY();
      }
    }
    if (flipScaleZ) {
      viewLayer.flipScaleZ();
      if (typeof drawLayer !== 'undefined') {
        drawLayer.flipScaleZ();
      }
    }

    // layer scale (done after possible flip)
    viewLayer.setScale(layerGroup.getScale());
    if (typeof drawLayer !== 'undefined') {
      drawLayer.setScale(layerGroup.getScale());
    }

    // bind
    this.#stage.bindLayerGroups();
    if (this.#toolboxController) {
      this.#toolboxController.bindLayerGroup(layerGroup, viewLayer);
    }

    // initialise the toolbox for base
    if (isBaseLayer) {
      if (this.#toolboxController) {
        this.#toolboxController.init();
      }
    }

  }

} // class App
