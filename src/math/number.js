import {logger} from '../utils/logger.js';
import {BooleanResult} from '../utils/result.js';

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
 * Check if two numbers are similar.
 * Progressively tries larger tolerances up to tol*tolNum.
 *
 * @param {number} a The first number.
 * @param {number} b The second number.
 * @param {number} [tol] Optional comparison tolerance,
 *   defaults to Number.EPSILON.
 * @param {number} [tolNum] Optional tolerated tolerance number,
 *   default to 1, returns true with a message
 *   if tol < Math.abs(a-b) < tolNum*tol.
 * @returns {BooleanResult} True if the value is below tolNum*tol,
 *   false otherwise.
 */
export function isSimilarProgressive(a, b, tol, tolNum) {
  // abs is done in isBellowTolerance
  return isBellowTolerance((a - b), tol, tolNum);
}

/**
 * Check if a value is below a given tolerance.
 * Progressively tries larger tolerances up to tol*tolNum.
 *
 * @param {number} value The value to test.
 * @param {number} [tol] Optional tolerance,
 *   defaults to Number.EPSILON.
 * @param {number} [tolNum] Optional tolerated tolerance number,
 *   default to 1, returns true with a message
 *   if tol < value < tolNum*tol.
 * @returns {BooleanResult} True if the value is below tolNum*tol,
 *   false otherwise.
 */
export function isBellowTolerance(value, tol, tolNum) {
  if (typeof tol === 'undefined') {
    tol = Number.EPSILON;
  }
  if (typeof tolNum === 'undefined') {
    tolNum = 1;
  }
  // how many tols away
  const multiple = Math.abs(value) / tol;

  const res = multiple < tolNum;
  const br = new BooleanResult(res);
  if (!res) {
    br.message = `${precisionRound(multiple, 2)}`;
  }
  return br;
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

/**
 * Round a float number to a given precision.
 *
 * Inspired from {@link https://stackoverflow.com/a/49729715/3639892}.
 *
 * `toPrecision` uses all non zero digits of the number:
 * (123.009).toPrecision(4) = "123.0";
 * (0.09).toPrecision(4) = "0.09000".
 *
 * `toFixed` does not always behave as expected:
 * (123.009).toFixed(2) = "123.01";
 * (0.009).toFixed(2) = "0.01";
 * but
 * (-0.005).toFixed(2) = "-0.01" (expecting 0);
 * (1.005).toFixed(2) = "1" (expecting 1.01).
 *
 * @param {number} number The number to round.
 * @param {number} precision The rounding precision, ie the result number
 *   of digits after the comma.
 * @returns {number} The rounded number.
 */
export function precisionRound(number, precision) {
  const factor = Math.pow(10, precision);
  const delta = 0.01 / factor; // fixes precisionRound(1.005, 2)
  return Math.round(number * factor + delta) / factor;
}