import {DragBehavior} from './dragBehavior.js';
import {Annotation} from '../../image/annotation.js';
import {
  AddAnnotationCommand,
  UpdateAnnotationCommand
} from '../../command/drawCommands.js';
import {ROI} from '../../math/roi.js';
import {Point2D} from '../../math/point.js';
import {logger} from '../../utils/logger.js';

/**
 * The magic wand namespace.
 *
 * Ref: {@link https://github.com/Tamersoul/magic-wand-js}.
 *
 * @external MagicWand
 */
import MagicWand from 'magic-wand-tool';

/**
 * @import {LayerGroup} from '../../gui/layerGroup.js';
 * @import {Scalar2D} from '../../math/scalar.js';
 */

/**
 * Floodfill drag behavior.
 */
export class FloodfillDragBehavior extends DragBehavior {

  /**
   * Associated app.
   *
   * @type {object}
   */
  #app;

  /**
   * Interaction start flag.
   *
   * @type {boolean}
   */
  #started = false;

  /**
   * Current annotation.
   *
   * @type {Annotation}
   */
  #annotation;

  /**
   * Coordinates of the first mousedown event.
   *
   * @type {object}
   */
  #initialpoint;

  /**
   * Canvas info.
   *
   * @type {object}
   */
  #imageInfo = null;

  /**
   * Floodfill border.
   *
   * @type {object}
   */
  #border = null;

  /**
   * Threshold tolerance of the tool border.
   *
   * @type {number}
   */
  #currentThreshold = null;

  /**
   * Threshold default tolerance of the tool border.
   *
   * @type {number}
   */
  #initialThreshold = 10;

  /**
   * Original variables from external library.
   *
   * @type {number}
   */
  #blurRadius = 5;

  /**
   * Original variables from external library.
   *
   * @type {number}
   */
  #simplifyTolerant = 0;

  /**
   * Original variables from external library.
   *
   * @type {number}
   */
  #simplifyCount = 2000;

  /**
   * List of parent points.
   *
   * @type {Point2D[]}
   */
  #parentPoints = [];

  /**
   * Style object reference.
   *
   * @type {object}
   */
  #style;

  /**
   * @param {object} app The associated application.
   * @param {object} style The floodfill style.
   */
  constructor(app, style) {
    super();
    this.#app = app;
    this.#style = style;
  }

  /**
   * Get the associated view layer.
   *
   * @param {LayerGroup} layerGroup The layer group to search.
   * @returns {object|undefined} The view layer.
   */
  #getViewLayer(layerGroup) {
    const drawLayer = layerGroup.getActiveDrawLayer();
    if (typeof drawLayer === 'undefined') {
      logger.warn('No draw layer to do floodfill');
      return;
    }
    return layerGroup.getViewLayerById(
      drawLayer.getReferenceLayerId());
  }

  /**
   * Get (x, y) coordinates referenced to the canvas.
   *
   * @param {Point2D} point The start point.
   * @param {LayerGroup} layerGroup The layer group.
   * @returns {Scalar2D|undefined} The coordinates as a {x,y}.
   */
  #getIndex = (point, layerGroup) => {
    const viewLayer = this.#getViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to get index');
      return;
    }
    const index = viewLayer.displayToPlaneIndex(point);
    return {
      x: index.get(0),
      y: index.get(1)
    };
  };

  /**
   * Calculate border.
   *
   * @param {object} points The input points.
   * @param {number} threshold The threshold of the floodfill.
   * @param {boolean} simple Return first points or a list.
   * @returns {Point2D[]} The parent points.
   */
  #calcBorder(points, threshold, simple) {
    this.#parentPoints = [];
    const image = {
      data: this.#imageInfo.data,
      width: this.#imageInfo.width,
      height: this.#imageInfo.height,
      bytes: 4
    };

    const mask = MagicWand.floodFill(
      image, points.x, points.y, threshold);
    const blurred = MagicWand.gaussBlurOnlyBorder(mask, this.#blurRadius);
    let cs = MagicWand.traceContours(blurred);
    cs = MagicWand.simplifyContours(
      cs, this.#simplifyTolerant, this.#simplifyCount);

    if (cs.length > 0 && cs[0].points[0].x) {
      if (simple) {
        return cs[0].points;
      }
      for (let j = 0, icsl = cs[0].points.length; j < icsl; j++) {
        this.#parentPoints.push(new Point2D(
          cs[0].points[j].x,
          cs[0].points[j].y
        ));
      }
      return this.#parentPoints;
    }

    return [];
  }

  /**
   * Paint Floodfill.
   *
   * @param {object} point The start point.
   * @param {number} threshold The border threshold.
   * @param {LayerGroup} layerGroup The origin layer group.
   * @returns {boolean} False if no border.
   */
  #paintBorder(point, threshold, layerGroup) {
    // Calculate the border
    this.#border = this.#calcBorder(point, threshold, false);
    // Paint the border
    if (this.#border.length !== 0) {
      const drawLayer = layerGroup.getActiveDrawLayer();
      if (typeof drawLayer === 'undefined') {
        logger.warn('No draw layer to paint border');
        return false;
      }
      const drawController = drawLayer.getDrawController();

      const newMathShape = new ROI(this.#border);

      let command;
      if (typeof this.#annotation === 'undefined') {
        // create annotation
        this.#annotation = new Annotation();
        this.#annotation.colour = this.#style.getLineColour();

        const viewLayer =
          layerGroup.getViewLayerById(drawLayer.getReferenceLayerId());
        if (typeof viewLayer === 'undefined') {
          logger.warn('No view layer to paint border');
          return false;
        }
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

    return this.#border.length !== 0;
  }

  /**
   * Create Floodfill in all the prev and next slices while border is found.
   *
   * @param {number} ini The first slice to extend to.
   * @param {number} end The last slice to extend to.
   * @param {object} layerGroup The origin layer group.
   */
  //   #extend(ini, end, layerGroup) {
  //     //avoid errors
  //     if (!this.#initialpoint) {
  //       throw new Error(
  //         '\'initialpoint\' not found. User must click before use extend!'
  //       );
  //     }

  //     const positionHelper = layerGroup.getPositionHelper();
  //     const viewLayer = this.#getViewLayer(layerGroup);
  //     if (typeof viewLayer === 'undefined') {
  //       logger.warn('No view layer to extend floodfill');
  //       return;
  //     }
  //     const viewController = viewLayer.getViewController();

  //     const pos = viewController.getCurrentIndex();
  //     const imageSize = viewController.getImageSize();
  //     const threshold = this.#currentthreshold || this.#initialthreshold;

  //     // Iterate over the next images and paint border on each slice.
  //     for (let i = pos.get(2),
  //       len = end
  //         ? end : imageSize.get(2);
  //       i < len; i++) {
  //       if (!this.#paintBorder(this.#initialpoint, threshold, layerGroup)) {
  //         break;
  //       }
  //       positionHelper.incrementPositionAlongScroll();
  //     }
  //     viewController.setCurrentIndex(pos);

  //     // Iterate over the prev images and paint border on each slice.
  //     for (let j = pos.get(2), jl = ini ? ini : 0; j > jl; j--) {
  //       if (!this.#paintBorder(this.#initialpoint, threshold, layerGroup)) {
  //         break;
  //       }
  //       positionHelper.decrementPositionAlongScroll();
  //     }
  //     viewController.setCurrentIndex(pos);
  //   }

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
   * @param {Point2D} _point The pointer position.
   * @param {LayerGroup} _layerGroup The layer group under the pointer.
   * @returns {boolean} Whether a drag may begin.
   */
  canStart(_point, _layerGroup) {
    // Floodfill can always start a drag
    return true;
  }

  /**
   * @param {Point2D} point The pointer position at drag start.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onStart(point, layerGroup) {
    super.onStart(point, layerGroup);

    if (this.#isResampled(layerGroup)) {
      return;
    }

    this.#annotation = undefined;

    let viewLayer;
    let drawLayer = layerGroup.getActiveDrawLayer();

    if (typeof drawLayer === 'undefined') {
      viewLayer = layerGroup.getActiveViewLayer();
      const refDataId = viewLayer.getDataId();
      // create new data
      const data = this.#app.createAnnotationData(refDataId);
      // render (will create draw layer)
      const layerId = layerGroup.getDivId();
      const divId = layerId.replace('-layer-0', '');
      this.#app.addAndRenderAnnotationData(data, divId, refDataId);
      // get draw layer
      drawLayer = layerGroup.getActiveDrawLayer();
      // set active to bind to toolboxController
      layerGroup.setActiveLayerByDataId(drawLayer.getDataId());
    } else {
      viewLayer = layerGroup.getViewLayerById(
        drawLayer.getReferenceLayerId());
      if (typeof viewLayer === 'undefined') {
        logger.warn('No view layer to start floodfill');
        return;
      }
    }

    this.#imageInfo = viewLayer.getImageData();
    if (!this.#imageInfo) {
      logger.error('No image found');
      return;
    }

    // update zoom scale
    this.#style.setZoomScale(
      drawLayer.getKonvaLayer().getAbsoluteScale());

    this.#started = true;
    this.#initialpoint = this.#getIndex(point, layerGroup);
    this.#paintBorder(this.#initialpoint, this.#initialThreshold, layerGroup);
  }

  /**
   * @param {Point2D} point The pointer position.
   * @param {LayerGroup} layerGroup The layer group under the pointer.
   */
  onUpdate(point, layerGroup) {
    super.onUpdate(point, layerGroup);

    if (!this.#started) {
      return;
    }

    const movedpoint = this.#getIndex(point, layerGroup);
    this.#currentThreshold = Math.round(Math.sqrt(
      Math.pow((this.#initialpoint.x - movedpoint.x), 2) +
      Math.pow((this.#initialpoint.y - movedpoint.y), 2)) / 2);
    this.#currentThreshold = this.#currentThreshold < this.#initialThreshold
      ? this.#initialThreshold
      : this.#currentThreshold - this.#initialThreshold;

    this.#paintBorder(
      this.#initialpoint,
      this.#currentThreshold,
      layerGroup
    );
  }

  onEnd() {
    super.onEnd();
    if (this.#started) {
      this.#started = false;
    }
  }

} // FloodfillDragBehavior class
