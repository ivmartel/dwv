// DICOM related typedefs, in their own file to allow exporting them
// without functions.
// Keep this file type only: typedefs and JSDoc `@import` only, no
// runtime import or code, so that it stays a leaf of the module graph
// and cannot create circular dependencies.

/**
 * @import {NumberValue, SourcedNumberValue} from '../math/types.js';
 */

/**
 * A simple (non sequence) tag value: either a single primitive
 *   or, for multi-valued VRs, an array of primitives.
 *
 * @typedef {string | number | string[] | number[]} SimpleTagValue
 */

/**
 * A simple sequence (VR=SQ) tag value.
 *
 * @typedef {object} SimpleSequenceValue
 * @property {SimpleTagValues[]} value The sequence items.
 * @property {boolean} [undefinedLength] Undefined length flag.
 */

/**
 * The meta data as simple tag values: indexed by tag name instead of
 *   tag key, with direct values (no element object) for non sequence,
 *   non merged tags.
 *
 * @typedef {Record<string, SimpleTagValue | SimpleSequenceValue>}
 *   SimpleTagValues
 */

/**
 * Private diffusion b-value tag rule: either `{manufacturer, key}`
 * or `{uidPrefix, key}`.
 *
 * @typedef {object} PrivateBValueRule
 * @property {string} [manufacturer] The normalised manufacturer.
 * @property {string} [uidPrefix] The SOP instance UID prefix.
 * @property {string} key The private tag key.
 */

/**
 * Volume id candidate getter.
 *
 * @typedef {object} VolumeIdCandidate
 * @property {string} name The candidate name.
 * @property {Function} getter The volume id getter:
 *   `(elements) => SourcedNumberValue|undefined`, the returned volume id
 *   does not need a source (the candidate name is used).
 * @property {boolean} [preLoad] Flag to also use the candidate
 *   while loading.
 * @property {boolean} [relative] Flag to make the volume id values
 *   relative to the smallest one, for example to get times since
 *   the first acquisition instead of timestamps. Not applied while
 *   loading.
 */

/**
 * Pixel value of one volume.
 *
 * @typedef {object} VolumeValue
 * @property {SourcedNumberValue} volumeId The volume id: with name and unit
 *   if the image has volume ids, else just the volume index.
 * @property {NumberValue} pixValue The rescaled pixel value and its unit.
 */

// ESM module marker
export {};
