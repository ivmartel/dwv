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
   * Set the layers' zoom.
   *
   * @param {object} scale The scale factor as {x,y}.
   * @param {object} center The scale center pointas {x,y}.
   */
  this.setZoom = function (scale, center) {
    for (var i = 0; i < layers.length; ++i) {
      layers[i].setZoom(scale, center);
    }
  };

  /**
   * Set the layer translation.
   * Translation is according to the last one.
   *
   * @param {object} translation The translation as {x,y}.
   */
  this.setTranslate = function (translation) {
    for (var i = 0; i < layers.length; ++i) {
      layers[i].setTranslate(translation);
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
