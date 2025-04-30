import {Annotation} from '../image/annotation.js';
import {
  AddAnnotationCommand,
  UpdateAnnotationCommand
} from '../tools/drawCommands.js';
//import {RoiFactory} from '../tools/roi.js';
import {ROI} from '../math/roi.js';
import {Point2D} from '../math/point.js';
import {Style} from '../gui/style.js';
import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic.js';
import {getLayerDetailsFromEvent} from '../gui/layerGroup.js';
import {logger} from '../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application.js';
import {LayerGroup} from '../gui/layerGroup.js';
import {ViewLayer} from '../gui/viewLayer.js';
import {Scalar2D} from '../math/scalar.js';
/* eslint-enable no-unused-vars */

/**
 * The magic wand namespace.
 *
 * Ref: {@link https://github.com/Tamersoul/magic-wand-js}.
 *
 * @external MagicWand
 */
import MagicWand from 'magic-wand-tool';

/**
 * Floodfill painting tool.
 */
export class Floodfill {
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
   * Original variables from external library. Used as in the lib example.
   *
   * @type {number}
   */
  #blurRadius = 5;
  /**
   * Original variables from external library. Used as in the lib example.
   *
   * @type {number}
   */
  #simplifyTolerant = 0;

  /**
   * Original variables from external library. Used as in the lib example.
   *
   * @type {number}
   */
  #simplifyCount = 2000;

  /**
   * Canvas info.
   *
   * @type {object}
   */
  #imageInfo = null;

  /**
   * Object created by MagicWand lib containing border points.
   *
   * @type {object}
   */
  #mask = null;

  /**
   * Threshold default tolerance of the tool border.
   *
   * @type {number}
   */
  #initialthreshold = 10;

  /**
   * Threshold tolerance of the tool border.
   *
   * @type {number}
   */
  #currentthreshold = null;

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
   * Coordinates of the fist mousedown event.
   *
   * @type {object}
   */
  #initialpoint;

  /**
   * Floodfill border.
   *
   * @type {object}
   */
  #border = null;

  /**
   * List of parent points.
   *
   * @type {Point2D[]}
   */
  #parentPoints = [];

  /**
   * Assistant variable to paint border on all slices.
   *
   * @type {boolean}
   */
  #extender = false;

  /**
   * Drawing style.
   *
   * @type {Style}
   */
  #style = new Style();

  /**
   * Set extend option for painting border on all slices.
   *
   * @param {boolean} bool The option to set.
   */
  setExtend(bool) {
    this.#extender = bool;
  }

  /**
   * Get extend option for painting border on all slices.
   *
   * @returns {boolean} The actual value of of the variable to use Floodfill
   *   on museup.
   */
  getExtend() {
    return this.#extender;
  }

  /**
   * Get the associated view layer.
   *
   * @param {LayerGroup} layerGroup The layer group to search.
   * @returns {ViewLayer|undefined} The view layer.
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
   * @param {string} divId The layer group divId.
   * @returns {Scalar2D|undefined} The coordinates as a {x,y}.
   */
  #getIndex = (point, divId) => {
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
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

    this.#mask = MagicWand.floodFill(image, points.x, points.y, threshold);
    this.#mask = MagicWand.gaussBlurOnlyBorder(this.#mask, this.#blurRadius);

    let cs = MagicWand.traceContours(this.#mask);
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
    } else {
      return [];
    }
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
        this.#annotation.setIds();
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
  extend(ini, end, layerGroup) {
    //avoid errors
    if (!this.#initialpoint) {
      throw '\'initialpoint\' not found. User must click before use extend!';
    }

    const positionHelper = layerGroup.getPositionHelper();
    const viewLayer = this.#getViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to extend floodfill');
      return;
    }
    const viewController = viewLayer.getViewController();

    const pos = viewController.getCurrentIndex();
    const imageSize = viewController.getImageSize();
    const threshold = this.#currentthreshold || this.#initialthreshold;

    // Iterate over the next images and paint border on each slice.
    for (let i = pos.get(2),
      len = end
        ? end : imageSize.get(2);
      i < len; i++) {
      if (!this.#paintBorder(this.#initialpoint, threshold, layerGroup)) {
        break;
      }
      positionHelper.incrementPositionAlongScroll();
    }
    viewController.setCurrentIndex(pos);

    // Iterate over the prev images and paint border on each slice.
    for (let j = pos.get(2), jl = ini ? ini : 0; j > jl; j--) {
      if (!this.#paintBorder(this.#initialpoint, threshold, layerGroup)) {
        break;
      }
      positionHelper.decrementPositionAlongScroll();
    }
    viewController.setCurrentIndex(pos);
  }

  /**
   * Event fired when threshold change.
   *
   * @param {number} _value Current threshold.
   */
  onThresholdChange(_value) {
    // Defaults do nothing
  }

  /**
   * Start tool interaction.
   *
   * @param {Point2D} point The start point.
   * @param {string} divId The layer group divId.
   */
  #start(point, divId) {
    this.#annotation = undefined;

    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    let viewLayer;
    let drawLayer = layerGroup.getActiveDrawLayer();

    if (typeof drawLayer === 'undefined') {
      viewLayer = layerGroup.getActiveViewLayer();
      const refDataId = viewLayer.getDataId();
      // create new data
      const data = this.#app.createAnnotationData(refDataId);
      // render (will create draw layer)
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
    this.#initialpoint = this.#getIndex(point, divId);
    this.#paintBorder(this.#initialpoint, this.#initialthreshold, layerGroup);
    this.onThresholdChange(this.#initialthreshold);
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

    const movedpoint = this.#getIndex(point, divId);
    this.#currentthreshold = Math.round(Math.sqrt(
      Math.pow((this.#initialpoint.x - movedpoint.x), 2) +
      Math.pow((this.#initialpoint.y - movedpoint.y), 2)) / 2);
    this.#currentthreshold = this.#currentthreshold < this.#initialthreshold
      ? this.#initialthreshold
      : this.#currentthreshold - this.#initialthreshold;

    this.#paintBorder(
      this.#initialpoint,
      this.#currentthreshold,
      this.#app.getLayerGroupByDivId(divId)
    );

    this.onThresholdChange(this.#currentthreshold);
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
    // TODO: re-activate
    // if (this.#extender) {
    //   const layerDetails = getLayerDetailsFromEvent(event);
    //   const layerGroup =
    //     this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    //   this.extend(layerGroup);
    // }
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
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    event.context = 'Floodfill';
    this.#app.onKeydown(event);
  };

  /**
   * Activate the tool.
   *
   * @param {boolean} bool The flag to activate or not.
   */
  activate(bool) {
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

} // Floodfill class
