// Array related typedefs, in their own file to allow exporting them
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

// ESM module marker
export {};
