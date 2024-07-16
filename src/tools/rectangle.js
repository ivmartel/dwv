import {Rectangle} from '../math/rectangle';
import {Point2D} from '../math/point';
import {logger} from '../utils/logger';
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
 * Rectangle factory.
 */
export class RectangleFactory {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return 'rectangle-group';
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
    group.id(annotation.id);
    // konva shape
    group.add(this.#createShape(annotation, style));
    // konva label
    group.add(this.#createLabel(annotation, style));
    // konva shadow (if debug)
    if (DRAW_DEBUG) {
      group.add(this.#getDebugShadow(annotation));
    }
    return group;
  }

  /**
   * Get anchors to update a rectangle shape.
   *
   * @param {Konva.Rect} shape The associated shape.
   * @param {Style} style The application style.
   * @returns {Konva.Ellipse[]} A list of anchors.
   */
  getAnchors(shape, style) {
    const rectX = shape.x();
    const rectY = shape.y();
    const rectWidth = shape.width();
    const rectHeight = shape.height();

    const anchors = [];
    anchors.push(getDefaultAnchor(
      rectX, rectY, 'topLeft', style
    ));
    anchors.push(getDefaultAnchor(
      rectX + rectWidth, rectY, 'topRight', style
    ));
    anchors.push(getDefaultAnchor(
      rectX + rectWidth, rectY + rectHeight, 'bottomRight', style
    ));
    anchors.push(getDefaultAnchor(
      rectX, rectY + rectHeight, 'bottomLeft', style
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
    // find anchors
    const topLeft = group.getChildren(function (node) {
      return node.id() === 'topLeft';
    })[0];
    const bottomRight = group.getChildren(function (node) {
      return node.id() === 'bottomRight';
    })[0];

    const p2d0 = new Point2D(
      group.x() + topLeft.x(),
      group.y() + topLeft.y()
    );
    const p2d1 = new Point2D(
      group.x() + bottomRight.x(),
      group.y() + bottomRight.y()
    );
    // new rect
    annotation.mathShape = new Rectangle(p2d0, p2d1);
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
   * Calculates the mathematical rectangle: a rectangle.
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
    return defaults.labelText.rectangle;
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
      stroke: style.getLineColour(),
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
    const rectangle = annotation.mathShape;
    return new Point2D(
      rectangle.getBegin().getX(),
      rectangle.getEnd().getY(),
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
    const krect = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(krect instanceof Konva.Rect)) {
      return;
    }
    // update shape: just update the radius
    krect.position({
      x: begin.getX(),
      y: begin.getY()
    });
    krect.size({
      width: rectangle.getWidth(),
      height: rectangle.getHeight()
    });

    // find anchors
    const topLeft = group.getChildren(function (node) {
      return node.id() === 'topLeft';
    })[0];
    const topRight = group.getChildren(function (node) {
      return node.id() === 'topRight';
    })[0];
    const bottomRight = group.getChildren(function (node) {
      return node.id() === 'bottomRight';
    })[0];
    const bottomLeft = group.getChildren(function (node) {
      return node.id() === 'bottomLeft';
    })[0];

    // update 'self' (undo case) and other anchors
    switch (anchor.id()) {
    case 'topLeft':
      // update self
      topLeft.x(anchor.x());
      topLeft.y(anchor.y());
      // update others
      topRight.y(anchor.y());
      bottomLeft.x(anchor.x());
      break;
    case 'topRight':
      // update self
      topRight.x(anchor.x());
      topRight.y(anchor.y());
      // update others
      topLeft.y(anchor.y());
      bottomRight.x(anchor.x());
      break;
    case 'bottomRight':
      // update self
      bottomRight.x(anchor.x());
      bottomRight.y(anchor.y());
      // update others
      bottomLeft.y(anchor.y());
      topRight.x(anchor.x());
      break;
    case 'bottomLeft':
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
      fill: 'grey',
      strokeWidth: 0,
      strokeScaleEnabled: false,
      opacity: 0.3,
      name: 'shadow'
    });
  }

  #updateDebugShadow(group, annotation) {
    const kshadow = group.getChildren(function (node) {
      return node.name() === 'shadow';
    })[0];
    if (typeof kshadow !== 'undefined') {
      // remove previous
      kshadow.destroy();
      // add new
      group.add(this.#getDebugShadow(
        annotation.mathShape, group));
    }
  }

} // class RectangleFactory
