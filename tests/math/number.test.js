import {describe, test, assert, vi, afterEach} from 'vitest';
import {REAL_WORLD_EPSILON} from '../../src/math/matrix.js';
import {isAboveEpsilon} from '../../src/math/number.js';
import * as loggerModule from '../../src/utils/logger.js';

/**
 * Tests for the 'math/number.js' file.
 */

describe('math', () => {

  afterEach(() => {
    vi.restoreAllMocks();
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