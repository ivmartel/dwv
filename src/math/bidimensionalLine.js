import {Point2D} from './point.js';
import {Line} from './line.js';

// doc imports
/* eslint-disable no-unused-vars */
import {ViewController} from '../app/viewController.js';

/**
 * BidimensionalLine shape.
 * Represents a line with a main (long) axis and a perpendicular (short) axis.
 */
export class BidimensionalLine {

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
   * Optional length of the short axis (perpendicular to main axis).
   *
   * @type {number}
   */
  shortAxisLength;

  /**
   * Optional length of the short axis (perpendicular to main axis).
   *
   * @type {Point2D | undefined}
   */
  shortAxisCenter;

  /**
   * Optional length from center to one end of the short axis.
   *
   * @type {number}
   */
  shortAxisL1;

  /**
   * Optional length from center to the other end of the short axis.
   *
   * @type {number}
   */
  shortAxisL2;

  /**
   * Optional relative position (0-1) of the short axis center
   * along the main axis.
   *
   * @type {number}
   */
  shortAxisT;

  /**
   * @param {Point2D} begin The beginning point of the main axis.
   * @param {Point2D} end The ending point of the main axis.
   */
  constructor(begin, end) {
    this.#begin = begin;
    this.#end = end;
  }

  /**
   * Get the begin point of the main axis.
   *
   * @returns {Point2D} The beginning point.
   */
  getBegin() {
    return this.#begin;
  }

  /**
   * Get the end point of the main axis.
   *
   * @returns {Point2D} The ending point.
   */
  getEnd() {
    return this.#end;
  }

  /**
   * Get the centroid (midpoint) of the main axis.
   *
   * @returns {Point2D} The centroid point.
   */
  getCentroid() {
    return new Point2D(
      (this.#begin.getX() + this.#end.getX()) / 2,
      (this.#begin.getY() + this.#end.getY()) / 2,
    );
  }

  /**
   * Get the length of the main axis.
   *
   * @returns {number} The length.
   */
  getLength() {
    const dx = this.getDeltaX();
    const dy = this.getDeltaY();
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get the slope of the main axis.
   *
   * @returns {number} The slope.
   */
  getSlope() {
    const dx = this.getDeltaX();
    const dy = this.getDeltaY();
    if (dx === 0) {
      return Infinity;
    }
    return dy / dx;
  }

  /**
   * Get the delta in the X direction for the main axis.
   *
   * @returns {number} The delta X.
   */
  getDeltaX() {
    return this.#end.getX() - this.#begin.getX();
  }

  /**
   * Get the delta in the Y direction for the main axis.
   *
   * @returns {number} The delta Y.
   */
  getDeltaY() {
    return this.#end.getY() - this.#begin.getY();
  }

  /**
   *  Quantify the bidimensional line according to view information.
   *  Returns the length (main axis) and width (short axis) if available.
   *
   *  @param {ViewController} viewController The associated view controller.
   *  @returns {{
   *    longAxis: { value: number, unit: string },
   *    shortAxis: { value: number, unit: string }
   *  }}
   *    Quantification object.
   */
  quantify(viewController) {
    // Get pixel spacing (default to 1 if not provided)
    const spacing2D = viewController.get2DSpacing?.() ?? {x: 1, y: 1};

    // Calculate the main (long) axis length in world units
    const longLine = new Line(this.#begin, this.#end);
    const longWorld = longLine.getWorldLength(spacing2D);

    let shortWorld = null;

    if (
      typeof this.shortAxisLength === 'number' &&
      !Number.isNaN(this.shortAxisLength)
    ) {
      const dx = this.getDeltaX();
      const dy = this.getDeltaY();
      const len = this.getLength();

      if (len > 0) {
        // 1. FIX POSITION: Use shortAxisT instead of getCentroid()
        const t = typeof this.shortAxisT === 'number' ? this.shortAxisT : 0.5;
        const anchorX = this.#begin.getX() + dx * t;
        const anchorY = this.#begin.getY() + dy * t;
        const anchorPoint = new Point2D(anchorX, anchorY);

        // Perpendicular direction
        const px = -dy / len;
        const py = dx / len;

        const l1 = typeof this.shortAxisL1 === 'number'
          ? this.shortAxisL1
          : this.shortAxisLength / 2;
        const l2 = typeof this.shortAxisL2 === 'number'
          ? this.shortAxisL2
          : this.shortAxisLength / 2;

        // Calculate endpoints using the specific side lengths
        const p1 = new Point2D(
          anchorPoint.getX() + px * l1,
          anchorPoint.getY() + py * l1
        );
        const p2 = new Point2D(
          anchorPoint.getX() - px * l2,
          anchorPoint.getY() - py * l2
        );

        shortWorld = new Line(p1, p2).getWorldLength(spacing2D);

        this.shortAxisCenter = anchorPoint;
      }
    }

    const unit = viewController.getLengthUnit?.() ?? 'mm';
    const hasShort = typeof shortWorld === 'number' && !isNaN(shortWorld);

    return {
      longAxis: {
        value: hasShort
          ? Math.max(longWorld, shortWorld)
          : longWorld,
        unit
      },
      shortAxis: {
        value: hasShort ? Math.min(longWorld, shortWorld) : null,
        unit
      }
    };
  }
}