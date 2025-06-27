import {Line, getAngle} from '../math/line.js';
import {Protractor} from '../math/protractor.js';
import {Point2D} from '../math/point.js';
import {custom} from '../app/custom.js';
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
 * Protractor factory.
 */
export class ProtractorFactory {

  /**
   * The name of the factory.
   *
   * @type {string}
   */
  #name = 'protractor';

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
    return mathShape instanceof Protractor;
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
    return 3;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  getTimeout() {
    return 500;
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
    const protractor = annotation.mathShape;

    // konva group
    const group = new Konva.Group();
    group.name(this.getGroupName());
    group.visible(true);
    group.id(annotation.trackingUid);
    // konva shape
    const shape = this.#createShape(annotation, style);
    group.add(this.#createShape(annotation, style));

    if (protractor.getLength() === this.getNPoints()) {
      // extras
      const extras = this.#createShapeExtras(annotation, style);
      for (const extra of extras) {
        group.add(extra);
      }
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
    return [
      new Point2D(points[2] + sx, points[3] + sy)
    ];
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
      new Point2D(points[2] + sx, points[3] + sy),
      new Point2D(points[4] + sx, points[5] + sy)
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
    // find special points
    const begin = getAnchorShape(group, 0);
    const mid = getAnchorShape(group, 1);
    const end = getAnchorShape(group, 2);

    // math shape
    // compensate for possible shape drag
    const pointBegin = new Point2D(
      begin.x() - kline.x(),
      begin.y() - kline.y()
    );
    const pointMid = new Point2D(
      mid.x() - kline.x(),
      mid.y() - kline.y()
    );
    const pointEnd = new Point2D(
      end.x() - kline.x(),
      end.y() - kline.y()
    );
    annotation.mathShape = new Protractor([pointBegin, pointMid, pointEnd]);
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
    const protractor = annotation.mathShape;
    const newPointList = [];
    for (let i = 0; i < 3; ++i) {
      newPointList.push(new Point2D(
        protractor.getPoint(i).getX() + translation.x,
        protractor.getPoint(i).getY() + translation.y
      ));
    }
    annotation.mathShape = new Protractor(newPointList);
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
   * @returns {Protractor} The mathematical shape.
   */
  #calculateMathShape(points) {
    return new Protractor(points);
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
    const protractor = annotation.mathShape;
    const points = [];
    for (let i = 0; i < protractor.getLength(); ++i) {
      points.push(protractor.getPoint(i).getX());
      points.push(protractor.getPoint(i).getY());
    }

    // konva line
    const kshape = new Konva.Line({
      points: points,
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });

    if (protractor.getLength() === this.getNPoints()) {
      // larger hitfunc
      kshape.hitFunc(function (context) {
        context.beginPath();
        context.moveTo(
          protractor.getPoint(0).getX(), protractor.getPoint(0).getY());
        context.lineTo(
          protractor.getPoint(1).getX(), protractor.getPoint(1).getY());
        context.lineTo(
          protractor.getPoint(2).getX(), protractor.getPoint(2).getY());
        context.closePath();
        context.fillStrokeShape(kshape);
      });
    }

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
    const protractor = annotation.mathShape;
    const line0 = new Line(
      protractor.getPoint(0), protractor.getPoint(1));
    const line1 = new Line(
      protractor.getPoint(1), protractor.getPoint(2));

    let angle = getAngle(line0, line1);
    let inclination = line0.getInclination();
    if (angle > 180) {
      angle = 360 - angle;
      inclination += angle;
    }

    const radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
    const karc = new Konva.Arc({
      innerRadius: radius,
      outerRadius: radius,
      stroke: annotation.colour,
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      angle: angle,
      rotation: -inclination,
      x: protractor.getPoint(1).getX(),
      y: protractor.getPoint(1).getY(),
      name: 'shape-arc'
    });

    return [karc];
  }

  /**
   * Get the default annotation label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  #getDefaultLabelPosition(annotation) {
    const protractor = annotation.mathShape;
    const line0 = new Line(
      protractor.getPoint(0), protractor.getPoint(1));
    const line1 = new Line(
      protractor.getPoint(1), protractor.getPoint(2));

    const midX =
      (line0.getMidpoint().getX() + line1.getMidpoint().getX()) / 2;
    const midY =
      (line0.getMidpoint().getY() + line1.getMidpoint().getY()) / 2;

    return new Point2D(
      midX,
      midY
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
    const protractor = annotation.mathShape;
    const line0 = new Line(
      protractor.getPoint(0), protractor.getPoint(1));
    const line1 = new Line(
      protractor.getPoint(1), protractor.getPoint(2));

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
      protractor.getPoint(0).getX(),
      protractor.getPoint(0).getY(),
      protractor.getPoint(1).getX(),
      protractor.getPoint(1).getY(),
      protractor.getPoint(2).getX(),
      protractor.getPoint(2).getY()
    ]);

    // associated arc
    const karc = group.getChildren(function (node) {
      return node.name() === 'shape-arc';
    })[0];
    if (!(karc instanceof Konva.Arc)) {
      return;
    }

    // find special points
    const begin = getAnchorShape(group, 0);
    const mid = getAnchorShape(group, 1);
    const end = getAnchorShape(group, 2);

    // update special points
    switch (anchor.id()) {
      case 'anchor0':
        begin.x(anchor.x());
        begin.y(anchor.y());
        break;
      case 'anchor1':
        mid.x(anchor.x());
        mid.y(anchor.y());
        break;
      case 'anchor2':
        end.x(anchor.x());
        end.y(anchor.y());
        break;
    }

    // angle
    let angle = getAngle(line0, line1);
    let inclination = line0.getInclination();
    if (angle > 180) {
      angle = 360 - angle;
      inclination += angle;
    }

    // arc
    const radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
    karc.innerRadius(radius);
    karc.outerRadius(radius);
    karc.angle(angle);
    karc.rotation(-inclination);
    const arcPos = {x: mid.x(), y: mid.y()};
    karc.position(arcPos);

    // larger hitfunc
    kline.hitFunc(function (context) {
      context.beginPath();
      context.moveTo(
        protractor.getPoint(0).getX(), protractor.getPoint(0).getY());
      context.lineTo(
        protractor.getPoint(1).getX(), protractor.getPoint(1).getY());
      context.lineTo(
        protractor.getPoint(2).getX(), protractor.getPoint(2).getY());
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

} // class ProtractorFactory
