import {
  VoiLutLinearFunction,
  VoiLutSigmoidFunction
} from '../../src/image/voiLut.js';

/**
 * Tests for the 'image/voiLut.js' file.
 */

/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link VoiLutLinearFunction}.
 *
 * @function module:tests/image~VoiLutLinearFunction
 */
QUnit.test('VoiLutLinearFunction class', function (assert) {
  let isExact = false;

  // x range = [0,9]
  const f00 = new VoiLutLinearFunction(5, 10, isExact);
  assert.equal(f00.getY(0), 0, 'VoiLutLinearFunction #00');
  assert.equal(f00.getY(4.5), 127.5, 'VoiLutLinearFunction #01');
  assert.equal(f00.getY(9), 255, 'VoiLutLinearFunction #02');

  // x range = [0.5,8.5]
  const f10 = new VoiLutLinearFunction(5, 9, isExact);
  assert.equal(f10.getY(0.5), 0, 'VoiLutLinearFunction #10');
  assert.equal(f10.getY(4.5), 127.5, 'VoiLutLinearFunction #11');
  assert.equal(f10.getY(8.5), 255, 'VoiLutLinearFunction #12');

  // linear exact
  isExact = true;

  // x range = [0,10]
  const f20 = new VoiLutLinearFunction(5, 10, isExact);
  assert.equal(f20.getY(0), 0, 'VoiLutLinearFunction #20');
  assert.equal(f20.getY(5), 127.5, 'VoiLutLinearFunction #21');
  assert.equal(f20.getY(10), 255, 'VoiLutLinearFunction #22');

  // x range = [0.5,9.5]
  const f30 = new VoiLutLinearFunction(5, 9, isExact);
  assert.equal(f30.getY(0.5), 0, 'VoiLutLinearFunction #30');
  assert.true(Math.abs(f30.getY(5) - 127.5) < 1e-4, 'VoiLutLinearFunction #31');
  assert.true(Math.abs(f30.getY(9.5) - 255) < 1e-4, 'VoiLutLinearFunction #32');
});

/**
 * Tests for {@link VoiLutSigmoidFunction}.
 *
 * @function module:tests/image~VoiLutSigmoidFunction
 */
QUnit.test('VoiLutSigmoidFunction class', function (assert) {
  const f00 = new VoiLutSigmoidFunction(5, 10);
  assert.true(Math.abs(f00.getY(0) - 30.39) < 0.1, 'VoiLutSigmoidFunction #00');
  assert.equal(f00.getY(5), 127.5, 'VoiLutSigmoidFunction #01');
  assert.true(
    Math.abs(f00.getY(10) - 224.6) < 0.1, 'VoiLutSigmoidFunction #02');

  const f10 = new VoiLutSigmoidFunction(5, 9);
  assert.true(
    Math.abs(f10.getY(0.5) - 30.39) < 0.1, 'VoiLutSigmoidFunction #10');
  assert.equal(f10.getY(5), 127.5, 'VoiLutSigmoidFunction #11');
  assert.true(
    Math.abs(f10.getY(9.5) - 224.6) < 0.1, 'VoiLutSigmoidFunction #12');
});