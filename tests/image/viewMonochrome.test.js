import {describe, test, assert} from 'vitest';
import {
  generateImageDataMonochrome
} from '../../src/image/viewMonochrome.js';
import {
  makeImageData,
  makeIterator,
  makeColourMap,
  opaqueAlpha
} from './utils/viewTestHelpers.js';

/**
 * Build a minimal WindowLut mock whose `getValue` returns its input unchanged.
 *
 * @returns {{getValue: Function}} Identity window LUT.
 */
function makeIdentityWindowLut() {
  return {getValue: (v) => v};
}

describe('image', () => {

  /**
   * Tests for {@link generateImageDataMonochrome} basic RGBA mapping.
   *
   * @function module:tests/image~viewMonochromeBasic
   */
  test('generateImageDataMonochrome writes correct RGBA values', () => {
    const colourMap = makeColourMap();
    const windowLut = makeIdentityWindowLut();
    const pixels = [0, 10, 100, 200];
    const array = makeImageData(pixels.length);

    generateImageDataMonochrome(
      array, makeIterator(pixels), opaqueAlpha, windowLut, colourMap
    );

    for (let p = 0; p < pixels.length; ++p) {
      // windowLut is identity, so mapped value == raw pixel value
      const mapped = pixels[p];
      const base = p * 4;
      assert.equal(array.data[base], colourMap.red[mapped],
        `red at pixel ${p}`);
      assert.equal(array.data[base + 1], colourMap.green[mapped],
        `green at pixel ${p}`);
      assert.equal(array.data[base + 2], colourMap.blue[mapped],
        `blue at pixel ${p}`);
      assert.equal(array.data[base + 3], 255,
        `alpha at pixel ${p}`);
    }
  });

  /**
   * Tests that the window LUT mapping is applied before colour-map lookup.
   *
   * @function module:tests/image~viewMonochromeWindowing
   */
  test('generateImageDataMonochrome applies windowLut before colour-map lookup',
    () => {
      const colourMap = makeColourMap();
      // LUT that maps every value to 42
      const windowLut = {getValue: () => 42};
      const pixels = [0, 100, 200];
      const array = makeImageData(pixels.length);

      generateImageDataMonochrome(
        array, makeIterator(pixels), opaqueAlpha, windowLut, colourMap
      );

      for (let p = 0; p < pixels.length; ++p) {
        const base = p * 4;
        assert.equal(array.data[base], colourMap.red[42],
          `red at pixel ${p} should use mapped value 42`);
        assert.equal(array.data[base + 1], colourMap.green[42],
          `green at pixel ${p} should use mapped value 42`);
        assert.equal(array.data[base + 2], colourMap.blue[42],
          `blue at pixel ${p} should use mapped value 42`);
      }
    }
  );

  /**
   * Tests that the alpha function receives the raw pixel value (not the
   * windowed one) together with its position index.
   *
   * @function module:tests/image~viewMonochromeAlphaArgs
   */
  test('generateImageDataMonochrome alpha check', () => {
    const colourMap = makeColourMap();
    // LUT that maps every value to 99 – alpha must still see the raw value
    const windowLut = {getValue: () => 99};
    const pixels = [7, 42];
    const array = makeImageData(pixels.length);
    const alphaCalls = [];
    const trackingAlpha = (value, index) => {
      alphaCalls.push({value, index});
      return index * 10;
    };

    generateImageDataMonochrome(
      array, makeIterator(pixels), trackingAlpha, windowLut, colourMap
    );

    assert.equal(alphaCalls.length, 2);
    // raw pixel values, not windowed ones
    assert.equal(alphaCalls[0].value, 7, 'alpha receives raw pixel 0');
    assert.equal(alphaCalls[1].value, 42, 'alpha receives raw pixel 1');
    // iterator index
    assert.equal(alphaCalls[0].index, 0, 'alpha receives index 0');
    assert.equal(alphaCalls[1].index, 1, 'alpha receives index 1');
    // returned alpha lands in the right byte
    assert.equal(array.data[3], 0, 'alpha byte for pixel 0');
    assert.equal(array.data[7], 10, 'alpha byte for pixel 1');
  });

  /**
   * Tests for {@link generateImageDataMonochrome} with an empty iterator.
   *
   * @function module:tests/image~viewMonochromeEmpty
   */
  test('generateImageDataMonochrome does nothing for an empty iterator', () => {
    const colourMap = makeColourMap();
    const windowLut = makeIdentityWindowLut();
    const array = makeImageData(1);
    array.data.fill(99);

    generateImageDataMonochrome(
      array, makeIterator([]), opaqueAlpha, windowLut, colourMap
    );

    // buffer must be untouched
    assert.equal(array.data[0], 99);
    assert.equal(array.data[3], 99);
  });

});
