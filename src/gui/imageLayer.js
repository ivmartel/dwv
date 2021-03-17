// namespaces
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Image layer.
 *
 * @param {object} containerDiv The layer div.
 * @class
 */
dwv.html.ImageLayer = function (containerDiv) {

  containerDiv.className += ' imageLayer';

  // closure to self
  var self = this;

  /**
   * The image view.
   *
   * @private
   * @type {object}
   */
  var view = null;
  /**
   * The view controller.
   *
   * @private
   * @type {object}
   */
  var viewController = null;

  /**
   * The base canvas.
   *
   * @private
   * @type {object}
   */
  var canvas = null;
  /**
   * A cache of the initial canvas.
   *
   * @private
   * @type {object}
   */
  var cacheCanvas = null;
  /**
   * The associated CanvasRenderingContext2D.
   *
   * @private
   * @type {object}
   */
  var context = null;

  /**
   * The image data array.
   *
   * @private
   * @type {Array}
   */
  var imageData = null;

  /**
   * The layer opacity.
   *
   * @private
   * @type {number}
   */
  var opacity = 1;

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
    opacity = alpha;
  };

  /**
   * The layer origin.
   *
   * @private
   * @type {object}
   */
  var origin = {x: 0, y: 0};
  /**
   * Get the layer origin.
   *
   * @returns {object} The layer origin as {'x','y'}.
   */
  this.getOrigin = function () {
    return origin;
  };
  /**
   * The layer zoom.
   *
   * @private
   * @type {object}
   */
  var zoom = {x: 1, y: 1};
  /**
   * Get the layer zoom.
   *
   * @returns {object} The layer zoom as {'x','y'}.
   */
  this.getZoom = function () {
    return zoom;
  };

  /**
   * The layer translation.
   *
   * @private
   * @type {object}
   */
  var trans = {x: 0, y: 0};
  /**
   * Get the layer translation.
   *
   * @returns {object} The layer translation as {'x','y'}.
   */
  this.getTrans = function () {
    return trans;
  };

  /**
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Set the canvas width.
   *
   * @param {number} width The new width.
   */
  this.setWidth = function (width) {
    canvas.width = width;
  };
  /**
   * Set the canvas height.
   *
   * @param {number} height The new height.
   */
  this.setHeight = function (height) {
    canvas.height = height;
  };

  /**
   * Set the layer zoom.
   *
   * @param {number} newZoomX The zoom in the X direction.
   * @param {number} newZoomY The zoom in the Y direction.
   * @param {number} centerX The zoom center in the X direction.
   * @param {number} centerY The zoom center in the Y direction.
   */
  this.zoom = function (newZoomX, newZoomY, centerX, centerY) {
    // The zoom is the ratio between the differences from the center
    // to the origins:
    // centerX - originX = ( centerX - originX0 ) * zoomX
    // (center in ~world coordinate system)
    //originX = (centerX / zoomX) + originX - (centerX / newZoomX);
    //originY = (centerY / zoomY) + originY - (centerY / newZoomY);

    // center in image coordinate system
    origin.x = centerX - (centerX - origin.x) * (newZoomX / zoom.x);
    origin.y = centerY - (centerY - origin.y) * (newZoomY / zoom.y);

    // save zoom
    zoom.x = newZoomX;
    zoom.y = newZoomY;
  };

  /**
   * Set the layer translation.
   * Translation is according to the last one.
   *
   * @param {number} tx The translation in the X direction.
   * @param {number} ty The translation in the Y direction.
   */
  this.translate = function (tx, ty) {
    trans.x = tx;
    trans.y = ty;
  };

  /**
   * Reset the layout.
   *
   * @param {number} izoom The input zoom.
   */
  this.resetLayout = function (izoom) {
    origin.x = 0;
    origin.y = 0;
    zoom.x = izoom;
    zoom.y = izoom;
    trans.x = 0;
    trans.y = 0;
  };

  /**
   * Transform a display position to an index.
   *
   * @param {dwv.Math.Point2D} point2D The point to convert.
   * @returns {object} The equivalent index.
   */
  this.displayToIndex = function (point2D) {
    return {x: ((point2D.x - origin.x) / zoom.x) - trans.x,
      y: ((point2D.y - origin.y) / zoom.y) - trans.y};
  };

  /**
   * Draw the content (imageData) of the layer.
   * The imageData variable needs to be set
   *
   * @fires dwv.App#renderstart
   * @fires dwv.App#renderend
   */
  this.draw = function () {
    /**
     * Render start event.
     *
     * @event dwv.App#renderstart
     * @type {object}
     * @property {string} type The event type.
     */
    var event = {type: 'renderstart'};
    fireEvent(event);

    // generate image data from DICOM
    view.generateImageData(imageData);
    // pass the data to the canvas
    cacheCanvas.getContext('2d').putImageData(imageData, 0, 0);

    // context opacity
    context.globalAlpha = opacity;

    // clear the context: reset the transform first
    // store the current transformation matrix
    context.save();
    // use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    // restore the transform
    context.restore();

    // draw the cached canvas on the context
    // transform takes as input a, b, c, d, e, f to create
    // the transform matrix (column-major order):
    // [ a c e ]
    // [ b d f ]
    // [ 0 0 1 ]
    context.setTransform(zoom.x, 0, 0, zoom.y,
      origin.x + (trans.x * zoom.x),
      origin.y + (trans.y * zoom.y));

    // disable smoothing (set just before draw, could be reset by resize)
    context.imageSmoothingEnabled = false;
    // draw image
    context.drawImage(cacheCanvas, 0, 0);

    /**
     * Render end event.
     *
     * @event dwv.App#renderend
     * @type {object}
     * @property {string} type The event type.
     */
    event = {type: 'renderend'};
    fireEvent(event);
  };

  /**
   * Handle window/level change.
   *
   * @param {object} event The event fired when changing the window/level.
   * @private
   */
  function onWLChange(event) {
    // generate and draw if no skip flag
    if (typeof event.skipGenerate === 'undefined' ||
      event.skipGenerate === false) {
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
    self.draw();
  }

  /**
   * Handle frame change.
   *
   * @param {object} event The event fired when changing the frame.
   * @private
   */
  function onFrameChange(event) {
    // generate and draw if no skip flag
    if (typeof event.skipGenerate === 'undefined' ||
      event.skipGenerate === false) {
      self.draw();
    }
  }

  /**
   * Handle slice change.
   *
   * @param {object} _event The event fired when changing the slice.
   * @private
   */
  function onSliceChange(_event) {
    self.draw();
  }

  /**
   * Initialise the layer: set the canvas and context
   *
   * @param {object} metaData The image meta data.
   * @param {object} image The image.
   */
  this.initialise = function (metaData, image) {

    // create view
    var viewFactory = new dwv.image.ViewFactory();
    view = viewFactory.create(
      new dwv.dicom.DicomElementsWrapper(metaData),
      image);

    // local listeners
    view.addEventListener('wlwidthchange', onWLChange);
    view.addEventListener('wlcenterchange', onWLChange);
    view.addEventListener('colourchange', onColourChange);
    view.addEventListener('slicechange', onSliceChange);
    view.addEventListener('framechange', onFrameChange);

    // create view controller
    viewController = new dwv.ViewController(view);

    // get sizes
    var size = image.getGeometry().getSize();
    var inputWidth = size.getNumberOfColumns();
    var inputHeight = size.getNumberOfRows();

    // create canvas
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
    // canvas sizes
    canvas.width = inputWidth;
    canvas.height = inputHeight;
    // original empty image data array
    context.clearRect(0, 0, canvas.width, canvas.height);
    imageData = context.createImageData(inputWidth, inputHeight);
    // cached canvas
    cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = inputWidth;
    cacheCanvas.height = inputHeight;

    // propagate events
    this.addViewEventListeners();
    this.addCanvasListeners();
  };

  /**
   * Set the image associated to the view.
   *
   * @param {object} img The image.
   */
  this.setViewImage = function (img) {
    view.setImage(img);
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

  /**
   * Clear the context and reset the image data.
   */
  this.clear = function () {
    context.clearRect(0, 0, canvas.width, canvas.height);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    this.resetLayout();
  };

  /**
   * Merge two layers.
   *
   * @param {dwv.html.ImageLayer} layerToMerge The layer to merge.
   *   It will also be emptied.
   */
  this.merge = function (layerToMerge) {
    // basic resampling of the merge data to put it at zoom 1:1
    var mergeImageData = layerToMerge.getContext().getImageData(
      0, 0, canvas.width, canvas.height);
    var offMerge = 0;
    var offMergeJ = 0;
    var offThis = 0;
    var offThisJ = 0;
    var alpha = 0;
    for (var j = 0; j < canvas.height; ++j) {
      offMergeJ = parseInt((origin.y + j * zoom.y), 10) * canvas.width;
      offThisJ = j * canvas.width;
      for (var i = 0; i < canvas.width; ++i) {
        // 4 component data: RGB + alpha
        offMerge = 4 * (parseInt((origin.x + i * zoom.x), 10) + offMergeJ);
        offThis = 4 * (i + offThisJ);
        // merge non transparent
        alpha = mergeImageData.data[offMerge + 3];
        if (alpha !== 0) {
          imageData.data[offThis] = mergeImageData.data[offMerge];
          imageData.data[offThis + 1] = mergeImageData.data[offMerge + 1];
          imageData.data[offThis + 2] = mergeImageData.data[offMerge + 2];
          imageData.data[offThis + 3] = alpha;
        }
      }
    }
    // empty and reset merged layer
    layerToMerge.clear();
    // draw the layer
    this.draw();
  };

  /**
   * Set the line colour for the layer.
   *
   * @param {string} colour The line colour.
   */
  this.setLineColour = function (colour) {
    context.fillStyle = colour;
    context.strokeStyle = colour;
  };

  /**
   * Display the layer.
   *
   * @param {boolean} flag Whether to display the layer or not.
   */
  this.display = function (flag) {
    canvas.style.display = flag ? '' : 'none';
  };

  /**
   * Check if the layer is visible.
   *
   * @returns {boolean} True if the layer is visible.
   */
  this.isVisible = function () {
    return canvas.style.display === '';
  };

  /**
   * Align on another layer.
   *
   * @param {dwv.html.ImageLayer} rhs The layer to align on.
   */
  this.align = function (rhs) {
    canvas.style.top = rhs.getCanvas().offsetTop;
    canvas.style.left = rhs.getCanvas().offsetLeft;
  };

  /**
   * Add view listeners.
   */
  this.addViewEventListeners = function () {
    // propagate
    view.addEventListener('slicechange', fireEvent);
    view.addEventListener('framechange', fireEvent);
    view.addEventListener('wlwidthchange', fireEvent);
    view.addEventListener('wlcenterchange', fireEvent);
    view.addEventListener('wlpresetadd', fireEvent);
    view.addEventListener('colourchange', fireEvent);
    view.addEventListener('positionchange', fireEvent);
  };

  /**
   * Add canvas mouse and touch listeners.
   */
  this.addCanvasListeners = function () {
    // allow pointer events
    canvas.setAttribute('style', 'pointer-events: auto;');
    // mouse listeners
    canvas.addEventListener('mousedown', fireEvent);
    canvas.addEventListener('mousemove', fireEvent);
    canvas.addEventListener('mouseup', fireEvent);
    canvas.addEventListener('mouseout', fireEvent);
    canvas.addEventListener('mousewheel', fireEvent);
    canvas.addEventListener('DOMMouseScroll', fireEvent);
    canvas.addEventListener('dblclick', fireEvent);
    // touch listeners
    canvas.addEventListener('touchstart', fireEvent);
    canvas.addEventListener('touchmove', fireEvent);
    canvas.addEventListener('touchend', fireEvent);
  };

  /**
   * Remove canvas mouse and touch listeners.
   */
  this.removeCanvasListeners = function () {
    // disable pointer events
    canvas.setAttribute('style', 'pointer-events: none;');
    // mouse listeners
    canvas.removeEventListener('mousedown', fireEvent);
    canvas.removeEventListener('mousemove', fireEvent);
    canvas.removeEventListener('mouseup', fireEvent);
    canvas.removeEventListener('mouseout', fireEvent);
    canvas.removeEventListener('mousewheel', fireEvent);
    canvas.removeEventListener('DOMMouseScroll', fireEvent);
    canvas.removeEventListener('dblclick', fireEvent);
    // touch listeners
    canvas.removeEventListener('touchstart', fireEvent);
    canvas.removeEventListener('touchmove', fireEvent);
    canvas.removeEventListener('touchend', fireEvent);
  };

}; // ImageLayer class

/**
 * Get the positions (without the parent offset) of a list of touch events.
 *
 * @param {Array} touches The list of touch events.
 * @returns {Array} The list of positions of the touch events.
 */
dwv.html.getTouchesPositions = function (touches) {
  // get the touch offset from all its parents
  var offsetLeft = 0;
  var offsetTop = 0;
  if (touches.length !== 0 &&
    typeof touches[0].target !== 'undefined') {
    var offsetParent = touches[0].target.offsetParent;
    while (offsetParent) {
      if (!isNaN(offsetParent.offsetLeft)) {
        offsetLeft += offsetParent.offsetLeft;
      }
      if (!isNaN(offsetParent.offsetTop)) {
        offsetTop += offsetParent.offsetTop;
      }
      offsetParent = offsetParent.offsetParent;
    }
  } else {
    dwv.logger.debug('No touch target offset parent.');
  }
  // set its position
  var positions = [];
  for (var i = 0; i < touches.length; ++i) {
    positions.push({
      x: touches[i].pageX - offsetLeft,
      y: touches[i].pageY - offsetTop
    });
  }
  return positions;
};

/**
 * Get the offset of an input event.
 *
 * @param {object} event The event to get the offset from.
 * @returns {Array} The array of offsets.
 */
dwv.html.getEventOffset = function (event) {
  var positions = [];
  if (typeof event.targetTouches !== 'undefined' &&
    event.targetTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/targetTouches
    positions = dwv.html.getTouchesPositions(event.targetTouches);
  } else if (typeof event.changedTouches !== 'undefined' &&
      event.changedTouches.length !== 0) {
    // see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent/changedTouches
    positions = dwv.html.getTouchesPositions(event.changedTouches);
  } else {
    // layerX is used by Firefox
    var ex = event.offsetX === undefined ? event.layerX : event.offsetX;
    var ey = event.offsetY === undefined ? event.layerY : event.offsetY;
    positions.push({x: ex, y: ey});
  }
  return positions;
};
