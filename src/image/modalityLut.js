/**
 * @import {RescaleSlopeAndIntercept} from './rsi.js';
 */

/**
 * Maximum number of bits stored for which a pre-computed LUT is created.
 *
 * @type {number}
 */
const MAX_LUT_BITS_STORED = 16;

/**
 * Check if a pre-computed LUT can be created for the input bits stored.
 *
 * @param {number} bitsStored The number of bits used to store the data.
 * @returns {boolean} True if a LUT can be created.
 */
export function isLutBitsStored(bitsStored) {
  return Number.isInteger(bitsStored) &&
    bitsStored > 0 &&
    bitsStored <= MAX_LUT_BITS_STORED;
}

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
   * The size of the LUT array, undefined if the bits stored
   *   do not allow to create a LUT.
   *
   * @type {number|undefined}
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
   * @param {number} [bitsStored] The number of bits used to store the data.
   *   No LUT length is set (see `getLength`) if undefined or larger
   *   than the maximum LUT bits stored (16).
   */
  constructor(rsi, bitsStored) {
    this.#rsi = rsi;
    this.#isIdRsi = rsi.isID();

    if (isLutBitsStored(bitsStored)) {
      this.#length = Math.pow(2, bitsStored);
    }

    // create lut if not identity RSI
    if (!this.#isIdRsi) {
      if (typeof this.#length === 'undefined') {
        throw new Error(
          `Cannot create modality LUT for bits stored: ${bitsStored}`);
      }
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
   * @returns {number|undefined} The length of the LUT array, undefined
   *   if the bits stored do not allow to create a LUT.
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
