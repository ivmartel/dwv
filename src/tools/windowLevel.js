// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * WindowLevel tool: handle window/level related events.
 *
 * @class
 * @param {object} app The associated application.
 */
dwv.tool.WindowLevel = function (app) {
  /**
   * Closure to self: to be used by event handlers.
   *
   * @private
   * @type {dwv.tool.WindowLevel}
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
    // set start flag
    self.started = true;
    // store initial position
    self.x0 = event._x;
    self.y0 = event._y;
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  this.mousemove = function (event) {
    // check start flag
    if (!self.started) {
      return;
    }

    var layerDetails = dwv.gui.getLayerDetailsFromEvent(event);
    var layerGroup = app.getLayerGroupById(layerDetails.groupId);
    var viewController =
      layerGroup.getActiveViewLayer().getViewController();

    // difference to last position
    var diffX = event._x - self.x0;
    var diffY = self.y0 - event._y;
    // calculate new window level
    var windowCenter =
      parseInt(viewController.getWindowLevel().center, 10) + diffY;
    var windowWidth =
      parseInt(viewController.getWindowLevel().width, 10) + diffX;
    // bound window width
    windowWidth = dwv.image.validateWindowWidth(windowWidth);

    // add the manual preset to the view
    viewController.addWindowLevelPresets({
      manual: {
        wl: new dwv.image.WindowLevel(windowCenter, windowWidth),
        name: 'manual'
      }
    });
    viewController.setWindowLevelPreset('manual');

    // store position
    self.x0 = event._x;
    self.y0 = event._y;
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} _event The mouse up event.
   */
  this.mouseup = function (_event) {
    // set start flag
    if (self.started) {
      self.started = false;
    }
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  this.mouseout = function (event) {
    // treat as mouse up
    self.mouseup(event);
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  this.touchstart = function (event) {
    self.mousedown(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  this.touchmove = function (event) {
    self.mousemove(event);
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
   * Handle double click event.
   *
   * @param {object} event The double click event.
   */
  this.dblclick = function (event) {
    var layerDetails = dwv.gui.getLayerDetailsFromEvent(event);
    var layerGroup = app.getLayerGroupById(layerDetails.groupId);
    var viewController =
      layerGroup.getActiveViewLayer().getViewController();

    // update view controller
    viewController.setWindowLevel(
      parseInt(app.getImage().getRescaledValueAtIndex(
        viewController.getCurrentPosition().getWithNew2D(
          event._x,
          event._y
        )
      ), 10),
      parseInt(viewController.getWindowLevel().width, 10));
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  this.keydown = function (event) {
    event.context = 'dwv.tool.WindowLevel';
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

}; // WindowLevel class

/**
 * Help for this tool.
 *
 * @returns {object} The help content.
 */
dwv.tool.WindowLevel.prototype.getHelpKeys = function () {
  return {
    title: 'tool.WindowLevel.name',
    brief: 'tool.WindowLevel.brief',
    mouse: {
      mouse_drag: 'tool.WindowLevel.mouse_drag',
      double_click: 'tool.WindowLevel.double_click'
    },
    touch: {
      touch_drag: 'tool.WindowLevel.touch_drag'
    }
  };
};
