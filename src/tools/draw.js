import {logger} from '../utils/logger.js';
import {RemoveAnnotationCommand} from '../command/drawCommands.js';
import {ScrollWheelBehavior} from './behaviors/wheelBehavior.js';
import {DrawTapBehavior} from './behaviors/drawTapBehavior.js';
import {LayerGroupPointer} from './layerGroupPointer.js';
import {DrawShapeHandler} from './shapes/drawShapeHandler.js';

/**
 * @import {App} from '../app/application.js';
 * @import {DrawLayer} from '../gui/drawLayer.js';
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
   * Callback store to allow attach/detach.
   *
   * @type {Array}
   */
  #callbackStore = [];

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    // Use a reference to 'this' since we
    //   cannot use 'this' before calling 'super'
    const drawToolRef = {
      /** @type {LayerGroupPointer|undefined} */
      self: undefined
    };
    const shapeHandler = new DrawShapeHandler(app, (data) => {
      drawToolRef.self?.dispatchEvent(
        new CustomEvent(data.type, {detail: data}));
    });
    const tapBehavior = new DrawTapBehavior(app, shapeHandler);
    super({
      app,
      tapBehavior,
      wheelBehavior: new ScrollWheelBehavior()
    });
    drawToolRef.self = this;
    this.#app = app;
    this.#drawTap = tapBehavior;
    this.#shapeHandler = shapeHandler;

    for (const type of this.getEventNames()) {
      this.#drawTap.addEventListener(type, (e) => {
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
      const layerGroup = this.#app.getActiveLayerGroup();
      const drawLayer = layerGroup.getActiveDrawLayer();
      if (typeof drawLayer === 'undefined') {
        logger.warn('No draw layer to handle key down');
        return;
      }
      const drawController = drawLayer.getDrawController();

      const command = new RemoveAnnotationCommand(annotation, drawController);
      this.#app.addToUndoStack(command);
      command.execute();

      this.#shapeHandler.onMouseOutShapeGroup();
    }

    if (event.key === 'Escape') {
      this.#drawTap.resetPlacement();
    }
  };

  /**
   * Get a DrawLayer position callback.
   *
   * TODO: check need for store item removal.
   *
   * @param {DrawLayer} layer The layer to update.
   * @returns {Function} The callback.
   */
  #getPositionCallback(layer) {
    const layerId = layer.getId();
    if (typeof this.#callbackStore[layerId] === 'undefined') {
      this.#callbackStore[layerId] = () => {
        layer.activateCurrentPositionShapes(true);
      };
    }
    return this.#callbackStore[layerId];
  }

  /**
   * Activate a draw layer.
   *
   * @param {DrawLayer} drawLayer The layer to update.
   * @param {boolean} flag The flag to activate or not.
   */
  #activateLayer(drawLayer, flag) {
    drawLayer.setShapeHandler(this.#shapeHandler);
    drawLayer.activateCurrentPositionShapes(flag);
    if (flag) {
      this.#app.addEventListener('positionchange',
        this.#getPositionCallback(drawLayer)
      );
    } else {
      this.#app.removeEventListener('positionchange',
        this.#getPositionCallback(drawLayer)
      );
    }
  }

  /**
   * Activate the tool.
   *
   * @param {boolean} flag The flag to activate or not.
   */
  activate(flag) {
    if (!flag) {
      this.#shapeHandler.onMouseOutShapeGroup();
    }
    const drawLayers = this.#app.getDrawLayers();
    for (const drawLayer of drawLayers) {
      if (typeof drawLayer !== 'undefined') {
        this.#activateLayer(drawLayer, flag);
      }
    }
    this.#app.addEventListener('drawlayeradd', (event) => {
      const newDrawLayers = this.#app.getDrawLayers(function (item) {
        return item.getId() === event.layerid;
      });
      if (newDrawLayers.length === 1) {
        this.#activateLayer(newDrawLayers[0], flag);
      }
    });
  }

  /**
   * Set the tool configuration options.
   *
   * @param {object} options The list of shape names amd classes.
   */
  setOptions(options) {
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
