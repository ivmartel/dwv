import {Line, getAngle} from '../math/line';
import {Protractor} from '../math/protractor';
import {Point2D} from '../math/point';
import {defaults} from '../app/defaults';
import {DRAW_DEBUG, getDefaultAnchor} from './drawBounds';

// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {Style} from '../gui/style';
import {Annotation} from '../image/annotation';
/* eslint-enable no-unused-vars */

/**
 * Protractor factory.
 */
export class ProtractorFactory {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return 'protractor-group';
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
   * Is the input group a group of this factory?
   *
   * @param {Konva.Group} group The group to test.
   * @returns {boolean} True if the group is from this fcatory.
   */
  isFactoryGroup(group) {
    return this.getGroupName() === group.name();
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
    group.id(annotation.id);
    // konva shape
    group.add(this.#createShape(annotation, style));

    if (protractor.getLength() === this.getNPoints()) {
      // extras
      const extras = this.#createShapeExtras(annotation, style);
      for (const extra of extras) {
        group.add(extra);
      }
      // konva label
      group.add(this.#createLabel(annotation, style));
      // konva shadow (if debug)
      if (DRAW_DEBUG) {
        group.add(this.#getDebugShadow(annotation));
      }
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
      points[2] + shape.x(), points[3] + shape.y(), 'mid', style
    ));
    anchors.push(getDefaultAnchor(
      points[4] + shape.x(), points[5] + shape.y(), 'end', style
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
    // TODO check if linked label...
    this.updateLabelPosition(annotation, group, style);
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
    // find special points
    const begin = group.getChildren(function (node) {
      return node.id() === 'begin';
    })[0];
    const mid = group.getChildren(function (node) {
      return node.id() === 'mid';
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
    const pointMid = new Point2D(
      mid.x() - kline.x(),
      mid.y() - kline.y()
    );
    const pointEnd = new Point2D(
      end.x() - kline.x(),
      end.y() - kline.y()
    );
    annotation.mathShape = new Protractor([pointBegin, pointMid, pointEnd]);
    // label position
    // TODO...
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
    // label position
    const labelPos = annotation.labelPosition;
    if (typeof labelPos !== 'undefined') {
      const newPos = new Point2D(
        labelPos.getX() + translation.x,
        labelPos.getY() + translation.y
      );
      annotation.labelPosition = newPos;
    }
    // quantification
    annotation.updateQuantification();
  }

  /**
   * Update the shape label position.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Konva.Group} group The shape group.
   * @param {Style} _style The application style.
   */
  updateLabelPosition(annotation, group, _style) {
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
    if (!(klabel instanceof Konva.Label)) {
      return;
    }
    // update position
    const labelPosition = this.#getLabelPosition(annotation);
    klabel.position({
      x: labelPosition.getX(),
      y: labelPosition.getY()
    });
  }

  /**
   * Update the shape label.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Konva.Group} group The shape group.
   * @param {Style} _style The application style.
   */
  updateLabelContent(annotation, group, _style) {
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
    if (!(klabel instanceof Konva.Label)) {
      return;
    }
    // update text
    const text = annotation.getText();
    const ktext = klabel.getText();
    ktext.setText(text);
    // hide if empty
    klabel.visible(text.length !== 0);
  }

  /**
   * Calculates the mathematical shape: a path.
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
    return defaults.labelText.protractor;
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
    for (let i = 0; i < 3; ++i) {
      points.push(protractor.getPoint(i).getX());
      points.push(protractor.getPoint(i).getY());
    }

    // konva line
    const kshape = new Konva.Line({
      points: points,
      stroke: style.getLineColour(),
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
      stroke: style.getLineColour(),
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
   * Get the annotation label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  #getLabelPosition(annotation) {
    let res = annotation.labelPosition;
    if (typeof res === 'undefined') {
      res = this.#getDefaultLabelPosition(annotation);
    }
    return res;
  }

  /**
   * Creates the konva label.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Label} The Konva label.
   */
  #createLabel(annotation, style) {
    // konva text
    const ktext = new Konva.Text({
      fontSize: style.getFontSize(),
      fontFamily: style.getFontFamily(),
      fill: style.getLineColour(),
      padding: style.getTextPadding(),
      shadowColor: style.getShadowLineColour(),
      shadowOffset: style.getShadowOffset(),
      name: 'text'
    });
    const labelText = annotation.getText();
    ktext.setText(labelText);

    // konva label
    const labelPosition = this.#getLabelPosition(annotation);
    const klabel = new Konva.Label({
      x: labelPosition.getX(),
      y: labelPosition.getY(),
      scale: style.applyZoomScale(1),
      visible: labelText.length !== 0,
      name: 'label'
    });
    klabel.add(ktext);
    klabel.add(new Konva.Tag({
      fill: style.getLineColour(),
      opacity: style.getTagOpacity()
    }));

    return klabel;
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
    const begin = group.getChildren(function (node) {
      return node.id() === 'begin';
    })[0];
    const mid = group.getChildren(function (node) {
      return node.id() === 'mid';
    })[0];
    const end = group.getChildren(function (node) {
      return node.id() === 'end';
    })[0];

    // update special points
    switch (anchor.id()) {
    case 'begin':
      begin.x(anchor.x());
      begin.y(anchor.y());
      break;
    case 'mid':
      mid.x(anchor.x());
      mid.y(anchor.y());
      break;
    case 'end':
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
