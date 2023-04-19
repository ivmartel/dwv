// namespace
// eslint-disable-next-line no-var
var test = test || {};

/**
 * FilePixGenerator
 * Generates pixel data from file(s).
 *
 * @param {object} options The generator options.
 * @class
 */
const FilePixGenerator = function (options) {

  const numberOfColumns = options.numberOfColumns;
  const numberOfRows = options.numberOfRows;
  const isRGB = options.photometricInterpretation === 'RGB';

  this.setImages = function (imgs) {
    // check sizes
    let img;
    for (let i = 0; i < imgs.length; ++i) {
      img = imgs[i];
      if (img.width !== numberOfColumns) {
        throw new Error('Image width mismatch: ' +
          img.width + '!=' + numberOfColumns);
      }
      if (img.height !== numberOfRows) {
        throw new Error('Image height mismatch: ' +
          img.height + '!=' + numberOfRows);
      }
    }
    // store
    this.images = imgs;
  };

  this.generate = function (pixelBuffer, sliceNumber) {
    let image = null;
    if (sliceNumber < this.images.length) {
      image = this.images[sliceNumber];
    } else {
      image = this.images[0];
    }
    // get the image data
    const imageData = test.getImageDataData(image);
    // extract fist component for the pixelBuffer
    const dataLen = imageData.length;
    let j = 0;
    for (let i = 0; i < dataLen; i += 4) {
      pixelBuffer[j] = imageData[i];
      j += 1;
      if (isRGB) {
        pixelBuffer[j + 1] = imageData[i + 1];
        pixelBuffer[j + 2] = imageData[i + 2];
        j += 2;
      }
    }
  };
};

/**
 * Check tags are coherent with image size.
 *
 * @param {object} tags The tags to check.
 * @param {object} image The associated image.
 * @returns {boolean} True if the tags are ok.
 */
function fileCheckTags(tags, image) {
  /**
   * @param {number} value The value to check.
   * @returns {number} The expected value.
   */
  function getExpectedSize(value) {
    return value;
  }

  let needUpdate = false;
  if (tags.Columns !== getExpectedSize(image.width)) {
    tags.Columns = getExpectedSize(image.width);
    needUpdate = true;
  }
  if (tags.Rows !== getExpectedSize(image.height)) {
    tags.Rows = getExpectedSize(image.height);
    needUpdate = true;
  }
  return needUpdate;
}

test.pixelGenerators = test.pixelGenerators || {};
test.pixelGenerators.file = {
  generator: FilePixGenerator,
  checkTags: fileCheckTags
};
