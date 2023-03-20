/**
 * Window LUT class.
 * Typically converts from float to integer.
 *
 * @class
 * @param {number} rescaleLut The associated rescale LUT.
 * @param {boolean} isSigned Flag to know if the data is signed or not.
 */
export class WindowLut {

  #rescaleLut;
  #isSigned;

  constructor(rescaleLut, isSigned) {
    this.#rescaleLut = rescaleLut;
    this.#isSigned = isSigned;
  }
  /**
   * The internal array: Uint8ClampedArray clamps between 0 and 255.
   *
   * @private
   * @type {Uint8ClampedArray}
   */
  #lut = null;

  /**
   * The window level.
   *
   * @private
   * @type {object}
   */
  #windowLevel = null;

  /**
   * Flag to know if the lut is ready or not.
   *
   * @private
   * @type {boolean}
   */
  #isReady = false;

  /**
   * Shift for signed data.
   *
   * @private
   * @type {number}
   */
  #signedShift = 0;

  /**
   * Get the window / level.
   *
   * @returns {object} The window / level.
   */
  getWindowLevel() {
    return this.#windowLevel;
  }

  /**
   * Get the signed flag.
   *
   * @returns {boolean} The signed flag.
   */
  isSigned() {
    return this.#isSigned;
  }

  /**
   * Get the rescale lut.
   *
   * @returns {object} The rescale lut.
   */
  getRescaleLut() {
    return this.#rescaleLut;
  }

  /**
   * Is the lut ready to use or not? If not, the user must
   * call 'update'.
   *
   * @returns {boolean} True if the lut is ready to use.
   */
  isReady() {
    return this.#isReady;
  }

  /**
   * Set the window center and width.
   *
   * @param {object} wl The window level.
   */
  setWindowLevel(wl) {
    // store the window values
    this.#windowLevel = wl;
    // possible signed shift
    this.#signedShift = 0;
    this.#windowLevel.setSignedOffset(0);
    if (this.#isSigned) {
      var size = this.#rescaleLut.getLength();
      this.#signedShift = size / 2;
      this.#windowLevel.setSignedOffset(
        this.#rescaleLut.getRSI().getSlope() * this.#signedShift);
    }
    // update ready flag
    this.#isReady = false;
  }

  /**
   * Update the lut if needed..
   */
  update() {
    // check if we need to update
    if (this.#isReady) {
      return;
    }

    // check rescale lut
    if (!this.#rescaleLut.isReady()) {
      this.#rescaleLut.initialise();
    }
    // create window lut
    var size = this.#rescaleLut.getLength();
    if (!this.#lut) {
      // use clamped array (polyfilled in env.js)
      this.#lut = new Uint8ClampedArray(size);
    }
    // by default WindowLevel returns a value in the [0,255] range
    // this is ok with regular Arrays and ClampedArray.
    for (var i = 0; i < size; ++i) {
      this.#lut[i] = this.#windowLevel.apply(this.#rescaleLut.getValue(i));
    }

    // update ready flag
    this.#isReady = true;
  }

  /**
   * Get the length of the LUT array.
   *
   * @returns {number} The length of the LUT array.
   */
  getLength() {
    return this.#lut.length;
  }

  /**
   * Get the value of the LUT at the given offset.
   *
   * @param {number} offset The input offset in [0,2^bitsStored] range.
   * @returns {number} The integer value (default [0,255]) of the LUT
   *   at the given offset.
   */
  getValue(offset) {
    return this.#lut[offset + this.#signedShift];
  }

} // class WindowLut
