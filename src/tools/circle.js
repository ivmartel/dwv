import {Circle} from '../math/circle';
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
 * Circle factory.
 */
export class CircleFactory {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return 'circle-group';
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
   * Get anchors to update a circle shape.
   *
   * @param {Konva.Circle} shape The associated shape.
   * @param {Style} style The application style.
   * @returns {Konva.Ellipse[]} A list of anchors.
   */
  getAnchors(shape, style) {
    const centerX = shape.x();
    const centerY = shape.y();
    const radius = shape.radius();

    const anchors = [];
    anchors.push(getDefaultAnchor(
      centerX - radius, centerY, 'left', style
    ));
    anchors.push(getDefaultAnchor(
      centerX + radius, centerY, 'right', style
    ));
    anchors.push(getDefaultAnchor(
      centerX, centerY + radius, 'bottom', style
    ));
    anchors.push(getDefaultAnchor(
      centerX, centerY - radius, 'top', style
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
    // math shape
    const circle = annotation.mathShape;
    const center = new Point2D(
      circle.getCenter().getX(),
      circle.getCenter().getY()
    );
    const anchorPoint = new Point2D(anchor.x(), anchor.y());
    const newRadius = center.getDistance(anchorPoint);
    annotation.mathShape = new Circle(center, newRadius);
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
    const circle = annotation.mathShape;
    const center = circle.getCenter();
    const newCenter = new Point2D(
      center.getX() + translation.x,
      center.getY() + translation.y
    );
    annotation.mathShape = new Circle(newCenter, circle.getRadius());
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
   * Calculates the mathematical shape: a circle.
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
    return defaults.labelText.circle;
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
      fill: annotation.colour,
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
      fill: annotation.colour,
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
    const circle = annotation.mathShape;
    const center = circle.getCenter();
    const radius = circle.getRadius();

    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // associated shape
    const kcircle = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kcircle instanceof Konva.Circle)) {
      return;
    }
    // update shape: just update the radius
    kcircle.radius(radius);

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
      right.x(center.getX() + swapX * radius);
      bottom.y(center.getY() + radius);
      top.y(center.getY() - radius);
      break;
    case 'right':
      // update self
      right.x(anchor.x());
      // update others
      left.x(center.getX() - swapX * radius);
      bottom.y(center.getY() + radius);
      top.y(center.getY() - radius);
      break;
    case 'bottom':
      // update self
      bottom.y(anchor.y());
      // update others
      left.x(center.getX() - radius);
      right.x(center.getX() + radius);
      top.y(center.getY() - swapY * radius);
      break;
    case 'top':
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

} // class CircleFactory
