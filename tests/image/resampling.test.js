import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import {Matrix33} from '../../src/math/matrix.js';
import {Geometry} from '../../src/image/geometry.js';
import {ResamplingFilter} from '../../src/image/resamplingFilter.js';
import {
  generateWorkerMessage,
  generateResampledGeometry,
  generateBuffer
} from '../../src/image/resamplingThread.js';

/**
 * Tests for the 'image/ResamplingFilter.js' file.
 */

/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link ResamplingFilter}.
 *
 * @function module:tests/image~ResamplingFilter-class
 */
QUnit.test('ResamplingFilter class', function (assert) {
  /* eslint-disable @stylistic/js/array-element-newline */
  const resamplingFilter = new ResamplingFilter();

  const imgSize0 = new Size([3, 3, 2]);
  const imgSpacing0 = new Spacing([1, 2, 3]);
  const imgOrigins0 = [
    new Point3D(0, 0, 0),
    new Point3D(0, 0, 3)
  ];
  const imgOrientation0 = new Matrix33([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]);
  const imgGeometry0 = new Geometry(
    imgOrigins0,
    imgSize0,
    imgSpacing0,
    imgOrientation0
  );
  const imgBuffer0 = new Uint8Array([
    0, 0, 0,
    0, 1, 1,
    0, 1, 1,

    0, 0, 0,
    0, 1, 1,
    0, 1, 1,
  ]);

  // Basic 90° X-Axis Rotation
  // --------------------------
  const targetOrientation0 = new Matrix33([
    1, 0, 0,
    0, 0, -1,
    0, 1, 0
  ]);
  const resampledGeometry0 = generateResampledGeometry(
    imgGeometry0,
    targetOrientation0
  );
  const resampledBuffer0 = generateBuffer(
    imgBuffer0,
    0,
    resampledGeometry0.getSize()
  );
  const imgEvent0 = generateWorkerMessage(
    imgBuffer0,
    imgGeometry0,
    resampledBuffer0,
    resampledGeometry0,
    false
  );

  resamplingFilter.run(imgEvent0);

  const expectedSize0 = new Size([3, 2, 3]);
  const expectedSpacing0 = new Spacing([1, 3, 2]);
  const expectedOrigins0 = [
    new Point3D(0, 6, 0),
    new Point3D(0, 4, 0),
    new Point3D(0, 2, 0),
  ];
  const expectedGeometry0 = new Geometry(
    expectedOrigins0,
    expectedSize0,
    expectedSpacing0,
    targetOrientation0
  );
  const expectedBuffer0 = new Uint8Array([
    0, 1, 1,
    0, 1, 1,

    0, 1, 1,
    0, 1, 1,

    0, 0, 0,
    0, 0, 0,
  ]);

  const buffersMatch0 =
    expectedBuffer0.map((value, index) => {
      return value === resampledBuffer0[index];
    }).reduce((a, b) => {
      return a && b;
    });

  const geometriesMatch0 =
    expectedGeometry0.equals(resampledGeometry0);

  assert.equal(
    buffersMatch0,
    1,
    'Expected 90° X-axis rotation resampled buffer to match expected buffer'
  );
  assert.true(
    geometriesMatch0,
    'Expected 90° X-axis rotation resampled geometry to match expected geometry'
  );

  // Basic 90° Y-Axis Rotation
  // --------------------------
  const targetOrientation1 = new Matrix33([
    0, 0, 1,
    0, 1, 0,
    -1, 0, 0
  ]);
  const resampledGeometry1 = generateResampledGeometry(
    imgGeometry0,
    targetOrientation1
  );
  const resampledBuffer1 = generateBuffer(
    imgBuffer0,
    0,
    resampledGeometry1.getSize()
  );
  const imgEvent1 = generateWorkerMessage(
    imgBuffer0,
    imgGeometry0,
    resampledBuffer1,
    resampledGeometry1,
    false
  );

  resamplingFilter.run(imgEvent1);

  const expectedSize1 = new Size([2, 3, 3]);
  const expectedSpacing1 = new Spacing([3, 2, 1]);
  const expectedOrigins1 = [
    new Point3D(0, 0, 6),
    new Point3D(1, 0, 6),
    new Point3D(2, 0, 6),
  ];
  const expectedGeometry1 = new Geometry(
    expectedOrigins1,
    expectedSize1,
    expectedSpacing1,
    targetOrientation1
  );
  const expectedBuffer1 = new Uint8Array([
    0, 0,
    0, 0,
    0, 0,
    0, 0,
    1, 1,
    1, 1,
    0, 0,
    1, 1,
    1, 1,
  ]);

  const buffersMatch1 =
    expectedBuffer1.map((value, index) => {
      return value === resampledBuffer1[index];
    }).reduce((a, b) => {
      return a && b;
    });

  const geometriesMatch1 =
    expectedGeometry1.equals(resampledGeometry1);

  assert.equal(
    buffersMatch1,
    1,
    'Expected 90° Y-axis rotation resampled buffer to match expected buffer'
  );
  assert.true(
    geometriesMatch1,
    'Expected 90° Y-axis rotation resampled geometry to match expected geometry'
  );

  // Basic 90° Z-Axis Rotation
  // --------------------------
  const targetOrientation2 = new Matrix33([
    0, -1, 0,
    1, 0, 0,
    0, 0, 1
  ]);
  const resampledGeometry2 = generateResampledGeometry(
    imgGeometry0,
    targetOrientation2
  );
  const resampledBuffer2 = generateBuffer(
    imgBuffer0,
    0,
    resampledGeometry2.getSize()
  );
  const imgEvent2 = generateWorkerMessage(
    imgBuffer0,
    imgGeometry0,
    resampledBuffer2,
    resampledGeometry2,
    false
  );

  resamplingFilter.run(imgEvent2);

  const expectedSize2 = new Size([3, 3, 2]);
  const expectedSpacing2 = new Spacing([2, 1, 3]);
  const expectedOrigins2 = [
    new Point3D(3, 0, 0),
    new Point3D(3, 0, 3),
  ];
  const expectedGeometry2 = new Geometry(
    expectedOrigins2,
    expectedSize2,
    expectedSpacing2,
    targetOrientation2
  );
  const expectedBuffer2 = new Uint8Array([
    0, 1, 1,
    0, 1, 1,
    0, 0, 0,

    0, 1, 1,
    0, 1, 1,
    0, 0, 0,
  ]);

  const buffersMatch2 =
    expectedBuffer2.map((value, index) => {
      return value === resampledBuffer2[index];
    }).reduce((a, b) => {
      return a && b;
    });

  const geometriesMatch2 =
    expectedGeometry2.equals(resampledGeometry2);

  assert.equal(
    buffersMatch2,
    1,
    'Expected 90° Z-axis rotation resampled buffer to match expected buffer'
  );
  assert.true(
    geometriesMatch2,
    'Expected 90° Z-axis rotation resampled geometry to match expected geometry'
  );

  /* eslint-enable @stylistic/js/array-element-newline */
});