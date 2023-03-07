// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * WindowLevel tool: handle window/level related events.
 *
 * @class
 * @param {dwv.App} app The associated application.
 * @example
 * // create the dwv app
 * var app = new dwv.App();
 * // initialise
 * app.init({
 *   dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
 *   tools: {WindowLevel: {}}
 * });
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('WindowLevel');
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
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
   * Scroll wheel handler.
   *
   * @type {dwv.tool.ScrollWheel}
   */
  var scrollWhell = new dwv.tool.ScrollWheel(app);

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
    var layerGroup = app.getLayerGroupByDivId(layerDetails.groupDivId);
    var viewController =
      layerGroup.getActiveViewLayer().getViewController();

    // difference to last position
    var diffX = event._x - self.x0;
    var diffY = self.y0 - event._y;
    // data range
    var range = viewController.getImageRescaledDataRange();
    // 1/1000 seems to give reasonable results...
    var pixelToIntensity = (range.max - range.min) * 0.01;

    // calculate new window level
    var center = parseInt(viewController.getWindowLevel().center, 10);
    var width = parseInt(viewController.getWindowLevel().width, 10);
    var windowCenter = center + Math.round(diffY * pixelToIntensity);
    var windowWidth = width + Math.round(diffX * pixelToIntensity);
    // bound window width
    windowWidth = dwv.image.validateWindowWidth(windowWidth);

    // add the manual preset to the view
    viewController.addWindowLevelPresets({
      manual: {
        wl: [new dwv.image.WindowLevel(windowCenter, windowWidth)],
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
    var layerGroup = app.getLayerGroupByDivId(layerDetails.groupDivId);
    var viewLayer = layerGroup.getActiveViewLayer();
    var index = viewLayer.displayToPlaneIndex(event._x, event._y);
    var viewController = viewLayer.getViewController();
    var image = app.getImage(viewLayer.getDataIndex());

    // update view controller
    viewController.setWindowLevel(
      parseInt(image.getRescaledValueAtIndex(
        viewController.getCurrentIndex().getWithNew2D(
          index.get(0),
          index.get(1)
        )
      ), 10),
      parseInt(viewController.getWindowLevel().width, 10));
  };

  /**
   * Handle mouse wheel event.
   *
   * @param {object} event The mouse wheel event.
   */
  this.wheel = function (event) {
    scrollWhell.wheel(event);
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
