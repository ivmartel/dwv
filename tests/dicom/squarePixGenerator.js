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
  // supposing as many slices as coloums
  const numberOfSlices = numberOfColumns;
  const borderK = Math.floor(numberOfSlices / 6);

  const rangesI = [];
  rangesI.push(
    [borderI, 2 * borderI],
    [4 * borderI, numberOfColumns - borderI]
  );

  const rangesJ = [];
  rangesJ.push(
    [borderJ, 2 * borderJ],
    [4 * borderJ, numberOfRows - borderJ]
  );

  const rangesK = [];
  rangesK.push(
    [borderK, 2 * borderK],
    [4 * borderK, numberOfSlices - borderK]
  );

  const inRange = [];
  for (const rangeK of rangesK) {
    for (const rangeJ of rangesJ) {
      for (const rangeI of rangesI) {
        inRange.push(function (i, j, k) {
          return i >= rangeI[0] && i < rangeI[1] &&
            j >= rangeJ[0] && j < rangeJ[1] &&
            k >= rangeK[0] && k < rangeK[1];
        });
      }
    }
  }

  const numberOfSquares = inRange.length;
  const background = 0;
  const max = 200;

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
    let value = background;
    for (let f = 0; f < inRange.length; ++f) {
      if (inRange[f](i, j, k)) {
        value += Math.round(max * (f + 1) / numberOfSquares);
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
