// namespaces
var dwv = dwv || {};
/** @namespace */
dwv.utils = dwv.utils || {};
/** @namespace */
dwv.utils.logger = dwv.utils.logger || {};
/** @namespace */
dwv.utils.logger.console = dwv.utils.logger.console || {};

/**
 * Main logger, defaults to the console logger.
 * @see dwv.utils.logger.console
 */
dwv.logger = dwv.utils.logger.console;

/**
 * Available log levels.
 * Note: need to activate verbose level in Chrome console to see DEBUG messages.
 */
dwv.utils.logger.levels = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4
};

/**
 * Default console logger.
 */

// console logger default level
dwv.utils.logger.console.level = dwv.utils.logger.levels.WARN;

/**
 * Log a trace message.
 *
 * @param {string} msg The message to log.
 */
dwv.utils.logger.console.trace = function (msg) {
  if (dwv.logger.level <= dwv.utils.logger.levels.TRACE) {
    console.trace(msg);
  }
};

/**
 * Log a debug message.
 * Careful: depends on console settings.
 *
 * @param {string} msg The message to log.
 */
dwv.utils.logger.console.debug = function (msg) {
  if (dwv.logger.level <= dwv.utils.logger.levels.DEBUG) {
    console.debug(msg);
  }
};

/**
 * Log an info message.
 *
 * @param {string} msg The message to log.
 */
dwv.utils.logger.console.info = function (msg) {
  if (dwv.logger.level <= dwv.utils.logger.levels.INFO) {
    console.info(msg);
  }
};

/**
 * Log a warn message.
 *
 * @param {string} msg The message to log.
 */
dwv.utils.logger.console.warn = function (msg) {
  if (dwv.logger.level <= dwv.utils.logger.levels.WARN) {
    console.warn(msg);
  }
};

/**
 * Log an error message.
 *
 * @param {string} msg The message to log.
 */
dwv.utils.logger.console.error = function (msg) {
  if (dwv.logger.level <= dwv.utils.logger.levels.ERROR) {
    console.error(msg);
  }
};
