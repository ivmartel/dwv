import {Line, getAngle} from './line.js';

/**
 * @import {Point2D} from '../math/point.js';
 * @import {NumberValue} from './number.js';
 * @import {ViewController} from '../app/viewController.js';
 */

/**
 * Protractor shape: 3 points from which to calculate an angle.
 */
export class Protractor {

  /**
   * List of points.
   *
   * @type {Point2D[]}
   */
  #points;

  /**
   * @param {Point2D[]} points The list of Point2D that make
   *   the protractor.
   */
  constructor(points) {
    if (points.length > 3) {
      throw new Error('Too many points for a protractor');
    }
    this.#points = points.slice(0, 3);
  }

  /**
   * Get a point of the list.
   *
   * @param {number} index The index of the point
   *   to get (beware, no size check).
   * @returns {Point2D|undefined} The Point2D at the given index.
   */
  getPoint(index) {
    return this.#points[index];
  }

  /**
   * Get the length of the path (should be 3).
   *
   * @returns {number} The length of the path.
   */
  getLength() {
    return this.#points.length;
  }

  /**
   * Get the centroid of the protractor.
   *
   * @returns {Point2D} THe centroid point.
   */
  getCentroid() {
    return this.#points[1];
  }

  /**
   * Quantify a path according to view information.
   *
   * @param {ViewController} _viewController The associated view controller.
   * @param {string[]} _flags A list of stat values to calculate.
   * @returns {Record<string, NumberValue>} A quantification object.
   */
  quantify(_viewController, _flags) {
    let angle;
    if (this.#points.length === 3) {
      const line0 = new Line(this.#points[0], this.#points[1]);
      const line1 = new Line(this.#points[1], this.#points[2]);
      let angleNumber = getAngle(line0, line1);
      if (angleNumber > 180) {
        angleNumber = 360 - angleNumber;
      }
      angle = {
        value: angleNumber,
        unit: 'unit.degree'
      };
    }
    return {angle};
  }

} // Protractor class
