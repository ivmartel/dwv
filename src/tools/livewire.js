import {Style} from '../gui/style.js';
import {LayerGroupPointer} from './layerGroupPointer.js';
import {ScrollWheelBehavior} from './behaviors/wheelBehavior.js';
import {LivewireTapBehavior} from './behaviors/livewireTapBehavior.js';

/**
 * @import {App} from '../app/application.js';
 */

/**
 * Livewire painting tool.
 */
export class Livewire extends LayerGroupPointer {
  /**
   * Associated app.
   *
   * @type {App}
   */
  #app;

  /**
   * Drawing style.
   *
   * @type {Style}
   */
  #style;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    const style = new Style();
    super({
      app,
      tapBehavior: new LivewireTapBehavior(app, style),
      wheelBehavior: new ScrollWheelBehavior()
    });
    this.#app = app;
    this.#style = style;
  }

  /**
   * Handle key down event.
   *
   * @param {object} event The key down event.
   */
  keydown = (event) => {
    event.context = 'Livewire';
    this.#app.onKeydown(event);
  };

  /**
   * Activate the tool.
   *
   * @param {boolean} bool The flag to activate or not.
   */
  activate(bool) {
    if (bool) {
      this.#style.setBaseScale(this.#app.getBaseScale());
      this.setFeatures({shapeColour: this.#style.getLineColour()});
    }
  }

  /**
   * Initialise the tool.
   */
  init() {
    // does nothing
  }

  /**
   * Set the tool live features: shape colour.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.shapeColour !== 'undefined') {
      this.#style.setLineColour(features.shapeColour);
    }
  }

}
