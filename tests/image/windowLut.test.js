import {describe, test, assert} from 'vitest';
import {ModalityLut} from '../../src/image/modalityLut.js';
import {WindowLut} from '../../src/image/windowLut.js';
import {RescaleSlopeAndIntercept} from '../../src/image/rsi.js';

/**
 * Tests for the 'image/windowLut.js' file.
 */

describe('image', () => {

  /**
   * Tests for {@link WindowLut}.
   *
   * @function module:tests/image~windowLutClass
   */
  test('WindowLut class', () => {
    const idRsi = new RescaleSlopeAndIntercept(1, 0);

    // discrete
    const wlut00 = new WindowLut(new ModalityLut(idRsi, 8), false, true);
    assert.ok(typeof wlut00 !== 'undefined', 'WindowLut #00');

    // discrete with bad sizes
    assert.throws(() => {
      new WindowLut(new ModalityLut(idRsi, undefined), false, true);
    }, 'Cannot create window LUT', 'WindowLut throw #10');
    assert.throws(() => {
      new WindowLut(new ModalityLut(idRsi, 32), false, true);
    }, 'Cannot create window LUT', 'WindowLut throw #11');

    // non discrete: no size constraint
    const wlut20 = new WindowLut(new ModalityLut(idRsi, 32), false, false);
    assert.ok(typeof wlut20 !== 'undefined', 'WindowLut #20');
    const wlut21 =
      new WindowLut(new ModalityLut(idRsi, undefined), true, false);
    assert.ok(typeof wlut21 !== 'undefined', 'WindowLut #21');
  });

});
