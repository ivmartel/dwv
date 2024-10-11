// external
import Konva from 'konva';

// doc imports
/* eslint-disable no-unused-vars */
import {Point2D} from '../math/point';
import {Style} from '../gui/style';
import {Annotation} from '../image/annotation';
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