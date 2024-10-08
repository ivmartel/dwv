import {Ellipse} from '../math/ellipse';
import {Point2D} from '../math/point';
import {logger} from '../utils/logger';
import {defaults} from '../app/defaults';
import {DRAW_DEBUG, getDefaultAnchor} from './drawBounds';
import {LabelFactory} from './labelFactory';

// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {Style} from '../gui/style';
import {Annotation} from '../image/annotation';
/* eslint-enable no-unused-vars */

/**
 * Ellipse factory.
 */
export class EllipseFactory {

  /**
   * The name of the factory.
   *
   * @type {string}
   */
  #name = 'ellipse';

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
    return mathShape instanceof Ellipse;
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
   * @returns {number} The number of points.
   */
  getNPoints() {
    return 2;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  getTimeout() {
    return 0;
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
   * Create an ellipse shape to be displayed.
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
    group.id(annotation.id);
    // konva shape
    group.add(this.#createShape(annotation, style));
    // konva label
    group.add(this.#labelFactory.create(annotation, style));
    // konva shadow (if debug)
    if (DRAW_DEBUG) {
      group.add(this.#getDebugShadow(annotation));
    }
    return group;
  }

  /**
   * Get anchors to update a ellipse shape.
   *
   * @param {Konva.Ellipse} shape The associated shape.
   * @param {Style} style The application style.
   * @returns {Konva.Ellipse[]} A list of anchors.
   */
  getAnchors(shape, style) {
    const centerX = shape.x();
    const centerY = shape.y();
    const radius = shape.radius();

    const anchors = [];
    anchors.push(getDefaultAnchor(
      centerX - radius.x, centerY, 'left', style
    ));
    anchors.push(getDefaultAnchor(
      centerX + radius.x, centerY, 'right', style
    ));
    anchors.push(getDefaultAnchor(
      centerX, centerY + radius.y, 'bottom', style
    ));
    anchors.push(getDefaultAnchor(
      centerX, centerY - radius.y, 'top', style
    ));
    return anchors;
  }

  /**
   * Constrain anchor movement.
   *
   * @param {Konva.Ellipse} anchor The active anchor.
   */
  constrainAnchorMove(anchor) {
    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }

    // find special points
    const left = group.getChildren(function (node) {
      return node.id() === 'left';
    })[0];
    const right = group.getChildren(function (node) {
      return node.id() === 'right';
    })[0];
    const bottom = group.getChildren(function (node) {
      return node.id() === 'bottom';
    })[0];
    const top = group.getChildren(function (node) {
      return node.id() === 'top';
    })[0];

    // update 'self' (undo case) and special points
    switch (anchor.id()) {
    case 'left':
      // block y
      left.y(right.y());
      break;
    case 'right':
      // block y
      right.y(left.y());
      break;
    case 'bottom':
      // block x
      bottom.x(top.x());
      break;
    case 'top':
      // block x
      top.x(bottom.x());
      break;
    default :
      logger.error('Unhandled anchor id: ' + anchor.id());
      break;
    }
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
    // math shape
    const ellipse = annotation.mathShape;
    const center = ellipse.getCenter();
    let radiusX = ellipse.getA();
    let radiusY = ellipse.getB();

    // update 'self' (undo case) and special points
    switch (anchor.id()) {
    case 'left':
      radiusX = center.getX() - anchor.x();
      break;
    case 'right':
      radiusX = anchor.x() - center.getX();
      break;
    case 'bottom':
      radiusY = anchor.y() - center.getY();
      break;
    case 'top':
      radiusY = center.getY() - anchor.y();
      break;
    default :
      logger.error('Unhandled anchor id: ' + anchor.id());
      break;
    }

    annotation.mathShape = new Ellipse(
      center, Math.abs(radiusX), Math.abs(radiusY));
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
    const ellipse = annotation.mathShape;
    const center = ellipse.getCenter();
    const newCenter = new Point2D(
      center.getX() + translation.x,
      center.getY() + translation.y
    );
    annotation.mathShape = new Ellipse(
      newCenter, ellipse.getA(), ellipse.getB());
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
   * Calculate the mathematical shape from a list of points.
   *
   * @param {Point2D[]} points The points that define the shape.
   * @returns {Ellipse} The mathematical shape.
   */
  #calculateMathShape(points) {
    // calculate radius
    const a = Math.abs(points[0].getX() - points[1].getX());
    const b = Math.abs(points[0].getY() - points[1].getY());
    // physical shape
    return new Ellipse(points[0], a, b);
  }

  /**
   * Get the default labels.
   *
   * @returns {object} The label list.
   */
  #getDefaultLabel() {
    return defaults.labelText.ellipse;
  }

  /**
   * Creates the konva shape.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Ellipse} The konva shape.
   */
  #createShape(annotation, style) {
    const ellipse = annotation.mathShape;
    const center = ellipse.getCenter();
    const radius = {
      x: ellipse.getA(),
      y: ellipse.getB()
    };
    // konva circle
    return new Konva.Ellipse({
      x: center.getX(),
      y: center.getY(),
      radius: radius,
      radiusX: radius.x,
      radiusY: radius.y,
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
  }

  /**
   * Get the default annotation label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  #getDefaultLabelPosition(annotation) {
    const ellipse = annotation.mathShape;
    const center = ellipse.getCenter();
    return new Point2D(
      center.getX() - ellipse.getA(),
      center.getY() + ellipse.getB()
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
    const ellipse = annotation.mathShape;
    const center = ellipse.getCenter();
    const radiusX = ellipse.getA();
    const radiusY = ellipse.getB();

    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // associated shape
    const kellipse = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kellipse instanceof Konva.Ellipse)) {
      return;
    }
    // update shape: just update radius
    kellipse.radius({
      x: radiusX,
      y: radiusY
    });

    // find anchors
    const left = group.getChildren(function (node) {
      return node.id() === 'left';
    })[0];
    const right = group.getChildren(function (node) {
      return node.id() === 'right';
    })[0];
    const bottom = group.getChildren(function (node) {
      return node.id() === 'bottom';
    })[0];
    const top = group.getChildren(function (node) {
      return node.id() === 'top';
    })[0];

    const swapX = right.x() < left.x() ? -1 : 1;
    const swapY = top.y() < bottom.y() ? 1 : -1;

    // update 'self' (undo case) and other anchors
    switch (anchor.id()) {
    case 'left':
      // update self
      left.x(anchor.x());
      // update others
      right.x(center.getX() + swapX * radiusX);
      bottom.y(center.getY() + radiusY);
      top.y(center.getY() - radiusY);
      break;
    case 'right':
      // update self
      right.x(anchor.x());
      // update others
      left.x(center.getX() - swapX * radiusX);
      bottom.y(center.getY() + radiusY);
      top.y(center.getY() - radiusY);
      break;
    case 'bottom':
      // update self
      bottom.y(anchor.y());
      // update others
      left.x(center.getX() - radiusX);
      right.x(center.getX() + radiusX);
      top.y(center.getY() - swapY * radiusY);
      break;
    case 'top':
      // update self
      top.y(anchor.y());
      // update others
      left.x(center.getX() - radiusX);
      right.x(center.getX() + radiusX);
      bottom.y(center.getY() + swapY * radiusY);
      break;
    default :
      logger.error('Unhandled anchor id: ' + anchor.id());
      break;
    }
  }

  /**
   * Get the debug shadow.
   *
   * @param {Annotation} annotation The annotation to shadow.
   * @param {Konva.Group} [group] The associated group.
   * @returns {Konva.Group|undefined} The shadow konva group.
   */
  #getDebugShadow(annotation, group) {
    const ellipse = annotation.mathShape;

    // possible group offset
    let offsetX = 0;
    let offsetY = 0;
    if (typeof group !== 'undefined') {
      offsetX = group.x();
      offsetY = group.y();
    }
    const kshadow = new Konva.Group();
    kshadow.name('shadow');
    const regions = ellipse.getRound();
    for (let i = 0; i < regions.length; ++i) {
      const region = regions[i];
      const minX = region[0][0];
      const minY = region[0][1];
      const maxX = region[1][0];
      const pixelLine = new Konva.Rect({
        x: minX - offsetX,
        y: minY - offsetY,
        width: maxX - minX,
        height: 1,
        fill: 'grey',
        strokeWidth: 0,
        strokeScaleEnabled: false,
        opacity: 0.3,
        name: 'shadow-element'
      });
      kshadow.add(pixelLine);
    }
    return kshadow;
  }

  /**
   * Update the debug shadow.
   *
   * @param {Annotation} annotation The annotation to shadow.
   * @param {Konva.Group} group The associated group.
   */
  #updateDebugShadow(annotation, group) {
    const kshadow = group.getChildren(function (node) {
      return node.name() === 'shadow';
    })[0];
    if (typeof kshadow !== 'undefined') {
      // remove previous
      kshadow.destroy();
      // add new
      group.add(this.#getDebugShadow(annotation, group));
    }
  }

} // class EllipseFactory
