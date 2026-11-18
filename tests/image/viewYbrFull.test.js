import {describe, test, assert} from 'vitest';
import {
  generateImageDataYbrFull
} from '../../src/image/viewYbrFull.js';
import {ybrToRgb} from '../../src/utils/colour.js';
import {
  makeImageData,
  makeIterator,
  opaqueAlpha
} from './utils/viewTestHelpers.js';

describe('image', () => {

  /**
   * Tests for {@link generateImageDataYbrFull} basic RGBA mapping.
   *
   * @function module:tests/image~viewYbrFullBasic
   */
  test('generateImageDataYbrFull converts YBR to RGB correctly', () => {
    // Use a range of representative YBR values
    const triplets = [
      [128, 128, 128], // neutral grey: Cb=Cr=128 → no chroma shift
      [0, 128, 128], // black with neutral chroma
      [255, 0, 255], // extreme values
      [100, 200, 50] // arbitrary mix
    ];
    const array = makeImageData(triplets.length);

    generateImageDataYbrFull(array, makeIterator(triplets), opaqueAlpha);

    for (let p = 0; p < triplets.length; ++p) {
      const [y, cb, cr] = triplets[p];
      // Compute reference via the real conversion; Uint8ClampedArray clamps
      // and truncates floating-point results the same way the function does.
      const ref = ybrToRgb(y, cb, cr);
      const base = p * 4;
      // Use a Uint8ClampedArray to replicate the same clamp/truncation
      const clamped = new Uint8ClampedArray([ref.r, ref.g, ref.b]);
      assert.equal(array.data[base], clamped[0], `red at pixel ${p}`);
      assert.equal(array.data[base + 1], clamped[1], `green at pixel ${p}`);
      assert.equal(array.data[base + 2], clamped[2], `blue at pixel ${p}`);
      assert.equal(array.data[base + 3], 255, `alpha at pixel ${p}`);
    }
  });

  /**
   * Tests that neutral chroma (Cb = Cr = 128) produces R = G = B = Y.
   *
   * @function module:tests/image~viewYbrFullNeutralChroma
   */
  test('generateImageDataYbrFull with neutral chroma yields R=G=B=Y', () => {
    // When Cb = Cr = 128 the chroma terms vanish: R=G=B=Y
    const y = 180;
    const array = makeImageData(1);

    generateImageDataYbrFull(
      array, makeIterator([[y, 128, 128]]), opaqueAlpha
    );

    assert.equal(array.data[0], y, 'red');
    assert.equal(array.data[1], y, 'green');
    assert.equal(array.data[2], y, 'blue');
  });

  /**
   * Tests that the alpha function receives the full YBR triplet and index.
   *
   * @function module:tests/image~viewYbrFullAlphaArgs
   */
  test('generateImageDataYbrFull passes YBR triplet and index to alpha', () => {
    const triplets = [[10, 20, 30], [40, 50, 60]];
    const array = makeImageData(triplets.length);
    const alphaCalls = [];
    const trackingAlpha = (value, index) => {
      alphaCalls.push({value, index});
      return index * 50;
    };

    generateImageDataYbrFull(array, makeIterator(triplets), trackingAlpha);

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
   * Tests for {@link generateImageDataYbrFull} with an empty iterator.
   *
   * @function module:tests/image~viewYbrFullEmpty
   */
  test('generateImageDataYbrFull does nothing for an empty iterator', () => {
    const array = makeImageData(1);
    array.data.fill(99);

    generateImageDataYbrFull(array, makeIterator([]), opaqueAlpha);

    assert.equal(array.data[0], 99);
    assert.equal(array.data[3], 99);
  });

  /**
   * Tests that out-of-range floating-point RGB results are clamped to [0,255].
   *
   * @function module:tests/image~viewYbrFullClamping
   */
  test('generateImageDataYbrFull clamps out-of-range RGB values', () => {
    // Y=255, Cb=0, Cr=255:
    //   r = 255 + 1.402*(255-128) ≈ 433 → clamped to 255
    //   g = 255 - 0.34414*(0-128) - 0.71414*(255-128) ≈ 164 → in range
    //   b = 255 + 1.772*(0-128)   ≈ 28  → in range
    // Derive expected values via the real conversion + Uint8ClampedArray.
    const ref = ybrToRgb(255, 0, 255);
    const expected = new Uint8ClampedArray([ref.r, ref.g, ref.b]);
    const array = makeImageData(1);

    generateImageDataYbrFull(
      array, makeIterator([[255, 0, 255]]), opaqueAlpha
    );

    assert.equal(array.data[0], expected[0], 'red clamped');
    assert.equal(array.data[1], expected[1], 'green exact');
    assert.equal(array.data[2], expected[2], 'blue exact');
  });

});
