// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * ZoomAndPan class.
 *
 * @class
 * @param {object} app The associated application.
 */
dwv.tool.ZoomAndPan = function (app) {
  /**
   * Closure to self: to be used by event handlers.
   *
   * @private
   * @type {object}
   */
  var self = this;
  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  this.started = false;

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  this.mousedown = function (event) {
    self.started = true;
    // first position
    self.x0 = event._xs;
    self.y0 = event._ys;
  };

  /**
   * Handle two touch down event.
   *
   * @param {object} event The touch down event.
   */
  this.twotouchdown = function (event) {
    self.started = true;
    // store first point
    self.x0 = event._x;
    self.y0 = event._y;
    // first line
    var point0 = new dwv.math.Point2D(event._x, event._y);
    var point1 = new dwv.math.Point2D(event._x1, event._y1);
    self.line0 = new dwv.math.Line(point0, point1);
    self.midPoint = self.line0.getMidpoint();
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
    // calculate translation
    var tx = event._xs - self.x0;
    var ty = event._ys - self.y0;
    // apply translation
    app.translate(tx, ty);
    // reset origin point
    self.x0 = event._xs;
    self.y0 = event._ys;
  };

  /**
   * Handle two touch move event.
   *
   * @param {object} event The touch move event.
   */
  this.twotouchmove = function (event) {
    if (!self.started) {
      return;
    }
    var point0 = new dwv.math.Point2D(event._x, event._y);
    var point1 = new dwv.math.Point2D(event._x1, event._y1);
    var newLine = new dwv.math.Line(point0, point1);
    var lineRatio = newLine.getLength() / self.line0.getLength();

    if (lineRatio === 1) {
      // scroll mode
      // difference  to last position
      var diffY = event._y - self.y0;
      // do not trigger for small moves
      if (Math.abs(diffY) < 15) {
        return;
      }
      var layerDetails = dwv.gui.getLayerDetailsFromToolEvent(event);
      var layerGroup = app.getLayerGroupById(layerDetails.groupId);
      var viewController =
        layerGroup.getActiveViewLayer().getViewController();
      var size = app.getImage().getGeometry().getSize();
      // update view controller
      if (size.canScroll(2)) {
        if (diffY > 0) {
          viewController.incrementIndex(2);
        } else {
          viewController.decrementIndex(2);
        }
      }
    } else {
      // zoom mode
      var zoom = (lineRatio - 1) / 2;
      if (Math.abs(zoom) % 0.1 <= 0.05) {
        app.zoom(zoom, event._xs, event._ys);
      }
    }
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} _event The mouse up event.
   */
  this.mouseup = function (_event) {
    if (self.started) {
      // stop recording
      self.started = false;
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
    var touches = event.targetTouches;
    if (touches.length === 1) {
      self.mousedown(event);
    } else if (touches.length === 2) {
      self.twotouchdown(event);
    }
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  this.touchmove = function (event) {
    var touches = event.targetTouches;
    if (touches.length === 1) {
      self.mousemove(event);
    } else if (touches.length === 2) {
      self.twotouchmove(event);
    }
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  this.touchend = function (event) {
    self.mouseup(event);
  };

  /**
   * Handle mouse wheel event.
   *
   * @param {object} event The mouse wheel event.
   */
  this.wheel = function (event) {
    var step = -event.deltaY / 500;
    app.zoom(step, event._xs, event._ys);
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  this.keydown = function (event) {
    event.context = 'dwv.tool.ZoomAndPan';
    app.onKeydown(event);
  };

  /**
   * Activate the tool.
   *
   * @param {boolean} _bool The flag to activate or not.
   */
  this.activate = function (_bool) {
    // does nothing
  };

}; // ZoomAndPan class

/**
 * Help for this tool.
 *
 * @returns {object} The help content.
 */
dwv.tool.ZoomAndPan.prototype.getHelpKeys = function () {
  return {
    title: 'tool.ZoomAndPan.name',
    brief: 'tool.ZoomAndPan.brief',
    mouse: {
      mouse_wheel: 'tool.ZoomAndPan.mouse_wheel',
      mouse_drag: 'tool.ZoomAndPan.mouse_drag'
    },
    touch: {
      twotouch_pinch: 'tool.ZoomAndPan.twotouch_pinch',
      touch_drag: 'tool.ZoomAndPan.touch_drag'
    }
  };
};

/**
 * Initialise the tool.
 */
dwv.tool.ZoomAndPan.prototype.init = function () {
  // does nothing
};
