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

  // closure to self
  var self = this;

  // konva stage
  var konvaStage = null;
  // konva layer
  var konvaLayer;

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
   * The layer fit scale.
   *
   * @private
   * @type {object}
   */
  var fitScale = {x: 1, y: 1};

  /**
   * The base layer offset.
   *
   * @private
   * @type {object}
   */
  var baseOffset = {x: 0, y: 0};

  /**
   * The draw controller.
   *
   * @private
   * @type {object}
   */
  var drawController = null;

  /**
   * The plane helper.
   *
   * @private
   * @type {object}
   */
  var planeHelper;

  /**
   * The associated data index.
   *
   * @private
   * @type {number}
   */
  var dataIndex = null;

  /**
   * Get the associated data index.
   *
   * @returns {number} The index.
   */
  this.getDataIndex = function () {
    return dataIndex;
  };

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
   * Set the plane helper.
   *
   * @param {object} helper The helper.
   */
  this.setPlaneHelper = function (helper) {
    planeHelper = helper;
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
    var orientedNewScale = planeHelper.getOrientedXYZ(newScale);
    var fullScale = {
      x: fitScale.x * orientedNewScale.x,
      y: fitScale.y * orientedNewScale.y
    };
    konvaStage.scale(fullScale);
    // update labelss
    updateLabelScale(fullScale);
  };

  /**
   * Set the layer offset.
   *
   * @param {object} newOffset The offset as {x,y}.
   */
  this.setOffset = function (newOffset) {
    var planeNewOffset = planeHelper.getPlaneOffsetFromOffset3D(newOffset);
    konvaStage.offset({
      x: baseOffset.x + planeNewOffset.x,
      y: baseOffset.y + planeNewOffset.y
    });
  };

  /**
   * Set the base layer offset. Resets the layer offset.
   *
   * @param {object} off The offset as {x,y}.
   */
  this.setBaseOffset = function (off) {
    baseOffset = planeHelper.getPlaneOffsetFromOffset3D({
      x: off.getX(),
      y: off.getY(),
      z: off.getZ()
    });
    // reset offset
    konvaStage.offset({
      x: baseOffset.x,
      y: baseOffset.y
    });
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
   * @param {object} size The image size.
   * @param {object} spacing The image spacing.
   * @param {number} index The associated data index.
   */
  this.initialise = function (size, spacing, index) {
    // set locals
    baseSize = size;
    baseSpacing = spacing;
    dataIndex = index;

    // create stage
    konvaStage = new Konva.Stage({
      container: containerDiv,
      width: baseSize.x,
      height: baseSize.y,
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
    // update konva
    var fullSize = this.getFullSize();
    var width = Math.floor(fullSize.x * fitScale1D);
    var height = Math.floor(fullSize.y * fitScale1D);
    konvaStage.setWidth(width);
    konvaStage.setHeight(height);
    // reset scale
    this.setScale({x: 1, y: 1, z: 1});
  };

  /**
   * Enable and listen to container interaction events.
   */
  this.bindInteraction = function () {
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
   * Disable and stop listening to container interaction events.
   */
  this.unbindInteraction = function () {
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
   * Set the current position.
   *
   * @param {object} position The new position.
   */
  this.setCurrentPosition = function (position) {
    var orientedPos = planeHelper.getOrientedVector3D(position);
    this.getDrawController().activateDrawLayer(orientedPos);
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
    event.srclayerid = self.getId();
    event.dataindex = dataIndex;
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
