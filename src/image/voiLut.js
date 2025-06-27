import {logger} from '../utils/logger.js';

// doc imports
/* eslint-disable no-unused-vars */
import {WindowLevel} from './windowLevel.js';
/* eslint-enable no-unused-vars */

export const VoiLutFunctionNames = {
  linear: 'LINEAR',
  linear_exact: 'LINEAR_EXACT',
  sigmoid: 'SIGMOID'
};

/**
 * VOI LUT linear function.
 *
 * Can be default linear or linear exact.
 *
 * ```
 * if (x <= c - 0.5 - (w-1)/2) then y = ymin
 * else if (x > c - 0.5 + (w-1)/2) then y = ymax
 * else y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin) + ymin
 * ```
 *
 * ```
 * if (x <= c - w/2), then y = ymin
 * else if (x > c + w/2), then y = ymax
 * else y = ((x - c) / w + 0.5) * (ymax- ymin) + ymin
 * ```
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1.2}.
 */
export class VoiLutLinearFunction {
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
   * @param {boolean} [isExact] Is exact flag, defaults to false.
   */
  constructor(center, width, isExact) {
    if (typeof isExact === 'undefined') {
      isExact = false;
    }
    // from the standard
    let c = center;
    let w = width;
    if (!isExact) {
      c -= 0.5;
      w -= 1;
    }
    this.#xmin = c - (w / 2);
    this.#xmax = c + (w / 2);
    // pre-calculate slope and intercept
    this.#slope = (this.#ymax - this.#ymin) / w;
    this.#intercept = (-c / w + 0.5) *
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
 * VOI LUT sigmoid function.
 *
 * ```
 * y = (ymax − ymin) / (1 + exp(−4 * (x − c) / w)) + ymin
 * ```
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.2.html#sect_C.11.2.1.2}.
 */
export class VoiLutSigmoidFunction {
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
   * Window level center.
   *
   * @type {number}
   */
  #center;

  /**
   * Window level width.
   *
   * @type {number}
   */
  #width;

  /**
   * @param {number} center The window level center.
   * @param {number} width The window level width.
   */
  constructor(center, width) {
    this.#center = center;
    this.#width = width;
  }

  /**
   * Get the value of the function at a given number.
   *
   * @param {number} x The input value.
   * @returns {number} The value of the function at x.
   */
  getY(x) {
    return ((this.#ymax - this.#ymin) /
      (1 + Math.exp(-4 * (x - this.#center) / this.#width))) +
      this.#ymin;
  }
}

/**
 * VOI (Values of Interest) LUT class: apply window centre and width
 * using a VOI LUT function.
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
   * VOI LUT function.
   *
   * @type {VoiLutLinearFunction|VoiLutSigmoidFunction}
   */
  #voiLutFunction;

  /**
   * VOI LUT function name.
   *
   * @type {string}
   */
  #voiLutFunctionName = VoiLutFunctionNames.linear;

  /**
   * @param {WindowLevel} wl The window center and width.
   * @param {string} [voiLutFunctionName] The name of the VOI LUT function,
   *   defaults to 'LINEAR'.
   */
  constructor(wl, voiLutFunctionName) {
    this.#windowLevel = wl;

    if (typeof voiLutFunctionName !== 'undefined') {
      // valid name check
      const names = [];
      for (const key in VoiLutFunctionNames) {
        names.push(VoiLutFunctionNames[key]);
      }
      if (names.includes(voiLutFunctionName)) {
        this.#voiLutFunctionName = voiLutFunctionName;
      } else {
        logger.debug('Unknown VOI LUT function: ' + voiLutFunctionName);
      }
    }

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

    if (this.#voiLutFunctionName === VoiLutFunctionNames.linear_exact) {
      this.#voiLutFunction = new VoiLutLinearFunction(c, width, true);
    } else if (this.#voiLutFunctionName === VoiLutFunctionNames.sigmoid) {
      this.#voiLutFunction = new VoiLutSigmoidFunction(c, width);
    } else {
      // default case
      this.#voiLutFunction = new VoiLutLinearFunction(c, width);
    }
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
    return this.#voiLutFunction.getY(value);
  }

} // class VoiLut
