// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.gui = dwv.gui || {};

/**
 * The Konva namespace.
 *
 * @external Konva
 * @see https://konvajs.org/
 */
var Konva = Konva || {};

/**
 * Draw layer.
 *
 * @param {object} containerDiv The layer div.
 * @class
 */
dwv.gui.DrawLayer = function (containerDiv) {

  // specific css class name
  containerDiv.className += ' drawLayer';

  // konva stage
  var konvaStage = null;
  // konva layer
  var konvaLayer;

  /**
   * The layer size as {x,y}.
   *
   * @private
   * @type {object}
   */
  var layerSize;

  /**
   * The draw controller.
   *
   * @private
   * @type {object}
   */
  var drawController = null;

  /**
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Get the Konva stage.
   *
   * @returns {object} The stage.
   */
  this.getKonvaStage = function () {
    return konvaStage;
  };

  /**
   * Get the Konva layer.
   *
   * @returns {object} The layer.
   */
  this.getKonvaLayer = function () {
    return konvaLayer;
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
   * Get the id of the layer.
   *
   * @returns {string} The string id.
   */
  this.getId = function () {
    return containerDiv.id;
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
    return konvaStage.opacity();
  };

  /**
   * Set the layer opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   */
  this.setOpacity = function (alpha) {
    konvaStage.opacity(Math.min(Math.max(alpha, 0), 1));
  };

  /**
   * Set the layer scale.
   *
   * @param {object} newScale The scale as {x,y}.
   */
  this.setScale = function (newScale) {
    konvaStage.scale(newScale);
    // update labels
    updateLabelScale(newScale);
  };

  /**
   * Set the layer offset.
   *
   * @param {object} newOffset The offset as {x,y}.
   */
  this.setOffset = function (newOffset) {
    konvaStage.offset(newOffset);
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
    // resize stage
    konvaStage.setWidth(Math.floor(layerSize.x * newScale.x));
    konvaStage.setHeight(Math.floor(layerSize.y * newScale.y));
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
   */
  this.draw = function () {
    konvaStage.draw();
  };

  /**
   * Initialise the layer: set the canvas and context
   *
   * @param {object} image The image.
   * @param {object} _metaData The image meta data.
   */
  this.initialise = function (image, _metaData) {
    // get sizes
    var size = image.getGeometry().getSize();
    layerSize = size.get2D();

    // create stage
    konvaStage = new Konva.Stage({
      container: containerDiv,
      width: layerSize.x,
      height: layerSize.y,
      listening: false
    });
    // reset style
    // (avoids a not needed vertical scrollbar)
    konvaStage.getContent().setAttribute('style', '');

    // create layer
    konvaLayer = new Konva.Layer({
      listening: false,
      visible: true
    });
    konvaStage.add(konvaLayer);

    // create draw controller
    drawController = new dwv.ctrl.DrawController(konvaLayer);
  };

  /**
   * Update the layer position.
   *
   * @param {object} pos The new position.
   */
  this.updatePosition = function (pos) {
    this.getDrawController().activateDrawLayer(pos[0], pos[1]);
  };

  /**
   * Activate the layer: propagate events.
   */
  this.activate = function () {
    konvaStage.listening(true);
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
    konvaStage.listening(false);
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
   * Update label scale: compensate for it so
   *   that label size stays visually the same.
   *
   * @param {object} scale The scale to compensate for
   */
  function updateLabelScale(scale) {
    // same formula as in style::applyZoomScale:
    // compensate for scale and times 2 so that font 10 looks like a 10
    var ratioX = 2 / scale.x;
    var ratioY = 2 / scale.y;
    // compensate scale for labels
    var labels = konvaStage.find('Label');
    for (var i = 0; i < labels.length; ++i) {
      labels[i].scale({x: ratioX, y: ratioY});
    }
  }
}; // DrawLayer class
