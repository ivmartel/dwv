import {Point2D} from '../math/point.js';
import {getDistanceToSegment} from './line.js';

/**
 * Region Of Interest shape.
 * Note: should be a closed path.
 */
export class ROI {

  /**
   * List of points.
   *
   * @type {Point2D[]}
   */
  #points = [];

  /**
   * @param {Point2D[]} [points] Optional initial point list.
   */
  constructor(points) {
    if (typeof points !== 'undefined') {
      this.#points = points;
    }
  }

  /**
   * Get a point of the list at a given index.
   *
   * @param {number} index The index of the point to get
   *   (beware, no size check).
   * @returns {Point2D|undefined} The Point2D at the given index.
   */
  getPoint(index) {
    return this.#points[index];
  }

  /**
   * Get the point list.
   *
   * @returns {Point2D[]} The list.
   */
  getPoints() {
    return this.#points;
  }

  /**
   * Get the length of the point list.
   *
   * @returns {number} The length of the point list.
   */
  getLength() {
    return this.#points.length;
  }

  /**
   * Add a point to the ROI.
   *
   * @param {Point2D} point The Point2D to add.
   */
  addPoint(point) {
    this.#points.push(point);
  }

  /**
   * Add points to the ROI.
   *
   * @param {Point2D[]} rhs The array of POints2D to add.
   */
  addPoints(rhs) {
    this.#points = this.#points.concat(rhs);
  }

  /**
   * Get the centroid of the roi. Only valid for
   * a non-self-intersecting closed polygon.
   * Ref: {@link https://en.wikipedia.org/wiki/Centroid#Of_a_polygon}.
   *
   * @returns {Point2D|undefined} The centroid point.
   */
  getCentroid() {
    let a = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < this.#points.length; ++i) {
      const pi = this.#points[i];
      let pi1;
      if (i === this.#points.length - 1) {
        pi1 = this.#points[0];
      } else {
        pi1 = this.#points[i + 1];
      }
      const ai = pi.getX() * pi1.getY() - pi1.getX() * pi.getY();
      a += ai;
      cx += (pi.getX() + pi1.getX()) * ai;
      cy += (pi.getY() + pi1.getY()) * ai;
    }

    let res;
    if (a !== 0) {
      const a1 = 1 / (3 * a);
      res = new Point2D(a1 * cx, a1 * cy);
    }
    return res;
  }

  /**
   * Check if a point is inside the roi (seen as a closed polygon),
   *   or within a tolerance of its outline.
   *
   * @param {Point2D} point The point to check.
   * @param {number} [tolerance] Optional maximum distance to the outline
   *   for an outside point, defaults to 0.
   * @returns {boolean} True if the point is in the roi.
   */
  contains(point, tolerance = 0) {
    const points = this.#points;
    const x = point.getX();
    const y = point.getY();
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const pi = points[i];
      const pj = points[j];
      if (getDistanceToSegment(point, pj, pi) <= tolerance) {
        return true;
      }
      // even-odd rule: count crossings of an horizontal ray
      if ((pi.getY() > y) !== (pj.getY() > y)) {
        const crossX = pi.getX() + (pj.getX() - pi.getX()) *
          (y - pi.getY()) / (pj.getY() - pi.getY());
        if (x < crossX) {
          inside = !inside;
        }
      }
    }
    return inside;
  }

} // ROI class
