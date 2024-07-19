import {ROI} from '../math/roi';
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
 * ROI factory.
 */
export class RoiFactory {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return 'roi-group';
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number|undefined} The number of points.
   */
  getNPoints() {
    // undefined to end with double click
    return undefined;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  getTimeout() {
    return 100;
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
   * Create a roi shape to be displayed.
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
   * Get anchors to update a roi shape.
   *
   * @param {Konva.Line} shape The associated shape.
   * @param {Style} style The application style.
   * @returns {Konva.Ellipse[]} A list of anchors.
   */
  getAnchors(shape, style) {
    const points = shape.points();

    const anchors = [];
    let index = 0;
    for (let i = 0; i < points.length; i = i + 2) {
      const px = points[i] + shape.x();
      const py = points[i + 1] + shape.y();
      anchors.push(getDefaultAnchor(
        px, py, index.toString(), style
      ));
      ++index;
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
    const kroi = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kroi instanceof Konva.Line)) {
      return;
    }

    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the main list)
    const roi = annotation.mathShape;
    const points = roi.getPoints().slice();
    const newPoint = new Point2D(
      anchor.x() - kroi.x(),
      anchor.y() - kroi.y()
    );
    const index = parseInt(anchor.id(), 10);
    points[index] = newPoint;

    // new math shape
    annotation.mathShape = new ROI(points);
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
    const roi = annotation.mathShape;
    const newPoints = [];
    for (let i = 0; i < roi.getLength(); ++i) {
      newPoints.push(new Point2D(
        roi.getPoint(i).getX() + translation.x,
        roi.getPoint(i).getY() + translation.y
      ));
    }
    annotation.mathShape = new ROI(newPoints);
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
   * Calculates the mathematical shape: a roi.
   *
   * @param {Point2D[]} points The points that define the shape.
   * @returns {ROI} The mathematical shape.
   */
  #calculateMathShape(points) {
    return new ROI(points);
  }

  /**
   * Get the default labels.
   *
   * @returns {object} The label list.
   */
  #getDefaultLabel() {
    return defaults.labelText.roi;
  }

  /**
   * Creates the konva shape.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Line} The konva shape.
   */
  #createShape(annotation, style) {
    const roi = annotation.mathShape;
    // konva line
    const arr = [];
    for (let i = 0; i < roi.getLength(); ++i) {
      arr.push(roi.getPoint(i).getX());
      arr.push(roi.getPoint(i).getY());
    }
    return new Konva.Line({
      points: arr,
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape',
      closed: true
    });
  }

  /**
   * Get the default annotation label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  #getDefaultLabelPosition(annotation) {
    const roi = annotation.mathShape;
    return new Point2D(
      roi.getPoint(0).getX(),
      roi.getPoint(0).getY()
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

    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // associated shape
    const kroi = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kroi instanceof Konva.Line)) {
      return;
    }
    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the main list)
    const points = kroi.points();
    const index = parseInt(anchor.id(), 10) * 2;
    points[index] = anchor.x() - kroi.x();
    points[index + 1] = anchor.y() - kroi.y();
    kroi.points(points);

    // update self
    const point = group.getChildren(function (node) {
      return node.id() === anchor.id();
    })[0];

    point.x(anchor.x());
    point.y(anchor.y());
  }

  /**
   * Get the debug shadow.
   *
   * @param {Annotation} _annotation The anootation to shadow.
   * @param {Konva.Group} [_group] The associated group.
   * @returns {Konva.Line} The shadow konva line.
   */
  #getDebugShadow(_annotation, _group) {
    // does nothing
    return undefined;
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

} // class RoiFactory
