import {describe, test, assert, vi, afterEach} from 'vitest';
import {
  REAL_WORLD_EPSILON,
  isSimilar,
  isSimilarProgressive,
  isBellowTolerance,
  isAboveEpsilon
} from '../../src/math/number.js';
import * as loggerModule from '../../src/utils/logger.js';

/**
 * Tests for the 'math/number.js' file.
 */

describe('math', () => {

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Tests for {@link isSimilar}.
   *
   * @function module:tests/math~isSimilar
   */
  test('isSimilar', () => {
    // default tol = Number.EPSILON ~ 2e-16

    // 1 and 1 -> true
    assert.isTrue(isSimilar(1, 1));

    // 1 and 1 + Number.EPSILON/2 -> true
    assert.isTrue(isSimilar(1, 1 + Number.EPSILON / 2));
    assert.isTrue(isSimilar(1, 1 - Number.EPSILON / 2));

    // 1 and 1 + Number.EPSILON*2 -> false
    assert.isFalse(isSimilar(1, 1 + Number.EPSILON * 2));
    assert.isFalse(isSimilar(1, 1 - Number.EPSILON * 2));
  });

  /**
   * Tests for {@link isSimilarProgressive}.
   *
   * @function module:tests/math~isSimilarProgressive
   */
  test('isSimilarProgressive', () => {
    // default tol = Number.EPSILON ~ 2e-16

    // 1 and 1 -> true
    assert.isTrue(isSimilarProgressive(1, 1).success);

    // 1 and 1 + Number.EPSILON/2 -> true
    assert.isTrue(isSimilarProgressive(1, 1 + Number.EPSILON / 2).success);
    assert.isTrue(isSimilarProgressive(1, 1 - Number.EPSILON / 2).success);

    // 1 and 1 + Number.EPSILON*2 -> false
    assert.isFalse(isSimilarProgressive(1, 1 + Number.EPSILON * 2).success);
    assert.isFalse(isSimilarProgressive(1, 1 - Number.EPSILON * 2).success);

    // with tolNum
    const testA = 1;
    const testB = 1 + Number.EPSILON * 5;
    let res = isSimilarProgressive(testA, testB, undefined, 1);
    assert.isFalse(res.success);
    assert.equal(res.message, '5', 'message shows multiple');

    res = isSimilarProgressive(testA, testB, undefined, 4);
    assert.isFalse(res.success);
    assert.equal(res.message, '5', 'message shows multiple');

    res = isSimilarProgressive(testA, testB, undefined, 5);
    assert.isFalse(res.success);
    assert.equal(res.message, '5', 'message shows multiple');

    res = isSimilarProgressive(testA, testB, undefined, 6);
    assert.isTrue(res.success);
    assert.equal(res.message, '5', 'message shows multiple');

    res = isSimilarProgressive(testA, testB, undefined, 10);
    assert.isTrue(res.success);
    assert.equal(res.message, '5', 'message shows multiple');
  });

  /**
   * Tests for {@link isBellowTolerance}.
   *
   * @function module:tests/math~isBellowTolerance
   */
  test('isBellowTolerance', () => {
    // default tol and tolNum
    let testVal = Number.EPSILON / 2;
    let res = isBellowTolerance(testVal);
    assert.isTrue(res.success);

    testVal = Number.EPSILON;
    res = isBellowTolerance(testVal);
    assert.isFalse(res.success);

    testVal = Number.EPSILON * 2;
    res = isBellowTolerance(testVal);
    assert.isFalse(res.success);

    // with tolNum
    testVal = Number.EPSILON * 5;
    // same as default
    res = isBellowTolerance(testVal, Number.EPSILON, 1);
    assert.isFalse(res.success);
    assert.equal(res.message, '5', 'message shows multiple');
    // smaller tolNum than multiplier
    res = isBellowTolerance(testVal, Number.EPSILON, 4);
    assert.isFalse(res.success);
    assert.equal(res.message, '5', 'message shows multiple');
    // equal tolNum and multiplier
    res = isBellowTolerance(testVal, Number.EPSILON, 5);
    assert.isFalse(res.success);
    assert.equal(res.message, '5', 'message shows multiple');
    // larger tolNum than multiplier
    res = isBellowTolerance(testVal, Number.EPSILON, 6);
    assert.isTrue(res.success);
    assert.equal(res.message, '5', 'message shows multiple');
    // larger tolNum than multiplier
    res = isBellowTolerance(testVal, Number.EPSILON, 10);
    assert.isTrue(res.success);
    assert.equal(res.message, '5', 'message shows multiple');
  });

  /**
   * Tests for {@link isAboveEpsilon}.
   *
   * @function module:tests/math~isAboveEpsilon
   */
  test('isAboveEpsilon', () => {
    const warnSpy = vi.spyOn(loggerModule.logger, 'warn')
      .mockImplementation(() => {});

    // REAL_WORLD_EPSILON is 1e-4

    // equal REAL_WORLD_EPSILON -> false
    assert.isFalse(isAboveEpsilon(REAL_WORLD_EPSILON));
    assert.equal(warnSpy.mock.calls.length, 0, 'warning on above epsilon');

    // REAL_WORLD_EPSILON*10 -> false
    assert.isFalse(isAboveEpsilon(REAL_WORLD_EPSILON * 10));
    assert.equal(warnSpy.mock.calls.length, 1, 'warning on overwrite');
    assert.ok(warnSpy.mock.calls[0][0].includes('larger real world epsilon'),
      'warning mentions larger epsilon');

    // REAL_WORLD_EPSILON*100 -> false
    assert.isFalse(isAboveEpsilon(REAL_WORLD_EPSILON * 100));
    assert.equal(warnSpy.mock.calls.length, 2, 'warning on overwrite');
    assert.ok(warnSpy.mock.calls[1][0].includes('larger+ real world epsilon'),
      'warning mentions larger+ epsilon');

    // REAL_WORLD_EPSILON*1000 -> true
    assert.isTrue(isAboveEpsilon(REAL_WORLD_EPSILON * 1000));
    assert.equal(warnSpy.mock.calls.length, 2, 'warning on overwrite');
  });

});