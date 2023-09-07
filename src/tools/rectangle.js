import {Rectangle} from '../math/rectangle';
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
   * Create a rectangle shape to be displayed.
   *
   * @param {Point2D[]} points The points from which to extract the rectangle.
   * @param {Style} style The drawing style.
   * @param {ViewController} viewController The associated view controller.
   * @returns {Konva.Group} The Konva group.
   */
  create(points, style, viewController) {
    // physical shape
    const rectangle = new Rectangle(points[0], points[1]);
    // draw shape
    const kshape = new Konva.Rect({
      x: rectangle.getBegin().getX(),
      y: rectangle.getBegin().getY(),
      width: rectangle.getWidth(),
      height: rectangle.getHeight(),
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
    // label text
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
    if (typeof defaults.labelText.rectangle[modality] !== 'undefined') {
      textExpr = defaults.labelText.rectangle[modality];
    } else {
      textExpr = defaults.labelText.rectangle['*'];
    }
    const quant = rectangle.quantify(
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
      x: rectangle.getBegin().getX(),
      y: rectangle.getEnd().getY(),
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
      kshadow = this.#getShadowRectangle(rectangle);
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
   * Get anchors to update a rectangle shape.
   *
   * @param {Konva.Shape} shape The associated shape.
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
   * Update a rectangle shape.
   *
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} style The app style.
   * @param {ViewController} viewController The associated view controller.
   */
  update(anchor, style, viewController) {
    // parent group
    const group = anchor.getParent();
    if (!(group instanceof Konva.Group)) {
      return;
    }
    // associated shape
    const krect = group.getChildren(function (node) {
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
    krect.position(topLeft.position());
    const width = topRight.x() - topLeft.x();
    const height = bottomLeft.y() - topLeft.y();
    if (width && height) {
      krect.size({width: width, height: height});
    }
    // positions: add possible group offset
    const p2d0 = new Point2D(
      group.x() + topLeft.x(),
      group.y() + topLeft.y()
    );
    const p2d1 = new Point2D(
      group.x() + bottomRight.x(),
      group.y() + bottomRight.y()
    );
    // new rect
    const rect = new Rectangle(p2d0, p2d1);

    // debug shadow based on round (used in quantification)
    if (kshadow) {
      const round = rect.getRound();
      const rWidth = round.max.getX() - round.min.getX();
      const rHeight = round.max.getY() - round.min.getY();
      kshadow.position({
        x: round.min.getX() - group.x(),
        y: round.min.getY() - group.y()
      });
      kshadow.size({width: rWidth, height: rHeight});
    }

    // update label position
    const textPos = {
      x: rect.getBegin().getX() - group.x(),
      y: rect.getEnd().getY() - group.y()
    };
    klabel.position(textPos);

    // update quantification
    this.#updateRectangleQuantification(group, viewController);
  }

  /**
   * Update the quantification of a Rectangle.
   *
   * @param {Konva.Group} group The group with the shape.
   * @param {ViewController} viewController The associated view controller.
   */
  updateQuantification(group, viewController) {
    this.#updateRectangleQuantification(group, viewController);
  }

  /**
   * Update the quantification of a Rectangle (as a static
   *   function to be used in update).
   *
   * @param {Konva.Group} group The group with the shape.
   * @param {ViewController} viewController The associated view controller.
   */
  #updateRectangleQuantification(group, viewController) {
    // associated shape
    const krect = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
    if (!(klabel instanceof Konva.Label)) {
      return;
    }

    // positions: add possible group offset
    const p2d0 = new Point2D(
      group.x() + krect.x(),
      group.y() + krect.y()
    );
    const p2d1 = new Point2D(
      p2d0.getX() + krect.width(),
      p2d0.getY() + krect.height()
    );
    // rectangle
    const rect = new Rectangle(p2d0, p2d1);

    // update text
    const ktext = klabel.getText();
    // @ts-expect-error
    const meta = ktext.meta;
    const quantification = rect.quantify(
      viewController,
      getFlags(meta.textExpr));
    ktext.setText(replaceFlags(meta.textExpr, quantification));
    // update meta
    meta.quantification = quantification;
  }

  /**
   * Get the debug shadow.
   *
   * @param {Rectangle} rectangle The rectangle to shadow.
   * @returns {Konva.Rect} The shadow konva shape.
   */
  #getShadowRectangle(rectangle) {
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

} // class RectangleFactory
