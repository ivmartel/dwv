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
   * @returns {object|undefined} Shape details if valid or undefined.
   */
  #selectShapeGroup(kshape, drawLayer) {
    let group = kshape.getParent();
    if (kshape instanceof Konva.Tag) {
      group = group.getParent();
    }
    const selectedShape = group.find('.shape')[0];
    if (!(selectedShape instanceof Konva.Shape)) {
      return;
    }

    this.#shapeHandler.setEditorShape(selectedShape, drawLayer);

    return {
      type: 'annotationselect',
      annotationid: group.id(),
      dataid: drawLayer.getDataId()
    };
  }

  /**
   * Try to select an existing shape at the pointer.
   *
   * @param {Point2D} point Display point.
   * @param {DrawLayer} drawLayer Layer group.
   * @returns {object|undefined} Shape details if found or undefined.
   */
  trySelectShapeGroup(point, drawLayer) {
    let res;
    const kShape = this.#getSelectShape(point, drawLayer);
    if (kShape) {
      res = this.#selectShapeGroup(kShape, drawLayer);
    }
    return res;
  }
}
