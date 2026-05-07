// external
import Konva from 'konva';

/**
 * @import {App} from '../../app/application.js';
 * @import {Point2D} from '../../math/point.js';
 * @import {DrawLayer} from '../../gui/drawLayer.js';
 * @import {DrawShapeHandler} from '../shapes/drawShapeHandler.js';
 */

/**
 * Draw select class.
 */
export class DrawSelect {

  /**
   * @type {App}
   */
  #app;

  /**
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
   * Annotation group meta validator.
   *
   * @type {Function|undefined}
   */
  #drawMetaValidator;

  /**
   * @param {App} app The application.
   * @param {DrawShapeHandler} shapeHandler Handler for selecting and editing
   *   existing shapes.
   */
  constructor(app, shapeHandler) {
    this.#app = app;
    this.#shapeHandler = shapeHandler;
  }

  /**
   * @param {object} features Live features (validator, …).
   */
  setFeatures(features) {
    if (typeof features.drawMetaValidator !== 'undefined') {
      this.#drawMetaValidator = features.drawMetaValidator;
    }
  }

  disableAndResetEditor() {
    this.#shapeHandler.disableAndResetEditor();
  }

  /**
   * Check if the draw data can be edited.
   *
   * @param {DrawLayer} drawLayer The draw layer.
   * @returns {boolean} True if the data is editable.
   */
  checkCanEdit(drawLayer) {
    return this.#checkDrawData(drawLayer);
  }

  /**
   * Check if the draw data is valid.
   *
   * @param {DrawLayer} drawLayer The draw layer.
   * @returns {boolean} True if the data is editable.
   */
  #checkDrawData(drawLayer) {
    let res = true;
    const validator = this.#drawMetaValidator;
    if (typeof validator !== 'undefined') {
      const drawDataId = drawLayer.getDataId();
      const drawData = this.#app.getData(drawDataId);
      const drawMeta = drawData.annotationGroup.getMeta();
      res = validator(drawMeta);
    }
    return res;
  }

  /**
   * Get the data under the input point.
   *
   * @param {Point2D} point The point where to find the data.
   * @param {DrawLayer} drawLayer The draw layer.
   * @returns {Konva.Shape|null} The shape of null.
   */
  #getSelectShape(point, drawLayer) {
    let res = null;

    if (typeof drawLayer !== 'undefined') {
      const data = drawLayer.getDrawController().getAnnotationGroup();
      if (data.isEditable()) {
        const kStage = drawLayer.getKonvaStage();
        res = kStage.getIntersection({
          x: point.getX(),
          y: point.getY()
        });
      }
    }
    return res;
  }

  /**
   * Select a shape group.
   *
   * @param {Konva.Shape} kshape The shape that has been selected.
   * @param {DrawLayer} drawLayer The draw layer where to draw.
   * @returns {boolean} True if all good.
   */
  #selectShapeGroup(kshape, drawLayer) {
    // get shape
    let group = kshape.getParent();
    if (kshape instanceof Konva.Tag) {
      group = group.getParent();
    }
    const selectedShape = group.find('.shape')[0];
    if (!(selectedShape instanceof Konva.Shape)) {
      return false;
    }
    // select shape
    this.#shapeHandler.setEditorShape(selectedShape, drawLayer);

    return true;
  }

  /**
   * Try to select an existing shape at the pointer.
   *
   * @param {Point2D} point Display point.
   * @param {DrawLayer} drawLayer Layer group.
   * @returns {boolean} True if successful.
   */
  trySelectShapeGroup(point, drawLayer) {
    const kShape = this.#getSelectShape(point, drawLayer);
    if (kShape) {
      return this.#selectShapeGroup(kShape, drawLayer);
    }
    return false;
  }

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

  activate(flag) {
    if (!flag) {
      this.#shapeHandler.onMouseOutShapeGroup();
    }
    // activate current layers
    const drawLayers = this.#app.getDrawLayers();
    for (const drawLayer of drawLayers) {
      if (typeof drawLayer !== 'undefined') {
        this.#activateLayer(drawLayer, flag);
      }
    }
    // listen to activate new layers
    this.#app.addEventListener('drawlayeradd', (event) => {
      const newDrawLayers = this.#app.getDrawLayers(function (item) {
        return item.getId() === event.layerid;
      });
      if (newDrawLayers.length === 1) {
        this.#activateLayer(newDrawLayers[0], flag);
      }
    });
  }
}
