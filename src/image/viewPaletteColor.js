// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Generate image data for 'PALETTE COLOR' photometric interpretation.
 *
 * @param {Array} array The array to store the outut data
 * @param {object} iterator Position iterator.
 * @param {function} alphaFunc The alpha function.
 * @param {object} colourMap The colour map.
 * @param {boolean} is16BitsStored Flag to know if the data is 16bits.
 */
dwv.image.generateImageDataPaletteColor = function (
  array,
  iterator,
  alphaFunc,
  colourMap,
  is16BitsStored) {
  // right shift 8
  var to8 = function (value) {
    return value >> 8;
  };

  if (is16BitsStored) {
    dwv.logger.info('Scaling 16bits data to 8bits.');
  }

  var index = 0;
  var pxValue = 0;
  var ival = iterator.next();
  while (!ival.done) {
    // pixel value
    pxValue = ival.value;
    // store data
    // TODO check pxValue fits in lut
    if (is16BitsStored) {
      array.data[index] = to8(colourMap.red[pxValue]);
      array.data[index + 1] = to8(colourMap.green[pxValue]);
      array.data[index + 2] = to8(colourMap.blue[pxValue]);
    } else {
      array.data[index] = colourMap.red[pxValue];
      array.data[index + 1] = colourMap.green[pxValue];
      array.data[index + 2] = colourMap.blue[pxValue];
    }
    array.data[index + 3] = alphaFunc(pxValue);
    // increment
    index += 4;
    ival = iterator.next();
  }
};
