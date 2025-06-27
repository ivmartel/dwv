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
        'Not hidding segment, it is allready in the hidden list: ' +
          segmentNumber);
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
        'Cannot remove segment, it is not in the hidden list: ' +
          segmentNumber);
    }
  }

  /**
   * @callback alphaFn
   * @param {number|number[]} value The pixel value.
   * @param {number} index The values' index.
   * @returns {number} The opacity of the input value.
   */

  /**
   * Get the alpha function to apply hidden colors.
   *
   * @returns {alphaFn} The corresponding alpha function.
   */
  getAlphaFunc() {
    // create alpha function
    // (zero is hidden by default)
    return (value/*, index*/) => {
      if (!Array.isArray(value) && (
        value === 0 ||
        this.#hiddenNumbers.includes(value))) {
        return 0;
      }
      // default
      return 255;
    };
  }
}