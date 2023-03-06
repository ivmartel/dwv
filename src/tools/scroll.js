// namespaces
var dwv = dwv || {};
dwv.tool = dwv.tool || {};

/**
 * Scroll class.
 *
 * @class
 * @param {dwv.App} app The associated application.
 * @example
 * // create the dwv app
 * var app = new dwv.App();
 * // initialise
 * app.init({
 *   dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
 *   tools: {Scroll: {}}
 * });
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('Scroll');
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm',
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm',
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323563.dcm'
 * ]);
 * @example <caption>Example with slider</caption>
 * // create the dwv app
 * var app = new dwv.App();
 * // initialise
 * app.init({
 *   dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
 *   tools: {Scroll: {}}
 * });
 * // create range
 * var range = document.createElement('input');
 * range.type = 'range';
 * range.min = 0;
 * range.id = 'sliceRange';
 * document.body.appendChild(range);
 * // update app on slider change
 * range.oninput = function () {
 *   var lg = app.getLayerGroupByDivId('layerGroup0');
 *   var vc = lg.getActiveViewLayer().getViewController();
 *   var index = vc.getCurrentIndex();
 *   var values = index.getValues();
 *   values[2] = this.value;
 *   vc.setCurrentIndex(new dwv.math.Index(values));
 * }
 * // activate tool and update range max on load
 * app.addEventListener('load', function () {
 *   app.setTool('Scroll');
 *   var size = app.getImage(0).getGeometry().getSize();
 *   range.max = size.get(2) - 1;
 * });
 * // update slider on slice change (for ex via mouse wheel)
 * app.addEventListener('positionchange', function () {
 *   var lg = app.getLayerGroupByDivId('layerGroup0');
 *   var vc = lg.getActiveViewLayer().getViewController();
 *   range.value = vc.getCurrentIndex().get(2);
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm',
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm',
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323563.dcm'
 * ]);
 */
dwv.tool.Scroll = function (app) {
  /**
   * Closure to self: to be used by event handlers.
   *
   * @private
   * @type {dwv.tool.Scroll}
   */
  var self = this;
  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  this.started = false;
  // touch timer ID (created by setTimeout)
  var touchTimerID = null;

  /**
   * Scroll wheel handler.
   *
   * @type {dwv.tool.ScrollWheel}
   */
  var scrollWhell = new dwv.tool.ScrollWheel(app);

  /**
   * Option to show or not a value tooltip on mousemove.
   *
   * @type {boolean}
   */
  var displayTooltip = false;

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  this.mousedown = function (event) {
    // optional tooltip
    removeTooltipDiv();

    // stop viewer if playing
    var layerDetails = dwv.gui.getLayerDetailsFromEvent(event);
    var layerGroup = app.getLayerGroupByDivId(layerDetails.groupDivId);
    var viewLayer = layerGroup.getActiveViewLayer();
    var viewController = viewLayer.getViewController();
    if (viewController.isPlaying()) {
      viewController.stop();
    }
    // start flag
    self.started = true;
    // first position
    self.x0 = event._x;
    self.y0 = event._y;

    // update controller position
    var planePos = viewLayer.displayToPlanePos(event._x, event._y);
    var position = viewController.getPositionFromPlanePoint(
      planePos.x, planePos.y);
    viewController.setCurrentPosition(position);
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  this.mousemove = function (event) {
    if (!self.started) {
      // optional tooltip
      if (displayTooltip) {
        showTooltip(event);
      }
      return;
    }

    var layerDetails = dwv.gui.getLayerDetailsFromEvent(event);
    var layerGroup = app.getLayerGroupByDivId(layerDetails.groupDivId);
    var viewLayer = layerGroup.getActiveViewLayer();
    var viewController = viewLayer.getViewController();

    // difference to last Y position
    var diffY = event._y - self.y0;
    var yMove = (Math.abs(diffY) > 15);
    // do not trigger for small moves
    if (yMove && viewController.canScroll()) {
      // update view controller
      if (diffY > 0) {
        viewController.decrementScrollIndex();
      } else {
        viewController.incrementScrollIndex();
      }
    }

    // difference to last X position
    var diffX = event._x - self.x0;
    var xMove = (Math.abs(diffX) > 15);
    // do not trigger for small moves
    var imageSize = viewController.getImageSize();
    if (xMove && imageSize.moreThanOne(3)) {
      // update view controller
      if (diffX > 0) {
        viewController.incrementIndex(3);
      } else {
        viewController.decrementIndex(3);
      }
    }

    // reset origin point
    if (xMove) {
      self.x0 = event._x;
    }
    if (yMove) {
      self.y0 = event._y;
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
    // remove possible tooltip div
    removeTooltipDiv();
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  this.touchstart = function (event) {
    // long touch triggers the dblclick
    touchTimerID = setTimeout(self.dblclick, 500);
    // call mouse equivalent
    self.mousedown(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  this.touchmove = function (event) {
    // abort timer if move
    if (touchTimerID !== null) {
      clearTimeout(touchTimerID);
      touchTimerID = null;
    }
    // call mouse equivalent
    self.mousemove(event);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  this.touchend = function (event) {
    // abort timer
    if (touchTimerID !== null) {
      clearTimeout(touchTimerID);
      touchTimerID = null;
    }
    // call mouse equivalent
    self.mouseup(event);
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
    event.context = 'dwv.tool.Scroll';
    app.onKeydown(event);
  };

  /**
   * Handle double click.
   *
   * @param {object} event The key down event.
   */
  this.dblclick = function (event) {
    var layerDetails = dwv.gui.getLayerDetailsFromEvent(event);
    var layerGroup = app.getLayerGroupByDivId(layerDetails.groupDivId);
    var viewController =
      layerGroup.getActiveViewLayer().getViewController();
    viewController.play();
  };

  /**
   * Displays a tooltip in a temparary `span`.
   * Works with css to hide/show the span only on mouse hover.
   *
   * @param {object} event The mouse move event.
   */
  function showTooltip(event) {
    // remove previous div
    removeTooltipDiv();

    // get image value at position
    var layerDetails = dwv.gui.getLayerDetailsFromEvent(event);
    var layerGroup = app.getLayerGroupByDivId(layerDetails.groupDivId);
    var viewLayer = layerGroup.getActiveViewLayer();
    var viewController = viewLayer.getViewController();
    var planePos = viewLayer.displayToPlanePos(event._x, event._y);
    var position = viewController.getPositionFromPlanePoint(
      planePos.x, planePos.y);
    var value = viewController.getRescaledImageValue(position);

    // create
    if (typeof value !== 'undefined') {
      var span = document.createElement('span');
      span.id = 'scroll-tooltip';
      // place span in layer group to avoid upper layer opacity
      var layerDiv = document.getElementById(viewLayer.getId());
      layerDiv.parentElement.appendChild(span);
      // position tooltip
      span.style.left = (event._x + 10) + 'px';
      span.style.top = (event._y + 10) + 'px';
      var text = dwv.utils.precisionRound(value, 3);
      if (typeof viewController.getPixelUnit() !== 'undefined') {
        text += ' ' + viewController.getPixelUnit();
      }
      span.appendChild(document.createTextNode(text));
    }
  }

  /**
   * Remove the tooltip html div.
   */
  function removeTooltipDiv() {
    var div = document.getElementById('scroll-tooltip');
    if (div) {
      div.remove();
    }
  }

  /**
   * Activate the tool.
   *
   * @param {boolean} _bool The flag to activate or not.
   */
  this.activate = function (_bool) {
    // remove tooltip html when deactivating
    if (!_bool) {
      removeTooltipDiv();
    }
  };

  /**
   * Set the tool live features: disaply tooltip.
   *
   * @param {object} features The list of features.
   */
  this.setFeatures = function (features) {
    if (typeof features.displayTooltip !== 'undefined') {
      displayTooltip = features.displayTooltip;
    }
  };

  /**
   * Initialise the tool.
   */
  this.init = function () {
    // does nothing
  };

}; // Scroll class

/**
 * Help for this tool.
 *
 * @returns {object} The help content.
 */
dwv.tool.Scroll.prototype.getHelpKeys = function () {
  return {
    title: 'tool.Scroll.name',
    brief: 'tool.Scroll.brief',
    mouse: {
      mouse_drag: 'tool.Scroll.mouse_drag',
      double_click: 'tool.Scroll.double_click'
    },
    touch: {
      touch_drag: 'tool.Scroll.touch_drag',
      tap_and_hold: 'tool.Scroll.tap_and_hold'
    }
  };
};
