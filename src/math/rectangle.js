import {Point2D} from './point';
import {getStats} from './stats';
import {i18n} from '../utils/i18n';

// doc imports
/* eslint-disable no-unused-vars */
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
   * Quantify a rectangle according to view information.
   *
   * @param {ViewController} viewController The associated view controller.
   * @param {string[]} flags A list of stat values to calculate.
   * @returns {object} A quantification object.
   */
  quantify(viewController, flags) {
    const quant = {};
    // shape quantification
    const spacing2D = viewController.get2DSpacing();
    quant.width = {
      value: this.getWidth() * spacing2D.x,
      unit: i18n.t('unit.mm')
    };
    quant.height = {
      value: this.getHeight() * spacing2D.y,
      unit: i18n.t('unit.mm')
    };
    const surface = this.getWorldSurface(spacing2D);
    if (surface !== null) {
      quant.surface = {value: surface / 100, unit: i18n.t('unit.cm2')};
    }

    // pixel values quantification
    if (viewController.canQuantifyImage()) {
      const round = this.getRound();
      const values = viewController.getImageRegionValues(round.min, round.max);
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
