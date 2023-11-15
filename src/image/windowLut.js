// doc imports
/* eslint-disable no-unused-vars */
import {ModalityLut} from './modalityLut';
import {VoiLut} from './voiLut';
/* eslint-enable no-unused-vars */

/**
 * Window LUT class.
 * Typically converts from float to integer.
 */
export class WindowLut {

  /**
   * The modality LUT.
   *
   * @type {ModalityLut}
   */
  #modalityLut;

  /**
   * The window level.
   *
   * @type {VoiLut}
   */
  #windowLevel;

  /**
   * The internal LUT array: Uint8ClampedArray clamps between 0 and 255.
   *
   * @type {Uint8ClampedArray}
   */
  #lut;

  /**
   * Shift for signed data.
   *
   * @type {number}
   */
  #signedShift = 0;

  /**
   * Is the RSI discrete.
   *
   * @type {boolean}
   */
  #isDiscrete = true;

  /**
   * Construct a window LUT object, window level is set with
   *   the 'setWindowLevel' method.
   *
   * @param {ModalityLut} modalityLut The associated rescale LUT.
   * @param {boolean} isSigned Flag to know if the data is signed or not.
   * @param {boolean} isDiscrete Flag to know if the input data is discrete.
   */
  constructor(modalityLut, isSigned, isDiscrete) {
    this.#modalityLut = modalityLut;

    if (isSigned) {
      const size = this.#modalityLut.getLength();
      this.#signedShift = size / 2;
    } else {
      this.#signedShift = 0;
    }

    this.#isDiscrete = isDiscrete;
  }

  /**
   * Get the window / level.
   *
   * @returns {VoiLut} The window / level.
   */
  getWindowLevel() {
    return this.#windowLevel;
  }

  /**
   * Get the modality lut.
   *
   * @returns {ModalityLut} The modality lut.
   */
  getModalityLut() {
    return this.#modalityLut;
  }

  /**
   * Set the window center and width.
   *
   * @param {VoiLut} wl The window level.
   */
  setWindowLevel(wl) {
    // store the window values
    this.#windowLevel = wl;

    // possible signed shift (LUT indices are positive)
    this.#windowLevel.setSignedOffset(
      this.#modalityLut.getRSI().getSlope() * this.#signedShift);

    // create lut if not continous
    if (this.#isDiscrete) {
      const size = this.#modalityLut.getLength();
      // use clamped array (polyfilled in env.js)
      this.#lut = new Uint8ClampedArray(size);
      // by default WindowLevel returns a value in the [0,255] range
      // this is ok with regular Arrays and ClampedArray.
      for (let i = 0; i < size; ++i) {
        this.#lut[i] = this.#windowLevel.apply(this.#modalityLut.getValue(i));
      }
    }
  }

  /**
   * Get the value of the LUT at the given offset.
   *
   * @param {number} offset The input offset in [0,2^bitsStored] range
   *   for discrete data or full range for non discrete.
   * @returns {number} The integer value (default [0,255]) of the LUT
   *   at the given offset.
   */
  getValue(offset) {
    if (this.#isDiscrete) {
      return this.#lut[offset + this.#signedShift];
    } else {
      return Math.floor(this.#windowLevel.apply(offset + this.#signedShift));
    }
  }

} // class WindowLut
