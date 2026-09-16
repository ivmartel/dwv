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
  #numberOfFrames;

  #frames3D = false;

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
    this.#numberOfFrames = options.numberOfFrames ?? 1;

    if (typeof options.frames3D !== 'undefined') {
      this.#frames3D = options.frames3D;
    }

    this.#isRGB = options.photometricInterpretation === 'RGB';

    if (!this.#isRGB &&
      typeof modalityMaxValues[options.modality] !== 'undefined') {
      this.#maxValue = modalityMaxValues[options.modality];
    }

    if (typeof options.shape !== 'undefined') {
      this.#shape = options.shape;
    }

    if (this.#shape === 'brain') {
      this.#pixels = BRAIN_ROWS;
    } else {
      throw new Error(`Unknown pixel generation shape: ${this.#shape}`);
    }
  }

  /**
   * @param {number[]} pixelBuffer The buffer.
   * @param {number} sliceNumber The slice index.
   * @param {number} [frameNumber] Optional frame index.
   */
  generate(pixelBuffer, sliceNumber, frameNumber) {
    const getFunc = this.#isRGB ? this.#getRGB : this.#getValue;

    let offset = 0;
    let frameNum;
    for (let c = 0; c < this.#numberOfColourPlanes; ++c) {
      for (let f = 0; f < this.#numberOfFrames; ++f) {
        if (typeof frameNumber !== 'undefined' &&
          this.#numberOfFrames === 1) {
          frameNum = frameNumber;
        } else {
          frameNum = f;
        }
        for (let j = 0; j < this.#numberOfRows; ++j) {
          for (let i = 0; i < this.#numberOfColumns; ++i) {
            for (let s = 0; s < this.#numberOfSamples; ++s) {
              let values;
              if (this.#frames3D) {
                values = getFunc(i, j, frameNum, sliceNumber);
              } else {
                values = getFunc(i, j, sliceNumber, frameNum);
              }
              let value;
              if (this.#numberOfColourPlanes !== 1) {
                value = values[c];
              } else {
                value = values[s];
              }
              pixelBuffer[offset] = value;
              ++offset;
            }
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
   * @param {number} f The frame index.
   * @returns {number[]} The grey value.
   */
  #getValue = (i, j, k, f) => {
    const level = sampleGrid(
      this.#pixels[f][k], i, j,
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
  #getRGB = (i, j, k, f) => {
    let value = this.#getValue(i, j, k, f);
    if (value > this.#maxValue) {
      value = this.#maxValue;
    }
    return [value, 0, 0];
  };
}
