import {
  Line,
  getPerpendicularLine,
  getPerpendicularLineAtDistance
} from '../math/line.js';
import {Point2D} from '../math/point.js';
import {custom} from '../app/custom.js';
import {logger} from '../utils/logger.js';
import {
  defaultLabelTexts,
  getLineShape,
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
 * Arrow factory.
 */
export class ArrowFactory {

  /**
   * The name of the factory.
   *
   * @type {string}
   */
  #name = 'arrow';

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
    return mathShape instanceof Point2D;
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
    annotation.referencePoints = [points[1]];
    annotation.setTextExpr(this.#getDefaultLabel());
    annotation.updateQuantification();
  }

  /**
   * Create a line shape to be displayed.
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
    // extras
    const extras = this.#createShapeExtras(annotation, style);
    for (const extra of extras) {
      group.add(extra);
    }
    // konva label
    const label = this.#labelFactory.create(annotation, style);
    group.add(label);
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
   * Get the connectors positions for the shape.
   *
   * @param {Konva.Line} shape The associated shape.
   * @returns {Point2D[]} The connectors positions.
   */
  #getConnectorsPositions(shape) {
    const points = shape.points();
    const sx = shape.x();
    const sy = shape.y();
    const centerX = (points[0] + points[2]) / 2 + sx;
    const centerY = (points[1] + points[3]) / 2 + sy;
    return [new Point2D(centerX, centerY)];
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
    return [
      new Point2D(points[0] + sx, points[1] + sy),
      new Point2D(points[2] + sx, points[3] + sy)
    ];
  }

  /**
   * Get anchors to update a line shape.
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
    const kline = this.#getShape(group);
    // find anchors
    const begin = getAnchorShape(group, 0);
    const end = getAnchorShape(group, 1);

    // math shape
    // compensate for possible shape drag
    const pointBegin = new Point2D(
      begin.x() - kline.x(),
      begin.y() - kline.y()
    );
    const pointEnd = new Point2D(
      end.x() - kline.x(),
      end.y() - kline.y()
    );
    annotation.mathShape = pointBegin;
    annotation.referencePoints = [pointEnd];
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
    const point = annotation.mathShape;
    const endPoint = annotation.referencePoints[0];
    const line = new Line(point, endPoint);

    const begin = line.getBegin();
    const newBegin = new Point2D(
      begin.getX() + translation.x,
      begin.getY() + translation.y
    );
    const end = line.getEnd();
    const newEnd = new Point2D(
      end.getX() + translation.x,
      end.getY() + translation.y
    );
    annotation.mathShape = newBegin;
    annotation.referencePoints = [newEnd];
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
   * @returns {Point2D} The mathematical shape.
   */
  #calculateMathShape(points) {
    return points[0];
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
    const point = annotation.mathShape;
    if (typeof annotation.referencePoints === 'undefined' ||
      annotation.referencePoints.length === 0) {
      throw new Error('No reference point for arrow');
    }
    const endPoint = annotation.referencePoints[0];
    const line = new Line(point, endPoint);

    // konva line
    const kshape = new Konva.Line({
      points: [
        point.getX(),
        point.getY(),
        endPoint.getX(),
        endPoint.getY()
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });

    // larger hitfunc
    const tickLen = 20;
    const linePerp0 = getPerpendicularLine(
      line, point, tickLen, style.getZoomScale());
    const linePerp1 = getPerpendicularLine(
      line, endPoint, tickLen, style.getZoomScale());
    kshape.hitFunc(function (context) {
      context.beginPath();
      context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
      context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
      context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
      context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
      context.closePath();
      context.fillStrokeShape(kshape);
    });

    return kshape;
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
   * Creates the konva shape extras.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Style} style The drawing style.
   * @returns {Array} The konva shape extras.
   */
  #createShapeExtras(annotation, style) {
    const point = annotation.mathShape;
    const endPoint = annotation.referencePoints[0];
    const line = new Line(point, endPoint);

    const tickLen = 20;
    // perpendicular line at 2*tickLen
    const perpLine = getPerpendicularLineAtDistance(
      line, 2 * tickLen, tickLen, style.getZoomScale());

    // triangle
    const ktriangle = new Konva.Line({
      points: [
        line.getBegin().getX(),
        line.getBegin().getY(),
        perpLine.getBegin().getX(),
        perpLine.getBegin().getY(),
        perpLine.getEnd().getX(),
        perpLine.getEnd().getY(),
      ],
      fill: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      closed: true,
      name: 'shape-triangle'
    });

    return [ktriangle];
  }

  /**
   * Get the default annotation label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  #getDefaultLabelPosition(annotation) {
    const point = annotation.mathShape;
    return point;
  }

  /**
   * Update shape and label on anchor move taking the updated
   *   annotation as input.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} style The application style.
   */
  #updateShape(annotation, anchor, style) {
    const point = annotation.mathShape;
    const endPoint = annotation.referencePoints[0];
    const line = new Line(point, endPoint);

    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // associated shape
    const kline = this.#getShape(group);

    // reset position after possible shape drag
    kline.position({x: 0, y: 0});
    // update shape
    kline.points([
      point.getX(),
      point.getY(),
      endPoint.getX(),
      endPoint.getY(),
    ]);

    // associated triangle shape
    const ktriangle = group.getChildren(function (node) {
      return node.name() === 'shape-triangle';
    })[0];
    if (!(ktriangle instanceof Konva.Line)) {
      return;
    }
    // find anchors
    const begin = getAnchorShape(group, 0);
    const end = getAnchorShape(group, 1);

    // update 'self' (undo case)
    switch (anchor.id()) {
      case 'anchor0':
        begin.x(anchor.x());
        begin.y(anchor.y());
        break;
      case 'anchor1':
        end.x(anchor.x());
        end.y(anchor.y());
        break;
      default:
        logger.error('Unhandled anchor id: ' + anchor.id());
        break;
    }

    const tickLen = 20;

    // triangle
    const perpLine = getPerpendicularLineAtDistance(
      line, 2 * tickLen, tickLen, style.getZoomScale());
    ktriangle.position({x: 0, y: 0});
    ktriangle.points([
      line.getBegin().getX(),
      line.getBegin().getY(),
      perpLine.getBegin().getX(),
      perpLine.getBegin().getY(),
      perpLine.getEnd().getX(),
      perpLine.getEnd().getY(),
    ]);

    // larger hitfunc
    const linePerp0 = getPerpendicularLine(
      line, point, tickLen, style.getZoomScale());
    const linePerp1 = getPerpendicularLine(
      line, endPoint, tickLen, style.getZoomScale());
    kline.hitFunc(function (context) {
      context.beginPath();
      context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
      context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
      context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
      context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
      context.closePath();
      context.fillStrokeShape(kline);
    });
  }

  /**
   * Get the debug shadow.
   *
   * @param {Annotation} _annotation The annotation to shadow.
   * @param {Konva.Group} [_group] The associated group.
   * @returns {Konva.Group|undefined} The shadow konva group.
   */
  #getDebugShadow(_annotation, _group) {
    return;
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

} // class ArrowFactory
