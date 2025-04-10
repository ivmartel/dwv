import {Point3D} from '../../src/math/point';
import {Size} from '../../src/image/size';
import {Spacing} from '../../src/image/spacing';
import {Geometry} from '../../src/image/geometry';
import {generateWorkerMessage} from '../../src/image/volumes';

/**
 * Tests for the 'image/volumesWorker.js' file.
 */

/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link VolumesWorker}.
 *
 * @function module:tests/image~volumesWorker-class
 */
QUnit.test('VolumesWorker class', function (assert) {
  // Basic volume
  const imgSize0 = new Size([3, 3, 2]);
  const imgSpacing0 = new Spacing([1, 1, 1]);
  const imgOrigin0 = new Point3D(0, 0, 0);
  const imgGeometry0 = new Geometry([imgOrigin0], imgSize0, imgSpacing0);
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
  const volumes0 = self.volumesWorker.calculateFromEvent(imgEvent0);

  assert.notStrictEqual(typeof volumes0, 'undefined');
  assert.equal(volumes0.length, 1);
  assert.equal(volumes0[0].volume, 0.008);
  assert.deepEqual(volumes0[0].centroid, [2, 2, 1]);

  // Touching volumes of different segments
  const imgSize1 = new Size([3, 3, 2]);
  const imgSpacing1 = new Spacing([1, 1, 1]);
  const imgOrigin1 = new Point3D(0, 0, 0);
  const imgGeometry1 = new Geometry([imgOrigin1], imgSize1, imgSpacing1);
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
  const volumes1 = self.volumesWorker.calculateFromEvent(imgEvent1);

  assert.notStrictEqual(typeof volumes1, 'undefined');
  assert.equal(volumes1.length, 3);
  assert.equal(volumes1[0].volume, 0.006);
  assert.deepEqual(volumes1[0].centroid, [1.5, 0.5, 1]);
  assert.equal(volumes1[1].volume, 0.004);
  assert.deepEqual(volumes1[1].centroid, [0.5, 2, 1]);
  assert.equal(volumes1[2].volume, 0.008);
  assert.deepEqual(volumes1[2].centroid, [2, 2, 1]);

  // Altered spacing and origin
  const imgSize2 = new Size([3, 3, 2]);
  const imgSpacing2 = new Spacing([5, 2, 3]);
  const imgOrigin2 = new Point3D(4, 6, 1);
  const imgGeometry2 = new Geometry([imgOrigin2], imgSize2, imgSpacing2);
  /* eslint-disable @stylistic/js/array-element-newline */
  const imgBuffer2 = new Uint8Array([
    0, 0, 0,
    0, 1, 1,
    0, 1, 1,
    0, 0, 0,
    0, 1, 1,
    0, 1, 1,
  ]);
  /* eslint-enable @stylistic/js/array-element-newline */

  const imgEvent2 = generateWorkerMessage(imgBuffer2, imgGeometry2);
  const volumes2 = self.volumesWorker.calculateFromEvent(imgEvent2);

  assert.notStrictEqual(typeof volumes2, 'undefined');
  assert.equal(volumes2.length, 1);
  assert.equal(volumes2[0].volume, 0.24);
  assert.deepEqual(volumes2[0].centroid, [14, 10, 4]);
});