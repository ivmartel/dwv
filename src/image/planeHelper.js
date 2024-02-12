import {Vector3D} from '../math/vector';
import {Point3D} from '../math/point';
import {getTargetOrientation} from '../gui/layerGroup';
import {getOrientedArray3D, getDeOrientedArray3D} from './geometry';

// doc imports
/* eslint-disable no-unused-vars */
import {Matrix33} from '../math/matrix';
import {Spacing} from './spacing';
import {Scalar2D, Scalar3D} from '../math/scalar';
/* eslint-enable no-unused-vars */

/**
 * Plane geometry helper.
 */
export class PlaneHelper {

  /**
   * The associated spacing.
   *
   * @type {Spacing}
   */
  #spacing;

  /**
   * The image orientation.
   *
   * @type {Matrix33}
   */
  #imageOrientation;

  /**
   * The viewe orientation.
   *
   * @type {Matrix33}
   */
  #viewOrientation;

  /**
   * The target orientation.
   *
   * @type {Matrix33}
   */
  #targetOrientation;

  /**
   * @param {Spacing} spacing The spacing.
   * @param {Matrix33} imageOrientation The image oientation.
   * @param {Matrix33} viewOrientation The view orientation.
   */
  constructor(spacing, imageOrientation, viewOrientation) {
    this.#spacing = spacing;
    this.#imageOrientation = imageOrientation;
    this.#viewOrientation = viewOrientation;

    this.#targetOrientation = getTargetOrientation(
      imageOrientation, viewOrientation);
  }

  /**
   * Get a 3D offset from a plane one.
   *
   * @param {Scalar2D} offset2D The plane offset as {x,y}.
   * @returns {Vector3D} The 3D world offset.
   */
  getOffset3DFromPlaneOffset(offset2D) {
    // make 3D
    const planeOffset = new Vector3D(
      offset2D.x, offset2D.y, 0);
    // de-orient
    const pixelOffset = this.getTargetDeOrientedVector3D(planeOffset);
    // ~indexToWorld
    return new Vector3D(
      pixelOffset.getX() * this.#spacing.get(0),
      pixelOffset.getY() * this.#spacing.get(1),
      pixelOffset.getZ() * this.#spacing.get(2));
  }

  /**
   * Get a plane offset from a 3D one.
   *
   * @param {Scalar3D} offset3D The 3D offset as {x,y,z}.
   * @returns {Scalar2D} The plane offset as {x,y}.
   */
  getPlaneOffsetFromOffset3D(offset3D) {
    // ~worldToIndex
    const pixelOffset = new Vector3D(
      offset3D.x / this.#spacing.get(0),
      offset3D.y / this.#spacing.get(1),
      offset3D.z / this.#spacing.get(2));
    // orient
    const planeOffset = this.getTargetOrientedVector3D(pixelOffset);
    // make 2D
    return {
      x: planeOffset.getX(),
      y: planeOffset.getY()
    };
  }

  /**
   * Orient an input vector from real to target space.
   *
   * @param {Vector3D} vector The input vector.
   * @returns {Vector3D} The oriented vector.
   */
  getTargetOrientedVector3D(vector) {
    let planeVector = vector;
    if (typeof this.#targetOrientation !== 'undefined') {
      planeVector =
        this.#targetOrientation.getInverse().multiplyVector3D(vector);
    }
    return planeVector;
  }

  /**
   * De-orient an input vector from target to real space.
   *
   * @param {Vector3D} planeVector The input vector.
   * @returns {Vector3D} The de-orienteded vector.
   */
  getTargetDeOrientedVector3D(planeVector) {
    let vector = planeVector;
    if (typeof this.#targetOrientation !== 'undefined') {
      vector = this.#targetOrientation.multiplyVector3D(planeVector);
    }
    return vector;
  }

  /**
   * De-orient an input point from target to real space.
   *
   * @param {Point3D} planePoint The input point.
   * @returns {Point3D} The de-orienteded point.
   */
  getTargetDeOrientedPoint3D(planePoint) {
    let point = planePoint;
    if (typeof this.#targetOrientation !== 'undefined') {
      point = this.#targetOrientation.multiplyPoint3D(planePoint);
    }
    return point;
  }

  /**
   * Orient an input vector from target to image space.
   *
   * @param {Vector3D} planeVector The input vector.
   * @returns {Vector3D} The orienteded vector.
   */
  getImageOrientedVector3D(planeVector) {
    let vector = planeVector;
    if (typeof this.#viewOrientation !== 'undefined') {
      // image oriented => view de-oriented
      const values = getDeOrientedArray3D(
        [
          planeVector.getX(),
          planeVector.getY(),
          planeVector.getZ()
        ],
        this.#viewOrientation);
      vector = new Vector3D(
        values[0],
        values[1],
        values[2]
      );
    }
    return vector;
  }

  /**
   * Orient an input point from target to image space.
   *
   * @param {Point3D} planePoint The input vector.
   * @returns {Point3D} The orienteded vector.
   */
  getImageOrientedPoint3D(planePoint) {
    let point = planePoint;
    if (typeof this.#viewOrientation !== 'undefined') {
      // image oriented => view de-oriented
      const values = getDeOrientedArray3D(
        [
          planePoint.getX(),
          planePoint.getY(),
          planePoint.getZ()
        ],
        this.#viewOrientation);
      point = new Point3D(
        values[0],
        values[1],
        values[2]
      );
    }
    return point;
  }

  /**
   * De-orient an input vector from image to target space.
   *
   * @param {Vector3D} vector The input vector.
   * @returns {Vector3D} The de-orienteded vector.
   */
  getImageDeOrientedVector3D(vector) {
    let planeVector = vector;
    if (typeof this.#viewOrientation !== 'undefined') {
      // image de-oriented => view oriented
      const orientedValues = getOrientedArray3D(
        [
          vector.getX(),
          vector.getY(),
          vector.getZ()
        ],
        this.#viewOrientation);
      planeVector = new Vector3D(
        orientedValues[0],
        orientedValues[1],
        orientedValues[2]
      );
    }
    return planeVector;
  }

  /**
   * De-orient an input point from image to target space.
   *
   * @param {Point3D} point The input point.
   * @returns {Point3D} The de-orienteded point.
   */
  getImageDeOrientedPoint3D(point) {
    let planePoint = point;
    if (typeof this.#viewOrientation !== 'undefined') {
      // image de-oriented => view oriented
      const orientedValues = getOrientedArray3D(
        [
          point.getX(),
          point.getY(),
          point.getZ()
        ],
        this.#viewOrientation);
      planePoint = new Point3D(
        orientedValues[0],
        orientedValues[1],
        orientedValues[2]
      );
    }
    return planePoint;
  }

  /**
   * Reorder values to follow target orientation.
   *
   * @param {Scalar3D} values Values as {x,y,z}.
   * @returns {Scalar3D} Reoriented values as {x,y,z}.
   */
  getTargetOrientedPositiveXYZ(values) {
    const orientedValues = getOrientedArray3D(
      [
        values.x,
        values.y,
        values.z
      ],
      this.#targetOrientation);
    return {
      x: orientedValues[0],
      y: orientedValues[1],
      z: orientedValues[2]
    };
  }

  /**
   * Get the (view) scroll dimension index.
   *
   * @returns {number} The index.
   */
  getScrollIndex() {
    let index = null;
    if (typeof this.#viewOrientation !== 'undefined') {
      index = this.#viewOrientation.getThirdColMajorDirection();
    } else {
      index = 2;
    }
    return index;
  }

  /**
   * Get the native (image) scroll dimension index.
   *
   * @returns {number} The index.
   */
  getNativeScrollIndex() {
    let index = null;
    if (typeof this.#imageOrientation !== 'undefined') {
      index = this.#imageOrientation.getThirdColMajorDirection();
    } else {
      index = 2;
    }
    return index;
  }

} // class PlaneHelper
