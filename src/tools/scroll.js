import {getLayerDetailsFromEvent} from '../gui/layerGroup';
import {precisionRound} from '../utils/string';
import {ScrollWheel} from './scrollWheel';

/**
 * Scroll class.
 *
 * @class
 * @param {App} app The associated application.
 * @example
 * // create the dwv app
 * var app = new App();
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
 * var app = new App();
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
 *   vc.setCurrentIndex(new math.Index(values));
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
export class Scroll {

  #app;
  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  #started = false;
  /**
   * Scroll wheel handler.
   *
   * @type {ScrollWheel}
   */
  #scrollWhell;

  // touch timer ID (created by setTimeout)
  #touchTimerID = null;

  constructor(app) {
    this.#app = app;
    this.#scrollWhell = new ScrollWheel(app);
  }

  /**
   * Option to show or not a value tooltip on mousemove.
   *
   * @type {boolean}
   */
  #displayTooltip = false;

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  mousedown = (event) => {
    // optional tooltip
    this.#removeTooltipDiv();

    // stop viewer if playing
    var layerDetails = getLayerDetailsFromEvent(event);
    var layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    var viewLayer = layerGroup.getActiveViewLayer();
    var viewController = viewLayer.getViewController();
    if (viewController.isPlaying()) {
      viewController.stop();
    }
    // start flag
    this.#started = true;
    // first position
    this.x0 = event._x;
    this.y0 = event._y;

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
  mousemove = (event) => {
    if (!this.#started) {
      // optional tooltip
      if (this.#displayTooltip) {
        this.#showTooltip(event);
      }
      return;
    }

    var layerDetails = getLayerDetailsFromEvent(event);
    var layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    var viewLayer = layerGroup.getActiveViewLayer();
    var viewController = viewLayer.getViewController();

    // difference to last Y position
    var diffY = event._y - this.y0;
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
    var diffX = event._x - this.x0;
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
      this.x0 = event._x;
    }
    if (yMove) {
      this.y0 = event._y;
    }
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} _event The mouse up event.
   */
  mouseup = (_event) => {
    if (this.#started) {
      // stop recording
      this.#started = false;
    }
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  mouseout = (event) => {
    this.mouseup(event);
    // remove possible tooltip div
    this.#removeTooltipDiv();
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  touchstart = (event) => {
    // long touch triggers the dblclick
    this.#touchTimerID = setTimeout(this.dblclick, 500);
    // call mouse equivalent
    this.mousedown(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    // abort timer if move
    if (this.#touchTimerID !== null) {
      clearTimeout(this.#touchTimerID);
      this.#touchTimerID = null;
    }
    // call mouse equivalent
    this.mousemove(event);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  touchend = (event) => {
    // abort timer
    if (this.#touchTimerID !== null) {
      clearTimeout(this.#touchTimerID);
      this.#touchTimerID = null;
    }
    // call mouse equivalent
    this.mouseup(event);
  };

  /**
   * Handle mouse wheel event.
   *
   * @param {object} event The mouse wheel event.
   */
  wheel = (event) => {
    this.#scrollWhell.wheel(event);
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    event.context = 'Scroll';
    this.#app.onKeydown(event);
  };

  /**
   * Handle double click.
   *
   * @param {object} event The key down event.
   */
  dblclick = (event) => {
    var layerDetails = getLayerDetailsFromEvent(event);
    var layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
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
  #showTooltip(event) {
    // remove previous div
    this.#removeTooltipDiv();

    // get image value at position
    var layerDetails = getLayerDetailsFromEvent(event);
    var layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
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
      var text = precisionRound(value, 3);
      if (typeof viewController.getPixelUnit() !== 'undefined') {
        text += ' ' + viewController.getPixelUnit();
      }
      span.appendChild(document.createTextNode(text));
    }
  }

  /**
   * Remove the tooltip html div.
   */
  #removeTooltipDiv() {
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
  activate(_bool) {
    // remove tooltip html when deactivating
    if (!_bool) {
      this.#removeTooltipDiv();
    }
  }

  /**
   * Set the tool live features: disaply tooltip.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.displayTooltip !== 'undefined') {
      this.#displayTooltip = features.displayTooltip;
    }
  }

  /**
   * Initialise the tool.
   */
  init() {
    // does nothing
  }

} // Scroll class
