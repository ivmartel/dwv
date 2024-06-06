// namespace
// eslint-disable-next-line no-var
var test = test || {};

/**
 * BinaryPixGenerator
 * Generates binary pixel data.
 *
 * @param {object} options The generator options.
 * @class
 */
const BinaryPixGenerator = function (options) {

  const numberOfColumns = options.numberOfColumns;
  const numberOfRows = options.numberOfRows;
  const numberOfFrames = options.numberOfFrames;

  const borderI = Math.ceil(numberOfColumns * 0.5);
  const borderJ = Math.ceil(numberOfRows * 0.5);

  const minI = borderI;
  const minJ = borderJ;
  const maxI = numberOfColumns - borderI;
  const maxJ = numberOfRows - borderJ;

  const inRange = function (i, j) {
    return i >= minI && i < maxI &&
      j >= minJ && j < maxJ;
  };

  this.generate = function (pixelBuffer /*, sliceNumber*/) {
    const getFunc = function (i, j) {
      return inRange(i, j) ? 1 : 0;
    };

    // main loop
    let offset = 0;
    for (let f = 0; f < numberOfFrames; ++f) {
      for (let j = 0; j < numberOfRows; ++j) {
        for (let i = 0; i < numberOfColumns; ++i) {
          pixelBuffer[offset] = getFunc(i, j);
          ++offset;
        }
      }
    }
  };
};

test.pixelGenerators = test.pixelGenerators || {};
test.pixelGenerators.binary = {
  generator: BinaryPixGenerator
};
