import {describe, test, assert} from 'vitest';
import {Matrix33} from '../../src/math/matrix.js';
import {Size} from '../../src/image/size.js';
import {ImageContour} from '../../src/image/imageContour.js';

/**
 * Tests for the 'image/imageContour.js' file.
 */

describe('ImageContour', () => {

  /**
   * Tests for {@link ImageContour} getDistance.
   *
   * @function module:tests/image~imageContourGetdistance
   */
  test('ImageContour getDistance', () => {

    const imgSize0 = new Size([6, 6, 3]);
    /* eslint-disable @stylistic/js/array-element-newline */
    const imgBuffer0 = new Uint8Array([
      0, 0, 0, 0, 0, 0,
      0, 0, 1, 0, 1, 0,
      0, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 1, 0,
      0, 0, 0, 0, 1, 0,
      0, 0, 0, 0, 0, 0,

      0, 0, 0, 0, 0, 0,
      1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 0,
      1, 1, 1, 1, 1, 0,

      0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 0,
      0, 0, 0, 1, 1, 0,
      0, 0, 0, 1, 1, 0,
      0, 0, 0, 0, 0, 0,
    ]);
    /* eslint-enable @stylistic/js/array-element-newline */

    const contour = new ImageContour();
    contour.initialize(imgBuffer0, imgSize0);

    /* eslint-disable @stylistic/js/array-element-newline */
    const o00 = [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
    /* eslint-enable @stylistic/js/array-element-newline */
    const orientation00 = new Matrix33(o00);

    // looking along z (xDim=x, yDim=y): pixel (3,3,z=1) is 2 steps
    // from the y=5 boundary in +y: (3,4) same value, (3,5) is boundary
    const distance00 = contour.getDistance(57, orientation00);
    assert.equal(
      distance00,
      2,
      'Expected distance from contour 0'
    );

    // looking along z (xDim=x, yDim=y): pixel (4,2,z=1) is 1 step
    // from the x=5 boundary in +x
    const distance01 = contour.getDistance(52, orientation00);
    assert.equal(
      distance01,
      1,
      'Expected distance from contour 1'
    );

    /* eslint-disable @stylistic/js/array-element-newline */
    const o01 = [
      1, 0, 0,
      0, 0, 1,
      0, 1, 0,
    ];
    /* eslint-enable @stylistic/js/array-element-newline */
    const orientation01 = new Matrix33(o01);

    // looking along y (xDim=z, yDim=x): pixel (4,2,z=1) is 1 step
    // from the x=5 boundary in +x
    const distance02 = contour.getDistance(52, orientation01);
    assert.equal(
      distance02,
      1,
      'Expected distance from contour 2'
    );

    // looking along y (xDim=z, yDim=x): pixel (2,2,z=1) is 1 step
    // from the z=2 boundary in +z
    const distance03 = contour.getDistance(50, orientation01);
    assert.equal(
      distance03,
      1,
      'Expected distance from contour 3'
    );

    /* eslint-disable @stylistic/js/array-element-newline */
    const o02 = [
      0, 0, 1,
      1, 0, 0,
      0, 1, 0,
    ];
    /* eslint-enable @stylistic/js/array-element-newline */
    const orientation02 = new Matrix33(o02);

    // looking along x (xDim=y, yDim=z): all pixels are 1 step from a
    // z-boundary since the buffer is only 3 slices deep
    const distance04 = contour.getDistance(57, orientation02);
    assert.equal(
      distance04,
      1,
      'Expected distance from contour 4'
    );

    const distance05 = contour.getDistance(16, orientation02);
    assert.equal(
      distance05,
      1,
      'Expected distance from contour 5'
    );
  });

});
