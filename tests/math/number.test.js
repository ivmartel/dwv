import {describe, test, assert, vi, afterEach} from 'vitest';
import {
  REAL_WORLD_EPSILON,
  isSimilar,
  isSimilarProgressive,
  isBellowTolerance,
  isAboveEpsilon,
  precisionRound
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
    assert.equal(res.message, undefined, 'message shows multiple');

    res = isSimilarProgressive(testA, testB, undefined, 10);
    assert.isTrue(res.success);
    assert.equal(res.message, undefined, 'message shows multiple');
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
    assert.equal(res.message, undefined, 'message shows multiple');
    // larger tolNum than multiplier
    res = isBellowTolerance(testVal, Number.EPSILON, 10);
    assert.isTrue(res.success);
    assert.equal(res.message, undefined, 'message shows multiple');
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

  /**
   * Tests for {@link precisionRound}.
   *
   * @function module:tests/utils~precisionround
   */
  test('precisionRound', () => {
    // just to be sure...
    assert.equal(Math.round(-1.5), -1, 'test round #00');
    assert.equal(Math.round(-0.6), -1, 'test round #01');
    assert.equal(Math.round(-0.5), 0, 'test round #02');
    assert.equal(Math.round(-0.1), 0, 'test round #03');
    assert.equal(Math.round(0.1), 0, 'test round #04');
    assert.equal(Math.round(0.5), 1, 'test round #05');
    assert.equal(Math.round(0.6), 1, 'test round #06');
    assert.equal(Math.round(1.5), 2, 'test round #07');

    assert.equal(precisionRound(-0.004, 2), 0, 'test #00');
    assert.equal(precisionRound(-0.005, 2), 0, 'test #01');
    assert.equal(precisionRound(-0.006, 2), -0.01, 'test #02');

    assert.equal(precisionRound(0.004, 2), 0, 'test #10');
    assert.equal(precisionRound(0.005, 2), 0.01, 'test #11');
    assert.equal(precisionRound(0.006, 2), 0.01, 'test #1');

    assert.equal(precisionRound(1.004, 2), 1, 'test #20');
    assert.equal(precisionRound(1.005, 2), 1.01, 'test #21');
    assert.equal(precisionRound(1.006, 2), 1.01, 'test #22');

    assert.equal(precisionRound(1.05, 1), 1.1, 'test #31');
    assert.equal(precisionRound(1.0005, 3), 1.001, 'test #31');
    assert.equal(precisionRound(1.00005, 4), 1.0001, 'test #31');
    assert.equal(precisionRound(1.000005, 5), 1.00001, 'test #31');

    assert.equal(precisionRound(1234.5, 0), 1235, 'test #40');
    assert.equal(precisionRound(1234.56, 0), 1235, 'test #41');
    assert.equal(precisionRound(1234.5, 1), 1234.5, 'test #42');
    assert.equal(precisionRound(1234.56, 1), 1234.6, 'test #43');
    assert.equal(precisionRound(1234.5, 2), 1234.5, 'test #44');
    assert.equal(precisionRound(1234.56, 2), 1234.56, 'test #45');
    assert.equal(precisionRound(1234.566, 2), 1234.57, 'test #46');
    assert.equal(precisionRound(1234.5666, 2), 1234.57, 'test #47');

    assert.equal(precisionRound(123.009, 2), 123.01, 'test #50');
    assert.equal(precisionRound(0.009, 2), 0.01, 'test #51');
    assert.equal(precisionRound(0.092, 2), 0.09, 'test #52');
    assert.equal(precisionRound(0.095, 2), 0.1, 'test #53');
  });

});