import {PanDragBehavior} from './behaviors/dragBehavior.js';
import {PositionSetTapBehavior} from './behaviors/tapBehavior.js';
import {
  ZoomScrollTwoTouchBehavior
} from './behaviors/twoTouchBehavior.js';
import {ZoomWheelBehavior} from './behaviors/wheelBehavior.js';
import {LayerGroupPointer} from './layerGroupPointer.js';

/**
 * @import {App} from '../app/application.js';
 */

/**
 * ZoomAndPan class.
 * A tap sets the current position and fires a `tap` event with the
 * annotations and segments under it (see {@link PositionSetTapBehavior}).
 *
 * @example
 * import {App, AppOptions, ViewConfig, ToolConfig} from '//esm.sh/dwv';
 * // create the dwv app
 * const app = new App();
 * // initialise
 * const viewConfig0 = new ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new AppOptions(viewConfigs);
 * options.tools = {ZoomAndPan: new ToolConfig()};
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
export class ZoomAndPan extends LayerGroupPointer {

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
    const tapBehavior = new PositionSetTapBehavior();
    super({
      stageController: app.getStageController(),
      dragBehavior: new PanDragBehavior(),
      wheelBehavior: new ZoomWheelBehavior(),
      twoTouchBehavior: new ZoomScrollTwoTouchBehavior(),
      tapBehavior
    });
    this.#app = app;

    for (const type of this.getEventNames()) {
      tapBehavior.addEventListener(type, (e) => {
        const ce = /** @type {CustomEvent} */ (e);
        this.dispatchEvent(new CustomEvent(type, {detail: ce.detail}));
      });
    }
  }

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
   * @param {boolean} bool The flag to activate or not.
   */
  activate(bool) {
    if (!bool) {
      this.cancel();
    }
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

  /**
   * Get the list of event names that this tool can fire.
   *
   * @returns {string[]} The list of event names.
   */
  getEventNames() {
    return ['tap'];
  }

} // ZoomAndPan class
