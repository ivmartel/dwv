import {ScrollWheel} from './scrollWheel.js';
import {LayerGroupPointer} from './layerGroupPointer.js';
import {ScrollDragBehavior} from './behaviors/dragBehavior.js';
import {PlayDoubleClickBehavior} from './behaviors/doubleClickBehavior.js';
import {TooltipHoverBehavior} from './behaviors/hoverBehavior.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application.js';
import {Point2D} from '../math/point.js';
import {LayerGroup} from '../gui/layerGroup.js';
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
   * Drag / hover pointer session.
   *
   * @type {LayerGroupPointer}
   */
  #pointer;

  /**
   * Touch timer ID (created by setTimeout), or null when idle.
   *
   * @type {number|null}
   */
  #touchTimerID = null;

  /**
   * Option to show or not a value tooltip on mousemove.
   *
   * @type {boolean}
   */
  #displayTooltip = false;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
    const scrollWheel = new ScrollWheel(app);
    const scrollBehavior = new ScrollDragBehavior();
    const playDoubleClick = new PlayDoubleClickBehavior();
    const tooltipHover = new TooltipHoverBehavior({
      isTooltipEnabled: () => this.#displayTooltip
    });
    this.#pointer = new LayerGroupPointer({
      app: this.#app,
      dragBehavior: scrollBehavior,
      hoverBehavior: tooltipHover,
      wheelBehavior: scrollWheel,
      doubleClickBehavior: playDoubleClick
    });
  }

  /**
   * Handle mouse down event.
   *
   * @param {object} event The mouse down event.
   */
  mousedown = (event) => {
    this.#pointer.handleMouseDown(event);
  };

  /**
   * Handle mouse move event.
   *
   * @param {object} event The mouse move event.
   */
  mousemove = (event) => {
    this.#pointer.handleMouseMove(event);
  };

  /**
   * Handle mouse up event.
   *
   * @param {object} event The mouse up event.
   */
  mouseup = (event) => {
    this.#pointer.handleMouseUp(event);
  };

  /**
   * Handle mouse out event.
   *
   * @param {object} event The mouse out event.
   */
  mouseout = (event) => {
    this.#pointer.handleMouseOut(event);
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
    this.#pointer.handleTouchStart(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    if (this.#touchTimerID !== null) {
      clearTimeout(this.#touchTimerID);
      this.#touchTimerID = null;
    }
    this.#pointer.handleTouchMove(event);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  touchend = (event) => {
    if (this.#touchTimerID !== null) {
      clearTimeout(this.#touchTimerID);
      this.#touchTimerID = null;
    }
    this.#pointer.handleTouchEnd(event);
  };

  /**
   * Handle mouse wheel event.
   *
   * @param {WheelEvent} event The mouse wheel event.
   */
  wheel = (event) => {
    this.#pointer.handleWheel(event);
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
    this.#pointer.handleDoubleClick(event);
  };

  /**
   * Activate the tool.
   *
   * @param {boolean} _bool The flag to activate or not.
   */
  activate(_bool) {
    if (!_bool) {
      this.#pointer.cancel();
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
