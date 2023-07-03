import {Ellipse} from '../math/ellipse';
import {Point2D} from '../math/point';
import {getFlags, replaceFlags} from '../utils/string';
import {logger} from '../utils/logger';
import {defaults} from '../app/defaults';
import {getDefaultAnchor} from './editor';
import {DRAW_DEBUG} from './draw';
// external
import Konva from 'konva';

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
   * @param {object} group The group to test.
   * @returns {boolean} True if the group is from this fcatory.
   */
  isFactoryGroup(group) {
    return this.getGroupName() === group.name();
  }

  /**
   * Create an ellipse shape to be displayed.
   *
   * @param {Array} points The points from which to extract the ellipse.
   * @param {object} style The drawing style.
   * @param {object} viewController The associated view controller.
   * @returns {object} The Konva group.
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
      x: ellipse.getCenter().getX(),
      y: ellipse.getCenter().getY(),
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
   * @param {object} shape The associated shape.
   * @param {object} style The application style.
   * @returns {Array} A list of anchors.
   */
  getAnchors(shape, style) {
    const ellipseX = shape.x();
    const ellipseY = shape.y();
    const radius = shape.radius();

    const anchors = [];
    anchors.push(getDefaultAnchor(
      ellipseX - radius.x, ellipseY - radius.y, 'topLeft', style
    ));
    anchors.push(getDefaultAnchor(
      ellipseX + radius.x, ellipseY - radius.y, 'topRight', style
    ));
    anchors.push(getDefaultAnchor(
      ellipseX + radius.x, ellipseY + radius.y, 'bottomRight', style
    ));
    anchors.push(getDefaultAnchor(
      ellipseX - radius.x, ellipseY + radius.y, 'bottomLeft', style
    ));
    return anchors;
  }

  /**
   * Update an ellipse shape.
   *
   * @param {object} anchor The active anchor.
   * @param {object} _style The app style.
   * @param {object} viewController The associated view controller.
   */
  update(anchor, _style, viewController) {
    // parent group
    const group = anchor.getParent();
    // associated shape
    const kellipse = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
      // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
      // find special points
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
    // debug shadow
    let kshadow;
    if (DRAW_DEBUG) {
      kshadow = group.getChildren(function (node) {
        return node.name() === 'shadow';
      })[0];
    }

    // update 'self' (undo case) and special points
    switch (anchor.id()) {
    case 'topLeft':
      topLeft.x(anchor.x());
      topLeft.y(anchor.y());
      topRight.y(anchor.y());
      bottomLeft.x(anchor.x());
      break;
    case 'topRight':
      topRight.x(anchor.x());
      topRight.y(anchor.y());
      topLeft.y(anchor.y());
      bottomRight.x(anchor.x());
      break;
    case 'bottomRight':
      bottomRight.x(anchor.x());
      bottomRight.y(anchor.y());
      bottomLeft.y(anchor.y());
      topRight.x(anchor.x());
      break;
    case 'bottomLeft':
      bottomLeft.x(anchor.x());
      bottomLeft.y(anchor.y());
      bottomRight.y(anchor.y());
      topLeft.x(anchor.x());
      break;
    default :
      logger.error('Unhandled anchor id: ' + anchor.id());
      break;
    }
    // update shape
    const radiusX = (topRight.x() - topLeft.x()) / 2;
    const radiusY = (bottomRight.y() - topRight.y()) / 2;
    const center = {
      x: topLeft.x() + radiusX,
      y: topRight.y() + radiusY
    };
    kellipse.position(center);
    const radiusAbs = {x: Math.abs(radiusX), y: Math.abs(radiusY)};
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
    const textPos = {x: center.x, y: center.y};
    klabel.position(textPos);

    // update quantification
    this.#updateEllipseQuantification(group, viewController);
  }

  /**
   * Update the quantification of an Ellipse.
   *
   * @param {object} group The group with the shape.
   * @param {object} viewController The associated view controller.
   */
  updateQuantification(group, viewController) {
    this.#updateEllipseQuantification(group, viewController);
  }

  /**
   * Update the quantification of an Ellipse (as a static
   *   function to be used in update).
   *
   * @param {object} group The group with the shape.
   * @param {object} viewController The associated view controller.
   */
  #updateEllipseQuantification(group, viewController) {
    // associated shape
    const kellipse = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];

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
    const quantification = ellipse.quantify(
      viewController,
      getFlags(ktext.meta.textExpr));
    ktext.setText(replaceFlags(ktext.meta.textExpr, quantification));
    // update meta
    ktext.meta.quantification = quantification;
  }

  /**
   * Get the debug shadow.
   *
   * @param {Ellipse} ellipse The ellipse to shadow.
   * @param {object} group The associated group.
   * @returns {object} The shadow konva group.
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
