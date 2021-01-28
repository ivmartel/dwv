// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};
/**
 * The magic wand namespace.
 *
 * @external MagicWand
 * @see https://github.com/Tamersoul/magic-wand-js
 */
var MagicWand = MagicWand || {};

/**
 * Floodfill painting tool.
 *
 * @class
 * @param {object} app The associated application.
 */
dwv.tool.Floodfill = function (app) {
  /**
   * Original variables from external library. Used as in the lib example.
   *
   * @private
   * @type {number}
   */
  var blurRadius = 5;
  /**
   * Original variables from external library. Used as in the lib example.
   *
   * @private
   * @type {number}
   */
  var simplifyTolerant = 0;
  /**
   * Original variables from external library. Used as in the lib example.
   *
   * @private
   * @type {number}
   */
  var simplifyCount = 2000;
  /**
   * Canvas info
   *
   * @private
   * @type {object}
   */
  var imageInfo = null;
  /**
   * Object created by MagicWand lib containing border points
   *
   * @private
   * @type {object}
   */
  var mask = null;
  /**
   * threshold default tolerance of the tool border
   *
   * @private
   * @type {number}
   */
  var initialthreshold = 10;
  /**
   * threshold tolerance of the tool border
   *
   * @private
   * @type {number}
   */
  var currentthreshold = null;
  /**
   * Closure to self: to be used by event handlers.
   *
   * @private
   * @type {dwv.tool.Floodfill}
   */
  var self = this;
  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  this.started = false;
  /**
   * Draw command.
   *
   * @private
   * @type {object}
   */
  var command = null;
  /**
   * Current shape group.
   *
   * @private
   * @type {object}
   */
  var shapeGroup = null;
  /**
   * Coordinates of the fist mousedown event.
   *
   * @private
   * @type {object}
   */
  var initialpoint;
  /**
   * Floodfill border.
   *
   * @private
   * @type {object}
   */
  var border = null;
  /**
   * List of parent points.
   *
   * @private
   * @type {Array}
   */
  var parentPoints = [];
  /**
   * Assistant variable to paint border on all slices.
   *
   * @private
   * @type {boolean}
   */
  var extender = false;
  /**
   * Timeout for painting on mousemove.
   *
   * @private
   */
  var painterTimeout;
  /**
   * Drawing style.
   *
   * @type {dwv.html.Style}
   */
  this.style = new dwv.html.Style();

  /**
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

  /**
   * Set extend option for painting border on all slices.
   *
   * @param {boolean} bool The option to set
   */
  this.setExtend = function (bool) {
    extender = bool;
  };

  /**
   * Get extend option for painting border on all slices.
   *
   * @returns {boolean} The actual value of of the variable to use Floodfill
   *   on museup.
   */
  this.getExtend = function () {
    return extender;
  };

  /**
   * Get (x, y) coordinates referenced to the canvas
   *
   * @param {object} event The original event.
   * @returns {object} The coordinates as a {x,y}.
   * @private
   */
  var getCoord = function (event) {
    return {x: event._x, y: event._y};
  };

  /**
   * Calculate border.
   *
   * @private
   * @param {object} points The input points.
   * @param {number} threshold The threshold of the floodfill.
   * @param {boolean} simple Return first points or a list.
   * @returns {Array} The parent points.
   */
  var calcBorder = function (points, threshold, simple) {

    parentPoints = [];
    var image = {
      data: imageInfo.data,
      width: imageInfo.width,
      height: imageInfo.height,
      bytes: 4
    };

    // var p = new dwv.math.FastPoint2D(points.x, points.y);
    mask = MagicWand.floodFill(image, points.x, points.y, threshold);
    mask = MagicWand.gaussBlurOnlyBorder(mask, blurRadius);

    var cs = MagicWand.traceContours(mask);
    cs = MagicWand.simplifyContours(cs, simplifyTolerant, simplifyCount);

    if (cs.length > 0 && cs[0].points[0].x) {
      if (simple) {
        return cs[0].points;
      }
      for (var j = 0, icsl = cs[0].points.length; j < icsl; j++) {
        parentPoints.push(new dwv.math.Point2D(
          cs[0].points[j].x,
          cs[0].points[j].y
        ));
      }
      return parentPoints;
    } else {
      return false;
    }
  };

  /**
   * Paint Floodfill.
   *
   * @private
   * @param {object} point The start point.
   * @param {number} threshold The border threshold.
   * @returns {boolean} False if no border.
   */
  var paintBorder = function (point, threshold) {
    // Calculate the border
    border = calcBorder(point, threshold);
    // Paint the border
    if (border) {
      var factory = new dwv.tool.draw.RoiFactory();
      shapeGroup = factory.create(border, self.style);
      shapeGroup.id(dwv.math.guid());

      // get the position group
      var posGroup = app.getDrawController().getCurrentPosGroup();
      // add shape group to position group
      posGroup.add(shapeGroup);

      // draw shape command
      command = new dwv.tool.DrawGroupCommand(shapeGroup, 'floodfill',
        app.getDrawController().getDrawLayer());
      command.onExecute = fireEvent;
      command.onUndo = fireEvent;
      // // draw
      command.execute();
      // save it in undo stack
      app.addToUndoStack(command);

      return true;
    } else {
      return false;
    }
  };

  /**
   * Create Floodfill in all the prev and next slices while border is found
   *
   * @param {number} ini The first slice to extend to.
   * @param {number} end The last slice to extend to.
   */
  this.extend = function (ini, end) {
    //avoid errors
    if (!initialpoint) {
      throw '\'initialpoint\' not found. User must click before use extend!';
    }
    // remove previous draw
    if (shapeGroup) {
      shapeGroup.destroy();
    }

    var pos = app.getViewController().getCurrentPosition();
    var threshold = currentthreshold || initialthreshold;

    // Iterate over the next images and paint border on each slice.
    for (var i = pos.k,
      len = end
        ? end : app.getImage().getGeometry().getSize().getNumberOfSlices();
      i < len; i++) {
      if (!paintBorder(initialpoint, threshold)) {
        break;
      }
      app.getViewController().incrementSliceNb();
    }
    app.getViewController().setCurrentPosition(pos);

    // Iterate over the prev images and paint border on each slice.
    for (var j = pos.k, jl = ini ? ini : 0; j > jl; j--) {
      if (!paintBorder(initialpoint, threshold)) {
        break;
      }
      app.getViewController().decrementSliceNb();
    }
    app.getViewController().setCurrentPosition(pos);
  };

  /**
   * Modify tolerance threshold and redraw ROI.
   *
   * @param {number} modifyThreshold The new threshold.
   * @param {shape} shape The shape to update.
   */
  this.modifyThreshold = function (modifyThreshold, shape) {

    if (!shape && shapeGroup) {
      shape = shapeGroup.getChildren(function (node) {
        return node.name() === 'shape';
      })[0];
    } else {
      throw 'No shape found';
    }

    clearTimeout(painterTimeout);
    painterTimeout = setTimeout(function () {
      border = calcBorder(initialpoint, modifyThreshold, true);
      if (!border) {
        return false;
      }
      var arr = [];
      for (var i = 0, bl = border.length; i < bl; ++i) {
        arr.push(border[i].x);
        arr.push(border[i].y);
      }
      shape.setPoints(arr);
      var shapeLayer = shape.getLayer();
      shapeLayer.draw();
      self.onThresholdChange(modifyThreshold);
    }, 100);
  };

  /**
   * Event fired when threshold change
   *
   * @param {number} _value Current threshold
   */
  this.onThresholdChange = function (_value) {
    // Defaults do nothing
  };

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  this.mousedown = function (event) {
    imageInfo = app.getImageData();
    if (!imageInfo) {
      dwv.logger.error('No image found');
      return;
    }

    self.started = true;
    initialpoint = getCoord(event);
    paintBorder(initialpoint, initialthreshold);
    self.onThresholdChange(initialthreshold);
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  this.mousemove = function (event) {
    if (!self.started) {
      return;
    }
    var movedpoint = getCoord(event);
    currentthreshold = Math.round(Math.sqrt(
      Math.pow((initialpoint.x - movedpoint.x), 2) +
      Math.pow((initialpoint.y - movedpoint.y), 2)) / 2);
    currentthreshold = currentthreshold < initialthreshold
      ? initialthreshold : currentthreshold - initialthreshold;
    self.modifyThreshold(currentthreshold);
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} _event The mouse up event.
   */
  this.mouseup = function (_event) {
    self.started = false;
    if (extender) {
      self.extend();
    }
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  this.mouseout = function (event) {
    self.mouseup(event);
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  this.touchstart = function (event) {
    // treat as mouse down
    self.mousedown(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  this.touchmove = function (event) {
    // treat as mouse move
    self.mousemove(event);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  this.touchend = function (event) {
    // treat as mouse up
    self.mouseup(event);
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  this.keydown = function (event) {
    event.context = 'dwv.tool.Floodfill';
    app.onKeydown(event);
  };

  /**
   * Activate the tool.
   *
   * @param {boolean} bool The flag to activate or not.
   */
  this.activate = function (bool) {
    if (bool) {
      // init with the app window scale
      this.style.setScale(app.getWindowScale());
      // set the default to the first in the list
      this.setLineColour(this.style.getLineColour());
    }
  };

  /**
   * Initialise the tool.
   */
  this.init = function () {
    // does nothing
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

}; // Floodfill class

/**
 * Help for this tool.
 *
 * @returns {object} The help content.
 */
dwv.tool.Floodfill.prototype.getHelpKeys = function () {
  return {
    title: 'tool.Floodfill.name',
    brief: 'tool.Floodfill.brief',
    mouse: {
      click: 'tool.Floodfill.click'
    },
    touch: {
      tap: 'tool.Floodfill.tap'
    }
  };
};

/**
 * Set the line colour of the drawing.
 *
 * @param {string} colour The colour to set.
 */
dwv.tool.Floodfill.prototype.setLineColour = function (colour) {
  // set style var
  this.style.setLineColour(colour);
};
