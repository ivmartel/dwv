/**
 * GradSquarePixGenerator
 * Generates pixel data as a small gradient square.
 *
 * @param {object} options The generator options.
 * @class
 */
export class GradSquarePixGenerator {

  #numberOfColumns;
  #numberOfRows;
  #numberOfSamples;
  #numberOfColourPlanes;
  #isRGB;

  #halfCols;
  #halfRows;
  #maxNoBounds;

  #background = 0;
  #max = 100;

  constructor(options) {
    this.#numberOfColumns = options.numberOfColumns;
    this.#numberOfRows = options.numberOfRows;
    this.#numberOfSamples = options.numberOfSamples;
    this.#numberOfColourPlanes = options.numberOfColourPlanes;
    this.#isRGB = options.photometricInterpretation === 'RGB';

    this.#halfCols = this.#numberOfColumns * 0.5;
    this.#halfRows = this.#numberOfRows * 0.5;
    this.#maxNoBounds = (this.#halfCols + this.#halfCols / 2) *
      (this.#halfRows + this.#halfRows / 2);
  }

  generate(pixelBuffer, sliceNumber) {
    // slice dependent max
    this.#max = 100 + sliceNumber * 100;

    // main loop
    var offset = 0;
    for (var c = 0; c < this.#numberOfColourPlanes; ++c) {
      for (var j = 0; j < this.#numberOfRows; ++j) {
        for (var i = 0; i < this.#numberOfColumns; ++i) {
          for (var s = 0; s < this.#numberOfSamples; ++s) {
            if (this.#numberOfColourPlanes !== 1) {
              pixelBuffer[offset] = this.getValue(i, j)[c];
            } else {
              pixelBuffer[offset] = this.getValue(i, j)[s];
            }
            ++offset;
          }
        }
      }
    }
  }

  getValue(i, j) {
    if (this.#isRGB) {
      return this.getRGB(i, j);
    } else {
      return this.getGrey(i, j);
    }
  }

  /**
   * Get a grey value.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {Array} The grey value.
   */
  getGrey(i, j) {
    let value = this.#background;
    var jc = Math.abs(j - this.#halfRows);
    var ic = Math.abs(i - this.#halfCols);
    if (jc < this.#halfRows / 2 && ic < this.#halfCols / 2) {
      value += (i * j) * (this.#max / this.#maxNoBounds);
    }
    return [value];
  }

  /**
   * Get RGB values.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {Array} The [R,G,B] values.
   */
  getRGB(i, j) {
    var value = 0;
    var jc = Math.abs(j - this.#halfRows);
    var ic = Math.abs(i - this.#halfCols);
    if (jc < this.#halfRows / 2 && ic < this.#halfCols / 2) {
      value += (i * j) * (this.#max / this.#maxNoBounds);
    }
    if (value > 255) {
      value = 200;
    }
    return [0, value, value];
  }

} // class GradSquarePixGenerator
