import {Rectangle} from '../math/rectangle.js';
import {Circle} from '../math/circle.js';
import {Ellipse} from '../math/ellipse.js';
import {Line} from '../math/line.js';
import {Protractor} from '../math/protractor.js';
import {ROI} from '../math/roi.js';
import {Point2D} from '../math/point.js';
import {custom} from '../app/custom.js';
import {logger} from '../utils/logger.js';
import {Anchor} from './anchor.js';
import {defaultLabelTexts} from './drawBounds.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Annotation} from '../image/annotation.js';
/* eslint-enable no-unused-vars */

/**
 * Get the label text expression for a named shape, honouring the custom
 * label override when one is set.
 *
 * @param {string} name The shape name.
 * @returns {object} The label text expression object.
 */
function getDefaultLabel(name) {
  if (typeof custom.labelTexts !== 'undefined' &&
    typeof custom.labelTexts[name] !== 'undefined'
  ) {
    return custom.labelTexts[name];
  }
  return defaultLabelTexts[name];
}

/**
 * Rectangle shape annotator.
 * Handles pure annotation logic (math shape ↔ anchor/translation updates)
 * for the rectangle tool — no Konva node creation.
 */
export class RectangleAnnotator {

  /**
   * @type {string}
   */
  #name = 'rectangle';

  /**
   * Does this annotator support the input math shape.
   *
   * @param {object} mathShape The math shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return mathShape instanceof Rectangle;
  }

  /**
   * Get the name.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the Konva group name.
   *
   * @returns {string} The group name.
   */
  getGroupName() {
    return `${this.#name}-group`;
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The point count.
   */
  getNPoints() {
    return 2;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} Timeout in milliseconds.
   */
  getTimeout() {
    return 0;
  }

  /**
   * Returns true when the annotation has enough data to be fully rendered.
   *
   * @returns {boolean} Always true for rectangles.
   */
  isComplete() {
    return true;
  }

  /**
   * Set the annotation math shape from input points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The input points.
   */
  setAnnotationMathShape(annotation, points) {
    annotation.mathShape = new Rectangle(points[0], points[1]);
    annotation.setTextExpr(getDefaultLabel(this.#name));
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after an anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Anchor} anchor The active anchor.
   */
  updateAnnotationOnAnchorMove(annotation, anchor) {
    const allAnchors = this.getAnchors(annotation);
    allAnchors[Anchor.indexFromId(anchor.getId())] = anchor;
    const topLeft = allAnchors[0];
    const bottomRight = allAnchors[2];
    annotation.mathShape = new Rectangle(
      new Point2D(topLeft.getX(), topLeft.getY()),
      new Point2D(bottomRight.getX(), bottomRight.getY())
    );
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after a group translation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {object} translation The translation {x, y}.
   */
  updateAnnotationOnTranslation(annotation, translation) {
    const rect = annotation.mathShape;
    const begin = rect.getBegin();
    const end = rect.getEnd();
    annotation.mathShape = new Rectangle(
      new Point2D(
        begin.getX() + translation.x, begin.getY() + translation.y),
      new Point2D(
        end.getX() + translation.x, end.getY() + translation.y)
    );
    annotation.updateQuantification();
  }

  /**
   * Constrain the anchor movement (no constraints for rectangle).
   *
   * @param {Annotation} _annotation The annotation (unused).
   * @param {Anchor} _anchor The active anchor.
   */
  constrainAnchorMove(_annotation, _anchor,) {
    // no constraints
  }

  /**
   * Get the anchors for the current math shape
   * (topLeft, topRight, bottomRight, bottomLeft).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Anchor[]} The anchors.
   */
  getAnchors(annotation) {
    const rect = annotation.mathShape;
    const sx = rect.getBegin().getX();
    const sy = rect.getBegin().getY();
    const w = rect.getWidth();
    const h = rect.getHeight();
    return [
      Anchor.fromIndex(0, sx, sy),
      Anchor.fromIndex(1, sx + w, sy),
      Anchor.fromIndex(2, sx + w, sy + h),
      Anchor.fromIndex(3, sx, sy + h)
    ];
  }

  /**
   * Get the connector positions for the current math shape.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D[]} The connector positions (edge midpoints).
   */
  getConnectorPositions(annotation) {
    const rect = annotation.mathShape;
    const sx = rect.getBegin().getX();
    const sy = rect.getBegin().getY();
    const w = rect.getWidth();
    const h = rect.getHeight();
    return [
      new Point2D(sx + w / 2, sy),
      new Point2D(sx, sy + h / 2),
      new Point2D(sx + w / 2, sy + h),
      new Point2D(sx + w, sy + h / 2)
    ];
  }

  /**
   * Get the default label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  getDefaultLabelPosition(annotation) {
    const rect = annotation.mathShape;
    return new Point2D(
      rect.getBegin().getX(),
      rect.getEnd().getY()
    );
  }

} // RectangleAnnotator

/**
 * Circle shape annotator.
 */
export class CircleAnnotator {

  /**
   * @type {string}
   */
  #name = 'circle';

  /**
   * Does this annotator support the input math shape.
   *
   * @param {object} mathShape The math shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return mathShape instanceof Circle;
  }

  /**
   * Get the name.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the Konva group name.
   *
   * @returns {string} The group name.
   */
  getGroupName() {
    return `${this.#name}-group`;
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The point count.
   */
  getNPoints() {
    return 2;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} Timeout in milliseconds.
   */
  getTimeout() {
    return 0;
  }

  /**
   * Returns true when the annotation has enough data to be fully rendered.
   *
   * @returns {boolean} Always true for circles.
   */
  isComplete() {
    return true;
  }

  /**
   * Set the annotation math shape from input points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The input points.
   */
  setAnnotationMathShape(annotation, points) {
    const a = Math.abs(points[0].getX() - points[1].getX());
    const b = Math.abs(points[0].getY() - points[1].getY());
    annotation.mathShape = new Circle(
      points[0], Math.round(Math.sqrt(a * a + b * b)));
    annotation.setTextExpr(getDefaultLabel(this.#name));
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after an anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Anchor} anchor The active anchor.
   */
  updateAnnotationOnAnchorMove(annotation, anchor) {
    const circle = annotation.mathShape;
    const center = new Point2D(
      circle.getCenter().getX(), circle.getCenter().getY());
    const anchorPoint = new Point2D(anchor.getX(), anchor.getY());
    annotation.mathShape = new Circle(center, center.getDistance(anchorPoint));
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after a group translation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {object} translation The translation {x, y}.
   */
  updateAnnotationOnTranslation(annotation, translation) {
    const circle = annotation.mathShape;
    const center = circle.getCenter();
    annotation.mathShape = new Circle(
      new Point2D(
        center.getX() + translation.x, center.getY() + translation.y),
      circle.getRadius()
    );
    annotation.updateQuantification();
  }

  /**
   * Constrain the anchor movement: horizontal anchors block Y, vertical
   * anchors block X.
   *
   * @param {Anchor} anchor The active anchor.
   * @param {Annotation} annotation The annotation (for sibling positions).
   */
  constrainAnchorMove(anchor, annotation) {
    const siblings = this.getAnchors(annotation);
    switch (anchor.getId()) {
      case 'anchor0':
        anchor.setY(siblings[1].getY());
        break;
      case 'anchor1':
        anchor.setY(siblings[0].getY());
        break;
      case 'anchor2':
        anchor.setX(siblings[3].getX());
        break;
      case 'anchor3':
        anchor.setX(siblings[2].getX());
        break;
      default:
        logger.error(`Unhandled anchor id: ${anchor.getId()}`);
    }
  }

  /**
   * Get the anchors (left, right, bottom, top).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Anchor[]} The anchors.
   */
  getAnchors(annotation) {
    const circle = annotation.mathShape;
    const cx = circle.getCenter().getX();
    const cy = circle.getCenter().getY();
    const r = circle.getRadius();
    return [
      Anchor.fromIndex(0, cx - r, cy),
      Anchor.fromIndex(1, cx + r, cy),
      Anchor.fromIndex(2, cx, cy + r),
      Anchor.fromIndex(3, cx, cy - r)
    ];
  }

  /**
   * Get the connector positions (diagonal points on the circle).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D[]} The connector positions.
   */
  getConnectorPositions(annotation) {
    const circle = annotation.mathShape;
    const cx = circle.getCenter().getX();
    const cy = circle.getCenter().getY();
    const r = circle.getRadius() * Math.sqrt(2) / 2;
    return [
      new Point2D(cx - r, cy - r),
      new Point2D(cx + r, cy - r),
      new Point2D(cx - r, cy + r),
      new Point2D(cx + r, cy + r)
    ];
  }

  /**
   * Get the default label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  getDefaultLabelPosition(annotation) {
    const circle = annotation.mathShape;
    const center = circle.getCenter();
    const radius = circle.getRadius();
    return new Point2D(
      center.getX() - radius,
      center.getY() + radius
    );
  }

} // CircleAnnotator

/**
 * Ellipse shape annotator.
 */
export class EllipseAnnotator {

  /**
   * @type {string}
   */
  #name = 'ellipse';

  /**
   * Does this annotator support the input math shape.
   *
   * @param {object} mathShape The math shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return mathShape instanceof Ellipse;
  }

  /**
   * Get the name.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the Konva group name.
   *
   * @returns {string} The group name.
   */
  getGroupName() {
    return `${this.#name}-group`;
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The point count.
   */
  getNPoints() {
    return 2;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} Timeout in milliseconds.
   */
  getTimeout() {
    return 0;
  }

  /**
   * Returns true when the annotation has enough data to be fully rendered.
   *
   * @returns {boolean} Always true for ellipses.
   */
  isComplete() {
    return true;
  }

  /**
   * Set the annotation math shape from input points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The input points.
   */
  setAnnotationMathShape(annotation, points) {
    const a = Math.abs(points[0].getX() - points[1].getX());
    const b = Math.abs(points[0].getY() - points[1].getY());
    annotation.mathShape = new Ellipse(points[0], a, b);
    annotation.setTextExpr(getDefaultLabel(this.#name));
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after an anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Anchor} anchor The active anchor.
   */
  updateAnnotationOnAnchorMove(annotation, anchor) {
    const ellipse = annotation.mathShape;
    const center = ellipse.getCenter();
    let radiusX = ellipse.getA();
    let radiusY = ellipse.getB();
    switch (anchor.getId()) {
      case 'anchor0':
        radiusX = center.getX() - anchor.getX();
        break;
      case 'anchor1':
        radiusX = anchor.getX() - center.getX();
        break;
      case 'anchor2':
        radiusY = anchor.getY() - center.getY();
        break;
      case 'anchor3':
        radiusY = center.getY() - anchor.getY();
        break;
      default:
        logger.error(`Unhandled anchor id: ${anchor.getId()}`);
    }
    annotation.mathShape = new Ellipse(
      center, Math.abs(radiusX), Math.abs(radiusY));
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after a group translation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {object} translation The translation {x, y}.
   */
  updateAnnotationOnTranslation(annotation, translation) {
    const ellipse = annotation.mathShape;
    const center = ellipse.getCenter();
    annotation.mathShape = new Ellipse(
      new Point2D(
        center.getX() + translation.x, center.getY() + translation.y),
      ellipse.getA(),
      ellipse.getB()
    );
    annotation.updateQuantification();
  }

  /**
   * Constrain anchor movement: horizontal anchors block Y, vertical block X.
   *
   * @param {Anchor} anchor The active anchor.
   * @param {Annotation} annotation The annotation (for sibling positions).
   */
  constrainAnchorMove(anchor, annotation) {
    const siblings = this.getAnchors(annotation);
    switch (anchor.getId()) {
      case 'anchor0':
        anchor.setY(siblings[1].getY());
        break;
      case 'anchor1':
        anchor.setY(siblings[0].getY());
        break;
      case 'anchor2':
        anchor.setX(siblings[3].getX());
        break;
      case 'anchor3':
        anchor.setX(siblings[2].getX());
        break;
      default:
        logger.error(`Unhandled anchor id: ${anchor.getId()}`);
    }
  }

  /**
   * Get the anchors (left, right, bottom, top).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Anchor[]} The anchors.
   */
  getAnchors(annotation) {
    const ellipse = annotation.mathShape;
    const cx = ellipse.getCenter().getX();
    const cy = ellipse.getCenter().getY();
    const rx = ellipse.getA();
    const ry = ellipse.getB();
    return [
      Anchor.fromIndex(0, cx - rx, cy),
      Anchor.fromIndex(1, cx + rx, cy),
      Anchor.fromIndex(2, cx, cy + ry),
      Anchor.fromIndex(3, cx, cy - ry)
    ];
  }

  /**
   * Get the connector positions (diagonal points on the ellipse).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D[]} The connector positions.
   */
  getConnectorPositions(annotation) {
    const ellipse = annotation.mathShape;
    const cx = ellipse.getCenter().getX();
    const cy = ellipse.getCenter().getY();
    const rx = ellipse.getA() * Math.sqrt(2) / 2;
    const ry = ellipse.getB() * Math.sqrt(2) / 2;
    return [
      new Point2D(cx - rx, cy - ry),
      new Point2D(cx + rx, cy - ry),
      new Point2D(cx - rx, cy + ry),
      new Point2D(cx + rx, cy + ry)
    ];
  }

  /**
   * Get the default label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  getDefaultLabelPosition(annotation) {
    const ellipse = annotation.mathShape;
    const center = ellipse.getCenter();
    return new Point2D(
      center.getX() - ellipse.getA(),
      center.getY() + ellipse.getB()
    );
  }

} // EllipseAnnotator

/**
 * Ruler (Line) shape annotator.
 */
export class RulerAnnotator {

  /**
   * @type {string}
   */
  #name = 'ruler';

  /**
   * Does this annotator support the input math shape.
   *
   * @param {object} mathShape The math shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return mathShape instanceof Line;
  }

  /**
   * Get the name.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the Konva group name.
   *
   * @returns {string} The group name.
   */
  getGroupName() {
    return `${this.#name}-group`;
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The point count.
   */
  getNPoints() {
    return 2;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} Timeout in milliseconds.
   */
  getTimeout() {
    return 0;
  }

  /**
   * Returns true when the annotation has enough data to be fully rendered.
   *
   * @returns {boolean} Always true for rulers.
   */
  isComplete() {
    return true;
  }

  /**
   * Set the annotation math shape from input points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The input points.
   */
  setAnnotationMathShape(annotation, points) {
    annotation.mathShape = new Line(points[0], points[1]);
    annotation.setTextExpr(getDefaultLabel(this.#name));
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after an anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Anchor} anchor The active anchor.
   */
  updateAnnotationOnAnchorMove(annotation, anchor) {
    const allAnchors = this.getAnchors(annotation);
    allAnchors[Anchor.indexFromId(anchor.getId())] = anchor;
    const begin = allAnchors[0];
    const end = allAnchors[1];
    annotation.mathShape = new Line(
      new Point2D(begin.getX(), begin.getY()),
      new Point2D(end.getX(), end.getY())
    );
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after a group translation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {object} translation The translation {x, y}.
   */
  updateAnnotationOnTranslation(annotation, translation) {
    const line = annotation.mathShape;
    const begin = line.getBegin();
    const end = line.getEnd();
    annotation.mathShape = new Line(
      new Point2D(
        begin.getX() + translation.x, begin.getY() + translation.y),
      new Point2D(
        end.getX() + translation.x, end.getY() + translation.y)
    );
    annotation.updateQuantification();
  }

  /**
   * Constrain the anchor movement (no constraints for ruler).
   *
   * @param {Annotation} _annotation The annotation (unused).
   * @param {Anchor} _anchor The active anchor.
   */
  constrainAnchorMove(_annotation, _anchor) {
    // no constraints
  }

  /**
   * Get the anchors (begin, end).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Anchor[]} The anchors.
   */
  getAnchors(annotation) {
    const line = annotation.mathShape;
    const begin = line.getBegin();
    const end = line.getEnd();
    return [
      Anchor.fromIndex(0, begin.getX(), begin.getY()),
      Anchor.fromIndex(1, end.getX(), end.getY())
    ];
  }

  /**
   * Get the connector positions (midpoint).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D[]} The connector positions.
   */
  getConnectorPositions(annotation) {
    const line = annotation.mathShape;
    const begin = line.getBegin();
    const end = line.getEnd();
    return [new Point2D(
      (begin.getX() + end.getX()) / 2,
      (begin.getY() + end.getY()) / 2
    )];
  }

  /**
   * Get the default label position (lowest endpoint).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  getDefaultLabelPosition(annotation) {
    const line = annotation.mathShape;
    const begin = line.getBegin();
    const end = line.getEnd();
    return begin.getY() >= end.getY() ? begin : end;
  }

} // RulerAnnotator

/**
 * Arrow shape annotator.
 * The math shape is the arrow tip (Point2D); the tail is stored in
 * annotation.referencePoints[0].
 */
export class ArrowAnnotator {

  /**
   * @type {string}
   */
  #name = 'arrow';

  /**
   * Does this annotator support the input math shape.
   *
   * @param {object} mathShape The math shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return mathShape instanceof Point2D;
  }

  /**
   * Get the name.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the Konva group name.
   *
   * @returns {string} The group name.
   */
  getGroupName() {
    return `${this.#name}-group`;
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The point count.
   */
  getNPoints() {
    return 2;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} Timeout in milliseconds.
   */
  getTimeout() {
    return 0;
  }

  /**
   * Returns true when the annotation has enough data to be fully rendered.
   *
   * @returns {boolean} Always true for arrows.
   */
  isComplete() {
    return true;
  }

  /**
   * Set the annotation math shape from input points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The input points.
   */
  setAnnotationMathShape(annotation, points) {
    annotation.mathShape = points[0];
    annotation.referencePoints = [points[1]];
    annotation.setTextExpr(getDefaultLabel(this.#name));
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after an anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Anchor} anchor The active anchor.
   */
  updateAnnotationOnAnchorMove(annotation, anchor) {
    const allAnchors = this.getAnchors(annotation);
    allAnchors[Anchor.indexFromId(anchor.getId())] = anchor;
    const begin = allAnchors[0];
    const end = allAnchors[1];
    annotation.mathShape = new Point2D(begin.getX(), begin.getY());
    annotation.referencePoints = [new Point2D(end.getX(), end.getY())];
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after a group translation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {object} translation The translation {x, y}.
   */
  updateAnnotationOnTranslation(annotation, translation) {
    const point = annotation.mathShape;
    const endPoint = annotation.referencePoints[0];
    annotation.mathShape = new Point2D(
      point.getX() + translation.x, point.getY() + translation.y);
    annotation.referencePoints = [new Point2D(
      endPoint.getX() + translation.x, endPoint.getY() + translation.y)];
    annotation.updateQuantification();
  }

  /**
   * Constrain the anchor movement (no constraints for arrow).
   *
   * @param {Annotation} _annotation The annotation (unused).
   * @param {Anchor} _anchor The active anchor.
   */
  constrainAnchorMove(_annotation, _anchor) {
    // no constraints
  }

  /**
   * Get the anchors (tip, tail).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Anchor[]} The anchors.
   */
  getAnchors(annotation) {
    const tip = annotation.mathShape;
    const tail = annotation.referencePoints[0];
    return [
      Anchor.fromIndex(0, tip.getX(), tip.getY()),
      Anchor.fromIndex(1, tail.getX(), tail.getY())
    ];
  }

  /**
   * Get the connector positions (midpoint).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D[]} The connector positions.
   */
  getConnectorPositions(annotation) {
    const tip = annotation.mathShape;
    const tail = annotation.referencePoints[0];
    return [new Point2D(
      (tip.getX() + tail.getX()) / 2,
      (tip.getY() + tail.getY()) / 2
    )];
  }

  /**
   * Get the default label position (at the tip).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  getDefaultLabelPosition(annotation) {
    return annotation.mathShape;
  }

} // ArrowAnnotator

/**
 * ROI shape annotator.
 */
export class RoiAnnotator {

  /**
   * @type {string}
   */
  #name = 'roi';

  /**
   * Does this annotator support the input math shape.
   *
   * @param {object} mathShape The math shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return mathShape instanceof ROI;
  }

  /**
   * Get the name.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the Konva group name.
   *
   * @returns {string} The group name.
   */
  getGroupName() {
    return `${this.#name}-group`;
  }

  /**
   * Get the number of points needed to build the shape (undefined = double
   * click to finish).
   *
   * @returns {undefined} No fixed point count.
   */
  getNPoints() {
    return undefined;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} Timeout in milliseconds.
   */
  getTimeout() {
    return 100;
  }

  /**
   * Returns true when the annotation has enough data to be fully rendered.
   *
   * @returns {boolean} Always true for ROI.
   */
  isComplete() {
    return true;
  }

  /**
   * Set the annotation math shape from input points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The input points.
   */
  setAnnotationMathShape(annotation, points) {
    annotation.mathShape = new ROI(points);
    annotation.setTextExpr(getDefaultLabel(this.#name));
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after an anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Anchor} anchor The active anchor.
   */
  updateAnnotationOnAnchorMove(annotation, anchor) {
    const roi = annotation.mathShape;
    const points = roi.getPoints().slice();
    const index = Anchor.indexFromId(anchor.getId());
    points[index] = new Point2D(anchor.getX(), anchor.getY());
    annotation.mathShape = new ROI(points);
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after a group translation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {object} translation The translation {x, y}.
   */
  updateAnnotationOnTranslation(annotation, translation) {
    const roi = annotation.mathShape;
    const newPoints = [];
    for (let i = 0; i < roi.getLength(); ++i) {
      newPoints.push(new Point2D(
        roi.getPoint(i).getX() + translation.x,
        roi.getPoint(i).getY() + translation.y
      ));
    }
    annotation.mathShape = new ROI(newPoints);
    annotation.updateQuantification();
  }

  /**
   * Constrain the anchor movement (no constraints for ROI).
   *
   * @param {Annotation} _annotation The annotation (unused).
   * @param {Anchor} _anchor The active anchor.
   */
  constrainAnchorMove(_annotation, _anchor) {
    // no constraints
  }

  /**
   * Get the anchors (one per ROI vertex).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Anchor[]} The anchors.
   */
  getAnchors(annotation) {
    const roi = annotation.mathShape;
    const anchors = [];
    for (let i = 0; i < roi.getLength(); ++i) {
      const pt = roi.getPoint(i);
      anchors.push(Anchor.fromIndex(i, pt.getX(), pt.getY()));
    }
    return anchors;
  }

  /**
   * Get the connector positions (edge midpoints).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D[]} The connector positions.
   */
  getConnectorPositions(annotation) {
    const roi = annotation.mathShape;
    const n = roi.getLength();
    const positions = [];
    for (let i = 0; i < n; ++i) {
      const p0 = roi.getPoint(i);
      const p1 = roi.getPoint((i + 1) % n);
      positions.push(new Point2D(
        (p0.getX() + p1.getX()) / 2,
        (p0.getY() + p1.getY()) / 2
      ));
    }
    return positions;
  }

  /**
   * Get the default label position (first vertex).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  getDefaultLabelPosition(annotation) {
    return annotation.mathShape.getPoint(0);
  }

} // RoiAnnotator

/**
 * Protractor shape annotator.
 */
export class ProtractorAnnotator {

  /**
   * @type {string}
   */
  #name = 'protractor';

  /**
   * Does this annotator support the input math shape.
   *
   * @param {object} mathShape The math shape.
   * @returns {boolean} True if supported.
   */
  static supports(mathShape) {
    return mathShape instanceof Protractor;
  }

  /**
   * Get the name.
   *
   * @returns {string} The name.
   */
  getName() {
    return this.#name;
  }

  /**
   * Get the Konva group name.
   *
   * @returns {string} The group name.
   */
  getGroupName() {
    return `${this.#name}-group`;
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The point count.
   */
  getNPoints() {
    return 3;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} Timeout in milliseconds.
   */
  getTimeout() {
    return 500;
  }

  /**
   * Returns true when the protractor has all 3 points.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {boolean} True if complete.
   */
  isComplete(annotation) {
    return annotation.mathShape.getLength() === this.getNPoints();
  }

  /**
   * Set the annotation math shape from input points.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Point2D[]} points The input points.
   */
  setAnnotationMathShape(annotation, points) {
    annotation.mathShape = new Protractor(points);
    annotation.setTextExpr(getDefaultLabel(this.#name));
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after an anchor move.
   *
   * @param {Annotation} annotation The annotation.
   * @param {Anchor} anchor The active anchor.
   */
  updateAnnotationOnAnchorMove(annotation, anchor) {
    const allAnchors = this.getAnchors(annotation);
    allAnchors[Anchor.indexFromId(anchor.getId())] = anchor;
    const begin = allAnchors[0];
    const mid = allAnchors[1];
    const end = allAnchors[2];
    annotation.mathShape = new Protractor([
      new Point2D(begin.getX(), begin.getY()),
      new Point2D(mid.getX(), mid.getY()),
      new Point2D(end.getX(), end.getY())
    ]);
    annotation.updateQuantification();
  }

  /**
   * Update the annotation math shape after a group translation.
   *
   * @param {Annotation} annotation The annotation.
   * @param {object} translation The translation {x, y}.
   */
  updateAnnotationOnTranslation(annotation, translation) {
    const protractor = annotation.mathShape;
    const newPoints = [];
    for (let i = 0; i < 3; ++i) {
      newPoints.push(new Point2D(
        protractor.getPoint(i).getX() + translation.x,
        protractor.getPoint(i).getY() + translation.y
      ));
    }
    annotation.mathShape = new Protractor(newPoints);
    annotation.updateQuantification();
  }

  /**
   * Constrain the anchor movement (no constraints for protractor).
   *
   * @param {Annotation} _annotation The annotation (unused).
   * @param {Anchor} _anchor The active anchor.
   */
  constrainAnchorMove(_annotation, _anchor) {
    // no constraints
  }

  /**
   * Get the anchors (up to 3, matching the protractor's current point count).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Anchor[]} The anchors.
   */
  getAnchors(annotation) {
    const protractor = annotation.mathShape;
    const anchors = [];
    for (let i = 0; i < protractor.getLength(); ++i) {
      const pt = protractor.getPoint(i);
      anchors.push(Anchor.fromIndex(i, pt.getX(), pt.getY()));
    }
    return anchors;
  }

  /**
   * Get the connector positions (vertex — point 1).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D[]} The connector positions.
   */
  getConnectorPositions(annotation) {
    return [annotation.mathShape.getPoint(1)];
  }

  /**
   * Get the default label position (midpoint between the two arm centroids).
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  getDefaultLabelPosition(annotation) {
    const protractor = annotation.mathShape;
    const line0 = new Line(protractor.getPoint(0), protractor.getPoint(1));
    const line1 = new Line(protractor.getPoint(1), protractor.getPoint(2));
    return new Point2D(
      (line0.getCentroid().getX() + line1.getCentroid().getX()) / 2,
      (line0.getCentroid().getY() + line1.getCentroid().getY()) / 2
    );
  }

} // ProtractorAnnotator
