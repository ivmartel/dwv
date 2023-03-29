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

  const halfCols = numberOfColumns * 0.5;
  const halfRows = numberOfRows * 0.5;

  const background = 0;
  const maxNoBounds = (halfCols + halfCols / 2) * (halfRows + halfRows / 2);
  let max = 100;

  this.generate = function (pixelBuffer, sliceNumber) {
    const getFunc = isRGB ? getRGB : getGrey;

    // slice dependent max
    max = 100 + sliceNumber * 100;

    // main loop
    let offset = 0;
    for (let c = 0; c < numberOfColourPlanes; ++c) {
      for (let j = 0; j < numberOfRows; ++j) {
        for (let i = 0; i < numberOfColumns; ++i) {
          for (let s = 0; s < numberOfSamples; ++s) {
            if (numberOfColourPlanes !== 1) {
              pixelBuffer[offset] = getFunc(i, j)[c];
            } else {
              pixelBuffer[offset] = getFunc(i, j)[s];
            }
            ++offset;
          }
        }
      }
    }
  };

  /**
   * Get a grey value.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {Array} The grey value.
   */
  function getGrey(i, j) {
    let value = background;
    const jc = Math.abs(j - halfRows);
    const ic = Math.abs(i - halfCols);
    if (jc < halfRows / 2 && ic < halfCols / 2) {
      value += (i * j) * (max / maxNoBounds);
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
  function getRGB(i, j) {
    let value = 0;
    const jc = Math.abs(j - halfRows);
    const ic = Math.abs(i - halfCols);
    if (jc < halfRows / 2 && ic < halfCols / 2) {
      value += (i * j) * (max / maxNoBounds);
    }
    if (value > 255) {
      value = 200;
    }
    return [0, value, value];
  }
};

test.pixelGenerators = test.pixelGenerators || {};
test.pixelGenerators.gradSquare = {
  generator: GradSquarePixGenerator
};
