import {describe, test, assert} from 'vitest';
import {
  ThresholdFilter,
  SharpenFilter,
  SobelFilter
} from '../../src/image/filter.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {Image} from '../../src/image/image.js';
import {Point3D} from '../../src/math/point.js';

/**
 * Tests for the 'image/filter.js' file.
 */

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Build a single-slice Image from a flat array of pixel values.
 * The image is `width × height × 1`, stored as Int16Array.
 *
 * @param {number} width Number of columns.
 * @param {number} height Number of rows.
 * @param {number[]} values Pixel values in row-major order (x varies fastest).
 * @returns {Image} The constructed Image.
 */
function makeImage(width, height, values) {
  const geometry = new Geometry(
    [new Point3D(0, 0, 0)],
    new Size([width, height, 1]),
    new Spacing([1, 1, 1])
  );
  return new Image(geometry, new Int16Array(values));
}

// ---------------------------------------------------------------------------
// ThresholdFilter
// ---------------------------------------------------------------------------

describe('image', () => {

  /**
   * Tests for {@link ThresholdFilter} getName.
   *
   * @function module:tests/image~threshold-filter-name
   */
  test('ThresholdFilter getName returns Threshold', () => {
    assert.equal(new ThresholdFilter().getName(), 'Threshold');
  });

  /**
   * Tests for {@link ThresholdFilter} min/max accessors.
   *
   * @function module:tests/image~threshold-filter-accessors
   */
  test('ThresholdFilter min/max accessors round-trip', () => {
    const f = new ThresholdFilter();
    f.setMin(10);
    f.setMax(90);
    assert.equal(f.getMin(), 10, 'getMin');
    assert.equal(f.getMax(), 90, 'getMax');
  });

  /**
   * Tests for {@link ThresholdFilter} image accessor.
   *
   * @function module:tests/image~threshold-filter-image-accessor
   */
  test('ThresholdFilter setOriginalImage/getOriginalImage round-trip', () => {
    const f = new ThresholdFilter();
    const img = makeImage(1, 1, [42]);
    f.setOriginalImage(img);
    assert.equal(f.getOriginalImage(), img, 'getOriginalImage');
  });

  /**
   * Tests that update returns a new image, leaving the original unchanged.
   *
   * @function module:tests/image~threshold-filter-new-image
   */
  test('ThresholdFilter update returns a new image', () => {
    const img = makeImage(3, 1, [10, 50, 90]);
    const f = new ThresholdFilter();
    f.setOriginalImage(img);
    f.setMin(20);
    f.setMax(80);
    const result = f.update();
    assert.notEqual(result, img, 'different reference');
    assert.equal(img.getBuffer()[1], 50, 'original unchanged');
  });

  /**
   * Tests that values inside [min, max] are preserved.
   *
   * @function module:tests/image~threshold-filter-inside-range
   */
  test('ThresholdFilter keeps values inside [min, max]', () => {
    const img = makeImage(3, 1, [10, 50, 90]);
    const f = new ThresholdFilter();
    f.setOriginalImage(img);
    f.setMin(10);
    f.setMax(90);
    const buf = f.update().getBuffer();
    assert.equal(buf[0], 10, 'min boundary kept');
    assert.equal(buf[1], 50, 'mid value kept');
    assert.equal(buf[2], 90, 'max boundary kept');
  });

  /**
   * Tests that values outside [min, max] are replaced with imageMin.
   *
   * @function module:tests/image~threshold-filter-outside-range
   */
  test('ThresholdFilter replaces out-of-range values with imageMin', () => {
    // values: 10 (min), 20, 30, 40, 50
    // imageMin = 10; threshold [25, 45]
    // expected: [10, 10, 30, 40, 10]
    const img = makeImage(5, 1, [10, 20, 30, 40, 50]);
    const f = new ThresholdFilter();
    f.setOriginalImage(img);
    f.setMin(25);
    f.setMax(45);
    const buf = f.update().getBuffer();
    assert.equal(buf[0], 10, 'value at imageMin left as imageMin');
    assert.equal(buf[1], 10, 'value below min → imageMin');
    assert.equal(buf[2], 30, 'value in range kept');
    assert.equal(buf[3], 40, 'value in range kept');
    assert.equal(buf[4], 10, 'value above max → imageMin');
  });

  // ---------------------------------------------------------------------------
  // SharpenFilter
  // ---------------------------------------------------------------------------

  /**
   * Tests for {@link SharpenFilter} getName.
   *
   * @function module:tests/image~sharpen-filter-name
   */
  test('SharpenFilter getName returns Sharpen', () => {
    assert.equal(new SharpenFilter().getName(), 'Sharpen');
  });

  /**
   * Tests for {@link SharpenFilter} image accessor.
   *
   * @function module:tests/image~sharpen-filter-image-accessor
   */
  test('SharpenFilter setOriginalImage/getOriginalImage round-trip', () => {
    const f = new SharpenFilter();
    const img = makeImage(1, 1, [42]);
    f.setOriginalImage(img);
    assert.equal(f.getOriginalImage(), img);
  });

  /**
   * Tests that update returns a new image.
   *
   * @function module:tests/image~sharpen-filter-new-image
   */
  test('SharpenFilter update returns a new image', () => {
    const img = makeImage(3, 3, Array(9).fill(10));
    const f = new SharpenFilter();
    f.setOriginalImage(img);
    assert.notEqual(f.update(), img, 'different reference');
  });

  /**
   * Tests that a uniform image is preserved by the sharpen kernel.
   * For a flat region: 5v - 4v = v at every interior pixel.
   *
   * @function module:tests/image~sharpen-filter-uniform
   */
  test('SharpenFilter preserves a uniform image', () => {
    const img = makeImage(3, 3, Array(9).fill(10));
    const f = new SharpenFilter();
    f.setOriginalImage(img);
    const buf = f.update().getBuffer();
    for (let i = 0; i < 9; ++i) {
      assert.equal(buf[i], 10, `pixel ${i} unchanged in uniform image`);
    }
  });

  /**
   * Tests the sharpen kernel coefficient at the centre pixel.
   * With all neighbours = 0 and centre = 100, the centre output = 5 × 100.
   *
   * @function module:tests/image~sharpen-filter-center-pixel
   */
  test('SharpenFilter amplifies isolated centre pixel by factor 5', () => {
    // 3×3, all zeros except centre (index 4)
    const values = [0, 0, 0, 0, 100, 0, 0, 0, 0];
    const img = makeImage(3, 3, values);
    const f = new SharpenFilter();
    f.setOriginalImage(img);
    const buf = f.update().getBuffer();
    assert.equal(buf[4], 500, 'centre pixel amplified: 5 × 100');
  });

  // ---------------------------------------------------------------------------
  // SobelFilter
  // ---------------------------------------------------------------------------

  /**
   * Tests for {@link SobelFilter} getName.
   *
   * @function module:tests/image~sobel-filter-name
   */
  test('SobelFilter getName returns Sobel', () => {
    assert.equal(new SobelFilter().getName(), 'Sobel');
  });

  /**
   * Tests for {@link SobelFilter} image accessor.
   *
   * @function module:tests/image~sobel-filter-image-accessor
   */
  test('SobelFilter setOriginalImage/getOriginalImage round-trip', () => {
    const f = new SobelFilter();
    const img = makeImage(1, 1, [42]);
    f.setOriginalImage(img);
    assert.equal(f.getOriginalImage(), img);
  });

  /**
   * Tests that update returns a new image.
   *
   * @function module:tests/image~sobel-filter-new-image
   */
  test('SobelFilter update returns a new image', () => {
    const img = makeImage(3, 3, Array(9).fill(10));
    const f = new SobelFilter();
    f.setOriginalImage(img);
    assert.notEqual(f.update(), img, 'different reference');
  });

  /**
   * Tests that a uniform image produces zero gradient everywhere.
   * GradX = gradY = 0 on a flat field → sqrt(0² + 0²) = 0.
   *
   * @function module:tests/image~sobel-filter-uniform
   */
  test('SobelFilter produces zero gradient for a uniform image', () => {
    const img = makeImage(3, 3, Array(9).fill(20));
    const f = new SobelFilter();
    f.setOriginalImage(img);
    const buf = f.update().getBuffer();
    for (let i = 0; i < 9; ++i) {
      assert.equal(buf[i], 0, `pixel ${i} is zero`);
    }
  });

  /**
   * Tests that the Sobel output is floor(sqrt(gradX² + gradY²)).
   * A vertical step edge gives a known horizontal gradient.
   *
   * @function module:tests/image~sobel-filter-step-edge
   */
  test('SobelFilter detects a vertical step edge', () => {
    // 3×3 image: left column = 0, right column = 100
    // centre column = 0  (sharp left–right boundary)
    /* eslint-disable @stylistic/js/array-element-newline */
    const img = makeImage(3, 3, [
      0, 0, 100,
      0, 0, 100,
      0, 0, 100
    ]);
    /* eslint-enable @stylistic/js/array-element-newline */
    const f = new SobelFilter();
    f.setOriginalImage(img);
    const buf = f.update().getBuffer();

    // Centre pixel (1,1):
    //   gradX kernel [1,0,-1, 2,0,-2, 1,0,-1]:
    //     1×0 + 0 + (-1)×100 + 2×0 + 0 + (-2)×100 + 1×0 + 0 + (-1)×100
    //     = -100 - 200 - 100 = -400
    //   gradY kernel [1,2,1, 0,0,0, -1,-2,-1] → all rows identical → gradY = 0
    //   result = floor(sqrt(400² + 0²)) = 400
    assert.equal(buf[4], 400, 'centre pixel gradient magnitude');

    // Uniform left column → no gradient
    assert.equal(buf[0], 0, 'top-left: no horizontal gradient (left edge)');
  });

});
