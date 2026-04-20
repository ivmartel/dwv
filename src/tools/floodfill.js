import {Style} from '../gui/style.js';
import {LayerGroupPointer} from './layerGroupPointer.js';
import {FloodfillDragBehavior} from './behaviors/floodfillDragBehavior.js';

/**
 * @import {App} from '../app/application.js';
 */

/**
 * Floodfill painting tool.
 */
export class Floodfill extends LayerGroupPointer {
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
  #style = new Style();

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    const style = new Style();
    const dragBehavior = new FloodfillDragBehavior(
      app,
      style
    );
    super({
      app,
      dragBehavior
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
    event.context = 'Floodfill';
    this.#app.onKeydown(event);
  };

  /**
   * Activate the tool.
   *
   * @param {boolean} bool The flag to activate or not.
   */
  activate(bool) {
    if (bool) {
      // init with the app window scale
      this.#style.setBaseScale(this.#app.getBaseScale());
      // set the default to the first in the list
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

} // Floodfill class
