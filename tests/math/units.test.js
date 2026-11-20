import {describe, test, assert} from 'vitest';
import {
  getSurfaceValue,
  isMillimetreUnit
} from '../../src/math/units.js';

/**
 * Tests for the 'math/units.js' file.
 */

describe('math', () => {

  /**
   * Tests for {@link getSurfaceValue}.
   *
   * @function module:tests/math~getsurfacevalue
   */
  test('getSurfaceValue', () => {
    // mm: surface in cm2
    const s0 = getSurfaceValue(250, 'unit.mm');
    assert.equal(s0.value, 2.5, 'mm value');
    assert.equal(s0.unit, 'unit.cm2', 'mm unit');

    // mm at detector: surface in cm2 at detector
    const s1 = getSurfaceValue(250, 'unit.mmDetector');
    assert.equal(s1.value, 2.5, 'mm detector value');
    assert.equal(s1.unit, 'unit.cm2Detector', 'mm detector unit');

    // pixel: surface kept as is
    const s2 = getSurfaceValue(250, 'unit.pixel');
    assert.equal(s2.value, 250, 'pixel value');
    assert.equal(s2.unit, 'unit.pixel', 'pixel unit');

    // undefined unit
    const s3 = getSurfaceValue(250, undefined);
    assert.equal(s3.value, 250, 'undefined value');
    assert.equal(s3.unit, undefined, 'undefined unit');
  });

  /**
   * Tests for {@link isMillimetreUnit}.
   *
   * @function module:tests/math~ismillimetreunit
   */
  test('isMillimetreUnit', () => {
    assert.ok(isMillimetreUnit('unit.mm'), 'mm');
    assert.ok(isMillimetreUnit('unit.mmDetector'), 'mm detector');
    assert.notOk(isMillimetreUnit('unit.pixel'), 'pixel');
    assert.notOk(isMillimetreUnit(undefined), 'undefined');
  });

});
