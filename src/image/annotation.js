import {logger} from '../utils/logger.js';
import {getFlags, replaceFlags} from '../utils/string.js';
import {Point} from '../math/point.js';
import {getOrientationName} from '../math/orientation.js';
import {defaultToolOptions, toolOptions} from '../tools/index.js';
import {guid} from '../math/stats.js';
import {getUID} from '../dicom/dicomWriter.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Point2D, Point3D} from '../math/point.js';
import {Index} from '../math/index.js';
import {ViewController} from '../app/viewController.js';
import {PlaneHelper} from './planeHelper.js';
import {DicomCode} from '../dicom/dicomCode.js';
/* eslint-enable no-unused-vars */

/**
 * Image annotation.
 */
export class Annotation {
  /**
   * Tracking id, unique within domain.
   *
   * @type {string}
   */
  trackingId;

  /**
   * Tracking Unique id.
   *
   * @type {string}
   */
  trackingUid;

  /**
   * Referenced image SOP isntance UID.
   *
   * @type {string}
   */
  referencedSopInstanceUID;

  /**
   * Referenced image SOP class UID.
   *
   * @type {string}
   */
  referencedSopClassUID;

  /**
   * Referenced frame number.
   *
   * @type {number|undefined}
   */
  referencedFrameNumber;

  /**
   * Mathematical shape.
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
   * Colour: for example 'green', '#00ff00' or 'rgb(0,255,0)'.
   *
   * @type {string}
   */
  colour = '#ffff80';

  /**
   * Annotation quantification.
   *
   * @type {object|undefined}
   */
  quantification;

  /**
   * Text expression. Can contain variables surrounded with '{}' that will
   *   be extracted from the quantification object.
   *
   * @type {string}
   */
  textExpr = '';

  /**
   * Label position. If undefined, the default shape
   *   label position will be used.
   *
   * @type {Point2D|undefined}
   */
  labelPosition;

  /**
   * Plane origin: 3D position of index [0, 0, k].
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
   * Annotation meta data. Array of {concept:DicomCode, value:DicomCode}
   *   or {concept:DicomCode, value:string}.
   *
   * @type {object}
   */
  #meta = {};

  /**
   * Constructor: set default annotation id and uid.
   */
  constructor() {
    this.trackingId = guid();
    this.trackingUid = getUID('TrackingUniqueIdentifier');
  }

  /**
   * Get the concepts ids of the annotation meta data.
   *
   * @returns {string[]} The ids.
   */
  getMetaConceptIds() {
    return Object.keys(this.#meta);
  }

  /**
   * Get an annotation meta data.
   *
   * @param {string} conceptId The value of the concept dicom code.
   * @returns {object|undefined} The corresponding meta data item
   *   as {concept, value} or undefined.
   */
  getMetaItem(conceptId) {
    return this.#meta[conceptId];
  }

  /**
   * Add annotation meta data.
   *
   * @param {DicomCode} concept The concept code.
   * @param {DicomCode|string} value The value code.
   */
  addMetaItem(concept, value) {
    const conceptId = concept.value;
    if (typeof this.#meta[conceptId] !== 'undefined') {
      logger.warn('Overwriting annotation meta with id=' + conceptId);
    }
    this.#meta[concept.value] = {
      concept: concept,
      value: value
    };
  }

  /**
   * Remove an annotation meta data.
   *
   * @param {string} conceptId The value of the concept dicom code.
   */
  removeMetaItem(conceptId) {
    if (typeof this.#meta[conceptId] !== 'undefined') {
      delete this.#meta[conceptId];
    }
  }

  /**
   * Get the orientation name for this annotation.
   *
   * @returns {string|undefined} The orientation name,
   *   undefined if same as reference data.
   */
  getOrientationName() {
    let res;
    if (typeof this.planePoints !== 'undefined') {
      const cosines = this.planePoints[1].getValues().concat(
        this.planePoints[2].getValues()
      );
      res = getOrientationName(cosines);
    }
    return res;
  }

  /**
   * Initialise the annotation.
   *
   * @param {ViewController} viewController The associated view controller.
   */
  init(viewController) {
    if (typeof this.referencedSopInstanceUID !== 'undefined') {
      logger.debug('Cannot initialise annotation twice');
      return;
    }

    this.#viewController = viewController;
    const currentPosition = viewController.getCurrentPosition();
    // set UID
    this.referencedSopInstanceUID = viewController.getCurrentImageUid();
    this.referencedSopClassUID = viewController.getSopClassUid();
    if (currentPosition.length() > 3) {
      this.referencedFrameNumber = currentPosition.get(3);
    }
    // set plane origin (not saved with file)
    this.planeOrigin =
      viewController.getOriginForImageUid(this.referencedSopInstanceUID);
    // set plane points if not aquisition orientation
    // (planePoints are saved with file if present)
    if (!viewController.isAquisitionOrientation()) {
      this.planePoints = viewController.getPlanePoints(currentPosition);
    }
  }

  /**
   * Check if the annotation can be displayed: true if it has
   * an associated view controller.
   *
   * @returns {boolean} True if the annotation can be displayed.
   */
  canView() {
    return typeof this.#viewController !== 'undefined';
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
      const cosines = planeHelper.getCosines();
      const cosine1 = new Point3D(cosines[0], cosines[1], cosines[2]);
      const cosine2 = new Point3D(cosines[3], cosines[4], cosines[5]);

      if (cosine1.equals(this.planePoints[1]) &&
        cosine2.equals(this.planePoints[2])) {
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
    if (!viewController.includesImageUid(this.referencedSopInstanceUID)) {
      logger.warn('Cannot view annotation with reference UID: ' +
        this.referencedSopInstanceUID);
      return;
    }
    // check if same view
    if (!this.isCompatibleView(viewController.getPlaneHelper())) {
      return;
    }
    this.#viewController = viewController;

    // set plane origin (not saved with file)
    this.planeOrigin =
      viewController.getOriginForImageUid(this.referencedSopInstanceUID);
  }

  /**
   * Get the index of the plane origin.
   *
   * @returns {Index|undefined} The index.
   */
  #getOriginIndex() {
    let res;
    if (typeof this.#viewController !== 'undefined') {
      let origin = this.planeOrigin;
      if (typeof this.planePoints !== 'undefined') {
        origin = this.planePoints[0];
      }
      const values = [origin.getX(), origin.getY(), origin.getZ()];
      if (typeof this.referencedFrameNumber !== 'undefined') {
        values.push(this.referencedFrameNumber);
      }
      const originPoint = new Point(values);
      res = this.#viewController.getIndexFromPosition(originPoint);
    }
    return res;
  }

  /**
   * Get the centroid of the math shape.
   *
   * @returns {Point|undefined} The 3D centroid point.
   */
  getCentroid() {
    let res;
    if (typeof this.#viewController !== 'undefined' &&
      typeof this.mathShape.getCentroid !== 'undefined' &&
      typeof this.mathShape.getCentroid() !== 'undefined') {
      // find the slice index of the annotation origin
      const originIndex = this.#getOriginIndex();
      const scrollDimIndex = this.#viewController.getScrollDimIndex();
      const k = originIndex.getValues()[scrollDimIndex];
      // shape center converted to 3D
      const planePoint = this.mathShape.getCentroid();
      res = this.#viewController.getPositionFromPlanePoint(planePoint, k);
      // add frame number if defined
      if (typeof this.referencedFrameNumber !== 'undefined') {
        const values = res.getValues();
        values[3] = this.referencedFrameNumber;
        res = new Point(values);
      }
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
        this.#getOriginIndex(),
        getFlags(this.textExpr)
      );
    }
  }

  /**
   * Get the math shape associated draw factory.
   *
   * @returns {object|undefined} The factory.
   */
  getFactory() {
    let fac;
    // no factory if no mathShape
    if (typeof this.mathShape === 'undefined') {
      return fac;
    }
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
