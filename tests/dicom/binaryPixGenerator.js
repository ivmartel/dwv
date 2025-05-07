/**
 * BinaryPixGenerator: generates binary pixel data.
 */
export class BinaryPixGenerator {

  #numberOfColumns;
  #numberOfRows;
  #numberOfFrames;

  #minI;
  #minJ;
  #maxI;
  #maxJ;

  /**
   * @param {object} options The generator options.
   */
  constructor(options) {
    this.#numberOfColumns = options.numberOfColumns;
    this.#numberOfRows = options.numberOfRows;
    this.#numberOfFrames = options.numberOfFrames;

    const borderI = Math.ceil(this.#numberOfColumns * 0.5);
    const borderJ = Math.ceil(this.#numberOfRows * 0.5);

    this.#minI = borderI;
    this.#minJ = borderJ;
    this.#maxI = this.#numberOfColumns - borderI;
    this.#maxJ = this.#numberOfRows - borderJ;
  }

  /**
   * @param {number[]} pixelBuffer The buffer.
   */
  generate(pixelBuffer /*, sliceNumber*/) {
    let offset = 0;
    for (let f = 0; f < this.#numberOfFrames; ++f) {
      for (let j = 0; j < this.#numberOfRows; ++j) {
        for (let i = 0; i < this.#numberOfColumns; ++i) {
          pixelBuffer[offset] = this.#getValue(i, j);
          ++offset;
        }
      }
    }
  }

  /**
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {number} The value.
   */
  #getValue = (i, j) => {
    const inRange = i >= this.#minI && i < this.#maxI &&
      j >= this.#minJ && j < this.#maxJ;
    return inRange ? 1 : 0;
  };

};
