import {Size} from '../../src/image/size.js';
import {generateWorkerMessage} from '../../src/image/labelingThread.js';

/**
 * Tests for the 'image/labelingWorker.js' file.
 */

/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link LabelingWorker}.
 *
 * @function module:tests/image~labelingWorker-class
 */
QUnit.test('LabelingWorker class', function (assert) {
  // Basic labels
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
  const labels0 = self.labelingWorker.calculateFromEvent(imgEvent0);

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
  const labels1 = self.labelingWorker.calculateFromEvent(imgEvent1);

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

});