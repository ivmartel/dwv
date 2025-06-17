import {VoiLutFunctionNames} from './voiLut.js';

/**
 * Validate and constrain an input window level.
 *
 * @param {WindowLevel} wl The window level to validate.
 * @param {object} range The image pixel data range.
 * @param {string} [voiLutFunctionName] The VOI LUT function name,
 *   defaults to 'LINEAR'.
 * @returns {WindowLevel|undefined} A valid window level.
 */
export function validateWindowLevel(
  wl,
  range,
  voiLutFunctionName
) {
  if (typeof wl === 'undefined') {
    return;
  }

  let centerBound = wl.center;
  centerBound = Math.min(centerBound, range.max);
  centerBound = Math.max(centerBound, range.min);

  // width minimum depends on voi lut function
  // see https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1
  // (use linear min as default)
  let minWindowWidth = 1;
  if (typeof voiLutFunctionName !== 'undefined' &&
    (voiLutFunctionName === VoiLutFunctionNames.linear_exact ||
    voiLutFunctionName === VoiLutFunctionNames.sigmoid)) {
    minWindowWidth = 0;
  }

  let widthBound = wl.width;
  widthBound = Math.max(widthBound, minWindowWidth);
  widthBound = Math.min(widthBound, range.max - range.min);

  return new WindowLevel(centerBound, widthBound);
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
