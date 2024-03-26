import {Line} from '../math/line';
import {getLayerDetailsFromEvent} from '../gui/layerGroup';
import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

/**
 * ZoomIn class.
 *
 * @example
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * const viewConfig0 = new dwv.ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new dwv.AppOptions(viewConfigs);
 * options.tools = {ZoomIn: new dwv.ToolConfig()};
 * app.init(options);
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('ZoomIn');
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 */
export class ZoomIn {

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
   * Line between input points.
   *
   * @type {Line}
   */
  #pointsLine;

  /**
   * PointsLine midpoint.
   *
   * @type {Point2D}
   */
  #midPoint;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Start tool interaction.
   *
   * @param {Point2D} point The start point.
   */
  #start(_point) {
    this.#started = true;
  }

  /**
   * Two touch start.
   *
   * @param {Point2D[]} points The start points.
   */
  #twoTouchStart = (points) => {
    this.#started = true;
    // points line
    this.#pointsLine = new Line(points[0], points[1]);
    this.#midPoint = this.#pointsLine.getMidpoint();
  };

  /**
   * Update tool interaction.
   *
   * @param {Point2D} point The update point.
   * @param {string} divId The layer group divId.
   */
  #update(_point, _divId) {
    // does nothing
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
    this.#start(mousePoint);

    // zoom in
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();
    const planePos = viewLayer.displayToMainPlanePos(mousePoint);
    const center = viewController.getPlanePositionFromPlanePoint(planePos);
    layerGroup.addScale(0.1, center);
    layerGroup.draw();
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
    if (touchPoints.length === 1) {
      this.#start(touchPoints[0]);
    } else if (touchPoints.length === 2) {
      this.#twoTouchStart(touchPoints);
    }
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
   * Handle mouse wheel event.
   *
   * @param {object} event The mouse wheel event.
   */
  wheel = (event) => {
    // prevent default page scroll
    event.preventDefault();

    const step = -event.deltaY / 500;

    // draw on zoom in
    // if (step > 0) {
    const layerDetails = getLayerDetailsFromEvent(event);
    const mousePoint = getMousePoint(event);

    const layerGroup =
      this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();
    const planePos = viewLayer.displayToMainPlanePos(mousePoint);
    const center = viewController.getPlanePositionFromPlanePoint(planePos);
    layerGroup.addScale(step, center);
    layerGroup.draw();
    // }
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    event.context = 'ZoomIn';
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
   * Set the tool live features: does nothing.
   *
   * @param {object} _features The list of features.
   */
  setFeatures(_features) {
    // does nothing
  }

} // ZoomIn class
