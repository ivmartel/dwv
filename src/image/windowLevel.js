import {logger} from '../utils/logger.js';

/**
 * Minimum window width value.
 *
 * Ref: {@link http://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1.2}.
 */
const minWindowWidth = 1;

/**
 * Validate an input window width.
 *
 * @param {number} value The value to test.
 * @returns {number} A valid window width.
 */
export function validateWindowWidth(value) {
  return value < minWindowWidth ? minWindowWidth : value;
}

/**
 * Window and Level also known as window width and center.
 */
export class WindowLevel {
  /**
   * The window center.
   *
   * @type {number}
   */
  center;

  /**
   * The window width.
   *
   * @type {number}
   */
  width;

  /**
   * @param {number} center The window center.
   * @param {number} width The window width.
   */
  constructor(center, width) {
    // check width
    if (width < minWindowWidth) {
      logger.warn('Using minimum window width since input is not valid: ' +
        width);
      width = minWindowWidth;
    }
    this.center = center;
    this.width = width;
  }

  /**
   * Check for equality.
   *
   * @param {WindowLevel} rhs The other object to compare to.
   * @returns {boolean} True if both objects are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      typeof rhs !== 'undefined' &&
      this.center === rhs.center &&
      this.width === rhs.width;
  }

} // WindowLevel class
