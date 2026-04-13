import {ScrollWheelBehavior} from './behaviors/wheelBehavior.js';
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
export class WindowLevel extends LayerGroupPointer {

  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

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
    const dragBehavior = new WindowLevelDragBehavior();
    const doubleClickBehavior = new WindowLevelDoubleClickBehavior({app});
    super({
      app,
      dragBehavior,
      wheelBehavior: new ScrollWheelBehavior(),
      doubleClickBehavior
    });
    this.#app = app;
    this.#dragBehavior = dragBehavior;
    this.#doubleClickBehavior = doubleClickBehavior;
  }

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
