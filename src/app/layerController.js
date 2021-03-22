// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};

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

  this.addLayer = function (layer) {
    layers.push(layer);
  };

  this.empty = function () {
    layers = [];
  };

  this.getActiveViewLayer = function () {
    if (layers.length !== 0) {
      return layers[0];
    }
    return null;
  };
  this.getActiveDrawLayer = function () {
    return layers[1];
  };

  /**
   * Add scale to the layers.
   *
   * @param {object} scale The scale as {x,y}.
   * @param {object} center The scale center point as {x,y}.
   */
  this.addScale = function (scale, center) {
    for (var i = 0; i < layers.length; ++i) {
      layers[i].addScale(scale, center);
    }
  };

  /**
   * Add translation to the layers.
   *
   * @param {object} translation The translation as {x,y}.
   */
  this.addTranslation = function (translation) {
    for (var i = 0; i < layers.length; ++i) {
      layers[i].addTranslation(translation);
    }
  };

  /**
   * Initialise the layer: set the canvas and context
   *
   * @param {object} image The image.
   * @param {object} metaData The image meta data.
   */
  this.initialise = function (image, metaData) {
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
    for (var i = 0; i < layers.length; ++i) {
      layers[i].reset(windowScale);
    }
  };

  /**
   * Resize the layer.
   *
   * @param {number} width the layer width.
   * @param {number} height the layer height.
   * @param {number} scale the layer scale.
   */
  this.resize = function (width, height, scale) {
    for (var i = 0; i < layers.length; ++i) {
      layers[i].resize(width, height, scale);
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

}; // layerController
