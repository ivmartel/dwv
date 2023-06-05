import {Point2D} from '../math/point';
import {Line} from '../math/line';
import {getLayerDetailsFromEvent} from '../gui/layerGroup';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

/**
 * ZoomAndPan class.
 *
 * @example
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * app.init({
 *   dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
 *   tools: {ZoomAndPan: {}}
 * });
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('ZoomAndPan');
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 */
export class ZoomAndPan {

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
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  mousedown = (event) => {
    this.#started = true;
    // first position
    this.x0 = event._x;
    this.y0 = event._y;
  };

  /**
   * Handle two touch down event.
   *
   * @param {object} event The touch down event.
   */
  twotouchdown = (event) => {
    this.#started = true;
    // store first point
    this.x0 = event._x;
    this.y0 = event._y;
    // first line
    const point0 = new Point2D(event._x, event._y);
    const point1 = new Point2D(event._x1, event._y1);
    this.line0 = new Line(point0, point1);
    this.midPoint = this.line0.getMidpoint();
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  mousemove = (event) => {
    if (!this.#started) {
      return;
    }
    // calculate translation
    const tx = event._x - this.x0;
    const ty = event._y - this.y0;
    // apply translation
    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();
    const planeOffset = viewLayer.displayToPlaneScale(tx, ty);
    const offset3D = viewController.getOffset3DFromPlaneOffset(planeOffset);
    layerGroup.addTranslation({
      x: offset3D.getX(),
      y: offset3D.getY(),
      z: offset3D.getZ()
    });
    layerGroup.draw();
    // reset origin point
    this.x0 = event._x;
    this.y0 = event._y;
  };

  /**
   * Handle two touch move event.
   *
   * @param {object} event The touch move event.
   */
  twotouchmove = (event) => {
    if (!this.#started) {
      return;
    }
    const point0 = new Point2D(event._x, event._y);
    const point1 = new Point2D(event._x1, event._y1);
    const newLine = new Line(point0, point1);
    const lineRatio = newLine.getLength() / this.line0.getLength();

    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();

    if (lineRatio === 1) {
      // scroll mode
      // difference  to last position
      const diffY = event._y - this.y0;
      // do not trigger for small moves
      if (Math.abs(diffY) < 15) {
        return;
      }
      // update view controller
      if (viewController.canScroll()) {
        if (diffY > 0) {
          viewController.incrementScrollIndex();
        } else {
          viewController.decrementScrollIndex();
        }
      }
    } else {
      // zoom mode
      const zoom = (lineRatio - 1) / 10;
      if (Math.abs(zoom) % 0.1 <= 0.05) {
        const planePos = viewLayer.displayToMainPlanePos(
          this.midPoint.getX(), this.midPoint.getY());
        const center = viewController.getPlanePositionFromPlanePoint(planePos);
        layerGroup.addScale(zoom, center);
        layerGroup.draw();
      }
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
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  touchstart = (event) => {
    const touches = event.targetTouches;
    if (touches.length === 1) {
      this.mousedown(event);
    } else if (touches.length === 2) {
      this.twotouchdown(event);
    }
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    const touches = event.targetTouches;
    if (touches.length === 1) {
      this.mousemove(event);
    } else if (touches.length === 2) {
      this.twotouchmove(event);
    }
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
   * Handle mouse wheel event.
   *
   * @param {object} event The mouse wheel event.
   */
  wheel = (event) => {
    const step = -event.deltaY / 500;

    const layerDetails = getLayerDetailsFromEvent(event);
    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();
    const planePos = viewLayer.displayToMainPlanePos(event._x, event._y);
    const center = viewController.getPlanePositionFromPlanePoint(planePos);
    layerGroup.addScale(step, center);
    layerGroup.draw();
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    event.context = 'ZoomAndPan';
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

} // ZoomAndPan class
