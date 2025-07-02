import {getLayerDetailsFromEvent} from '../gui/layerGroup.js';
import {
  getMousePoint,
  getTouchPoints
} from '../gui/generic.js';
import {ScrollWheel} from './scrollWheel.js';
import {logger} from '../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application.js';
import {Point2D} from '../math/point.js';
import {LayerGroup} from '../gui/layerGroup.js';
import {ViewLayer} from '../gui/viewLayer.js';
/* eslint-enable no-unused-vars */

/**
 * Scroll class.
 *
 * @example
 * import {App, AppOptions, ViewConfig, ToolConfig} from '//esm.sh/dwv';
 * // create the dwv app
 * const app = new App();
 * // initialise
 * const viewConfig0 = new ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new AppOptions(viewConfigs);
 * options.tools = {Scroll: new ToolConfig()};
 * app.init(options);
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('Scroll');
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm',
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm',
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323563.dcm'
 * ]);
 * @example <caption>Example with slider</caption>
 * import {App, AppOptions, ViewConfig, ToolConfig, Index} from '//esm.sh/dwv';
 * // create the dwv app
 * const app = new App();
 * // initialise
 * const viewConfig0 = new ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new AppOptions(viewConfigs);
 * options.tools = {Scroll: new ToolConfig()};
 * app.init(options);
 * // create range
 * const range = document.createElement('input');
 * range.type = 'range';
 * range.min = 0;
 * range.id = 'sliceRange';
 * document.body.appendChild(range);
 * // update app on slider change
 * range.oninput = function () {
 *   const lg = app.getLayerGroupByDivId('layerGroup0');
 *   const vl = lg.getBaseViewLayer();
 *   const vc = vl.getViewController();
 *   const index = vc.getCurrentIndex();
 *   const values = index.getValues();
 *   values[2] = this.value;
 *   vc.setCurrentIndex(new Index(values));
 * }
 * // activate tool and update range max on load
 * app.addEventListener('load', function () {
 *   app.setTool('Scroll');
 *   const size = app.getData(0).image.getGeometry().getSize();
 *   range.max = size.get(2) - 1;
 * });
 * // update slider on slice change (for ex via mouse wheel)
 * app.addEventListener('positionchange', function () {
 *   const lg = app.getLayerGroupByDivId('layerGroup0');
 *   const vl = lg.getBaseViewLayer();
 *   const vc = vl.getViewController();
 *   range.value = vc.getCurrentIndex().get(2);
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm',
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323707.dcm',
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323563.dcm'
 * ]);
 */
export class Scroll {
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
   * Touch timer ID (created by setTimeout).
   *
   * @type {number}
   */
  #touchTimerID;

  /**
   * Option to show or not a value tooltip on mousemove.
   *
   * @type {boolean}
   */
  #displayTooltip = false;

  /**
   * Current layer group div id.
   *
   * @type {string}
   */
  #currentDivId;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
    this.#scrollWhell = new ScrollWheel(app);
  }

  /**
   * Get the associated view layer.
   *
   * @param {LayerGroup} layerGroup The layer group to search.
   * @returns {ViewLayer|undefined} The view layer.
   */
  #getViewLayer(layerGroup) {
    let viewLayer = layerGroup.getActiveViewLayer();
    if (typeof viewLayer === 'undefined') {
      const drawLayer = layerGroup.getActiveDrawLayer();
      if (typeof drawLayer === 'undefined') {
        logger.warn('No draw layer to do scroll');
        return;
      }
      viewLayer = layerGroup.getViewLayerById(
        drawLayer.getReferenceLayerId());
    }
    return viewLayer;
  }

  /**
   * Start tool interaction.
   *
   * @param {Point2D} point The start point.
   * @param {string} divId The layer group divId.
   */
  #start(point, divId) {
    // optional tooltip
    this.#removeTooltipDiv();

    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const viewLayer = this.#getViewLayer(layerGroup);
    if (typeof viewLayer === 'undefined') {
      logger.warn('No view layer to start scroll');
      return;
    }

    const viewController = viewLayer.getViewController();

    // stop auto scroll if playing
    if (viewController.isPlaying()) {
      viewController.stop();
    }
    // update base controller position
    const planePos = viewLayer.displayToPlanePos(point);
    const position = viewController.getPositionFromPlanePoint(planePos);
    viewController.setCurrentPosition(position);

    // start flag
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
    if (!this.#started) {
      // optional tooltip
      if (this.#displayTooltip) {
        this.#showTooltip(point, divId);
      }
      return;
    }

    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    const positionHelper = layerGroup.getPositionHelper();

    // difference to last Y position
    const diffY = point.getY() - this.#startPoint.getY();
    const yMove = (Math.abs(diffY) > 15);
    // difference to last X position
    const diffX = point.getX() - this.#startPoint.getX();
    const xMove = (Math.abs(diffX) > 15);

    // do not trigger for small moves
    if (yMove && layerGroup.canScroll()) {
      // update view controller
      if (diffY > 0) {
        positionHelper.decrementPositionAlongScroll();
      } else {
        positionHelper.incrementPositionAlongScroll();
      }
    } else if (xMove && layerGroup.moreThanOne(3)) {
      // update view controller
      if (diffX > 0) {
        positionHelper.incrementPosition(3);
      } else {
        positionHelper.decrementPosition(3);
      }
    }

    // reset origin point
    if (xMove || yMove) {
      this.#startPoint = point;
    }
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
    // remove possible tooltip div
    this.#removeTooltipDiv();
  };

  /**
   * Handle touch start event.
   *
   * @param {object} event The touch start event.
   */
  touchstart = (event) => {
    // long touch triggers the dblclick
    // @ts-ignore
    this.#touchTimerID = setTimeout(() => {
      this.dblclick(event);
    }, 500);
    // call start
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
    // abort timer if move
    if (this.#touchTimerID !== null) {
      clearTimeout(this.#touchTimerID);
      this.#touchTimerID = null;
    }
    // call update
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
    // abort timer
    if (this.#touchTimerID !== null) {
      clearTimeout(this.#touchTimerID);
      this.#touchTimerID = null;
    }
    // call mouse equivalent
    this.#finish();
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
    event.context = 'Scroll';
    this.#app.onKeydown(event);
  };

  /**
   * Handle double click.
   *
   * @param {object} event The key down event.
   */
  dblclick = (event) => {
    const layerDetails = getLayerDetailsFromEvent(event);

    const layerGroup = this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
    const viewLayer = layerGroup.getActiveViewLayer();
    if (typeof viewLayer !== 'undefined') {
      const viewController = viewLayer.getViewController();
      viewController.play();
    }
  };

  /**
   * Display a tooltip at the given point.
   *
   * @param {Point2D} point The update point.
   * @param {string} divId The layer group divId.
   */
  #showTooltip(point, divId) {
    // get layer group
    const layerGroup = this.#app.getLayerGroupByDivId(divId);
    this.#currentDivId = divId;
    // show new tooltip
    layerGroup.showTooltip(point);
  }

  /**
   * Remove the last tooltip html div.
   */
  #removeTooltipDiv() {
    if (typeof this.#currentDivId !== 'undefined') {
      const layerGroup = this.#app.getLayerGroupByDivId(this.#currentDivId);
      layerGroup.removeTooltipDiv();
      this.#currentDivId = undefined;
    }
  }

  /**
   * Activate the tool.
   *
   * @param {boolean} _bool The flag to activate or not.
   */
  activate(_bool) {
    // remove tooltip html when deactivating
    if (!_bool) {
      this.#removeTooltipDiv();
    }
  }

  /**
   * Set the tool live features: disaply tooltip.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.displayTooltip !== 'undefined') {
      this.#displayTooltip = features.displayTooltip;
    }
  }

  /**
   * Initialise the tool.
   */
  init() {
    // does nothing
  }

} // Scroll class
