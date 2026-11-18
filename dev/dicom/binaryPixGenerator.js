/**
 * BinaryPixGenerator: generates binary pixel data.
 */
export class BinaryPixGenerator {

  #numberOfColumns;
  #numberOfRows;
  #numberOfFrames;
  #shape = 'square';

  #squares;

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

    if (typeof options.segmentSquares !== 'undefined') {
      this.#squares = options.segmentSquares;
    } else {
      // default square
      const borderI = Math.ceil(this.#numberOfColumns * 0.25);
      const borderJ = Math.ceil(this.#numberOfRows * 0.25);
      this.#squares = {};
      for (let f = 0; f < this.#numberOfFrames; ++f) {
        this.#squares[String(f + 1)] = {
          minI: borderI,
          maxI: this.#numberOfColumns - borderI,
          minJ: borderJ,
          maxJ: this.#numberOfRows - borderJ
        };
      }
    }

  }

  /**
   * @param {number[]} pixelBuffer The buffer.
   */
  generate(pixelBuffer /*, sliceNumber*/) {
    let offset = 0;
    for (let f = 0; f < this.#numberOfFrames; ++f) {
      for (let j = 0; j < this.#numberOfRows; ++j) {
        for (let i = 0; i < this.#numberOfColumns; ++i) {
          pixelBuffer[offset] = this.#getValue(i, j, f);
          ++offset;
        }
      }
    }
  }

  /**
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} f The frame index.
   * @returns {number} The value.
   */
  #getValue = (i, j, f) => {
    let res = 0;
    if (this.#shape === 'square') {
      res = this.#getValueSquare(i, j, f);
    } else if (this.#shape === 'diamond') {
      res = this.#getValueDiamond(i, j, f);
    }
    return res;
  };

  /**
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} f The frame index.
   * @returns {number} The value.
   */
  #getValueSquare = (i, j, f) => {
    const sq = this.#squares[String(f + 1)];
    const inRange = i >= sq.minI && i < sq.maxI &&
      j >= sq.minJ && j < sq.maxJ;
    return inRange ? 1 : 0;
  };

  /**
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} f The frame index.
   * @returns {number} The value.
   */
  #getValueDiamond = (i, j, f) => {
    let res = 0;

    const sq = this.#squares[String(f + 1)];
    const middleI = sq.minI + Math.floor((sq.maxI - sq.minI) * 0.5);
    const middleJ = sq.minJ + Math.floor((sq.maxJ - sq.minJ) * 0.5);

    const n = j < middleJ ? j - sq.minJ : sq.maxJ - j;
    if (Math.abs(i - middleI) < n) {
      res = 1;
    }
    return res;
  };

};
