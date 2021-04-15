// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};
dwv.html = dwv.html || {};

dwv.gui.interactionEventNames = [
  'mousedown',
  'mousemove',
  'mouseup',
  'mouseout',
  'mousewheel',
  'DOMMouseScroll',
  'dblclick',
  'touchstart',
  'touchmove',
  'touchend'
];

/**
 * Layer controller.
 *
 * @param {object} containerDiv The layer div.
 * @class
 */
dwv.LayerController = function (containerDiv) {

  var layers = [];

  /**
   * The layer scale as {x,y}.
   *
   * @private
   * @type {object}
   */
  var scale = {x: 1, y: 1};

  /**
   * The base scale as {x,y}: all posterior scale will be on top of this one.
   *
   * @private
   * @type {object}
   */
  var baseScale = {x: 1, y: 1};

  /**
   * The layer offset as {x,y}.
   *
   * @private
   * @type {object}
   */
  var offset = {x: 0, y: 0};

  /**
   * The layer size as {x,y}.
   *
   * @private
   * @type {object}
   */
  var layerSize;

  /**
   * Active view layer index.
   *
   * @private
   * @type {number}
   */
  var activeViewLayerIndex = null;

  /**
   * Active draw layer index.
   *
   * @private
   * @type {number}
   */
  var activeDrawLayerIndex = null;

  /**
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Get the layer scale.
   *
   * @returns {object} The scale as {x,y}.
   */
  this.getScale = function () {
    return scale;
  };

  /**
   * Get the base scale.
   *
   * @returns {object} The scale as {x,y}.
   */
  this.getBaseScale = function () {
    return baseScale;
  };

  /**
   * Get the added scale: the scale added to the base scale
   *
   * @returns {object} The scale as {x,y}.
   */
  this.getAddedScale = function () {
    return {
      x: scale.x / baseScale.x,
      y: scale.y / baseScale.y
    };
  };

  /**
   * Get the layer offset.
   *
   * @returns {object} The offset as {x,y}.
   */
  this.getOffset = function () {
    return offset;
  };

  /**
   * Transform a display position to an index.
   *
   * @param {dwv.Math.Point2D} point2D The point to convert.
   * @returns {object} The equivalent index.
   */
  this.displayToIndex = function (point2D) {
    return {
      x: point2D.x / scale.x + offset.x,
      y: point2D.y / scale.y + offset.y
    };
  };

  /**
   * Get the number of layers handled by this class.
   *
   * @returns {number} The number of layers.
   */
  this.getNumberOfLayers = function () {
    return layers.length;
  };

  /**
   * Set the active view layer.
   *
   * @param {number} index The index of the layer to set as active.
   */
  this.setActiveViewLayer = function (index) {
    activeViewLayerIndex = index;
  };

  /**
   * Set the active draw layer.
   *
   * @param {number} index The index of the layer to set as active.
   */
  this.setActiveDrawLayer = function (index) {
    activeDrawLayerIndex = index;
  };

  /**
   * Add a view layer.
   *
   * @returns {object} The created layer.
   */
  this.addViewLayer = function () {
    // store active index
    activeViewLayerIndex = layers.length;
    // create div
    var div = getNextLayerDiv();
    // prepend to container
    containerDiv.append(div);
    // view layer
    var layer = new dwv.html.ViewLayer(div);
    // set z-index: last on top
    layer.setZIndex(activeViewLayerIndex);
    // add layer
    layers.push(layer);
    // return
    return layer;
  };

  /**
   * Add a draw layer.
   *
   * @returns {object} The created layer.
   */
  this.addDrawLayer = function () {
    // store active index
    activeDrawLayerIndex = layers.length;
    // create div
    var div = getNextLayerDiv();
    // prepend to container
    containerDiv.append(div);
    // draw layer
    var layer = new dwv.html.DrawLayer(div);
    // set z-index: above view + last on top
    layer.setZIndex(50 + activeDrawLayerIndex);
    // add layer
    layers.push(layer);
    // return
    return layer;
  };

  /**
   * Get the next layer DOM div.
   *
   * @returns {object} A DOM div.
   */
  function getNextLayerDiv() {
    var div = document.createElement('div');
    div.id = 'layer' + layers.length;
    div.className = 'layer';
    div.style.pointerEvents = 'none';
    return div;
  }

  /**
   * Empty the layer list.
   */
  this.empty = function () {
    layers = [];
    // reset active indices
    activeViewLayerIndex = null;
    activeDrawLayerIndex = null;
    // clean container div
    var previous = containerDiv.getElementsByClassName('layer');
    if (previous) {
      while (previous.length > 0) {
        previous[0].remove();
      }
    }
  };

  /**
   * Get the active image layer.
   *
   * @returns {object} The layer.
   */
  this.getActiveViewLayer = function () {
    return layers[activeViewLayerIndex];
  };

  /**
   * Get the active draw layer.
   *
   * @returns {object} The layer.
   */
  this.getActiveDrawLayer = function () {
    return layers[activeDrawLayerIndex];
  };

  /**
   * Update draw controller to view position.
   */
  this.updateDrawControllerToViewPosition = function () {
    var drawLayer = layers[activeDrawLayerIndex];
    if (drawLayer) {
      var viewController =
        layers[activeViewLayerIndex].getViewController();
      drawLayer.getDrawController().activateDrawLayer(
        viewController.getCurrentPosition());
    }
  };

  /**
   * Get the fit to container scale.
   * To be called once the image is loaded.
   *
   * @returns {number} The scale.
   */
  this.getFitToContainerScale = function () {
    // get container size
    var size = this.getLayerContainerSize();
    // best fit
    return Math.min(
      (size.x / layerSize.x),
      (size.y / layerSize.y)
    );
  };

  /**
   * Fit the display to the size of the container.
   * To be called once the image is loaded.
   */
  this.fitToContainer = function () {
    var fitScale = this.getFitToContainerScale();
    this.resize({x: fitScale, y: fitScale});
  };

  /**
   * Get the size available for the layer container div.
   *
   * @returns {object} The available width and height as {width,height}.
   */
  this.getLayerContainerSize = function () {
    var parent = containerDiv.parentNode;
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
    return {x: parent.offsetWidth, y: height};
  };

  /**
   * Add scale to the layers. Scale cannot go lower than 0.1.
   *
   * @param {object} scaleStep The scale to add.
   * @param {object} center The scale center point as {x,y}.
   */
  this.addScale = function (scaleStep, center) {
    var newScale = {
      x: Math.max(scale.x + scaleStep, 0.1),
      y: Math.max(scale.y + scaleStep, 0.1)
    };
    // center should stay the same:
    // newOffset + center / newScale = oldOffset + center / oldScale
    this.setOffset({
      x: (center.x / scale.x) + offset.x - (center.x / newScale.x),
      y: (center.y / scale.y) + offset.y - (center.y / newScale.y)
    });
    this.setScale(newScale);
  };

  /**
   * Set the layers' scale.
   *
   * @param {object} newScale The scale to apply as {x,y}.
   * @fires dwv.LayerController#zoomchange
   */
  this.setScale = function (newScale) {
    scale = newScale;
    // apply to layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].setScale(scale);
    }

    /**
     * Zoom change event.
     *
     * @event dwv.LayerController#zoomchange
     * @type {object}
     * @property {Array} value The changed value.
     */
    fireEvent({
      type: 'zoomchange',
      value: [scale.x, scale.y],
    });
  };

  /**
   * Add translation to the layers.
   *
   * @param {object} translation The translation as {x,y}.
   */
  this.addTranslation = function (translation) {
    this.setOffset({
      x: offset.x - translation.x / scale.x,
      y: offset.y - translation.y / scale.y
    });
  };

  /**
   * Set the layers' offset.
   *
   * @param {object} newOffset The offset as {x,y}.
   * @fires dwv.LayerController#offsetchange
   */
  this.setOffset = function (newOffset) {
    // store
    offset = newOffset;
    // apply to layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].setOffset(offset);
    }

    /**
     * Offset change event.
     *
     * @event dwv.LayerController#offsetchange
     * @type {object}
     * @property {Array} value The changed value.
     */
    fireEvent({
      type: 'offsetchange',
      value: [offset.x, offset.y],
    });
  };

  /**
   * Initialise the layer: set the canvas and context
   *
   * @param {object} image The image.
   * @param {object} metaData The image meta data.
   * @param {number} dataIndex The data index.
   */
  this.initialise = function (image, metaData, dataIndex) {
    var size = image.getGeometry().getSize();
    layerSize = {
      x: size.getNumberOfColumns(),
      y: size.getNumberOfRows()
    };
    // apply to layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].initialise(image, metaData, dataIndex);
    }

    // bind draw to view position
    var viewLayer = this.getActiveViewLayer();
    viewLayer.addEventListener(
      'positionchange', this.updateDrawControllerToViewPosition);
    // first update
    this.updateDrawControllerToViewPosition();

    // fit data
    this.fitToContainer();
  };

  /**
   * Reset the stage to its initial scale and no offset.
   */
  this.reset = function () {
    this.setScale(baseScale);
    this.setOffset({x: 0, y: 0});
  };

  /**
   * Resize the layer: update the base scale and layer sizes.
   *
   * @param {number} newScale The scale as {x,y}.
   */
  this.resize = function (newScale) {
    // store
    scale = {
      x: scale.x * newScale.x / baseScale.x,
      y: scale.y * newScale.y / baseScale.y
    };
    baseScale = newScale;

    // resize container
    var width = parseInt(layerSize.x * baseScale.x, 10);
    var height = parseInt(layerSize.y * baseScale.y, 10);
    containerDiv.style.width = width + 'px';
    containerDiv.style.height = height + 'px';

    // call resize and scale on layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].resize(baseScale);
      layers[i].setScale(scale);
    }
  };

  /**
   * Draw the layer.
   */
  this.draw = function () {
    for (var i = 0; i < layers.length; ++i) {
      layers[i].draw();
    }
  };

  /**
   * Display the layer.
   *
   * @param {boolean} flag Whether to display the layer or not.
   */
  this.display = function (flag) {
    for (var i = 0; i < layers.length; ++i) {
      layers[i].display(flag);
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

}; // LayerController class

/**
 * Get the positions (without the parent offset) of a list of touch events.
 *
 * @param {Array} touches The list of touch events.
 * @returns {Array} The list of positions of the touch events.
 */
dwv.html.getTouchesPositions = function (touches) {
  // get the touch offset from all its parents
  var offsetLeft = 0;
  var offsetTop = 0;
  if (touches.length !== 0 &&
    typeof touches[0].target !== 'undefined') {
    var offsetParent = touches[0].target.offsetParent;
    while (offsetParent) {
      if (!isNaN(offsetParent.offsetLeft)) {
        offsetLeft += offsetParent.offsetLeft;
      }
      if (!isNaN(offsetParent.offsetTop)) {
        offsetTop += offsetParent.offsetTop;
      }
      offsetParent = offsetParent.offsetParent;
    }
  } else {
    dwv.logger.debug('No touch target offset parent.');
  }
  // set its position
  var positions = [];
  for (var i = 0; i < touches.length; ++i) {
    positions.push({
      x: touches[i].pageX - offsetLeft,
      y: touches[i].pageY - offsetTop
    });
  }
  return positions;
};

/**
 * Get the offset of an input event.
 *
 * @param {object} event The event to get the offset from.
 * @returns {Array} The array of offsets.
 */
dwv.html.getEventOffset = function (event) {
  var positions = [];
  if (typeof event.targetTouches !== 'undefined' &&
    event.targetTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/targetTouches
    positions = dwv.html.getTouchesPositions(event.targetTouches);
  } else if (typeof event.changedTouches !== 'undefined' &&
      event.changedTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/changedTouches
    positions = dwv.html.getTouchesPositions(event.changedTouches);
  } else {
    // layerX is used by Firefox
    var ex = event.offsetX === undefined ? event.layerX : event.offsetX;
    var ey = event.offsetY === undefined ? event.layerY : event.offsetY;
    positions.push({x: ex, y: ey});
  }
  return positions;
};
