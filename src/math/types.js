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
 * @property {string} [unit] The value unit, passed to `i18n.t` for
 *   display: an i18n key (for example 'unit.mm') or a plain unit
 *   (for example 'HU').
 */

/**
 * Number value with its source, as for example a volume id: the value
 * of the volume (fourth dimension) index, for example
 * `{source: 'EchoTime', value: 4.6, tagKey: '00180081', unit: 'unit.ms'}`.
 * A number value with:
 * - source: the name of the value source, for example the volume id
 *   candidate that produced it,
 * - tagKey: the key of the DICOM tag the value is read from.
 *
 * @typedef {NumberValue & {source?: string, tagKey?: string}}
 *   SourcedNumberValue
 */

// ESM module marker
export {};
