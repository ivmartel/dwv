// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Generate image data for 'MONOCHROME*' photometric interpretation.
 *
 * @param {Array} array The array to store the outut data
 * @param {object} iterator Position iterator.
 * @param {function} alphaFunc The alpha function.
 * @param {object} windowLut The window/level LUT.
 * @param {object} colourMap The colour map.
 */
dwv.image.generateImageDataMonochrome = function (
  array,
  iterator,
  alphaFunc,
  windowLut,
  colourMap) {
  var index = 0;
  var pxValue = 0;
  var ival = iterator.next();
  while (!ival.done) {
    // pixel value
    pxValue = windowLut.getValue(ival.value);
    // store data
    array.data[index] = colourMap.red[pxValue];
    array.data[index + 1] = colourMap.green[pxValue];
    array.data[index + 2] = colourMap.blue[pxValue];
    array.data[index + 3] = alphaFunc(ival.value);
    // increment
    index += 4;
    ival = iterator.next();
  }
};
