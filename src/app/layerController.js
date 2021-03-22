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
 * @class
 */
dwv.LayerController = function () {

  var layers = [];

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
   * Get the layer scale.
   *
   * @returns {object} The scale as {x,y}.
   */
  this.getScale = function () {
    return scale;
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
   * Empty the lyaer list.
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
   * Add scale to the layers.
   *
   * @param {object} newScale The scale as {x,y}.
   * @param {object} center The scale center point as {x,y}.
   */
  this.addScale = function (newScale, center) {
    // store
    // center should stay the same:
    // newOffset + center / newScale = oldOffset + center / oldScale
    offset = {
      x: (center.x / scale.x) + offset.x - (center.x / newScale.x),
      y: (center.y / scale.y) + offset.y - (center.y / newScale.y)
    };
    scale = newScale;
    // apply to layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].setScale(scale);
      layers[i].setOffset(offset);
    }
  };

  /**
   * Add translation to the layers.
   *
   * @param {object} translation The translation as {x,y}.
   */
  this.addTranslation = function (translation) {
    // store
    offset = {
      x: offset.x - translation.x / scale.x,
      y: offset.y - translation.y / scale.y
    };
    // apply to layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].setOffset(offset);
    }
  };

  /**
   * Initialise the layer: set the canvas and context
   *
   * @param {object} image The image.
   * @param {object} metaData The image meta data.
   */
  this.initialise = function (image, metaData) {
    // store
    scale = {x: 1, y: 1};
    offset = {x: 0, y: 0};
    // apply to layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].initialise(image, metaData);
    }
  };

  /**
   * Reset the stage with a new window scale.
   *
   * @param {number} windowScale The window scale.
   */
  this.reset = function (windowScale) {
    // store
    scale = {x: windowScale, y: windowScale};
    offset = {x: 0, y: 0};
    // apply to layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].setScale(scale);
      layers[i].setOffset(offset);
    }
  };

  /**
   * Resize the layer.
   *
   * @param {number} width the layer width.
   * @param {number} height the layer height.
   * @param {number} windowScale the layer scale.
   */
  this.resize = function (width, height, windowScale) {
    var newSize = {x: width, y: height};
    scale = {x: windowScale, y: windowScale};
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
