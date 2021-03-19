// namespaces
var dwv = dwv || {};
dwv.html = dwv.html || {};

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
dwv.html.DrawLayer = function (containerDiv) {

  containerDiv.className += ' drawLayer';

  // konva stage
  var konvaStage = null;
  // konva layer
  var konvaLayer;
  // initial stage width
  var stageWidth;
  // initial stage height
  var stageHeight;

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

  // common layer methods [start] ---------------

  /**
   * Get the initial stage size.
   *
   * @returns {object} The size as {x,y}.
   */
  this.getInitialSize = function () {
    return {
      x: stageWidth,
      y: stageHeight
    };
  };

  /**
   * Set the layer opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   */
  this.setOpacity = function (alpha) {
    konvaStage.opacity(alpha);
  };

  /**
   * Zoom the layer.
   *
   * @param {object} scale The scale factor as {x,y}.
   * @param {object} center The scale center pointas {x,y}.
   */
  this.setZoom = function (scale, center) {
    // TODO different from the imageLayer offset?
    var oldScale = konvaStage.scale();
    var oldOffset = konvaStage.offset();
    var newOffsetX = (center.x / oldScale.x) +
      oldOffset.x - (center.x / scale.x);
    var newOffsetY = (center.y / oldScale.y) +
      oldOffset.y - (center.y / scale.y);
    var newOffset = {x: newOffsetX, y: newOffsetY};
    // store
    konvaStage.offset(newOffset);
    konvaStage.scale(scale);
    updateLabelScale(scale);
  };

  /**
   * Set the layer translation.
   *
   * @param {object} translation The translation as {x,y}.
   */
  this.setTranslate = function (translation) {
    konvaStage.offset(translation);
  };

  /**
   * Resize the layer.
   *
   * @param {number} width the layer width.
   * @param {number} height the layer height.
   * @param {number} scale the layer scale.
   */
  this.resize = function (width, height, scale) {
    var newScale = {x: scale, y: scale};
    // resize div
    containerDiv.setAttribute('style',
      'width:' + width + 'px;height:' + height + 'px');
    // resize stage
    konvaStage.setWidth(width);
    konvaStage.setHeight(height);
    konvaStage.scale(newScale);
    updateLabelScale(newScale);
  };

  /**
   * Reset the stage with a new window scale.
   *
   * @param {number} windowScale The window scale.
   */
  this.reset = function (windowScale) {
    var scale = {x: windowScale, y: windowScale};
    konvaStage.offset({x: 0, y: 0});
    konvaStage.scale(scale);
    updateLabelScale(scale);
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
    stageWidth = size.getNumberOfColumns();
    stageHeight = size.getNumberOfRows();

    // create stage
    konvaStage = new Konva.Stage({
      container: containerDiv,
      width: stageWidth,
      height: stageHeight,
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
    drawController = new dwv.DrawController(konvaLayer);
  };

  /**
   * Activate the layer: propagate interaction events.
   */
  this.activate = function () {
    konvaStage.listening(true);
    // allow pointer events
    containerDiv.setAttribute('style', 'pointer-events: auto;');
    // interaction events
    var names = dwv.gui.interactionEventNames;
    //var canvas = konvaStage.getContent();
    for (var i = 0; i < names.length; ++i) {
      containerDiv.addEventListener(names[i], fireEvent);
    }
  };

  /**
   * Deactivate the layer: stop propagating interaction events.
   */
  this.deactivate = function () {
    konvaStage.listening(false);
    // disable pointer events
    containerDiv.setAttribute('style', 'pointer-events: none;');
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
