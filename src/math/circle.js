import {i18n} from '../utils/i18n';
import {getStats} from './stats';

// doc imports
/* eslint-disable no-unused-vars */
import {Point2D} from '../math/point';
import {ViewController} from '../app/viewController';
import {Scalar2D} from './scalar';
/* eslint-enable no-unused-vars */

/**
 * Mulitply the three inputs if the last two are not null.
 *
 * @param {number} a The first input.
 * @param {number} b The second input.
 * @param {number} c The third input.
 * @returns {number} The multiplication of the three inputs or
 *  null if one of the last two is null.
 */
function mulABC(a, b, c) {
  let res = null;
  if (b !== null && c !== null) {
    res = a * b * c;
  }
  return res;
}

/**
 * Circle shape.
 */
export class Circle {

  /**
   * Circle centre.
   *
   * @type {Point2D}
   */
  #centre;

  /**
   * Circle radius.
   *
   * @type {number}
   */
  #radius;

  /**
   * @param {Point2D} centre A Point2D representing the centre
   *   of the circle.
   * @param {number} radius The radius of the circle.
   */
  constructor(centre, radius) {
    this.#centre = centre;
    this.#radius = radius;
  }

  /**
   * Get the centre (point) of the circle.
   *
   * @returns {Point2D} The center (point) of the circle.
   */
  getCenter() {
    return this.#centre;
  }

  /**
   * Get the radius of the circle.
   *
   * @returns {number} The radius of the circle.
   */
  getRadius() {
    return this.#radius;
  }


  /**
   * Check for equality.
   *
   * @param {Circle} rhs The object to compare to.
   * @returns {boolean} True if both objects are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      this.getCenter().equals(rhs.getCenter()) &&
      this.getRadius() === rhs.getRadius();
  }

  /**
   * Get the surface of the circle.
   *
   * @returns {number} The surface of the circle.
   */
  getSurface() {
    return Math.PI * this.getRadius() * this.getRadius();
  }

  /**
   * Get the surface of the circle according to a spacing.
   *
   * @param {Scalar2D} spacing2D The 2D spacing.
   * @returns {number} The surface of the circle multiplied by the given
   *  spacing or null for null spacings.
   */
  getWorldSurface(spacing2D) {
    return mulABC(this.getSurface(), spacing2D.x, spacing2D.y);
  }

  /**
   * Get the rounded limits of the circle.
   *
   * See: {@link https://en.wikipedia.org/wiki/Circle#Equations}.
   *
   * Circle formula: `x*x + y*y = r*r`.
   *
   * Implies: `y = (+-) sqrt(r*r - x*x)`.
   *
   * @returns {number[][][]} The rounded limits:
   *  list of [x, y] pairs (min, max).
   */
  getRound() {
    const centerX = this.getCenter().getX();
    const centerY = this.getCenter().getY();
    const radius = this.getRadius();
    const rSquare = Math.pow(radius, 2);
    // Y bounds
    const minY = centerY - radius;
    const maxY = centerY + radius;
    const regions = [];
    // loop through lines and store limits
    for (let y = minY; y < maxY; ++y) {
      const diff = rSquare - Math.pow(y - centerY, 2);
      // remove small values (possibly negative)
      if (Math.abs(diff) < 1e-7) {
        continue;
      }
      const transX = Math.sqrt(diff);
      // remove small values
      if (transX < 0.5) {
        continue;
      }
      regions.push([
        [Math.round(centerX - transX), Math.round(y)],
        [Math.round(centerX + transX), Math.round(y)]
      ]);
    }
    return regions;
  }

  /**
   * Quantify an circle according to view information.
   *
   * @param {ViewController} viewController The associated view controller.
   * @param {string[]} flags A list of stat values to calculate.
   * @returns {object} A quantification object.
   */
  quantify(viewController, flags) {
    const quant = {};
    // shape quantification
    const spacing2D = viewController.get2DSpacing();
    quant.radius = {
      value: this.getRadius() * spacing2D.x,
      unit: i18n.t('unit.mm')
    };
    const surface = this.getWorldSurface(spacing2D);
    if (surface !== null) {
      quant.surface = {value: surface / 100, unit: i18n.t('unit.cm2')};
    }

    // pixel values quantification
    if (viewController.canQuantifyImage()) {
      const regions = this.getRound();
      if (regions.length !== 0) {
        const values = viewController.getImageVariableRegionValues(regions);
        const unit = viewController.getPixelUnit();
        const quantif = getStats(values, flags);
        quant.min = {value: quantif.min, unit: unit};
        quant.max = {value: quantif.max, unit: unit};
        quant.mean = {value: quantif.mean, unit: unit};
        quant.stdDev = {value: quantif.stdDev, unit: unit};
        if (typeof quantif.median !== 'undefined') {
          quant.median = {value: quantif.median, unit: unit};
        }
        if (typeof quantif.p25 !== 'undefined') {
          quant.p25 = {value: quantif.p25, unit: unit};
        }
        if (typeof quantif.p75 !== 'undefined') {
          quant.p75 = {value: quantif.p75, unit: unit};
        }
      }
    }

    // return
    return quant;
  }

} // Circle class
