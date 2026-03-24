import Konva from 'konva';
import {getPainter} from './shapePainters.js';
import {LabelFactory} from './labelFactory.js';
import {
  getDefaultAnchor,
  isNodeNameShape
} from './drawBounds.js';
import {Anchor} from './anchor.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Style} from '../gui/style.js';
import {Annotation} from '../image/annotation.js';
/* eslint-enable no-unused-vars */

/**
 * Generic Konva shape renderer.
 *
 * Delegates all annotation logic to the injected annotator and all
 * shape-specific Konva operations to the shapePainters registry.
 * This single class replaces the per-factory `createShapeGroup` /
 * `updateShapeGroupOnAnchorMove` implementations for all shapes except
 * BidimensionalFactory (which retains its own renderer due to its unique
 * interactive behaviour).
 */
export class ShapeRenderer {

  /**
   * The shape annotator that owns this renderer.
   *
   * @type {object}
   */
  #annotator;

  /**
   * The label factory, configured with the annotator's default position.
   *
   * @type {LabelFactory}
   */
  #labelFactory;

  /**
   * @param {object} annotator The annotator whose shapes this renderer draws.
   */
  constructor(annotator) {
    this.#annotator = annotator;
    this.#labelFactory = new LabelFactory(
      (annotation) => annotator.getDefaultLabelPosition(annotation)
    );
  }

  /**
   * Create a complete Konva group for an annotation.
   * The group is tagged with the annotation reference so that
   * `getAnchors` and `updateConnector` can retrieve it later.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Group} The Konva group.
   */
  createShapeGroup(annotation, style) {
    const painter = getPainter(this.#annotator.getName());

    const group = new Konva.Group();
    group.name(this.#annotator.getGroupName());
    group.visible(true);
    group.id(annotation.trackingUid);

    // main shape (always present)
    group.add(painter.createShape(annotation, style));

    // extras, label, connector only when the shape is fully drawn
    if (this.#annotator.isComplete(annotation)) {
      for (const extra of painter.createExtras(annotation, style)) {
        group.add(extra);
      }
      const label = this.#labelFactory.create(annotation, style);
      group.add(label);
      const connPositions =
        this.#annotator.getConnectorPositions(annotation);
      group.add(
        this.#labelFactory.getConnector(connPositions, label, style));
    }

    return group;
  }

  /**
   * Return Konva anchor ellipses for an annotation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Ellipse[]} The anchor nodes.
   */
  getAnchors(annotation, style) {
    if (!annotation) {
      return [];
    }
    const anchors = this.#annotator.getAnchors(annotation);
    return anchors.map((anchor) =>
      getDefaultAnchor(anchor.getX(), anchor.getY(), anchor.getId(), style)
    );
  }

  /**
   * Constrain an anchor's movement.
   * Converts the active Konva anchor to a generic Anchor, calls the
   * annotator (which may mutate its position), then writes the result back.
   *
   * @param {Konva.Ellipse} konvaAnchor The active Konva anchor.
   * @param {Annotation} annotation The annotation.
   */
  constrainAnchorMove(konvaAnchor, annotation) {
    const anchor = new Anchor(
      konvaAnchor.id(), konvaAnchor.x(), konvaAnchor.y());
    this.#annotator.constrainAnchorMove(anchor, annotation);
    konvaAnchor.x(anchor.getX());
    konvaAnchor.y(anchor.getY());
  }

  /**
   * Hande anchor movement end.
   *
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Annotation} annotation The associated annotation.
   */
  onAnchorMoveEnd(konvaAnchor, annotation) {
    // tell annotator
    this.#annotator.onAnchorMoveEnd();

    // update anchors if they were switched
    const group = konvaAnchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // update ALL anchor positions from the refreshed math shape
    const updatedAnchors = this.#annotator.getAnchors(annotation);
    for (const ua of updatedAnchors) {
      const ka = group.getChildren((n) => n.id() === ua.getId())[0];
      if (ka) {
        ka.x(ua.getX());
        ka.y(ua.getY());
      }
    }
  }

  /**
   * Update the annotation math shape after a Konva anchor move.
   * Converts the Konva anchor to a generic Anchor before delegating to the
   * annotator.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Konva.Shape} konvaAnchor The active Konva anchor.
   */
  updateAnnotationOnAnchorMove(annotation, konvaAnchor) {
    const anchor = new Anchor(
      konvaAnchor.id(), konvaAnchor.x(), konvaAnchor.y());
    this.#annotator.updateAnnotationOnAnchorMove(annotation, anchor);
  }

  /**
   * Update the entire shape group after an anchor has been moved.
   * By the time this is called, `updateAnnotationOnAnchorMove` has already
   * been called by the factory adapter, so `annotation.mathShape` reflects
   * the new geometry.
   *
   * @param {Annotation} annotation The updated annotation.
   * @param {Konva.Shape} anchor The active Konva anchor.
   * @param {Style} style The drawing style.
   */
  updateShapeGroupOnAnchorMove(annotation, anchor, style) {
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }

    const painter = getPainter(this.#annotator.getName());
    const shapeNode = group.getChildren(isNodeNameShape)[0];

    // update the main visual shape
    painter.updateShape(shapeNode, annotation, style);

    // update extras (ticks, arrowhead, arc, …)
    painter.updateExtras(group, annotation, style);

    // update ALL anchor positions from the refreshed math shape
    const updatedAnchors = this.#annotator.getAnchors(annotation);
    for (const ua of updatedAnchors) {
      const ka = group.getChildren((n) => n.id() === ua.getId())[0];
      if (ka) {
        ka.x(ua.getX());
        ka.y(ua.getY());
      }
    }

    // update label
    this.updateLabelContent(annotation, group, style);
    if (typeof annotation.labelPosition === 'undefined') {
      this.#labelFactory.updatePosition(annotation, group);
    }

    // update connector
    this.updateConnector(annotation, group);
  }

  /**
   * Update the label text inside a shape group.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Konva.Group} group The shape group.
   * @param {Style} _style The drawing style (unused, kept for API symmetry).
   */
  updateLabelContent(annotation, group, _style) {
    this.#labelFactory.updateContent(annotation, group);
  }

  /**
   * Update the connector line between the label and the shape.
   *
   * @param {Annotation} annotation The annotation (used for connector
   *   positions).
   * @param {Konva.Group} group The shape group.
   */
  updateConnector(annotation, group) {
    const connPositions = this.#annotator.getConnectorPositions(annotation);
    this.#labelFactory.updateConnector(group, connPositions);
  }

} // ShapeRenderer
