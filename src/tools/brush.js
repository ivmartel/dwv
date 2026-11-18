
import {BrushMode} from './behaviors/brushMaskPaint.js';
import {BrushDragBehavior} from './behaviors/brushDragBehavior.js';
import {ScrollWheelBehavior} from './behaviors/wheelBehavior.js';
import {LayerGroupPointer} from './layerGroupPointer.js';

/**
 * @import {App} from '../app/application.js';
 */

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
   * Handle context menu event: prevents the browser menu so that
   * the right button can be used by the tool.
   *
   * @param {MouseEvent} event The context menu event.
   */
  contextmenu = (event) => {
    event.preventDefault();
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
