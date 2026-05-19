import {ScrollWheelBehavior} from './behaviors/wheelBehavior.js';
import {LayerGroupPointer} from './layerGroupPointer.js';
import {ScrollDragBehavior} from './behaviors/dragBehavior.js';
import {PlayDoubleClickBehavior} from './behaviors/doubleClickBehavior.js';
import {TooltipHoverBehavior} from './behaviors/hoverBehavior.js';
import {PositionSetTapBehavior} from './behaviors/tapBehavior.js';

/**
 * @import {App} from '../app/application.js';
 */

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
 *   const stgCtrl = app.getStageController();
 *   const lg = stgCtrl.getLayerGroupByDivId('layerGroup0');
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
 *   const dataCtrl = app.getDataController();
 *   const size = dataCtrl.get(0).image.getGeometry().getSize();
 *   range.max = size.get(2) - 1;
 * });
 * // update slider on slice change (for ex via mouse wheel)
 * app.addEventListener('positionchange', function () {
 *   const stgCtrl = app.getStageController();
 *   const lg = stgCtrl.getLayerGroupByDivId('layerGroup0');
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
export class Scroll extends LayerGroupPointer {
  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * Hover tooltip behaviour (slice index tooltip when enabled).
   *
   * @type {TooltipHoverBehavior}
   */
  #tooltipHover;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    const tooltipHover = new TooltipHoverBehavior();
    super({
      stageController: app.getStageController(),
      dragBehavior: new ScrollDragBehavior(),
      hoverBehavior: tooltipHover,
      wheelBehavior: new ScrollWheelBehavior(),
      doubleClickBehavior: new PlayDoubleClickBehavior(),
      tapBehavior: new PositionSetTapBehavior()
    });
    this.#app = app;
    this.#tooltipHover = tooltipHover;
  }

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
   * Set the tool live features: slice tooltip on hover.
   *
   * @param {object} features The list of features.
   * @param {boolean} [features.displayTooltip] Show tooltip on mouse move.
   */
  setFeatures(features) {
    if (typeof features.displayTooltip !== 'undefined') {
      this.#tooltipHover.setTooltipEnabled(Boolean(features.displayTooltip));
    }
  }

  /**
   * Initialise the tool.
   */
  init() {
    // does nothing
  }

} // Scroll class
