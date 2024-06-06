import {ybrToRgb} from '../utils/colour';

/**
 * Generate image data for 'YBR_FULL' photometric interpretation.
 *
 * @param {ImageData} array The array to store the outut data.
 * @param {object} iterator Position iterator.
 * @param {Function} alphaFunc The alpha function.
 */
export function generateImageDataYbrFull(
  array,
  iterator,
  alphaFunc) {
  let index = 0;
  let rgb = null;
  let ival = iterator.next();
  while (!ival.done) {
    // convert ybr to rgb
    rgb = ybrToRgb(ival.value[0], ival.value[1], ival.value[2]);
    // store data
    array.data[index] = rgb.r;
    array.data[index + 1] = rgb.g;
    array.data[index + 2] = rgb.b;
    array.data[index + 3] = alphaFunc(ival.value, ival.index);
    // increment
    index += 4;
    ival = iterator.next();
  }
}
