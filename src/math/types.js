// Math related typedefs, in their own file to allow exporting them
// without functions.
// Keep this file type only: typedefs and JSDoc `@import` only, no
// runtime import or code, so that it stays a leaf of the module graph
// and cannot create circular dependencies.

/**
 * List of compatible integer typed arrays.
 *
 * @typedef {(
 *   Uint8Array | Int8Array |
 *   Uint16Array | Int16Array |
 *   Uint32Array | Int32Array
 * )} IntTypedArray
 */

/**
 * List of compatible float typed arrays.
 *
 * @typedef {Float32Array | Float64Array} FloatTypedArray
 */

/**
 * List of compatible typed arrays.
 *
 * @typedef {IntTypedArray | FloatTypedArray} TypedArray
 */

/**
 * Number value and its unit.
 *
 * @typedef {object} NumberValue
 * @property {number} value The value.
 * @property {string} [unit] The value unit, passed to `i18n.t` for
 *   display: an i18n key (for example 'unit.mm') or a plain unit
 *   (for example 'HU').
 */

/**
 * Number value and its unit, with its source, for example
 * `{value: 4.6, unit: 'unit.ms', source: 'EchoTime', tagKey: '00180081'}`.
 *
 * @typedef {object} SourcedNumberValue
 * @property {number} value The value.
 * @property {string} [unit] The value unit, see NumberValue.
 * @property {string} [source] The name of the value source, for
 *   example the volume id candidate that produced it.
 * @property {string} [tagKey] The key of the DICOM tag the value is
 *   read from.
 */

// ESM module marker
export {};
