// namespaces
var dwv = dwv || {};
dwv.gui = dwv.gui || {};

/**
 * View layer.
 *
 * @param {object} containerDiv The layer div, its id will be used
 *   as this layer id.
 * @class
 */
dwv.gui.ViewLayer = function (containerDiv) {

  // specific css class name
  containerDiv.className += ' viewLayer';

  // closure to self
  var self = this;

  /**
   * The view controller.
   *
   * @private
   * @type {object}
   */
  var viewController = null;

  /**
   * The main display canvas.
   *
   * @private
   * @type {object}
   */
  var canvas = null;
  /**
   * The offscreen canvas: used to store the raw, unscaled pixel data.
   *
   * @private
   * @type {object}
   */
  var offscreenCanvas = null;
  /**
   * The associated CanvasRenderingContext2D.
   *
   * @private
   * @type {object}
   */
  var context = null;

  /**
   * Flag to know if the current position is valid.
   *
   * @private
   * @type {boolean}
   */
  var isValidPosition = true;

  /**
   * The image data array.
   *
   * @private
   * @type {Array}
   */
  var imageData = null;

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
   * The layer opacity.
   *
   * @private
   * @type {number}
   */
  var opacity = 1;

  /**
   * The layer scale.
   *
   * @private
   * @type {object}
   */
  var scale = {x: 1, y: 1};

  /**
   * The layer fit scale.
   *
   * @private
   * @type {object}
   */
  var fitScale = {x: 1, y: 1};

  /**
   * The layer offset.
   *
   * @private
   * @type {object}
   */
  var offset = {x: 0, y: 0};

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
   * Data update flag.
   *
   * @private
   * @type {boolean}
   */
  var needsDataUpdate = null;

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
   * @private
   * @type {object}
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Set the associated view.
   *
   * @param {object} view The view.
   */
  this.setView = function (view) {
    // local listeners
    view.addEventListener('wlchange', onWLChange);
    view.addEventListener('colourchange', onColourChange);
    view.addEventListener('positionchange', onPositionChange);
    view.addEventListener('alphafuncchange', onAlphaFuncChange);
    // view events
    for (var j = 0; j < dwv.image.viewEventNames.length; ++j) {
      view.addEventListener(dwv.image.viewEventNames[j], fireEvent);
    }
    // create view controller
    viewController = new dwv.ctrl.ViewController(view);
  };

  /**
   * Get the view controller.
   *
   * @returns {object} The controller.
   */
  this.getViewController = function () {
    return viewController;
  };

  /**
   * Get the canvas image data.
   *
   * @returns {object} The image data.
   */
  this.getImageData = function () {
    return imageData;
  };

  /**
   * Handle an image change event.
   *
   * @param {object} event The event.
   */
  this.onimagechange = function (event) {
    // event.value = [index, image]
    if (dataIndex === event.value[0]) {
      viewController.setImage(event.value[1]);
      setBaseSize(viewController.getImageSize().get2D());
      needsDataUpdate = true;
    }
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
   * Get the image world (mm) 2D size.
   *
   * @returns {object} The 2D size as {x,y}.
   */
  this.getImageWorldSize = function () {
    return viewController.getImageWorldSize();
  };

  /**
   * Get the layer opacity.
   *
   * @returns {number} The opacity ([0:1] range).
   */
  this.getOpacity = function () {
    return opacity;
  };

  /**
   * Set the layer opacity.
   *
   * @param {number} alpha The opacity ([0:1] range).
   */
  this.setOpacity = function (alpha) {
    if (alpha === opacity) {
      return;
    }

    opacity = Math.min(Math.max(alpha, 0), 1);

    /**
     * Opacity change event.
     *
     * @event dwv.App#opacitychange
     * @type {object}
     * @property {string} type The event type.
     */
    var event = {
      type: 'opacitychange',
      value: [opacity]
    };
    fireEvent(event);
  };

  /**
   * Set the layer scale.
   *
   * @param {object} newScale The scale as {x,y}.
   * @param {dwv.math.Point3D} center The scale center.
   */
  this.setScale = function (newScale, center) {
    var helper = viewController.getPlaneHelper();
    var orientedNewScale = helper.getTargetOrientedXYZ(newScale);
    var finalNewScale = {
      x: fitScale.x * orientedNewScale.x,
      y: fitScale.y * orientedNewScale.y
    };

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
      offset = resetOffset;
    } else {
      if (typeof center !== 'undefined') {
        var worldCenter = helper.getPlaneOffsetFromOffset3D({
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
          offset, scale, finalNewScale, worldCenter);

        var newZoomOffset = {
          x: zoomOffset.x + newOffset.x - offset.x,
          y: zoomOffset.y + newOffset.y - offset.y
        };
        // store new offset
        zoomOffset = newZoomOffset;
        offset = newOffset;
      }
    }

    // store new scale
    scale = finalNewScale;
  };

  /**
   * Set the base layer offset. Updates the layer offset.
   *
   * @param {dwv.math.Vector3D} scrollOffset The scroll offset vector.
   * @param {dwv.math.Vector3D} planeOffset The plane offset vector.
   * @returns {boolean} True if the offset was updated.
   */
  this.setBaseOffset = function (scrollOffset, planeOffset) {
    var helper = viewController.getPlaneHelper();
    var scrollIndex = helper.getNativeScrollIndex();
    var newOffset = helper.getPlaneOffsetFromOffset3D({
      x: scrollIndex === 0 ? scrollOffset.getX() : planeOffset.getX(),
      y: scrollIndex === 1 ? scrollOffset.getY() : planeOffset.getY(),
      z: scrollIndex === 2 ? scrollOffset.getZ() : planeOffset.getZ(),
    });
    var needsUpdate = baseOffset.x !== newOffset.x ||
      baseOffset.y !== newOffset.y;
    // reset offset if needed
    if (needsUpdate) {
      offset = {
        x: offset.x - baseOffset.x + newOffset.x,
        y: offset.y - baseOffset.y + newOffset.y
      };
      baseOffset = newOffset;
    }
    return needsUpdate;
  };

  /**
   * Set the layer offset.
   *
   * @param {object} newOffset The offset as {x,y}.
   */
  this.setOffset = function (newOffset) {
    var helper = viewController.getPlaneHelper();
    var planeNewOffset = helper.getPlaneOffsetFromOffset3D(newOffset);
    offset = {
      x: viewOffset.x + baseOffset.x + zoomOffset.x + planeNewOffset.x,
      y: viewOffset.y + baseOffset.y + zoomOffset.y + planeNewOffset.y
    };
  };

  /**
   * Transform a display position to an index.
   *
   * @param {number} x The X position.
   * @param {number} y The Y position.
   * @returns {dwv.math.Index} The equivalent index.
   */
  this.displayToPlaneIndex = function (x, y) {
    var planePos = this.displayToPlanePos(x, y);
    return new dwv.math.Index([
      Math.floor(planePos.x),
      Math.floor(planePos.y)
    ]);
  };

  /**
   * Remove scale from a display position.
   *
   * @param {number} x The X position.
   * @param {number} y The Y position.
   * @returns {object} The de-scaled position as {x,y}.
   */
  this.displayToPlaneScale = function (x, y) {
    return {
      x: x / scale.x,
      y: y / scale.y
    };
  };

  /**
   * Get a plane position from a display position.
   *
   * @param {number} x The X position.
   * @param {number} y The Y position.
   * @returns {object} The plane position as {x,y}.
   */
  this.displayToPlanePos = function (x, y) {
    var deScaled = this.displayToPlaneScale(x, y);
    return {
      x: deScaled.x + offset.x,
      y: deScaled.y + offset.y
    };
  };

  /**
   * Get a main plane position from a display position.
   *
   * @param {number} x The X position.
   * @param {number} y The Y position.
   * @returns {object} The main plane position as {x,y}.
   */
  this.displayToMainPlanePos = function (x, y) {
    var planePos = this.displayToPlanePos(x, y);
    return {
      x: planePos.x - baseOffset.x,
      y: planePos.y - baseOffset.y
    };
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
   *
   * @fires dwv.App#renderstart
   * @fires dwv.App#renderend
   */
  this.draw = function () {
    // skip for non valid position
    if (!isValidPosition) {
      return;
    }

    /**
     * Render start event.
     *
     * @event dwv.App#renderstart
     * @type {object}
     * @property {string} type The event type.
     */
    var event = {
      type: 'renderstart',
      layerid: this.getId(),
      dataid: this.getDataIndex()
    };
    fireEvent(event);

    // update data if needed
    if (needsDataUpdate) {
      updateImageData();
    }

    // context opacity
    context.globalAlpha = opacity;

    // clear context
    this.clear();

    // draw the cached canvas on the context
    // transform takes as input a, b, c, d, e, f to create
    // the transform matrix (column-major order):
    // [ a c e ]
    // [ b d f ]
    // [ 0 0 1 ]
    context.setTransform(
      scale.x,
      0,
      0,
      scale.y,
      -1 * offset.x * scale.x,
      -1 * offset.y * scale.y
    );

    // disable smoothing (set just before draw, could be reset by resize)
    context.imageSmoothingEnabled = false;
    // draw image
    context.drawImage(offscreenCanvas, 0, 0);

    /**
     * Render end event.
     *
     * @event dwv.App#renderend
     * @type {object}
     * @property {string} type The event type.
     */
    event = {
      type: 'renderend',
      layerid: this.getId(),
      dataid: this.getDataIndex()
    };
    fireEvent(event);
  };

  /**
   * Initialise the layer: set the canvas and context
   *
   * @param {object} size The image size as {x,y}.
   * @param {object} spacing The image spacing as {x,y}.
   * @param {number} index The associated data index.
   * @param {number} alpha The initial data opacity.
   */
  this.initialise = function (size, spacing, index, alpha) {
    // set locals
    baseSpacing = spacing;
    dataIndex = index;
    opacity = Math.min(Math.max(alpha, 0), 1);

    // create canvas
    // (canvas size is set in fitToContainer)
    canvas = document.createElement('canvas');
    containerDiv.appendChild(canvas);

    // check that the getContext method exists
    if (!canvas.getContext) {
      alert('Error: no canvas.getContext method.');
      return;
    }
    // get the 2D context
    context = canvas.getContext('2d');
    if (!context) {
      alert('Error: failed to get the 2D context.');
      return;
    }

    // off screen canvas
    offscreenCanvas = document.createElement('canvas');

    // set base size: needs an existing context and off screen canvas
    setBaseSize(size);

    // update data on first draw
    needsDataUpdate = true;
  };

  /**
   * Set the base size of the layer.
   *
   * @param {object} size The size as {x,y}.
   */
  function setBaseSize(size) {
    // check canvas creation
    if (!dwv.gui.canCreateCanvas(size.x, size.y)) {
      throw new Error('Cannot create canvas ' + size.x + ', ' + size.y);
    }

    // set local
    baseSize = size;

    // off screen canvas
    offscreenCanvas.width = baseSize.x;
    offscreenCanvas.height = baseSize.y;
    // original empty image data array
    context.clearRect(0, 0, baseSize.x, baseSize.y);
    imageData = context.createImageData(baseSize.x, baseSize.y);
  }

  /**
   * Fit the layer to its parent container.
   *
   * @param {number} fitScale1D The 1D fit scale.
   * @param {object} fitSize The fit size as {x,y}.
   * @param {object} fitOffset The fit offset as {x,y}.
   */
  this.fitToContainer = function (fitScale1D, fitSize, fitOffset) {
    var needsDraw = false;

    // update canvas size if needed (triggers canvas reset)
    if (canvas.width !== fitSize.x || canvas.height !== fitSize.y) {
      if (!dwv.gui.canCreateCanvas(fitSize.x, fitSize.y)) {
        throw new Error('Cannot resize canvas ' + fitSize.x + ', ' + fitSize.y);
      }
      // canvas size  change triggers canvas reset
      canvas.width = fitSize.x;
      canvas.height = fitSize.y;
      // update draw flag
      needsDraw = true;
    }

    // previous scale without fit
    var previousScale = {
      x: scale.x / fitScale.x,
      y: scale.y / fitScale.y
    };
    // fit scale
    var newFitScale = {
      x: fitScale1D * baseSpacing.x,
      y: fitScale1D * baseSpacing.y
    };
    // scale
    var newScale = {
      x: previousScale.x * newFitScale.x,
      y: previousScale.y * newFitScale.y
    };
    // check if different
    if (previousScale.x !== newScale.x || previousScale.y !== newScale.y) {
      fitScale = newFitScale;
      scale = newScale;
      // update draw flag
      needsDraw = true;
    }

    // view offset
    var newViewOffset = {
      x: fitOffset.x / newFitScale.x,
      y: fitOffset.y / newFitScale.y
    };
    // check if different
    if (viewOffset.x !== newViewOffset.x || viewOffset.y !== newViewOffset.y) {
      viewOffset = newViewOffset;
      offset = {
        x: viewOffset.x + baseOffset.x + zoomOffset.x,
        y: viewOffset.y + baseOffset.y + zoomOffset.y
      };
      // update draw flag
      needsDraw = true;
    }

    // draw if needed
    if (needsDraw) {
      this.draw();
    }
  };

  /**
   * Enable and listen to container interaction events.
   */
  this.bindInteraction = function () {
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
    event.srclayerid = self.getId();
    event.dataindex = dataIndex;
    listenerHandler.fireEvent(event);
  }

  // common layer methods [end] ---------------

  /**
   * Update the canvas image data.
   */
  function updateImageData() {
    // generate image data
    viewController.generateImageData(imageData);
    // pass the data to the off screen canvas
    offscreenCanvas.getContext('2d').putImageData(imageData, 0, 0);
    // update data flag
    needsDataUpdate = false;
  }

  /**
   * Handle window/level change.
   *
   * @param {object} event The event fired when changing the window/level.
   * @private
   */
  function onWLChange(event) {
    // generate and draw if no skip flag
    var skip = typeof event.skipGenerate !== 'undefined' &&
      event.skipGenerate === true;
    if (!skip) {
      needsDataUpdate = true;
      self.draw();
    }
  }

  /**
   * Handle colour map change.
   *
   * @param {object} _event The event fired when changing the colour map.
   * @private
   */
  function onColourChange(_event) {
    var skip = typeof event.skipGenerate !== 'undefined' &&
      event.skipGenerate === true;
    if (!skip) {
      needsDataUpdate = true;
      self.draw();
    }
  }

  /**
   * Handle position change.
   *
   * @param {object} event The event fired when changing the position.
   * @private
   */
  function onPositionChange(event) {
    var skip = typeof event.skipGenerate !== 'undefined' &&
      event.skipGenerate === true;
    if (!skip) {
      var valid = typeof event.valid === 'undefined' || event.valid;
      // clear for non valid events
      if (!valid) {
        // clear only once
        if (isValidPosition) {
          isValidPosition = false;
          self.clear();
        }
      } else {
        // 3D dimensions
        var dims3D = [0, 1, 2];
        // remove scroll index
        var indexScrollIndex = dims3D.indexOf(viewController.getScrollIndex());
        dims3D.splice(indexScrollIndex, 1);
        // remove non scroll index from diff dims
        var diffDims = event.diffDims.filter(function (item) {
          return dims3D.indexOf(item) === -1;
        });
        // update if we have something left
        if (diffDims.length !== 0 || !isValidPosition) {
          // reset valid flag
          isValidPosition = true;
          // reset update flag
          needsDataUpdate = true;
          self.draw();
        }
      }
    }
  }

  /**
   * Handle alpha function change.
   *
   * @param {object} event The event fired when changing the function.
   * @private
   */
  function onAlphaFuncChange(event) {
    var skip = typeof event.skipGenerate !== 'undefined' &&
      event.skipGenerate === true;
    if (!skip) {
      needsDataUpdate = true;
      self.draw();
    }
  }

  /**
   * Set the current position.
   *
   * @param {dwv.math.Point} position The new position.
   * @param {dwv.math.Index} _index The new index.
   * @returns {boolean} True if the position was updated.
   */
  this.setCurrentPosition = function (position, _index) {
    return viewController.setCurrentPosition(position);
  };

  /**
   * Clear the context.
   */
  this.clear = function () {
    // clear the context: reset the transform first
    // store the current transformation matrix
    context.save();
    // use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // restore the transform
    context.restore();
  };

  /**
   * Align on another layer.
   *
   * @param {dwv.gui.ViewLayer} rhs The layer to align on.
   */
  this.align = function (rhs) {
    canvas.style.top = rhs.getCanvas().offsetTop;
    canvas.style.left = rhs.getCanvas().offsetLeft;
  };

}; // ViewLayer class
