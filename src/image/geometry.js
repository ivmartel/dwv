import {
  getIdentityMat33,
  REAL_WORLD_EPSILON
} from '../math/matrix';
import {Point3D, Point} from '../math/point';
import {Vector3D} from '../math/vector';
import {Index} from '../math/index';
import {getBasicStats} from '../math/stats';
import {precisionRound} from '../utils/string';
import {logger} from '../utils/logger';
import {Size} from './size';
import {Spacing} from './spacing';

// doc imports
/* eslint-disable no-unused-vars */
import {Matrix33} from '../math/matrix';
/* eslint-enable no-unused-vars */

/**
 * 2D/3D Geometry class.
 */
export class Geometry {

  /**
   * Array of origins.
   *
   * @type {Point3D[]}
   */
  #origins;

  /**
   * Data size.
   *
   * @type {Size}
   */
  #size;

  /**
   * Data spacing.
   *
   * @type {Spacing}
   */
  #spacing;

  /**
   * Local helper object for time points.
   *
   * @type {Object<string, Point3D[]>}
   */
  #timeOrigins = {};

  /**
   * Initial time index.
   *
   * @type {number}
   */
  #initialTime;

  /**
   * Data orientation.
   *
   * @type {Matrix33}
   */
  #orientation = getIdentityMat33();

  /**
   * Flag to know if new origins were added.
   *
   * @type {boolean}
   */
  #newOrigins = false;

  /**
   * @param {Point3D} origin The object origin (a 3D point).
   * @param {Size} size The object size.
   * @param {Spacing} spacing The object spacing.
   * @param {Matrix33} [orientation] The object orientation (3*3 matrix,
   *   default to 3*3 identity).
   * @param {number} [time] Optional time index.
   */
  constructor(origin, size, spacing, orientation, time) {
    this.#origins = [origin];
    this.#size = size;
    this.#spacing = spacing;
    if (typeof time !== 'undefined') {
      this.#initialTime = time;
      this.#timeOrigins[time] = [origin];
    }
    // check input orientation
    if (typeof orientation !== 'undefined') {
      this.#orientation = orientation;
    }
  }

  /**
   * Get the time value that was passed at construction.
   *
   * @returns {number} The time value.
   */
  getInitialTime() {
    return this.#initialTime;
  }

  /**
   * Get the total number of slices.
   * Can be different from what is stored in the size object
   *  during a volume with time points creation process.
   *
   * @returns {number} The total count.
   */
  getCurrentTotalNumberOfSlices() {
    const keys = Object.keys(this.#timeOrigins);
    if (keys.length === 0) {
      return this.#origins.length;
    }
    let count = 0;
    for (let i = 0; i < keys.length; ++i) {
      count += this.#timeOrigins[keys[i]].length;
    }
    return count;
  }

  /**
   * Check if a time point has associated slices.
   *
   * @param {number} time The time point to check.
   * @returns {boolean} True if slices are present.
   */
  hasSlicesAtTime(time) {
    return typeof this.#timeOrigins[time] !== 'undefined';
  }

  /**
   * Get the number of slices stored for time points preceding
   * the input one.
   *
   * @param {number} time The time point to check.
   * @returns {number|undefined} The count.
   */
  getCurrentNumberOfSlicesBeforeTime(time) {
    const keys = Object.keys(this.#timeOrigins);
    if (keys.length === 0) {
      return undefined;
    }
    let count = 0;
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      if (parseInt(key, 10) === time) {
        break;
      }
      count += this.#timeOrigins[key].length;
    }
    return count;
  }

  /**
   * Get the object origin.
   * This should be the lowest origin to ease calculations (?).
   *
   * @returns {Point3D} The object origin.
   */
  getOrigin() {
    return this.#origins[0];
  }

  /**
   * Get the object origins.
   *
   * @returns {Point3D[]} The object origins.
   */
  getOrigins() {
    return this.#origins;
  }

  /**
   * Check if a point is in the origin list.
   *
   * @param {Point3D} point3D The point to check.
   * @param {number} tol The comparison tolerance
   *   default to Number.EPSILON.
   * @returns {boolean} True if in list.
   */
  includesOrigin(point3D, tol) {
    for (let i = 0; i < this.#origins.length; ++i) {
      if (this.#origins[i].isSimilar(point3D, tol)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the object size.
   * Warning: the size comes as stored in DICOM, meaning that it could
   * be oriented.
   *
   * @param {Matrix33} [viewOrientation] The view orientation (optional).
   * @returns {Size} The object size.
   */
  getSize(viewOrientation) {
    let res = this.#size;
    if (viewOrientation && typeof viewOrientation !== 'undefined') {
      let values = getOrientedArray3D(
        [
          this.#size.get(0),
          this.#size.get(1),
          this.#size.get(2)
        ],
        viewOrientation);
      values = values.map(Math.abs);
      res = new Size(values.concat(this.#size.getValues().slice(3)));
    }
    return res;
  }

  /**
   * Calculate slice spacing from origins and replace current
   *   if needed.
   */
  #updateSliceSpacing() {
    const geoSliceSpacing = getSliceGeometrySpacing(this.#origins);
    // update local if needed
    if (typeof geoSliceSpacing !== 'undefined' &&
      this.#spacing.get(2) !== geoSliceSpacing) {
      logger.trace('Using geometric spacing ' + geoSliceSpacing +
        ' instead of tag spacing ' + this.#spacing.get(2));
      const values = this.#spacing.getValues();
      values[2] = geoSliceSpacing;
      this.#spacing = new Spacing(values);
    }
  }

  /**
   * Get the object spacing.
   * Warning: the spacing comes as stored in DICOM, meaning that it could
   * be oriented.
   *
   * @param {Matrix33} [viewOrientation] The view orientation (optional).
   * @returns {Spacing} The object spacing.
   */
  getSpacing(viewOrientation) {
    // update slice spacing after appendSlice
    if (this.#newOrigins) {
      this.#updateSliceSpacing();
      this.#newOrigins = false;
    }
    let res = this.#spacing;
    if (viewOrientation && typeof viewOrientation !== 'undefined') {
      let orientedValues = getOrientedArray3D(
        [
          this.#spacing.get(0),
          this.#spacing.get(1),
          this.#spacing.get(2)
        ],
        viewOrientation);
      orientedValues = orientedValues.map(Math.abs);
      res = new Spacing(orientedValues);
    }
    return res;
  }

  /**
   * Get the image spacing in real world.
   *
   * @returns {Spacing} The object spacing.
   */
  getRealSpacing() {
    // asOneAndZeros to not change spacing values...
    return this.getSpacing(
      this.#orientation.getInverse().asOneAndZeros()
    );
  }

  /**
   * Get the object orientation.
   *
   * @returns {Matrix33} The object orientation.
   */
  getOrientation() {
    return this.#orientation;
  }

  /**
   * Get the slice position of a point in the current slice layout.
   * Slice indices increase with decreasing origins (high index -> low origin),
   * this simplified the handling of reconstruction since it means
   * the displayed data is in the same 'direction' as the extracted data.
   * As seen in the getOrigin method, the main origin is the lowest one.
   * This implies that the index to world and reverse method do some flipping
   * magic...
   *
   * @param {Point3D} point The point to evaluate.
   * @param {number} time Optional time index.
   * @returns {number} The slice index.
   */
  getSliceIndex(point, time) {
    // cannot use this.worldToIndex(point).getK() since
    // we cannot guaranty consecutive slices...

    let localOrigins = this.#origins;
    if (typeof time !== 'undefined') {
      localOrigins = this.#timeOrigins[time];
    }

    // find the closest origin
    const closestOriginIndex = point.getClosest(localOrigins);
    const closestOrigin = localOrigins[closestOriginIndex];

    // direction between the input point and the closest origin
    const pointDir = point.minus(closestOrigin);

    // use third orientation matrix column as plane normal vector
    const normal = new Vector3D(
      this.#orientation.get(0, 2),
      this.#orientation.get(1, 2),
      this.#orientation.get(2, 2)
    );

    // codirectional vectors: above slice index
    // oposite vectors: below slice index
    const isCodirectional = normal.isCodirectional(pointDir);
    const sliceIndex = isCodirectional
      ? closestOriginIndex + 1 : closestOriginIndex;

    return sliceIndex;
  }

  /**
   * Append an origin to the geometry.
   *
   * @param {Point3D} origin The origin to append.
   * @param {number} index The index at which to append.
   * @param {number} [time] Optional time index.
   */
  appendOrigin(origin, index, time) {
    // equal callback
    const equalToOrigin = function (element) {
      return element.equals(origin);
    };
    if (typeof time !== 'undefined') {
      // check if not already in list
      const found = this.#timeOrigins[time].find(equalToOrigin);
      if (typeof found !== 'undefined') {
        throw new Error('Cannot append same time origin twice');
      }
      // add in origin array
      this.#timeOrigins[time].splice(index, 0, origin);
    }
    if (typeof time === 'undefined' || time === this.#initialTime) {
      // check if not already in list
      const found = this.#origins.find(equalToOrigin);
      if (typeof found !== 'undefined') {
        throw new Error('Cannot append same origin twice');
      }
      // update flag
      this.#newOrigins = true;
      // add in origin array
      this.#origins.splice(index, 0, origin);
      // increment second dimension
      const values = this.#size.getValues();
      values[2] += 1;
      this.#size = new Size(values);
    }
  }

  /**
   * Append a frame to the geometry.
   *
   * @param {Point3D} origin The origin to append.
   * @param {number} time Optional time index.
   */
  appendFrame(origin, time) {
    // add origin to list
    this.#timeOrigins[time] = [origin];
    // increment third dimension
    const sizeValues = this.#size.getValues();
    const spacingValues = this.#spacing.getValues();
    if (sizeValues.length === 4) {
      sizeValues[3] += 1;
    } else {
      sizeValues.push(2);
      spacingValues.push(1);
    }
    this.#size = new Size(sizeValues);
    this.#spacing = new Spacing(spacingValues);
  }

  /**
   * Get a string representation of the geometry.
   *
   * @returns {string} The geometry as a string.
   */
  toString() {
    return 'Origin: ' + this.getOrigin() +
      ', Size: ' + this.getSize() +
      ', Spacing: ' + this.getSpacing() +
      ', Orientation: ' + this.getOrientation();
  }

  /**
   * Check for equality.
   *
   * @param {Geometry} rhs The object to compare to.
   * @returns {boolean} True if both objects are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      this.getOrigin().equals(rhs.getOrigin()) &&
      this.getSize().equals(rhs.getSize()) &&
      this.getSpacing().equals(rhs.getSpacing());
  }

  /**
   * Check that a point is within bounds.
   *
   * @param {Point} point The point to check.
   * @returns {boolean} True if the given coordinates are within bounds.
   */
  isInBounds(point) {
    return this.isIndexInBounds(this.worldToIndex(point));
  }

  /**
   * Check that a index is within bounds.
   *
   * @param {Index} index The index to check.
   * @param {number[]} [dirs] Optional list of directions to check.
   * @returns {boolean} True if the given coordinates are within bounds.
   */
  isIndexInBounds(index, dirs) {
    return this.getSize().isInBounds(index, dirs);
  }

  /**
   * Convert an index into world coordinates.
   *
   * @param {Index} index The index to convert.
   * @returns {Point} The corresponding point.
   */
  indexToWorld(index) {
    // apply spacing
    // (spacing is oriented, apply before orientation)
    const spacing = this.getSpacing();
    const orientedPoint3D = new Point3D(
      index.get(0) * spacing.get(0),
      index.get(1) * spacing.get(1),
      index.get(2) * spacing.get(2)
    );
    // de-orient
    const point3D = this.getOrientation().multiplyPoint3D(orientedPoint3D);
    // keep >3d values
    const values = index.getValues();
    const origin = this.getOrigin();
    values[0] = origin.getX() + point3D.getX();
    values[1] = origin.getY() + point3D.getY();
    values[2] = origin.getZ() + point3D.getZ();
    // return point
    return new Point(values);
  }

  /**
   * Convert a 3D point into world coordinates.
   *
   * @param {Point3D} point The 3D point to convert.
   * @returns {Point3D} The corresponding world 3D point.
   */
  pointToWorld(point) {
    // apply spacing
    // (spacing is oriented, apply before orientation)
    const spacing = this.getSpacing();
    const orientedPoint3D = new Point3D(
      point.getX() * spacing.get(0),
      point.getY() * spacing.get(1),
      point.getZ() * spacing.get(2)
    );
    // de-orient
    const point3D = this.getOrientation().multiplyPoint3D(orientedPoint3D);
    // return point3D
    const origin = this.getOrigin();
    return new Point3D(
      origin.getX() + point3D.getX(),
      origin.getY() + point3D.getY(),
      origin.getZ() + point3D.getZ()
    );
  }

  /**
   * Convert world coordinates into an index.
   *
   * @param {Point} point The point to convert.
   * @returns {Index} The corresponding index.
   */
  worldToIndex(point) {
    // compensate for origin
    // (origin is not oriented, compensate before orientation)
    // TODO: use slice origin...
    const origin = this.getOrigin();
    const point3D = new Point3D(
      point.get(0) - origin.getX(),
      point.get(1) - origin.getY(),
      point.get(2) - origin.getZ()
    );
    // orient
    const orientedPoint3D =
      this.getOrientation().getInverse().multiplyPoint3D(point3D);
    // keep >3d values
    const values = point.getValues();
    // apply spacing and round
    const spacing = this.getSpacing();
    values[0] = Math.round(orientedPoint3D.getX() / spacing.get(0));
    values[1] = Math.round(orientedPoint3D.getY() / spacing.get(1));
    values[2] = Math.round(orientedPoint3D.getZ() / spacing.get(2));

    // return index
    return new Index(values);
  }

  /**
   * Convert world coordinates into an point.
   *
   * @param {Point} point The world point to convert.
   * @returns {Point3D} The corresponding point.
   */
  worldToPoint(point) {
    // compensate for origin
    // (origin is not oriented, compensate before orientation)
    const origin = this.getOrigin();
    const point3D = new Point3D(
      point.get(0) - origin.getX(),
      point.get(1) - origin.getY(),
      point.get(2) - origin.getZ()
    );
    // orient
    const orientedPoint3D =
      this.getOrientation().getInverse().multiplyPoint3D(point3D);
    // keep >3d values
    const values = point.getValues();
    // apply spacing and round
    const spacing = this.getSpacing();
    values[0] = orientedPoint3D.getX() / spacing.get(0);
    values[1] = orientedPoint3D.getY() / spacing.get(1);
    values[2] = orientedPoint3D.getZ() / spacing.get(2);

    // return index
    return new Point3D(values[0], values[1], values[2]);
  }

} // class Geometry

/**
 * Get the oriented values of an input 3D array.
 *
 * @param {number[]} array3D The 3D array.
 * @param {Matrix33} orientation The orientation 3D matrix.
 * @returns {number[]} The values reordered according to the orientation.
 */
export function getOrientedArray3D(array3D, orientation) {
  // values = orientation * orientedValues
  // -> inv(orientation) * values = orientedValues
  return orientation.getInverse().multiplyArray3D(array3D);
}

/**
 * Get the raw values of an oriented input 3D array.
 *
 * @param {number[]} array3D The 3D array.
 * @param {Matrix33} orientation The orientation 3D matrix.
 * @returns {number[]} The values reordered to compensate the orientation.
 */
export function getDeOrientedArray3D(array3D, orientation) {
  // values = orientation * orientedValues
  return orientation.multiplyArray3D(array3D);
}

/**
 * Get the slice spacing from the difference in the Z directions
 * of input origins.
 *
 * @param {Point3D[]} origins An array of Point3D.
 * @returns {number|undefined} The spacing.
 */
export function getSliceGeometrySpacing(origins) {
  // check origins
  if (origins.length <= 1) {
    return;
  }

  const spacings = [];
  for (let i = 0; i < origins.length - 1; ++i) {
    const origin1 = origins[i];
    const origin2 = origins[i + 1];
    const sliceSpacing = origin1.getDistance(origin2);
    if (sliceSpacing === 0) {
      throw new Error('Zero slice spacing ' +
        origin1.toString() + ' ' + origin2.toString());
    }
    spacings.push(sliceSpacing);
  }

  // use rounded mean value as spacing
  const stats = getBasicStats(spacings);
  const spacing = precisionRound(stats.mean, 4);

  // warn if non constant
  if (stats.stdDev > REAL_WORLD_EPSILON) {
    logger.warn('Varying slice spacing, value: ' + spacing +
      ' (mean: ' + stats.mean +
      ', min: ' + stats.min +
      ', max: ' + stats.max +
      ', stdDev: ' + stats.stdDev + ')');
  }

  return spacing;
}
