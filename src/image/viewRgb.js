// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Generate image data for 'RGB' photometric interpretation.
 *
 * @param {Array} array The array to store the outut data
 * @param {object} iterator Position iterator.
 */
dwv.image.generateImageDataRgb = function (
  array,
  iterator) {
  var index = 0;
  var ival = iterator.next();
  while (!ival.done) {
    // store data
    array.data[index] = ival.value[0];
    array.data[index + 1] = ival.value[1];
    array.data[index + 2] = ival.value[2];
    array.data[index + 3] = 0xff;
    // increment
    index += 4;
    ival = iterator.next();
  }
};
