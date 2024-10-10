import {logger} from '../utils/logger';
import {getFlags, replaceFlags} from '../utils/string';
import {Point} from '../math/point';
import {defaultToolOptions, toolOptions} from '../tools/index';

// doc imports
/* eslint-disable no-unused-vars */
import {Point2D, Point3D} from '../math/point';
import {ViewController} from '../app/viewController';
import {PlaneHelper} from './planeHelper';
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
   * Initialise the annotation.
   *
   * @param {ViewController} viewController The associated view controller.
   */
  init(viewController) {
    if (typeof this.referenceSopUID !== 'undefined') {
      logger.debug('Cannot initialise annotation twice');
      return;
    }

    this.#viewController = viewController;
    // set UID
    this.referenceSopUID = viewController.getCurrentImageUid();
    // set plane origin (not saved with file)
    this.planeOrigin =
      viewController.getOriginForImageUid(this.referenceSopUID);
    // set plane points if not aquisition orientation
    // (planePoints are saved with file if present)
    if (!viewController.isAquisitionOrientation()) {
      this.planePoints = viewController.getPlanePoints(
        viewController.getCurrentScrollIndexValue()
      );
    }
  }

  /**
   * Check if an input view is compatible with the annotation.
   *
   * @param {PlaneHelper} planeHelper The input view to check.
   * @returns {boolean} True if compatible view.
   */
  isCompatibleView(planeHelper) {
    let res = false;

    // TODO: add check for referenceSopUID

    if (typeof this.planePoints === 'undefined') {
      // non oriented view
      if (planeHelper.isAquisitionOrientation()) {
        res = true;
      }
    } else {
      // oriented view: compare cosines (independent of slice index)
      const inputPlanePoints = planeHelper.getPlanePoints(0);
      if (inputPlanePoints[1].equals(this.planePoints[1]) &&
        inputPlanePoints[2].equals(this.planePoints[2])) {
        res = true;
      }
    }
    return res;
  }

  /**
   * Set the associated view controller if it is compatible.
   *
   * @param {ViewController} viewController The view controller.
   */
  setViewController(viewController) {
    // check uid
    if (!viewController.includesImageUid(this.referenceSopUID)) {
      return;
    }
    // check if same view
    if (!this.isCompatibleView(viewController.getPlaneHelper())) {
      return;
    }
    this.#viewController = viewController;

    // set plane origin (not saved with file)
    this.planeOrigin =
      viewController.getOriginForImageUid(this.referenceSopUID);
  }

  /**
   * Get the centroid of the math shape.
   *
   * @returns {Point|undefined} The 3D centroid point.
   */
  getCentroid() {
    let res;
    if (typeof this.#viewController !== 'undefined' &&
      typeof this.mathShape.getCentroid !== 'undefined') {
      // find the slice index of the annotation origin
      let origin = this.planeOrigin;
      if (typeof this.planePoints !== 'undefined') {
        origin = this.planePoints[0];
      }
      const originPoint =
        new Point([origin.getX(), origin.getY(), origin.getZ()]);
      const originIndex =
        this.#viewController.getIndexFromPosition(originPoint);
      const scrollIndex = this.#viewController.getScrollIndex();
      const k = originIndex.getValues()[scrollIndex];

      // shape center converted to 3D
      const planePoint = this.mathShape.getCentroid();
      res = this.#viewController.getPositionFromPlanePoint(planePoint, k);
    }
    return res;
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
    if (typeof this.#viewController !== 'undefined' &&
      typeof this.mathShape.quantify !== 'undefined') {
      this.quantification = this.mathShape.quantify(
        this.#viewController,
        getFlags(this.textExpr));
    }
  }

  /**
   * Get the math shape associated draw factory.
   *
   * @returns {object} The factory.
   */
  getFactory() {
    let fac;
    // check in user provided factories
    if (typeof toolOptions.draw !== 'undefined') {
      for (const factoryName in toolOptions.draw) {
        const factory = toolOptions.draw[factoryName];
        if (factory.supports(this.mathShape)) {
          fac = new factory();
          break;
        }
      }
    }
    // check in default factories
    if (typeof fac === 'undefined') {
      for (const factoryName in defaultToolOptions.draw) {
        const factory = defaultToolOptions.draw[factoryName];
        if (factory.supports(this.mathShape)) {
          fac = new factory();
          break;
        }
      }
    }
    if (typeof fac === 'undefined') {
      logger.warn('No shape factory found for math shape');
    }
    return fac;
  }
}
