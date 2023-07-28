import {ScrollWheel} from './scrollWheel';
import {getLayerDetailsFromEvent} from '../gui/layerGroup';
import {validateWindowWidth} from '../image/windowCenterAndWidth';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

/**
 * WindowLevel tool: handle window/level related events.
 *
 * @example
 * // create the dwv app
 * const app = new dwv.App();
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

  /**
   * Associated app.
   *
   * @type {App}
   */
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

  /**
   * @param {App} app The associated application.
   */
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
    if (!this.#started) {
      return;
    }

    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewController =
      layerGroup.getActiveViewLayer().getViewController();

    // difference to last position
    const diffX = event._x - this.x0;
    const diffY = this.y0 - event._y;
    // data range
    const range = viewController.getImageRescaledDataRange();
    // 1/1000 seems to give reasonable results...
    const pixelToIntensity = (range.max - range.min) * 0.01;

    // calculate new window level
    const center = parseInt(viewController.getWindowLevel().center, 10);
    const width = parseInt(viewController.getWindowLevel().width, 10);
    const windowCenter = center + Math.round(diffY * pixelToIntensity);
    let windowWidth = width + Math.round(diffX * pixelToIntensity);
    // bound window width
    windowWidth = validateWindowWidth(windowWidth);
    // set
    viewController.setWindowLevel(windowCenter, windowWidth);

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
  dblclick = (event) => {
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const index = viewLayer.displayToPlaneIndex(event._x, event._y);
    const viewController = viewLayer.getViewController();
    const image = this.#app.getImage(viewLayer.getDataId());

    // update view controller
    viewController.setWindowLevel(
      image.getRescaledValueAtIndex(
        viewController.getCurrentIndex().getWithNew2D(
          index.get(0),
          index.get(1)
        )
      ),
      parseInt(viewController.getWindowLevel().width, 10));
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
