// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Generate image data for 'YBR_FULL' photometric interpretation.
 *
 * @param {Array} array The array to store the outut data
 * @param {object} iterator Position iterator.
 */
dwv.image.generateImageDataYbrFull = function (
  array,
  iterator) {
  var index = 0;
  var rgb = null;
  var ival = iterator.next();
  while (!ival.done) {
    // convert ybr to rgb
    rgb = dwv.utils.ybrToRgb(
      ival.value[0], ival.value[1], ival.value[2]);
    // store data
    array.data[index] = rgb.r;
    array.data[index + 1] = rgb.g;
    array.data[index + 2] = rgb.b;
    array.data[index + 3] = 0xff;
    // increment
    index += 4;
    ival = iterator.next();
  }
};
