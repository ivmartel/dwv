// doc imports
/* eslint-disable no-unused-vars */
import {WindowLevel} from './windowLevel';
/* eslint-enable no-unused-vars */

/**
 * VOI (Values of Interest) LUT class: apply window centre and width.
 *
 * ```
 * if (x <= c - 0.5 - (w-1)/2) then y = ymin
 * else if (x > c - 0.5 + (w-1)/2) then y = ymax
 * else y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin) + ymin
 * ```
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.2.html}.
 */
export class VoiLut {

  /**
   * The window and level.
   *
   * @type {WindowLevel}
   */
  #windowLevel;

  /**
   * Signed data offset. Defaults to 0.
   *
   * @type {number}
   */
  #signedOffset = 0;

  /**
   * Output value minimum. Defaults to 0.
   *
   * @type {number}
   */
  #ymin = 0;

  /**
   * Output value maximum. Defaults to 255.
   *
   * @type {number}
   */
  #ymax = 255;

  /**
   * Input value minimum (calculated).
   *
   * @type {number}
   */
  #xmin = null;

  /**
   * Input value maximum (calculated).
   *
   * @type {number}
   */
  #xmax = null;

  /**
   * Window level equation slope (calculated).
   *
   * @type {number}
   */
  #slope = null;

  /**
   * Window level equation intercept (calculated).
   *
   * @type {number}
   */
  #inter = null;

  /**
   * @param {WindowLevel} wl The window center and width.
   */
  constructor(wl) {
    this.#windowLevel = wl;
    this.#init();
  }

  /**
   * Get the window and level.
   *
   * @returns {WindowLevel} The window center and width.
   */
  getWindowLevel() {
    return this.#windowLevel;
  }

  /**
   * Initialise members. Called at construction.
   *
   */
  #init() {
    const center = this.#windowLevel.center;
    const width = this.#windowLevel.width;
    const c = center + this.#signedOffset;
    // from the standard
    this.#xmin = c - 0.5 - ((width - 1) / 2);
    this.#xmax = c - 0.5 + ((width - 1) / 2);
    // develop the equation:
    // y = ( ( x - (c - 0.5) ) / (w-1) + 0.5 ) * (ymax - ymin) + ymin
    // y = ( x / (w-1) ) * (ymax - ymin) +
    //     ( -(c - 0.5) / (w-1) + 0.5 ) * (ymax - ymin) + ymin
    this.#slope = (this.#ymax - this.#ymin) / (width - 1);
    this.#inter = (-(c - 0.5) / (width - 1) + 0.5) *
      (this.#ymax - this.#ymin) + this.#ymin;
  }

  /**
   * Set the signed offset.
   *
   * @param {number} offset The signed data offset,
   *   typically: slope * ( size / 2).
   */
  setSignedOffset(offset) {
    this.#signedOffset = offset;
    // re-initialise
    this.#init();
  }

  /**
   * Apply the window level on an input value.
   *
   * @param {number} value The value to rescale as an integer.
   * @returns {number} The leveled value, in the
   *  [ymin, ymax] range (default [0,255]).
   */
  apply(value) {
    if (value <= this.#xmin) {
      return this.#ymin;
    } else if (value > this.#xmax) {
      return this.#ymax;
    } else {
      return (value * this.#slope) + this.#inter;
    }
  }

} // class VoiLut
