import {ROI} from '../math/roi.js';
import {Point2D} from '../math/point.js';
import {custom} from '../app/custom.js';
import {
  defaultLabelTexts,
  getLineShape,
  DRAW_DEBUG,
  getDefaultAnchor,
  getAnchorIndex
} from './drawBounds.js';
import {LabelFactory} from './labelFactory.js';

// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {Style} from '../gui/style.js';
import {Annotation} from '../image/annotation.js';
/* eslint-enable no-unused-vars */

/**
 * ROI factory.
 */
export class RoiFactory {

  /**
   * The name of the factory.
   *
   * @type {string}
   */
  #name = 'roi';

  /**
   * The associated label factory.
   *
   * @type {LabelFactory}
   */
  #labelFactory = new LabelFactory(this.#getDefaultLabelPosition);

  /**
   * Does this factory support the input math shape.
   *
   * @param {object} mathShape The mathematical shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return mathShape instanceof ROI;
  }

  /**
   * Get the name of the factory.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return this.#name + '-group';
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number|undefined} The number of points.
   */
  getNPoints() {
    // undefined to end with double click
    return undefined;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  getTimeout() {
    return 100;
  }

  /**
   * Set an annotation math shape from input points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The points.
   */
  setAnnotationMathShape(annotation, points) {
    annotation.mathShape = this.#calculateMathShape(points);
    annotation.setTextExpr(this.#getDefaultLabel());
    annotation.updateQuantification();
  }

  /**
   * Create a roi shape to be displayed.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Group} The Konva group.
   */
  createShapeGroup(annotation, style) {
    // konva group
    const group = new Konva.Group();
    group.name(this.getGroupName());
    group.visible(true);
    group.id(annotation.trackingUid);
    // konva shape
    const shape = this.#createShape(annotation, style);
    group.add(this.#createShape(annotation, style));
    // konva label
    const label = this.#labelFactory.create(annotation, style);
    group.add(this.#labelFactory.create(annotation, style));
    // label-shape connector
    const connectorsPos = this.#getConnectorsPositions(shape);
    group.add(this.#labelFactory.getConnector(connectorsPos, label, style));

    // konva shadow (if debug)
    if (DRAW_DEBUG) {
      group.add(this.#getDebugShadow(annotation));
    }
    return group;
  }

  /**
   * Get the anchors positions for the shape.
   *
   * @param {Konva.Line} shape The associated shape.
   * @returns {Point2D[]} The anchor positions.
   */
  #getAnchorsPositions(shape) {
    const points = shape.points();
    const sx = shape.x();
    const sy = shape.y();
    const positions = [];
    for (let i = 0; i < points.length; i = i + 2) {
      positions.push(new Point2D(
        points[i] + sx,
        points[i + 1] + sy
      ));
    }
    return positions;
  }

  /**
   * Get the connectors positions for the shape.
   *
   * @param {Konva.Line} shape The associated shape.
   * @returns {Point2D[]} The connectors positions.
   */
  #getConnectorsPositions(shape) {
    const points = shape.points();
    const sx = shape.x();
    const sy = shape.y();
    const positions = [];
    for (let i = 0; i < points.length; i += 2) {
      const nextIndex = (i + 2) % points.length;
      const midX = (points[i] + points[nextIndex]) / 2 + sx;
      const midY = (points[i + 1] + points[nextIndex + 1]) / 2 + sy;
      positions.push(new Point2D(midX, midY));
    }
    return positions;
  }

  /**
   * Get anchors to update a roi shape.
   *
   * @param {Konva.Line} shape The associated shape.
   * @param {Style} style The application style.
   * @returns {Konva.Ellipse[]} A list of anchors.
   */
  getAnchors(shape, style) {
    const positions = this.#getAnchorsPositions(shape);
    const anchors = [];
    for (let i = 0; i < positions.length; ++i) {
      anchors.push(getDefaultAnchor(
        positions[i].getX(),
        positions[i].getY(),
        'anchor' + i,
        style
      ));
    }
    return anchors;
  }

  /**
   * Constrain anchor movement.
   *
   * @param {Konva.Ellipse} _anchor The active anchor.
   */
  constrainAnchorMove(_anchor) {
    // no constraints
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
    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }

    // update shape and anchors
    this.#updateShape(annotation, anchor, style);
    // update label
    this.updateLabelContent(annotation, group, style);
    // update label position if default position
    if (typeof annotation.labelPosition === 'undefined') {
      this.#labelFactory.updatePosition(annotation, group);
    }
    // update connector
    this.updateConnector(group);
    // update shadow
    if (DRAW_DEBUG) {
      this.#updateDebugShadow(annotation, group);
    }
  }

  /**
   * Update an annotation on anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Konva.Shape} anchor The anchor.
   */
  updateAnnotationOnAnchorMove(annotation, anchor) {
    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // associated shape
    const kroi = this.#getShape(group);

    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the main list)
    const roi = annotation.mathShape;
    const points = roi.getPoints().slice();
    const newPoint = new Point2D(
      anchor.x() - kroi.x(),
      anchor.y() - kroi.y()
    );
    const index = getAnchorIndex(anchor.id());
    points[index] = newPoint;

    // new math shape
    annotation.mathShape = new ROI(points);
    // quantification
    annotation.updateQuantification();
  }

  /**
   * Update an annotation on translation (shape move).
   *
   * @param {Annotation} annotation The annotation.
   * @param {object} translation The translation.
   */
  updateAnnotationOnTranslation(annotation, translation) {
    // math shape
    const roi = annotation.mathShape;
    const newPoints = [];
    for (let i = 0; i < roi.getLength(); ++i) {
      newPoints.push(new Point2D(
        roi.getPoint(i).getX() + translation.x,
        roi.getPoint(i).getY() + translation.y
      ));
    }
    annotation.mathShape = new ROI(newPoints);
    // quantification
    annotation.updateQuantification();
  }

  /**
   * Update the shape label.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Konva.Group} group The shape group.
   * @param {Style} _style The application style.
   */
  updateLabelContent(annotation, group, _style) {
    this.#labelFactory.updateContent(annotation, group);
  }

  /**
   * Update the shape connector.
   *
   * @param {Konva.Group} group The shape group.
   */
  updateConnector(group) {
    const kshape = this.#getShape(group);
    const connectorsPos = this.#getConnectorsPositions(kshape);
    this.#labelFactory.updateConnector(group, connectorsPos);
  }

  /**
   * Calculate the mathematical shape from a list of points.
   *
   * @param {Point2D[]} points The points that define the shape.
   * @returns {ROI} The mathematical shape.
   */
  #calculateMathShape(points) {
    return new ROI(points);
  }

  /**
   * Get the default labels.
   *
   * @returns {object} The label list.
   */
  #getDefaultLabel() {
    if (typeof custom.labelTexts !== 'undefined' &&
      typeof custom.labelTexts[this.#name] !== 'undefined'
    ) {
      return custom.labelTexts[this.#name];
    } else {
      return defaultLabelTexts[this.#name];
    }
  }

  /**
   * Creates the konva shape.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Line} The konva shape.
   */
  #createShape(annotation, style) {
    const roi = annotation.mathShape;
    // konva line
    const arr = [];
    for (let i = 0; i < roi.getLength(); ++i) {
      arr.push(roi.getPoint(i).getX());
      arr.push(roi.getPoint(i).getY());
    }
    return new Konva.Line({
      points: arr,
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape',
      closed: true
    });
  }

  /**
   * Get the associated shape from a group.
   *
   * @param {Konva.Group} group The group to look into.
   * @returns {Konva.Line|undefined} The shape.
   */
  #getShape(group) {
    return getLineShape(group);
  }

  /**
   * Get the default annotation label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  #getDefaultLabelPosition(annotation) {
    const roi = annotation.mathShape;
    return new Point2D(
      roi.getPoint(0).getX(),
      roi.getPoint(0).getY()
    );
  }

  /**
   * Update shape on anchor move.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} _style The application style.
   */
  #updateShape(annotation, anchor, _style) {

    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // associated shape
    const kroi = this.#getShape(group);
    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the main list)
    const points = kroi.points();
    const index = getAnchorIndex(anchor.id()) * 2;
    points[index] = anchor.x() - kroi.x();
    points[index + 1] = anchor.y() - kroi.y();
    kroi.points(points);

    // update self
    const point = group.getChildren(function (node) {
      return node.id() === anchor.id();
    })[0];

    point.x(anchor.x());
    point.y(anchor.y());
  }

  /**
   * Get the debug shadow.
   *
   * @param {Annotation} _annotation The anootation to shadow.
   * @param {Konva.Group} [_group] The associated group.
   * @returns {Konva.Line} The shadow konva line.
   */
  #getDebugShadow(_annotation, _group) {
    // does nothing
    return undefined;
  }

  /**
   * Update the debug shadow.
   *
   * @param {Annotation} _annotation The annotation to shadow.
   * @param {Konva.Group} _group The associated group.
   */
  #updateDebugShadow(_annotation, _group) {
    // does nothing
  }

} // class RoiFactory
