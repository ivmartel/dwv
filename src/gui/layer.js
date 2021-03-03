// namespaces
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Window layer.
 *
 * @class
 * @param {object} canvas The associated canvas.
 */
dwv.html.Layer = function (canvas) {
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
   * Get the layer canvas.
   *
   * @returns {object} The layer canvas.
   */
  this.getCanvas = function () {
    return canvas;
  };
  /**
   * Get the layer context.
   *
   * @returns {object} The layer context.
   */
  this.getContext = function () {
    return context;
  };
  /**
   * Get the layer offset on page.
   *
   * @returns {number} The layer offset on page.
   */
  this.getOffset = function () {
    return canvas.offset();
  };

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
   * Set the image data array.
   *
   * @param {Array} data The data array.
   */
  this.setImageData = function (data) {
    imageData = data;
    // update the cached canvas
    cacheCanvas.getContext('2d').putImageData(imageData, 0, 0);
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
   */
  this.draw = function () {
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
  };

  /**
   * Initialise the layer: set the canvas and context
   *
   * @param {number} inputWidth The width of the canvas.
   * @param {number} inputHeight The height of the canvas.
   */
  this.initialise = function (inputWidth, inputHeight) {
    // find the canvas element
    //canvas = document.getElementById(name);
    //if (!canvas)
    //{
    //    alert("Error: cannot find the canvas element for '" + name + "'.");
    //    return;
    //}
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
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    // cached canvas
    cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = inputWidth;
    cacheCanvas.height = inputHeight;
  };

  /**
   * Fill the full context with the current style.
   */
  this.fillContext = function () {
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

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
   * @param {dwv.html.Layer} layerToMerge The layer to merge.
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
   * @param {boolean} val Whether to display the layer or not.
   */
  this.setStyleDisplay = function (val) {
    if (val === true) {
      canvas.style.display = '';
    } else {
      canvas.style.display = 'none';
    }
  };

  /**
   * Check if the layer is visible.
   *
   * @returns {boolean} True if the layer is visible.
   */
  this.isVisible = function () {
    if (canvas.style.display === 'none') {
      return false;
    } else {
      return true;
    }
  };

  /**
   * Align on another layer.
   *
   * @param {dwv.html.Layer} rhs The layer to align on.
   */
  this.align = function (rhs) {
    canvas.style.top = rhs.getCanvas().offsetTop;
    canvas.style.left = rhs.getCanvas().offsetLeft;
  };
}; // Layer class

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
