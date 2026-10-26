// Math related typedefs, in their own file to allow exporting them
// without functions.

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
 * @property {string} [unit] The value unit.
 */

/**
 * Value of an index, as for example a volume id: the value of the
 * volume (fourth dimension) index, for example
 * `{name: 'EchoTime', value: 4.6, tagKey: '00180081', unit: 'unit.ms'}`.
 *
 * @typedef {object} IndexValue
 * @property {number} value The index value.
 * @property {string} [name] The name of the value origin, for example
 *   the volume id candidate that produced it.
 * @property {string} [tagKey] The key of the DICOM tag
 *   the value is read from.
 * @property {string} [unit] The value unit as an i18n key.
 */

// ESM module marker
export {};
