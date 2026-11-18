import {describe, test, assert} from 'vitest';
import {
  getMinWindowWidth,
  validateWindowLevel,
  WindowLevel
} from '../../src/image/windowLevel.js';

/**
 * Tests for the 'image/windowLevel.js' file.
 */

describe('image', () => {

  /**
   * Tests for {@link WindowLevel}.
   *
   * @function module:tests/image~windowLevelClass
   */
  test('WindowLevel class', () => {
    const wcaw00 = new WindowLevel(0, 2);
    assert.equal(wcaw00.center, 0, 'Window level getCenter #00');
    assert.equal(wcaw00.width, 2, 'Window level getWidth #00');

    // width 0 will NOT be forced to 1
    const wcaw01 = new WindowLevel(1, 0);
    assert.equal(wcaw01.center, 1, 'Window level getCenter #01');
    assert.equal(wcaw01.width, 0, 'Window level getWidth #01');
  });

  /**
   * Tests for validateWindowLevel.
   *
   * @function module:tests/image~validateWindowLevel
   */
  test('validateWindowLevel', () => {
    const range0 = {min: 0, max: 10};

    const wl00 = new WindowLevel(5, 1);
    const wl01 = validateWindowLevel(wl00, range0);
    assert.equal(wl01.center, wl00.center, 'Validate center #00');
    assert.equal(wl01.width, wl00.width, 'Validate width #00');

    const wl10 = new WindowLevel(5, 10);
    const wl11 = validateWindowLevel(wl10, range0);
    assert.equal(wl11.center, wl10.center, 'Validate center #10');
    assert.equal(wl11.width, wl10.width, 'Validate width #10');

    const wl20 = new WindowLevel(5, 0);
    const wl21 = validateWindowLevel(wl20, range0);
    assert.equal(wl21.center, wl20.center, 'Validate center #20');
    assert.equal(wl21.width, 1, 'Validate zero width #20');

    const wl30 = new WindowLevel(5, -1);
    const wl31 = validateWindowLevel(wl30, range0);
    assert.equal(wl31.center, wl30.center, 'Validate center #30');
    assert.equal(wl31.width, 1, 'Validate negative width #30');

    // LINEAR: the minimum width of 1 wins over a small range
    const range1 = {min: 0, max: 0.5};
    const wl40 = new WindowLevel(0.25, 0.5);
    const wl41 = validateWindowLevel(wl40, range1);
    assert.equal(wl41.width, 1, 'Validate small range width #40');

    // LINEAR_EXACT: widths below 1 are allowed
    const wl42 = validateWindowLevel(wl40, range1, 'LINEAR_EXACT');
    assert.equal(wl42.width, 0.5, 'Validate small range exact width #42');
    // but must be strictly positive
    const wl43 = validateWindowLevel(wl20, range0, 'LINEAR_EXACT');
    assert.isAbove(wl43.width, 0, 'Validate zero exact width #43');
  });

  /**
   * Tests for getMinWindowWidth.
   *
   * @function module:tests/image~getMinWindowWidth
   */
  test('getMinWindowWidth', () => {
    assert.equal(getMinWindowWidth(), 1, 'Default min width');
    assert.equal(getMinWindowWidth('LINEAR'), 1, 'Linear min width');
    assert.equal(getMinWindowWidth('LINEAR_EXACT'), Number.EPSILON,
      'Linear exact min width');
    assert.equal(getMinWindowWidth('SIGMOID'), Number.EPSILON,
      'Sigmoid min width');
  });

});
