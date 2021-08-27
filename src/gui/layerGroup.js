// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};

/**
 * Get the layer group div id.
 *
 * @param {number} groupId The layer group id.
 * @param {number} layerId The lyaer id.
 * @returns {string} A string id.
 */
dwv.gui.getLayerGroupDivId = function (groupId, layerId) {
  return 'layer-' + groupId + '-' + layerId;
};

/**
 * Get the layer details from a div id.
 *
 * @param {string} idString The layer group id.
 * @returns {object} The layer details as {groupId, layerId}.
 */
dwv.gui.getLayerDetailsFromLayerDivId = function (idString) {
  var posHyphen = idString.lastIndexOf('-');
  var groupId = null;
  var layerId = null;
  if (posHyphen !== -1) {
    groupId = parseInt(idString.substring(6, posHyphen), 10);
    layerId = parseInt(idString.substring(posHyphen), 10);
  }
  return {
    groupId: groupId,
    layerId: layerId
  };
};

/**
 * Get the layer details from a mouse event.
 *
 * @param {object} event The event to get the layer div id from.
 * @returns {object} The layer details as {groupId, layerId}.
 */
dwv.gui.getLayerDetailsFromToolEvent = function (event) {
  var res = null;
  // the target of the tool event is the layer canvas,
  // its parent should be the layer div
  var divId = event.target.parentElement.id;
  if (typeof divId !== 'undefined') {
    res = dwv.gui.getLayerDetailsFromLayerDivId(divId);
  }
  return res;
};


/**
 * Layer group.
 *
 * @param {object} containerDiv The associated HTML div.
 * @param {number} groupId The group id.
 * @class
 */
dwv.gui.LayerGroup = function (containerDiv, groupId) {

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
  var layerSize = dwv.gui.getDivSize(containerDiv);

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
   * The orientation name.
   * Undefined orientation uses the incoming ordering
   *
   * @type {String}
   * @private
   */
  var targetOrientationName;

  /**
   * Set the orientation.
   *
   * @param {String} orientationName The orientation name.
   */
  this.setOrientation = function (orientationName) {
    targetOrientationName = orientationName;
  };

  /**
   * Get the Id of the container div.
   *
   * @returns {string} The id of the div.
   */
  this.getElementId = function () {
    return containerDiv.id;
  };

  /**
   * Get the layer group id.
   *
   * @returns {number} The id.
   */
  this.getGroupId = function () {
    return groupId;
  };

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
   * Set the active view layer.
   *
   * @param {number} index The index of the layer to set as active.
   */
  this.setActiveViewLayer = function (index) {
    // un-bind previous layer
    var viewLayer0 = this.getActiveViewLayer();
    if (viewLayer0) {
      viewLayer0.removeEventListener(
        'postitionchange', this.updatePosition);
      unbindViewLayer(viewLayer0);
    }

    // set index
    activeViewLayerIndex = index;

    // bind new layer
    var viewLayer = this.getActiveViewLayer();
    viewLayer.addEventListener(
      'postitionchange', this.updatePosition);
    bindViewLayer(viewLayer);
  };

  /**
   * Bind view layer events to this.
   *
   * @param {object} viewLayer The view layer to bind.
   */
  function bindViewLayer(viewLayer) {
    // propagate view events
    viewLayer.propagateViewEvents(true);
    for (var j = 0; j < dwv.image.viewEventNames.length; ++j) {
      viewLayer.addEventListener(dwv.image.viewEventNames[j], fireEvent);
    }
    // propagate viewLayer events
    viewLayer.addEventListener('renderstart', fireEvent);
    viewLayer.addEventListener('renderend', fireEvent);
  }

  /**
   * Unbind view layer events from this.
   *
   * @param {object} viewLayer The view layer to unbind.
   */
  function unbindViewLayer(viewLayer) {
    // stop propagating view events
    viewLayer.propagateViewEvents(false);
    for (var j = 0; j < dwv.image.viewEventNames.length; ++j) {
      viewLayer.removeEventListener(dwv.image.viewEventNames[j], fireEvent);
    }
    // stop propagating viewLayer events
    viewLayer.removeEventListener('renderstart', fireEvent);
    viewLayer.removeEventListener('renderend', fireEvent);
  }


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
    // layer index
    var viewLayerIndex = layers.length;
    // create div
    var div = getNextLayerDiv();
    // prepend to container
    containerDiv.append(div);
    // view layer
    var layer = new dwv.gui.ViewLayer(div);
    // set z-index: last on top
    layer.setZIndex(viewLayerIndex);
    // add layer
    layers.push(layer);
    // mark it as active
    this.setActiveViewLayer(viewLayerIndex);
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
    var layer = new dwv.gui.DrawLayer(div);
    // set z-index: above view + last on top
    layer.setZIndex(10 + activeDrawLayerIndex);
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
    div.id = dwv.gui.getLayerGroupDivId(groupId, layers.length);
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
   * @param {object} spacing The image spacing.
   * @returns {number} The scale.
   */
  this.getFitToContainerScale = function (spacing) {
    // get container size
    var containerSize = this.getContainerSize();
    var realSize = {
      x: layerSize.x * spacing.getColumnSpacing(),
      y: layerSize.y * spacing.getRowSpacing()
    };
    // best fit
    return Math.min(
      (containerSize.x / realSize.x),
      (containerSize.y / realSize.y)
    );
  };

  /**
   * Fit the display to the size of the container.
   * To be called once the image is loaded.
   *
   * @param {object} spacing The image spacing.
   */
  this.fitToContainer = function (spacing) {
    var fitScale = this.getFitToContainerScale(spacing);
    this.resize({
      x: fitScale * spacing.getColumnSpacing(),
      y: fitScale * spacing.getRowSpacing()
    });
  };

  /**
   * Get the size available for the container div.
   *
   * @returns {object} The available width and height as {width,height}.
   */
  this.getContainerSize = function () {
    return dwv.gui.getDivSize(containerDiv);
  };

  /**
   * Add scale to the layers. Scale cannot go lower than 0.1.
   *
   * @param {object} scaleStep The scale to add.
   * @param {object} center The scale center point as {x,y}.
   */
  this.addScale = function (scaleStep, center) {
    var newScale = {
      x: Math.max(scale.x + scale.x * scaleStep, 0.1),
      y: Math.max(scale.y + scale.y * scaleStep, 0.1)
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
   * @fires dwv.ctrl.LayerGroup#zoomchange
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
     * @event dwv.ctrl.LayerGroup#zoomchange
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
   * @fires dwv.ctrl.LayerGroup#offsetchange
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
     * @event dwv.ctrl.LayerGroup#offsetchange
     * @type {object}
     * @property {Array} value The changed value.
     */
    fireEvent({
      type: 'offsetchange',
      value: [offset.x, offset.y],
    });
  };

  /**
   * Get an orientation matrix from a name.
   *
   * @param {string} name The orientation name.
   * @returns {object} The orientation matrix.
   */
  function getOrientationMatrix(name) {
    var matrix = null;
    if (name === 'axial') {
      matrix = dwv.math.getIdentityMat33();
    } else if (name === 'coronal') {
      // coronal (xzy)
      /* eslint-disable array-element-newline */
      matrix = new dwv.math.Matrix33([
        1, 0, 0,
        0, 0, 1,
        0, 1, 0
      ]);
      /* eslint-enable array-element-newline */
    } else if (name === 'sagittal') {
      // sagittal (yzx)
      /* eslint-disable array-element-newline */
      matrix = new dwv.math.Matrix33([
        0, 0, 1,
        1, 0, 0,
        0, 1, 0
      ]);
      /* eslint-enable array-element-newline */
    }
    return matrix;
  }

  /**
   * Initialise the layer: set the canvas and context
   *
   * @param {object} image The image.
   * @param {object} metaData The image meta data.
   * @param {number} dataIndex The data index.
   */
  this.initialise = function (image, metaData, dataIndex) {
    var geometry = image.getGeometry();

    var viewOrientation = dwv.math.getIdentityMat33();
    if (typeof targetOrientationName !== 'undefined') {
      var targetOrientation = getOrientationMatrix(targetOrientationName);
      // image orientation as one and zeros
      var imgOrientation = geometry.getOrientation().asOneAndZeros();
      // imgOrientation * viewOrientation = targetOrientation
      // -> viewOrientation = inv(imgOrientation) * targetOrientation
      viewOrientation =
        imgOrientation.getInverse().multiply(targetOrientation);
    }

    var size = image.getGeometry().getSize(viewOrientation);
    layerSize = size.get2D();
    // apply to layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].initialise(image, metaData, dataIndex, viewOrientation);
    }

    // bind draw to view position
    var viewLayer = this.getActiveViewLayer();
    viewLayer.addEventListener(
      'positionchange', this.updateDrawControllerToViewPosition);
    // first update
    this.updateDrawControllerToViewPosition();

    // fit data
    var spacing = image.getGeometry().getSpacing(viewOrientation);
    this.fitToContainer(spacing);
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
    var width = Math.floor(layerSize.x * baseScale.x);
    var height = Math.floor(layerSize.y * baseScale.y);
    containerDiv.style.width = width + 'px';
    containerDiv.style.height = height + 'px';

    // resize if test passes
    if (dwv.gui.canCreateCanvas(width, height)) {
      // call resize and scale on layers
      for (var i = 0; i < layers.length; ++i) {
        layers[i].resize(baseScale);
        layers[i].setScale(scale);
      }
    } else {
      dwv.logger.warn('Cannot create a ' + width + ' * ' + height +
        ' canvas, trying half the size...');
      this.resize({x: newScale.x * 0.5, y: newScale.y * 0.5});
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

}; // LayerGroup class
