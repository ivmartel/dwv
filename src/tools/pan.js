import {Point2D} from '../math/point';
import {getLayerDetailsFromEvent} from '../gui/layerGroup';
import {getMousePoint, getTouchPoints} from '../gui/generic';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
import {Line} from '../math/line';
/* eslint-enable no-unused-vars */

/**
 * Pan class.
 *
 * @example
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * const viewConfig0 = new dwv.ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new dwv.AppOptions(viewConfigs);
 * options.tools = {Pan: new dwv.ToolConfig()};
 * app.init(options);
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('Pan');
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 */
export class Pan {
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
  #start(point) {
    this.#started = true;
    this.#startPoint = point;
  }

  /**
   * Two touch start.
   *
   * @param {Point2D[]} points The start points.
   */
  #twoTouchStart = (points) => {
    this.#started = true;
    this.#startPoint = points[0];
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
  #update(point, divId) {
    if (!this.#started) {
      return;
    }

    // calculate translation
    const tx = point.getX() - this.#startPoint.getX();
    const ty = point.getY() - this.#startPoint.getY();
    // apply translation
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();
    const planeOffset = viewLayer.displayToPlaneScale(new Point2D(tx, ty));
    const offset3D = viewController.getOffset3DFromPlaneOffset({
      x: planeOffset.getX(),
      y: planeOffset.getY(),
    });
    layerGroup.addTranslation({
      x: offset3D.getX(),
      y: offset3D.getY(),
      z: offset3D.getZ(),
    });
    layerGroup.draw();
    // reset origin point
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
    this.#start(mousePoint);
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
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    const touchPoints = getTouchPoints(event);
    const layerDetails = getLayerDetailsFromEvent(event);
    if (touchPoints.length === 1) {
      this.#update(touchPoints[0], layerDetails.groupDivId);
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
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    event.context = 'Pan';
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
} // Pan class
