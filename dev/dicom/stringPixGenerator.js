import {BRAIN_ROWS} from './brainShape.js';

/**
 * Decode hex-encoded pixel rows (as in BRAIN_ROWS) into grey values.
 *
 * @param {string[]} rows The hex-encoded rows.
 * @returns {number[][]} The grey values, one array per row.
 */
function hexRowsToPixels(rows) {
  return rows.map((row) => {
    const pixels = [];
    for (let i = 0; i < row.length; i += 2) {
      pixels.push(parseInt(row.substring(i, i + 2), 16));
    }
    return pixels;
  });
}

/**
 * Get the grey value at a given pixel position, sampled (nearest
 * neighbour) from a reference square grey value grid.
 *
 * @param {number[][]} pixels The reference grid.
 * @param {number} i The column index.
 * @param {number} j The row index.
 * @param {number} numberOfColumns The image number of columns.
 * @param {number} numberOfRows The image number of rows.
 * @param {number} background The background value.
 * @returns {number} The grey value.
 */
function sampleGrid(
  pixels, i, j, numberOfColumns, numberOfRows, background) {
  const refSize = pixels.length;
  const row = Math.min(
    refSize - 1, Math.floor(j * refSize / numberOfRows));
  const col = Math.min(
    refSize - 1, Math.floor(i * refSize / numberOfColumns));

  const value = pixels[row][col];
  return value === 0 ? background : value;
}

/**
 * StringPixGenerator: generates pixel data from string arrays.
 */
export class StringPixGenerator {

  #numberOfColumns;
  #numberOfRows;
  #numberOfSamples;
  #numberOfColourPlanes;

  #shape = 'brain';
  #pixels;

  #isRGB;

  #background = 0;
  #maxValue = 255;

  /**
   * @param {object} options The generator options.
   */
  constructor(options) {
    this.#numberOfColumns = options.numberOfColumns;
    this.#numberOfRows = options.numberOfRows;
    this.#numberOfSamples = options.numberOfSamples;
    this.#numberOfColourPlanes = options.numberOfColourPlanes;

    this.#isRGB = options.photometricInterpretation === 'RGB';

    if (typeof options.shape !== 'undefined') {
      this.#shape = options.shape;
    }

    if (this.#shape === 'brain') {
      this.#pixels = BRAIN_ROWS.map(hexRowsToPixels);
    }
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
    const value = sampleGrid(
      this.#pixels[k], i, j,
      this.#numberOfColumns,
      this.#numberOfRows,
      this.#background);
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
