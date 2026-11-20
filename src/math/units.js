/**
 * @import {NumberValue} from './types.js';
 */

/**
 * Length unit to surface unit, for length units that are millimetres.
 */
const SurfaceUnits = {
  'unit.mm': 'unit.cm2',
  'unit.mmDetector': 'unit.cm2Detector'
};

/**
 * Get a surface value with its unit from a surface in squared length unit.
 *
 * Millimetre based surfaces are converted to squared centimetres,
 * other surfaces keep the length unit.
 *
 * @param {number} surface The surface in squared length unit.
 * @param {string} [lengthUnit] The length unit.
 * @returns {NumberValue} The surface value and unit.
 */
export function getSurfaceValue(surface, lengthUnit) {
  const surfaceUnit = SurfaceUnits[lengthUnit];
  if (typeof surfaceUnit !== 'undefined') {
    return {
      value: surface / 100,
      unit: surfaceUnit
    };
  }
  return {
    value: surface,
    unit: lengthUnit
  };
}

/**
 * Check if a length unit is millimetre based.
 *
 * @param {string} [lengthUnit] The length unit.
 * @returns {boolean} True if millimetre based.
 */
export function isMillimetreUnit(lengthUnit) {
  return typeof SurfaceUnits[lengthUnit] !== 'undefined';
}
