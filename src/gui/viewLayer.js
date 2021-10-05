// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};

/**
 * View layer.
 *
 * @param {object} containerDiv The layer div.
 * @class
 */
dwv.gui.ViewLayer = function (containerDiv) {

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
   * The main display canvas.
   *
   * @private
   * @type {object}
   */
  var canvas = null;
  /**
   * The offscreen canvas: used to store the raw, unscaled pixel data.
   *
   * @private
   * @type {object}
   */
  var offscreenCanvas = null;
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
   * The layer base size as {x,y}.
   *
   * @private
   * @type {object}
   */
  var baseSize;

  /**
   * The layer base spacing as {x,y}.
   *
   * @private
   * @type {object}
   */
  var baseSpacing;

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
   * The layer fit scale.
   *
   * @private
   * @type {object}
   */
  var fitScale = {x: 1, y: 1};

  /**
   * The layer offset.
   *
   * @private
   * @type {object}
   */
  var offset = {x: 0, y: 0};

  /**
   * The base layer offset.
   *
   * @private
   * @type {object}
   */
  var baseOffset = {x: 0, y: 0};

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
   * Set the associated view.
   *
   * @param {object} inputView The view.
   */
  this.setView = function (inputView) {
    view = inputView;
    // local listeners
    view.addEventListener('wlchange', onWLChange);
    view.addEventListener('colourchange', onColourChange);
    view.addEventListener('positionchange', onPositionChange);
    // create view controller
    viewController = new dwv.ctrl.ViewController(view);
  };

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
      viewController.setImage(event.value[1]);
      needsDataUpdate = true;
    }
  };

  // common layer methods [start] ---------------

  /**
   * Get the id of the layer.
   *
   * @returns {string} The string id.
   */
  this.getId = function () {
    return containerDiv.id;
  };

  /**
   * Get the data full size.
   *
   * @returns {object} The full size as {x,y}
   */
  this.getFullSize = function () {
    return {
      x: baseSize.x * baseSpacing.x,
      y: baseSize.y * baseSpacing.y
    };
  };

  /**
   * Get the layer base size (without scale).
   *
   * @returns {object} The size as {x,y}.
   */
  this.getBaseSize = function () {
    return baseSize;
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

    /**
     * Opacity change event.
     *
     * @event dwv.App#opacitychange
     * @type {object}
     * @property {string} type The event type.
     */
    var event = {
      type: 'opacitychange',
      value: [opacity]
    };
    fireEvent(event);
  };

  /**
   * Set the layer scale.
   *
   * @param {object} newScale The scale as {x,y}.
   */
  this.setScale = function (newScale) {
    var helper = viewController.getPlaneHelper();
    var orientedNewScale = helper.getOrientedXYZ(newScale);
    scale = {
      x: fitScale.x * orientedNewScale.x,
      y: fitScale.y * orientedNewScale.y
    };
  };

  /**
   * Set the base layer offset. Resets the layer offset.
   *
   * @param {object} off The offset as {x,y}.
   */
  this.setBaseOffset = function (off) {
    var helper = viewController.getPlaneHelper();
    baseOffset = helper.getPlaneOffsetFromOffset3D({
      x: off.getX(),
      y: off.getY(),
      z: off.getZ()
    });
    // reset offset
    offset = baseOffset;
  };

  /**
   * Set the layer offset.
   *
   * @param {object} newOffset The offset as {x,y}.
   */
  this.setOffset = function (newOffset) {
    var helper = viewController.getPlaneHelper();
    var planeNewOffset = helper.getPlaneOffsetFromOffset3D(newOffset);
    offset = {
      x: baseOffset.x + planeNewOffset.x,
      y: baseOffset.y + planeNewOffset.y
    };
  };

  /**
   * Transform a display position to an index.
   *
   * @param {number} x The X position.
   * @param {number} y The Y position.
   * @returns {object} The equivalent index.
   */
  this.displayToPlaneIndex = function (x, y) {
    var planePos = this.displayToPlanePos(x, y);
    return new dwv.math.Index([
      Math.floor(planePos.x),
      Math.floor(planePos.y)
    ]);
  };

  this.displayToPlaneScale = function (x, y) {
    return {
      x: x / scale.x,
      y: y / scale.y
    };
  };

  this.displayToPlanePos = function (x, y) {
    var deScaled = this.displayToPlaneScale(x, y);
    return {
      x: deScaled.x + offset.x,
      y: deScaled.y + offset.y
    };
  };

  /**
   * Activate the layer.
   *
   * @param {boolean} flag True to activate the layer.
   */
  this.setActive = function (flag) {
    containerDiv.style['pointer-events'] = flag ? 'auto' : 'none';
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
    var event = {
      type: 'renderstart',
      layerid: this.getId()
    };
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
    context.drawImage(offscreenCanvas, 0, 0);

    /**
     * Render end event.
     *
     * @event dwv.App#renderend
     * @type {object}
     * @property {string} type The event type.
     */
    event = {
      type: 'renderend',
      layerid: this.getId()
    };
    fireEvent(event);
  };

  /**
   * Initialise the layer: set the canvas and context
   *
   * @param {object} size The image size.
   * @param {object} spacing The image spacing.
   * @param {number} index The associated data index.
   */
  this.initialise = function (size, spacing, index) {
    // set locals
    baseSize = size;
    baseSpacing = spacing;
    dataIndex = index;

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

    // check canvas
    if (!dwv.gui.canCreateCanvas(baseSize.x, baseSize.y)) {
      throw new Error('Cannot create canvas ' + baseSize.x + ', ' + baseSize.y);
    }

    // canvas sizes
    canvas.width = baseSize.x;
    canvas.height = baseSize.y;
    // off screen canvas
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = baseSize.x;
    offscreenCanvas.height = baseSize.y;
    // original empty image data array
    context.clearRect(0, 0, baseSize.x, baseSize.y);
    imageData = context.createImageData(baseSize.x, baseSize.y);

    // update data on first draw
    needsDataUpdate = true;
  };

  /**
   * Fit the layer to its parent container.
   *
   * @param {number} fitScale1D The 1D fit scale.
   */
  this.fitToContainer = function (fitScale1D) {
    // update fit scale
    fitScale = {
      x: fitScale1D * baseSpacing.x,
      y: fitScale1D * baseSpacing.y
    };
    // update canvas
    var width = containerDiv.parentElement.offsetWidth;
    var height = containerDiv.parentElement.offsetHeight;
    if (!dwv.gui.canCreateCanvas(width, height)) {
      throw new Error('Cannot resize canvas ' + width + ', ' + height);
    }
    canvas.width = width;
    canvas.height = height;
    // reset scale
    this.setScale({x: 1, y: 1, z: 1});
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
    if (!view) {
      return;
    }
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
    viewController.generateImageData(imageData);
    // pass the data to the off screen canvas
    offscreenCanvas.getContext('2d').putImageData(imageData, 0, 0);
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
      if (event.diffDims.includes(viewController.getScrollIndex())) {
        needsDataUpdate = true;
        self.draw();
      }
    }
  }

  /**
   * Set the current position.
   *
   * @param {Array} value The position change values: [index, point]
   */
  this.setCurrentPosition = function (value) {
    viewController.setCurrentPosition(new dwv.math.Point3D(
      value[1][0], value[1][1], value[1][2]));
  };

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
   * @param {dwv.gui.ViewLayer} rhs The layer to align on.
   */
  this.align = function (rhs) {
    canvas.style.top = rhs.getCanvas().offsetTop;
    canvas.style.left = rhs.getCanvas().offsetLeft;
  };

}; // ViewLayer class
