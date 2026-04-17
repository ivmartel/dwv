import {WindowLevel} from './windowLevel.js';
import {Scroll} from './scroll.js';
import {ZoomAndPan} from './zoomPan.js';
import {Opacity} from './opacity.js';
import {Draw} from './draw.js';
import {Brush} from './brush.js';
import {Floodfill} from './floodfill.js';
import {Livewire} from './livewire.js';
import {Filter} from './filter.js';

/**
 * List of client provided tools to be added to
 * the default ones.
 *
 * @example
 * import {App, AppOptions, ViewConfig, toolList} from '//esm.sh/dwv';
 * // custom tool
 * class AlertTool {
 *   mousedown() {alert('AlertTool mousedown');}
 *   init() {}
 *   activate() {}
 * }
 * // pass it to dwv tool list
 * toolList['Alert'] = AlertTool;
 * // create the dwv app
 * const app = new App();
 * // initialise
 * const viewConfig0 = new ViewConfig('layerGroup0');
 * const viewConfigs = {'*': [viewConfig0]};
 * const options = new AppOptions(viewConfigs);
 * options.tools = {Alert: {}};
 * app.init(options);
 * // activate tool
 * app.addEventListener('load', function () {
 *   app.setTool('Alert');
 * });
 * // load dicom data
 * app.loadURLs([
 *   'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm'
 * ]);
 *
 * @type {Object<string, any>}
 */
export const toolList = {};

/**
 * Default tool list.
 *
 * @type {Object<string, any>}
 */
export const defaultToolList = {
  WindowLevel,
  Scroll,
  ZoomAndPan,
  Opacity,
  Draw,
  Brush,
  Filter,
  Floodfill,
  Livewire
};
