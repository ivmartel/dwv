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
 * Get the view orientation according to an image and target orientation.
 * The view orientation is used to go from target to image space.
 *
 * @param {dwv.math.Matrix33} imageOrientation The image geometry.
 * @param {dwv.math.Matrix33} targetOrientation The target orientation.
 * @returns {dwv.math.Matrix33} The view orientation.
 */
dwv.gui.getViewOrientation = function (imageOrientation, targetOrientation) {
  var viewOrientation = dwv.math.getIdentityMat33();
  if (typeof targetOrientation !== 'undefined') {
    // i: image, v: view, t: target, O: orientation, P: point
    // [Img] -- Oi --> [Real] <-- Ot -- [Target]
    // Pi = (Oi)-1 * Ot * Pt = Ov * Pt
    // -> Ov = (Oi)-1 * Ot
    // TODO: asOneAndZeros simplifies but not nice...
    viewOrientation =
      imageOrientation.asOneAndZeros().getInverse().multiply(targetOrientation);
  }
  return viewOrientation;
};

/**
 * Get the target orientation according to an image and view orientation.
 * The target orientation is used to go from target to real space.
 *
 * @param {dwv.math.Matrix33} imageOrientation The image geometry.
 * @param {dwv.math.Matrix33} viewOrientation The view orientation.
 * @returns {dwv.math.Matrix33} The target orientation.
 */
dwv.gui.getTargetOrientation = function (imageOrientation, viewOrientation) {
  // i: image, v: view, t: target, O: orientation, P: point
  // [Img] -- Oi --> [Real] <-- Ot -- [Target]
  // Pi = (Oi)-1 * Ot * Pt = Ov * Pt
  // -> Ot = Oi * Ov
  // note: asOneAndZeros as in dwv.gui.getViewOrientation...
  return imageOrientation.asOneAndZeros().multiply(viewOrientation);
};

/**
 * Get a scaled offset to adapt to new scale and such as the input center
 * stays at the same position.
 *
 * @param {object} offset The previous offset as {x,y}.
 * @param {object} scale The previous scale as {x,y}.
 * @param {object} newScale The new scale as {x,y}.
 * @param {object} center The scale center as {x,y}.
 * @returns {object} The scaled offset as {x,y}.
 */
dwv.gui.getScaledOffset = function (offset, scale, newScale, center) {
  // worldPoint = indexPoint / scale + offset
  //=> indexPoint = (worldPoint - offset ) * scale

  // plane center should stay the same:
  // indexCenter / newScale + newOffset =
  //   indexCenter / oldScale + oldOffset
  //=> newOffset = indexCenter / oldScale + oldOffset -
  //     indexCenter / newScale
  //=> newOffset = worldCenter - indexCenter / newScale
  var indexCenter = {
    x: (center.x - offset.x) * scale.x,
    y: (center.y - offset.y) * scale.y
  };
  return {
    x: center.x - (indexCenter.x / newScale.x),
    y: center.y - (indexCenter.y / newScale.y)
  };
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
   * @returns {dwv.math.Matrix33} The orientation matrix.
   */
  this.getTargetOrientation = function () {
    return targetOrientation;
  };

  /**
   * Set the target orientation.
   *
   * @param {dwv.math.Matrix33} orientation The orientation matrix.
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
   * Get the view layers associated to a data index.
   *
   * @param {number} index The data index.
   * @returns {Array} The layers.
   */
  this.getViewLayersByDataIndex = function (index) {
    var res = [];
    for (var i = 0; i < layers.length; ++i) {
      if (layers[i] instanceof dwv.gui.ViewLayer &&
        layers[i].getDataIndex() === index) {
        res.push(layers[i]);
      }
    }
    return res;
  };

  /**
   * Search view layers for equal imae meta data.
   *
   * @param {object} meta The meta data to find.
   * @returns {Array} The list of view layers that contain matched data.
   */
  this.searchViewLayers = function (meta) {
    var res = [];
    for (var i = 0; i < layers.length; ++i) {
      if (layers[i] instanceof dwv.gui.ViewLayer) {
        if (layers[i].getViewController().equalImageMeta(meta)) {
          res.push(layers[i]);
        }
      }
    }
    return res;
  };

  /**
   * Get the view layers data indices.
   *
   * @returns {Array} The list of indices.
   */
  this.getViewDataIndices = function () {
    var res = [];
    for (var i = 0; i < layers.length; ++i) {
      if (layers[i] instanceof dwv.gui.ViewLayer) {
        res.push(layers[i].getDataIndex());
      }
    }
    return res;
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
   * Get the draw layers associated to a data index.
   *
   * @param {number} index The data index.
   * @returns {Array} The layers.
   */
  this.getDrawLayersByDataIndex = function (index) {
    var res = [];
    for (var i = 0; i < layers.length; ++i) {
      if (layers[i] instanceof dwv.gui.DrawLayer &&
        layers[i].getDataIndex() === index) {
        res.push(layers[i]);
      }
    }
    return res;
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
   * Set the active view layer with a data index.
   *
   * @param {number} index The data index.
   */
  this.setActiveViewLayerByDataIndex = function (index) {
    for (var i = 0; i < layers.length; ++i) {
      if (layers[i] instanceof dwv.gui.ViewLayer &&
        layers[i].getDataIndex() === index) {
        this.setActiveViewLayer(i);
        break;
      }
    }
  };

  /**
   * Set the active draw layer.
   *
   * @param {number} index The index of the layer to set as active.
   */
  this.setActiveDrawLayer = function (index) {
    activeDrawLayerIndex = index;
  };

  /**
   * Set the active draw layer with a data index.
   *
   * @param {number} index The data index.
   */
  this.setActiveDrawLayerByDataIndex = function (index) {
    for (var i = 0; i < layers.length; ++i) {
      if (layers[i] instanceof dwv.gui.DrawLayer &&
        layers[i].getDataIndex() === index) {
        this.setActiveDrawLayer(i);
        break;
      }
    }
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
   * Get the next layer DOM div.
   *
   * @returns {HTMLElement} A DOM div.
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

    var index = new dwv.math.Index(event.value[0]);
    var position = new dwv.math.Point(event.value[1]);
    // origin of the first view layer
    var baseViewLayerOrigin0 = null;
    var baseViewLayerOrigin = null;
    // update position for all layers except the source one
    for (var i = 0; i < layers.length; ++i) {

      // update base offset (does not trigger redraw)
      // TODO check draw layers update
      var hasSetOffset = false;
      if (layers[i] instanceof dwv.gui.ViewLayer) {
        var vc = layers[i].getViewController();
        // origin0 should always be there
        var origin0 = vc.getOrigin();
        // depending on position, origin could be undefined
        var origin = vc.getOrigin(position);

        if (!baseViewLayerOrigin) {
          baseViewLayerOrigin0 = origin0;
          baseViewLayerOrigin = origin;
        } else {
          if (vc.canSetPosition(position) &&
            typeof origin !== 'undefined') {
            // TODO: compensate for possible different orientation between views
            // TODO: check why -z...

            var scrollDiff = baseViewLayerOrigin0.minus(origin0);
            var scrollOffset = new dwv.math.Vector3D(
              scrollDiff.getX(), scrollDiff.getY(), -1 * scrollDiff.getZ());

            var planeDiff = baseViewLayerOrigin.minus(origin);
            var planeOffset = new dwv.math.Vector3D(
              planeDiff.getX(), planeDiff.getY(), -1 * planeDiff.getZ());

            hasSetOffset = layers[i].setBaseOffset(scrollOffset, planeOffset);
          }
        }
      }

      // update position (triggers redraw)
      var hasSetPos = false;
      if (layers[i].getId() !== event.srclayerid) {
        hasSetPos = layers[i].setCurrentPosition(position, index);
      }

      // force redraw if needed
      if (!hasSetPos && hasSetOffset) {
        layers[i].draw();
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
   * Calculate the fit scale: the scale that fits the largest data.
   *
   * @returns {number|undefined} The fit scale.
   */
  this.calculateFitScale = function () {
    // check container
    if (containerDiv.offsetWidth === 0 &&
      containerDiv.offsetHeight === 0) {
      throw new Error('Cannot fit to zero sized container.');
    }
    // get max size
    var maxSize = this.getMaxSize();
    if (typeof maxSize === 'undefined') {
      return undefined;
    }
    // return best fit
    return Math.min(
      containerDiv.offsetWidth / maxSize.x,
      containerDiv.offsetHeight / maxSize.y
    );
  };

  /**
   * Set the layer group fit scale.
   *
   * @param {number} scaleIn The fit scale.
   */
  this.setFitScale = function (scaleIn) {
    // get maximum size
    var maxSize = this.getMaxSize();
    // exit if none
    if (typeof maxSize === 'undefined') {
      return;
    }

    var containerSize = {
      x: containerDiv.offsetWidth,
      y: containerDiv.offsetHeight
    };
    // offset to keep data centered
    var fitOffset = {
      x: -0.5 * (containerSize.x - Math.floor(maxSize.x * scaleIn)),
      y: -0.5 * (containerSize.y - Math.floor(maxSize.y * scaleIn))
    };

    // apply to layers
    for (var j = 0; j < layers.length; ++j) {
      layers[j].fitToContainer(scaleIn, containerSize, fitOffset);
    }
  };

  /**
   * Get the largest data size.
   *
   * @returns {object|undefined} The largest size as {x,y}.
   */
  this.getMaxSize = function () {
    var maxSize = {x: 0, y: 0};
    for (var j = 0; j < layers.length; ++j) {
      if (layers[j] instanceof dwv.gui.ViewLayer) {
        var size = layers[j].getImageWorldSize();
        if (size.x > maxSize.x) {
          maxSize.x = size.x;
        }
        if (size.y > maxSize.y) {
          maxSize.y = size.y;
        }
      }
    }
    if (maxSize.x === 0 && maxSize.y === 0) {
      maxSize = undefined;
    }
    return maxSize;
  };

  /**
   * Add scale to the layers. Scale cannot go lower than 0.1.
   *
   * @param {number} scaleStep The scale to add.
   * @param {dwv.math.Point3D} center The scale center Point3D.
   */
  this.addScale = function (scaleStep, center) {
    var newScale = {
      x: scale.x * (1 + scaleStep),
      y: scale.y * (1 + scaleStep),
      z: scale.z * (1 + scaleStep)
    };
    this.setScale(newScale, center);
  };

  /**
   * Set the layers' scale.
   *
   * @param {object} newScale The scale to apply as {x,y,z}.
   * @param {dwv.math.Point3D} center The scale center Point3D.
   * @fires dwv.ctrl.LayerGroup#zoomchange
   */
  this.setScale = function (newScale, center) {
    scale = newScale;
    // apply to layers
    for (var i = 0; i < layers.length; ++i) {
      layers[i].setScale(scale, center);
    }

    // event value
    var value = [
      newScale.x,
      newScale.y,
      newScale.z
    ];
    if (typeof center !== 'undefined') {
      value.push(center.getX());
      value.push(center.getY());
      value.push(center.getZ());
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
      value: value
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
