/**
 * Generate image data for 'RGB' photometric interpretation.
 *
 * @param {ImageData} array The array to store the outut data.
 * @param {object} iterator Position iterator.
 * @param {Function} alphaFunc The alpha function.
 */
export function generateImageDataRgb(
  array,
  iterator,
  alphaFunc) {
  let index = 0;
  let ival = iterator.next();
  while (!ival.done) {
    // store data
    array.data[index] = ival.value[0];
    array.data[index + 1] = ival.value[1];
    array.data[index + 2] = ival.value[2];
    array.data[index + 3] = alphaFunc(ival.value, ival.index);
    // increment
    index += 4;
    ival = iterator.next();
  }
}
