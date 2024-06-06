import {defaults} from '../app/defaults';
import {getDefaultAnchor} from './editor';
// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {Point2D} from '../math/point';
import {ViewController} from '../app/viewController';
import {Style} from '../gui/style';
/* eslint-enable no-unused-vars */

/**
 * FreeHand factory.
 */
export class FreeHandFactory {
  /**
   * Get the name of the shape group.
   *
   * @returns {string} The name.
   */
  getGroupName() {
    return 'freeHand-group';
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
    return 25;
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
   * Create a roi shape to be displayed.
   *
   * @param {Point2D[]} points The points from which to extract the line.
   * @param {Style} style The drawing style.
   * @param {ViewController} viewController The associated view controller.
   * @returns {Konva.Group} The Konva group.
   */
  create(points, style, viewController) {
    // points stored the Konvajs way
    const arr = [];
    for (let i = 0; i < points.length; ++i) {
      arr.push(points[i].getX());
      arr.push(points[i].getY());
    }
    // draw shape
    const kshape = new Konva.Line({
      points: arr,
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape',
      tension: 0.5
    });

    // text
    const ktext = new Konva.Text({
      fontSize: style.getFontSize(),
      fontFamily: style.getFontFamily(),
      fill: style.getLineColour(),
      name: 'text'
    });
    let textExpr = '';
    const modality = viewController.getModality();
    if (typeof defaults.labelText.freeHand[modality] !== 'undefined') {
      textExpr = defaults.labelText.freeHand[modality];
    } else {
      textExpr = defaults.labelText.freeHand['*'];
    }
    ktext.setText(textExpr);
    // augment text with meta
    // @ts-ignore
    ktext.meta = {
      textExpr: textExpr,
      quantification: {}
    };

    // label
    const klabel = new Konva.Label({
      x: points[0].getX(),
      y: points[0].getY() + style.scale(10),
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
    group.add(kshape);
    group.visible(true); // dont inherit
    return group;
  }

  /**
   * Get anchors to update a free hand shape.
   *
   * @param {Konva.Line} shape The associated shape.
   * @param {Style} style The application style.
   * @returns {Konva.Ellipse[]} A list of anchors.
   */
  getAnchors(shape, style) {
    const points = shape.points();

    const anchors = [];
    for (let i = 0; i < points.length; i = i + 2) {
      const px = points[i] + shape.x();
      const py = points[i + 1] + shape.y();
      const name = i.toString();
      anchors.push(getDefaultAnchor(
        px, py, name, style
      ));
    }
    return anchors;
  }

  /**
   * Update a FreeHand shape.
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

    // update self
    const point = group.getChildren(function (node) {
      return node.id() === anchor.id();
    })[0];
    point.x(anchor.x());
    point.y(anchor.y());
    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the list)
    const points = kline.points();
    const index = parseInt(anchor.id(), 10);
    points[index] = anchor.x() - kline.x();
    points[index + 1] = anchor.y() - kline.y();
    // concat to make Konva think it is a new array
    kline.points(points.concat());

    // update text
    const ktext = klabel.getText();
    // @ts-expect-error
    const meta = ktext.meta;
    ktext.setText(meta.textExpr);
    // update position
    const textPos = {
      x: points[0] + kline.x(),
      y: points[1] + kline.y() + style.scale(10)
    };
    klabel.position(textPos);
  }

} // class FreeHandFactory
