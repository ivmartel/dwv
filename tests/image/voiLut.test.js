import {
  VoiLinearFunction,
  VoiSigmoidFunction
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
  let isExact = false;

  // x range = [0,9]
  const f00 = new VoiLinearFunction(5, 10, isExact);
  assert.equal(f00.getY(0), 0, 'VoiLinearFunction #00');
  assert.equal(f00.getY(4.5), 127.5, 'VoiLinearFunction #01');
  assert.equal(f00.getY(9), 255, 'VoiLinearFunction #02');

  // x range = [0.5,8.5]
  const f10 = new VoiLinearFunction(5, 9, isExact);
  assert.equal(f10.getY(0.5), 0, 'VoiLinearFunction #10');
  assert.equal(f10.getY(4.5), 127.5, 'VoiLinearFunction #11');
  assert.equal(f10.getY(8.5), 255, 'VoiLinearFunction #12');

  // linear exact
  isExact = true;

  // x range = [0,10]
  const f20 = new VoiLinearFunction(5, 10, isExact);
  assert.equal(f20.getY(0), 0, 'VoiLinearFunction #20');
  assert.equal(f20.getY(5), 127.5, 'VoiLinearFunction #21');
  assert.equal(f20.getY(10), 255, 'VoiLinearFunction #22');

  // x range = [0.5,9.5]
  const f30 = new VoiLinearFunction(5, 9, isExact);
  assert.equal(f30.getY(0.5), 0, 'VoiLinearFunction #30');
  assert.true(Math.abs(f30.getY(5) - 127.5) < 1e-4, 'VoiLinearFunction #31');
  assert.true(Math.abs(f30.getY(9.5) - 255) < 1e-4, 'VoiLinearFunction #32');
});

/**
 * Tests for {@link VoiSigmoidFunction}.
 *
 * @function module:tests/image~VoiSigmoidFunction
 */
QUnit.test('VoiSigmoidFunction class', function (assert) {
  const f00 = new VoiSigmoidFunction(5, 10);
  assert.true(Math.abs(f00.getY(0) - 30.39) < 0.1, 'VoiSigmoidFunction #00');
  assert.equal(f00.getY(5), 127.5, 'VoiSigmoidFunction #01');
  assert.true(Math.abs(f00.getY(10) - 224.6) < 0.1, 'VoiSigmoidFunction #02');

  const f10 = new VoiSigmoidFunction(5, 9);
  assert.true(Math.abs(f10.getY(0.5) - 30.39) < 0.1, 'VoiSigmoidFunction #10');
  assert.equal(f10.getY(5), 127.5, 'VoiSigmoidFunction #11');
  assert.true(Math.abs(f10.getY(9.5) - 224.6) < 0.1, 'VoiSigmoidFunction #12');
});