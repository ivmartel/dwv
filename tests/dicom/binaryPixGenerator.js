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

  const halfCols = numberOfColumns * 0.5;
  const halfRows = numberOfRows * 0.5;

  this.generate = function (pixelBuffer /*, sliceNumber*/) {
    const getFunc = function (i, j) {
      let value = 0;
      const jc = Math.abs(j - halfRows);
      const ic = Math.abs(i - halfCols);
      if (jc < halfRows / 2 && ic < halfCols / 2) {
        value = 1;
      }
      return value;
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
