import {
  REAL_WORLD_EPSILON,
  REAL_WORLD_EXPONENT,
  precisionRound
} from '../math/number.js';
import {getIdentityMat33} from '../math/matrix.js';
import {Point3D, Point} from '../math/point.js';
import {Vector3D} from '../math/vector.js';
import {Index} from '../math/index.js';
import {getBasicStats} from '../math/stats.js';
import {logger} from '../utils/logger.js';
import {Size} from './size.js';
import {Spacing} from './spacing.js';
import {BooleanResult} from '../utils/result.js';
import {arrayMap} from '../utils/array.js';
import {Matrix33} from '../math/matrix.js';

// direction epsilon, when comparing orientations (for example
// of slices of the same series or of an image and its segmentation):
// Image Orientation (Patient) is a DS that can be written with only
// 5 decimals, leading to rounding differences of 1e-5
export const DIRECTION_EPSILON = 1e-4;

// number of spatial dimensions
export const SPATIAL_DIMS = 3;
// volume dimension index
export const VOLUME_DIM_INDEX = SPATIAL_DIMS;

/**
 * @import {SourcedNumberValue} from '../math/types.js';
 * @import {VolumeId} from './types.js';
 */

/**
 * @callback comparePointFn
 * @param {Point3D} a The first point.
 * @param {Point3D} b The first point.
 * @returns {number} >0 to sort a after b, <0 to sort a before b,
 *   0 to not change order.
 */

/**
 * Get a point compare function using Z coordinate difference.
 * Compares de-oriented points using the input orientation inverse.
 *
 * @param {Matrix33} orientation The orientation matrix.
 * @returns {comparePointFn} The point compare function.
 */
export function getComparePoint3D(orientation) {
  const invOrientation = orientation.getInverse();
  return function (point1, point2) {
    const p1 = invOrientation.multiplyPoint3D(point1);
    const p2 = invOrientation.multiplyPoint3D(point2);
    return p1.getZ() - p2.getZ();
  };
}

/**
 * Get the closest of a list of origins to an input point, and the
 * signed residual between the point and that origin, projected onto
 * the slice-stacking direction (the orientation's 3rd column, ie its
 * normal). A positive residual means the point is 'ahead of' (in the
 * codirectional sense) the closest origin along that direction, a
 * negative (or zero) residual means it is 'at or behind' it.
 *
 * @param {Point3D} point3D The point to locate.
 * @param {Point3D[]} origins The origins to search.
 * @param {Matrix33} orientation The geometry orientation.
 * @returns {{index: number, normalResidual: number}} The closest
 *   origin's index in the input list and the normal-projected
 *   residual to it.
 */
function getClosestOriginResidual(point3D, origins, orientation) {
  const index = point3D.getClosest(origins);
  const normal = new Vector3D(
    orientation.get(0, 2),
    orientation.get(1, 2),
    orientation.get(2, 2)
  );
  const normalResidual = point3D.minus(origins[index]).dotProduct(normal);
  return {index, normalResidual};
}

/**
 * Sorted volume ids and the values derived from them.
 *
 * @typedef {object} VolumeIdsData
 * @property {VolumeId[]} volumeIds The volume ids, sorted by id.
 * @property {number[]} values The sorted ids.
 * @property {number} tolerance The id matching tolerance: half the
 *   smallest gap between ids (0.5 for a single id).
 */

/**
 * Get the index of the closest value of a sorted list.
 *
 * @param {number[]} values The sorted values.
 * @param {number} value The value to locate.
 * @returns {number} The index of the closest value.
 */
function getClosestValueIndex(values, value) {
  let res = 0;
  for (let i = 1; i < values.length; ++i) {
    if (Math.abs(values[i] - value) < Math.abs(values[res] - value)) {
      res = i;
    }
  }
  return res;
}

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
   * Time points: the time (a volume id or, without source, a frame
   * index) and its origins, indexed by time id.
   *
   * @type {Map<number, {time: VolumeId, origins: Point3D[]}>}
   */
  #times = new Map();

  /**
   * Initial time.
   *
   * @type {VolumeId|undefined}
   */
  #initialTime;

  /**
   * Volume ids cache, null if not computed (cleared at each time
   * change), undefined if the times are not volume ids.
   *
   * @type {VolumeIdsData|undefined|null}
   */
  #volumeIdsData = null;

  /**
   * Data orientation.
   *
   * @type {Matrix33}
   */
  #orientation = getIdentityMat33();

  /**
   * @param {Point3D[]} origins The object origins.
   * @param {Size} size The object size.
   * @param {Spacing} spacing The object spacing.
   * @param {Matrix33} [orientation] The object orientation (3*3 matrix,
   *   default to 3*3 identity).
   * @param {VolumeId} [time] Optional time: a volume id or, without
   *   source, a frame index (for example `{id: {value: 2}}`).
   */
  constructor(origins, size, spacing, orientation, time) {
    this.#origins = origins;
    this.#size = size;
    this.#spacing = spacing;
    if (typeof time !== 'undefined') {
      this.#setTime(time, origins.slice());
      this.#initialTime = time;
    }
    // check input orientation
    if (typeof orientation !== 'undefined') {
      this.#orientation = orientation;
    }
  }

  /**
   * Store a time and its origins.
   *
   * @param {VolumeId} time The time: a volume id or, without source,
   *   a frame index.
   * @param {Point3D[]} origins The time origins.
   * @throws {Error} If the time does not have a number id.
   */
  #setTime(time, origins) {
    if (typeof time?.id?.value !== 'number') {
      throw new Error(
        'Geometry time must be an object with a number id, ' +
        'for example {id: {value: 2}}');
    }
    this.#times.set(time.id.value, {time, origins});
    this.#volumeIdsData = null;
  }

  /**
   * Clone the geometry.
   *
   * @returns {Geometry} A clone of this geometry.
   */
  clone() {
    return new Geometry(
      this.#origins.slice(),
      new Size(this.#size.getValues()),
      new Spacing(this.#spacing.getValues()),
      new Matrix33(this.#orientation.getValues()),
      this.#initialTime
    );
  }

  /**
   * Get the time that was passed at construction.
   *
   * @returns {VolumeId|undefined} The time.
   */
  getInitialTime() {
    return this.#initialTime;
  }

  /**
   * Set the initial time.
   *
   * @param {VolumeId} time The new time: a volume id or, without
   *   source, a frame index.
   */
  setInitialTime(time) {
    if (typeof this.#initialTime !== 'undefined') {
      this.#times.delete(this.#initialTime.id.value);
    }
    this.#setTime(time, this.#origins.slice());
    this.#initialTime = time;
  }

  /**
   * Set the associated values of the volume ids, for example once
   *   guessed after load (see dicomVolume getVolumeValues).
   *
   * @param {SourcedNumberValue[]} values The associated values, one per
   *   volume id, in volume id order.
   * @throws {Error} If the number of values is not the number of
   *   volume ids.
   */
  setVolumeValues(values) {
    const volumeIds = this.#getVolumeIdsData()?.volumeIds;
    if (volumeIds?.length !== values.length) {
      throw new Error('Expected one value per volume id');
    }
    for (let i = 0; i < volumeIds.length; ++i) {
      const time = volumeIds[i];
      const res = {...time, value: values[i]};
      this.#times.set(time.id.value,
        {time: res, origins: this.#times.get(time.id.value).origins});
      if (this.#initialTime === time) {
        this.#initialTime = res;
      }
    }
    this.#volumeIdsData = null;
  }

  /**
   * Get the volume ids: the time of each volume, sorted by ascending
   *   id, the array index being the volume index. Times are volume
   *   ids if their id has a source.
   *
   * @returns {VolumeId[]|undefined} The volume ids, undefined if the
   *   times are not volume ids.
   */
  getVolumeIds() {
    return this.#getVolumeIdsData()?.volumeIds.slice();
  }

  /**
   * Get the sorted volume ids data, computed once per time change.
   *
   * @returns {VolumeIdsData|undefined} The data, undefined if the
   *   times are not volume ids.
   */
  #getVolumeIdsData() {
    if (this.#volumeIdsData !== null) {
      return this.#volumeIdsData;
    }
    const volumeIds = [...this.#times.values()]
      .map(item => item.time)
      .sort((a, b) => a.id.value - b.id.value);
    if (volumeIds.length === 0 ||
      volumeIds.some(time => typeof time.id.source === 'undefined')) {
      this.#volumeIdsData = undefined;
    } else {
      const values = volumeIds.map(volumeId => volumeId.id.value);
      let minGap = Infinity;
      for (let i = 1; i < values.length; ++i) {
        minGap = Math.min(minGap, values[i] - values[i - 1]);
      }
      this.#volumeIdsData = {
        volumeIds,
        values,
        tolerance: values.length > 1 ? minGap / 2 : 0.5
      };
    }
    return this.#volumeIdsData;
  }

  /**
   * Set the volume ids of a geometry without times (for example a
   *   resampled one): the volumes all have the current origins.
   *
   * @param {VolumeId[]} volumeIds The volume ids, sorted by ascending
   *   id, one per volume (fourth dimension).
   */
  setVolumeIds(volumeIds) {
    this.#times.clear();
    for (const time of volumeIds) {
      this.#setTime(time, this.#origins.slice());
    }
    this.#initialTime = volumeIds[0];
  }

  /**
   * Get the index of a volume id.
   *
   * @param {number} id The volume id.
   * @returns {number} The volume index, -1 if not found.
   */
  getVolumeIndex(id) {
    const data = this.#getVolumeIdsData();
    if (typeof data === 'undefined') {
      return -1;
    }
    // ids are tag values: only allow float noise
    const tolerance = 1e-9 * Math.max(1, Math.abs(id));
    return data.values.findIndex(
      item => Math.abs(item - id) <= tolerance);
  }

  /**
   * Check if the volume of this geometry can follow the one of another
   *   geometry: both volume ids have the same origin and the input
   *   volume id value is one of this geometry.
   *
   * @param {Geometry} geometry The geometry to follow.
   * @param {number} value The volume id value to follow.
   * @returns {boolean} True if the volume can follow.
   */
  canSyncVolume(geometry, value) {
    const sourceId = geometry.getVolumeIds()?.[0];
    const targetId = this.getVolumeIds()?.[0];
    if (typeof sourceId === 'undefined' || typeof targetId === 'undefined') {
      return false;
    }
    return sourceId.id.source === targetId.id.source &&
      sourceId.id.tagKey === targetId.id.tagKey &&
      this.getVolumeIndex(value) !== -1;
  }

  /**
   * Check if the fourth dimension index to world conversion uses
   *   volume ids: if there are volume ids, one per volume.
   *
   * @returns {VolumeIdsData|undefined} The volume ids data if they
   *   are used.
   */
  #getConversionVolumeIds() {
    const data = this.#getVolumeIdsData();
    if (typeof data === 'undefined' ||
      this.#size.length() < 4 ||
      data.values.length !== this.#size.get(3)) {
      return undefined;
    }
    return data;
  }

  /**
   * Convert a volume index into a volume id. Out of range indices
   *   are extrapolated from the closest step between ids so that
   *   the conversion can be inverted.
   *
   * @param {number} index The volume index.
   * @param {VolumeIdsData} data The volume ids data.
   * @returns {number} The volume id.
   */
  #volumeIndexToId(index, data) {
    const volumeIds = data.values;
    const last = volumeIds.length - 1;
    let res;
    if (index < 0) {
      const step = last > 0 ? volumeIds[1] - volumeIds[0] : 1;
      res = volumeIds[0] + index * step;
    } else if (index > last) {
      const step = last > 0 ? volumeIds[last] - volumeIds[last - 1] : 1;
      res = volumeIds[last] + (index - last) * step;
    } else {
      res = volumeIds[index];
    }
    return res;
  }

  /**
   * Convert a volume id into a volume index: the index of the
   *   closest id, -1 before the first and the number of volumes
   *   after the last (further than the tolerance).
   *
   * @param {number} volumeId The volume id.
   * @param {VolumeIdsData} data The volume ids data.
   * @returns {number} The volume index.
   */
  #volumeIdToIndex(volumeId, data) {
    const values = data.values;
    if (volumeId <= values[0] - data.tolerance) {
      return -1;
    }
    if (volumeId >= values[values.length - 1] + data.tolerance) {
      return values.length;
    }
    return getClosestValueIndex(values, volumeId);
  }

  /**
   * Get the total number of slices.
   * Can be different from what is stored in the size object
   *  during a volume with time points creation process.
   *
   * @returns {number} The total count.
   */
  getCurrentTotalNumberOfSlices() {
    if (this.#times.size === 0) {
      return this.#origins.length;
    }
    let count = 0;
    for (const item of this.#times.values()) {
      count += item.origins.length;
    }
    return count;
  }

  /**
   * Check if a time point has associated slices.
   *
   * @param {number} time The time id to check.
   * @returns {boolean} True if slices are present.
   */
  hasSlicesAtTime(time) {
    return this.#times.has(time);
  }

  /**
   * Get the number of slices stored for time points preceding
   * the input one.
   *
   * @param {number} time The time id to check.
   * @returns {number|undefined} The count.
   */
  getCurrentNumberOfSlicesBeforeTime(time) {
    if (this.#times.size === 0) {
      return undefined;
    }
    // times are stored in ascending order
    let count = 0;
    for (const [key, item] of this.#times) {
      if (key < time) {
        count += item.origins.length;
      }
    }
    return count;
  }

  /**
   * Check that all time points have the same origins as the
   * initial time point (same number and same values in the
   * same order).
   *
   * @returns {BooleanResult} Result with success set to true if
   *   the time origins are consistent.
   */
  checkTimeOrigins() {
    // no time points to compare to
    if (typeof this.#initialTime === 'undefined') {
      return new BooleanResult(true);
    }
    for (const [key, item] of this.#times) {
      const timeOrigins = item.origins;
      if (timeOrigins.length !== this.#origins.length) {
        return {
          success: false,
          message: `Different number of slices for time ${key}: ` +
            `${timeOrigins.length} vs ${this.#origins.length}`
        };
      }
      for (let i = 0; i < timeOrigins.length; ++i) {
        if (!timeOrigins[i].equals(this.#origins[i])) {
          return {
            success: false,
            message: `Different origin for time ${key} at slice ${i}`
          };
        }
      }
    }
    return new BooleanResult(true);
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
   * Sort origins by Z position ascending.
   */
  sortOrigins() {
    this.#origins.sort(getComparePoint3D(this.#orientation));
  }

  /**
   * Check if a point is in the origin list.
   *
   * @param {Point3D} point3D The point to check.
   * @param {number} [tol] Optional number comparison tolerance
   *   defaults to Number.EPSILON.
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
  updateSliceSpacing() {
    const geoSliceSpacing = getSliceGeometrySpacing(this.#origins);
    // update local if needed
    if (typeof geoSliceSpacing !== 'undefined') {
      // 1 is default
      if (this.#spacing.get(2) !== 1 &&
        this.#spacing.get(2) !== geoSliceSpacing) {
        logger.debug(`Using geometric spacing ${ geoSliceSpacing
        } instead of tag spacing ${this.#spacing.get(2)}`);
      }
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
   * Get the slice position of an origin in the current slice layout.
   * Slice indices increase with decreasing origins (high index -> low origin),
   * this simplified the handling of reconstruction since it means
   * the displayed data is in the same 'direction' as the extracted data.
   * As seen in the getOrigin method, the main origin is the lowest one.
   * This implies that the index to world and reverse method do some flipping
   * magic...
   *
   * Limitation: the codirectional (before/after) refinement below is a
   * strict sign check on the normal-projected residual, with no
   * tolerance - unlike worldToIndex's magnitude-based half-spacing
   * gate. That is safe for this method's one real caller
   * (Image#appendSlice, which only ever compares exact, already-known
   * slice origins - a clean, large residual, never close to zero),
   * but this method should not be used for an arbitrary point with a
   * large in-plane offset from its closest origin (eg a click
   * position): float noise in that offset, amplified by a
   * lower-precision orientation (eg gantry-tilt direction cosines
   * with few decimal digits), can flip the sign of a residual that
   * should be exactly zero. Use worldToIndex (or a plain
   * Point3D#getClosest) instead for that case.
   *
   * @param {Point3D} origin The origin to locate.
   * @param {number} [time] Optional time id.
   * @returns {number} The slice index.
   */
  getSliceIndex(origin, time) {
    // cannot use this.worldToIndex(origin).getK() directly: unlike
    // this method, it can fall back to an out-of-range extrapolated
    // index, which is not a valid insertion point here...

    let localOrigins = this.#origins;
    if (typeof time !== 'undefined') {
      localOrigins = this.#times.get(time).origins;
    }

    // find the closest origin and how far past (or before) it the
    // input origin is, along the slice-stacking direction
    const closest = getClosestOriginResidual(
      origin, localOrigins, this.#orientation);

    // positive residual: origin is past the closest origin, so it
    // belongs to the next slice index; zero or negative: it belongs
    // to (or is before) the closest origin's own index
    const sliceIndex = closest.normalResidual > 0
      ? closest.index + 1 : closest.index;

    return sliceIndex;
  }

  /**
   * Check if another geometry is compatible with this one, ie that
   * slices with these geometries can be merged into one volume.
   *
   * @param {Geometry} rhs The geometry to check.
   * @returns {BooleanResult} Result with success set to true if
   *   the geometry is compatible.
   */
  canAppendSlice(rhs) {
    // check size
    const rhsSize = rhs.getSize();
    if (rhsSize.get(2) !== 1) {
      return {
        success: false,
        message: 'Cannot append more than one slice'
      };
    }
    const size = this.getSize();
    if (size.get(0) !== rhsSize.get(0)) {
      return {
        success: false,
        message: 'Cannot append a slice with different number of columns'
      };
    }
    if (size.get(1) !== rhsSize.get(1)) {
      return {
        success: false,
        message: 'Cannot append a slice with different number of rows'
      };
    }
    // check orientation
    if (!this.getOrientation().isSimilar(
      rhs.getOrientation(), DIRECTION_EPSILON)) {
      return {
        success: false,
        message: 'Cannot append a slice with different orientation'
      };
    }
    // check origin
    const canAppendOrigin =
      this.canAppendOrigin(rhs.getOrigin(), rhs.getInitialTime()?.id.value);
    if (!canAppendOrigin.success) {
      return canAppendOrigin;
    }

    return new BooleanResult(true);
  }

  /**
   * Check if an origin can be appended to this geometry.
   *
   * @param {Point3D} origin The origin to append.
   * @param {number} [time] Optional time id.
   * @returns {BooleanResult} Result with success set to true if
   *   the origin is compatible.
   */
  canAppendOrigin(origin, time) {
    // equal callback
    const equalToOrigin = function (element) {
      return element.equals(origin);
    };
    const initialValue = this.#initialTime?.id.value;
    if (typeof time !== 'undefined' && time !== initialValue) {
      // check if not already in list
      if (this.#times.has(time)) {
        const found = this.#times.get(time).origins.find(equalToOrigin);
        if (typeof found !== 'undefined') {
          return {
            success: false,
            message: 'Cannot append same time origin twice'
          };
        }
      }
    } else {
      // check if not already in list
      const found = this.#origins.find(equalToOrigin);
      if (typeof found !== 'undefined') {
        return {
          success: false,
          message: 'Cannot append same origin twice'
        };
      }
    }
    return new BooleanResult(true);
  }

  /**
   * Append an origin to the geometry.
   *
   * @param {Point3D} origin The origin to append.
   * @param {number} index The index at which to append.
   * @param {number} [time] Optional time id.
   */
  appendOrigin(origin, index, time) {
    // check if possible
    const canAppend = this.canAppendOrigin(origin, time);
    if (!canAppend.success) {
      throw new Error(canAppend.message);
    }

    // add in origin array
    if (typeof time !== 'undefined') {
      this.#times.get(time).origins.splice(index, 0, origin);
    }
    if (typeof time === 'undefined' ||
      time === this.#initialTime?.id.value) {
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
   * @param {VolumeId} time The frame time: a volume id or, without
   *   source, a frame index.
   */
  appendFrame(origin, time) {
    // add origin to list
    this.#setTime(time, [origin]);
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
    return `Origin: ${ this.getOrigin()
    }, Size: ${ this.getSize()
    }, Spacing: ${ this.getSpacing()
    }, Orientation: ${this.getOrientation()}`;
  }

  /**
   * Check for equality.
   *
   * @param {Geometry} rhs The object to compare to.
   * @returns {boolean} True if both objects are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      typeof rhs !== 'undefined' &&
      this.getOrigin().equals(rhs.getOrigin()) &&
      this.getSize().equals(rhs.getSize()) &&
      this.getSpacing().equals(rhs.getSpacing()) &&
      this.getOrientation().equals(rhs.getOrientation());
  }

  /**
   * Check for similarity for origin and orientation, equality
   * for size and spacing.
   *
   * @param {Geometry} rhs The object to compare to.
   * @param {number} [tol] Optional number comparison tolerance,
   *   defaults to Number.EPSILON.
   * @returns {boolean} True if both objects are equal.
   */
  isSimilar(rhs, tol) {
    return rhs !== null &&
      typeof rhs !== 'undefined' &&
      this.getOrigin().isSimilar(rhs.getOrigin(), tol) &&
      this.getSize().equals(rhs.getSize()) &&
      this.getSpacing().equals(rhs.getSpacing()) &&
      this.getOrientation().isSimilar(rhs.getOrientation(), tol);
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
   * Get the geometrical range, ie the minimum and maximum
   *   positions.
   *
   * @returns {Point[]} The min and max positions.
   */
  getRange() {
    const nDims = this.getSize().length();
    const minValues = new Array(nDims);
    minValues.fill(0);
    const minIndex = new Index(minValues);
    const maxIndex = new Index(this.getSize().getValues());
    return [
      this.indexToWorld(minIndex),
      this.indexToWorld(maxIndex)
    ];
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
    // volume index to volume id
    const volumeIds = this.#getConversionVolumeIds();
    if (values.length > 3 && typeof volumeIds !== 'undefined') {
      values[3] = this.#volumeIndexToId(values[3], volumeIds);
    }
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
   * Always returns an index, even for a point outside the geometry:
   * this does not itself mean the point is in bounds, use
   * isIndexInBounds/isInBounds for that. In-plane (row/column), an
   * out-of-bounds point extrapolates freely (eg -5 or size+12). On the
   * scroll axis, a point close to a real per-slice origin snaps to it;
   * further away, it is pinned to just past the first/last known
   * origin (ie the origins array length, or -1) rather than left to
   * drift arbitrarily far via linear extrapolation - except when there
   * are few or no real origins to compare against (eg a root geometry
   * with only its first slice known), where it still falls back to
   * that unclamped extrapolation.
   *
   * @param {Point} point The point to convert.
   * @returns {Index} The corresponding index.
   */
  worldToIndex(point) {
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
    // volume id to volume index
    const volumeIds = this.#getConversionVolumeIds();
    if (values.length > 3 && typeof volumeIds !== 'undefined') {
      values[3] = this.#volumeIdToIndex(values[3], volumeIds);
    }
    // apply spacing and floor for the in-plane (row/column) axes
    // (precisionRound to avoid float number inaccuracies)
    const spacing = this.getSpacing();
    values[0] = Math.floor(precisionRound(
      orientedPoint3D.getX() / spacing.get(0),
      REAL_WORLD_EXPONENT
    ));
    values[1] = Math.floor(precisionRound(
      orientedPoint3D.getY() / spacing.get(1),
      REAL_WORLD_EXPONENT
    ));
    // scroll axis: prefer the nearest true per-slice origin over linear
    // extrapolation from origin[0] when the position is actually close
    // to one (within half a slice spacing, projected along the normal)
    // - robust to per-slice origin drift/divergence regardless of
    // slice count, unlike the naive arithmetic below on its own.
    // Falls back to that arithmetic result when no real origin is
    // that close, which correctly preserves both "genuinely out of
    // bounds" and "this geometry only has some of its origins
    // populated so far, extrapolate the rest" (eg a multi-frame DICOM
    // root geometry with no per-frame position data, see
    // dicomGeometry.js#getRootGeometry).
    const naiveZ = Math.floor(precisionRound(
      orientedPoint3D.getZ() / spacing.get(2),
      REAL_WORLD_EXPONENT
    ));
    values[2] = naiveZ;
    const origins = this.getOrigins();
    if (origins.length > 0) {
      const closest = getClosestOriginResidual(
        point.get3D(), origins, this.getOrientation());
      if (Math.abs(closest.normalResidual) < spacing.get(2) / 2) {
        values[2] = closest.index;
      } else if (closest.index === origins.length - 1 &&
        closest.normalResidual > 0 && values[2] < origins.length) {
        // unambiguously past the last real origin (the residual is a
        // full slice spacing or more, so its sign is not float-noise
        // sensitive the way a near-zero one would be): naiveZ must not
        // be allowed to land back inside the origins we actually have
        // data for, regardless of any drift in its own arithmetic
        values[2] = origins.length;
      } else if (closest.index === 0 &&
        closest.normalResidual < 0 && values[2] >= 0) {
        // symmetric guard for the near side, before the first origin
        values[2] = -1;
      }
    }
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
      throw new Error(`Zero slice spacing ${
        origin1.toString() } ${origin2.toString()}`);
    }
    spacings.push(sliceSpacing);
  }

  // use rounded mean value as spacing
  const stats = getBasicStats(spacings);
  const spacing = precisionRound(stats.mean, 4);

  // warn if non constant
  if (stats.stdDev > REAL_WORLD_EPSILON) {
    logger.warn(`Varying slice spacing, value: ${ spacing
    } (mean: ${ stats.mean
    }, min: ${ stats.min
    }, max: ${ stats.max
    }, stdDev: ${stats.stdDev})`);
  }

  return spacing;
}

/**
 * Merge two geometries into one using the merge size and
 *   smallest resolution.
 * WARNING: needs to be called with the final geometries.
 *
 * @param {Geometry} geometry1 The first geometry.
 * @param {Geometry} geometry2 The second geometry.
 * @returns {Geometry} The merged geometry.
 */
export function mergeGeometries(geometry1, geometry2) {
  const orientation = geometry1.getOrientation();
  // check input
  if (!orientation.isSimilar(
    geometry2.getOrientation(), DIRECTION_EPSILON)) {
    throw new Error('Cannot merge geometries with different orientation');
  }
  const invOrientation = orientation.getInverse();

  const minByIndex = function (array1, array2) {
    return arrayMap(array1, array2, Math.min);
  };
  const maxByIndex = function (array1, array2) {
    return arrayMap(array1, array2, Math.max);
  };

  const newSpacing = new Spacing(minByIndex(
    geometry1.getSpacing().getValues(),
    geometry2.getSpacing().getValues()
  ));

  const deorient = function (item) {
    return invOrientation.multiplyPoint3D(item.get3D());
  };
  const range1 = geometry1.getRange().map(deorient);
  const range2 = geometry2.getRange().map(deorient);

  const minRangeValues = minByIndex(
    range1[0].getValues(),
    range2[0].getValues()
  );
  const maxRangeValues = maxByIndex(
    range1[1].getValues(),
    range2[1].getValues()
  );

  let sizeValues = [];
  for (let i = 0; i < minRangeValues.length; ++i) {
    sizeValues.push(Math.round(
      Math.abs(maxRangeValues[i] - minRangeValues[i]) / newSpacing.get(i)
    ));
  }
  // handle extra dims
  const maxSize = maxByIndex(
    geometry1.getSize().getValues(),
    geometry2.getSize().getValues()
  );
  sizeValues = sizeValues.concat(maxSize.slice(3));
  const newSize = new Size(sizeValues);

  const newOrigins = [];
  for (let i = 0; i < newSize.get(2); ++i) {
    const values = minRangeValues.slice();
    values[2] = minRangeValues[2] + i * newSpacing.get(2);
    const origin = new Point3D(values[0], values[1], values[2]);
    newOrigins.push(orientation.multiplyPoint3D(origin));
  }

  return new Geometry(
    newOrigins,
    newSize,
    newSpacing,
    orientation
  );
}
