
import {BrushMode} from './behaviors/brushMaskPaint.js';
import {BrushDragBehavior} from './behaviors/brushDragBehavior.js';
import {ScrollWheelBehavior} from './behaviors/wheelBehavior.js';
import {LayerGroupPointer} from './layerGroupPointer.js';

/**
 * @import {App} from '../app/application.js';
 */

/**
 * Retrieves the unique div ids in the current data view configs.
 *
 * @param {object} dataViewConfigs The data view configs.
 * @returns {string[]} Array of unique div ids.
 */
function getUniqueDataViewConfigsDivIds(dataViewConfigs) {
  let allDivIds = [];
  if (!dataViewConfigs) {
    return [];
  }
  for (const key in dataViewConfigs) {
    if (dataViewConfigs[key]) {
      const viewConfigs = dataViewConfigs[key];
      if (Array.isArray(viewConfigs)) {
        const divIds = viewConfigs.map(function (config) {
          return config.divId;
        });
        allDivIds = [...allDivIds, ...divIds];
      }
    }
  }
  return [...new Set(allDivIds)];
}

/**
 * Brush class.
 */
export class Brush extends LayerGroupPointer {

  /**
   * @type {BrushDragBehavior}
   */
  #brushDrag;

  /**
   * @type {App}
   */
  #app;

  /**
   * Div ids whose context menu is currently deactivated.
   *
   * @type {string[]}
   */
  #contextMenuDivIds = [];

  /**
   * Context menu handler: prevents the browser menu so that
   * the right button can be used by the tool.
   *
   * @param {Event} event The context menu event.
   */
  #preventContextMenu = (event) => {
    event.preventDefault();
  };

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    const dragBehavior = new BrushDragBehavior(app);
    super({
      stageController: app.getStageController(),
      dragBehavior,
      wheelBehavior: new ScrollWheelBehavior(),
      longTouchToDblClickMs: null
    });
    this.#brushDrag = dragBehavior;
    this.#app = app;
    // forward brush drag behavior events to this tool
    for (const type of this.getEventNames()) {
      this.#brushDrag.addEventListener(type, (e) => {
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
    event.context = 'Brush';
    this.#app.onKeydown(event);

    const ctrlOrAlt = event.ctrlKey || event.altKey;

    if (!ctrlOrAlt && event.key === '+') {
      this.#brushDrag.setFeatures({brushSizeAdd: 1});
    } else if (!ctrlOrAlt && event.key === '-') {
      this.#brushDrag.setFeatures({brushSizeAdd: -1});
    } else if (!ctrlOrAlt && !Number.isNaN(Number.parseInt(event.key, 10))) {
      //this.#brushDrag.setFeatures({brushMode: BrushMode.Add});
      //const number = Number.parseInt(event.key, 10);
      //this.#setSelectedSegment2(number);
    } else if (!ctrlOrAlt && event.key === 'a') {
      this.#brushDrag.setFeatures({brushMode: BrushMode.Add});
    } else if (!ctrlOrAlt && event.key === 'd') {
      this.#brushDrag.setFeatures({brushMode: BrushMode.Del});
    }
  };

  /**
   * Activate the tool and activates/deactivates
   * the context menu of all dwv div ids.
   *
   * @param {boolean} bool The flag to activate or not.
   */
  activate(bool) {
    if (bool) {
      const stgCtrl = this.#app.getStageController();
      const viewConfigs = stgCtrl.getDataViewConfigs();
      this.#deactivateDivIdsContextMenu(
        getUniqueDataViewConfigsDivIds(viewConfigs));
      return;
    }
    this.cancel();
    this.#reactivateDivIdsContextMenu();
  }

  /**
   * Deactivates the context menu on all dwv div ids.
   *
   * @param {string[]} divIds The div ids whose context menu
   *   should be deactivated.
   */
  #deactivateDivIdsContextMenu(divIds) {
    // avoid leaving listeners on previously stored divs
    this.#reactivateDivIdsContextMenu();
    for (const divId of divIds) {
      const element = document.getElementById(divId);
      if (!element) {
        continue;
      }
      element.addEventListener('contextmenu', this.#preventContextMenu);
      this.#contextMenuDivIds.push(divId);
    }
  }

  /**
   * Reactivates the context menu on the previously deactivated div ids.
   */
  #reactivateDivIdsContextMenu() {
    for (const divId of this.#contextMenuDivIds) {
      const element = document.getElementById(divId);
      if (!element) {
        continue;
      }
      element.removeEventListener('contextmenu', this.#preventContextMenu);
    }
    this.#contextMenuDivIds = [];
  }

  /**
   * Set the tool live features.
   * See the documentation of the class members for details.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    this.#brushDrag.setFeatures(features);
  }

  /**
   * Initialise the tool.
   */
  init() {
    // does nothing
  }

  /**
   * Get the list of event names that this tool can fire.
   *
   * @returns {Array} The list of event names.
   */
  getEventNames() {
    return [
      'brushdraw',
      'brushremove',
      'brushsizechange',
      'erasingactivated',
      'erasingdeactivated'
    ];
  }

  /**
   * Help for this tool.
   *
   * @returns {object} The help content.
   */
  getHelpKeys() {
    return {
      title: 'tool.Brush.name',
      brief: 'tool.Brush.brief',
      mouse: {
        mouse_click: 'tool.Brush.mouse_click'
      },
      touch: {
        touch_click: 'tool.Brush.touch_click'
      }
    };
  }
} // Brush class
