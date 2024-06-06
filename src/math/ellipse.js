import {i18n} from '../utils/i18n';
import {getStats} from './stats';
import {Index} from './index';

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
 * Ellipse shape.
 */
export class Ellipse {

  /**
   * Ellipse centre.
   *
   * @type {Point2D}
   */
  #centre;

  /**
   * Ellipse horizontal radius.
   *
   * @type {number}
   */
  #a;

  /**
   * Ellipse vertical radius.
   *
   * @type {number}
   */
  #b;

  /**
   * @param {Point2D} centre A Point2D representing the centre
   *   of the ellipse.
   * @param {number} a The radius of the ellipse on the horizontal axe.
   * @param {number} b The radius of the ellipse on the vertical axe.
   */
  constructor(centre, a, b) {
    this.#centre = centre;
    this.#a = a;
    this.#b = b;
  }

  /**
   * Get the centre (point) of the ellipse.
   *
   * @returns {Point2D} The center (point) of the ellipse.
   */
  getCenter() {
    return this.#centre;
  }

  /**
   * Get the radius of the ellipse on the horizontal axe.
   *
   * @returns {number} The radius of the ellipse on the horizontal axe.
   */
  getA() {
    return this.#a;
  }

  /**
   * Get the radius of the ellipse on the vertical axe.
   *
   * @returns {number} The radius of the ellipse on the vertical axe.
   */
  getB() {
    return this.#b;
  }

  /**
   * Check for equality.
   *
   * @param {Ellipse} rhs The object to compare to.
   * @returns {boolean} True if both objects are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      this.getCenter().equals(rhs.getCenter()) &&
      this.getA() === rhs.getA() &&
      this.getB() === rhs.getB();
  }

  /**
   * Get the surface of the ellipse.
   *
   * @returns {number} The surface of the ellipse.
   */
  getSurface() {
    return Math.PI * this.getA() * this.getB();
  }

  /**
   * Get the surface of the ellipse according to a spacing.
   *
   * @param {Scalar2D} spacing2D The 2D spacing.
   * @returns {number} The surface of the ellipse multiplied by the given
   *  spacing or null for null spacings.
   */
  getWorldSurface(spacing2D) {
    return mulABC(this.getSurface(), spacing2D.x, spacing2D.y);
  }

  /**
   * Get the rounded limits of the ellipse.
   *
   * See: {@link https://en.wikipedia.org/wiki/Ellipse#Standard_equation}.
   *
   * Ellipse formula: `x*x / a*a + y*y / b*b = 1`.
   *
   * Implies: `y = (+-)(b/a) * sqrt(a*a - x*x)`.
   *
   * @returns {number[][][]} The rounded limits:
   *  list of [x, y] pairs (min, max).
   */
  getRound() {
    const centerX = this.getCenter().getX();
    const centerY = this.getCenter().getY();
    const radiusX = this.getA();
    const radiusY = this.getB();
    const radiusRatio = radiusX / radiusY;
    const rySquare = Math.pow(radiusY, 2);
    // Y bounds
    const minY = centerY - radiusY;
    const maxY = centerY + radiusY;
    const regions = [];
    // loop through lines and store limits
    for (let y = minY; y < maxY; ++y) {
      const diff = rySquare - Math.pow(y - centerY, 2);
      // remove small values (possibly negative)
      if (Math.abs(diff) < 1e-7) {
        continue;
      }
      const transX = radiusRatio * Math.sqrt(diff);
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
   * Quantify an ellipse according to view information.
   *
   * @param {ViewController} viewController The associated view controller.
   * @param {string[]} flags A list of stat values to calculate.
   * @returns {object} A quantification object.
   */
  quantify(viewController, flags) {
    const quant = {};
    // shape quantification
    const spacing2D = viewController.get2DSpacing();
    quant.a = {
      value: this.getA() * spacing2D.x,
      unit: i18n.t('unit.mm')
    };
    quant.b = {
      value: this.getB() * spacing2D.y,
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

} // Ellipse class

/**
 * Get the indices that form a ellpise.
 *
 * @param {Index} center The ellipse center.
 * @param {number[]} radius The 2 ellipse radiuses.
 * @param {number[]} dir The 2 ellipse directions.
 * @returns {Index[]} The indices of the ellipse.
 */
export function getEllipseIndices(center, radius, dir) {
  const centerValues = center.getValues();
  // keep all values for possible extra dimensions
  const values = centerValues.slice();
  const indices = [];
  const radiusI = radius[0];
  const radiusJ = radius[1];
  const radiusRatio = radiusI / radiusJ;
  const radiusJ2 = Math.pow(radiusJ, 2);
  const di = dir[0];
  const dj = dir[1];
  // deduce 4 positions from top right
  for (let j = 0; j < radiusJ; ++j) {
    // right triangle formed by radiuses, j and len
    // ellipse: i*i / a*a + j*j / b*b = 1
    // -> i = a/b * sqrt(b*b - j*j)
    const len = Math.round(
      radiusRatio * Math.sqrt(radiusJ2 - Math.pow(j, 2)));
    const jmax = centerValues[dj] + j;
    const jmin = centerValues[dj] - j;
    for (let i = 0; i < len; ++i) {
      const imax = centerValues[di] + i;
      const imin = centerValues[di] - i;

      // right
      values[di] = imax;
      // right - top
      values[dj] = jmax;
      indices.push(new Index(values.slice()));
      // right - bottom
      if (jmin !== jmax) {
        values[dj] = jmin;
        indices.push(new Index(values.slice()));
      }

      // left
      if (imin !== imax) {
        values[di] = imin;
        // left - top
        values[dj] = jmax;
        indices.push(new Index(values.slice()));
        // left - bottom
        if (jmin !== jmax) {
          values[dj] = jmin;
          indices.push(new Index(values.slice()));
        }
      }
    }
  }
  return indices;
}
