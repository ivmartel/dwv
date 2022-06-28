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
 * @param {HTMLElement} containerDiv The layer div, its id will be used
 *   as this layer id.
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
   * The view offset.
   *
   * @private
   * @type {object}
   */
  var viewOffset = {x: 0, y: 0};

  /**
   * The zoom offset.
   *
   * @private
   * @type {object}
   */
  var zoomOffset = {x: 0, y: 0};

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
   * @param {dwv.math.Point3D} center The scale center.
   */
  this.setScale = function (newScale, center) {
    var orientedNewScale = planeHelper.getTargetOrientedXYZ(newScale);
    var finalNewScale = {
      x: fitScale.x * orientedNewScale.x,
      y: fitScale.y * orientedNewScale.y
    };

    var offset = konvaStage.offset();

    if (newScale.x === 1 &&
      newScale.y === 1 &&
      newScale.z === 1) {
      // reset zoom offset for scale=1
      var resetOffset = {
        x: offset.x - zoomOffset.x,
        y: offset.y - zoomOffset.y
      };
      // store new offset
      zoomOffset = {x: 0, y: 0};
      konvaStage.offset(resetOffset);
    } else {
      if (typeof center !== 'undefined') {
        var worldCenter = planeHelper.getPlaneOffsetFromOffset3D({
          x: center.getX(),
          y: center.getY(),
          z: center.getZ()
        });
        // center was obtained with viewLayer.displayToPlanePosNoBase
        // compensated for baseOffset
        // TODO: justify...
        worldCenter = {
          x: worldCenter.x + baseOffset.x,
          y: worldCenter.y + baseOffset.y
        };

        var newOffset = dwv.gui.getScaledOffset(
          offset, konvaStage.scale(), finalNewScale, worldCenter);

        var newZoomOffset = {
          x: zoomOffset.x + newOffset.x - offset.x,
          y: zoomOffset.y + newOffset.y - offset.y
        };
        // store new offset
        zoomOffset = newZoomOffset;
        konvaStage.offset(newOffset);
      }
    }

    konvaStage.scale(finalNewScale);
    // update labels
    updateLabelScale(finalNewScale);
  };

  /**
   * Set the layer offset.
   *
   * @param {object} newOffset The offset as {x,y}.
   */
  this.setOffset = function (newOffset) {
    var planeNewOffset = planeHelper.getPlaneOffsetFromOffset3D(newOffset);
    konvaStage.offset({
      x: viewOffset.x + baseOffset.x + zoomOffset.x + planeNewOffset.x,
      y: viewOffset.y + baseOffset.y + zoomOffset.y + planeNewOffset.y
    });
  };

  /**
   * Set the base layer offset. Updates the layer offset.
   *
   * @param {dwv.math.Vector3D} scrollOffset The scroll offset vector.
   * @param {dwv.math.Vector3D} planeOffset The plane offset vector.
   * @returns {boolean} True if the offset was updated.
   */
  this.setBaseOffset = function (scrollOffset, planeOffset) {
    var scrollIndex = planeHelper.getNativeScrollIndex();
    var newOffset = planeHelper.getPlaneOffsetFromOffset3D({
      x: scrollIndex === 0 ? scrollOffset.getX() : planeOffset.getX(),
      y: scrollIndex === 1 ? scrollOffset.getY() : planeOffset.getY(),
      z: scrollIndex === 2 ? scrollOffset.getZ() : planeOffset.getZ(),
    });
    var needsUpdate = baseOffset.x !== newOffset.x ||
      baseOffset.y !== newOffset.y;
    // reset offset if needed
    if (needsUpdate) {
      var offset = konvaStage.offset();
      konvaStage.offset({
        x: offset.x - baseOffset.x + newOffset.x,
        y: offset.y - baseOffset.y + newOffset.y
      });
      baseOffset = newOffset;
    }
    return needsUpdate;
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
   * @param {object} size The image size as {x,y}.
   * @param {object} spacing The image spacing as {x,y}.
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
   * @param {object} fitSize The fit size as {x,y}.
   * @param {object} fitOffset The fit offset as {x,y}.
   */
  this.fitToContainer = function (fitScale1D, fitSize, fitOffset) {
    // update konva
    konvaStage.setWidth(fitSize.x);
    konvaStage.setHeight(fitSize.y);

    // previous scale without fit
    var previousScale = {
      x: konvaStage.scale().x / fitScale.x,
      y: konvaStage.scale().y / fitScale.y
    };
    // update fit scale
    fitScale = {
      x: fitScale1D * baseSpacing.x,
      y: fitScale1D * baseSpacing.y
    };
    // update scale
    konvaStage.scale({
      x: previousScale.x * fitScale.x,
      y: previousScale.y * fitScale.y
    });

    // update offsets
    viewOffset = {
      x: fitOffset.x / fitScale.x,
      y: fitOffset.y / fitScale.y
    };
    konvaStage.offset({
      x: viewOffset.x + baseOffset.x + zoomOffset.x,
      y: viewOffset.y + baseOffset.y + zoomOffset.y
    });
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
   * @param {dwv.math.Point} position The new position.
   * @param {dwv.math.Index} index The new index.
   * @returns {boolean} True if the position was updated.
   */
  this.setCurrentPosition = function (position, index) {
    this.getDrawController().activateDrawLayer(
      index, planeHelper.getScrollIndex());
    // TODO: add check
    return true;
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
   * @param {object} scale The scale to compensate for as {x,y}.
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
