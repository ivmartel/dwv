import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from './image';
import {MaskSegment} from '../dicom/dicomSegment';
/* eslint-enable no-unused-vars */

/**
 * Mask segment helper: helps handling the segments list,
 *   but does *NOT* update the associated mask (use special commands
 *   for that such as DeleteSegmentCommand, ChangeSegmentColourCommand...).
 */
export class MaskSegmentHelper {

  /**
   * The associated mask.
   *
   * @type {Image}
   */
  #mask;

  /**
   * The segments: array of segment description.
   *
   * @type {MaskSegment[]}
   */
  #segments;

  /**
   * @param {Image} mask The associated mask image.
   */
  constructor(mask) {
    this.#mask = mask;
    // check segments in meta
    const meta = mask.getMeta();
    if (typeof meta.custom === 'undefined') {
      meta.custom = {};
    }
    if (typeof meta.custom.segments === 'undefined') {
      meta.custom.segments = [];
    }
    this.#segments = meta.custom.segments;
  }

  /**
   * Find the index of a segment in the segments list.
   *
   * @param {number} segmentNumber The number to find.
   * @returns {number} The index in the segments list, -1 if not found.
   */
  #findSegmentIndex(segmentNumber) {
    return this.#segments.findIndex(function (item) {
      return item.number === segmentNumber;
    });
  }

  /**
   * Check if a segment is part of the segments list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {boolean} True if the segment is included.
   */
  hasSegment(segmentNumber) {
    return this.#findSegmentIndex(segmentNumber) !== -1;
  }

  /**
   * Check if a segment is present in a mask image.
   *
   * @param {number[]} numbers Array of segment numbers.
   * @returns {boolean[]} Array of boolean set to true
   *   if the segment is present in the mask.
   */
  maskHasSegments(numbers) {
    // create values using displayValue
    const values = [];
    const unknowns = [];
    for (let i = 0; i < numbers.length; ++i) {
      const segment = this.getSegment(numbers[i]);
      if (typeof segment !== 'undefined') {
        if (typeof segment.displayValue !== 'undefined') {
          values.push(segment.displayValue);
        } else {
          values.push(segment.displayRGBValue);
        }
      } else {
        logger.warn('Unknown segment in maskHasSegments: ' + numbers[i]);
        unknowns.push(i);
      }
    }
    const res = this.#mask.hasValues(values);
    // insert unknowns as false in result
    for (let j = 0; j < unknowns.length; ++j) {
      res.splice(unknowns[j], 0, false);
    }
    return res;
  }

  /**
   * Get a segment from the inner segment list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {MaskSegment|undefined} The segment or undefined if not found.
   */
  getSegment(segmentNumber) {
    let segment;
    const index = this.#findSegmentIndex(segmentNumber);
    if (index !== -1) {
      segment = this.#segments[index];
    }
    return segment;
  }

  /**
   * Add a segment to the segments list.
   *
   * @param {MaskSegment} segment The segment to add.
   */
  addSegment(segment) {
    const index = this.#findSegmentIndex(segment.number);
    if (index === -1) {
      this.#segments.push(segment);
    } else {
      logger.warn(
        'Not adding segment, it is allready in the segments list: ' +
          segment.number);
    }
  }

  /**
   * Remove a segment from the segments list.
   *
   * @param {number} segmentNumber The segment number.
   */
  removeSegment(segmentNumber) {
    const index = this.#findSegmentIndex(segmentNumber);
    if (index !== -1) {
      this.#segments.splice(index, 1);
    } else {
      logger.warn(
        'Cannot remove segment, it is not in the segments list: ' +
          segmentNumber);
    }
  }

  /**
   * Update a segment of the segments list.
   *
   * @param {MaskSegment} segment The segment to update.
   */
  updateSegment(segment) {
    const index = this.#findSegmentIndex(segment.number);
    if (index !== -1) {
      this.#segments[index] = segment;
    } else {
      logger.warn(
        'Cannot update segment, it is not in the segments list: ' +
          segment.number);
    }
  }

} // class MaskSegmentHelper
