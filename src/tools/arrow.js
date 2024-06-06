import {Point2D} from '../math/point';
import {Line, getPerpendicularLine, getAngle} from '../math/line';
import {defaults} from '../app/defaults';
import {getDefaultAnchor} from './editor';
// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {ViewController} from '../app/viewController';
import {Style} from '../gui/style';
/* eslint-enable no-unused-vars */

/**
 * Arrow factory.
 */
export class ArrowFactory {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return 'line-group';
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
   * Create an arrow shape to be displayed.
   *
   * @param {Point2D[]} points The points from which to extract the line.
   * @param {Style} style The drawing style.
   * @param {ViewController} viewController The associated view controller.
   * @returns {Konva.Group} The Konva group.
   */
  create(points, style, viewController) {
    // physical shape
    const line = new Line(points[0], points[1]);
    // draw shape
    const kshape = new Konva.Line({
      points: [line.getBegin().getX(),
        line.getBegin().getY(),
        line.getEnd().getX(),
        line.getEnd().getY()],
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
    // larger hitfunc
    const tickLen = style.applyZoomScale(10).x;
    const linePerp0 = getPerpendicularLine(line, points[0], tickLen);
    const linePerp1 = getPerpendicularLine(line, points[1], tickLen);
    kshape.hitFunc(function (context) {
      context.beginPath();
      context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
      context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
      context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
      context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
      context.closePath();
      context.fillStrokeShape(kshape);
    });
    // triangle
    const beginTy = new Point2D(
      line.getBegin().getX(),
      line.getBegin().getY() - 10);
    const verticalLine = new Line(line.getBegin(), beginTy);
    const angle = getAngle(line, verticalLine);
    const angleRad = angle * Math.PI / 180;
    const radius = Math.abs(style.applyZoomScale(8).x);
    const kpoly = new Konva.RegularPolygon({
      x: line.getBegin().getX() + radius * Math.sin(angleRad),
      y: line.getBegin().getY() + radius * Math.cos(angleRad),
      sides: 3,
      radius: radius,
      rotation: -angle,
      fill: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape-triangle'
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
    if (typeof defaults.labelText.arrow[modality] !== 'undefined') {
      textExpr = defaults.labelText.arrow[modality];
    } else {
      textExpr = defaults.labelText.arrow['*'];
    }
    ktext.setText(textExpr);
    // augment text with meta data
    // @ts-ignore
    ktext.meta = {
      textExpr: textExpr,
      quantification: {}
    };
    // label
    const dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
    const dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0;
    const klabel = new Konva.Label({
      x: line.getEnd().getX() + dX * ktext.width(),
      y: line.getEnd().getY() + dY * style.applyZoomScale(15).y,
      scale: style.applyZoomScale(1),
      visible: textExpr.length !== 0,
      name: 'label'
    });
    klabel.add(ktext);
    klabel.add(new Konva.Tag({
      fill: style.getLineColour(),
      opacity: style.getTagOpacity()
    }));

    // return group
    const group = new Konva.Group();
    group.name(this.getGroupName());
    group.add(klabel);
    group.add(kpoly);
    group.add(kshape);
    group.visible(true); // dont inherit
    return group;
  }

  /**
   * Get anchors to update an arrow shape.
   *
   * @param {Konva.Line} shape The associated shape.
   * @param {Style} style The application style.
   * @returns {Konva.Ellipse[]} A list of anchors.
   */
  getAnchors(shape, style) {
    const points = shape.points();

    const anchors = [];
    anchors.push(getDefaultAnchor(
      points[0] + shape.x(), points[1] + shape.y(), 'begin', style
    ));
    anchors.push(getDefaultAnchor(
      points[2] + shape.x(), points[3] + shape.y(), 'end', style
    ));
    return anchors;
  }

  /**
   * Update an arrow shape.
   *
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} style The app style.
   * @param {ViewController} _viewController The associated view controller.
   */
  update(anchor, style, _viewController) {
    // parent group
    const group = anchor.getParent();
    // associated shape
    const kline = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kline instanceof Konva.Line)) {
      return;
    }
    // associated triangle shape
    const ktriangle = group.getChildren(function (node) {
      return node.name() === 'shape-triangle';
    })[0];
    if (!(ktriangle instanceof Konva.RegularPolygon)) {
      return;
    }
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
    if (!(klabel instanceof Konva.Label)) {
      return;
    }
    // find special points
    const begin = group.getChildren(function (node) {
      return node.id() === 'begin';
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
    case 'end':
      end.x(anchor.x());
      end.y(anchor.y());
      break;
    }
    // update shape and compensate for possible drag
    // note: shape.position() and shape.size() won't work...
    const bx = begin.x() - kline.x();
    const by = begin.y() - kline.y();
    const ex = end.x() - kline.x();
    const ey = end.y() - kline.y();
    kline.points([bx, by, ex, ey]);
    // new line
    const p2d0 = new Point2D(begin.x(), begin.y());
    const p2d1 = new Point2D(end.x(), end.y());
    const line = new Line(p2d0, p2d1);
    // larger hitfunc
    const p2b = new Point2D(bx, by);
    const p2e = new Point2D(ex, ey);
    const tickLen = style.applyZoomScale(10).x;
    const linePerp0 = getPerpendicularLine(line, p2b, tickLen);
    const linePerp1 = getPerpendicularLine(line, p2e, tickLen);
    kline.hitFunc(function (context) {
      context.beginPath();
      context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
      context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
      context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
      context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
      context.closePath();
      context.fillStrokeShape(kline);
    });
    // udate triangle
    const beginTy = new Point2D(
      line.getBegin().getX(),
      line.getBegin().getY() - 10);
    const verticalLine = new Line(line.getBegin(), beginTy);
    const angle = getAngle(line, verticalLine);
    const angleRad = angle * Math.PI / 180;
    ktriangle.x(
      line.getBegin().getX() + ktriangle.radius() * Math.sin(angleRad));
    ktriangle.y(
      line.getBegin().getY() + ktriangle.radius() * Math.cos(angleRad));
    ktriangle.rotation(-angle);

    // update text
    const ktext = klabel.getText();
    // @ts-expect-error
    ktext.setText(ktext.meta.textExpr);
    // update position
    const dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
    const dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0;
    const textPos = {
      x: line.getEnd().getX() + dX * ktext.width(),
      y: line.getEnd().getY() + dY * style.applyZoomScale(15).y
    };
    klabel.position(textPos);
  }

} // class ArrowFactory
