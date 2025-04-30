// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {Point2D} from '../math/point.js';
import {Style} from '../gui/style.js';
import {Annotation} from '../image/annotation.js';
/* eslint-enable no-unused-vars */

/**
 * Label factory to create and update shape label.
 */
export class LabelFactory {

  /**
   * Default position getter.
   *
   * @type {Function}
   */
  #defaultPositionGetter;

  /**
   * @param {Function} positionGetter Default position getter.
   */
  constructor(positionGetter) {
    this.#defaultPositionGetter = positionGetter;
  }

  /**
   * Get the annotation label position.
   *
   * @param {Annotation} annotation The annotation.
   * @returns {Point2D} The position.
   */
  getPosition(annotation) {
    let position = annotation.labelPosition;
    if (typeof position === 'undefined') {
      position = this.#defaultPositionGetter(annotation);
    }
    return position;
  }

  /**
   * Creates the konva label.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Style} style The drawing style.
   * @returns {Konva.Label} The Konva label.
   */
  create(annotation, style) {
    // konva text
    const ktext = new Konva.Text({
      fontSize: style.getFontSize(),
      fontFamily: style.getFontFamily(),
      fill: annotation.colour,
      padding: style.getTextPadding(),
      shadowColor: style.getShadowLineColour(),
      shadowOffset: style.getShadowOffset(),
      name: 'text'
    });
    const labelText = annotation.getText();
    ktext.setText(labelText);

    // times 2 so that the font size 10 looks like a 10...
    // (same logic as in the DrawController::updateLabelScale)
    const zoomScale = style.applyZoomScale(1);
    const labelScale = {
      x: 2 * zoomScale.x,
      y: 2 * zoomScale.y
    };

    // konva label
    const labelPosition = this.getPosition(annotation);
    const klabel = new Konva.Label({
      x: labelPosition.getX(),
      y: labelPosition.getY(),
      scale: labelScale,
      visible: labelText.length !== 0,
      name: 'label'
    });
    klabel.add(ktext);
    klabel.add(new Konva.Tag({
      fill: annotation.colour,
      opacity: style.getTagOpacity()
    }));

    return klabel;
  }

  /**
   * Update the shape label position.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Konva.Group} group The shape group.
   */
  updatePosition(annotation, group) {
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
    if (!(klabel instanceof Konva.Label)) {
      return;
    }
    // update position
    const labelPosition = this.getPosition(annotation);
    klabel.position({
      x: labelPosition.getX(),
      y: labelPosition.getY()
    });
  }

  /**
   * Get the anchors positions for the label.
   *
   * @param {Konva.Label} label The label.
   * @returns {Point2D[]} The connectors positions.
   */
  getLabelAnchorsPosition(label) {
    const lx = label.x();
    const ly = label.y();
    const dx = label.width() * label.scale().x;
    const dy = label.height() * label.scale().y;
    return [
      new Point2D(lx + dx / 2, ly),
      new Point2D(lx, ly + dy / 2),
      new Point2D(lx + dx / 2, ly + dy),
      new Point2D(lx + dx, ly + dy / 2),
    ];
  }

  /**
   * Get the two closest points of two points lists.
   *
   * @param {Point2D[]} points1 The first point list.
   * @param {Point2D[]} points2 The second point list.
   * @returns {Point2D[]} The closests points.
   */
  getClosestPoints(points1, points2) {
    let minDist = points1[0].getDistance(points2[0]);
    let p1 = points1[0];
    let p2 = points2[0];
    for (const point1 of points1) {
      for (const point2 of points2) {
        const dist = point1.getDistance(point2);
        if (dist < minDist) {
          minDist = dist;
          p1 = point1;
          p2 = point2;
        }
      }
    }
    return [p1, p2];
  }

  /**
   * Get the connector between this label and its shape.
   *
   * @param {Point2D[]} connectorsPos The shape connectors positions.
   * @param {Konva.Label} label The label.
   * @param {Style} style The drawing style.
   * @returns {Konva.Line} The connector.
   */
  getConnector(connectorsPos, label, style) {
    const labelAnchorsPos = this.getLabelAnchorsPosition(label);
    const anchorPoints = this.getClosestPoints(
      connectorsPos, labelAnchorsPos);
    return new Konva.Line({
      points: [
        anchorPoints[0].getX(),
        anchorPoints[0].getY(),
        anchorPoints[1].getX(),
        anchorPoints[1].getY()
      ],
      stroke: label.getText().fill(),
      strokeWidth: style.getStrokeWidth(),
      strokeScaleEnabled: false,
      visible: label.visible(),
      dash: [10, 7],
      name: 'connector'
    });
  }

  /**
   * Update the connector between a label and its shape.
   *
   * @param {Konva.Group} group The associated shape group.
   * @param {Point2D[]} connectorsPos The shape connectors positions.
   */
  updateConnector(group, connectorsPos) {
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
    if (!(klabel instanceof Konva.Label)) {
      return;
    }

    const labelAnchorsPos = this.getLabelAnchorsPosition(klabel);

    const anchors = this.getClosestPoints(connectorsPos, labelAnchorsPos);

    const kconnect = group.getChildren(function (node) {
      return node.name() === 'connector';
    })[0];
    if (!(kconnect instanceof Konva.Line)) {
      return;
    }

    kconnect.points([
      anchors[0].getX(),
      anchors[0].getY(),
      anchors[1].getX(),
      anchors[1].getY()
    ]);
  }

  /**
   * Update the shape label.
   *
   * @param {Annotation} annotation The associated annotation.
   * @param {Konva.Group} group The shape group.
   */
  updateContent(annotation, group) {
    // associated label
    const klabel = group.getChildren(function (node) {
      return node.name() === 'label';
    })[0];
    if (!(klabel instanceof Konva.Label)) {
      return;
    }
    // update text
    const text = annotation.getText();
    const ktext = klabel.getText();
    ktext.setText(text);
    // hide if visible and empty
    if (klabel.visible()) {
      klabel.visible(text.length !== 0);
    }
  }

} // LabelFactory