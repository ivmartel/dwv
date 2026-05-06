import {Point2D} from '../../math/point.js';
import {Path} from '../../math/path.js';
import {Scissors} from '../../image/scissors.js';
import {logger} from '../../utils/logger.js';
import {ROI} from '../../math/roi.js';
import {Annotation} from '../../image/annotation.js';
import {
  AddAnnotationCommand,
  UpdateAnnotationCommand
} from '../../command/drawCommands.js';
import {TapBehavior} from './tapBehavior.js';

/**
 * @import {App} from '../../app/application.js';
 * @import {Style} from '../../gui/style.js';
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 */

/**
 * Tap-driven livewire (scissors) ROI placement.
 *
 * Extends {@link TapBehavior} and is driven by {@link LayerGroupPointer}
 * (`onTap` commits anchors, `onUpdate` for preview, `onEnd` / `reset`).
 */
export class LivewireTapBehavior extends TapBehavior {

  /**
   * @type {App}
   */
  #app;

  /**
   * @type {Style}
   */
  #style;

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
   * @type {Annotation|undefined}
   */
  #annotation;

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
   * Scissor representation.
   *
   * @type {Scissors}
   */
  #scissors = new Scissors();

  /**
   * @param {App} app The associated application.
   * @param {Style} style Drawing style (shared with the tool).
   */
  constructor(app, style) {
    super();
    this.#app = app;
    this.#style = style;
  }

  /**
   * @returns {boolean} True while a livewire session is in progress.
   */
  isActive() {
    return this.#started;
  }

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
   * Check if the base image is resampled.
   *
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {boolean} True if the image is resampled.
   */
  #isResampled(layerGroup) {
    const viewLayer = layerGroup.getBaseViewLayer();
    const referenceDataId = viewLayer.getDataId();
    const referenceData = this.#app.getData(referenceDataId);
    const image = referenceData.image;

    return image.isResampled();
  }

  /**
   * Start or continue tool interaction (tap commit).
   *
   * @param {Point2D} point The pointer position.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onTap(point, layerGroup) {
    if (this.#isResampled(layerGroup)) {
      return;
    }

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
        this.#app.addAndRenderAnnotationData(
          data, layerGroup.getDivId(), refDataId);
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
        this.finishShape();
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
   * Move/update preview (mousemove / touchmove).
   *
   * @param {Point2D} point The pointer position.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onUpdate(point, layerGroup) {
    if (!this.#started) {
      return;
    }
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
    let results;
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
      } else if (!this.#parentPoints[p.y][p.x]) {
        stop = true;
      } else {
        p = this.#parentPoints[p.y][p.x];
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
   * Double-click / mouseout path from {@link LayerGroupPointer}.
   *
   * @override
   */
  onEnd() {
    this.finishShape();
  }

  /**
   * Finish the livewire ROI (closure near start or dblclick).
   */
  finishShape() {
    this.#started = false;
  }

  /**
   * @override
   */
  reset() {
    this.#started = false;
    this.#annotation = undefined;
    this.#clearPaths();
    this.#parentPoints = [];
    super.reset();
  }

}

