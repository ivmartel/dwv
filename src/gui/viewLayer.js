// namespaces
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * View layer.
 *
 * @param {object} containerDiv The layer div.
 * @class
 */
dwv.html.ViewLayer = function (containerDiv) {

  // specific css class name
  containerDiv.className += ' viewLayer';

  // closure to self
  var self = this;

  /**
   * The image view.
   *
   * @private
   * @type {object}
   */
  var view = null;
  /**
   * The view controller.
   *
   * @private
   * @type {object}
   */
  var viewController = null;

  /**
   * The base canvas.
   *
   * @private
   * @type {object}
   */
  var canvas = null;
  /**
   * A cache of the initial canvas.
   *
   * @private
   * @type {object}
   */
  var cacheCanvas = null;
  /**
   * The associated CanvasRenderingContext2D.
   *
   * @private
   * @type {object}
   */
  var context = null;

  /**
   * The image data array.
   *
   * @private
   * @type {Array}
   */
  var imageData = null;

  /**
   * The layer size as {x,y}.
   *
   * @private
   * @type {object}
   */
  var layerSize;

  /**
   * The layer opacity.
   *
   * @private
   * @type {number}
   */
  var opacity = 1;

  /**
   * The layer scale.
   *
   * @private
   * @type {object}
   */
  var scale = {x: 1, y: 1};

  /**
   * The layer offset.
   *
   * @private
   * @type {object}
   */
  var offset = {x: 0, y: 0};

  /**
   * Data update flag.
   *
   * @private
   * @type {boolean}
   */
  var needsDataUpdate = null;

  /**
   * The associated data index.
   *
   * @private
   * @type {number}
   */
  var dataIndex = null;

  /**
   * Listener handler.
   *
   * @private
   * @type {object}
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Get the view controller.
   *
   * @returns {object} The controller.
   */
  this.getViewController = function () {
    return viewController;
  };

  /**
   * Get the canvas image data.
   *
   * @returns {object} The image data.
   */
  this.getImageData = function () {
    return imageData;
  };

  /**
   * Handle an image change event.
   *
   * @param {object} event The event.
   */
  this.onimagechange = function (event) {
    // event.value = [index, image]
    if (dataIndex === event.value[0]) {
      view.setImage(event.value[1]);
      needsDataUpdate = true;
    }
  };

  // common layer methods [start] ---------------

  /**
   * Get the layer size.
   *
   * @returns {object} The size as {x,y}.
   */
  this.getSize = function () {
    return layerSize;
  };

  /**
   * Get the layer opacity.
   *
   * @returns {number} The opacity ([0:1] range).
   */
  this.getOpacity = function () {
    return opacity;
  };

  /**
   * Set the layer opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   */
  this.setOpacity = function (alpha) {
    opacity = Math.min(Math.max(alpha, 0), 1);
  };

  /**
   * Set the layer scale.
   *
   * @param {object} newScale The scale as {x,y}.
   */
  this.setScale = function (newScale) {
    scale = newScale;
  };

  /**
   * Set the layer offset.
   *
   * @param {object} newOffset The offset as {x,y}.
   */
  this.setOffset = function (newOffset) {
    offset = newOffset;
  };

  /**
   * Set the layer z-index.
   *
   * @param {number} index The index.
   */
  this.setZIndex = function (index) {
    containerDiv.style.zIndex = index;
  };

  /**
   * Resize the layer: update the window scale and layer sizes.
   *
   * @param {object} newScale The layer scale as {x,y}.
   */
  this.resize = function (newScale) {
    // resize canvas
    canvas.width = parseInt(layerSize.x * newScale.x, 10);
    canvas.height = parseInt(layerSize.y * newScale.y, 10);
    // set scale
    this.setScale(newScale);
  };

  /**
   * Display the layer.
   *
   * @param {boolean} flag Whether to display the layer or not.
   */
  this.display = function (flag) {
    containerDiv.style.display = flag ? '' : 'none';
  };

  /**
   * Check if the layer is visible.
   *
   * @returns {boolean} True if the layer is visible.
   */
  this.isVisible = function () {
    return containerDiv.style.display === '';
  };

  /**
   * Draw the content (imageData) of the layer.
   * The imageData variable needs to be set
   *
   * @fires dwv.App#renderstart
   * @fires dwv.App#renderend
   */
  this.draw = function () {
    /**
     * Render start event.
     *
     * @event dwv.App#renderstart
     * @type {object}
     * @property {string} type The event type.
     */
    var event = {type: 'renderstart'};
    fireEvent(event);

    // update data if needed
    if (needsDataUpdate) {
      updateImageData();
    }

    // context opacity
    context.globalAlpha = opacity;

    // clear the context: reset the transform first
    // store the current transformation matrix
    context.save();
    // use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // restore the transform
    context.restore();

    // draw the cached canvas on the context
    // transform takes as input a, b, c, d, e, f to create
    // the transform matrix (column-major order):
    // [ a c e ]
    // [ b d f ]
    // [ 0 0 1 ]
    context.setTransform(
      scale.x,
      0,
      0,
      scale.y,
      -1 * offset.x * scale.x,
      -1 * offset.y * scale.y
    );

    // disable smoothing (set just before draw, could be reset by resize)
    context.imageSmoothingEnabled = false;
    // draw image
    context.drawImage(cacheCanvas, 0, 0);

    /**
     * Render end event.
     *
     * @event dwv.App#renderend
     * @type {object}
     * @property {string} type The event type.
     */
    event = {type: 'renderend'};
    fireEvent(event);
  };

  /**
   * Initialise the layer: set the canvas and context
   *
   * @param {object} image The image.
   * @param {object} metaData The image meta data.
   * @param {number} index The associated data index.
   */
  this.initialise = function (image, metaData, index) {
    dataIndex = index;
    // create view
    var viewFactory = new dwv.image.ViewFactory();
    view = viewFactory.create(
      new dwv.dicom.DicomElementsWrapper(metaData),
      image);

    // local listeners
    view.addEventListener('wlwidthchange', onWLChange);
    view.addEventListener('wlcenterchange', onWLChange);
    view.addEventListener('colourchange', onColourChange);
    view.addEventListener('positionchange', onPositionChange);

    // create view controller
    viewController = new dwv.ViewController(view);

    // get sizes
    var size = image.getGeometry().getSize();
    layerSize = size.get2D();

    // create canvas
    canvas = document.createElement('canvas');
    containerDiv.appendChild(canvas);

    // check that the getContext method exists
    if (!canvas.getContext) {
      alert('Error: no canvas.getContext method.');
      return;
    }
    // get the 2D context
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to get the 2D context.');
      return;
    }
    // canvas sizes
    canvas.width = layerSize.x;
    canvas.height = layerSize.y;
    // original empty image data array
    context.clearRect(0, 0, canvas.width, canvas.height);
    imageData = context.createImageData(canvas.width, canvas.height);
    // cached canvas
    cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = canvas.width;
    cacheCanvas.height = canvas.height;

    // update data on first draw
    needsDataUpdate = true;
  };

  /**
   * Activate the layer: propagate events.
   */
  this.activate = function () {
    // allow pointer events
    containerDiv.style.pointerEvents = 'auto';
    // interaction events
    var names = dwv.gui.interactionEventNames;
    for (var i = 0; i < names.length; ++i) {
      containerDiv.addEventListener(names[i], fireEvent);
    }
  };

  /**
   * Deactivate the layer: stop propagating events.
   */
  this.deactivate = function () {
    // disable pointer events
    containerDiv.style.pointerEvents = 'none';
    // interaction events
    var names = dwv.gui.interactionEventNames;
    for (var i = 0; i < names.length; ++i) {
      containerDiv.removeEventListener(names[i], fireEvent);
    }
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

  // common layer methods [end] ---------------

  /**
   * Propagate (or not) view events.
   *
   * @param {boolean} flag True to propagate.
   */
  this.propagateViewEvents = function (flag) {
    // view events
    for (var j = 0; j < dwv.image.viewEventNames.length; ++j) {
      if (flag) {
        view.addEventListener(dwv.image.viewEventNames[j], fireEvent);
      } else {
        view.removeEventListener(dwv.image.viewEventNames[j], fireEvent);
      }
    }
  };

  /**
   * Update the canvas image data.
   */
  function updateImageData() {
    // generate image data
    view.generateImageData(imageData);
    // pass the data to the canvas
    cacheCanvas.getContext('2d').putImageData(imageData, 0, 0);
    // update data flag
    needsDataUpdate = false;
  }

  /**
   * Handle window/level change.
   *
   * @param {object} event The event fired when changing the window/level.
   * @private
   */
  function onWLChange(event) {
    // generate and draw if no skip flag
    if (typeof event.skipGenerate === 'undefined' ||
      event.skipGenerate === false) {
      needsDataUpdate = true;
      self.draw();
    }
  }

  /**
   * Handle colour map change.
   *
   * @param {object} _event The event fired when changing the colour map.
   * @private
   */
  function onColourChange(_event) {
    needsDataUpdate = true;
    self.draw();
  }

  /**
   * Handle position change.
   *
   * @param {object} event The event fired when changing the position.
   * @private
   */
  function onPositionChange(event) {
    if (typeof event.skipGenerate === 'undefined' ||
      event.skipGenerate === false) {
      if (event.diffDims.includes(2) || event.diffDims.includes(3)) {
        needsDataUpdate = true;
        self.draw();
      }
    }
  }

  /**
   * Clear the context and reset the image data.
   */
  this.clear = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    this.resetLayout();
  };

  /**
   * Align on another layer.
   *
   * @param {dwv.html.ViewLayer} rhs The layer to align on.
   */
  this.align = function (rhs) {
    canvas.style.top = rhs.getCanvas().offsetTop;
    canvas.style.left = rhs.getCanvas().offsetLeft;
  };

}; // ViewLayer class
