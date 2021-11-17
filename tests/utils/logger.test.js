/**
 * Tests for the 'utils/logger' file.
 */
// Do not warn if these variables were not defined before.
/* global QUnit */

/**
 * Tests for {@link dwv.utils.logger}.
 *
 * @function module:tests/utils~logger
 */
QUnit.test('Test logging.', function (assert) {
  // use the console logger
  dwv.logger = dwv.utils.logger.console;

  // default console log level is WARN
  console.groupCollapsed('test log level WARN');
  dwv.logger.trace('[FAIL] logger.trace + level.WARN -> should NOT see');
  dwv.logger.debug('[FAIL] logger.debug + level.WARN -> should NOT see');
  dwv.logger.info('[FAIL] logger.info + level.WARN -> should NOT see');
  dwv.logger.warn('[PASS] logger.warn + level.WARN -> should see');
  dwv.logger.error('[PASS] logger.error + level.WARN -> should see');
  console.groupEnd();

  // INFO log level
  console.groupCollapsed('test log level INFO');
  dwv.logger.level = dwv.utils.logger.levels.INFO;
  dwv.logger.trace('[FAIL] logger.trace + level.INFO -> should NOT see');
  dwv.logger.debug('[FAIL] logger.debug + level.INFO -> should NOT see');
  dwv.logger.info('[PASS] logger.info + level.INFO -> should see');
  dwv.logger.warn('[PASS] logger.warn + level.INFO -> should see');
  dwv.logger.error('[PASS] logger.error + level.INFO -> should see');
  console.groupEnd();

  // DEBUG log level
  console.groupCollapsed('test log level DEBUG');
  dwv.logger.level = dwv.utils.logger.levels.DEBUG;
  dwv.logger.trace('[FAIL] logger.trace + level.DEBUG -> should NOT see');
  dwv.logger.debug('[PASS] logger.debug + level.DEBUG -> should see');
  dwv.logger.info('[PASS] logger.info + level.DEBUG -> should see');
  dwv.logger.warn('[PASS] logger.warn + level.DEBUG -> should see');
  dwv.logger.error('[PASS] logger.error + level.DEBUG -> should see');
  console.groupEnd();

  // ERROR log level
  console.groupCollapsed('test log level ERROR');
  dwv.logger.level = dwv.utils.logger.levels.ERROR;
  dwv.logger.trace('[FAIL] logger.trace + level.ERROR -> should NOT see');
  dwv.logger.debug('[FAIL] logger.debug + level.ERROR -> should NOT see');
  dwv.logger.info('[FAIL] logger.info + level.ERROR -> should NOT see');
  dwv.logger.warn('[FAIL] logger.warn + level.ERROR -> should NOT see');
  dwv.logger.error('[PASS] logger.error + level.ERROR -> should see');
  console.groupEnd();

  assert.ok(1, 'Logger output');
});
