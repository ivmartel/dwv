/**
 * Minimum window width value.
 *
 * @see http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.11.html#sect_C.11.2.1.2
 */
const MinWindowWidth = 1;

export const defaultPresets = {
  CT: {
    mediastinum: {center: 40, width: 400},
    lung: {center: -500, width: 1500},
    bone: {center: 500, width: 2000},
    brain: {center: 40, width: 80},
    head: {center: 90, width: 350}
  }
};

/**
 * Validate an input window width.
 *
 * @param {number} value The value to test.
 * @returns {number} A valid window width.
 */
export function validateWindowWidth(value) {
  return value < MinWindowWidth ? MinWindowWidth : value;
}

/**
 * WindowLevel class.
 * <br>Pseudo-code:
 * <pre>
 *  if (x &lt;= c - 0.5 - (w-1)/2), then y = ymin
 *  else if (x > c - 0.5 + (w-1)/2), then y = ymax,
 *  else y = ((x - (c - 0.5)) / (w-1) + 0.5) * (ymax - ymin) + ymin
 * </pre>
 *
 * @see DICOM doc for [Window Center and Window Width]{@link http://dicom.nema.org/dicom/2013/output/chtml/part03/sect_C.11.html#sect_C.11.2.1.2}
 * @param {number} center The window center.
 * @param {number} width The window width.
 * @class
 */
export class WindowLevel {

  #center;
  #width;

  constructor(center, width) {
    // check width
    if (width < MinWindowWidth) {
      throw new Error('Window width shall always be greater than or equal to ' +
        MinWindowWidth);
    }
    this.#center = center;
    this.#width = width;

    this.#init();
  }

  /**
   * Signed data offset. Defaults to 0.
   *
   * @private
   * @type {number}
   */
  #signedOffset = 0;

  /**
   * Output value minimum. Defaults to 0.
   *
   * @private
   * @type {number}
   */
  #ymin = 0;

  /**
   * Output value maximum. Defaults to 255.
   *
   * @private
   * @type {number}
   */
  #ymax = 255;

  /**
   * Input value minimum (calculated).
   *
   * @private
   * @type {number}
   */
  #xmin = null;

  /**
   * Input value maximum (calculated).
   *
   * @private
   * @type {number}
   */
  #xmax = null;

  /**
   * Window level equation slope (calculated).
   *
   * @private
   * @type {number}
   */
  #slope = null;

  /**
   * Window level equation intercept (calculated).
   *
   * @private
   * @type {number}
   */
  #inter = null;

  /**
   * Initialise members. Called at construction.
   *
   * @private
   */
  #init() {
    const c = this.#center + this.#signedOffset;
    // from the standard
    this.#xmin = c - 0.5 - ((this.#width - 1) / 2);
    this.#xmax = c - 0.5 + ((this.#width - 1) / 2);
    // develop the equation:
    // y = ( ( x - (c - 0.5) ) / (w-1) + 0.5 ) * (ymax - ymin) + ymin
    // y = ( x / (w-1) ) * (ymax - ymin) +
    //     ( -(c - 0.5) / (w-1) + 0.5 ) * (ymax - ymin) + ymin
    this.#slope = (this.#ymax - this.#ymin) / (this.#width - 1);
    this.#inter = (-(c - 0.5) / (this.#width - 1) + 0.5) *
      (this.#ymax - this.#ymin) + this.#ymin;
  }

  /**
   * Get the window center.
   *
   * @returns {number} The window center.
   */
  getCenter() {
    return this.#center;
  }

  /**
   * Get the window width.
   *
   * @returns {number} The window width.
   */
  getWidth() {
    return this.#width;
  }

  /**
   * Set the output value range.
   *
   * @param {number} min The output value minimum.
   * @param {number} max The output value maximum.
   */
  setRange(min, max) {
    this.#ymin = parseInt(min, 10);
    this.#ymax = parseInt(max, 10);
    // re-initialise
    this.#init();
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
      return parseInt(((value * this.#slope) + this.#inter), 10);
    }
  }

  /**
   * Check for window level equality.
   *
   * @param {object} rhs The other window level to compare to.
   * @returns {boolean} True if both window level are equal.
   */
  equals(rhs) {
    return rhs !== null &&
      this.getCenter() === rhs.getCenter() &&
      this.getWidth() === rhs.getWidth();
  }

  /**
   * Get a string representation of the window level.
   *
   * @returns {string} The window level as a string.
   */
  toString() {
    return (this.getCenter() + ', ' + this.getWidth());
  }

} // class WindowLevel
