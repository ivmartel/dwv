/**
 * @import {Point} from '../math/point.js';
 * @import {NumberValue} from '../math/number.js';
 */

/**
 * Diameter type.
 */
export class Diameter {
  /**
   * The scaled diameter value.
   *
   * @type {NumberValue}
   */
  diameter;

  /**
   * The offset of the pixel at the start
   * of the line used to calculate this diameter.
   *
   * @type {number}
   */
  offset1;

  /**
   * The offset of the pixel at the end
   * of the line used to calculate this diameter.
   *
   * @type {number}
   */
  offset2;
}

/**
 * Diameters type.
 */
export class Diameters {
  /**
   * The major (longest) diameter of the segment.
   *
   * @type {Diameter}
   */
  major;

  /**
   * The minor (longest perpendicular to the major) diameter of the segment.
   *
   * @type {Diameter}
   */
  minor;
}

/**
 * Label type.
 */
export class Label {
  /**
   * The world coordinates of the centroid.
   *
   * @type {Point}
   */
  centroid;

  /**
   * The closest voxel Index to the centroid.
   *
   * @type {number[]}
   */
  centroidIndex;

  /**
   * The volume of the labeled segment.
   *
   * @type {NumberValue}
   */
  volume;

  /**
   * The voxel count of the labeled segment.
   *
   * @type {number}
   */
  count;

  /**
   * The diameters of the segment.
   *
   * @type {Diameters}
   */
  diameters;

  /**
   * The scaled height of the segment.
   *
   * @type {NumberValue}
   */
  height;

  /**
   * The segment label id.
   *
   * @type {number}
   */
  id;

  /**
   * The Z index of the largest slice of the segment.
   *
   * @type {number}
   */
  largestSliceZ;
}