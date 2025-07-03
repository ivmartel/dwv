import {Rectangle} from '../math/rectangle.js';
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
 * Rectangle factory.
 */
export class RectangleFactory {

  /**
   * The name of the factory.
   *
   * @type {string}
   */
  #name = 'rectangle';

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
    return mathShape instanceof Rectangle;
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
   * Create a rectangle shape to be displayed.
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
    group.add(shape);
    // konva label
    const label = this.#labelFactory.create(annotation, style);
    group.add(label);
    // label-shape connector
    const connectorsPos = this.#getConnectorsPositions(shape);
    group.add(this.#labelFactory.getConnector(connectorsPos, label, style));
    // konva shadow (if debug)
    if (DRAW_DEBUG) {
      const shadow = this.#getDebugShadow(annotation);
      group.add(shadow);
      // move to bottom to not bother main shape
      shadow.moveToBottom();
    }
    return group;
  }

  /**
   * Get the connectors positions for the shape.
   *
   * @param {Konva.Rect} shape The associated shape.
   * @returns {Point2D[]} The connectors positions.
   */
  #getConnectorsPositions(shape) {
    const sx = shape.x();
    const sy = shape.y();
    const width = shape.width();
    const height = shape.height();
    return [
      new Point2D(sx + width / 2, sy),
      new Point2D(sx, sy + height / 2),
      new Point2D(sx + width / 2, sy + height),
      new Point2D(sx + width, sy + height / 2),
    ];
  }

  /**
   * Get the anchors positions for the shape.
   *
   * @param {Konva.Rect} shape The associated shape.
   * @returns {Point2D[]} The anchor positions.
   */
  #getAnchorsPositions(shape) {
    const sx = shape.x();
    const sy = shape.y();
    const width = shape.width();
    const height = shape.height();
    return [
      new Point2D(sx, sy),
      new Point2D(sx + width, sy),
      new Point2D(sx + width, sy + height),
      new Point2D(sx, sy + height),
    ];
  }

  /**
   * Get anchors to update a rectangle shape.
   *
   * @param {Konva.Rect} shape The associated shape.
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
    // find anchors
    const topLeft = getAnchorShape(group, 0);
    const bottomRight = getAnchorShape(group, 2);

    const pointTopLeft = new Point2D(
      topLeft.x(),
      topLeft.y()
    );
    const pointBottomRight = new Point2D(
      bottomRight.x(),
      bottomRight.y()
    );
    // new rect
    annotation.mathShape = new Rectangle(pointTopLeft, pointBottomRight);
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
    const rectangle = annotation.mathShape;
    const begin = rectangle.getBegin();
    const newBegin = new Point2D(
      begin.getX() + translation.x,
      begin.getY() + translation.y
    );
    const end = rectangle.getEnd();
    const newEnd = new Point2D(
      end.getX() + translation.x,
      end.getY() + translation.y
    );
    annotation.mathShape = new Rectangle(newBegin, newEnd);
    // quantification
    annotation.updateQuantification();
  }

  /**
   * Update the shape label content.
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
   * @returns {Rectangle} The mathematical shape.
   */
  #calculateMathShape(points) {
    return new Rectangle(points[0], points[1]);
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
   * @returns {Konva.Rect} The konva shape.
   */
  #createShape(annotation, style) {
    const rectangle = annotation.mathShape;
    // konva rect
    return new Konva.Rect({
      x: rectangle.getBegin().getX(),
      y: rectangle.getBegin().getY(),
      width: rectangle.getWidth(),
      height: rectangle.getHeight(),
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
   * @returns {Konva.Rect|undefined} The shape.
   */
  #getShape(group) {
    const kshape = group.getChildren(isNodeNameShape)[0];
    if (!(kshape instanceof Konva.Rect)) {
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
    const rectangle = annotation.mathShape;
    return new Point2D(
      rectangle.getBegin().getX(),
      rectangle.getEnd().getY(),
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
    const rectangle = annotation.mathShape;
    const begin = rectangle.getBegin();

    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // associated shape
    const krect = this.#getShape(group);
    // update shape
    krect.position({
      x: begin.getX(),
      y: begin.getY()
    });
    krect.size({
      width: rectangle.getWidth(),
      height: rectangle.getHeight()
    });

    // find anchors
    const topLeft = getAnchorShape(group, 0);
    const topRight = getAnchorShape(group, 1);
    const bottomRight = getAnchorShape(group, 2);
    const bottomLeft = getAnchorShape(group, 3);

    // update 'self' (undo case) and other anchors
    switch (anchor.id()) {
      case 'anchor0':
        // update self
        topLeft.x(anchor.x());
        topLeft.y(anchor.y());
        // update others
        topRight.y(anchor.y());
        bottomLeft.x(anchor.x());
        break;
      case 'anchor1':
        // update self
        topRight.x(anchor.x());
        topRight.y(anchor.y());
        // update others
        topLeft.y(anchor.y());
        bottomRight.x(anchor.x());
        break;
      case 'anchor2':
        // update self
        bottomRight.x(anchor.x());
        bottomRight.y(anchor.y());
        // update others
        bottomLeft.y(anchor.y());
        topRight.x(anchor.x());
        break;
      case 'anchor3':
        // update self
        bottomLeft.x(anchor.x());
        bottomLeft.y(anchor.y());
        // update others
        bottomRight.y(anchor.y());
        topLeft.x(anchor.x());
        break;
      default :
        logger.error('Unhandled anchor id: ' + anchor.id());
        break;
    }
  }

  /**
   * Get the debug shadow.
   *
   * @param {Annotation} annotation The anootation to shadow.
   * @param {Konva.Group} [_group] The associated group.
   * @returns {Konva.Rect} The shadow konva rect.
   */
  #getDebugShadow(annotation, _group) {
    const rectangle = annotation.mathShape;
    const round = rectangle.getRound();
    const rWidth = round.max.getX() - round.min.getX();
    const rHeight = round.max.getY() - round.min.getY();
    return new Konva.Rect({
      x: round.min.getX(),
      y: round.min.getY(),
      width: rWidth,
      height: rHeight,
      fill: annotation.colour,
      strokeWidth: 0,
      strokeScaleEnabled: false,
      opacity: 0.3,
      name: 'shadow'
    });
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
      const shadow = this.#getDebugShadow(annotation);
      group.add(shadow);
      // move to bottom to not bother main shape
      shadow.moveToBottom();
    }
  }

} // class RectangleFactory
