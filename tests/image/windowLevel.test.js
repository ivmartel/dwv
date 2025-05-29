import {
  validateWindowWidthAndCenter,
  WindowLevel
} from '../../src/image/windowLevel.js';

/**
 * Tests for the 'image/windowLevel.js' file.
 */

/* global QUnit */
QUnit.module('image');

/**
 * Tests for {@link WindowLevel}.
 *
 * @function module:tests/image~windowlevel
 */
QUnit.test('WindowLevel class', function (assert) {
  const wcaw00 = new WindowLevel(0, 2);
  assert.equal(wcaw00.center, 0, 'Window level getCenter #00');
  assert.equal(wcaw00.width, 2, 'Window level getWidth #00');

  // width 0 will be forced to 1
  const wcaw01 = new WindowLevel(1, 0);
  assert.equal(wcaw01.center, 1, 'Window level getCenter #01');
  assert.equal(wcaw01.width, 1, 'Window level getWidth #01');
});

/**
 * Tests for validateWindowWidth.
 *
 * @function module:tests/image~validatewindowwidth
 */
QUnit.test('validateWindowWidth.', function (assert) {
  const test01 = validateWindowWidthAndCenter(5, 1, 0, 10);
  assert.equal(test01.width, 1, 'Validate width #0');
  const test02 = validateWindowWidthAndCenter(5, 10, 0, 10);
  assert.equal(test02.width, 10, 'Validate width #1');
  const test03 = validateWindowWidthAndCenter(5, 0, 0, 10);
  assert.equal(test03.width, 1, 'Validate zero width');
  const test04 = validateWindowWidthAndCenter(5, -1, 0, 10);
  assert.equal(test04.width, 1, 'Validate negative width');
});
