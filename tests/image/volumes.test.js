import {Size} from '../../src/image/size';
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

  const imgEvent0 = generateWorkerMessage(imgBuffer0, imgSize0);
  const volumes0 = self.volumesWorker.calculateFromEvent(imgEvent0);

  assert.notStrictEqual(
    typeof volumes0,
    'undefined',
    'Expected volume returned for basic segment'
  );
  assert.equal(
    volumes0.length,
    1,
    'Expected number of volume for basic segment'
  );
  assert.equal(
    volumes0[0].segment,
    1,
    'Expected segment1 for basic segment'
  );
  assert.equal(
    volumes0[0].count,
    8,
    'Expected segment1 volume count for basic segment'
  );
  assert.deepEqual(
    volumes0[0].centroidIndex,
    [1.5, 1.5, 0.5],
    'Expected segment1 volume centroidIndex for basic segment'
  );

  // Touching volumes of different segments
  const imgSize1 = new Size([3, 3, 2]);
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

  const imgEvent1 = generateWorkerMessage(imgBuffer1, imgSize1);
  const volumes1 = self.volumesWorker.calculateFromEvent(imgEvent1);

  assert.notStrictEqual(
    typeof volumes1,
    'undefined',
    'Expected volume returned for multiple segments'
  );
  assert.equal(
    volumes1.length,
    3,
    'Expected number of volume for multiple segments'
  );

  assert.equal(
    volumes1[0].segment,
    2,
    'Expected segment2 for multiple segment'
  );
  assert.equal(
    volumes1[0].count,
    6,
    'Expected segment2 volume count 1 for multiple segments'
  );
  assert.deepEqual(
    volumes1[0].centroidIndex,
    [1, 0, 0.5],
    'Expected segment2 volume centroidIndex 1 for multiple segments'
  );

  assert.equal(
    volumes1[1].segment,
    3,
    'Expected segment3 for multiple segment'
  );
  assert.equal(
    volumes1[1].count,
    4,
    'Expected segment3 volume count for multiple segments'
  );
  assert.deepEqual(
    volumes1[1].centroidIndex,
    [0, 1.5, 0.5],
    'Expected segment3 volume centroidIndex for multiple segments'
  );

  assert.equal(
    volumes1[2].segment,
    1,
    'Expected segment1 for multiple segment'
  );
  assert.equal(
    volumes1[2].count,
    8,
    'Expected segment1 volume count for multiple segments'
  );
  assert.deepEqual(
    volumes1[2].centroidIndex,
    [1.5, 1.5, 0.5],
    'Expected segment1 volume centroidIndex for multiple segments'
  );

});