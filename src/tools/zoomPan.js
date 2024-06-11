import {Point2D} from '../math/point';
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
 * ZoomAndPan class.
 *
 * @example
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * const viewConfig0 = new dwv.ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new dwv.AppOptions(viewConfigs);
 * options.tools = {ZoomAndPan: new dwv.ToolConfig()};
 * app.init(options);
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
   * Start point.
   *
   * @type {Point2D}
   */
  #startPoint;

  /**
   * Move flag: true if mouse or touch move.
   *
   * @type {boolean}
   */
  #hasMoved;

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
    this.#hasMoved = false;
  }

  /**
   * Two touch start.
   *
   * @param {Point2D[]} points The start points.
   */
  #twoTouchStart = (points) => {
    this.#started = true;
    this.#startPoint = points[0];
    this.#hasMoved = false;
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
    this.#hasMoved = true;

    // calculate translation
    const tx = point.getX() - this.#startPoint.getX();
    const ty = point.getY() - this.#startPoint.getY();
    // apply translation
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();
    const planeOffset = viewLayer.displayToPlaneScale(
      new Point2D(tx, ty)
    );
    const offset3D = viewController.getOffset3DFromPlaneOffset({
      x: planeOffset.getX(),
      y: planeOffset.getY()
    });
    layerGroup.addTranslation({
      x: offset3D.getX(),
      y: offset3D.getY(),
      z: offset3D.getZ()
    });
    layerGroup.draw();
    // reset origin point
    this.#startPoint = point;
  }

  /**
   * Two touch update.
   *
   * @param {Point2D[]} points The update points.
   * @param {string} divId The layer group divId.
   */
  #twoTouchUpdate = (points, divId) => {
    if (!this.#started) {
      return;
    }
    this.#hasMoved = true;

    const newLine = new Line(points[0], points[1]);
    const lineRatio = newLine.getLength() / this.#pointsLine.getLength();

    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();

    if (lineRatio === 1) {
      // scroll mode
      // difference  to last position
      const diffY = points[0].getY() - this.#startPoint.getY();
      // do not trigger for small moves
      if (Math.abs(diffY) < 15) {
        return;
      }
      // update view controller
      if (layerGroup.canScroll()) {
        let newPosition;
        if (diffY > 0) {
          newPosition = viewController.getIncrementScrollPosition();
        } else {
          newPosition = viewController.getDecrementScrollPosition();
        }
        // set all layers if at least one can be set
        if (typeof newPosition !== 'undefined' &&
          layerGroup.isPositionInBounds(newPosition)) {
          viewController.setCurrentPosition(newPosition);
        }
      }
    } else {
      // zoom mode
      const zoom = (lineRatio - 1) / 10;
      if (Math.abs(zoom) % 0.1 <= 0.05 &&
        typeof this.#midPoint !== 'undefined') {
        const planePos = viewLayer.displayToMainPlanePos(this.#midPoint);
        const center = viewController.getPlanePositionFromPlanePoint(planePos);
        layerGroup.addScale(zoom, center);
        layerGroup.draw();
      }
    }
  };

  /**
   * Set the current position.
   *
   * @param {Point2D} point The update point.
   * @param {string} divId The layer group divId.
   */
  #setCurrentPosition(point, divId) {
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();
    const planePos = viewLayer.displayToPlanePos(point);
    const position = viewController.getPositionFromPlanePoint(planePos);
    viewController.setCurrentPosition(position);
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
   * @param {object} event The mouse up event.
   */
  mouseup = (event) => {
    // update position if no move
    if (!this.#hasMoved) {
      const mousePoint = getMousePoint(event);
      const layerDetails = getLayerDetailsFromEvent(event);
      this.#setCurrentPosition(mousePoint, layerDetails.groupDivId);
    }
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
    } else if (touchPoints.length === 2) {
      this.#twoTouchUpdate(touchPoints, layerDetails.groupDivId);
    }
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  touchend = (event) => {
    // update position if no move
    if (!this.#hasMoved) {
      const mousePoint = getMousePoint(event);
      const layerDetails = getLayerDetailsFromEvent(event);
      this.#setCurrentPosition(mousePoint, layerDetails.groupDivId);
    }
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

    const layerDetails = getLayerDetailsFromEvent(event);
    const mousePoint = getMousePoint(event);

    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewLayer = layerGroup.getActiveViewLayer();
    const viewController = viewLayer.getViewController();
    const planePos = viewLayer.displayToMainPlanePos(mousePoint);
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

  /**
   * Set the tool live features: does nothing.
   *
   * @param {object} _features The list of features.
   */
  setFeatures(_features) {
    // does nothing
  }

} // ZoomAndPan class
