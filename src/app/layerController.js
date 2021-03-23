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
   * The layer scale.
   *
   * @private
   * @type {object}
   */
  var scale = {x: 1, y: 1};

  /**
   * The window scale.
   *
   * @private
   * @type {number}
   */
  var windowScale = 1;

  /**
   * The layer offset.
   *
   * @private
   * @type {object}
   */
  var offset = {x: 0, y: 0};

  // Image data width
  var dataWidth = 0;
  // Image data height
  var dataHeight = 0;

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
   * Get the window scale.
   *
   * @returns {number} The window scale.
   */
  this.getWindowScale = function () {
    return windowScale;
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
   * Add a layer to the list.
   *
   * @param {object} layer The layer to add.
   */
  this.addLayer = function (layer) {
    layers.push(layer);
  };

  /**
   * Empty the layer list.
   */
  this.empty = function () {
    layers = [];
  };

  /**
   * Get the active image layer.
   *
   * @returns {object} The layer.
   */
  this.getActiveViewLayer = function () {
    if (layers.length !== 0) {
      return layers[0];
    }
    return null;
  };

  /**
   * Get the active draw layer.
   *
   * @returns {object} The layer.
   */
  this.getActiveDrawLayer = function () {
    return layers[1];
  };

  /**
   * Fit the display to the size of the container.
   * To be called once the image is loaded.
   */
  this.fitToContainer = function () {
    // get container size
    var size = this.getLayerContainerSize();
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

    // resize container
    containerDiv.setAttribute(
      'style', 'width: ' + newWidth + 'px;height: ' + newHeight + 'px');

    // ratio previous/new to add to zoom
    var mul = newWidth / oldWidth;
    var newScale = scale.x * mul;
    this.resize(newWidth, newHeight, newScale);
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
    return {width: parent.offsetWidth, height: height};
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
   */
  this.initialise = function (image, metaData) {
    var size = image.getGeometry().getSize();
    dataWidth = size.getNumberOfColumns();
    dataHeight = size.getNumberOfRows();
    // set to default
    scale = {x: 1, y: 1};
    offset = {x: 0, y: 0};

    // apply to layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].initialise(image, metaData);
    }
  };

  /**
   * Reset the stage to its initial scale and no offset.
   */
  this.reset = function () {
    this.setScale({x: windowScale, y: windowScale});
    this.setOffset({x: 0, y: 0});
  };

  /**
   * Resize the layer.
   *
   * @param {number} width the layer width.
   * @param {number} height the layer height.
   * @param {number} newScale the layer scale.
   */
  this.resize = function (width, height, newScale) {
    this.setScale({x: newScale, y: newScale});
    var newSize = {x: width, y: height};
    for (var i = 0; i < layers.length; ++i) {
      layers[i].resize(newSize, scale);
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
