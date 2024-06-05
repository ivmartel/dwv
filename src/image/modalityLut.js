// doc imports
/* eslint-disable no-unused-vars */
import {RescaleSlopeAndIntercept} from './rsi';
/* eslint-enable no-unused-vars */

/**
 * Modality LUT class: compensates for any modality-specific presentation.
 * Typically consists of a rescale slope and intercept to
 * rescale the data range.
 *
 * Ref: {@link https://dicom.nema.org/medical/dicom/2022a/output/chtml/part03/sect_C.11.html}.
 */
export class ModalityLut {

  /**
   * The rescale slope.
   *
   * @type {RescaleSlopeAndIntercept}
   */
  #rsi;

  /**
   * Is the RSI an identity one.
   *
   * @type {boolean}
   */
  #isIdRsi;

  /**
   * The size of the LUT array.
   *
   * @type {number}
   */
  #length;

  /**
   * The internal LUT array.
   *
   * @type {Float32Array}
   */
  #lut;

  /**
   * @param {RescaleSlopeAndIntercept} rsi The rescale slope and intercept.
   * @param {number} bitsStored The number of bits used to store the data.
   */
  constructor(rsi, bitsStored) {
    this.#rsi = rsi;
    this.#isIdRsi = rsi.isID();

    this.#length = Math.pow(2, bitsStored);

    // create lut if not identity RSI
    if (!this.#isIdRsi) {
      this.#lut = new Float32Array(this.#length);
      for (let i = 0; i < this.#length; ++i) {
        this.#lut[i] = this.#rsi.apply(i);
      }
    }
  }

  /**
   * Get the Rescale Slope and Intercept (RSI).
   *
   * @returns {RescaleSlopeAndIntercept} The rescale slope and intercept object.
   */
  getRSI() {
    return this.#rsi;
  }

  /**
   * Get the length of the LUT array.
   *
   * @returns {number} The length of the LUT array.
   */
  getLength() {
    return this.#length;
  }

  /**
   * Get the value of the LUT at the given offset.
   *
   * @param {number} offset The input offset in [0,2^bitsStored] range
   *   or full range for ID rescale.
   * @returns {number} The float32 value of the LUT at the given offset.
   */
  getValue(offset) {
    return this.#isIdRsi ? offset : this.#lut[offset];
  }

} // class ModalityLut
