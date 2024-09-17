import {logger} from '../utils/logger';
import {getFlags, replaceFlags} from '../utils/string';
import {CircleFactory} from '../tools/circle';
import {Circle} from '../math/circle';
import {EllipseFactory} from '../tools/ellipse';
import {Ellipse} from '../math/ellipse';
import {RectangleFactory} from '../tools/rectangle';
import {Rectangle} from '../math/rectangle';
import {RulerFactory} from '../tools/ruler';
import {Line} from '../math/line';
import {ArrowFactory} from '../tools/arrow';
import {Point2D} from '../math/point';
import {ProtractorFactory} from '../tools/protractor';
import {Protractor} from '../math/protractor';
import {RoiFactory} from '../tools/roi';
import {ROI} from '../math/roi';

// doc imports
/* eslint-disable no-unused-vars */
import {Point3D} from '../math/point';
import {ViewController} from '../app/viewController';
/* eslint-enable no-unused-vars */

/**
 * Image annotation.
 */
export class Annotation {
  /**
   * The ID.
   *
   * @type {string}
   */
  id;

  /**
   * The reference image SOP UID.
   *
   * @type {string}
   */
  referenceSopUID;

  /**
   * The mathematical shape.
   *
   * @type {object}
   */
  mathShape;

  /**
   * Additional points used to define the annotation.
   *
   * @type {Point2D[]|undefined}
   */
  referencePoints;

  /**
   * The color: for example 'green', '#00ff00' or 'rgb(0,255,0)'.
   *
   * @type {string|undefined}
   */
  colour;

  /**
   * Annotation quantification.
   *
   * @type {object|undefined}
   */
  quantification;

  /**
   * Text expression. Can contain variables surrounded with '{}' that will
   * be extracted from the quantification object.
   *
   * @type {string|undefined}
   */
  textExpr;

  /**
   * Label position. If undefined, the default shape
   *   label position will be used.
   *
   * @type {Point2D|undefined}
   */
  labelPosition;

  /**
   * The plane origin, the 3D position of index [0, 0, k].
   *
   * @type {Point3D|undefined}
   */
  planeOrigin;

  /**
   * A couple of points that help define the annotation plane.
   *
   * @type {Point3D[]|undefined}
   */
  planePoints;

  /**
   * Associated view controller: needed for quantification and label.
   *
   * @type {ViewController|undefined}
   */
  #viewController;

  /**
   * Set the associated view controller.
   *
   * @param {ViewController} viewController The associated view controller.
   */
  setViewController(viewController) {
    this.#viewController = viewController;
    // set UID if empty
    if (typeof this.referenceSopUID === 'undefined') {
      this.referenceSopUID = viewController.getCurrentImageUid();
    }
    // set plane origin if empty
    // (planeOrigin is not saved with file)
    if (typeof this.planeOrigin === 'undefined') {
      this.planeOrigin =
        viewController.getOriginForImageUid(this.referenceSopUID);
    }
    // set plane points if not aquisition orientation and empty
    // (planePoints are saved with file if present)
    if (!viewController.isAquisitionOrientation() &&
      typeof this.planePoints === 'undefined') {
      this.planePoints = viewController.getPlanePoints(
        viewController.getCurrentScrollIndexValue()
      );
    }
  }

  /**
   * Set the annotation text expression.
   *
   * @param {Object.<string, string>} labelText The list of label
   *   texts indexed by modality.
   */
  setTextExpr(labelText) {
    if (typeof this.#viewController !== 'undefined') {
      const modality = this.#viewController.getModality();

      if (typeof labelText[modality] !== 'undefined') {
        this.textExpr = labelText[modality];
      } else {
        this.textExpr = labelText['*'];
      }
    } else {
      logger.warn('Cannot set text expr without a view controller');
    }
  }

  /**
   * Get the annotation label text by applying the
   *   text expression on the current quantification.
   *
   * @returns {string} The resulting text.
   */
  getText() {
    return replaceFlags(this.textExpr, this.quantification);
  }

  /**
   * Update the annotation quantification.
   */
  updateQuantification() {
    if (typeof this.#viewController !== 'undefined') {
      if (typeof this.mathShape.quantify !== 'undefined') {
        this.quantification = this.mathShape.quantify(
          this.#viewController,
          getFlags(this.textExpr));
      }
    } else {
      logger.warn('Cannot update quantification without a view controller');
    }
  }

  /**
   * Get the math shape associated draw factory.
   *
   * @returns {object} The factory.
   */
  getFactory() {
    let fac;
    if (this.mathShape instanceof Point2D) {
      fac = new ArrowFactory();
    } else if (this.mathShape instanceof Line) {
      fac = new RulerFactory();
    } else if (this.mathShape instanceof Protractor) {
      fac = new ProtractorFactory();
    } else if (this.mathShape instanceof ROI) {
      fac = new RoiFactory();
    } else if (this.mathShape instanceof Circle) {
      fac = new CircleFactory();
    } else if (this.mathShape instanceof Ellipse) {
      fac = new EllipseFactory();
    } else if (this.mathShape instanceof Rectangle) {
      fac = new RectangleFactory();
    }

    return fac;
  }

  /**
   * Get the string type of this annotation.
   *
   * @returns {string} The type.
   */
  getType() {
    let res;
    if (this.mathShape instanceof Point2D) {
      res = 'arrow';
    } else if (this.mathShape instanceof Line) {
      res = 'ruler';
    } else if (this.mathShape instanceof Protractor) {
      res = 'protractor';
    } else if (this.mathShape instanceof ROI) {
      res = 'roi';
    } else if (this.mathShape instanceof Circle) {
      res = 'circle';
    } else if (this.mathShape instanceof Ellipse) {
      res = 'ellipse';
    } else if (this.mathShape instanceof Rectangle) {
      res = 'rectangle';
    }
    return res;
  }
}
