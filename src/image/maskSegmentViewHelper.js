import {logger} from '../utils/logger.js';

/**
 * Mask segment view helper: handles hidden segments.
 */
export class MaskSegmentViewHelper {

  /**
   * List of hidden segment numbers.
   *
   * @type {number[]}
   */
  #hiddenNumbers = [];

  /**
   * Get the index of a segment in the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {number} The index in the array, -1 if not found.
   */
  #findHiddenIndex(segmentNumber) {
    return this.#hiddenNumbers.indexOf(segmentNumber);
  }

  /**
   * Check if a segment is in the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   * @returns {boolean} True if the segment is in the list.
   */
  isHidden(segmentNumber) {
    return this.#findHiddenIndex(segmentNumber) !== -1;
  }

  /**
   * Add a segment to the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   */
  addToHidden(segmentNumber) {
    if (!this.isHidden(segmentNumber)) {
      this.#hiddenNumbers.push(segmentNumber);
    } else {
      logger.warn(
        `Not hidding segment, it is allready in the hidden list: ${
          segmentNumber }`);
    }
  }

  /**
   * Remove a segment from the hidden list.
   *
   * @param {number} segmentNumber The segment number.
   */
  removeFromHidden(segmentNumber) {
    const index = this.#findHiddenIndex(segmentNumber);
    if (index !== -1) {
      this.#hiddenNumbers.splice(index, 1);
    } else {
      logger.warn(
        `Cannot remove segment, it is not in the hidden list: ${
          segmentNumber }`);
    }
  }
}