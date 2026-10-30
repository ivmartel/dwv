import {VoiLutFunctionNames} from './voiLut.js';

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

} // WindowLevel class

/**
 * Check for window level equality.
 *
 * @param {WindowLevel} wl0 The first window level.
 * @param {WindowLevel} wl1 The second window level.
 * @returns {boolean} True if both objects are equal.
 */
export function equalWl(wl0, wl1) {
  return wl0 !== null &&
    typeof wl0 !== 'undefined' &&
    wl1 !== null &&
    typeof wl1 !== 'undefined' &&
    wl0.center === wl1.center &&
    wl0.width === wl1.width;
}

/**
 * Get the minimum window width allowed by a VOI LUT function:
 * LINEAR requires a width of at least 1, LINEAR_EXACT and SIGMOID
 * require a strictly positive width (the epsilon avoids a division
 * by zero).
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1}.
 *
 * @param {string} [voiLutFunctionName] The VOI LUT function name,
 *   defaults to 'LINEAR'.
 * @returns {number} The minimum window width.
 */
export function getMinWindowWidth(voiLutFunctionName) {
  let minWindowWidth = 1;
  if (voiLutFunctionName === VoiLutFunctionNames.linear_exact ||
    voiLutFunctionName === VoiLutFunctionNames.sigmoid) {
    minWindowWidth = Number.EPSILON;
  }
  return minWindowWidth;
}

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

  // apply the minimum after the range limit: the width minimum
  // takes precedence for data with a small range
  let widthBound = wl.width;
  widthBound = Math.min(widthBound, range.max - range.min);
  widthBound = Math.max(widthBound, getMinWindowWidth(voiLutFunctionName));

  return new WindowLevel(centerBound, widthBound);
}
