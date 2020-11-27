// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Generate image data for 'RGB' photometric interpretation.
 *
 * @param {Array} array The array to store the outut data
 * @param {object} image The image to generate the view from.
 * @param {object} position The position at witch to generate the view.
 * @param {number} frame The frame number at witch to generate the view.
 */
dwv.image.generateImageDataRgb = function (
  array, image, position, frame) {

  var sliceRange = image.getSliceIterator(position.k);

  var index = 0;
  var ival = sliceRange.next();
  while (!ival.done) {
    // store data
    array.data[index] = image.getValueAtOffset(ival.value, frame);
    array.data[index + 1] = image.getValueAtOffset(ival.value1, frame);
    array.data[index + 2] = image.getValueAtOffset(ival.value2, frame);
    array.data[index + 3] = 0xff;
    // increment
    index += 4;
    ival = sliceRange.next();
  }
};
