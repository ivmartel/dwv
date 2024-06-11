// doc imports
/* eslint-disable no-unused-vars */
import {WindowLut} from './windowLut';
import {ColourMap} from './luts';
/* eslint-enable no-unused-vars */

/**
 * Generate image data for 'MONOCHROME*' photometric interpretation.
 *
 * @param {ImageData} array The array to store the outut data.
 * @param {object} iterator Position iterator.
 * @param {Function} alphaFunc The alpha function.
 * @param {WindowLut} windowLut The window/level LUT.
 * @param {ColourMap} colourMap The colour map.
 */
export function generateImageDataMonochrome(
  array,
  iterator,
  alphaFunc,
  windowLut,
  colourMap) {
  let index = 0;
  let pxValue = 0;
  let ival = iterator.next();
  while (!ival.done) {
    // pixel value
    pxValue = windowLut.getValue(ival.value);
    // store data
    array.data[index] = colourMap.red[pxValue];
    array.data[index + 1] = colourMap.green[pxValue];
    array.data[index + 2] = colourMap.blue[pxValue];
    array.data[index + 3] = alphaFunc(ival.value, ival.index);
    // increment
    index += 4;
    ival = iterator.next();
  }
}
