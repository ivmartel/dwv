import {ScrollWheel} from './scrollWheel.js';
import {LayerGroupPointer} from './layerGroupPointer.js';
import {WindowLevelDragBehavior} from './behaviors/dragBehavior.js';
import {
  WindowLevelDoubleClickBehavior
} from './behaviors/doubleClickBehavior.js';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application.js';
/* eslint-enable no-unused-vars */

/**
 * WindowLevel tool: handle window/level related events.
 *
 * @example
 * import {App, AppOptions, ViewConfig, ToolConfig} from '//esm.sh/dwv';
 * // create the dwv app
 * const app = new App();
 * // initialise
 * const viewConfig0 = new ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new AppOptions(viewConfigs);
 * options.tools = {WindowLevel: new ToolConfig()};
 * app.init(options);
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('WindowLevel');
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 */
export class WindowLevel {

  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * Drag lifecycle (mouse / single touch).
   *
   * @type {LayerGroupPointer}
   */
  #pointer;

  /**
   * Window/level drag behavior.
   *
   * @type {WindowLevelDragBehavior}
   */
  #dragBehavior;

  /**
   * Double-click W/L behavior (strict view layer mirrors drag behavior).
   *
   * @type {WindowLevelDoubleClickBehavior}
   */
  #doubleClickBehavior;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
    const scrollWheel = new ScrollWheel(app);
    const wlBehavior = new WindowLevelDragBehavior();
    this.#dragBehavior = wlBehavior;
    this.#doubleClickBehavior = new WindowLevelDoubleClickBehavior({app});
    this.#pointer = new LayerGroupPointer({
      app: this.#app,
      dragBehavior: wlBehavior,
      wheelBehavior: scrollWheel,
      doubleClickBehavior: this.#doubleClickBehavior
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
    this.#pointer.handleTouchStart(event);
  };

  /**
   * Handle touch move event.
   *
   * @param {object} event The touch move event.
   */
  touchmove = (event) => {
    this.#pointer.handleTouchMove(event);
  };

  /**
   * Handle touch end event.
   *
   * @param {object} event The touch end event.
   */
  touchend = (event) => {
    this.#pointer.handleTouchEnd(event);
  };

  /**
   * Handle double click event.
   *
   * @param {object} event The double click event.
   */
  dblclick = (event) => {
    this.#pointer.handleDoubleClick(event);
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
    event.context = 'WindowLevel';
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
   * Set the tool live features.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.strictViewLayer !== 'undefined') {
      this.#dragBehavior.setStrictViewLayer(features.strictViewLayer);
      this.#doubleClickBehavior.setStrictViewLayer(features.strictViewLayer);
    }
  }

} // WindowLevel class
