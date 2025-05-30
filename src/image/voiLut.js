// doc imports
/* eslint-disable no-unused-vars */
import {WindowLevel} from './windowLevel.js';
/* eslint-enable no-unused-vars */

/**
 * VOI linear function.
 *
 * ```
 * if (x <= c - 0.5 - (w-1)/2) then y = ymin
 * else if (x > c - 0.5 + (w-1)/2) then y = ymax
 * else y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin) + ymin
 * ```
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1.2.1}.
 */
export class VoiLinearFunction {
  /**
   * Input value minimum.
   *
   * @type {number}
   */
  #xmin;

  /**
   * Input value maximum.
   *
   * @type {number}
   */
  #xmax;

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
   * Function slope.
   *
   * @type {number}
   */
  #slope;

  /**
   * Function intercept.
   *
   * @type {number}
   */
  #intercept;

  /**
   * @param {number} center The window level center.
   * @param {number} width The window level width.
   */
  constructor(center, width) {
    // from the standard
    this.#xmin = center - 0.5 - ((width - 1) / 2);
    this.#xmax = center - 0.5 + ((width - 1) / 2);
    // pre-calculate slope and intercept
    this.#slope = (this.#ymax - this.#ymin) / (width - 1);
    this.#intercept = (-(center - 0.5) / (width - 1) + 0.5) *
      (this.#ymax - this.#ymin) + this.#ymin;
  }

  /**
   * Get the value of the function at a given number.
   *
   * @param {number} x The input value.
   * @returns {number} The value of the function at x.
   */
  getY(x) {
    let res;
    if (x <= this.#xmin) {
      res = this.#ymin;
    } else if (x > this.#xmax) {
      res = this.#ymax;
    } else {
      res = (x * this.#slope) + this.#intercept;
    }
    return res;
  }
}

/**
 * VOI (Values of Interest) LUT class: apply window centre and width
 * using a VOI function.
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
   * VOI function.
   *
   * @type {VoiLinearFunction}
   */
  #voiFunction;

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
   */
  #init() {
    const center = this.#windowLevel.center;
    const width = this.#windowLevel.width;
    const c = center + this.#signedOffset;

    this.#voiFunction = new VoiLinearFunction(c, width);
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
   * @returns {number} The leveled value, in the [0,255] range.
   */
  apply(value) {
    return this.#voiFunction.getY(value);
  }

} // class VoiLut
