import {Style} from '../gui/style.js';
import {LayerGroupPointer} from './layerGroupPointer.js';
import {ScrollWheelBehavior} from './behaviors/wheelBehavior.js';
import {LivewireTapBehavior} from './behaviors/livewireTapBehavior.js';
import {DrawSelect} from './behaviors/drawSelect.js';
import {DrawShapeHandler} from './shapes/drawShapeHandler.js';

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
   * @type {DrawSelect}
   */
  #drawSelect;

  /**
   * @type {LivewireTapBehavior}
   */
  #tapBehavior;

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
    const shapeHandler = new DrawShapeHandler(app);
    const drawSelect = new DrawSelect(app, shapeHandler);
    const tapBehavior = new LivewireTapBehavior(
      app,
      style,
      drawSelect
    );
    super({
      app,
      tapBehavior,
      wheelBehavior: new ScrollWheelBehavior()
    });
    this.#app = app;
    this.#drawSelect = drawSelect;
    this.#tapBehavior = tapBehavior;
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

    if (event.key === 'Escape') {
      this.#drawSelect.disableAndResetEditor();
    }
  };

  /**
   * Activate the tool.
   *
   * @param {boolean} bool The flag to activate or not.
   */
  activate(bool) {
    if (bool) {
      const stgCtrl = this.#app.getStageController();
      const lg = stgCtrl.getActiveLayerGroup();
      this.#style.setBaseScale(lg.getBaseScale());
      this.setFeatures({shapeColour: this.#style.getLineColour()});
    } else {
      this.cancel();
    }

    this.#drawSelect.activate(bool);
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

    this.#tapBehavior.setFeatures(features);
  }

}
