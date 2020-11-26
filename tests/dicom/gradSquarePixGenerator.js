/**
 * GradSquarePixGenerator
 * Generates pixel data as a small gradient square.
 *
 * @param {object} options The generator options.
 * @class
 */
var GradSquarePixGenerator = function (options) {

  var numberOfColumns = options.numberOfColumns;
  var numberOfRows = options.numberOfRows;
  var numberOfSamples = options.numberOfSamples;
  var numberOfColourPlanes = options.numberOfColourPlanes;
  var isRGB = options.photometricInterpretation === 'RGB';

  var halfCols = numberOfColumns * 0.5;
  var halfRows = numberOfRows * 0.5;

  var background = 0;
  var maxNoBounds = (halfCols + halfCols / 2) * (halfRows + halfRows / 2);
  var max = 100;

  this.generate = function (pixelBuffer, sliceNumber) {
    var getFunc = isRGB ? getRGB : getGrey;

    // slice dependent max
    max = 100 + sliceNumber * 100;

    // main loop
    var offset = 0;
    for (var c = 0; c < numberOfColourPlanes; ++c) {
      for (var j = 0; j < numberOfRows; ++j) {
        for (var i = 0; i < numberOfColumns; ++i) {
          for (var s = 0; s < numberOfSamples; ++s) {
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
    var value = background;
    var jc = Math.abs(j - halfRows);
    var ic = Math.abs(i - halfCols);
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
    var value = 0;
    var jc = Math.abs(j - halfRows);
    var ic = Math.abs(i - halfCols);
    if (jc < halfRows / 2 && ic < halfCols / 2) {
      value += (i * j) * (max / maxNoBounds);
    }
    if (value > 255) {
      value = 200;
    }
    return [0, value, value];
  }
};

dwv.dicom.pixelGenerators = dwv.dicom.pixelGenerators || {};
dwv.dicom.pixelGenerators.gradSquare = {
  generator: GradSquarePixGenerator
};
