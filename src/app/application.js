/** @namespace */
var dwv = dwv || {};

/**
 * Main application class.
 *
 * @class
 * @tutorial examples
 */
dwv.App = function () {
  // check logger
  if (typeof dwv.logger === 'undefined') {
    dwv.logger = dwv.utils.logger.console;
  }

  // Local object
  var self = this;

  // Image
  var image = null;
  // Original image
  var originalImage = null;
  // Image data width
  var dataWidth = 0;
  // Image data height
  var dataHeight = 0;

  // Container div id
  var containerDivId = null;
  // Display window scale
  var windowScale = 1;
  // main scale
  var scale = 1;
  // zoom center
  var scaleCenter = {x: 0, y: 0};
  // translation
  var translation = {x: 0, y: 0};

  // flag to create view on first load
  var viewOnFirstLoadItem = true;

  // meta data
  var metaData = null;

  // Image layer
  var imageLayer = null;

  // Draw controller
  var drawController = null;

  // Generic style
  var style = new dwv.html.Style();

  // Toolbox controller
  var toolboxController = null;

  // load controller
  var loadController = null;

  // UndoStack
  var undoStack = null;

  // listeners
  var listeners = {};

  /**
   * Get the image.
   *
   * @returns {Image} The associated image.
   */
  this.getImage = function () {
    return image;
  };
  /**
   * Set the image.
   *
   * @param {Image} img The associated image.
   */
  this.setImage = function (img) {
    image = img;
    imageLayer.setViewImage(img);
  };
  /**
   * Restore the original image.
   */
  this.restoreOriginalImage = function () {
    image = originalImage;
    imageLayer.setViewImage(originalImage);
  };
  /**
   * Is the data mono-slice?
   *
   * @returns {boolean} True if the data only contains one slice.
   */
  this.isMonoSliceData = function () {
    return loadController.isMonoSliceData();
  };
  /**
   * Is the data mono-frame?
   *
   * @returns {boolean} True if the data only contains one frame.
   */
  this.isMonoFrameData = function () {
    return (this.getImage() && typeof this.getImage() !== 'undefined' &&
            this.getImage().getNumberOfFrames() === 1);
  };
  /**
   * Can the data be scrolled?
   *
   * @returns {boolean} True if the data has more than one slice or frame.
   */
  this.canScroll = function () {
    return !this.isMonoSliceData() || !this.isMonoFrameData();
  };

  /**
   * Can window and level be applied to the data?
   *
   * @returns {boolean} True if the data is monochrome.
   */
  this.canWindowLevel = function () {
    return this.getImage().getPhotometricInterpretation().match(/MONOCHROME/) !== null;
  };

  /**
   * Get the main scale.
   *
   * @returns {number} The main scale.
   */
  this.getScale = function () {
    return scale / windowScale;
  };

  /**
   * Get the window scale.
   *
   * @returns {number} The window scale.
   */
  this.getWindowScale = function () {
    return windowScale;
  };

  /**
   * Get the scale center.
   *
   * @returns {object} The coordinates of the scale center.
   */
  this.getScaleCenter = function () {
    return scaleCenter;
  };

  /**
   * Get the translation.
   *
   * @returns {object} The translation.
   */
  this.getTranslation = function () {
    return translation;
  };

  /**
   * Get the view controller.
   *
   * @returns {object} The controller.
   */
  this.getViewController = function () {
    return imageLayer.getViewController();
  };

  /**
   * Get the toolbox controller.
   *
   * @returns {object} The controller.
   */
  this.getToolboxController = function () {
    return toolboxController;
  };

  /**
   * Get the draw controller.
   *
   * @returns {object} The controller.
   */
  this.getDrawController = function () {
    return drawController;
  };

  /**
   * Get the image layer.
   *
   * @returns {object} The image layer.
   */
  this.getImageLayer = function () {
    return imageLayer;
  };

  /**
   * Get the draw stage.
   *
   * @returns {object} The draw stage.
   */
  this.getDrawStage = function () {
    return drawController.getDrawStage();
  };

  /**
   * Get the app style.
   *
   * @returns {object} The app style.
   */
  this.getStyle = function () {
    return style;
  };

  /**
   * Add a command to the undo stack.
   *
   * @param {object} cmd The command to add.
   * @fires dwv.tool.UndoStack#undoadd
   */
  this.addToUndoStack = function (cmd) {
    if (undoStack !== null) {
      undoStack.add(cmd);
    }
  };

  /**
   * Initialise the application.
   *
   * @param {object} config The application configuration.
   */
  this.init = function (config) {
    containerDivId = config.containerDivId;
    // undo stack
    undoStack = new dwv.tool.UndoStack();
    undoStack.addEventListener('undoadd', fireEvent);
    undoStack.addEventListener('undo', fireEvent);
    undoStack.addEventListener('redo', fireEvent);
    // tools
    if (config.tools && config.tools.length !== 0) {
      // setup the tool list
      var toolList = {};
      var keys = Object.keys(config.tools);
      for (var t = 0; t < keys.length; ++t) {
        var toolName = keys[t];
        var toolParams = config.tools[toolName];
        // find the tool in the dwv.tool namespace
        if (typeof dwv.tool[toolName] !== 'undefined') {
          // create tool instance
          toolList[toolName] = new dwv.tool[toolName](this);
          // register listeners
          if (typeof toolList[toolName].addEventListener !== 'undefined') {
            if (typeof toolParams.events !== 'undefined') {
              for (var j = 0; j < toolParams.events.length; ++j) {
                var eventName = toolParams.events[j];
                toolList[toolName].addEventListener(eventName, fireEvent);
              }
            }
          }
          // tool options
          if (typeof toolParams.options !== 'undefined') {
            var type = 'raw';
            if (typeof toolParams.type !== 'undefined') {
              type = toolParams.type;
            }
            var options = toolParams.options;
            if (type === 'instance' ||
                type === 'factory') {
              options = {};
              for (var i = 0; i < toolParams.options.length; ++i) {
                var optionName = toolParams.options[i];
                var optionClassName = optionName;
                if (type === 'factory') {
                  optionClassName += 'Factory';
                }
                var toolNamespace = toolName.charAt(0).toLowerCase() +
                  toolName.slice(1);
                if (typeof dwv.tool[toolNamespace][optionClassName] !==
                  'undefined') {
                  options[optionName] =
                    dwv.tool[toolNamespace][optionClassName];
                } else {
                  dwv.logger.warn('Could not find option class for: ' +
                    optionName);
                }
              }
            }
            toolList[toolName].setOptions(options);
          }
        } else {
          dwv.logger.warn('Could not initialise unknown tool: ' + toolName);
        }
      }
      // add tools to the controller
      toolboxController = new dwv.ToolboxController(toolList);
    }

    // create load controller
    loadController = new dwv.LoadController(config.defaultCharacterSet);
    loadController.onloadstart = onloadstart;
    loadController.onprogress = onprogress;
    loadController.onloaditem = onloaditem;
    loadController.onload = onload;
    loadController.onloadend = onloadend;
    loadController.onerror = onerror;
    loadController.onabort = onabort;

    // flag to view on first load
    if (typeof config.viewOnFirstLoadItem !== 'undefined') {
      viewOnFirstLoadItem = config.viewOnFirstLoadItem;
    }
  };

  /**
   * Get the size available for the layer container div.
   *
   * @returns {object} The available width and height: {width:X; height:Y}.
   */
  this.getLayerContainerSize = function () {
    var ldiv = self.getElement('layerContainer');
    var parent = ldiv.parentNode;
    // offsetHeight: height of an element, including vertical padding
    // and borders
    // ref: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
    var height = parent.offsetHeight;
    // remove the height of other elements of the container div
    var kids = parent.children;
    for (var i = 0; i < kids.length; ++i) {
      if (!kids[i].classList.contains('layerContainer')) {
        var styles = window.getComputedStyle(kids[i]);
        // offsetHeight does not include margin
        var margin = parseFloat(styles.getPropertyValue('margin-top'), 10) +
               parseFloat(styles.getPropertyValue('margin-bottom'), 10);
        height -= (kids[i].offsetHeight + margin);
      }
    }
    return {width: parent.offsetWidth, height: height};
  };

  /**
   * Get a HTML element associated to the application.
   *
   * @param {string} name The name or id to find.
   * @returns {object} The found element or null.
   */
  this.getElement = function (name) {
    return dwv.gui.getElement(containerDivId, name);
  };

  /**
   * Reset the application.
   */
  this.reset = function () {
    // clear draw
    if (drawController) {
      drawController.reset();
    }
    // clear objects
    image = null;
    metaData = null;
    imageLayer = null;
    // reset undo/redo
    if (undoStack) {
      undoStack = new dwv.tool.UndoStack();
      undoStack.addEventListener('undoadd', fireEvent);
      undoStack.addEventListener('undo', fireEvent);
      undoStack.addEventListener('redo', fireEvent);
    }
  };

  /**
   * Reset the layout of the application.
   *
   * @fires dwv.App#zoomchange
   * @fires dwv.App#offsetchange
   */
  this.resetLayout = function () {
    var previousScale = scale;
    var previousSC = scaleCenter;
    var previousTrans = translation;
    // reset values
    scale = windowScale;
    scaleCenter = {x: 0, y: 0};
    translation = {x: 0, y: 0};
    // apply new values
    if (imageLayer) {
      imageLayer.resetLayout(windowScale);
      imageLayer.draw();
    }
    if (drawController) {
      drawController.resetStage(windowScale);
    }
    // fire events
    if (previousScale !== scale) {
      fireEvent({
        type: 'zoomchange',
        value: [scale],
        scale: scale,
        cx: scaleCenter.x,
        cy: scaleCenter.y
      });
    }
    if ((previousSC.x !== scaleCenter.x || previousSC.y !== scaleCenter.y) ||
      (previousTrans.x !== translation.x || previousTrans.y !== translation.y)
    ) {
      fireEvent({
        type: 'offsetchange',
        value: [scaleCenter.x, scaleCenter.y],
        scale: scale,
        cx: scaleCenter.x,
        cy: scaleCenter.y
      });
    }
  };


  /**
   * Add an event listener on the app.
   *
   * @param {string} type The event type.
   * @param {object} listener The method associated with the provided
   *   event type.
   */
  this.addEventListener = function (type, listener) {
    if (typeof listeners[type] === 'undefined') {
      listeners[type] = [];
    }
    listeners[type].push(listener);
  };

  /**
   * Remove an event listener from the app.
   *
   * @param {string} type The event type.
   * @param {object} listener The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, listener) {
    if (typeof listeners[type] === 'undefined') {
      return;
    }
    for (var i = 0; i < listeners[type].length; ++i) {
      if (listeners[type][i] === listener) {
        listeners[type].splice(i, 1);
      }
    }
  };

  // load API [begin] -------------------------------------------------------

  /**
   * Load a list of files. Can be image files or a state file.
   *
   * @param {Array} files The list of files to load.
   * @fires dwv.App#loadstart
   * @fires dwv.App#loadprogress
   * @fires dwv.App#loaditem
   * @fires dwv.App#loadend
   * @fires dwv.App#error
   * @fires dwv.App#abort
   */
  this.loadFiles = function (files) {
    loadController.loadFiles(files);
  };

  /**
   * Load a list of URLs. Can be image files or a state file.
   *
   * @param {Array} urls The list of urls to load.
   * @param {object} options The options object, can contain:
   *  - requestHeaders: an array of {name, value} to use as request headers
   *  - withCredentials: boolean xhr.withCredentials flag to pass to the request
   *  - batchSize: the size of the request url batch
   * @fires dwv.App#loadstart
   * @fires dwv.App#loadprogress
   * @fires dwv.App#loaditem
   * @fires dwv.App#loadend
   * @fires dwv.App#error
   * @fires dwv.App#abort
   */
  this.loadURLs = function (urls, options) {
    loadController.loadURLs(urls, options);
  };

  /**
   * Load a list of ArrayBuffers.
   *
   * @param {Array} data The list of ArrayBuffers to load
   *   in the form of [{name: "", filename: "", data: data}].
   * @fires dwv.App#loadstart
   * @fires dwv.App#loadprogress
   * @fires dwv.App#loaditem
   * @fires dwv.App#loadend
   * @fires dwv.App#error
   * @fires dwv.App#abort
   */
  this.loadImageObject = function (data) {
    loadController.loadImageObject(data);
  };

  /**
   * Abort the current load.
   */
  this.abortLoad = function () {
    loadController.abort();
  };

  // load API [end] ---------------------------------------------------------

  /**
   * Fit the display to the given size. To be called once the image is loaded.
   *
   * @param {object} size A size as `{width,height}`.
   */
  this.fitToSize = function (size) {
    // previous width
    var oldWidth = parseInt(windowScale * dataWidth, 10);
    // find new best fit
    windowScale = Math.min(
      (size.width / dataWidth),
      (size.height / dataHeight)
    );
    // new sizes
    var newWidth = parseInt(windowScale * dataWidth, 10);
    var newHeight = parseInt(windowScale * dataHeight, 10);
    // ratio previous/new to add to zoom
    var mul = newWidth / oldWidth;
    scale *= mul;

    // update style
    style.setScale(windowScale);

    // resize container
    var container = this.getElement('layerContainer');
    container.setAttribute(
      'style', 'width:' + newWidth + 'px;height:' + newHeight + 'px');
    // resize image layer
    if (imageLayer) {
      imageLayer.setWidth(newWidth);
      imageLayer.setHeight(newHeight);
      imageLayer.zoom(scale, scale, 0, 0);
      imageLayer.draw();
    }
    // resize draw stage
    if (drawController) {
      drawController.resizeStage(newWidth, newHeight, scale);
    }
  };

  /**
   * Init the Window/Level display
   */
  this.initWLDisplay = function () {
    var controller = imageLayer.getViewController();
    // set window/level to first preset
    controller.setWindowLevelPresetById(0);
    // default position
    controller.setCurrentPosition2D(0, 0);
    // default frame
    controller.setCurrentFrame(0);
  };

  /**
   * Add canvas mouse and touch listeners.
   *
   * @param {object} layer The canvas layer to listen to.
   */
  this.addToolLayerListeners = function (layer) {
    toolboxController.addLayerListeners(layer);
  };

  /**
   * Remove layer mouse and touch listeners.
   *
   * @param {object} layer The canvas to stop listening to.
   */
  this.removeToolLayerListeners = function (layer) {
    toolboxController.removeLayerListeners(layer);
  };

  /**
   * Render the current image.
   */
  this.render = function () {
    // create view if first tiem
    if (!imageLayer) {
      initialiseImageLayer();
    }
    // draw the image
    imageLayer.draw();
  };

  /**
   * Zoom to the layers.
   *
   * @param {number} zoom The zoom to apply.
   * @param {number} cx The zoom center X coordinate.
   * @param {number} cy The zoom center Y coordinate.
   */
  this.zoom = function (zoom, cx, cy) {
    scale = zoom * windowScale;
    if (scale <= 0.1) {
      scale = 0.1;
    }
    scaleCenter = {x: cx, y: cy};
    zoomLayers();
  };

  /**
   * Add a step to the layers zoom.
   *
   * @param {number} step The zoom step increment. A good step is of 0.1.
   * @param {number} cx The zoom center X coordinate.
   * @param {number} cy The zoom center Y coordinate.
   */
  this.stepZoom = function (step, cx, cy) {
    scale += step;
    if (scale <= 0.1) {
      scale = 0.1;
    }
    scaleCenter = {x: cx, y: cy};
    zoomLayers();
  };

  /**
   * Apply a translation to the layers.
   *
   * @param {number} tx The translation along X.
   * @param {number} ty The translation along Y.
   */
  this.translate = function (tx, ty) {
    translation = {x: tx, y: ty};
    translateLayers();
  };

  /**
   * Add a translation to the layers.
   *
   * @param {number} tx The step translation along X.
   * @param {number} ty The step translation along Y.
   */
  this.stepTranslate = function (tx, ty) {
    var txx = translation.x + tx / scale;
    var tyy = translation.y + ty / scale;
    translation = {x: txx, y: tyy};
    translateLayers();
  };

  /**
   * Set the image layer opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   */
  this.setOpacity = function (alpha) {
    imageLayer.setOpacity(alpha);
    imageLayer.draw();
  };

  /**
   * Get the list of drawing display details.
   *
   * @returns {object} The list of draw details including id, slice, frame...
   */
  this.getDrawDisplayDetails = function () {
    return drawController.getDrawDisplayDetails();
  };

  /**
   * Get the meta data.
   *
   * @returns {object} The list of meta data.
   */
  this.getMetaData = function () {
    return metaData;
  };

  /**
   * Get a list of drawing store details.
   *
   * @returns {object} A list of draw details including id, text, quant...
   */
  this.getDrawStoreDetails = function () {
    return drawController.getDrawStoreDetails();
  };
  /**
   * Set the drawings on the current stage.
   *
   * @param {Array} drawings An array of drawings.
   * @param {Array} drawingsDetails An array of drawings details.
   */
  this.setDrawings = function (drawings, drawingsDetails) {
    drawController.setDrawings(
      drawings, drawingsDetails, fireEvent, this.addToUndoStack);
    var controller = imageLayer.getViewController();
    drawController.activateDrawLayer(
      controller.getCurrentPosition(),
      controller.getCurrentFrame());
  };
  /**
   * Update a drawing from its details.
   *
   * @param {object} drawDetails Details of the drawing to update.
   */
  this.updateDraw = function (drawDetails) {
    drawController.updateDraw(drawDetails);
  };
  /**
   * Delete all Draws from all layers.
   */
  this.deleteDraws = function () {
    drawController.deleteDraws(fireEvent, this.addToUndoStack);
  };
  /**
   * Check the visibility of a given group.
   *
   * @param {object} drawDetails Details of the drawing to check.
   * @returns {boolean} True if the group is visible.
   */
  this.isGroupVisible = function (drawDetails) {
    return drawController.isGroupVisible(drawDetails);
  };
  /**
   * Toggle group visibility.
   *
   * @param {object} drawDetails Details of the drawing to update.
   */
  this.toogleGroupVisibility = function (drawDetails) {
    drawController.toogleGroupVisibility(drawDetails);
  };

  /**
   * Get the JSON state of the app.
   *
   * @returns {object} The state of the app as a JSON object.
   */
  this.getState = function () {
    var state = new dwv.State();
    return state.toJSON(self);
  };

  // Handler Methods -----------------------------------------------------------

  /**
   * Handle frame change.
   *
   * @param {object} event The event fired when changing the frame.
   * @private
   */
  function onFrameChange(event) {
    // generate and draw if no skip flag
    if (typeof event.skipGenerate === 'undefined' ||
      event.skipGenerate === false) {
      if (drawController) {
        var controller = imageLayer.getViewController();
        drawController.activateDrawLayer(
          controller.getCurrentPosition(),
          controller.getCurrentFrame());
      }
    }
  }

  /**
   * Handle slice change.
   *
   * @param {object} _event The event fired when changing the slice.
   * @private
   */
  function onSliceChange(_event) {
    if (drawController) {
      var controller = imageLayer.getViewController();
      drawController.activateDrawLayer(
        controller.getCurrentPosition(),
        controller.getCurrentFrame());
    }
  }

  /**
   * Handle resize: fit the display to the window.
   * To be called once the image is loaded.
   * Can be connected to a window 'resize' event.
   *
   * @param {object} _event The change event.
   * @private
   */
  this.onResize = function (_event) {
    self.fitToSize(self.getLayerContainerSize());
  };

  /**
   * Key down callback. Meant to be used in tools.
   *
   * @param {object} event The key down event.
   * @fires dwv.App#keydown
   */
  this.onKeydown = function (event) {
    /**
     * Key down event.
     *
     * @event dwv.App#keydown
     * @type {KeyboardEvent}
     * @property {string} type The event type: keydown.
     * @property {string} context The tool where the event originated.
     */
    fireEvent(event);
  };

  /**
   * Key down event handler example.
   * - CRTL-Z: undo
   * - CRTL-Y: redo
   * - CRTL-ARROW_LEFT: next frame
   * - CRTL-ARROW_UP: next slice
   * - CRTL-ARROW_RIGHT: previous frame
   * - CRTL-ARROW_DOWN: previous slice
   *
   * @param {object} event The key down event.
   * @fires dwv.tool.UndoStack#undo
   * @fires dwv.tool.UndoStack#redo
   */
  this.defaultOnKeydown = function (event) {
    if (event.ctrlKey) {
      if (event.keyCode === 37) { // crtl-arrow-left
        event.preventDefault();
        imageLayer.getViewController().decrementFrameNb();
      } else if (event.keyCode === 38) { // crtl-arrow-up
        event.preventDefault();
        imageLayer.getViewController().incrementSliceNb();
      } else if (event.keyCode === 39) { // crtl-arrow-right
        event.preventDefault();
        imageLayer.getViewController().incrementFrameNb();
      } else if (event.keyCode === 40) { // crtl-arrow-down
        event.preventDefault();
        imageLayer.getViewController().decrementSliceNb();
      } else if (event.keyCode === 89) { // crtl-y
        undoStack.redo();
      } else if (event.keyCode === 90) { // crtl-z
        undoStack.undo();
      }
    }
  };

  // Internal mebers shortcuts-----------------------------------------------

  /**
   * Reset the display
   */
  this.resetDisplay = function () {
    self.resetLayout();
    self.initWLDisplay();
  };

  /**
   * Reset the app zoom.s
   */
  this.resetZoom = function () {
    self.resetLayout();
  };

  /**
   * Set the colour map.
   *
   * @param {string} colourMap The colour map name.
   */
  this.setColourMap = function (colourMap) {
    imageLayer.getViewController().setColourMapFromName(colourMap);
  };

  /**
   * Set the window/level preset.
   *
   * @param {object} preset The window/level preset.
   */
  this.setWindowLevelPreset = function (preset) {
    imageLayer.getViewController().setWindowLevelPreset(preset);
  };

  /**
   * Set the tool
   *
   * @param {string} tool The tool.
   */
  this.setTool = function (tool) {
    toolboxController.setSelectedTool(tool);
  };

  /**
   * Set the draw shape.
   *
   * @param {string} shape The draw shape.
   */
  this.setDrawShape = function (shape) {
    toolboxController.setSelectedShape(shape);
  };

  /**
   * Set the image filter
   *
   * @param {string} filter The image filter.
   */
  this.setImageFilter = function (filter) {
    toolboxController.setSelectedFilter(filter);
  };

  /**
   * Run the selected image filter.
   */
  this.runImageFilter = function () {
    toolboxController.runSelectedFilter();
  };

  /**
   * Set the draw line colour.
   *
   * @param {string} colour The line colour.
   */
  this.setDrawLineColour = function (colour) {
    toolboxController.setLineColour(colour);
  };

  /**
   * Set the filter min/max.
   *
   * @param {object} range The new range of the data: {min:a, max:b}.
   */
  this.setFilterMinMax = function (range) {
    toolboxController.setRange(range);
  };

  /**
   * Undo the last action
   *
   * @fires dwv.tool.UndoStack#undo
   */
  this.undo = function () {
    undoStack.undo();
  };

  /**
   * Redo the last action
   *
   * @fires dwv.tool.UndoStack#redo
   */
  this.redo = function () {
    undoStack.redo();
  };


  // Private Methods -----------------------------------------------------------

  /**
   * Fire an event: call all associated listeners.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    if (typeof listeners[event.type] === 'undefined') {
      return;
    }
    for (var i = 0; i < listeners[event.type].length; ++i) {
      listeners[event.type][i](event);
    }
  }

  /**
   * Apply the stored zoom to the layers.
   *
   * @private
   * @fires dwv.App#zoomchange
   */
  function zoomLayers() {
    // image layer
    if (imageLayer) {
      imageLayer.zoom(scale, scale, scaleCenter.x, scaleCenter.y);
      imageLayer.draw();
    }
    // draw layer
    if (drawController) {
      drawController.zoomStage(scale, scaleCenter);
    }
    // fire event
    /**
     * Zoom change event.
     *
     * @event dwv.App#zoomchange
     * @type {object}
     * @property {Array} value The changed value.
     * @property {number} scale The new scale value.
     * @property {number} cx The new rotaion center X position.
     * @property {number} cy The new rotaion center Y position.
     */
    fireEvent({
      type: 'zoomchange',
      value: [scale],
      scale: scale,
      cx: scaleCenter.x,
      cy: scaleCenter.y
    });
    /**
     * Offset change event.
     *
     * @event dwv.App#offsetchange
     * @type {object}
     * @property {Array} value The changed value.
     */
    fireEvent({
      type: 'offsetchange',
      value: [scaleCenter.x, scaleCenter.y]
    });
  }

  /**
   * Apply the stored translation to the layers.
   *
   * @private
   * @fires dwv.App#offsetchange
   */
  function translateLayers() {
    // image layer
    if (imageLayer) {
      imageLayer.translate(translation.x, translation.y);
      imageLayer.draw();
      // draw layer
      if (drawController) {
        var ox = -imageLayer.getOrigin().x / scale - translation.x;
        var oy = -imageLayer.getOrigin().y / scale - translation.y;
        drawController.translateStage(ox, oy);
      }
      // fire event
      /**
       * Offset change event.
       *
       * @event dwv.App#translatechange
       * @type {object}
       * @property {Array} value The changed value.
       * @property {number} scale The new scale value.
       * @property {number} cx The new rotaion center X position.
       * @property {number} cy The new rotaion center Y position.
       */
      fireEvent({
        type: 'translatechange',
        value: [imageLayer.getTrans().x, imageLayer.getTrans().y],
        scale: scale,
        cx: imageLayer.getTrans().x,
        cy: imageLayer.getTrans().y
      });
    }
  }

  /**
   * Create the application layers.
   *
   * @param {number} dataWidth The width of the input data.
   * @param {number} dataHeight The height of the input data.
   * @private
   */
  function createLayers(dataWidth, dataHeight) {
    var container = self.getElement('layerContainer');
    // remove previous canvas
    var previous = container.getElementsByClassName('layer');
    if (previous) {
      for (var i = 0; i < previous.length; ++i) {
        previous[i].remove();
      }
    }
    // create new canvas
    var div0 = document.createElement('div');
    div0.id = 'layer0';
    div0.className = 'layer';
    // prepend to container
    container.prepend(div0);
    // image layer
    imageLayer = new dwv.html.ImageLayer(div0);
    imageLayer.initialise(metaData, image);
    imageLayer.display(true);

    // draw layer
    var drawDiv = self.getElement('drawDiv');
    if (drawDiv) {
      drawController = new dwv.DrawController(drawDiv);
      drawController.create(dataWidth, dataHeight);
    }
    // resize app
    self.fitToSize(self.getLayerContainerSize());

    self.resetLayout();
  }

  /**
   * Data load start callback.
   *
   * @param {object} event The load start event.
   * @private
   */
  function onloadstart(event) {
    if (event.loadtype === 'image') {
      self.reset();
    }

    /**
     * Load start event.
     *
     * @event dwv.App#loadstart
     * @type {object}
     * @property {string} type The event type: loadstart.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     */
    event.type = 'loadstart';
    fireEvent(event);
  }

  /**
   * Data load progress callback.
   *
   * @param {object} event The progress event.
   * @private
   */
  function onprogress(event) {
    /**
     * Load progress event.
     *
     * @event dwv.App#loadprogress
     * @type {object}
     * @property {string} type The event type: loadprogress.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     * @property {number} loaded The loaded percentage.
     * @property {number} total The total percentage.
     */
    event.type = 'loadprogress';
    fireEvent(event);
  }

  /**
   * Data load callback.
   *
   * @param {object} event The load event.
   * @private
   */
  function onloaditem(event) {
    // check event
    if (typeof event.data === 'undefined') {
      dwv.logger.error('Missing loaditem event data ' + event);
    }
    if (typeof event.loadtype === 'undefined') {
      dwv.logger.error('Missing loaditem event load type ' + event);
    }

    // first load flag
    var isFirstLoad = image === null;
    // number returned by image.appendSlice
    var sliceNb = null;

    var eventMetaData = null;
    if (event.loadtype === 'image') {
      if (isFirstLoad) {
        // save image
        originalImage = event.data.image;
        image = originalImage;
      } else {
        // append slice
        sliceNb = image.appendSlice(event.data.image);
      }
      updateMetaData(event.data.info);
      eventMetaData = event.data.info;
    } else if (event.loadtype === 'state') {
      var state = new dwv.State();
      state.apply(self, state.fromJSON(event.data));
      eventMetaData = 'state';
    }

    /**
     * Load item event: fired when a load item is successfull.
     *
     * @event dwv.App#loaditem
     * @type {object}
     * @property {string} type The event type: loaditem.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     * @property {object} data The loaded meta data.
     */
    fireEvent({
      type: 'loaditem',
      data: eventMetaData,
      source: event.source,
      loadtype: event.loadtype
    });

    // render if asked
    if (event.loadtype === 'image' && viewOnFirstLoadItem) {
      if (isFirstLoad) {
        self.render();
      } else {
        // update slice number if new slice was inserted before
        var controller = imageLayer.getViewController();
        var currentPosition = controller.getCurrentPosition();
        if (sliceNb <= currentPosition.k) {
          controller.setCurrentPosition({
            i: currentPosition.i,
            j: currentPosition.j,
            k: currentPosition.k + 1
          }, true);
        }
      }
    }
  }

  /**
   * Data load callback.
   *
   * @param {object} event The load event.
   * @private
   */
  function onload(event) {
    if (drawController) {
      var controller = imageLayer.getViewController();
      drawController.activateDrawLayer(
        controller.getCurrentPosition(),
        controller.getCurrentFrame()
      );
    }

    /**
     * Load event: fired when a load finishes successfully.
     *
     * @event dwv.App#load
     * @type {object}
     * @property {string} type The event type: load.
     * @property {string} loadType The load type: image or state.
     */
    event.type = 'load';
    fireEvent(event);
  }

  /**
   * Data load end callback.
   *
   * @param {object} event The load end event.
   * @private
   */
  function onloadend(event) {
    /**
     * Main load end event: fired when the load finishes,
     *   successfully or not.
     *
     * @event dwv.App#loadend
     * @type {object}
     * @property {string} type The event type: loadend.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     */
    event.type = 'loadend';
    fireEvent(event);
  }

  /**
   * Data load error callback.
   *
   * @param {object} event The error event.
   * @private
   */
  function onerror(event) {
    /**
     * Load error event.
     *
     * @event dwv.App#error
     * @type {object}
     * @property {string} type The event type: error.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     * @property {object} error The error.
     * @property {object} target The event target.
     */
    event.type = 'error';
    fireEvent(event);
  }

  /**
   * Data load abort callback.
   *
   * @param {object} event The abort event.
   * @private
   */
  function onabort(event) {
    /**
     * Load abort event.
     *
     * @event dwv.App#abort
     * @type {object}
     * @property {string} type The event type: abort.
     * @property {string} loadType The load type: image or state.
     * @property {*} source The load source: string for an url,
     *   File for a file.
     */
    event.type = 'abort';
    fireEvent(event);
  }

  /**
   * Update the stored meta data.
   *
   * @param {*} newMetaData The new meta data.
   * @private
   */
  function updateMetaData(newMetaData) {
    // store the meta data
    if (dwv.utils.isArray(newMetaData)) {
      // image file case
      // TODO merge?
      metaData = newMetaData;
    } else {
      // DICOM data case
      var newDcmMetaData = new dwv.dicom.DicomElementsWrapper(newMetaData);
      var newDcmMetaDataoObj = newDcmMetaData.dumpToObject();
      if (metaData) {
        metaData = dwv.utils.mergeObjects(
          metaData,
          newDcmMetaDataoObj,
          'InstanceNumber',
          'value');
      } else {
        metaData = newDcmMetaDataoObj;
      }
    }
  }

  /**
   * Create the image layer.
   * To be called once the DICOM data has been loaded.
   *
   * @private
   */
  function initialiseImageLayer() {

    if (!image) {
      throw new Error('No image to create the layer for.');
    }

    // layout
    var size = image.getGeometry().getSize();
    dataWidth = size.getNumberOfColumns();
    dataHeight = size.getNumberOfRows();

    createLayers(dataWidth, dataHeight);

    // local listeners
    imageLayer.addEventListener('slicechange', onSliceChange);
    imageLayer.addEventListener('framechange', onFrameChange);

    // propagate
    imageLayer.addEventListener('wlwidthchange', fireEvent);
    imageLayer.addEventListener('wlcenterchange', fireEvent);
    imageLayer.addEventListener('wlpresetadd', fireEvent);
    imageLayer.addEventListener('colourchange', fireEvent);
    imageLayer.addEventListener('positionchange', fireEvent);
    imageLayer.addEventListener('slicechange', fireEvent);
    imageLayer.addEventListener('framechange', fireEvent);

    imageLayer.addEventListener('renderstart', fireEvent);
    imageLayer.addEventListener('renderend', fireEvent);

    // initialise the toolbox
    if (toolboxController) {
      toolboxController.init(imageLayer);
    }
  }

};
