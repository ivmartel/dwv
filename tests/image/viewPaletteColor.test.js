import {describe, test, assert, vi, afterEach} from 'vitest';
import {
  generateImageDataPaletteColor
} from '../../src/image/viewPaletteColor.js';
import * as loggerModule from '../../src/utils/logger.js';
import {
  makeImageData,
  makeIterator,
  makeColourMap,
  opaqueAlpha
} from './utils/viewTestHelpers.js';

describe('image', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Tests for {@link generateImageDataPaletteColor} with 8-bit data.
   *
   * @function module:tests/image~viewPaletteColor8bit
   */
  test('generateImageDataPaletteColor writes correct RGBA for 8-bit data',
    () => {
      const colourMap = makeColourMap();
      const pixels = [0, 10, 100, 200];
      const array = makeImageData(pixels.length);

      generateImageDataPaletteColor(
        array, makeIterator(pixels), opaqueAlpha, colourMap, false
      );

      for (let p = 0; p < pixels.length; ++p) {
        const px = pixels[p];
        const base = p * 4;
        assert.equal(array.data[base], colourMap.red[px],
          `red  at pixel ${p}`);
        assert.equal(array.data[base + 1], colourMap.green[px],
          `green at pixel ${p}`);
        assert.equal(array.data[base + 2], colourMap.blue[px],
          `blue  at pixel ${p}`);
        assert.equal(array.data[base + 3], 255,
          `alpha at pixel ${p}`);
      }
    }
  );

  /**
   * Tests for {@link generateImageDataPaletteColor} with 16-bit stored data.
   *
   * @function module:tests/image~viewPaletteColor16bit
   */
  test('generateImageDataPaletteColor right-shifts lut values for 16-bit data',
    () => {
      // Build a 16-bit colour map: values in [0, 65535]
      const red16 = new Array(256).fill(0);
      const green16 = new Array(256).fill(0);
      const blue16 = new Array(256).fill(0);
      // set pixel index 5: R=0x0A00, G=0x1400, B=0x1E00
      // after >> 8: R=0x0A=10, G=0x14=20, B=0x1E=30
      red16[5] = 0x0A00;
      green16[5] = 0x1400;
      blue16[5] = 0x1E00;
      const colourMap16 = {red: red16, green: green16, blue: blue16};

      const array = makeImageData(1);
      generateImageDataPaletteColor(
        array, makeIterator([5]), opaqueAlpha, colourMap16, true
      );

      assert.equal(array.data[0], 10, 'red shifted');
      assert.equal(array.data[1], 20, 'green shifted');
      assert.equal(array.data[2], 30, 'blue shifted');
      assert.equal(array.data[3], 255, 'alpha');
    }
  );

  /**
   * Tests for {@link generateImageDataPaletteColor} alpha function.
   *
   * @function module:tests/image~viewPaletteColorAlpha
   */
  test('generateImageDataPaletteColor passes pixel value and index to alpha',
    () => {
      const colourMap = makeColourMap();
      const pixels = [7, 42];
      const array = makeImageData(pixels.length);
      const alphaCalls = [];
      const trackingAlpha = (value, index) => {
        alphaCalls.push({value, index});
        return index * 10;
      };

      generateImageDataPaletteColor(
        array, makeIterator(pixels), trackingAlpha, colourMap, false
      );

      assert.equal(alphaCalls.length, 2);
      assert.equal(alphaCalls[0].value, 7);
      assert.equal(alphaCalls[0].index, 0);
      assert.equal(alphaCalls[1].value, 42);
      assert.equal(alphaCalls[1].index, 1);
      assert.equal(array.data[3], 0, 'alpha pixel 0');
      assert.equal(array.data[7], 10, 'alpha pixel 1');
    }
  );

  /**
   * Tests for {@link generateImageDataPaletteColor} empty iterator.
   *
   * @function module:tests/image~viewPaletteColorEmpty
   */
  test('generateImageDataPaletteColor does nothing for empty iterator', () => {
    const colourMap = makeColourMap();
    const array = makeImageData(1);
    array.data.fill(99);

    generateImageDataPaletteColor(
      array, makeIterator([]), opaqueAlpha, colourMap, false
    );

    // buffer must be untouched
    assert.equal(array.data[0], 99);
  });

  /**
   * Tests for {@link generateImageDataPaletteColor} 16-bit logging.
   *
   * @function module:tests/image~viewPaletteColor16bitLog
   */
  test('generateImageDataPaletteColor logs info for 16-bit data', () => {
    const infoSpy = vi.spyOn(loggerModule.logger, 'info')
      .mockImplementation(() => {});
    const colourMap = makeColourMap();

    generateImageDataPaletteColor(
      makeImageData(1), makeIterator([0]), opaqueAlpha, colourMap, true
    );

    assert.equal(infoSpy.mock.calls.length, 1);
    assert.ok(
      infoSpy.mock.calls[0][0].includes('16bits'),
      'log message mentions 16bits'
    );
  });

});
