import {logger} from '../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from './image.js';
import {MaskSegment} from '../dicom/dicomSegment.js';
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
   * Get the associated mask image.
   *
   * @returns {Image} The mask image.
   */
  getMask() {
    return this.#mask;
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
   * Get the number of segments of the segmentation.
   *
   * @returns {number} The number of segments.
   */
  getNumberOfSegments() {
    return this.#segments.length;
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
          values.push(segment.number);
        }
      } else {
        logger.warn(`Unknown segment in maskHasSegments: ${numbers[i]}`);
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
      // update palette colour map
      if (typeof segment.displayRGBValue !== 'undefined') {
        this.#mask.updatePaletteColourMap(
          segment.number, segment.displayRGBValue);
      }
    } else {
      logger.warn(
        `Not adding segment, it is allready in the segments list: ${
          segment.number }`);
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
        `Cannot remove segment, it is not in the segments list: ${
          segmentNumber }`);
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
        `Cannot update segment, it is not in the segments list: ${
          segment.number }`);
    }
  }

  /**
   * The overlap count of a single segment with another segment.
   *
   * @typedef OverlapCount
   * @property {string} label The segment label.
   * @property {number} count The number of overlapping voxels.
   * @property {number} percentage The overlap percentage between 0 and 100.
   */

  /**
   * The count of overlapping voxels of a single segment with a set of
   * different segments.
   *
   * @typedef Overlap
   * @property {string} label The segment label.
   * @property {Object.<number, OverlapCount>} overlap A Dictionary
   *  containing the counts. The key is the segment number of the overlapping
   *  segment.
   * @property {number} count The voxel volume of this segment.
   */

  /**
   * An Dictionary containing the count of overlapping voxels between two
   * sets of segments.
   * The key is the segment number of a segment in the first set.
   * The value is a Dictionary of all of the segments in the second set
   * that overlap with the key segment.
   *
   * @typedef {Object.<number, Overlap>} OverlapMap
   */

  /**
   * Find the overlap for each segment between two segmentation masks.
   * It is assumed these images have the same orientation.
   *
   * @param {MaskSegmentHelper} rhs The helper of the
   *   segmentation image to find overlap with.
   * @returns {OverlapMap} The overlapping voxel counts. First level is the
   *  segments from this image, second level is the compare image segments.
   */
  findOverlap(rhs) {
    // Find the overlapping slices
    const thisGeometry = this.#mask.getGeometry();
    const thisSize = thisGeometry.getSize();
    const compareMask = rhs.getMask();
    const compareGeometry = compareMask.getGeometry();
    const compareSize = compareGeometry.getSize();

    /**
     * @type {OverlapMap}
     */
    const overlap = {};

    const thisTotalSize = thisSize.getTotalSize();
    for (let i = 0; i < thisTotalSize; i++) {
      const thisValue = this.#mask.getValueAtOffset(i);
      if (thisValue !== 0) {
        if (typeof overlap[thisValue] !== 'undefined') {
          overlap[thisValue].count += 1;
        } else {
          const thisSegment = this.getSegment(thisValue);
          overlap[thisValue] = {
            label: thisSegment.label,
            overlap: {},
            count: 1
          };
        }

        const thisIndex = thisSize.offsetToIndex(i);
        const thisWorld = thisGeometry.indexToWorld(thisIndex);
        const compareIndex = compareGeometry.worldToIndex(thisWorld);
        const compareOffset = compareSize.indexToOffset(compareIndex);
        const compareValue = compareMask.getValueAtOffset(compareOffset);

        if (typeof compareValue !== 'undefined' && compareValue !== 0) {
          if (typeof overlap[thisValue].overlap[compareValue] !== 'undefined') {
            overlap[thisValue].overlap[compareValue].count += 1;
          } else {
            const compareSegment = rhs.getSegment(compareValue);
            overlap[thisValue].overlap[compareValue] = {
              label: compareSegment.label,
              count: 1,
              percentage: 0
            };
          }
        }
      }
    }

    for (const thisOverlap of Object.values(overlap)) {
      for (const overlapCount of Object.values(thisOverlap.overlap)) {
        overlapCount.percentage = overlapCount.count * 100 / thisOverlap.count;
      }
    }

    return overlap;
  }

} // class MaskSegmentHelper
