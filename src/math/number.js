import {logger} from '../utils/logger.js';

// Number.EPSILON is difference between 1 and the smallest
// floating point number greater than 1
// -> ~2e-16
// BIG_EPSILON -> ~2e-12
export const BIG_EPSILON = Number.EPSILON * 1e4;
export const BIG_EPSILON_EXPONENT = 12;
// 'real world', for example when comparing positions
export const REAL_WORLD_EPSILON = 1e-4;
export const REAL_WORLD_EXPONENT = 5;

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

/**
 * Check if two numbers are similar.
 *
 * @param {number} a The first number.
 * @param {number} b The second number.
 * @param {number} [tol] Optional comparison tolerance,
 *   defaults to Number.EPSILON.
 * @returns {boolean} True if similar.
 */
export function isSimilar(a, b, tol) {
  if (typeof tol === 'undefined') {
    tol = Number.EPSILON;
  }
  return Math.abs(a - b) < tol;
}

/**
 * Check if a value is above REAL_WORLD_EPSILON*100 meaning
 * it is non negligible. Warns if the value is
 * above REAL_WORLD_EPSILON but below REAL_WORLD_EPSILON*100.
 *
 * @param {number} value The value to test.
 * @returns {boolean} True if the value is above the REAL_WORLD_EPSILON*100,
 * false otherwise.
 */
export function isAboveEpsilon(value) {
  let res = value > REAL_WORLD_EPSILON;
  if (res) {
    // try larger epsilon
    res = value > REAL_WORLD_EPSILON * 10;
    if (!res) {
      // warn if epsilon < value < epsilon * 10
      logger.warn(
        'Using larger real world epsilon'
      );
    } else {
      res = value > REAL_WORLD_EPSILON * 100;
      if (!res) {
        // warn if epsilon < value < epsilon * 100
        logger.warn(
          'Using larger+ real world epsilon'
        );
      }
    }
  }
  return res;
};