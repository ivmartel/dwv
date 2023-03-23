import {ViewEventNames} from '../image/view';
import {ViewFactory} from '../image/viewFactory';
import {ColourMaps} from '../image/luts';
import {getMatrixFromName} from '../math/matrix';
import {Point3D} from '../math/point';
import {Stage} from '../gui/stage';
import {Style} from '../gui/style';
import {getViewOrientation} from '../gui/layerGroup';
import {ListenerHandler} from '../utils/listen';
import {State} from '../io/state';
import {logger} from '../utils/logger';
import {UndoStack} from '../tools/undo';
import {ToolboxController} from './toolboxController';
import {LoadController} from './loadController';
import {DataController} from './dataController';

import {WindowLevel} from '../tools/windowLevel';
import {Scroll} from '../tools/scroll';
import {ZoomAndPan} from '../tools/zoomPan';
import {Opacity} from '../tools/opacity';
import {Draw} from '../tools/draw';

import {ArrowFactory} from '../tools/arrow';
import {CircleFactory} from '../tools/circle';
import {EllipseFactory} from '../tools/ellipse';
import {ProtractorFactory} from '../tools/protractor';
import {RectangleFactory} from '../tools/rectangle';

import {Threshold, Sobel, Sharpen} from '../tools/filter';

import {
  WindowLevelBinder,
  PositionBinder,
  ZoomBinder,
  OffsetBinder,
  OpacityBinder
} from '../gui/stage';

const ToolList = {
  WindowLevel,
  Scroll,
  ZoomAndPan,
  Opacity,
  Draw
};

const ToolOptions = {
  draw: {
    ArrowFactory,
    CircleFactory,
    EllipseFactory,
    ProtractorFactory,
    RectangleFactory
  },
  filter: {
    Threshold,
    Sobel,
    Sharpen
  }
};

const BinderList = {
  WindowLevelBinder,
  PositionBinder,
  ZoomBinder,
  OffsetBinder,
  OpacityBinder
};

/**
 * Main application class.
 *
 * @class
 * @example
 * // create the dwv app
 * var app = new App();
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

  /**
   * Listener handler.
   *
   * @type {object}
   * @private
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
    var id = this.#dataController.length();

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
    var viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    var controller = viewLayer.getViewController();
    return controller.canScroll();
  }

  /**
   * Can window and level be applied to the data?
   *
   * @returns {boolean} True if the data is monochrome.
   */
  canWindowLevel() {
    var viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    var controller = viewLayer.getViewController();
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
   */
  addToUndoStack(cmd) {
    if (this.#undoStack !== null) {
      this.#undoStack.add(cmd);
    }
  }

  /**
   * Initialise the application.
   *
   * @param {object} opt The application option with:
   * - `dataViewConfigs`: data indexed object containing the data view
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
   * @example
   * // create the dwv app
   * var app = new App();
   * // initialise
   * app.init({
   *   dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
   *   viewOnFirstLoadItem: false
   * });
   * // render button
   * var button = document.createElement('button');
   * button.id = 'render';
   * button.disabled = true;
   * button.appendChild(document.createTextNode('render'));
   * document.body.appendChild(button);
   * app.addEventListener('load', function () {
   *   var button = document.getElementById('render');
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
    if (this.#options.tools && this.#options.tools.length !== 0) {
      // setup the tool list
      var toolList = {};
      var keys = Object.keys(this.#options.tools);
      for (var t = 0; t < keys.length; ++t) {
        var toolName = keys[t];
        // find the tool in the Tools list
        if (typeof ToolList[toolName] !== 'undefined') {
          // create tool instance
          toolList[toolName] = new ToolList[toolName](this);
          // register listeners
          if (typeof toolList[toolName].addEventListener !== 'undefined') {
            var names = toolList[toolName].getEventNames();
            for (var j = 0; j < names.length; ++j) {
              toolList[toolName].addEventListener(names[j], this.#fireEvent);
            }
          }
          // tool options
          var toolParams = this.#options.tools[toolName];
          if (typeof toolParams.options !== 'undefined') {
            var type = 'raw';
            if (typeof toolList[toolName].getOptionsType !== 'undefined') {
              type = toolList[toolName].getOptionsType();
            }
            var toolOptions = toolParams.options;
            if (type === 'instance' || type === 'factory') {
              toolOptions = {};
              for (var i = 0; i < toolParams.options.length; ++i) {
                var optionName = toolParams.options[i];
                var optionClassName = optionName;
                if (type === 'factory') {
                  optionClassName += 'Factory';
                }
                var toolNamespace = toolName.charAt(0).toLowerCase() +
                  toolName.slice(1);
                if (typeof ToolOptions[toolNamespace][optionClassName] !==
                  'undefined') {
                  toolOptions[optionName] =
                    ToolOptions[toolNamespace][optionClassName];
                } else {
                  logger.warn('Could not find option class for: ' +
                    optionName);
                }
              }
            }
            toolList[toolName].setOptions(toolOptions);
          }
        } else {
          logger.warn('Could not initialise unknown tool: ' + toolName);
        }
      }
      // add tools to the controller
      this.#toolboxController = new ToolboxController(toolList);
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
   * Get a HTML element associated to the application.
   *
   * @param {string} _name The name or id to find.
   * @returns {object} The found element or null.
   * @deprecated
   */
  getElement(_name) {
    return null;
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
   * @param {Array} files The list of files to load.
   * @fires App#loadstart
   * @fires App#loadprogress
   * @fires App#loaditem
   * @fires App#loadend
   * @fires App#loaderror
   * @fires App#loadabort
   */
  loadFiles(files) {
    if (files.length === 0) {
      logger.warn('Ignoring empty input file list.');
      return;
    }
    this.#loadController.loadFiles(files);
  }

  /**
   * Load a list of URLs. Can be image files or a state file.
   *
   * @param {Array} urls The list of urls to load.
   * @param {object} options The options object, can contain:
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
  loadURLs(urls, options) {
    if (urls.length === 0) {
      logger.warn('Ignoring empty input url list.');
      return;
    }
    this.#loadController.loadURLs(urls, options);
  }

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
  loadImageObject(data) {
    this.#loadController.loadImageObject(data);
  }

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
    var viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
    var controller = viewLayer.getViewController();
    controller.initialise();
  }

  /**
   * Get the layer group configuration from a data index.
   * Defaults to div id 'layerGroup' if no association object has been set.
   *
   * @param {number} dataIndex The data index.
   * @returns {Array} The list of associated configs.
   */
  #getViewConfigs(dataIndex) {
    // check options
    if (this.#options.dataViewConfigs === null ||
      typeof this.#options.dataViewConfigs === 'undefined') {
      throw new Error('No available data view configuration');
    }
    var configs = [];
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
   * Create layer groups according to a data view config:
   * adds them to stage and bind them.
   *
   * @param {object} dataViewConfigs The data view config.
   */
  #createLayerGroups(dataViewConfigs) {
    var dataKeys = Object.keys(dataViewConfigs);
    var divIds = [];
    for (var i = 0; i < dataKeys.length; ++i) {
      var dataConfigs = dataViewConfigs[dataKeys[i]];
      for (var j = 0; j < dataConfigs.length; ++j) {
        var viewConfig = dataConfigs[j];
        // view configs can contain the same divIds, avoid duplicating
        if (!divIds.includes(viewConfig.divId)) {
          // create new layer group
          var element = document.getElementById(viewConfig.divId);
          var layerGroup = this.#stage.addLayerGroup(element);
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
    var instances = [];
    for (var i = 0; i < list.length; ++i) {
      if (typeof BinderList[list[i]] !== 'undefined') {
        instances.push(new BinderList[list[i]]);
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
    var viewConfigs = this.#getViewConfigs(dataIndex);
    // nothing to do if no view config
    if (viewConfigs.length === 0) {
      logger.info('Not rendering data: ' + dataIndex +
        ' (no data view config)');
      return;
    }
    for (var i = 0; i < viewConfigs.length; ++i) {
      var config = viewConfigs[i];
      var layerGroup =
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
    var layerGroup = this.#stage.getActiveLayerGroup();
    var viewController = layerGroup.getActiveViewLayer().getViewController();
    var k = viewController.getCurrentScrollPosition();
    var center = new Point3D(cx, cy, k);
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
    var layerGroup = this.#stage.getActiveLayerGroup();
    layerGroup.addTranslation({x: tx, y: ty});
    layerGroup.draw();
  }

  /**
   * Set the image layer opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   */
  setOpacity(alpha) {
    var viewLayer = this.#stage.getActiveLayerGroup().getActiveViewLayer();
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
    var layerGroup = this.#stage.getActiveLayerGroup();
    var viewController =
      layerGroup.getActiveViewLayer().getViewController();
    var drawController =
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
   * @returns {object} The state of the app as a JSON object.
   */
  getState() {
    var state = new State();
    return state.toJSON(this);
  }

  // Handler Methods -----------------------------------------------------------

  /**
   * Handle resize: fit the display to the window.
   * To be called once the image is loaded.
   * Can be connected to a window 'resize' event.
   *
   * @param {object} _event The change event.
   * @private
   */
  onResize = (_event) => {
    this.fitToContainer();
  };

  /**
   * Key down callback. Meant to be used in tools.
   *
   * @param {object} event The key down event.
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
   * @param {object} event The key down event.
   * @fires UndoStack#undo
   * @fires UndoStack#redo
   */
  defaultOnKeydown = (event) => {
    if (event.ctrlKey) {
      if (event.shiftKey) {
        var viewController =
          this.#stage.getActiveLayerGroup()
            .getActiveViewLayer().getViewController();
        var size = viewController.getImageSize();
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
        for (var i = 0; i < this.#stage.getNumberOfLayerGroups(); ++i) {
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
    var viewController =
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
    var viewController =
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
    for (var i = 0; i < this.#stage.getNumberOfLayerGroups(); ++i) {
      var layerGroup = this.#stage.getLayerGroup(i);
      // draw or view layer
      var layer = null;
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
   * @private
   */
  #fireEvent = (event) => {
    this.#listenerHandler.fireEvent(event);
  };

  /**
   * Data load start callback.
   *
   * @param {object} event The load start event.
   * @private
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
   * @private
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
   * @private
   */
  #onloaditem = (event) => {
    // check event
    if (typeof event.data === 'undefined') {
      logger.error('Missing loaditem event data.');
    }
    if (typeof event.loadtype === 'undefined') {
      logger.error('Missing loaditem event load type.');
    }

    var isFirstLoadItem = event.isfirstitem;

    var eventMetaData = null;
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
      var state = new State();
      state.apply(this, state.fromJSON(event.data));
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
      isfirstitem: event.isfirstitem
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
   * @private
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
   * @private
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
   * @private
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
   * @private
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
   * @private
   */
  #bindLayerGroupToApp(group) {
    // propagate layer group events
    group.addEventListener('zoomchange', this.#fireEvent);
    group.addEventListener('offsetchange', this.#fireEvent);
    // propagate viewLayer events
    group.addEventListener('renderstart', this.#fireEvent);
    group.addEventListener('renderend', this.#fireEvent);
    // propagate view events
    for (var j = 0; j < ViewEventNames.length; ++j) {
      group.addEventListener(ViewEventNames[j], this.#fireEvent);
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
   * @param {object} dataViewConfig The data view config.
   * @private
   */
  #initialiseBaseLayers(dataIndex, dataViewConfig) {
    // add layers
    this.#addViewLayer(dataIndex, dataViewConfig);

    // initialise the toolbox
    if (this.#toolboxController) {
      this.#toolboxController.init();
    }
  }

  /**
   * Add a view layer.
   *
   * @param {number} dataIndex The data index.
   * @param {object} dataViewConfig The data view config.
   */
  #addViewLayer(dataIndex, dataViewConfig) {
    var data = this.#dataController.get(dataIndex);
    if (!data) {
      throw new Error('Cannot initialise layer with data id: ' + dataIndex);
    }
    var layerGroup = this.#stage.getLayerGroupByDivId(dataViewConfig.divId);
    if (!layerGroup) {
      throw new Error('Cannot initialise layer with group id: ' +
        dataViewConfig.divId);
    }
    var imageGeometry = data.image.getGeometry();

    // un-bind
    this.#stage.unbindLayerGroups();

    // create and setup view
    var viewFactory = new ViewFactory();
    var view = viewFactory.create(data.meta, data.image);
    var viewOrientation = getViewOrientation(
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
    if (typeof dataViewConfig.colourMap !== 'undefined') {
      view.setColourMap(dataViewConfig.colourMap);
    }

    var isBaseLayer = layerGroup.getNumberOfLayers() === 0;

    // opacity
    var opacity = 1;
    // do we have more than one layer
    // (the layer has not been added to the layer group yet)
    if (!isBaseLayer) {
      opacity = 0.5;
      // set color map if non was provided
      if (typeof dataViewConfig.colourMap === 'undefined') {
        view.setColourMap(ColourMaps.rainbow);
      }
    }

    // view layer
    var viewLayer = layerGroup.addViewLayer();
    viewLayer.setView(view, dataIndex);
    var size2D = imageGeometry.getSize(viewOrientation).get2D();
    var spacing2D = imageGeometry.getSpacing(viewOrientation).get2D();
    viewLayer.initialise(size2D, spacing2D, opacity);
    var viewController = viewLayer.getViewController();

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
    var drawLayer;
    if (this.#toolboxController && this.#toolboxController.hasTool('Draw')) {
      drawLayer = layerGroup.addDrawLayer();
      drawLayer.initialise(size2D, spacing2D, dataIndex);
      drawLayer.setPlaneHelper(viewLayer.getViewController().getPlaneHelper());
    }

    // sync layers position
    var value = [
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
    var major = imageGeometry.getOrientation().getThirdColMajorDirection();

    // view layer offset (done before scale)
    viewLayer.setOffset(layerGroup.getOffset());
    // extra flip offset for oriented views...
    if (typeof dataViewConfig.orientation !== 'undefined') {
      if (major === 2) {
        // flip offset Y for axial aquired data
        if (dataViewConfig.orientation !== 'axial') {
          viewLayer.addFlipOffsetY();
          if (typeof drawLayer !== 'undefined') {
            drawLayer.addFlipOffsetY();
          }
        }
      } else if (major === 0) {
        // flip offset X for sagittal aquired data
        if (dataViewConfig.orientation !== 'sagittal') {
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
      if (typeof dataViewConfig.orientation !== 'undefined') {
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
