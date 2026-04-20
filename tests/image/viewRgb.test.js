import {describe, test, assert} from 'vitest';
import {generateImageDataRgb} from '../../src/image/viewRgb.js';
import {
  makeImageData,
  makeIterator,
  opaqueAlpha
} from './utils/viewTestHelpers.js';

describe('image', () => {

  /**
   * Tests for {@link generateImageDataRgb} basic RGBA mapping.
   *
   * @function module:tests/image~viewRgbBasic
   */
  test('generateImageDataRgb writes RGB triplets verbatim into the buffer',
    () => {
      const triplets = [
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
        [10, 20, 30]
      ];
      const array = makeImageData(triplets.length);

      generateImageDataRgb(array, makeIterator(triplets), opaqueAlpha);

      for (let p = 0; p < triplets.length; ++p) {
        const [r, g, b] = triplets[p];
        const base = p * 4;
        assert.equal(array.data[base], r, `red at pixel ${p}`);
        assert.equal(array.data[base + 1], g, `green at pixel ${p}`);
        assert.equal(array.data[base + 2], b, `blue at pixel ${p}`);
        assert.equal(array.data[base + 3], 255, `alpha at pixel ${p}`);
      }
    }
  );

  /**
   * Tests that the alpha function receives the full RGB triplet and the
   * position index, and that the returned value is stored in the alpha byte.
   *
   * @function module:tests/image~viewRgbAlphaArgs
   */
  test('generateImageDataRgb passes RGB triplet and index to alpha', () => {
    const triplets = [[10, 20, 30], [40, 50, 60]];
    const array = makeImageData(triplets.length);
    const alphaCalls = [];
    const trackingAlpha = (value, index) => {
      alphaCalls.push({value, index});
      return index * 50;
    };

    generateImageDataRgb(array, makeIterator(triplets), trackingAlpha);

    assert.equal(alphaCalls.length, 2);
    assert.deepEqual(alphaCalls[0].value, triplets[0],
      'alpha receives first triplet');
    assert.deepEqual(alphaCalls[1].value, triplets[1],
      'alpha receives second triplet');
    assert.equal(alphaCalls[0].index, 0, 'alpha receives index 0');
    assert.equal(alphaCalls[1].index, 1, 'alpha receives index 1');
    assert.equal(array.data[3], 0, 'alpha byte for pixel 0');
    assert.equal(array.data[7], 50, 'alpha byte for pixel 1');
  });

  /**
   * Tests for {@link generateImageDataRgb} with an empty iterator.
   *
   * @function module:tests/image~viewRgbEmpty
   */
  test('generateImageDataRgb does nothing for an empty iterator', () => {
    const array = makeImageData(1);
    array.data.fill(99);

    generateImageDataRgb(array, makeIterator([]), opaqueAlpha);

    assert.equal(array.data[0], 99);
    assert.equal(array.data[3], 99);
  });

  /**
   * Tests that no colour conversion is applied — values are copied as-is.
   * Verifies the function does not mix up channels.
   *
   * @function module:tests/image~viewRgbNoConversion
   */
  test('generateImageDataRgb does not alter channel values', () => {
    // Use asymmetric values so a channel swap would be immediately visible
    const array = makeImageData(1);

    generateImageDataRgb(array, makeIterator([[11, 22, 33]]), opaqueAlpha);

    assert.equal(array.data[0], 11, 'R stays in red channel');
    assert.equal(array.data[1], 22, 'G stays in green channel');
    assert.equal(array.data[2], 33, 'B stays in blue channel');
  });

});
