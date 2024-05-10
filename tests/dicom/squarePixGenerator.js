// namespace
// eslint-disable-next-line no-var
var test = test || {};

/**
 * SquarePixGenerator
 * Generates pixel data with simple mono value squares.
 *
 * @param {object} options The generator options.
 * @class
 */
const SquarePixGenerator = function (options) {

  const numberOfColumns = options.numberOfColumns;
  const numberOfRows = options.numberOfRows;
  const numberOfSamples = options.numberOfSamples;
  const numberOfColourPlanes = options.numberOfColourPlanes;
  const isRGB = options.photometricInterpretation === 'RGB';
  const getFunc = isRGB ? getRGB : getValue;

  const borderI = Math.floor(numberOfColumns / 6);
  const borderJ = Math.floor(numberOfRows / 6);

  const minI0 = borderI;
  const maxI0 = 2 * borderI;
  const minI1 = 4 * borderI;
  const maxI1 = numberOfColumns - borderI;

  const minJ0 = borderJ;
  const maxJ0 = 2 * borderJ;
  const minJ1 = 4 * borderJ;
  const maxJ1 = numberOfRows - borderJ;

  const inRange = [];
  inRange.push(function (i, j) {
    return i >= minI0 && i < maxI0 &&
      j >= minJ0 && j < maxJ0;
  });
  inRange.push(function (i, j) {
    return i >= minI0 && i < maxI0 &&
      j >= minJ1 && j < maxJ1;
  });
  inRange.push(function (i, j) {
    return i >= minI1 && i < maxI1 &&
      j >= minJ0 && j < maxJ0;
  });
  inRange.push(function (i, j) {
    return i >= minI1 && i < maxI1 &&
      j >= minJ1 && j < maxJ1;
  });

  const background = 0;
  const max = 255;

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
   * @param {number} _k The slice index.
   * @returns {number[]} The grey value.
   */
  function getValue(i, j, _k) {
    let value = background;
    for (let f = 0; f < inRange.length; ++f) {
      if (inRange[f](i, j)) {
        value += Math.round(max * (f + 1) / 5);
        break;
      }
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
test.pixelGenerators.square = {
  generator: SquarePixGenerator
};
