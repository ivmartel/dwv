import {ROI} from '../math/roi';
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
   * Create a roi shape to be displayed.
   *
   * @param {Point2D[]} points The points from which to extract the line.
   * @param {Style} style The drawing style.
   * @param {ViewController} [viewController] The associated view controller.
   * @returns {Konva.Group} The Konva group.
   */
  create(points, style, viewController) {
    // physical shape
    const roi = new ROI();
    // add input points to the ROI
    roi.addPoints(points);
    // points stored the Konvajs way
    const arr = [];
    for (let i = 0; i < roi.getLength(); ++i) {
      arr.push(roi.getPoint(i).getX());
      arr.push(roi.getPoint(i).getY());
    }
    // draw shape
    const kshape = new Konva.Line({
      points: arr,
      stroke: style.getLineColour(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      name: 'shape',
      closed: true
    });

    // text
    const ktext = new Konva.Text({
      fontSize: style.getFontSize(),
      fontFamily: style.getFontFamily(),
      fill: style.getLineColour(),
      name: 'text'
    });
    let textExpr = '';
    if (typeof viewController !== 'undefined') {
      const modality = viewController.getModality();
      if (typeof defaults.labelText.roi[modality] !== 'undefined') {
        textExpr = defaults.labelText.roi[modality];
      } else {
        textExpr = defaults.labelText.roi['*'];
      }
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
      x: roi.getPoint(0).getX(),
      y: roi.getPoint(0).getY() + style.scale(10),
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
   * Get anchors to update a roi shape.
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
   * Update a roi shape.
   *
   * @param {Konva.Ellipse} anchor The active anchor.
   * @param {Style} style The app style.
   * @param {ViewController} _viewController The associated view controller.
   */
  update(anchor, style, _viewController) {
    // parent group
    const group = anchor.getParent();
    // associated shape
    const kroi = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
    if (!(kroi instanceof Konva.Line)) {
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
    const points = kroi.points();
    const index = parseInt(anchor.id(), 10);
    points[index] = anchor.x() - kroi.x();
    points[index + 1] = anchor.y() - kroi.y();
    kroi.points(points);

    // update text
    const ktext = klabel.getText();
    // @ts-expect-error
    const meta = ktext.meta;
    ktext.setText(meta.textExpr);
    // update position
    const textPos = {
      x: points[0] + kroi.x(),
      y: points[1] + kroi.y() + style.scale(10)
    };
    klabel.position(textPos);
  }

} // class RoiFactory
