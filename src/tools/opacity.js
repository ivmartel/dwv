// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Opacity class.
 *
 * @class
 * @param {object} app The associated application.
 */
dwv.tool.Opacity = function (app) {
  /**
   * Closure to self: to be used by event handlers.
   *
   * @private
   * @type {dwv.tool.Opacity}
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
    // start flag
    self.started = true;
    // first position
    self.x0 = event._x;
    self.y0 = event._y;
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

    // difference to last X position
    var diffX = event._x - self.x0;
    var xMove = (Math.abs(diffX) > 15);
    // do not trigger for small moves
    if (xMove) {
      var layerGroup = app.getLayerGroup();
      var viewLayer = layerGroup.getActiveViewLayer();
      var op = viewLayer.getOpacity();
      viewLayer.setOpacity(op + (diffX / 200));
      viewLayer.draw();

      // reset origin point
      self.x0 = event._x;
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
    // call mouse equivalent
    self.mousedown(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  this.touchmove = function (event) {
    // call mouse equivalent
    self.mousemove(event);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  this.touchend = function (event) {
    // call mouse equivalent
    self.mouseup(event);
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  this.keydown = function (event) {
    event.context = 'dwv.tool.Opacity';
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

  /**
   * Initialise the tool.
   */
  this.init = function () {
    // does nothing
  };

}; // Opacity class

/**
 * Help for this tool.
 *
 * @returns {object} The help content.
 */
dwv.tool.Opacity.prototype.getHelpKeys = function () {
  return {
    title: 'tool.Opacity.name',
    brief: 'tool.Opacity.brief',
    mouse: {
      mouse_drag: 'tool.Opacity.mouse_drag',
    },
    touch: {
      touch_drag: 'tool.Opacity.touch_drag',
    }
  };
};
