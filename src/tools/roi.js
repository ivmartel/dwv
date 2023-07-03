import {ROI} from '../math/roi';
import {defaults} from '../app/defaults';
import {getDefaultAnchor} from './editor';
// external
import Konva from 'konva';

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
   * @param {object} group The group to test.
   * @returns {boolean} True if the group is from this fcatory.
   */
  isFactoryGroup(group) {
    return this.getGroupName() === group.name();
  }

  /**
   * Create a roi shape to be displayed.
   *
   * @param {Array} points The points from which to extract the line.
   * @param {object} style The drawing style.
   * @param {object} viewController The associated view controller.
   * @returns {object} The Konva group.
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
    const modality = viewController.getModality();
    if (typeof defaults.labelText.roi[modality] !== 'undefined') {
      textExpr = defaults.labelText.roi[modality];
    } else {
      textExpr = defaults.labelText.roi['*'];
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
   * @param {object} shape The associated shape.
   * @param {object} style The application style.
   * @returns {Array} A list of anchors.
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
   * @param {object} anchor The active anchor.
   * @param {object} style The app style.
   * @param {object} _viewController The associated view controller.
   */
  update(anchor, style, _viewController) {
    // parent group
    const group = anchor.getParent();
    // associated shape
    const kroi = group.getChildren(function (node) {
      return node.name() === 'shape';
    })[0];
      // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];

    // update self
    const point = group.getChildren(function (node) {
      return node.id() === anchor.id();
    })[0];
    point.x(anchor.x());
    point.y(anchor.y());
    // update the roi point and compensate for possible drag
    // (the anchor id is the index of the point in the list)
    const points = kroi.points();
    points[anchor.id()] = anchor.x() - kroi.x();
    points[anchor.id() + 1] = anchor.y() - kroi.y();
    kroi.points(points);

    // update text
    const ktext = klabel.getText();
    ktext.setText(ktext.meta.textExpr);
    // update position
    const textPos = {
      x: points[0] + kroi.x(),
      y: points[1] + kroi.y() + style.scale(10)
    };
    klabel.position(textPos);
  }

} // class RoiFactory
