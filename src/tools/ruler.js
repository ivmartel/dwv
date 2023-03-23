import {Line, getPerpendicularLine} from '../math/line';
import {Point2D} from '../math/point';
import {getFlags, replaceFlags} from '../utils/string';
import {getDefaultAnchor} from './editor';
// external
import Konva from 'konva';

/**
 * Default draw label text.
 */
const defaultRulerLabelText = '{length}';

/**
 * Ruler factory.
 *
 * @class
 */
export class RulerFactory {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return 'ruler-group';
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
   * Create a ruler shape to be displayed.
   *
   * @param {Array} points The points from which to extract the line.
   * @param {object} style The drawing style.
   * @param {object} viewController The associated view controller.
   * @returns {object} The Konva group.
   */
  create(points, style, viewController) {
    // physical shape
    var line = new Line(points[0], points[1]);
    // draw shape
    var kshape = new Konva.Line({
      points: [line.getBegin().getX(),
        line.getBegin().getY(),
        line.getEnd().getX(),
        line.getEnd().getY()],
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });

    var tickLen = style.scale(10);

    // tick begin
    var linePerp0 = getPerpendicularLine(line, points[0], tickLen);
    var ktick0 = new Konva.Line({
      points: [linePerp0.getBegin().getX(),
        linePerp0.getBegin().getY(),
        linePerp0.getEnd().getX(),
        linePerp0.getEnd().getY()],
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape-tick0'
    });

    // tick end
    var linePerp1 = getPerpendicularLine(line, points[1], tickLen);
    var ktick1 = new Konva.Line({
      points: [linePerp1.getBegin().getX(),
        linePerp1.getBegin().getY(),
        linePerp1.getEnd().getX(),
        linePerp1.getEnd().getY()],
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape-tick1'
    });

    // larger hitfunc
    kshape.hitFunc(function (context) {
      context.beginPath();
      context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
      context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
      context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
      context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
      context.closePath();
      context.fillStrokeShape(this);
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
    // if (typeof rulerLabelText !== 'undefined') {
    //   textExpr = rulerLabelText;
    // } else {
    textExpr = defaultRulerLabelText;
    // }
    var quant = line.quantify(
      viewController,
      getFlags(textExpr));
    ktext.setText(replaceFlags(textExpr, quant));
    // meta data
    ktext.meta = {
      textExpr: textExpr,
      quantification: quant
    };

    // label
    var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
    var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0;
    var klabel = new Konva.Label({
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
    var group = new Konva.Group();
    group.name(this.getGroupName());
    group.add(klabel);
    group.add(ktick0);
    group.add(ktick1);
    group.add(kshape);
    group.visible(true); // dont inherit
    return group;
  }

  /**
   * Get anchors to update a ruler shape.
   *
   * @param {object} shape The associated shape.
   * @param {object} style The application style.
   * @returns {Array} A list of anchors.
   */
  getAnchors(shape, style) {
    var points = shape.points();

    var anchors = [];
    anchors.push(getDefaultAnchor(
      points[0] + shape.x(), points[1] + shape.y(), 'begin', style
    ));
    anchors.push(getDefaultAnchor(
      points[2] + shape.x(), points[3] + shape.y(), 'end', style
    ));
    return anchors;
  }

  /**
   * Update a ruler shape.
   *
   * @param {object} anchor The active anchor.
   * @param {object} style The app style.
   * @param {object} viewController The associated view controller.
   */
  update(anchor, style, viewController) {
    // parent group
    var group = anchor.getParent();
    // associated shape
    var kline = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
      // associated tick0
    var ktick0 = group.getChildren(function (node) {
      return node.name() === 'shape-tick0';
    })[0];
      // associated tick1
    var ktick1 = group.getChildren(function (node) {
      return node.name() === 'shape-tick1';
    })[0];
      // associated label
    var klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
      // find special points
    var begin = group.getChildren(function (node) {
      return node.id() === 'begin';
    })[0];
    var end = group.getChildren(function (node) {
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
    var bx = begin.x() - kline.x();
    var by = begin.y() - kline.y();
    var ex = end.x() - kline.x();
    var ey = end.y() - kline.y();
    kline.points([bx, by, ex, ey]);
    // new line
    var p2d0 = new Point2D(begin.x(), begin.y());
    var p2d1 = new Point2D(end.x(), end.y());
    var line = new Line(p2d0, p2d1);
    // tick
    var p2b = new Point2D(bx, by);
    var p2e = new Point2D(ex, ey);
    var linePerp0 = getPerpendicularLine(line, p2b, style.scale(10));
    ktick0.points([linePerp0.getBegin().getX(),
      linePerp0.getBegin().getY(),
      linePerp0.getEnd().getX(),
      linePerp0.getEnd().getY()]);
    var linePerp1 = getPerpendicularLine(line, p2e, style.scale(10));
    ktick1.points([linePerp1.getBegin().getX(),
      linePerp1.getBegin().getY(),
      linePerp1.getEnd().getX(),
      linePerp1.getEnd().getY()]);
    // larger hitfunc
    kline.hitFunc(function (context) {
      context.beginPath();
      context.moveTo(linePerp0.getBegin().getX(), linePerp0.getBegin().getY());
      context.lineTo(linePerp0.getEnd().getX(), linePerp0.getEnd().getY());
      context.lineTo(linePerp1.getEnd().getX(), linePerp1.getEnd().getY());
      context.lineTo(linePerp1.getBegin().getX(), linePerp1.getBegin().getY());
      context.closePath();
      context.fillStrokeShape(this);
    });

    // update text
    var ktext = klabel.getText();
    var quantification = line.quantify(
      viewController,
      getFlags(ktext.meta.textExpr));
    ktext.setText(replaceFlags(ktext.meta.textExpr, quantification));
    // update meta
    ktext.meta.quantification = quantification;
    // update position
    var dX = line.getBegin().getX() > line.getEnd().getX() ? 0 : -1;
    var dY = line.getBegin().getY() > line.getEnd().getY() ? -1 : 0;
    var textPos = {
      x: line.getEnd().getX() + dX * ktext.width(),
      y: line.getEnd().getY() + dY * style.applyZoomScale(15).y
    };
    klabel.position(textPos);
  }

} // class RulerFactory
