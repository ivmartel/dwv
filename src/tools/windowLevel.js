import {ScrollWheel} from './scrollWheel.js';
import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic.js';
import {getLayerDetailsFromEvent} from '../gui/layerGroup.js';
import {
  WindowLevel as WindowLevelValues
} from '../image/windowLevel.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application.js';
import {Point2D} from '../math/point.js';
import {LayerGroup} from '../gui/layerGroup.js';
import {ViewLayer} from '../gui/viewLayer.js';
/* eslint-enable no-unused-vars */

/**
 * WindowLevel tool: handle window/level related events.
 *
 * @example
 * import {App, AppOptions, ViewConfig, ToolConfig} from '//esm.sh/dwv';
 * // create the dwv app
 * const app = new App();
 * // initialise
 * const viewConfig0 = new ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new AppOptions(viewConfigs);
 * options.tools = {WindowLevel: new ToolConfig()};
 * app.init(options);
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
   * Start point.
   *
   * @type {Point2D}
   */
  #startPoint;

  /**
   * Scroll wheel handler.
   *
   * @type {ScrollWheel}
   */
  #scrollWhell;

  /**
   * Strict view layer flag: if true, use the active layer
   * (that could be undefined, ie bail) or, if false,
   * try to find the active view layer (active layer if view layer or
   * closest).
   *
   * @type {boolean}
   */
  #strictViewLayer = true;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
    this.#scrollWhell = new ScrollWheel(app);
  }

  /**
   * Get the active view layer. Uses the strictViewLayer flag:
   * if true, use the active layer (that could be undefined,
   * ie bail) or, if false, try to find the active view layer.
   *
   * @param {LayerGroup} layerGroup The layer group of the view layer.
   * @returns {ViewLayer|undefined} The layer.
   */
  #getActiveViewLayer(layerGroup) {
    let layer;
    if (this.#strictViewLayer) {
      layer = layerGroup.getActiveViewLayer();
    } else {
      const callbackFn = function (layer) {
        return layer.getViewController().isMonochrome();
      };
      layer = layerGroup.getViewLayersFromActive(callbackFn)[0];
    }
    return layer;
  }

  /**
   * Start tool interaction.
   *
   * @param {Point2D} point The start point.
   * @param {string} divId The layer group divId.
   */
  #start(point, divId) {
    // check if possible
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = this.#getActiveViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      return;
    }
    const viewController = viewLayer.getViewController();
    if (!viewController.isMonochrome()) {
      return;
    }

    this.#started = true;
    this.#startPoint = point;
  }

  /**
   * Update tool interaction.
   *
   * @param {Point2D} point The update point.
   * @param {string} divId The layer group divId.
   */
  #update(point, divId) {
    // check start flag
    if (!this.#started) {
      return;
    }

    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = this.#getActiveViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      return;
    }
    const viewController = viewLayer.getViewController();

    // difference to last position
    const diffX = point.getX() - this.#startPoint.getX();
    const diffY = this.#startPoint.getY() - point.getY();
    // data range
    const range = viewController.getImageRescaledDataRange();
    // 1/1000 to match existing solutions
    const pixelToIntensity = (range.max - range.min) * 0.001;

    // calculate new window level
    const center = viewController.getWindowLevel().center;
    const width = viewController.getWindowLevel().width;
    const windowCenter = center + (diffY * pixelToIntensity);
    const windowWidth = width + (diffX * pixelToIntensity);

    // set (will validate values)
    const wl = new WindowLevelValues(windowCenter, windowWidth);
    viewController.setWindowLevel(wl);

    // store position
    this.#startPoint = point;
  }

  /**
   * Finish tool interaction.
   */
  #finish() {
    if (this.#started) {
      this.#started = false;
    }
  }

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  mousedown = (event) => {
    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#start(mousePoint, layerDetails.groupDivId);
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  mousemove = (event) => {
    const mousePoint = getMousePoint(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#update(mousePoint, layerDetails.groupDivId);
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} _event The mouse up event.
   */
  mouseup = (_event) => {
    this.#finish();
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} _event The mouse out event.
   */
  mouseout = (_event) => {
    this.#finish();
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  touchstart = (event) => {
    const touchPoints = getTouchPoints(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#start(touchPoints[0], layerDetails.groupDivId);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    const touchPoints = getTouchPoints(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    this.#update(touchPoints[0], layerDetails.groupDivId);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} _event The touch end event.
   */
  touchend = (_event) => {
    this.#finish();
  };

  /**
   * Handle double click event.
   *
   * @param {object} event The double click event.
   */
  dblclick = (event) => {
    const layerDetails = getLayerDetailsFromEvent(event);
    const mousePoint = getMousePoint(event);

    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewLayer = this.#getActiveViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      return;
    }
    const index = viewLayer.displayToPlaneIndex(mousePoint);
    const viewController = viewLayer.getViewController();
    // exit if not possible
    if (!viewController.isMonochrome()) {
      return;
    }

    // update view controller
    const image = this.#app.getData(viewLayer.getDataId()).image;
    const wl = new WindowLevelValues(
      image.getRescaledValueAtIndex(
        viewController.getCurrentIndex().getWithNew2D(
          index.get(0),
          index.get(1)
        )
      ),
      viewController.getWindowLevel().width
    );
    viewController.setWindowLevel(wl);
  };

  /**
   * Handle mouse wheel event.
   *
   * @param {WheelEvent} event The mouse wheel event.
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

  /**
   * Set the tool live features.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.strictViewLayer !== 'undefined') {
      this.#strictViewLayer = features.strictViewLayer;
    }
  }

} // WindowLevel class
