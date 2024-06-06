import {Line, getAngle} from '../math/line';
import {Point2D} from '../math/point';
import {replaceFlags} from '../utils/string';
import {defaults} from '../app/defaults';
import {i18n} from '../utils/i18n';
import {getDefaultAnchor} from './editor';
// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {ViewController} from '../app/viewController';
import {Style} from '../gui/style';
/* eslint-enable no-unused-vars */

/**
 * Protractor factory.
 */
export class ProtractorFactory {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return 'protractor-group';
  }

  /**
   * Get the number of points needed to build the shape.
   *
   * @returns {number} The number of points.
   */
  getNPoints() {
    return 3;
  }

  /**
   * Get the timeout between point storage.
   *
   * @returns {number} The timeout in milliseconds.
   */
  getTimeout() {
    return 500;
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
   * Create a protractor shape to be displayed.
   *
   * @param {Point2D[]} points The points from which to extract the protractor.
   * @param {Style} style The drawing style.
   * @param {ViewController} viewController The associated view controller.
   * @returns {Konva.Group} The Konva group.
   */
  create(points, style, viewController) {
    // physical shape
    const line0 = new Line(points[0], points[1]);
    // points stored the Konvajs way
    const pointsArray = [];
    for (let i = 0; i < points.length; ++i) {
      pointsArray.push(points[i].getX());
      pointsArray.push(points[i].getY());
    }
    // draw shape
    const kshape = new Konva.Line({
      points: pointsArray,
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape'
    });
    const group = new Konva.Group();
    group.name(this.getGroupName());
    // text and decoration
    if (points.length === 3) {
      const line1 = new Line(points[1], points[2]);
      // larger hitfunc
      kshape.hitFunc(function (context) {
        context.beginPath();
        context.moveTo(points[0].getX(), points[0].getY());
        context.lineTo(points[1].getX(), points[1].getY());
        context.lineTo(points[2].getX(), points[2].getY());
        context.closePath();
        context.fillStrokeShape(kshape);
      });
      // quantification
      let angle = getAngle(line0, line1);
      let inclination = line0.getInclination();
      if (angle > 180) {
        angle = 360 - angle;
        inclination += angle;
      }

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
      if (typeof defaults.labelText.protractor[modality] !== 'undefined') {
        textExpr = defaults.labelText.protractor[modality];
      } else {
        textExpr = defaults.labelText.protractor['*'];
      }
      const quant = {
        angle: {
          value: angle,
          unit: i18n.t('unit.degree')
        }
      };
      ktext.setText(replaceFlags(textExpr, quant));
      // augment text with meta
      // @ts-ignore
      ktext.meta = {
        textExpr: textExpr,
        quantification: quant
      };

      // label
      const midX =
        (line0.getMidpoint().getX() + line1.getMidpoint().getX()) / 2;
      const midY =
        (line0.getMidpoint().getY() + line1.getMidpoint().getY()) / 2;
      const klabel = new Konva.Label({
        x: midX,
        y: midY - style.applyZoomScale(15).y,
        scale: style.applyZoomScale(1),
        visible: textExpr.length !== 0,
        name: 'label'
      });
      klabel.add(ktext);
      klabel.add(new Konva.Tag({
        fill: style.getLineColour(),
        opacity: style.getTagOpacity()
      }));

      // arc
      const radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
      const karc = new Konva.Arc({
        innerRadius: radius,
        outerRadius: radius,
        stroke: style.getLineColour(),
        strokeWidth: style.getStrokeWidth(),
        strokeScaleEnabled: false,
        angle: angle,
        rotation: -inclination,
        x: points[1].getX(),
        y: points[1].getY(),
        name: 'shape-arc'
      });
      // add to group
      group.add(klabel);
      group.add(karc);
    }
    // add shape to group
    group.add(kshape);
    group.visible(true); // dont inherit
    // return group
    return group;
  }

  /**
   * Get anchors to update a protractor shape.
   *
   * @param {Konva.Line} shape The associated shape.
   * @param {Style} style The application style.
   * @returns {Array} A list of anchors.
   */
  getAnchors(shape, style) {
    const points = shape.points();

    const anchors = [];
    anchors.push(getDefaultAnchor(
      points[0] + shape.x(), points[1] + shape.y(), 'begin', style
    ));
    anchors.push(getDefaultAnchor(
      points[2] + shape.x(), points[3] + shape.y(), 'mid', style
    ));
    anchors.push(getDefaultAnchor(
      points[4] + shape.x(), points[5] + shape.y(), 'end', style
    ));
    return anchors;
  }

  /**
   * Update a protractor shape.
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
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
    if (!(klabel instanceof Konva.Label)) {
      return;
    }
    // associated arc
    const karc = group.getChildren(function (node) {
      return node.name() === 'shape-arc';
    })[0];
    if (!(karc instanceof Konva.Arc)) {
      return;
    }
    // find special points
    const begin = group.getChildren(function (node) {
      return node.id() === 'begin';
    })[0];
    const mid = group.getChildren(function (node) {
      return node.id() === 'mid';
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
    case 'mid':
      mid.x(anchor.x());
      mid.y(anchor.y());
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
    const mx = mid.x() - kline.x();
    const my = mid.y() - kline.y();
    const ex = end.x() - kline.x();
    const ey = end.y() - kline.y();
    kline.points([bx, by, mx, my, ex, ey]);
    // larger hitfunc
    kline.hitFunc(function (context) {
      context.beginPath();
      context.moveTo(bx, by);
      context.lineTo(mx, my);
      context.lineTo(ex, ey);
      context.closePath();
      context.fillStrokeShape(kline);
    });
    // update text
    const p2d0 = new Point2D(begin.x(), begin.y());
    const p2d1 = new Point2D(mid.x(), mid.y());
    const p2d2 = new Point2D(end.x(), end.y());
    const line0 = new Line(p2d0, p2d1);
    const line1 = new Line(p2d1, p2d2);
    let angle = getAngle(line0, line1);
    let inclination = line0.getInclination();
    if (angle > 180) {
      angle = 360 - angle;
      inclination += angle;
    }

    // update text
    const ktext = klabel.getText();
    // @ts-expect-error
    const meta = ktext.meta;
    const quantification = {
      angle: {value: angle, unit: i18n.t('unit.degree')}
    };
    ktext.setText(replaceFlags(meta.textExpr, quantification));
    // update meta
    meta.quantification = quantification;
    // update position
    const midX = (line0.getMidpoint().getX() + line1.getMidpoint().getX()) / 2;
    const midY = (line0.getMidpoint().getY() + line1.getMidpoint().getY()) / 2;
    const textPos = {
      x: midX,
      y: midY - style.applyZoomScale(15).y
    };
    klabel.position(textPos);

    // arc
    const radius = Math.min(line0.getLength(), line1.getLength()) * 33 / 100;
    karc.innerRadius(radius);
    karc.outerRadius(radius);
    karc.angle(angle);
    karc.rotation(-inclination);
    const arcPos = {x: mid.x(), y: mid.y()};
    karc.position(arcPos);
  }

} // class ProtractorFactory
