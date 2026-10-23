// Volume related typedefs, in their own file to allow exporting them
// without the volume functions.

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
 *   `(elements) => VolumeId|undefined`, the returned volume id
 *   does not need a name (the candidate name is used).
 * @property {boolean} [preLoad] Flag to also use the candidate
 *   while loading.
 * @property {boolean} [relative] Flag to make the volume id values
 *   relative to the smallest one, for example to get times since
 *   the first acquisition instead of timestamps. Not applied while
 *   loading.
 */

/**
 * Volume id: the value that separates the volumes of a data,
 * for example `{name: 'EchoTime', value: 4.6, tagKey: '00180081',
 * unit: 'unit.ms'}`.
 *
 * @typedef {object} VolumeId
 * @property {number} value The volume id value.
 * @property {string} [name] The name of the volume id candidate
 *   that produced it.
 * @property {string} [tagKey] The key of the DICOM tag
 *   the value is read from.
 * @property {string} [unit] The value unit as an i18n key.
 */

// ESM module marker
export {};
