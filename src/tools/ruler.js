import {Line, getPerpendicularLine} from '../math/line';
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
 * Ruler factory.
 */
export class RulerFactory {

  /**
   * The name of the factory.
   *
   * @type {string}
   */
  #name = 'ruler';

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
    return mathShape instanceof Line;
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
    group.id(annotation.id);
    // konva shape
    group.add(this.#createShape(annotation, style));
    // extras
    const extras = this.#createShapeExtras(annotation, style);
    for (const extra of extras) {
      group.add(extra);
    }
    // konva label
    group.add(this.#labelFactory.create(annotation, style));
    // konva shadow (if debug)
    if (DRAW_DEBUG) {
      group.add(this.#getDebugShadow(annotation));
    }
    return group;
  }

  /**
   * Get anchors to update a line shape.
   *
   * @param {Konva.Line} shape The associated shape.
   * @param {Style} style The application style.
   * @returns {Konva.Ellipse[]} A list of anchors.
   */
  getAnchors(shape, style) {
    const points = shape.points();

    // compensate for possible shape drag
    const anchors = [];
    anchors.push(getDefaultAnchor(
      points[0] + shape.x(), points[1] + shape.y(), 'begin', style
    ));
    anchors.push(getDefaultAnchor(
      points[2] + shape.x(), points[3] + shape.y(), 'end', style
    ));
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
    const kline = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kline instanceof Konva.Line)) {
      return;
    }
    // find anchors
    const begin = group.getChildren(function (node) {
      return node.id() === 'begin';
    })[0];
    const end = group.getChildren(function (node) {
      return node.id() === 'end';
    })[0];

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
    annotation.mathShape = new Line(pointBegin, pointEnd);
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
    const line = annotation.mathShape;
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
    annotation.mathShape = new Line(newBegin, newEnd);
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
   * @returns {Line} The mathematical shape.
   */
  #calculateMathShape(points) {
    return new Line(points[0], points[1]);
  }

  /**
   * Get the default labels.
   *
   * @returns {object} The label list.
   */
  #getDefaultLabel() {
    return defaults.labelText.ruler;
  }

  /**
   * Creates the konva shape.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Line} The konva shape.
   */
  #createShape(annotation, style) {
    const line = annotation.mathShape;

    // konva line
    const kshape = new Konva.Line({
      points: [
        line.getBegin().getX(),
        line.getBegin().getY(),
        line.getEnd().getX(),
        line.getEnd().getY()
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });

    // larger hitfunc
    const tickLen = style.applyZoomRatio(20);
    const linePerp0 = getPerpendicularLine(
      line, line.getBegin(), tickLen, style.getZoomScale());
    const linePerp1 = getPerpendicularLine(
      line, line.getEnd(), tickLen, style.getZoomScale());
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
   * Creates the konva shape extras.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Style} style The drawing style.
   * @returns {Array} The konva shape extras.
   */
  #createShapeExtras(annotation, style) {
    const line = annotation.mathShape;

    const tickLen = style.applyZoomRatio(20);

    // tick begin
    const linePerp0 = getPerpendicularLine(
      line, line.getBegin(), tickLen, style.getZoomScale());
    const ktick0 = new Konva.Line({
      points: [
        linePerp0.getBegin().getX(),
        linePerp0.getBegin().getY(),
        linePerp0.getEnd().getX(),
        linePerp0.getEnd().getY()
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape-tick0'
    });

    // tick end
    const linePerp1 = getPerpendicularLine(
      line, line.getEnd(), tickLen, style.getZoomScale());
    const ktick1 = new Konva.Line({
      points: [
        linePerp1.getBegin().getX(),
        linePerp1.getBegin().getY(),
        linePerp1.getEnd().getX(),
        linePerp1.getEnd().getY()
      ],
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape-tick1'
    });

    return [ktick0, ktick1];
  }

  /**
   * Get the default annotation label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  #getDefaultLabelPosition(annotation) {
    const line = annotation.mathShape;
    const begin = line.getBegin();
    const end = line.getEnd();
    // lowest point
    let res = begin;
    if (begin.getY() < end.getY()) {
      res = end;
    }
    return res;
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
    const line = annotation.mathShape;

    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // associated shape
    const kline = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kline instanceof Konva.Line)) {
      return;
    }

    // reset position after possible shape drag
    kline.position({x: 0, y: 0});
    // update shape
    kline.points([
      line.getBegin().getX(),
      line.getBegin().getY(),
      line.getEnd().getX(),
      line.getEnd().getY(),
    ]);

    // associated tick0
    const ktick0 = group.getChildren(function (node) {
      return node.name() === 'shape-tick0';
    })[0];
    if (!(ktick0 instanceof Konva.Line)) {
      return;
    }
    // associated tick1
    const ktick1 = group.getChildren(function (node) {
      return node.name() === 'shape-tick1';
    })[0];
    if (!(ktick1 instanceof Konva.Line)) {
      return;
    }
    // find anchors
    const begin = group.getChildren(function (node) {
      return node.id() === 'begin';
    })[0];
    const end = group.getChildren(function (node) {
      return node.id() === 'end';
    })[0];

    // update 'self' (undo case)
    switch (anchor.id()) {
    case 'begin':
      begin.x(anchor.x());
      begin.y(anchor.y());
      break;
    case 'end':
      end.x(anchor.x());
      end.y(anchor.y());
      break;
    default:
      logger.error('Unhandled anchor id: ' + anchor.id());
      break;
    }

    // tick
    const tickLen = style.applyZoomRatio(20);
    const linePerp0 = getPerpendicularLine(
      line, line.getBegin(), tickLen, style.getZoomScale());
    ktick0.position({x: 0, y: 0});
    ktick0.points([linePerp0.getBegin().getX(),
      linePerp0.getBegin().getY(),
      linePerp0.getEnd().getX(),
      linePerp0.getEnd().getY()]);
    const linePerp1 = getPerpendicularLine(
      line, line.getEnd(), tickLen, style.getZoomScale());
    ktick1.position({x: 0, y: 0});
    ktick1.points([linePerp1.getBegin().getX(),
      linePerp1.getBegin().getY(),
      linePerp1.getEnd().getX(),
      linePerp1.getEnd().getY()]);

    // larger hitfunc
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

} // class RulerFactory
