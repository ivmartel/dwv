/**
 * Shared test helpers for view image-data generation tests.
 */

/**
 * Build a flat RGBA buffer of `size` pixels, initialised to zero.
 *
 * @param {number} size Number of pixels.
 * @returns {{data: Uint8ClampedArray}} Minimal ImageData-like object.
 */
export function makeImageData(size) {
  return {data: new Uint8ClampedArray(size * 4)};
}

/**
 * Build a position iterator over an array of pixel values.
 * Each element may be a scalar or an array (e.g. [R, G, B] / [Y, Cb, Cr]).
 *
 * @param {Array} values Pixel values to iterate.
 * @returns {object} Iterator with a `next()` method.
 */
export function makeIterator(values) {
  let pos = 0;
  return {
    next() {
      if (pos >= values.length) {
        return {done: true};
      }
      return {done: false, value: values[pos], index: pos++};
    }
  };
}

/**
 * Build a ColourMap-shaped object with predictable values:
 * red[i] = i, green[i] = 255 - i, blue[i] = (i * 2) % 256.
 *
 * @returns {{red: number[], green: number[], blue: number[]}} Colour map.
 */
export function makeColourMap() {
  const red = new Array(256);
  const green = new Array(256);
  const blue = new Array(256);
  for (let i = 0; i < 256; ++i) {
    red[i] = i;
    green[i] = 255 - i;
    blue[i] = (i * 2) % 256;
  }
  return {red, green, blue};
}

/**
 * Alpha function that always returns full opacity.
 *
 * @returns {number} 255.
 */
export const opaqueAlpha = () => 255;
