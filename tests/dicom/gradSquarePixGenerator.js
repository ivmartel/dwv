// namespace
// eslint-disable-next-line no-var
var test = test || {};

/**
 * GradSquarePixGenerator
 * Generates pixel data as a small gradient square.
 *
 * @param {object} options The generator options.
 * @class
 */
const GradSquarePixGenerator = function (options) {

  const numberOfColumns = options.numberOfColumns;
  const numberOfRows = options.numberOfRows;
  const numberOfSamples = options.numberOfSamples;
  const numberOfColourPlanes = options.numberOfColourPlanes;
  const isRGB = options.photometricInterpretation === 'RGB';
  const getFunc = isRGB ? getRGB : getValue;

  // full grad square
  const borderI = 0;
  const borderJ = 0;
  // ~centered grad square
  // const borderI = Math.ceil(numberOfColumns * 0.25);
  // const borderJ = Math.ceil(numberOfRows * 0.25);

  const minI = borderI;
  const minJ = borderJ;
  const maxI = numberOfColumns - borderI;
  const maxJ = numberOfRows - borderJ;
  const maxK = maxI;

  const inRange = function (i, j) {
    return i >= minI && i <= maxI &&
      j >= minJ && j <= maxJ;
  };

  const background = 0;
  const max = 255;
  let maxNoBounds = 1;
  maxNoBounds = getValue(maxI, maxJ, maxK) / max;

  this.generate = function (pixelBuffer, sliceNumber) {

    // main loop
    let offset = 0;
    for (let c = 0; c < numberOfColourPlanes; ++c) {
      for (let j = 0; j < numberOfRows; ++j) {
        for (let i = 0; i < numberOfColumns; ++i) {
          for (let s = 0; s < numberOfSamples; ++s) {
            if (numberOfColourPlanes !== 1) {
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
  function getValue(i, j, k) {
    let value = background + k * 2;
    if (inRange(i, j)) {
      value += Math.round((i + j) * (max / maxNoBounds));
    }
    return [value];
  }

  /**
   * Get RGB values.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @param {number} k The slice index.
   * @returns {number[]} The [R,G,B] values.
   */
  function getRGB(i, j, k) {
    let value = getValue(i, j, k);
    if (value > 255) {
      value = 200;
    }
    return [value, 0, 0];
  }
};

test.pixelGenerators = test.pixelGenerators || {};
test.pixelGenerators.gradSquare = {
  generator: GradSquarePixGenerator
};
