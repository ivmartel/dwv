import {describe, test, assert, vi} from 'vitest';
import {Size} from '../../src/image/size.js';
import {Spacing} from '../../src/image/spacing.js';
import {Point3D} from '../../src/math/point.js';
import {Matrix33} from '../../src/math/matrix.js';
import {Geometry} from '../../src/image/geometry.js';
import {ResamplingFilter} from '../../src/image/resamplingFilter.js';
import {
  ResamplingThread,
  generateWorkerMessages,
  generateResampledGeometry
} from '../../src/image/resamplingThread.js';
import {ThreadPool} from '../../src/utils/thread.js';

/**
 * Tests for the 'image/resamplingFilter.js' file.
 */

describe('image', () => {

  /**
   * Tests for {@link ResamplingFilter}.
   *
   * @function module:tests/image~resamplingfilterClass
   */
  test('ResamplingFilter class', () => {
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
    const imgEvent0 = generateWorkerMessages(
      imgBuffer0,
      imgGeometry0,
      resampledGeometry0,
      0,
      false,
      '0'
    );

    const runReturn0 = resamplingFilter.run(imgEvent0[0]);

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
        return value === runReturn0.targetImageBuffer[index];
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
    assert.ok(
      geometriesMatch0,
      'Expected 90° X-axis rotation resampled \
      geometry to match expected geometry'
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

    const imgEvent1 = generateWorkerMessages(
      imgBuffer0,
      imgGeometry0,
      resampledGeometry1,
      0,
      false,
      '1'
    );

    const runReturn1 = resamplingFilter.run(imgEvent1[0]);

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
        return value === runReturn1.targetImageBuffer[index];
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
    assert.ok(
      geometriesMatch1,
      'Expected 90° Y-axis rotation resampled \
      geometry to match expected geometry'
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
    const imgEvent2 = generateWorkerMessages(
      imgBuffer0,
      imgGeometry0,
      resampledGeometry2,
      0,
      false,
      '2'
    );

    const runReturn2 = resamplingFilter.run(imgEvent2[0]);

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
        return value === runReturn2.targetImageBuffer[index];
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
    assert.ok(
      geometriesMatch2,
      'Expected 90° Z-axis rotation resampled \
      geometry to match expected geometry'
    );

    // Basic 90° 4D Rotation
    // --------------------------
    const imgSize3 = new Size([3, 3, 2, 2]);
    const imgSpacing3 = new Spacing([1, 2, 3, 1]);
    const imgOrigins3 = [
      new Point3D(0, 0, 0),
      new Point3D(0, 0, 3)
    ];
    const imgOrientation3 = new Matrix33([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);
    const imgGeometry3 = new Geometry(
      imgOrigins3,
      imgSize3,
      imgSpacing3,
      imgOrientation3
    );
    const imgBuffer3 = new Uint8Array([
      0, 0, 0,
      0, 1, 1,
      0, 1, 1,

      0, 0, 0,
      0, 1, 1,
      0, 1, 1,

      0, 1, 1,
      0, 1, 1,
      0, 0, 0,

      0, 1, 1,
      0, 1, 1,
      0, 0, 0,
    ]);

    const targetOrientation3 = new Matrix33([
      0, -1, 0,
      1, 0, 0,
      0, 0, 1
    ]);
    const resampledGeometry3 = generateResampledGeometry(
      imgGeometry3,
      targetOrientation3
    );
    const imgEvent3 = generateWorkerMessages(
      imgBuffer3,
      imgGeometry3,
      resampledGeometry3,
      false
    );

    const runReturn3a = resamplingFilter.run(imgEvent3[0]);
    const runReturn3b = resamplingFilter.run(imgEvent3[1]);

    const expectedSize3 = new Size([3, 3, 2, 2]);
    const expectedSpacing3 = new Spacing([2, 1, 3, 1]);
    const expectedOrigins3 = [
      new Point3D(3, 0, 0),
      new Point3D(3, 0, 3),
    ];
    const expectedGeometry3 = new Geometry(
      expectedOrigins3,
      expectedSize3,
      expectedSpacing3,
      targetOrientation3
    );
    const expectedBuffer3a = new Uint8Array([
      0, 1, 1,
      0, 1, 1,
      0, 0, 0,

      0, 1, 1,
      0, 1, 1,
      0, 0, 0
    ]);

    const expectedBuffer3b = new Uint8Array([
      1, 1, 0,
      1, 1, 0,
      0, 0, 0,

      1, 1, 0,
      1, 1, 0,
      0, 0, 0
    ]);

    const buffersMatch3a =
      expectedBuffer3a.map((value, index) => {
        return value === runReturn3a.targetImageBuffer[index];
      }).reduce((a, b) => {
        return a && b;
      });

    const buffersMatch3b =
      expectedBuffer3b.map((value, index) => {
        return value === runReturn3b.targetImageBuffer[index];
      }).reduce((a, b) => {
        return a && b;
      });

    const geometriesMatch3 =
      expectedGeometry3.equals(resampledGeometry3);

    assert.equal(
      buffersMatch3a,
      1,
      'Expected 90° 4D resampled buffer for frame 1 to match expected buffer'
    );
    assert.equal(
      buffersMatch3b,
      1,
      'Expected 90° 4D resampled buffer for frame 2 to match expected buffer'
    );
    assert.ok(
      geometriesMatch3,
      'Expected 90° 4D resampled geometry to match expected geometry'
    );

    /* eslint-enable @stylistic/js/array-element-newline */
  });

  /**
   * Get a 4D test geometry and buffer: 2 frames of 3x3x2, the second
   *   frame values are the first ones plus 100.
   *
   * @returns {object} The geometry and buffer.
   */
  function get4DTestData() {
    const geometry = new Geometry(
      [new Point3D(0, 0, 0), new Point3D(0, 0, 3)],
      new Size([3, 3, 2, 2]),
      new Spacing([1, 2, 3, 1]),
      new Matrix33([1, 0, 0, 0, 1, 0, 0, 0, 1])
    );
    const buffer = new Uint16Array(36);
    for (let i = 0; i < 18; ++i) {
      buffer[i] = i;
      buffer[i + 18] = i + 100;
    }
    return {geometry, buffer};
  }

  /**
   * Tests that {@link generateWorkerMessages} passes a view on each frame
   * data for 4D data.
   *
   * @function module:tests/image~generateWorkerMessages4D
   */
  test('generateWorkerMessages passes frame views for 4D data', () => {
    const {geometry, buffer} = get4DTestData();
    const targetGeometry = generateResampledGeometry(
      geometry, geometry.getOrientation());
    const messages = generateWorkerMessages(
      buffer, geometry, targetGeometry, 0, false, 'job');

    assert.equal(messages.length, 2, 'one message per frame');
    for (let f = 0; f < 2; ++f) {
      const frameBuffer = messages[f].sourceImageBuffer;
      assert.equal(frameBuffer.buffer, buffer.buffer,
        `frame ${f}: view on the image buffer`);
      assert.deepEqual(Array.from(frameBuffer),
        Array.from(buffer.subarray(f * 18, (f + 1) * 18)),
        `frame ${f}: frame data`);
      assert.equal(messages[f].targetStartOffset, f * 18,
        `frame ${f}: target offset`);
    }
  });

  /**
   * Tests that the resampling task start message holds a compact copy of
   * the frame data and transfers it.
   *
   * @function module:tests/image~resamplingTaskStartMessage
   */
  test('ResamplingThread task posts a compact transferred copy', () => {
    const addSpy = vi.spyOn(ThreadPool.prototype, 'addWorkerTask')
      .mockImplementation(() => {});
    const {geometry, buffer} = get4DTestData();

    new ResamplingThread().run(
      buffer, geometry, 0, geometry.getOrientation(), false);

    assert.equal(addSpy.mock.calls.length, 2, 'one task per frame');
    for (let f = 0; f < 2; ++f) {
      const task = addSpy.mock.calls[f][0];
      const {message, transfer} = task.getStartMessage();
      const sent = message.sourceImageBuffer;
      assert.ok(sent instanceof Uint16Array, `frame ${f}: same type`);
      assert.deepEqual(Array.from(sent),
        Array.from(buffer.subarray(f * 18, (f + 1) * 18)),
        `frame ${f}: frame data`);
      assert.equal(sent.buffer.byteLength, 18 * 2,
        `frame ${f}: copy only holds the frame data`);
      assert.equal(transfer.length, 1, `frame ${f}: one transferred object`);
      assert.equal(transfer[0], sent.buffer,
        `frame ${f}: copy buffer transferred`);
    }
    assert.equal(buffer.buffer.byteLength, 36 * 2, 'input left untouched');
    addSpy.mockRestore();
  });

});