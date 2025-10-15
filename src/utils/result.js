/**
 * Class to store a boolean result and a message.
 */
export class BooleanResult {
  /**
   * @type {boolean}
   */
  success;
  /**
   * @type {string|undefined}
   */
  message;

  /**
   * @param {boolean} success The success flag.
   */
  constructor(success) {
    this.success = success;
  }
}
