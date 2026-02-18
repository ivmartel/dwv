import {Point2D} from './point.js';
import {Line} from './line.js';

// doc imports
/* eslint-disable no-unused-vars */
import {ViewController} from '../app/viewController.js';
import {Annotation} from '../image/annotation.js';
/* eslint-enable no-unused-vars */

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
    /**
     * Center of the short axis.
     *
     * @type {Point2D|undefined}
     */
    this.shortAxisCenter = undefined;

    /**
     * Short axis T value.
     *
     * @type {number|undefined}
     */
    this.shortAxisT = undefined;

    /**
     * Short axis L1 value.
     *
     * @type {number|undefined}
     */
    this.shortAxisL1 = undefined;

    /**
     * Short axis L2 value.
     *
     * @type {number|undefined}
     */
    this.shortAxisL2 = undefined;

    /**
     * Short axis length.
     *
     * @type {number|undefined}
     */
    this.shortAxisLength = undefined;

    /**
     * Indicates if the annotation has short axis interaction.
     *
     * @type {boolean}
     */
    this.hasShortAxisInteraction = false;
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
    return Math.hypot(dx, dy);
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

    const hasShort =
      typeof shortWorld === 'number' && !Number.isNaN(shortWorld);

    let res;
    if (longWorld !== null) {
      res = {
        longAxis: {
          value: hasShort
            ? Math.max(longWorld, shortWorld)
            : longWorld,
          unit: viewController.getLengthUnit()
        },
        shortAxis: {
          value: hasShort ? Math.min(longWorld, shortWorld) : null,
          unit: viewController.getLengthUnit()
        }
      };
    }
    return res;
  }

  /**
   * Restore all bidimensional (short axis) properties from quantification data
   * and a BidimensionalLine instance to the annotation object.
   * This ensures that after loading from a saved drawing, the annotation has
   * all the properties needed for correct display and quantification.
   *
   * @param {Annotation} annotation The annotation to update.
   * @param {BidimensionalLine} bidim The BidimensionalLine math shape.
   * @param {object} quant The quantification object containing
   *   saved properties.
   */
  static restorePropertiesFromQuantification(annotation, bidim, quant) {
    if (typeof quant.shortAxisLength === 'number') {
      bidim.shortAxisLength = quant.shortAxisLength;
    }
    if (typeof quant.shortAxisT === 'number') {
      bidim.shortAxisT = quant.shortAxisT;
    }
    annotation.mathShape = bidim;

    // Recalculate endpoints and all derived properties
    // This logic mirrors the previous restoreBidimensionalProperties
    // (requires annotation to have mathShape set)
    if (typeof annotation.getFactory === 'function' &&
      typeof annotation.getFactory().getShortAxisEndpoints === 'function') {
      const factory = annotation.getFactory();
      const [sa1, sa2] = factory.getShortAxisEndpoints(annotation);
      if (sa1 && sa2) {
        const main0 = bidim.getBegin();
        const main1 = bidim.getEnd();
        const centerX = (sa1.getX() + sa2.getX()) / 2;
        const centerY = (sa1.getY() + sa2.getY()) / 2;
        annotation.mathShape.shortAxisCenter = {x: centerX, y: centerY};

        const dx = main1.getX() - main0.getX();
        const dy = main1.getY() - main0.getY();
        const len = Math.sqrt(dx * dx + dy * dy);
        let t = 0.5;
        if (len > 0) {
          const ux = dx / len;
          const uy = dy / len;
          const vx = centerX - main0.getX();
          const vy = centerY - main0.getY();
          t = Math.max(0, Math.min(1, (vx * ux + vy * uy) / len));
        }
        annotation.mathShape.shortAxisT = t;

        const l1 = Math.sqrt(
          Math.pow(sa1.getX() - centerX, 2) + Math.pow(sa1.getY() - centerY, 2)
        );
        const l2 = Math.sqrt(
          Math.pow(sa2.getX() - centerX, 2) + Math.pow(sa2.getY() - centerY, 2)
        );
        annotation.mathShape.shortAxisL1 = l1;
        annotation.mathShape.shortAxisL2 = l2;
        annotation.mathShape.shortAxisLength = l1 + l2;
      }
    }
  }
}