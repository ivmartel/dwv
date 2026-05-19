import {logger} from '../utils/logger.js';
import {RemoveAnnotationCommand} from '../command/drawCommands.js';
import {ScrollWheelBehavior} from './behaviors/wheelBehavior.js';
import {DrawTapBehavior} from './behaviors/drawTapBehavior.js';
import {DrawDragBehavior} from './behaviors/drawDragBehavior.js';
import {DrawSelect} from './behaviors/drawSelect.js';
import {LayerGroupPointer} from './layerGroupPointer.js';
import {DrawShapeHandler} from './shapes/drawShapeHandler.js';

/**
 * @import {App} from '../app/application.js';
 */

/**
 * Drawing tool.
 */
export class Draw extends LayerGroupPointer {

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
   * @type {DrawDragBehavior}
   */
  #drawDrag;

  /**
   * @type {DrawTapBehavior}
   */
  #drawTap;

  /**
   * Shape handler: activate listeners on existing shape.
   *
   * @type {DrawShapeHandler}
   */
  #shapeHandler;

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    const shapeHandler = new DrawShapeHandler(app);
    const drawSelect = new DrawSelect(app, shapeHandler);
    const tapBehavior = new DrawTapBehavior(app, drawSelect);
    const dragBehavior = new DrawDragBehavior(app, drawSelect);
    super({
      app,
      dragBehavior,
      tapBehavior,
      wheelBehavior: new ScrollWheelBehavior()
    });
    this.#app = app;
    this.#drawSelect = drawSelect;
    this.#drawDrag = dragBehavior;
    this.#drawTap = tapBehavior;
    this.#shapeHandler = shapeHandler;

    for (const type of this.getEventNames()) {
      this.#drawDrag.addEventListener(type, (e) => {
        const ce = /** @type {CustomEvent} */ (e);
        this.dispatchEvent(new CustomEvent(type, {detail: ce.detail}));
      });
      this.#drawTap.addEventListener(type, (e) => {
        const ce = /** @type {CustomEvent} */ (e);
        this.dispatchEvent(new CustomEvent(type, {detail: ce.detail}));
      });
      this.#shapeHandler.addEventListener(type, (e) => {
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
    if (!this.#drawTap.isActive()) {
      event.context = 'Draw';
      this.#app.onKeydown(event);
    }

    const annotation = this.#shapeHandler.getEditorAnnotation();
    if ((event.key === 'Delete' ||
      event.key === 'Backspace') &&
      typeof annotation !== 'undefined') {
      const stgCtrl = this.#app.getStageController();
      const layerGroup = stgCtrl.getActiveLayerGroup();
      const drawLayer = layerGroup.getActiveDrawLayer();
      if (typeof drawLayer === 'undefined') {
        logger.warn('No draw layer to handle key down');
        return;
      }
      const drawController = drawLayer.getDrawController();
      const undoCtrl = this.#app.getUndoController();

      const command = new RemoveAnnotationCommand(annotation, drawController);
      undoCtrl.addToUndoStack(command);
      command.execute();

      this.#shapeHandler.onMouseOutShapeGroup();
    }

    if (event.key === 'Escape') {
      this.#drawDrag.resetPlacement();
      this.#drawTap.resetPlacement();
      this.#drawSelect.disableAndResetEditor();
    }
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

    this.#drawSelect.activate(bool);
  }

  /**
   * Set the tool configuration options.
   *
   * @param {object} options The list of shape names amd classes.
   */
  setOptions(options) {
    this.#drawDrag.setOptions(options);
    this.#drawTap.setOptions(options);
  }

  /**
   * Get the type of tool options: here 'factory' since the shape
   * list contains factories to create each possible shape.
   *
   * @returns {string} The type.
   */
  getOptionsType() {
    return 'factory';
  }

  /**
   * Set the tool live features.
   *
   * @param {object} features The list of features.
   */
  setFeatures(features) {
    if (typeof features.mouseOverCursor !== 'undefined') {
      this.#shapeHandler.storeMouseOverCursor(features.mouseOverCursor);
    }
    this.#drawDrag.setFeatures(features);
    this.#drawTap.setFeatures(features);
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
   * @returns {string[]} The list of event names.
   */
  getEventNames() {
    return [
      'annotationupdate', 'annotationselect', 'warn'
    ];
  }

  /**
   * Check if the shape is in the shape list.
   *
   * @param {string} name The name of the shape.
   * @returns {boolean} True if there is a factory for the shape.
   */
  hasShape(name) {
    return this.#drawTap.hasShape(name);
  }

}
