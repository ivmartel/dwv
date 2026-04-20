import {describe, test, assert} from 'vitest';
import {Point3D} from '../../src/math/point.js';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Geometry} from '../../src/image/geometry.js';
import {LabelingFilter} from '../../src/image/labelingFilter.js';
import {generateWorkerMessage} from '../../src/image/labelingThread.js';

/**
 * Tests for the 'image/labelingFilter.js' file.
 */

describe('image', () => {

  /**
   * Check if a number is within epsilon of another number.
   *
   * @param {number} A First number.
   * @param {number} B Number to compare.
   * @param {number} epsilon Max difference.
   * @returns {boolean} Are A and B close?
   */
  function closeTo(A, B, epsilon) {
    return Math.abs(A - B) <= epsilon;
  }

  /**
   * Tests for {@link LabelingFilter}.
   *
   * @function module:tests/image~labelingfilterClass
   */
  test('LabelingFilter class', () => {
    const labelingFilter = new LabelingFilter();

    // Unused, only needed to construct the geometry
    const imgOrigins = new Point3D(0, 0, 0);
    const imgSpacing = new Spacing([1, 1, 1]);

    // Basic labels
    const imgSize0 = new Size([3, 3, 2]);
    const imgGeometry0 =
      new Geometry(
        imgOrigins,
        imgSize0,
        imgSpacing
      );

    /* eslint-disable @stylistic/js/array-element-newline */
    const imgBuffer0 = new Uint8Array([
      0, 0, 0,
      0, 1, 1,
      0, 1, 1,
      0, 0, 0,
      0, 1, 1,
      0, 1, 1,
    ]);
    /* eslint-enable @stylistic/js/array-element-newline */

    const imgEvent0 = generateWorkerMessage(imgBuffer0, imgGeometry0);
    const labelEvent0 = labelingFilter.run(imgEvent0);
    const labels0 = labelEvent0.labels;

    assert.notStrictEqual(
      typeof labels0,
      'undefined',
      'Expected labels returned for basic label'
    );
    assert.equal(
      labels0.length,
      1,
      'Expected number of labels for basic label'
    );
    assert.equal(
      labels0[0].id,
      1,
      'Expected id #1 for basic label'
    );
    assert.equal(
      labels0[0].count,
      8,
      'Expected id #1 count for basic label'
    );
    assert.deepEqual(
      labels0[0].centroidIndex,
      [1.5, 1.5, 0.5],
      'Expected id #1 centroidIndex for basic label'
    );

    // Touching labels of different ids
    const imgSize1 = new Size([3, 3, 2]);
    const imgGeometry1 =
      new Geometry(
        imgOrigins,
        imgSize1,
        imgSpacing
      );
    /* eslint-disable @stylistic/js/array-element-newline */
    const imgBuffer1 = new Uint8Array([
      2, 2, 2,
      3, 1, 1,
      3, 1, 1,
      2, 2, 2,
      3, 1, 1,
      3, 1, 1,
    ]);
    /* eslint-enable @stylistic/js/array-element-newline */

    const imgEvent1 = generateWorkerMessage(imgBuffer1, imgGeometry1);
    const labelEvent1 = labelingFilter.run(imgEvent1);
    const labels1 = labelEvent1.labels;

    assert.notStrictEqual(
      typeof labels1,
      'undefined',
      'Expected labels returned for multiple labels'
    );
    assert.equal(
      labels1.length,
      3,
      'Expected number of labels for multiple labels'
    );

    assert.equal(
      labels1[0].id,
      2,
      'Expected id #2 for multiple labels'
    );
    assert.equal(
      labels1[0].count,
      6,
      'Expected id #2 count for multiple labels'
    );
    assert.deepEqual(
      labels1[0].centroidIndex,
      [1, 0, 0.5],
      'Expected id #2 centroidIndex for multiple labels'
    );

    assert.equal(
      labels1[1].id,
      3,
      'Expected id #3 for multiple labels'
    );
    assert.equal(
      labels1[1].count,
      4,
      'Expected id #3 count for multiple labels'
    );
    assert.deepEqual(
      labels1[1].centroidIndex,
      [0, 1.5, 0.5],
      'Expected id #3 centroidIndex for multiple labels'
    );

    assert.equal(
      labels1[2].id,
      1,
      'Expected id #1 for multiple labels'
    );
    assert.equal(
      labels1[2].count,
      8,
      'Expected id #1 count for multiple labels'
    );
    assert.deepEqual(
      labels1[2].centroidIndex,
      [1.5, 1.5, 0.5],
      'Expected id #1 centroidIndex for multiple labels'
    );


    // Larger labels for diameter calculation
    // (Diameters are weird on very small segments)
    const imgSize2 = new Size([6, 6, 3]);
    const imgGeometry2 =
      new Geometry(
        imgOrigins,
        imgSize2,
        imgSpacing
      );
    /* eslint-disable @stylistic/js/array-element-newline */
    const imgBuffer2 = new Uint8Array([
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 0,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,

      0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 0,
      0, 0, 1, 1, 1, 0,
      0, 0, 0, 0, 0, 0,

      0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 0,
      0, 1, 1, 1, 1, 0,
      0, 0, 0, 1, 1, 0,
      0, 0, 0, 1, 1, 0,
      0, 0, 0, 0, 0, 0,
    ]);
    /* eslint-enable @stylistic/js/array-element-newline */

    const imgEvent2 = generateWorkerMessage(imgBuffer2, imgGeometry2);
    const labelEvent2 = labelingFilter.run(imgEvent2);
    const labels2 = labelEvent2.labels;

    assert.notStrictEqual(
      typeof labels2,
      'undefined',
      'Expected labels returned for label diameters'
    );
    assert.equal(
      labels2.length,
      1,
      'Expected number of labels for label diameters'
    );
    assert.equal(
      labels2[0].id,
      1,
      'Expected id #1 for label diameters'
    );
    assert.equal(
      labels2[0].count,
      32,
      'Expected id #1 count for label diameters'
    );

    assert.notStrictEqual(
      typeof labels2[0].diameters.minor,
      'undefined',
      'Expected minor diameter returned for label diameters'
    );

    const major2 = labels2[0].diameters.major;
    const minor2 = labels2[0].diameters.minor;

    assert.ok(
      closeTo(major2.diameter, 4.2426, 0.0001),
      'Expected major diameter value for label diameters'
    );
    assert.ok(
      closeTo(minor2.diameter, 2.8284, 0.0001),
      'Expected minor diameter value for label diameters'
    );
    assert.equal(
      labels2[0].height,
      3,
      'Expected height for label diameters'
    );
    assert.equal(
      labels2[0].largestSliceZ,
      1,
      'Expected largest slice Z for label diameters'
    );
    assert.equal(
      major2.offset1,
      43,
      'Expected major offset 1 for label diameters'
    );
    assert.equal(
      major2.offset2,
      64,
      'Expected major offset 2 for label diameters'
    );
    assert.equal(
      minor2.offset1,
      56,
      'Expected minor offset 1 for label diameters'
    );
    assert.equal(
      minor2.offset2,
      46,
      'Expected minor offset 2 for label diameters'
    );
  });

});