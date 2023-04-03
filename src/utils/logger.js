export const logger = {
  /**
   * Available log levels.
   * Note: need to activate verbose level in
   *   Chrome console to see DEBUG messages.
   */
  levels: {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4
  },

  /**
   * Logger level: default to WARN.
   */
  level: 3,

  /**
   * Log a trace message.
   *
   * @param {string} msg The message to log.
   */
  trace: function (msg) {
    if (this.level <= this.levels.TRACE) {
      console.trace(msg);
    }
  },

  /**
   * Log a debug message.
   * Careful: depends on console settings.
   *
   * @param {string} msg The message to log.
   */
  debug: function (msg) {
    if (this.level <= this.levels.DEBUG) {
      console.debug(msg);
    }
  },

  /**
   * Log an info message.
   *
   * @param {string} msg The message to log.
   */
  info: function (msg) {
    if (this.level <= this.levels.INFO) {
      console.info(msg);
    }
  },

  /**
   * Log a warn message.
   *
   * @param {string} msg The message to log.
   */
  warn: function (msg) {
    if (this.level <= this.levels.WARN) {
      console.warn(msg);
    }
  },

  /**
   * Log an error message.
   *
   * @param {string} msg The message to log.
   */
  error: function (msg) {
    if (this.level <= this.levels.ERROR) {
      console.error(msg);
    }
  }

}; // logger
