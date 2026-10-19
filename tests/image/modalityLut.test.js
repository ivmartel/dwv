import {describe, test, assert} from 'vitest';
import {
  ModalityLut,
  isLutBitsStored
} from '../../src/image/modalityLut.js';
import {RescaleSlopeAndIntercept} from '../../src/image/rsi.js';

/**
 * Tests for the 'image/modalityLut.js' file.
 */

describe('image', () => {

  /**
   * Tests for {@link isLutBitsStored}.
   *
   * @function module:tests/image~isLutBitsStored
   */
  test('isLutBitsStored', () => {
    assert.ok(isLutBitsStored(8), 'isLutBitsStored 8');
    assert.ok(isLutBitsStored(16), 'isLutBitsStored 16');
    assert.notOk(isLutBitsStored(undefined), 'isLutBitsStored undefined');
    assert.notOk(isLutBitsStored(0), 'isLutBitsStored 0');
    assert.notOk(isLutBitsStored(17), 'isLutBitsStored 17');
    assert.notOk(isLutBitsStored(32), 'isLutBitsStored 32');
  });

  /**
   * Tests for {@link ModalityLut}.
   *
   * @function module:tests/image~modalityLutClass
   */
  test('ModalityLut class', () => {
    const idRsi = new RescaleSlopeAndIntercept(1, 0);
    const rsi = new RescaleSlopeAndIntercept(2, -10);

    // identity rsi: no lut, any bits stored
    const lut00 = new ModalityLut(idRsi, 8);
    assert.equal(lut00.getLength(), 256, 'ModalityLut length #00');
    assert.equal(lut00.getValue(12), 12, 'ModalityLut value #00');
    const lut01 = new ModalityLut(idRsi, 32);
    assert.equal(lut01.getLength(), undefined, 'ModalityLut length #01');
    assert.equal(lut01.getValue(100000), 100000, 'ModalityLut value #01');
    const lut02 = new ModalityLut(idRsi, undefined);
    assert.equal(lut02.getLength(), undefined, 'ModalityLut length #02');
    assert.equal(lut02.getValue(1.5), 1.5, 'ModalityLut value #02');

    // non identity rsi
    const lut10 = new ModalityLut(rsi, 8);
    assert.equal(lut10.getLength(), 256, 'ModalityLut length #10');
    assert.equal(lut10.getValue(0), -10, 'ModalityLut value #10');
    assert.equal(lut10.getValue(255), 500, 'ModalityLut value #11');

    // non identity rsi with bad bits stored
    assert.throws(() => {
      new ModalityLut(rsi, undefined);
    }, 'Cannot create modality LUT', 'ModalityLut throw #20');
    assert.throws(() => {
      new ModalityLut(rsi, 32);
    }, 'Cannot create modality LUT', 'ModalityLut throw #21');
  });

});
