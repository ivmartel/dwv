import {Ellipse} from '../math/ellipse';
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
 * Ellipse factory.
 */
export class EllipseFactory {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return 'ellipse-group';
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
   * Create an ellipse shape to be displayed.
   *
   * @param {Point2D[]} points The points from which to extract the ellipse.
   * @param {Style} style The drawing style.
   * @param {ViewController} viewController The associated view controller.
   * @returns {Konva.Group} The Konva group.
   */
  create(
    points, style, viewController) {
    // calculate radius
    const a = Math.abs(points[0].getX() - points[1].getX());
    const b = Math.abs(points[0].getY() - points[1].getY());
    // physical shape
    const ellipse = new Ellipse(points[0], a, b);
    // draw shape
    const radius = {x: ellipse.getA(), y: ellipse.getB()};
    const kshape = new Konva.Ellipse({
      x: ellipse.getCenter().getX(),
      y: ellipse.getCenter().getY(),
      radius: radius,
      radiusX: radius.x,
      radiusY: radius.y,
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
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
    if (typeof defaults.labelText.ellipse[modality] !== 'undefined') {
      textExpr = defaults.labelText.ellipse[modality];
    } else {
      textExpr = defaults.labelText.ellipse['*'];
    }
    const quant = ellipse.quantify(
      viewController,
      getFlags(textExpr));
    ktext.setText(replaceFlags(textExpr, quant));
    // augment text with meta
    // @ts-ignore
    ktext.meta = {
      textExpr: textExpr,
      quantification: quant
    };
    // label
    const klabel = new Konva.Label({
      x: ellipse.getCenter().getX() - ellipse.getA(),
      y: ellipse.getCenter().getY() + ellipse.getB(),
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
    let kshadow;
    if (DRAW_DEBUG) {
      kshadow = this.#getShadowEllipse(ellipse);
    }

    // return group
    const group = new Konva.Group();
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
   * Get anchors to update an ellipse shape.
   *
   * @param {Konva.Ellipse} shape The associated shape.
   * @param {Style} style The application style.
   * @returns {Konva.Ellipse[]} A list of anchors.
   */
  getAnchors(shape, style) {
    const ellipseX = shape.x();
    const ellipseY = shape.y();
    const radius = shape.radius();

    const anchors = [];
    anchors.push(getDefaultAnchor(
      ellipseX - radius.x, ellipseY, 'left', style
    ));
    anchors.push(getDefaultAnchor(
      ellipseX + radius.x, ellipseY, 'right', style
    ));
    anchors.push(getDefaultAnchor(
      ellipseX, ellipseY + radius.y, 'bottom', style
    ));
    anchors.push(getDefaultAnchor(
      ellipseX, ellipseY - radius.y, 'top', style
    ));
    return anchors;
  }

  /**
   * Update an ellipse shape.
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
    const kellipse = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kellipse instanceof Konva.Ellipse)) {
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

    // ellipse center
    const center = {
      x: kellipse.x(),
      y: kellipse.y()
    };

    let radiusX;
    let radiusY;

    // update 'self' (undo case) and special points
    switch (anchor.id()) {
    case 'left':
      radiusX = center.x - anchor.x();
      radiusY = top.y() - center.y;
      // update self (while blocking y)
      left.x(anchor.x());
      left.y(right.y());
      // update others
      right.x(center.x + radiusX);
      break;
    case 'right':
      radiusX = anchor.x() - center.x;
      radiusY = top.y() - center.y;
      // update self (while blocking y)
      right.x(anchor.x());
      right.y(left.y());
      // update others
      left.x(center.x - radiusX);
      break;
    case 'bottom':
      radiusX = center.x - left.x();
      radiusY = anchor.y() - center.y;
      // update self (while blocking x)
      bottom.x(top.x());
      bottom.y(anchor.y());
      // update others
      top.y(center.y - radiusY);
      break;
    case 'top':
      radiusX = center.x - left.x();
      radiusY = center.y - anchor.y();
      // update self (while blocking x)
      top.x(bottom.x());
      top.y(anchor.y());
      // update others
      bottom.y(center.y + radiusY);
      break;
    default :
      logger.error('Unhandled anchor id: ' + anchor.id());
      break;
    }
    // update shape
    kellipse.position(center);
    const radiusAbs = {
      x: Math.abs(radiusX),
      y: Math.abs(radiusY)
    };
    if (radiusAbs) {
      kellipse.radius(radiusAbs);
    }
    // new ellipse
    const centerPoint = new Point2D(
      group.x() + center.x,
      group.y() + center.y
    );
    const ellipse = new Ellipse(centerPoint, radiusAbs.x, radiusAbs.y);

    // debug shadow
    if (kshadow) {
      // remove previous
      kshadow.destroy();
      // add new
      group.add(this.#getShadowEllipse(ellipse, group));
    }

    // update label position
    const textPos = {
      x: center.x - radiusAbs.x,
      y: center.y + radiusAbs.y
    };
    klabel.position(textPos);

    // update quantification
    this.#updateEllipseQuantification(group, viewController);
  }

  /**
   * Update the quantification of an Ellipse.
   *
   * @param {Konva.Group} group The group with the shape.
   * @param {ViewController} viewController The associated view controller.
   */
  updateQuantification(group, viewController) {
    this.#updateEllipseQuantification(group, viewController);
  }

  /**
   * Update the quantification of an Ellipse (as a static
   *   function to be used in update).
   *
   * @param {Konva.Group} group The group with the shape.
   * @param {ViewController} viewController The associated view controller.
   */
  #updateEllipseQuantification(group, viewController) {
    // associated shape
    const kellipse = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kellipse instanceof Konva.Ellipse)) {
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
      group.x() + kellipse.x(),
      group.y() + kellipse.y()
    );
    // circle
    const ellipse = new Ellipse(
      centerPoint, kellipse.radius().x, kellipse.radius().y);

    // update text
    const ktext = klabel.getText();
    // @ts-expect-error
    const meta = ktext.meta;
    const quantification = ellipse.quantify(
      viewController,
      getFlags(meta.textExpr));
    ktext.setText(replaceFlags(meta.textExpr, quantification));
    // update meta
    meta.quantification = quantification;
  }

  /**
   * Get the debug shadow.
   *
   * @param {Ellipse} ellipse The ellipse to shadow.
   * @param {Konva.Group} [group] The associated group.
   * @returns {Konva.Group} The shadow konva group.
   */
  #getShadowEllipse(ellipse, group) {
    // possible group offset
    let offsetX = 0;
    let offsetY = 0;
    if (typeof group !== 'undefined') {
      offsetX = group.x();
      offsetY = group.y();
    }
    const kshadow = new Konva.Group();
    kshadow.name('shadow');
    const regions = ellipse.getRound();
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

} // class EllipseFactory
