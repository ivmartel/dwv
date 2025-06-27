import {Point2D} from './point.js';
import {getStats} from './stats.js';
import {Index} from './index.js';

// doc imports
/* eslint-disable no-unused-vars */
import {ViewController} from '../app/viewController.js';
import {Scalar2D} from './scalar.js';
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
 * Rectangle shape.
 */
export class Rectangle {

  /**
   * Rectangle begin point.
   *
   * @type {Point2D}
   */
  #begin;

  /**
   * Rectangle end point.
   *
   * @type {Point2D}
   */
  #end;

  /**
   * @param {Point2D} begin A Point2D representing the beginning
   *   of the rectangle.
   * @param {Point2D} end A Point2D representing the end
   *   of the rectangle.
   */
  constructor(begin, end) {
    this.#begin = new Point2D(
      Math.min(begin.getX(), end.getX()),
      Math.min(begin.getY(), end.getY())
    );
    this.#end = new Point2D(
      Math.max(begin.getX(), end.getX()),
      Math.max(begin.getY(), end.getY())
    );
  }

  /**
   * Get the begin point of the rectangle.
   *
   * @returns {Point2D} The begin point of the rectangle.
   */
  getBegin() {
    return this.#begin;
  }

  /**
   * Get the end point of the rectangle.
   *
   * @returns {Point2D} The end point of the rectangle.
   */
  getEnd() {
    return this.#end;
  }

  /**
   * Check for equality.
   *
   * @param {Rectangle} rhs The object to compare to.
   * @returns {boolean} True if both objects are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      this.getBegin().equals(rhs.getBegin()) &&
      this.getEnd().equals(rhs.getEnd());
  }

  /**
   * Get the surface of the rectangle.
   *
   * @returns {number} The surface of the rectangle.
   */
  getSurface() {
    const begin = this.getBegin();
    const end = this.getEnd();
    return Math.abs(end.getX() - begin.getX()) *
      Math.abs(end.getY() - begin.getY());
  }

  /**
   * Get the surface of the rectangle according to a spacing.
   *
   * @param {Scalar2D} spacing2D The 2D spacing.
   * @returns {number} The surface of the rectangle multiplied by the given
   *  spacing or null for null spacings.
   */
  getWorldSurface(spacing2D) {
    return mulABC(this.getSurface(), spacing2D.x, spacing2D.y);
  }

  /**
   * Get the real width of the rectangle.
   *
   * @returns {number} The real width of the rectangle.
   */
  getRealWidth() {
    return this.getEnd().getX() - this.getBegin().getX();
  }

  /**
   * Get the real height of the rectangle.
   *
   * @returns {number} The real height of the rectangle.
   */
  getRealHeight() {
    return this.getEnd().getY() - this.getBegin().getY();
  }

  /**
   * Get the width of the rectangle.
   *
   * @returns {number} The width of the rectangle.
   */
  getWidth() {
    return Math.abs(this.getRealWidth());
  }

  /**
   * Get the height of the rectangle.
   *
   * @returns {number} The height of the rectangle.
   */
  getHeight() {
    return Math.abs(this.getRealHeight());
  }

  /**
   * Get the rounded limits of the rectangle.
   *
   * @returns {object} The rounded limits as {min, max} (Point2D).
   */
  getRound() {
    const roundBegin = new Point2D(
      Math.round(this.getBegin().getX()),
      Math.round(this.getBegin().getY())
    );
    const roundEnd = new Point2D(
      Math.round(this.getEnd().getX()),
      Math.round(this.getEnd().getY())
    );
    return {
      min: roundBegin,
      max: roundEnd
    };
  }

  /**
   * Get the centroid of the rectangle.
   *
   * @returns {Point2D} The centroid point.
   */
  getCentroid() {
    return new Point2D(
      this.getBegin().getX() + this.getWidth() / 2,
      this.getBegin().getY() + this.getHeight() / 2
    );
  }

  /**
   * Quantify a rectangle according to view information.
   *
   * @param {ViewController} viewController The associated view controller.
   * @param {Index} index The index at which to get the
   *   image values.
   * @param {string[]} flags A list of stat values to calculate.
   * @returns {object} A quantification object.
   */
  quantify(viewController, index, flags) {
    const quant = {};
    // shape quantification
    const spacing2D = viewController.get2DSpacing();
    const lengthUnit = viewController.getLengthUnit();
    quant.width = {
      value: this.getWidth() * spacing2D.x,
      unit: lengthUnit
    };
    quant.height = {
      value: this.getHeight() * spacing2D.y,
      unit: lengthUnit
    };
    const surface = this.getWorldSurface(spacing2D);
    if (surface !== null) {
      if (lengthUnit === 'unit.mm') {
        quant.surface = {
          value: surface / 100,
          unit: 'unit.cm2'
        };
      } else {
        quant.surface = {
          value: surface,
          unit: lengthUnit
        };
      }
    }

    // pixel values quantification
    if (viewController.canQuantifyImage()) {
      const round = this.getRound();
      const values = viewController.getImageRegionValues(
        round.min, round.max, index);
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

    // return
    return quant;
  }

} // Rectangle class

/**
 * Get the indices that form a rectangle.
 *
 * @param {Index} center The rectangle center.
 * @param {number[]} size The 2 rectangle sizes.
 * @param {number[]} dir The 2 rectangle directions.
 * @returns {Index[]} The indices of the rectangle.
 */
export function getRectangleIndices(center, size, dir) {
  const centerValues = center.getValues();
  // keep all values for possible extra dimensions
  const values = centerValues.slice();
  const indices = [];
  const sizeI = size[0];
  const halfSizeI = Math.floor(sizeI / 2);
  const sizeJ = size[1];
  const halfSizeJ = Math.floor(sizeJ / 2);
  const di = dir[0];
  const dj = dir[1];
  for (let j = 0; j < sizeJ; ++j) {
    values[dj] = centerValues[dj] - halfSizeJ + j;
    for (let i = 0; i < sizeI; ++i) {
      values[di] = centerValues[di] - halfSizeI + i;
      indices.push(new Index(values.slice()));
    }
  }
  return indices;
}
