import {
  VoiLinearFunction,
} from '../../src/image/voiLut.js';

/**
 * Tests for the 'image/voiLut.js' file.
 */

/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link VoiLinearFunction}.
 *
 * @function module:tests/image~VoiLinearFunction
 */
QUnit.test('VoiLinearFunction class', function (assert) {
  // x range = [0,9]
  const f0 = new VoiLinearFunction(5, 10);
  assert.equal(f0.getY(0), 0, 'VoiLinearFunction #00');
  assert.equal(f0.getY(4.5), 127.5, 'VoiLinearFunction #01');
  assert.equal(f0.getY(9), 255, 'VoiLinearFunction #02');

  // x range = [0.5,8.5]
  const f1 = new VoiLinearFunction(5, 9);
  assert.equal(f1.getY(0.5), 0, 'VoiLinearFunction #10');
  assert.equal(f1.getY(4.5), 127.5, 'VoiLinearFunction #11');
  assert.equal(f1.getY(8.5), 255, 'VoiLinearFunction #12');
});