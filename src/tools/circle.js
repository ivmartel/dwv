import {Circle} from '../math/circle.js';
import {Point2D} from '../math/point.js';
import {logger} from '../utils/logger.js';
import {custom} from '../app/custom.js';
import {
  defaultLabelTexts,
  isNodeNameShape,
  DRAW_DEBUG,
  getDefaultAnchor,
  getAnchorShape
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
 * Circle factory.
 */
export class CircleFactory {

  /**
   * The name of the factory.
   *
   * @type {string}
   */
  #name = 'circle';

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
    return mathShape instanceof Circle;
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
   * Create a circle shape to be displayed.
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
      const shadow = this.#getDebugShadow(annotation, group);
      group.add(shadow);
      // move to bottom to not bother main shape
      shadow.moveToBottom();
    }
    return group;
  }

  /**
   * Get the connectors positions for the shape.
   *
   * @param {Konva.Circle} shape The associated shape.
   * @returns {Point2D[]} The connectors positions.
   */
  #getConnectorsPositions(shape) {
    const centerX = shape.x();
    const centerY = shape.y();
    const radius = shape.radius() * Math.sqrt(2) / 2;
    return [
      new Point2D(centerX - radius, centerY - radius),
      new Point2D(centerX + radius, centerY - radius),
      new Point2D(centerX - radius, centerY + radius),
      new Point2D(centerX + radius, centerY + radius),
    ];
  }

  /**
   * Get the anchors positions for the shape.
   *
   * @param {Konva.Circle} shape The associated shape.
   * @returns {Point2D[]} The anchor positions.
   */
  #getAnchorsPositions(shape) {
    const centerX = shape.x();
    const centerY = shape.y();
    const radius = shape.radius();
    return [
      new Point2D(centerX - radius, centerY),
      new Point2D(centerX + radius, centerY),
      new Point2D(centerX, centerY + radius),
      new Point2D(centerX, centerY - radius),
    ];
  }

  /**
   * Get anchors to update a circle shape.
   *
   * @param {Konva.Circle} shape The associated shape.
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
   * @param {Konva.Ellipse} anchor The active anchor.
   */
  constrainAnchorMove(anchor) {
    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }

    // find special points
    const left = getAnchorShape(group, 0);
    const right = getAnchorShape(group, 1);
    const bottom = getAnchorShape(group, 2);
    const top = getAnchorShape(group, 3);

    // update 'self' (undo case) and special points
    switch (anchor.id()) {
      case 'anchor0':
        // block y
        left.y(right.y());
        break;
      case 'anchor1':
        // block y
        right.y(left.y());
        break;
      case 'anchor2':
        // block x
        bottom.x(top.x());
        break;
      case 'anchor3':
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
    // math shape
    const circle = annotation.mathShape;
    const center = new Point2D(
      circle.getCenter().getX(),
      circle.getCenter().getY()
    );
    const anchorPoint = new Point2D(anchor.x(), anchor.y());
    const newRadius = center.getDistance(anchorPoint);
    annotation.mathShape = new Circle(center, newRadius);
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
    const circle = annotation.mathShape;
    const center = circle.getCenter();
    const newCenter = new Point2D(
      center.getX() + translation.x,
      center.getY() + translation.y
    );
    annotation.mathShape = new Circle(newCenter, circle.getRadius());
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
   * @returns {Circle} The mathematical shape.
   */
  #calculateMathShape(points) {
    // calculate radius
    const a = Math.abs(points[0].getX() - points[1].getX());
    const b = Math.abs(points[0].getY() - points[1].getY());
    const radius = Math.round(Math.sqrt(a * a + b * b));
    // physical shape
    return new Circle(points[0], radius);
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
   * @returns {Konva.Circle} The konva shape.
   */
  #createShape(annotation, style) {
    const circle = annotation.mathShape;
    // konva circle
    return new Konva.Circle({
      x: circle.getCenter().getX(),
      y: circle.getCenter().getY(),
      radius: circle.getRadius(),
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
  }

  /**
   * Get the associated shape from a group.
   *
   * @param {Konva.Group} group The group to look into.
   * @returns {Konva.Circle|undefined} The shape.
   */
  #getShape(group) {
    const kshape = group.getChildren(isNodeNameShape)[0];
    if (!(kshape instanceof Konva.Circle)) {
      return;
    }
    return kshape;
  }

  /**
   * Get the default annotation label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  #getDefaultLabelPosition(annotation) {
    const circle = annotation.mathShape;
    const center = circle.getCenter();
    const radius = circle.getRadius();
    return new Point2D(
      center.getX() - radius,
      center.getY() + radius,
    );
  }

  /**
   * Update shape and label on anchor move taking the updated
   *   annotation as input.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} _style The application style.
   */
  #updateShape(annotation, anchor, _style) {
    const circle = annotation.mathShape;
    const center = circle.getCenter();
    const radius = circle.getRadius();

    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // associated shape
    const kcircle = this.#getShape(group);
    // update shape: just update the radius
    kcircle.radius(radius);

    // find anchors
    const left = getAnchorShape(group, 0);
    const right = getAnchorShape(group, 1);
    const bottom = getAnchorShape(group, 2);
    const top = getAnchorShape(group, 3);

    const swapX = right.x() < left.x() ? -1 : 1;
    const swapY = top.y() < bottom.y() ? 1 : -1;

    // update 'self' (undo case) and other anchors
    switch (anchor.id()) {
      case 'anchor0':
        // update self
        left.x(anchor.x());
        // update others
        right.x(center.getX() + swapX * radius);
        bottom.y(center.getY() + radius);
        top.y(center.getY() - radius);
        break;
      case 'anchor1':
        // update self
        right.x(anchor.x());
        // update others
        left.x(center.getX() - swapX * radius);
        bottom.y(center.getY() + radius);
        top.y(center.getY() - radius);
        break;
      case 'anchor2':
        // update self
        bottom.y(anchor.y());
        // update others
        left.x(center.getX() - radius);
        right.x(center.getX() + radius);
        top.y(center.getY() - swapY * radius);
        break;
      case 'anchor3':
        // update self
        top.y(anchor.y());
        // update others
        left.x(center.getX() - radius);
        right.x(center.getX() + radius);
        bottom.y(center.getY() + swapY * radius);
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
    const circle = annotation.mathShape;

    // possible group offset
    let offsetX = 0;
    let offsetY = 0;
    if (typeof group !== 'undefined') {
      offsetX = group.x();
      offsetY = group.y();
    }
    const kshadow = new Konva.Group();
    kshadow.name('shadow');
    const regions = circle.getRound();
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
        fill: annotation.colour,
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
      const shadow = this.#getDebugShadow(annotation, group);
      group.add(shadow);
      // move to bottom to not bother main shape
      shadow.moveToBottom();
    }
  }

} // class CircleFactory
