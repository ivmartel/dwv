import {ProtractorAnnotator} from './shapeAnnotators.js';
import {ShapeRenderer} from './shapeRenderer.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Style} from '../gui/style.js';
import {Annotation} from '../image/annotation.js';
/* eslint-enable no-unused-vars */

/**
 * Protractor factory.
 *
 * Thin adapter that delegates annotation logic to {@link ProtractorAnnotator}
 * and Konva rendering to {@link ShapeRenderer}.
 */
export class ProtractorFactory {

  /**
   * @type {ProtractorAnnotator}
   */
  #annotator = new ProtractorAnnotator();

  /**
   * @type {ShapeRenderer}
   */
  #renderer = new ShapeRenderer(this.#annotator);

  /**
   * Does this factory support the input math shape.
   *
   * @param {object} mathShape The mathematical shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return ProtractorAnnotator.supports(mathShape);
  }

  /**
   * Get the name of the factory.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#annotator.getName();
  }

  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return this.#annotator.getGroupName();
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The number of points.
   */
  getNPoints() {
    return this.#annotator.getNPoints();
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  getTimeout() {
    return this.#annotator.getTimeout();
  }

  /**
   * Set an annotation math shape from input points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The points.
   */
  setAnnotationMathShape(annotation, points) {
    this.#annotator.setAnnotationMathShape(annotation, points);
  }

  /**
   * Create a protractor shape to be displayed.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Group} The Konva group.
   */
  createShapeGroup(annotation, style) {
    return this.#renderer.createShapeGroup(annotation, style);
  }

  /**
   * Get anchors to update a protractor shape.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The application style.
   * @returns {Konva.Ellipse[]} A list of anchors.
   */
  getAnchors(annotation, style) {
    return this.#renderer.getAnchors(annotation, style);
  }

  /**
   * Constrain anchor movement.
   *
   * @param {Konva.Ellipse} anchor The active anchor.
   */
  constrainAnchorMove(anchor) {
    this.#renderer.constrainAnchorMove(anchor);
  }

  /**
   * Update shape and label on anchor move taking the updated
   *   annotation as input.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} style The application style.
   */
  updateShapeGroupOnAnchorMove(annotation, anchor, style) {
    this.#renderer.updateShapeGroupOnAnchorMove(annotation, anchor, style);
  }

  /**
   * Update an annotation on anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Konva.Shape} anchor The anchor.
   */
  updateAnnotationOnAnchorMove(annotation, anchor) {
    this.#renderer.updateAnnotationOnAnchorMove(annotation, anchor);
  }

  /**
   * Update an annotation on translation (shape move).
   *
   * @param {Annotation} annotation The annotation.
   * @param {object} translation The translation.
   */
  updateAnnotationOnTranslation(annotation, translation) {
    this.#annotator.updateAnnotationOnTranslation(annotation, translation);
  }

  /**
   * Update the shape label.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Konva.Group} group The shape group.
   * @param {Style} style The application style.
   */
  updateLabelContent(annotation, group, style) {
    this.#renderer.updateLabelContent(annotation, group, style);
  }

  /**
   * Update the shape connector.
   *
   * @param {Konva.Group} group The shape group.
   */
  updateConnector(group) {
    const annotation = group.getAttr('annotation');
    this.#renderer.updateConnector(annotation, group);
  }

} // ProtractorFactory
