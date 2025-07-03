import {Point2D} from './point.js';
import {
  isSimilar,
  REAL_WORLD_EPSILON,
} from './matrix.js';

// doc imports
/* eslint-disable no-unused-vars */
import {ViewController} from '../app/viewController.js';
import {Scalar2D} from './scalar.js';
/* eslint-enable no-unused-vars */

/**
 * Line shape.
 */
export class Line {

  /**
   * Line begin point.
   *
   * @type {Point2D}
   */
  #begin;

  /**
   * Line end point.
   *
   * @type {Point2D}
   */
  #end;

  /**
   * @param {Point2D} begin A Point2D representing the beginning
   *   of the line.
   * @param {Point2D} end A Point2D representing the end of the line.
   */
  constructor(begin, end) {
    this.#begin = begin;
    this.#end = end;
  }

  /**
   * Get the begin point of the line.
   *
   * @returns {Point2D} The beginning point of the line.
   */
  getBegin() {
    return this.#begin;
  }

  /**
   * Get the end point of the line.
   *
   * @returns {Point2D} The ending point of the line.
   */
  getEnd() {
    return this.#end;
  }

  /**
   * Check for equality.
   *
   * @param {Line} rhs The object to compare to.
   * @returns {boolean} True if both objects are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      this.getBegin().equals(rhs.getBegin()) &&
      this.getEnd().equals(rhs.getEnd());
  }

  /**
   * Get the line delta in the X direction.
   *
   * @returns {number} The delta in the X direction.
   */
  getDeltaX() {
    return this.getEnd().getX() - this.getBegin().getX();
  }

  /**
   * Get the line delta in the Y direction.
   *
   * @returns {number} The delta in the Y direction.
   */
  getDeltaY() {
    return this.getEnd().getY() - this.getBegin().getY();
  }

  /**
   * Get the length of the line.
   *
   * @returns {number} The length of the line.
   */
  getLength() {
    return Math.sqrt(
      this.getDeltaX() * this.getDeltaX() +
      this.getDeltaY() * this.getDeltaY()
    );
  }

  /**
   * Get the length of the line according to a  spacing.
   *
   * @param {Scalar2D} spacing2D The 2D spacing.
   * @returns {number} The length of the line with spacing
   *  or null for null spacings.
   */
  getWorldLength(spacing2D) {
    let wlen = null;
    if (spacing2D !== null) {
      const dxs = this.getDeltaX() * spacing2D.x;
      const dys = this.getDeltaY() * spacing2D.y;
      wlen = Math.sqrt(dxs * dxs + dys * dys);
    }
    return wlen;
  }

  /**
   * Get the mid point of the line.
   *
   * @returns {Point2D} The mid point of the line.
   */
  getMidpoint() {
    return new Point2D(
      (this.getBegin().getX() + this.getEnd().getX()) / 2,
      (this.getBegin().getY() + this.getEnd().getY()) / 2
    );
  }

  /**
   * Get the centroid of the line.
   *
   * @returns {Point2D} THe centroid point.
   */
  getCentroid() {
    return this.getMidpoint();
  }

  /**
   * Get the slope of the line.
   *
   * @returns {number} The slope of the line.
   */
  getSlope() {
    return this.getDeltaY() / this.getDeltaX();
  }

  /**
   * Get the intercept of the line.
   *
   * @returns {number} The slope of the line.
   */
  getIntercept() {
    return (
      this.getEnd().getX() * this.getBegin().getY() -
      this.getBegin().getX() * this.getEnd().getY()
    ) / this.getDeltaX();
  }

  /**
   * Get the inclination of the line.
   *
   * @returns {number} The inclination of the line.
   */
  getInclination() {
    // tan(theta) = slope
    const angle =
      Math.atan2(this.getDeltaY(), this.getDeltaX()) * 180 / Math.PI;
    // shift?
    return 180 - angle;
  }

  /**
   * Quantify a line according to view information.
   *
   * @param {ViewController} viewController The associated view controller.
   * @returns {object} A quantification object.
   */
  quantify(viewController) {
    const quant = {};
    // length
    const spacing2D = viewController.get2DSpacing();
    const length = this.getWorldLength(spacing2D);
    if (length !== null) {
      quant.length = {
        value: length,
        unit: viewController.getLengthUnit()
      };
    }
    // return
    return quant;
  }

} // Line class

/**
 * Get the angle between two lines in degree.
 *
 * @param {Line} line0 The first line.
 * @param {Line} line1 The second line.
 * @returns {number} The angle.
 */
export function getAngle(line0, line1) {
  const dx0 = line0.getDeltaX();
  const dy0 = line0.getDeltaY();
  const dx1 = line1.getDeltaX();
  const dy1 = line1.getDeltaY();
  // dot = ||a||*||b||*cos(theta)
  const dot = dx0 * dx1 + dy0 * dy1;
  // cross = ||a||*||b||*sin(theta)
  const det = dx0 * dy1 - dy0 * dx1;
  // tan = sin / cos
  const angle = Math.atan2(det, dot) * 180 / Math.PI;
  // complementary angle
  // shift?
  return 360 - (180 - angle);
}

/**
 * Check if two lines are orthogonal.
 *
 * @param {Line} line0 The first line.
 * @param {Line} line1 The second line.
 * @returns {boolean} True if both lines are orthogonal.
 */
export function areOrthogonal(line0, line1) {
  const dx0 = line0.getDeltaX();
  const dy0 = line0.getDeltaY();
  const dx1 = line1.getDeltaX();
  const dy1 = line1.getDeltaY();
  // dot = ||a||*||b||*cos(theta)
  return (dx0 * dx1 + dy0 * dy1) === 0;
}

/**
 * Check if a point is in a line coordinate range.
 *
 * @param {Point2D} point The input point.
 * @param {Line} line The input line.
 * @returns {boolean} True if the input point is in the line coordinate range.
 */
export function isPointInLineRange(point, line) {
  const minX = Math.min(line.getBegin().getX(), line.getEnd().getX());
  const maxX = Math.max(line.getBegin().getX(), line.getEnd().getX());
  const minY = Math.min(line.getBegin().getY(), line.getEnd().getY());
  const maxY = Math.max(line.getBegin().getY(), line.getEnd().getY());
  return point.getX() >= minX &&
    point.getX() <= maxX &&
    point.getY() >= minY &&
    point.getY() <= maxY;
}

/**
 * Get a perpendicular line to an input one at a given point.
 *
 * @param {Line} line The line to be perpendicular to.
 * @param {Point2D} point The middle point of the perpendicular line.
 * @param {number} length The length of the perpendicular line.
 * @param {Scalar2D} [spacing] Optional image spacing, default to [1,1].
 * @returns {Line} The perpendicular line.
 */
export function getPerpendicularLine(line, point, length, spacing) {
  if (typeof spacing === 'undefined') {
    spacing = {x: 1, y: 1};
  }
  const sx2 = spacing.x * spacing.x;
  const sy2 = spacing.y * spacing.y;
  // a0 * a1 = -1 (in square space)
  const perpSlope = -sx2 / (sy2 * line.getSlope());
  // y0 = a1*x0 + b1 -> b1 = y0 - a1*x0
  const prepIntercept = point.getY() - perpSlope * point.getX();
  // return
  return getLineFromEquation(perpSlope, prepIntercept, point, length, spacing);
}

/**
 * Get a perpendicular line to an input one at a given distance
 *   of its begin point.
 *
 * @param {Line} line The line to be perpendicular to.
 * @param {number} distance The distance to the input line begin point.
 * @param {number} length The length of the perpendicular line.
 * @param {Scalar2D} [spacing] Optional image spacing, default to [1,1].
 * @returns {Line} The perpendicular line.
 */
export function getPerpendicularLineAtDistance(
  line, distance, length, spacing) {
  // get a line along the input one and centered on begin point
  const lineFromEq = getLineFromEquation(
    line.getSlope(),
    line.getIntercept(),
    line.getBegin(),
    distance,
    spacing
  );
  // select the point on the input line
  let startPoint;
  if (isPointInLineRange(lineFromEq.getBegin(), line)) {
    startPoint = lineFromEq.getBegin();
  } else {
    startPoint = lineFromEq.getEnd();
  }
  // use it as base for a perpendicular line
  return getPerpendicularLine(line, startPoint, length, spacing);
}

/**
 * Get a line from an equation, a middle point and a length.
 *
 * @param {number} slope The line slope.
 * @param {number} intercept The line intercept.
 * @param {Point2D} point The middle point of the line.
 * @param {number} length The line length.
 * @param {Scalar2D} [spacing] Optional image spacing, default to [1,1].
 * @returns {Line} The resulting line.
 */
export function getLineFromEquation(slope, intercept, point, length, spacing) {
  if (typeof spacing === 'undefined') {
    spacing = {x: 1, y: 1};
  }
  // begin point
  let beginX = 0;
  let beginY = 0;
  // end point
  let endX = 0;
  let endY = 0;

  if (isSimilar(slope, 0, REAL_WORLD_EPSILON)) {
    // slope = ~0 -> horizontal input line
    beginX = point.getX() - length / (2 * spacing.x);
    beginY = point.getY();
    endX = point.getX() + length / (2 * spacing.x);
    endY = point.getY();
  } else if (Math.abs(slope) > 1e6) {
    // slope = ~(+/-)Infinity -> vertical input line
    beginX = point.getX();
    beginY = point.getY() - length / (2 * spacing.y);
    endX = point.getX();
    endY = point.getY() + length / (2 * spacing.y);
  } else {
    const sx2 = spacing.x * spacing.x;
    const sy2 = spacing.y * spacing.y;

    // 1. [length] sx^2 * (x - x0)^2 + sy^2 * (y - y0)^2 = d^2
    // 2. [slope] a = (y - y0) / (x - x0) -> y - y0 = a*(x - x0)
    // ->  sx^2 * (x - x0)^2 + sy^2 * a^2 * (x - x0)^2 = d^2
    // ->  (x - x0)^2 = d^2 / (sx^2 + sy^2 * a^2)
    // -> x = x0 +- d / sqrt(sx^2 + sy^2 * a^2)

    // length is the distance between begin and end,
    // point is half way between both -> d = length / 2
    const dx = length / (2 * Math.sqrt(sx2 + sy2 * slope * slope));

    // begin point
    beginX = point.getX() - dx;
    beginY = slope * beginX + intercept;
    // end point
    endX = point.getX() + dx;
    endY = slope * endX + intercept;
  }
  return new Line(
    new Point2D(beginX, beginY),
    new Point2D(endX, endY));
}
