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
    layerId = parseInt(idString.substring(posHyphen + 1), 10);
  }
  return {
    groupId: groupId,
    layerId: layerId
  };
};

/**
 * Get the layer details from a mouse event.
 *
 * @param {object} event The event to get the layer div id from. Expecting
 * an event origininating from a canvas inside a layer HTML div
 * with the 'layer' class and id generated with `dwv.gui.getLayerGroupDivId`.
 * @returns {object} The layer details as {groupId, layerId}.
 */
dwv.gui.getLayerDetailsFromEvent = function (event) {
  var res = null;
  // get the closest element from the event target and with the 'layer' class
  var layerDiv = event.target.closest('.layer');
  if (layerDiv && typeof layerDiv.id !== 'undefined') {
    res = dwv.gui.getLayerDetailsFromLayerDivId(layerDiv.id);
  }
  return res;
};

/**
 * Get the fit to container scale.
 * To be called with an existing HTML element!
 *
 * @param {object} containerDiv The container.
 * @param {object} size The oriented image size.
 * @param {object} spacing The oriented image spacing.
 * @returns {object} The scale as {x,y}.
 */
dwv.gui.getFitToContainerScale = function (containerDiv, size, spacing) {
  // check container size
  if (containerDiv.offsetWidth === 0 &&
    containerDiv.offsetHeight === 0) {
    throw new Error('Cannot fit to zero sized container.');
  }
  // best fit
  var scaleX = containerDiv.offsetWidth / (size.x * spacing.x);
  var scaleY = containerDiv.offsetHeight / (size.y * spacing.y);
  // minimum scale and not zero
  var scale = null;
  if (scaleX > 0 && scaleY > 0) {
    scale = Math.min(scaleX, scaleY);
  } else {
    scale = scaleX === 0 ? scaleY : scaleX;
  }
  // return 2D scale
  return {
    x: scale * spacing.x,
    y: scale * spacing.y
  };
};

/**
 * Get a view orientation according to an image geometry (with its orientation)
 * and target orientation.
 *
 * @param {object} imageGeometry The image geometry.
 * @param {object} targetOrientation The target orientation.
 * @returns {object} The view orientation.
 */
dwv.gui.getViewOrientation = function (imageGeometry, targetOrientation) {
  var viewOrientation = dwv.math.getIdentityMat33();
  if (typeof targetOrientation !== 'undefined') {
    // image orientation as one and zeros
    // -> view orientation is one and zeros
    var imgOrientation = imageGeometry.getOrientation().asOneAndZeros();
    // imgOrientation * viewOrientation = targetOrientation
    // -> viewOrientation = inv(imgOrientation) * targetOrientation
    viewOrientation =
      imgOrientation.getInverse().multiply(targetOrientation);
  }
  return viewOrientation;
};

/**
 * Layer group.
 *
 * Display position: {x,y}
 * Plane position: Index (access: get(i))
 * (world) Position: Point3D (access: getX, getY, getZ)
 *
 * Display -> World:
 * planePos = viewLayer.displayToPlanePos(displayPos)
 * -> compensate for layer scale and offset
 * pos = viewController.getPositionFromPlanePoint(planePos)
 *
 * World -> display
 * planePos = viewController.getOffset3DFromPlaneOffset(pos)
 * no need yet for a planePos to displayPos...
 *
 * @param {object} containerDiv The associated HTML div.
 * @param {number} groupId The group id.
 * @class
 */
dwv.gui.LayerGroup = function (containerDiv, groupId) {

  // closure to self
  var self = this;
  // list of layers
  var layers = [];

  /**
   * The layer scale as {x,y}.
   *
   * @private
   * @type {object}
   */
  var scale = {x: 1, y: 1, z: 1};

  /**
   * The base scale as {x,y}: all posterior scale will be on top of this one.
   *
   * @private
   * @type {object}
   */
  var baseScale = {x: 1, y: 1, z: 1};

  /**
   * The layer offset as {x,y}.
   *
   * @private
   * @type {object}
   */
  var offset = {x: 0, y: 0, z: 0};

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
   * The target orientation matrix.
   *
   * @type {object}
   * @private
   */
  var targetOrientation;

  /**
   * Get the target orientation.
   *
   * @returns {object} The orientation matrix.
   */
  this.getTargetOrientation = function () {
    return targetOrientation;
  };

  /**
   * Set the target orientation.
   *
   * @param {object} orientation The orientation matrix.
   */
  this.setTargetOrientation = function (orientation) {
    targetOrientation = orientation;
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
   * @returns {object} The scale as {x,y,z}.
   */
  this.getScale = function () {
    return scale;
  };

  /**
   * Get the base scale.
   *
   * @returns {object} The scale as {x,y,z}.
   */
  this.getBaseScale = function () {
    return baseScale;
  };

  /**
   * Get the added scale: the scale added to the base scale
   *
   * @returns {object} The scale as {x,y,z}.
   */
  this.getAddedScale = function () {
    return {
      x: scale.x / baseScale.x,
      y: scale.y / baseScale.y,
      z: scale.z / baseScale.z
    };
  };

  /**
   * Get the layer offset.
   *
   * @returns {object} The offset as {x,y,z}.
   */
  this.getOffset = function () {
    return offset;
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
    activeViewLayerIndex = index;
  };

  /**
   * Bind view layer events to this.
   *
   * @param {object} viewLayer The view layer to bind.
   */
  function bindViewLayer(viewLayer) {
    // listen to position change to update other group layers
    viewLayer.addEventListener(
      'positionchange', self.updateLayersToPositionChange);
    // propagate view viewLayer-layer events
    for (var j = 0; j < dwv.image.viewEventNames.length; ++j) {
      viewLayer.addEventListener(dwv.image.viewEventNames[j], fireEvent);
    }
    // propagate viewLayer events
    viewLayer.addEventListener('renderstart', fireEvent);
    viewLayer.addEventListener('renderend', fireEvent);
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
    // add layer
    layers.push(layer);
    // mark it as active
    this.setActiveViewLayer(viewLayerIndex);
    // bind view layer events
    bindViewLayer(layer);
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
   * Update layers (but not the active view layer) to a position change.
   *
   * @param {object} event The position change event.
   */
  this.updateLayersToPositionChange = function (event) {
    // pause positionchange listeners
    for (var j = 0; j < layers.length; ++j) {
      if (layers[j] instanceof dwv.gui.ViewLayer) {
        layers[j].removeEventListener(
          'positionchange', self.updateLayersToPositionChange);
        layers[j].removeEventListener('positionchange', fireEvent);
      }
    }

    var position = new dwv.math.Point3D(
      event.value[1][0], event.value[1][1], event.value[1][2]);
    // update position for all layers except the source one
    for (var i = 0; i < layers.length; ++i) {
      if (layers[i].getId() !== event.srclayerid) {
        layers[i].setCurrentPosition(position);
      }
    }

    // re-start positionchange listeners
    for (var k = 0; k < layers.length; ++k) {
      if (layers[k] instanceof dwv.gui.ViewLayer) {
        layers[k].addEventListener(
          'positionchange', self.updateLayersToPositionChange);
        layers[k].addEventListener('positionchange', fireEvent);
      }
    }
  };

  /**
   * Fit the display to the size of the container.
   * To be called once the image is loaded.
   */
  this.fitToContainer = function () {
    // check container size
    if (containerDiv.offsetWidth === 0 &&
      containerDiv.offsetHeight === 0) {
      throw new Error('Cannot fit to zero sized container.');
    }
    // find best fit
    var fitScales = [];
    for (var i = 0; i < layers.length; ++i) {
      var fullSize = layers[i].getFullSize();
      fitScales.push(containerDiv.offsetWidth / fullSize.x);
      fitScales.push(containerDiv.offsetHeight / fullSize.y);
    }
    var fitScale = Math.min.apply(null, fitScales);
    // apply to layers
    for (var j = 0; j < layers.length; ++j) {
      layers[j].fitToContainer(fitScale);
    }
  };

  /**
   * Add scale to the layers. Scale cannot go lower than 0.1.
   *
   * @param {object} scaleStep The scale to add.
   * @param {object} center The scale center Point3D.
   */
  this.addScale = function (scaleStep, center) {
    var newScale = {
      x: scale.x * (1 + scaleStep),
      y: scale.y * (1 + scaleStep),
      z: scale.z * (1 + scaleStep)
    };
    var centerPlane = {
      x: (center.getX() - offset.x) * scale.x,
      y: (center.getY() - offset.y) * scale.y,
      z: (center.getZ() - offset.z) * scale.z
    };
    // center should stay the same:
    // center / newScale + newOffset = center / oldScale + oldOffset
    // => newOffset = center / oldScale + oldOffset - center / newScale
    var newOffset = {
      x: (centerPlane.x / scale.x) + offset.x - (centerPlane.x / newScale.x),
      y: (centerPlane.y / scale.y) + offset.y - (centerPlane.y / newScale.y),
      z: (centerPlane.z / scale.z) + offset.z - (centerPlane.z / newScale.z)
    };

    this.setOffset(newOffset);
    this.setScale(newScale);
  };

  /**
   * Set the layers' scale.
   *
   * @param {object} newScale The scale to apply as {x,y,z}.
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
      value: [scale.x, scale.y, scale.z],
    });
  };

  /**
   * Add translation to the layers.
   *
   * @param {object} translation The translation as {x,y,z}.
   */
  this.addTranslation = function (translation) {
    this.setOffset({
      x: offset.x - translation.x,
      y: offset.y - translation.y,
      z: offset.z - translation.z
    });
  };

  /**
   * Set the layers' offset.
   *
   * @param {object} newOffset The offset as {x,y,z}.
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
      value: [offset.x, offset.y, offset.z],
    });
  };

  /**
   * Reset the stage to its initial scale and no offset.
   */
  this.reset = function () {
    this.setScale(baseScale);
    this.setOffset({x: 0, y: 0, z: 0});
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
