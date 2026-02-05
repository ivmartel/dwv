import {describe, test, expect, vi} from 'vitest';
import {logger} from '../../src/utils/logger.js';

/**
 * Tests for the 'utils/logger' file.
 */

describe('utils', () => {

  const spies = {
    trace: vi.spyOn(console, 'trace').mockImplementation(() => {}),
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {})
  };

  /**
   * Expect the input spy name to have been called
   * but not the others. If not a good name, expects
   * all the spys to not have been called.
   *
   * @param {string} spyName The name of the spy.
   */
  function expectSpyCalled(spyName) {
    const keys = Object.keys(spies);
    for (const key of keys) {
      if (key === spyName) {
        expect(spies[key]).toHaveBeenCalled();
      } else {
        expect(spies[key]).not.toHaveBeenCalled();
      }
    }
    // clear mocks to reset called counts
    vi.clearAllMocks();
  }

  /**
   * Tests for {@link utils.logger}.
   *
   * @function module:tests/utils~logging
   */
  test('logging', () => {
    // default console log level is WARN
    logger.trace('[FAIL] logger.trace + level.WARN -> should NOT see');
    expectSpyCalled('');
    logger.debug('[FAIL] logger.debug + level.WARN -> should NOT see');
    expectSpyCalled('');
    logger.info('[FAIL] logger.info + level.WARN -> should NOT see');
    expectSpyCalled('');
    logger.warn('[PASS] logger.warn + level.WARN -> should see');
    expectSpyCalled('warn');
    logger.error('[PASS] logger.error + level.WARN -> should see');
    expectSpyCalled('error');

    // INFO log level
    logger.level = logger.levels.INFO;
    logger.trace('[FAIL] logger.trace + level.INFO -> should NOT see');
    expectSpyCalled('');
    logger.debug('[FAIL] logger.debug + level.INFO -> should NOT see');
    expectSpyCalled('');
    logger.info('[PASS] logger.info + level.INFO -> should see');
    expectSpyCalled('info');
    logger.warn('[PASS] logger.warn + level.INFO -> should see');
    expectSpyCalled('warn');
    logger.error('[PASS] logger.error + level.INFO -> should see');
    expectSpyCalled('error');

    // DEBUG log level
    logger.level = logger.levels.DEBUG;
    logger.trace('[FAIL] logger.trace + level.DEBUG -> should NOT see');
    expectSpyCalled('');
    logger.debug('[PASS] logger.debug + level.DEBUG -> should see');
    expectSpyCalled('debug');
    logger.info('[PASS] logger.info + level.DEBUG -> should see');
    expectSpyCalled('info');
    logger.warn('[PASS] logger.warn + level.DEBUG -> should see');
    expectSpyCalled('warn');
    logger.error('[PASS] logger.error + level.DEBUG -> should see');
    expectSpyCalled('error');

    // ERROR log level
    logger.level = logger.levels.ERROR;
    logger.trace('[FAIL] logger.trace + level.ERROR -> should NOT see');
    expectSpyCalled('');
    logger.debug('[FAIL] logger.debug + level.ERROR -> should NOT see');
    expectSpyCalled('');
    logger.info('[FAIL] logger.info + level.ERROR -> should NOT see');
    expectSpyCalled('');
    logger.warn('[FAIL] logger.warn + level.ERROR -> should NOT see');
    expectSpyCalled('');
    logger.error('[PASS] logger.error + level.ERROR -> should see');
    expectSpyCalled('error');
  });

});
