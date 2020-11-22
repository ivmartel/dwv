// namespaces
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Window layer.
 * @constructor
 * @param {String} name The name of the layer.
 */
dwv.html.Layer = function (canvas) {
  /**
     * A cache of the initial canvas.
     * @private
     * @type Object
     */
  var cacheCanvas = null;
  /**
     * The associated CanvasRenderingContext2D.
     * @private
     * @type Object
     */
  var context = null;

  /**
     * Get the layer canvas.
     * @return {Object} The layer canvas.
     */
  this.getCanvas = function () {
    return canvas;
  };
  /**
     * Get the layer context.
     * @return {Object} The layer context.
     */
  this.getContext = function () {
    return context;
  };
  /**
     * Get the layer offset on page.
     * @return {Number} The layer offset on page.
     */
  this.getOffset = function () {
    return canvas.offset();
  };

  /**
     * The image data array.
     * @private
     * @type Array
     */
  var imageData = null;

  /**
     * The layer origin.
     * @private
     * @type {Object}
     */
  var origin = {'x': 0, 'y': 0};
  /**
     * Get the layer origin.
     * @return {Object} The layer origin as {'x','y'}.
     */
  this.getOrigin = function () {
    return origin;
  };
  /**
     * The layer zoom.
     * @private
     * @type {Object}
     */
  var zoom = {'x': 1, 'y': 1};
  /**
     * Get the layer zoom.
     * @return {Object} The layer zoom as {'x','y'}.
     */
  this.getZoom = function () {
    return zoom;
  };

  /**
     * The layer translation.
     * @private
     * @type {Object}
     */
  var trans = {'x': 0, 'y': 0};
  /**
     * Get the layer translation.
     * @return {Object} The layer translation as {'x','y'}.
     */
  this.getTrans = function () {
    return trans;
  };

  /**
     * Set the canvas width.
     * @param {Number} width The new width.
     */
  this.setWidth = function (width) {
    canvas.width = width;
  };
  /**
     * Set the canvas height.
     * @param {Number} height The new height.
     */
  this.setHeight = function (height) {
    canvas.height = height;
  };

  /**
     * Set the layer zoom.
     * @param {Number} newZoomX The zoom in the X direction.
     * @param {Number} newZoomY The zoom in the Y direction.
     * @param {Number} centerX The zoom center in the X direction.
     * @param {Number} centerY The zoom center in the Y direction.
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
     * @param {Number} tx The translation in the X direction.
     * @param {Number} ty The translation in the Y direction.
     */
  this.translate = function (tx, ty) {
    trans.x = tx;
    trans.y = ty;
  };

  /**
     * Set the image data array.
     * @param {Array} data The data array.
     */
  this.setImageData = function (data) {
    imageData = data;
    // update the cached canvas
    cacheCanvas.getContext('2d').putImageData(imageData, 0, 0);
  };

  /**
     * Reset the layout.
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
     */
  this.displayToIndex = function (point2D) {
    return {'x': ((point2D.x - origin.x) / zoom.x) - trans.x,
      'y': ((point2D.y - origin.y) / zoom.y) - trans.y};
  };

  /**
     * Draw the content (imageData) of the layer.
     * The imageData variable needs to be set
     */
  this.draw = function () {
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
    context.drawImage(cacheCanvas, 0, 0);
  };

  /**
     * Initialise the layer: set the canvas and context
     * @input {Number} inputWidth The width of the canvas.
     * @input {Number} inputHeight The height of the canvas.
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
     * @input {Layer} layerToMerge The layer to merge. It will also be emptied.
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
     * @input {String} colour The line colour.
     */
  this.setLineColour = function (colour) {
    context.fillStyle = colour;
    context.strokeStyle = colour;
  };

  /**
     * Display the layer.
     * @input {Boolean} val Whether to display the layer or not.
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
     * @return {Boolean} True if the layer is visible.
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
     * @param {Layer} rhs The layer to align on.
     */
  this.align = function (rhs) {
    canvas.style.top = rhs.getCanvas().offsetTop;
    canvas.style.left = rhs.getCanvas().offsetLeft;
  };
}; // Layer class

/**
 * Get the offset of an input event.
 * @param {Object} event The event to get the offset from.
 * @return {Array} The array of offsets.
 */
dwv.html.getEventOffset = function (event) {
  var positions = [];
  var ex = 0;
  var ey = 0;
  if (event.targetTouches) {
    // get the touch offset from all its parents
    var offsetLeft = 0;
    var offsetTop = 0;
    var offsetParent = event.targetTouches[0].target.offsetParent;
    while (offsetParent) {
      if (!isNaN(offsetParent.offsetLeft)) {
        offsetLeft += offsetParent.offsetLeft;
      }
      if (!isNaN(offsetParent.offsetTop)) {
        offsetTop += offsetParent.offsetTop;
      }
      offsetParent = offsetParent.offsetParent;
    }
    // set its position
    var touch = null;
    for (var i = 0; i < event.targetTouches.length; ++i) {
      touch = event.targetTouches[i];
      ex = touch.pageX - offsetLeft;
      ey = touch.pageY - offsetTop;
      positions.push({'x': ex, 'y': ey});
    }
  } else {
    // layerX is used by Firefox
    ex = event.offsetX === undefined ? event.layerX : event.offsetX;
    ey = event.offsetY === undefined ? event.layerY : event.offsetY;
    positions.push({'x': ex, 'y': ey});
  }
  return positions;
};
