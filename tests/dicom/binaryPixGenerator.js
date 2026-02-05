/**
 * BinaryPixGenerator: generates binary pixel data.
 */
export class BinaryPixGenerator {

  #numberOfColumns;
  #numberOfRows;
  #numberOfFrames;
  #shape = 'square';

  #minI;
  #minJ;
  #maxI;
  #maxJ;

  #middleI;
  #middleJ;

  /**
   * @param {object} options The generator options.
   */
  constructor(options) {
    this.#numberOfColumns = options.numberOfColumns;
    this.#numberOfRows = options.numberOfRows;
    this.#numberOfFrames = options.numberOfFrames;

    if (typeof options.shape !== 'undefined') {
      this.#shape = options.shape;
    }

    const borderI = Math.ceil(this.#numberOfColumns * 0.25);
    const borderJ = Math.ceil(this.#numberOfRows * 0.25);

    this.#minI = borderI;
    this.#minJ = borderJ;
    this.#maxI = this.#numberOfColumns - borderI;
    this.#maxJ = this.#numberOfRows - borderJ;

    this.#middleI = this.#minI + Math.floor((this.#maxI - this.#minI) * 0.5);
    this.#middleJ = this.#minJ + Math.floor((this.#maxJ - this.#minJ) * 0.5);
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
    let res = 0;
    if (this.#shape === 'square') {
      res = this.#getValueSquare(i, j);
    } else if (this.#shape === 'diamond') {
      res = this.#getValueDiamond(i, j);
    }
    return res;
  };

  /**
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {number} The value.
   */
  #getValueSquare = (i, j) => {
    const inRange = i >= this.#minI && i < this.#maxI &&
      j >= this.#minJ && j < this.#maxJ;
    return inRange ? 1 : 0;
  };

  /**
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {number} The value.
   */
  #getValueDiamond = (i, j) => {
    let res = 0;
    const n = j < this.#middleJ ? j - this.#minJ : this.#maxJ - j;
    if (Math.abs(i - this.#middleI) < n) {
      res = 1;
    }
    return res;
  };

};
