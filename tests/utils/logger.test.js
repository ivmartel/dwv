import {logger} from '../../src/utils/logger';

/**
 * Tests for the 'utils/logger' file.
 */

/* global QUnit */
QUnit.module('utils');

/**
 * Tests for {@link utils.logger}.
 *
 * @function module:tests/utils~logging
 */
QUnit.test('logging', function (assert) {
  // default console log level is WARN
  console.groupCollapsed('test log level WARN');
  logger.trace('[FAIL] logger.trace + level.WARN -> should NOT see');
  logger.debug('[FAIL] logger.debug + level.WARN -> should NOT see');
  logger.info('[FAIL] logger.info + level.WARN -> should NOT see');
  logger.warn('[PASS] logger.warn + level.WARN -> should see');
  logger.error('[PASS] logger.error + level.WARN -> should see');
  console.groupEnd();

  // INFO log level
  console.groupCollapsed('test log level INFO');
  logger.level = logger.levels.INFO;
  logger.trace('[FAIL] logger.trace + level.INFO -> should NOT see');
  logger.debug('[FAIL] logger.debug + level.INFO -> should NOT see');
  logger.info('[PASS] logger.info + level.INFO -> should see');
  logger.warn('[PASS] logger.warn + level.INFO -> should see');
  logger.error('[PASS] logger.error + level.INFO -> should see');
  console.groupEnd();

  // DEBUG log level
  console.groupCollapsed('test log level DEBUG');
  logger.level = logger.levels.DEBUG;
  logger.trace('[FAIL] logger.trace + level.DEBUG -> should NOT see');
  logger.debug('[PASS] logger.debug + level.DEBUG -> should see');
  logger.info('[PASS] logger.info + level.DEBUG -> should see');
  logger.warn('[PASS] logger.warn + level.DEBUG -> should see');
  logger.error('[PASS] logger.error + level.DEBUG -> should see');
  console.groupEnd();

  // ERROR log level
  console.groupCollapsed('test log level ERROR');
  logger.level = logger.levels.ERROR;
  logger.trace('[FAIL] logger.trace + level.ERROR -> should NOT see');
  logger.debug('[FAIL] logger.debug + level.ERROR -> should NOT see');
  logger.info('[FAIL] logger.info + level.ERROR -> should NOT see');
  logger.warn('[FAIL] logger.warn + level.ERROR -> should NOT see');
  logger.error('[PASS] logger.error + level.ERROR -> should see');
  console.groupEnd();

  assert.ok(1, 'Logger output');
});
