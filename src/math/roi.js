import {Point2D} from '../math/point';

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
   * @returns {Point2D} The centroid point.
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
    a *= 0.5;
    const a1 = 1 / (6 * a);
    cx *= a1;
    cy *= a1;

    return new Point2D(cx, cy);
  }

} // ROI class
