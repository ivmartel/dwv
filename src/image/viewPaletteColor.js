import {logger} from '../utils/logger';

// doc imports
/* eslint-disable no-unused-vars */
import {ColourMap} from './luts';
/* eslint-enable no-unused-vars */

/**
 * Generate image data for 'PALETTE COLOR' photometric interpretation.
 *
 * @param {ImageData} array The array to store the outut data.
 * @param {object} iterator Position iterator.
 * @param {Function} alphaFunc The alpha function.
 * @param {ColourMap} colourMap The colour map.
 * @param {boolean} is16BitsStored Flag to know if the data is 16bits.
 */
export function generateImageDataPaletteColor(
  array,
  iterator,
  alphaFunc,
  colourMap,
  is16BitsStored) {
  // right shift 8
  const to8 = function (value) {
    return value >> 8;
  };

  if (is16BitsStored) {
    logger.info('Scaling 16bits data to 8bits.');
  }

  let index = 0;
  let pxValue = 0;
  let ival = iterator.next();
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
    array.data[index + 3] = alphaFunc(pxValue, ival.index);
    // increment
    index += 4;
    ival = iterator.next();
  }
}
