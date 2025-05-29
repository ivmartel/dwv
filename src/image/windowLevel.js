import {logger} from '../utils/logger.js';

/**
 * Minimum window width value.
 *
 * Ref: {@link http://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1.2}.
 */
const minWindowWidth = 1;

/**
 * Validate and constrain an input window width and center.
 *
 * @param {number} center The center to test.
 * @param {number} width The width to test.
 * @param {number} valueMin The minimum value this width and center is for.
 * @param {number} valueMax The maximum value this width and center is for.
 * @returns {{center: number, width: number}} A valid window width and center.
 */
export function validateWindowWidthAndCenter(
  center,
  width,
  valueMin,
  valueMax
) {
  // Assumes we are using the LINEAR VOI LUT function:
  // https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1.2

  let centerBound = center;
  centerBound = Math.min(valueMax + 0.5 - ((width - 1) * 0.5), centerBound);
  centerBound = Math.max(valueMin + 0.5 + ((width - 1) * 0.5), centerBound);

  let widthBound = width;
  widthBound = Math.max(widthBound, minWindowWidth);
  widthBound =
    Math.min(
      ((valueMax - center + 0.5) * 2) + 1,
      ((center - valueMin - 0.5) * 2) + 1,
      widthBound
    );

  const snapDiff = (valueMax - valueMin) * 0.003;
  const valueCenter = ((valueMax - valueMin) * 0.5) + valueMin;

  if (Math.abs(centerBound - valueMax) <= snapDiff) {
    centerBound = valueMax;
  } else if (Math.abs(centerBound - valueMin) <= snapDiff) {
    centerBound = valueMin;
  } else if (Math.abs(centerBound - valueCenter) <= snapDiff) {
    centerBound = valueCenter;
  }

  if (Math.abs(widthBound - valueMax) <= snapDiff) {
    widthBound = valueMax;
  } else if (Math.abs(widthBound - valueMin) <= snapDiff) {
    widthBound = valueMin;
  }

  return {
    center: centerBound,
    width: widthBound
  };
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
