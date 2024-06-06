import {Circle} from '../math/circle';
import {Point2D} from '../math/point';
import {getFlags, replaceFlags} from '../utils/string';
import {logger} from '../utils/logger';
import {defaults} from '../app/defaults';
import {getDefaultAnchor} from './editor';
import {DRAW_DEBUG} from './draw';
// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {ViewController} from '../app/viewController';
import {Style} from '../gui/style';
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
   * Calculates the mathematical circle.
   *
   * @param {Point2D[]} points The points that define the circle.
   * @returns {Circle} The mathematical circle.
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
   * Creates the konva circle shape.
   *
   * @param {Circle} circle The mathematical circle.
   * @param {Style} style The drawing style.
   * @returns {Konva.Circle} The konva circle shape.
   */
  #createShape(circle, style) {
    return new Konva.Circle({
      x: circle.getCenter().getX(),
      y: circle.getCenter().getY(),
      radius: circle.getRadius(),
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
  }

  /**
   * Creates the konva label.
   *
   * @param {Circle} circle The mathematical circle.
   * @param {Style} style The drawing style.
   * @param {ViewController} viewController The associated view controller.
   * @returns {Konva.Label} The Konva label.
   */
  #createLabel(circle, style, viewController) {
    // quantification
    const ktext = new Konva.Text({
      fontSize: style.getFontSize(),
      fontFamily: style.getFontFamily(),
      fill: style.getLineColour(),
      padding: style.getTextPadding(),
      shadowColor: style.getShadowLineColour(),
      shadowOffset: style.getShadowOffset(),
      name: 'text'
    });
    let textExpr = '';
    const modality = viewController.getModality();
    if (typeof defaults.labelText.circle[modality] !== 'undefined') {
      textExpr = defaults.labelText.circle[modality];
    } else {
      textExpr = defaults.labelText.circle['*'];
    }
    const quant = circle.quantify(
      viewController,
      getFlags(textExpr));
    ktext.setText(replaceFlags(textExpr, quant));
    // augment text with meta data
    // @ts-expect-error
    ktext.meta = {
      textExpr: textExpr,
      quantification: quant
    };
    // label
    const klabel = new Konva.Label({
      x: circle.getCenter().getX() - circle.getRadius(),
      y: circle.getCenter().getY() + circle.getRadius(),
      scale: style.applyZoomScale(1),
      visible: textExpr.length !== 0,
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
   * Create a circle shape to be displayed.
   *
   * @param {Point2D[]} points The points from which to extract the circle.
   * @param {Style} style The drawing style.
   * @param {ViewController} viewController The associated view controller.
   * @returns {Konva.Group} The Konva group.
   */
  create(points, style, viewController) {
    // Create group
    const group = new Konva.Group();
    group.name(this.getGroupName());
    group.visible(true);

    // Create and add shape
    const mathShape = this.#calculateMathShape(points);
    const kShape = this.#createShape(mathShape, style);
    group.add(kShape);
    // Create and add label
    const kLabel = this.#createLabel(mathShape, style, viewController);
    group.add(kLabel);
    // Add shadow (if debug)
    let kshadow;
    if (DRAW_DEBUG) {
      kshadow = this.#getShadowCircle(mathShape);
      group.add(kshadow);
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
   * Update a circle shape.
   *
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} _style The app style.
   * @param {ViewController} viewController The associated view controller.
   */
  update(anchor, _style, viewController) {
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
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
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
    // debug shadow
    let kshadow;
    if (DRAW_DEBUG) {
      kshadow = group.getChildren(function (node) {
        return node.name() === 'shadow';
      })[0];
    }

    // circle center
    const center = {
      x: kcircle.x(),
      y: kcircle.y()
    };

    let radius;

    // update 'self' (undo case) and special points
    switch (anchor.id()) {
    case 'left':
      radius = center.x - anchor.x();
      // update self (while blocking y)
      left.x(anchor.x());
      left.y(right.y());
      // update others
      right.x(center.x + radius);
      bottom.y(center.y + radius);
      top.y(center.y - radius);
      break;
    case 'right':
      radius = anchor.x() - center.x;
      // update self (while blocking y)
      right.x(anchor.x());
      right.y(left.y());
      // update others
      left.x(center.x - radius);
      bottom.y(center.y + radius);
      top.y(center.y - radius);
      break;
    case 'bottom':
      radius = anchor.y() - center.y;
      // update self (while blocking x)
      bottom.x(top.x());
      bottom.y(anchor.y());
      // update others
      left.x(center.x - radius);
      right.x(center.x + radius);
      top.y(center.y - radius);
      break;
    case 'top':
      radius = center.y - anchor.y();
      // update self (while blocking x)
      top.x(bottom.x());
      top.y(anchor.y());
      // update others
      left.x(center.x - radius);
      right.x(center.x + radius);
      bottom.y(center.y + radius);
      break;
    default :
      logger.error('Unhandled anchor id: ' + anchor.id());
      break;
    }

    // update shape: just update the radius
    kcircle.radius(Math.abs(radius));
    // new circle
    const centerPoint = new Point2D(
      group.x() + center.x,
      group.y() + center.y
    );
    const circle = new Circle(centerPoint, radius);

    // debug shadow
    if (kshadow) {
      // remove previous
      kshadow.destroy();
      // add new
      group.add(this.#getShadowCircle(circle, group));
    }

    // update label position
    const textPos = {
      x: center.x - Math.abs(radius),
      y: center.y + Math.abs(radius)
    };
    klabel.position(textPos);

    // update quantification
    this.#updateCircleQuantification(group, viewController);
  }

  /**
   * Update the quantification of a Circle.
   *
   * @param {Konva.Group} group The group with the shape.
   * @param {ViewController} viewController The associated view controller.
   */
  updateQuantification(group, viewController) {
    this.#updateCircleQuantification(group, viewController);
  }

  /**
   * Update the quantification of a Circle (as a static
   *   function to be used in update).
   *
   * @param {Konva.Group} group The group with the shape.
   * @param {ViewController} viewController The associated view controller.
   */
  #updateCircleQuantification(
    group, viewController) {
    // associated shape
    const kcircle = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kcircle instanceof Konva.Circle)) {
      return;
    }
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
    if (!(klabel instanceof Konva.Label)) {
      return;
    }

    // positions: add possible group offset
    const centerPoint = new Point2D(
      group.x() + kcircle.x(),
      group.y() + kcircle.y()
    );
    // circle
    const circle = new Circle(centerPoint, kcircle.radius());

    // update text
    const ktext = klabel.getText();
    // @ts-expect-error
    const meta = ktext.meta;
    const quantification = circle.quantify(
      viewController,
      getFlags(meta.textExpr));
    ktext.setText(replaceFlags(meta.textExpr, quantification));
    // update meta
    meta.quantification = quantification;
  }

  /**
   * Get the debug shadow.
   *
   * @param {Circle} circle The circle to shadow.
   * @param {Konva.Group} [group] The associated group.
   * @returns {Konva.Group} The shadow konva group.
   */
  #getShadowCircle(circle, group) {
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

} // class CircleFactory
