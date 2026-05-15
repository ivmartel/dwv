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
   * @type {EventListener[]}
   */
  #callbackStore = [];

  /**
   * @type {EventListener|undefined}
   */
  #drawLayerAddCallback;

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
   * @returns {Konva.Shape|undefined} The shape or undefined.
   */
  #getSelectShape(point, drawLayer) {
    let res;

    if (typeof drawLayer !== 'undefined') {
      const data = drawLayer.getDrawController().getAnnotationGroup();
      if (data.isEditable()) {
        const kStage = drawLayer.getKonvaStage();
        const intersection = kStage.getIntersection({
          x: point.getX(),
          y: point.getY()
        });
        if (intersection) {
          res = intersection;
        }
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
    if (kShape !== undefined) {
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
   * @returns {EventListener} The callback.
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
   * Get the 'drawlayeradd' callback.
   *
   * @returns {EventListener} The callback.
   */
  #getDrawLayerAddCallback() {
    return ((/** @type {CustomEvent} */ event) => {
      const layerid = event.detail?.layerid;
      const stgCtrl = this.#app.getStageController();
      const newDrawLayers = stgCtrl.getDrawLayers(function (item) {
        return item.getId() === layerid;
      });
      if (newDrawLayers.length === 1) {
        this.#activateLayer(newDrawLayers[0], true);
      }
    });
  }

  /**
   * Bind to app 'drawlayeradd'.
   */
  #bindToDrawLayerAdd() {
    if (typeof this.#drawLayerAddCallback === 'undefined') {
      this.#drawLayerAddCallback = this.#getDrawLayerAddCallback();
      this.#app.addEventListener('drawlayeradd', this.#drawLayerAddCallback);
    }
  }

  /**
   * Unbind to app 'drawlayeradd'.
   */
  #unbindToDrawLayerAdd() {
    if (typeof this.#drawLayerAddCallback !== 'undefined') {
      this.#app.removeEventListener('drawlayeradd', this.#drawLayerAddCallback);
      this.#drawLayerAddCallback = undefined;
    }
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
   * @param {boolean} flag True to activate.
   */
  activate(flag) {
    if (!flag) {
      this.#shapeHandler.onMouseOutShapeGroup();
    }
    // activate current layers
    const stgCtrl = this.#app.getStageController();
    const drawLayers = stgCtrl.getDrawLayers();
    for (const drawLayer of drawLayers) {
      if (typeof drawLayer !== 'undefined') {
        this.#activateLayer(drawLayer, flag);
      }
    }
    // listen to 'drawlayeradd'' to activate new layers
    if (flag) {
      this.#bindToDrawLayerAdd();
    } else {
      this.#unbindToDrawLayerAdd();
    }
  }

}
