import {ScrollWheel} from './scrollWheel';

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
export class WindowLevel {

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

  constructor(app) {
    this.#app = app;
    this.#scrollWhell = new ScrollWheel(app);
  }

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  mousedown = (event) => {
    // set start flag
    this.#started = true;
    // store initial position
    this.x0 = event._x;
    this.y0 = event._y;
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  mousemove = (event) => {
    // check start flag
    if (!this.started) {
      return;
    }

    var layerDetails = dwv.gui.getLayerDetailsFromEvent(event);
    var layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    var viewController =
      layerGroup.getActiveViewLayer().getViewController();

    // difference to last position
    var diffX = event._x - this.x0;
    var diffY = this.y0 - event._y;
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
    this.x0 = event._x;
    this.y0 = event._y;
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} _event The mouse up event.
   */
  mouseup = (_event) => {
    // set start flag
    if (this.#started) {
      this.#started = false;
    }
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  mouseout = (event) => {
    // treat as mouse up
    this.mouseup(event);
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  touchstart = (event) => {
    this.mousedown(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    this.mousemove(event);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  touchend = (event) => {
    this.mouseup(event);
  };

  /**
   * Handle double click event.
   *
   * @param {object} event The double click event.
   */
  dblclick(event) {
    var layerDetails = dwv.gui.getLayerDetailsFromEvent(event);
    var layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    var viewLayer = layerGroup.getActiveViewLayer();
    var index = viewLayer.displayToPlaneIndex(event._x, event._y);
    var viewController = viewLayer.getViewController();
    var image = this.#app.getImage(viewLayer.getDataIndex());

    // update view controller
    viewController.setWindowLevel(
      parseInt(image.getRescaledValueAtIndex(
        viewController.getCurrentIndex().getWithNew2D(
          index.get(0),
          index.get(1)
        )
      ), 10),
      parseInt(viewController.getWindowLevel().width, 10));
  }

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
    event.context = 'WindowLevel';
    this.#app.onKeydown(event);
  };

  /**
   * Activate the tool.
   *
   * @param {boolean} _bool The flag to activate or not.
   */
  activate(_bool) {
    // does nothing
  }

  /**
   * Initialise the tool.
   */
  init() {
    // does nothing
  }

} // WindowLevel class
