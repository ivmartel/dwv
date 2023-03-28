import {Circle} from '../math/circle';
import {Point2D} from '../math/point';
import {getFlags, replaceFlags} from '../utils/string';
import {logger} from '../utils/logger';
import {getDefaultAnchor} from './editor';
import {DRAW_DEBUG} from './draw';
// external
import Konva from 'konva';

/**
 * Default draw label text.
 */
const defaultCircleLabelText = '{surface}';

/**
 * Circle factory.
 *
 * @class
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
   * @param {object} group The group to test.
   * @returns {boolean} True if the group is from this fcatory.
   */
  isFactoryGroup(group) {
    return this.getGroupName() === group.name();
  }

  /**
   * Create a circle shape to be displayed.
   *
   * @param {Array} points The points from which to extract the circle.
   * @param {object} style The drawing style.
   * @param {object} viewController The associated view controller.
   * @returns {object} The Konva group.
   */
  create(
    points, style, viewController) {
    // calculate radius
    var a = Math.abs(points[0].getX() - points[1].getX());
    var b = Math.abs(points[0].getY() - points[1].getY());
    var radius = Math.round(Math.sqrt(a * a + b * b));
    // physical shape
    var circle = new Circle(points[0], radius);
    // draw shape
    var kshape = new Konva.Circle({
      x: circle.getCenter().getX(),
      y: circle.getCenter().getY(),
      radius: circle.getRadius(),
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
    // quantification
    var ktext = new Konva.Text({
      fontSize: style.getFontSize(),
      fontFamily: style.getFontFamily(),
      fill: style.getLineColour(),
      padding: style.getTextPadding(),
      shadowColor: style.getShadowLineColour(),
      shadowOffset: style.getShadowOffset(),
      name: 'text'
    });
    var textExpr = '';
    // TODO: allow override?
    // if (typeof circleLabelText !== 'undefined') {
    //   textExpr = circleLabelText;
    // } else {
    textExpr = defaultCircleLabelText;
    // }
    var quant = circle.quantify(
      viewController,
      getFlags(textExpr));
    ktext.setText(replaceFlags(textExpr, quant));
    // meta data
    ktext.meta = {
      textExpr: textExpr,
      quantification: quant
    };
    // label
    var klabel = new Konva.Label({
      x: circle.getCenter().getX(),
      y: circle.getCenter().getY(),
      scale: style.applyZoomScale(1),
      visible: textExpr.length !== 0,
      name: 'label'
    });
    klabel.add(ktext);
    klabel.add(new Konva.Tag({
      fill: style.getLineColour(),
      opacity: style.getTagOpacity()
    }));

    // debug shadow
    var kshadow;
    if (DRAW_DEBUG) {
      kshadow = this.#getShadowCircle(circle);
    }

    // return group
    var group = new Konva.Group();
    group.name(this.getGroupName());
    if (kshadow) {
      group.add(kshadow);
    }
    group.add(klabel);
    group.add(kshape);
    group.visible(true); // dont inherit
    return group;
  }

  /**
   * Get anchors to update a circle shape.
   *
   * @param {object} shape The associated shape.
   * @param {object} style The application style.
   * @returns {Array} A list of anchors.
   */
  getAnchors(shape, style) {
    var centerX = shape.x();
    var centerY = shape.y();
    var radius = shape.radius();

    var anchors = [];
    anchors.push(getDefaultAnchor(
      centerX - radius, centerY, 'left', style
    ));
    anchors.push(getDefaultAnchor(
      centerX + radius, centerY, 'right', style
    ));
    anchors.push(getDefaultAnchor(
      centerX, centerY - radius, 'bottom', style
    ));
    anchors.push(getDefaultAnchor(
      centerX, centerY + radius, 'top', style
    ));
    return anchors;
  }

  /**
   * Update a circle shape.
   *
   * @param {object} anchor The active anchor.
   * @param {object} _style The app style.
   * @param {object} viewController The associated view controller.
   */
  update(anchor, _style, viewController) {
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kcircle = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    // associated label
    var klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
    // find special points
    var left = group.getChildren(function (node) {
      return node.id() === 'left';
    })[0];
    var right = group.getChildren(function (node) {
      return node.id() === 'right';
    })[0];
    var bottom = group.getChildren(function (node) {
      return node.id() === 'bottom';
    })[0];
    var top = group.getChildren(function (node) {
      return node.id() === 'top';
    })[0];
    // debug shadow
    var kshadow;
    if (DRAW_DEBUG) {
      kshadow = group.getChildren(function (node) {
        return node.name() === 'shadow';
      })[0];
    }

    // circle center
    var center = {
      x: kcircle.x(),
      y: kcircle.y()
    };

    var radius;

    // update 'self' (undo case) and special points
    switch (anchor.id()) {
    case 'left':
      radius = center.x - anchor.x();
      // force y
      left.y(right.y());
      // update others
      right.x(center.x + radius);
      bottom.y(center.y - radius);
      top.y(center.y + radius);
      break;
    case 'right':
      radius = anchor.x() - center.x;
      // force y
      right.y(left.y());
      // update others
      left.x(center.x - radius);
      bottom.y(center.y - radius);
      top.y(center.y + radius);
      break;
    case 'bottom':
      radius = center.y - anchor.y();
      // force x
      bottom.x(top.x());
      // update others
      left.x(center.x - radius);
      right.x(center.x + radius);
      top.y(center.y + radius);
      break;
    case 'top':
      radius = anchor.y() - center.y;
      // force x
      top.x(bottom.x());
      // update others
      left.x(center.x - radius);
      right.x(center.x + radius);
      bottom.y(center.y - radius);
      break;
    default :
      logger.error('Unhandled anchor id: ' + anchor.id());
      break;
    }

    // update shape: just update the radius
    kcircle.radius(Math.abs(radius));
    // new circle
    var centerPoint = new Point2D(
      group.x() + center.x,
      group.y() + center.y
    );
    var circle = new Circle(centerPoint, radius);

    // debug shadow
    if (kshadow) {
      // remove previous
      kshadow.destroy();
      // add new
      group.add(this.#getShadowCircle(circle, group));
    }

    // update label position
    var textPos = {x: center.x, y: center.y};
    klabel.position(textPos);

    // update quantification
    this.#updateCircleQuantification(group, viewController);
  }

  /**
   * Update the quantification of a Circle.
   *
   * @param {object} group The group with the shape.
   * @param {object} viewController The associated view controller.
   */
  updateQuantification(group, viewController) {
    this.#updateCircleQuantification(group, viewController);
  }

  /**
   * Update the quantification of a Circle (as a static
   *   function to be used in update).
   *
   * @param {object} group The group with the shape.
   * @param {object} viewController The associated view controller.
   */
  #updateCircleQuantification(
    group, viewController) {
    // associated shape
    var kcircle = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    // associated label
    var klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];

    // positions: add possible group offset
    var centerPoint = new Point2D(
      group.x() + kcircle.x(),
      group.y() + kcircle.y()
    );
    // circle
    var circle = new Circle(centerPoint, kcircle.radius());

    // update text
    var ktext = klabel.getText();
    var quantification = circle.quantify(
      viewController,
      getFlags(ktext.meta.textExpr));
    ktext.setText(replaceFlags(ktext.meta.textExpr, quantification));
    // update meta
    ktext.meta.quantification = quantification;
  }

  /**
   * Get the debug shadow.
   *
   * @param {Circle} circle The circle to shadow.
   * @param {object} group The associated group.
   * @returns {object} The shadow konva group.
   */
  #getShadowCircle(circle, group) {
    // possible group offset
    var offsetX = 0;
    var offsetY = 0;
    if (typeof group !== 'undefined') {
      offsetX = group.x();
      offsetY = group.y();
    }
    var kshadow = new Konva.Group();
    kshadow.name('shadow');
    var regions = circle.getRound();
    for (var i = 0; i < regions.length; ++i) {
      var region = regions[i];
      var minX = region[0][0];
      var minY = region[0][1];
      var maxX = region[1][0];
      var pixelLine = new Konva.Rect({
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
