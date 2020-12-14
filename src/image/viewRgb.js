// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Generate image data for 'RGB' photometric interpretation.
 *
 * @param {Array} array The array to store the outut data
 * @param {object} iterator Position iterator.
 * @param {Function} dataAccessor Function to access data.
 */
dwv.image.generateImageDataRgb = function (
  array,
  iterator,
  dataAccessor) {
  var index = 0;
  var ival = iterator.next();
  while (!ival.done) {
    // store data
    array.data[index] = dataAccessor(ival.value);
    array.data[index + 1] = dataAccessor(ival.value1);
    array.data[index + 2] = dataAccessor(ival.value2);
    array.data[index + 3] = 0xff;
    // increment
    index += 4;
    ival = iterator.next();
  }
};
