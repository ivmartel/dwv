import {Style} from '../gui/style.js';
import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic.js';
import {Point2D} from '../math/point.js';
import {Path} from '../math/path.js';
import {Scissors} from '../math/scissors.js';
import {getLayerDetailsFromEvent} from '../gui/layerGroup.js';
import {logger} from '../utils/logger.js';
import {ROI} from '../math/roi.js';
import {Annotation} from '../image/annotation.js';
import {
  AddAnnotationCommand,
  UpdateAnnotationCommand
} from '../tools/drawCommands.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application.js';
/* eslint-enable no-unused-vars */

/**
 * Livewire painting tool.
 */
export class Livewire {
  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

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
   * Current annotation.
   *
   * @type {Annotation}
   */
  #annotation;

  /**
   * Drawing style.
   *
   * @type {Style}
   */
  #style = new Style();

  /**
   * Path storage. Paths are stored in reverse order.
   *
   * @type {Path}
   */
  #path = new Path();

  /**
   * Current path storage. Paths are stored in reverse order.
   *
   * @type {Path}
   */
  #currentPath = new Path();

  /**
   * List of parent points.
   *
   * @type {Array}
   */
  #parentPoints = [];

  /**
   * Tolerance.
   *
   * @type {number}
   */
  #tolerance = 5;

  /**
   * Clear the parent points list.
   *
   * @param {object} imageSize The image size.
   */
  #clearParentPoints(imageSize) {
    const nrows = imageSize.get(1);
    for (let i = 0; i < nrows; ++i) {
      this.#parentPoints[i] = [];
    }
  }

  /**
   * Clear the stored paths.
   */
  #clearPaths() {
    this.#path = new Path();
    this.#currentPath = new Path();
  }

  /**
   * Scissor representation.
   *
   * @type {Scissors}
   */
  #scissors = new Scissors();

  /**
   * Chack if the base image is resampled.
   *
   * @param {string} divId The layer group divId.
   * @returns {boolean} True if the image is resampled.
   */
  #isResampled(divId) {
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = layerGroup.getBaseViewLayer();
    const referenceDataId = viewLayer.getDataId();
    const referenceData = this.#app.getData(referenceDataId);
    const image = referenceData.image;

    return image.isResampled();
  }

  /**
   * Start tool interaction.
   *
   * @param {Point2D} point The start point.
   * @param {string} divId The layer group divId.
   */
  #start(point, divId) {
    if (this.#isResampled(divId)) {
      return;
    }

    const layerGroup = this.#app.getLayerGroupByDivId(divId);

    let viewLayer;
    let drawLayer = layerGroup.getActiveDrawLayer();
    if (typeof drawLayer === 'undefined') {
      viewLayer = layerGroup.getActiveViewLayer();
    } else {
      viewLayer =
        layerGroup.getViewLayerById(drawLayer.getReferenceLayerId());
    }

    const imageSize = viewLayer.getViewController().getImageSize();

    this.#scissors.setDimensions(
      imageSize.get(0),
      imageSize.get(1));
    this.#scissors.setData(viewLayer.getImageData().data);

    const index = viewLayer.displayToPlaneIndex(point);

    // first time
    if (!this.#started) {
      this.#annotation = undefined;
      this.#started = true;
      this.#startPoint = new Point2D(index.get(0), index.get(1));
      // clear vars
      this.#clearPaths();
      this.#clearParentPoints(imageSize);
      // get draw layer
      if (typeof drawLayer === 'undefined') {
        const refDataId = viewLayer.getDataId();
        // create new data
        const data = this.#app.createAnnotationData(refDataId);
        // render (will create draw layer)
        this.#app.addAndRenderAnnotationData(data, divId, refDataId);
        // get draw layer
        drawLayer = layerGroup.getActiveDrawLayer();
        // set active to bind to toolboxController
        layerGroup.setActiveLayerByDataId(drawLayer.getDataId());
      }
      // update zoom scale
      this.#style.setZoomScale(
        drawLayer.getKonvaLayer().getAbsoluteScale());
      // do the training from the first point
      const p = {x: index.get(0), y: index.get(1)};
      this.#scissors.doTraining(p);
      // add the initial point to the path
      const p0 = new Point2D(index.get(0), index.get(1));
      this.#path.addPoint(p0);
      this.#path.addControlPoint(p0);
    } else {
      const diffX = Math.abs(index.get(0) - this.#startPoint.getX());
      const diffY = Math.abs(index.get(1) - this.#startPoint.getY());
      // final point: at 'tolerance' of the initial point
      if (diffX < this.#tolerance &&
        diffY < this.#tolerance) {
        // finish
        this.#finishShape();
      } else {
        // anchor point
        this.#path = this.#currentPath;
        this.#clearParentPoints(imageSize);
        const pn = {x: index.get(0), y: index.get(1)};
        this.#scissors.doTraining(pn);
        this.#path.addControlPoint(this.#currentPath.getPoint(0));
      }
    }
  }

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
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const drawLayer = layerGroup.getActiveDrawLayer();
    if (typeof drawLayer === 'undefined') {
      logger.warn('No draw layer to update livewire');
      return;
    }
    const viewLayer = layerGroup.getViewLayerById(
      drawLayer.getReferenceLayerId());
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to update livewire');
      return;
    }
    const index = viewLayer.displayToPlaneIndex(point);

    // set the point to find the path to
    let p = {x: index.get(0), y: index.get(1)};
    this.#scissors.setPoint(p);
    // do the work
    let results = [];
    let stop = false;
    while (!this.#parentPoints[p.y][p.x] && !stop) {
      results = this.#scissors.doWork();

      if (results.length === 0) {
        stop = true;
      } else {
        // fill parents
        for (let i = 0; i < results.length - 1; i += 2) {
          const _p = results[i];
          const _q = results[i + 1];
          this.#parentPoints[_p.y][_p.x] = _q;
        }
      }
    }

    // get the path
    this.#currentPath = new Path();
    stop = false;
    while (p && !stop) {
      this.#currentPath.addPoint(new Point2D(p.x, p.y));
      if (!this.#parentPoints[p.y]) {
        stop = true;
      } else {
        if (!this.#parentPoints[p.y][p.x]) {
          stop = true;
        } else {
          p = this.#parentPoints[p.y][p.x];
        }
      }
    }
    this.#currentPath.appenPath(this.#path);

    const drawController = drawLayer.getDrawController();

    const newMathShape = new ROI(this.#currentPath.pointArray);

    let command;
    if (typeof this.#annotation === 'undefined') {
      // create annotation
      this.#annotation = new Annotation();
      this.#annotation.colour = this.#style.getLineColour();

      const viewController = viewLayer.getViewController();
      this.#annotation.init(viewController);

      this.#annotation.mathShape = newMathShape;
      command = new AddAnnotationCommand(
        this.#annotation,
        drawController
      );
    } else {
      // update annotation
      const originalMathShape = this.#annotation.mathShape;
      command = new UpdateAnnotationCommand(
        this.#annotation,
        {mathShape: originalMathShape},
        {mathShape: newMathShape},
        drawController
      );
    }

    // add command to undo stack
    this.#app.addToUndoStack(command);
    // execute command: triggers draw creation
    command.execute();
  }

  /**
   * Finish a livewire (roi) shape.
   */
  #finishShape() {
    // set flag
    this.#started = false;
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
  mouseup(_event) {
    // nothing to do
  }

  /**
   * Handle mouse out event.
   *
   * @param {object} _event The mouse out event.
   */
  mouseout = (_event) => {
    // nothing to do
  };

  /**
   * Handle double click event.
   *
   * @param {object} _event The double click event.
   */
  dblclick = (_event) => {
    this.#finishShape();
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
    // nothing to do
  };

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    event.context = 'Livewire';
    this.#app.onKeydown(event);
  };

  /**
   * Activate the tool.
   *
   * @param {boolean} bool The flag to activate or not.
   */
  activate(bool) {
    // start scissors if displayed
    if (bool) {
      // init with the app window scale
      this.#style.setBaseScale(this.#app.getBaseScale());
      // set the default to the first in the list
      this.setFeatures({shapeColour: this.#style.getLineColour()});
    }
  }

  /**
   * Initialise the tool.
   */
  init() {
    // does nothing
  }


  /**
   * Set the tool live features: shape colour.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.shapeColour !== 'undefined') {
      this.#style.setLineColour(features.shapeColour);
    }
  }

} // Livewire class
