import {getLayerDetailsFromEvent} from '../gui/layerGroup';
import {ScrollWheel} from './scrollWheel';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

/**
 * Opacity class.
 *
 * @example
 * // create the dwv app
 * const app = new dwv.App();
 * // initialise
 * app.init({
 *   dataViewConfigs: {'*': [{divId: 'layerGroup0'}]},
 *   tools: {Opacity: {}}
 * });
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('Opacity');
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 */
export class Opacity {
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
   * Scroll wheel handler.
   *
   * @type {ScrollWheel}
   */
  #scrollWhell;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
    this.#scrollWhell = new ScrollWheel(app);
  }

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  mousedown = (event) => {
    // start flag
    this.#started = true;
    // first position
    this.x0 = event._x;
    this.y0 = event._y;
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

    // difference to last X position
    const diffX = event._x - this.x0;
    const xMove = (Math.abs(diffX) > 15);
    // do not trigger for small moves
    if (xMove) {
      const layerDetails = getLayerDetailsFromEvent(event);
      const layerGroup =
        this.#app.getLayerGroupByDivId(layerDetails.groupDivId);
      const viewLayer = layerGroup.getActiveViewLayer();
      const op = viewLayer.getOpacity();
      viewLayer.setOpacity(op + (diffX / 200));
      viewLayer.draw();

      // reset origin point
      this.x0 = event._x;
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
    // call mouse equivalent
    this.mousedown(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    // call mouse equivalent
    this.mousemove(event);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  touchend = (event) => {
    // call mouse equivalent
    this.mouseup(event);
  };

  /**
   * Handle mouse wheel event.
   *
   * @param {object} event The mouse wheel event.
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
    event.context = 'Opacity';
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

} // Opacity class
