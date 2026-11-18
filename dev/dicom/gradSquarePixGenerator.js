/**
 * GradSquarePixGenerator: generates pixel data as a small gradient square.
 */
export class GradSquarePixGenerator {

  #numberOfColumns;
  #numberOfRows;
  #numberOfSamples;
  #numberOfColourPlanes;

  #isRGB;

  #minI;
  #minJ;
  #maxI;
  #maxJ;

  #background = 0;
  #maxValue = 255;
  #maxNoBounds = 1;

  /**
   * @param {object} options The generator options.
   */
  constructor(options) {
    this.#numberOfColumns = options.numberOfColumns;
    this.#numberOfRows = options.numberOfRows;
    this.#numberOfSamples = options.numberOfSamples;
    this.#numberOfColourPlanes = options.numberOfColourPlanes;

    this.#isRGB = options.photometricInterpretation === 'RGB';

    // full grad square
    const borderI = 0;
    const borderJ = 0;
    // ~centered grad square
    // const borderI = Math.ceil(numberOfColumns * 0.25);
    // const borderJ = Math.ceil(numberOfRows * 0.25);

    this.#minI = borderI;
    this.#minJ = borderJ;
    this.#maxI = this.#numberOfColumns - borderI;
    this.#maxJ = this.#numberOfRows - borderJ;

    const maxK = this.#maxI;
    this.#maxNoBounds =
      this.#getValue(this.#maxI, this.#maxJ, maxK) / this.#maxValue;
  }

  /**
   * @param {number[]} pixelBuffer The buffer.
   * @param {number} sliceNumber The slice index.
   */
  generate(pixelBuffer, sliceNumber) {
    const getFunc = this.#isRGB ? this.#getRGB : this.#getValue;

    let offset = 0;
    for (let c = 0; c < this.#numberOfColourPlanes; ++c) {
      for (let j = 0; j < this.#numberOfRows; ++j) {
        for (let i = 0; i < this.#numberOfColumns; ++i) {
          for (let s = 0; s < this.#numberOfSamples; ++s) {
            if (this.#numberOfColourPlanes !== 1) {
              pixelBuffer[offset] = getFunc(i, j, sliceNumber)[c];
            } else {
              pixelBuffer[offset] = getFunc(i, j, sliceNumber)[s];
            }
            ++offset;
          }
        }
      }
    }
  };

  /**
   * Get a simple value.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} k The slice index.
   * @returns {number[]} The grey value.
   */
  #getValue = (i, j, k) => {
    let value = this.#background + k * 2;
    const inRange = i >= this.#minI && i <= this.#maxI &&
      j >= this.#minJ && j <= this.#maxJ;
    if (inRange) {
      value += Math.round((i + j) * (this.#maxValue / this.#maxNoBounds));
    }
    return [value];
  };

  /**
   * Get RGB values.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} k The slice index.
   * @returns {number[]} The [R,G,B] values.
   */
  #getRGB = (i, j, k) => {
    let value = this.#getValue(i, j, k);
    if (value > this.#maxValue) {
      value = 200;
    }
    return [value, 0, 0];
  };
}
