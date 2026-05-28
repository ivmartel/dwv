/**
 * Class to store a number value and a unit.
 */
export class NumberValue {
  /**
   * @type {number}
   */
  value;
  /**
   * @type {string|undefined}
   */
  unit;
}

/**
 * Number range: [min, max].
 */
export class NumberRange {
  /**
   * @type {number}
   */
  min;
  /**
   * @type {number}
   */
  max;
  /**
   * @param {number} min The minimum.
   * @param {number} max The maximum.
   */
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }
}