import {i18n} from '../utils/i18n';
import {getStats} from './stats';
import {Index} from './index';

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
  var res = null;
  if (b !== null && c !== null) {
    res = a * b * c;
  }
  return res;
}

/**
 * Ellipse shape.
 *
 * @class
 * @param {Point2D} centre A Point2D representing the centre
 *   of the ellipse.
 * @param {number} a The radius of the ellipse on the horizontal axe.
 * @param {number} b The radius of the ellipse on the vertical axe.
 */
export class Ellipse {

  #centre;
  #a;
  #b;

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
   * @param {number} spacingX The X spacing.
   * @param {number} spacingY The Y spacing.
   * @returns {number} The surface of the ellipse multiplied by the given
   *  spacing or null for null spacings.
   */
  getWorldSurface(spacingX, spacingY) {
    return mulABC(this.getSurface(), spacingX, spacingY);
  }

  /**
   * Get the rounded limits of the ellipse.
   * (see https://en.wikipedia.org/wiki/Ellipse#Standard_equation)
   * Ellipse formula: x*x / a*a + y*y / b*b = 1
   * => y = (+-)(b/a) * sqrt(a*a - x*x)
   *
   * @returns {Array} The rounded limits.
   */
  getRound() {
    var centerX = this.getCenter().getX();
    var centerY = this.getCenter().getY();
    var radiusX = this.getA();
    var radiusY = this.getB();
    var radiusRatio = radiusX / radiusY;
    var rySquare = Math.pow(radiusY, 2);
    // Y bounds
    var minY = centerY - radiusY;
    var maxY = centerY + radiusY;
    var regions = [];
    // loop through lines and store limits
    for (var y = minY; y < maxY; ++y) {
      var diff = rySquare - Math.pow(y - centerY, 2);
      // remove small values (possibly negative)
      if (Math.abs(diff) < 1e-7) {
        continue;
      }
      var transX = radiusRatio * Math.sqrt(diff);
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
   * @param {dwv.ctrl.ViewController} viewController The associated view
   *   controller.
   * @param {Array} flags A list of stat values to calculate.
   * @returns {object} A quantification object.
   */
  quantify(viewController, flags) {
    var quant = {};
    // surface
    var spacing = viewController.get2DSpacing();
    var surface = this.getWorldSurface(spacing[0], spacing[1]);
    if (surface !== null) {
      quant.surface = {value: surface / 100, unit: i18n('unit.cm2')};
    }

    // pixel quantification
    if (viewController.canQuantifyImage()) {
      var regions = this.getRound();
      if (regions.length !== 0) {
        var values = viewController.getImageVariableRegionValues(regions);
        var quantif = getStats(values, flags);
        quant.min = {value: quantif.min, unit: ''};
        quant.max = {value: quantif.max, unit: ''};
        quant.mean = {value: quantif.mean, unit: ''};
        quant.stdDev = {value: quantif.stdDev, unit: ''};
        if (typeof quantif.median !== 'undefined') {
          quant.median = {value: quantif.median, unit: ''};
        }
        if (typeof quantif.p25 !== 'undefined') {
          quant.p25 = {value: quantif.p25, unit: ''};
        }
        if (typeof quantif.p75 !== 'undefined') {
          quant.p75 = {value: quantif.p75, unit: ''};
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
 * @param {Array} radius The 2 ellipse radiuses.
 * @param {Array} dir The 2 ellipse directions.
 * @returns {Array} The indices of the ellipse.
 */
export function getEllipseIndices(center, radius, dir) {
  var centerValues = center.getValues();
  // keep all values for possible extra dimensions
  var values = centerValues.slice();
  var indices = [];
  var radiusI = radius[0];
  var radiusJ = radius[1];
  var radiusRatio = radiusI / radiusJ;
  var radiusJ2 = Math.pow(radiusJ, 2);
  var di = dir[0];
  var dj = dir[1];
  // deduce 4 positions from top right
  for (var j = 0; j < radiusJ; ++j) {
    // right triangle formed by radiuses, j and len
    // ellipse: i*i / a*a + j*j / b*b = 1
    // -> i = a/b * sqrt(b*b - j*j)
    var len = Math.round(
      radiusRatio * Math.sqrt(radiusJ2 - Math.pow(j, 2)));
    var jmax = centerValues[dj] + j;
    var jmin = centerValues[dj] - j;
    for (var i = 0; i < len; ++i) {
      var imax = centerValues[di] + i;
      var imin = centerValues[di] - i;

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