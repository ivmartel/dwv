import {BRAIN_ROWS} from './brainShape.js';

// typical max pixel value per modality
const modalityMaxValues = {
  CT: 3000,
  MR: 4095,
  PT: 32767,
  CR: 4095,
  DX: 4095,
  MG: 4095,
  US: 255
};
const defaultMaxValue = 255;

/**
 * Get the grey level at a given pixel position, sampled (nearest
 * neighbour) from a reference square grey level grid.
 *
 * @param {number[][]} levels The reference grid, values in [0, 9].
 * @param {number} i The column index.
 * @param {number} j The row index.
 * @param {number} numberOfColumns The image number of columns.
 * @param {number} numberOfRows The image number of rows.
 * @returns {number} The grey level, in [0, 9].
 */
function sampleGrid(levels, i, j, numberOfColumns, numberOfRows) {
  const refSize = levels.length;
  const row = Math.min(
    refSize - 1, Math.floor(j * refSize / numberOfRows));
  const col = Math.min(
    refSize - 1, Math.floor(i * refSize / numberOfColumns));

  return levels[row][col];
}

/**
 * StringPixGenerator: generates pixel data from grey value grids.
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
  #maxValue = defaultMaxValue;
  #maxLevel = 9;

  /**
   * @param {object} options The generator options.
   */
  constructor(options) {
    this.#numberOfColumns = options.numberOfColumns;
    this.#numberOfRows = options.numberOfRows;
    this.#numberOfSamples = options.numberOfSamples;
    this.#numberOfColourPlanes = options.numberOfColourPlanes;

    this.#isRGB = options.photometricInterpretation === 'RGB';

    if (typeof modalityMaxValues[options.modality] !== 'undefined') {
      this.#maxValue = modalityMaxValues[options.modality];
    }

    if (typeof options.shape !== 'undefined') {
      this.#shape = options.shape;
    }

    if (this.#shape === 'brain') {
      this.#pixels = BRAIN_ROWS;
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
    const level = sampleGrid(
      this.#pixels[k], i, j,
      this.#numberOfColumns,
      this.#numberOfRows);
    const value = level === 0
      ? this.#background
      : Math.round(level * this.#maxValue / this.#maxLevel);
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
