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
 * @property {Function} getter The volume id getter.
 * @property {boolean} [preLoad] Flag to also use the candidate
 *   while loading.
 * @property {boolean} [timepoint] Flag for a candidate that separates
 *   timepoints.
 */

/**
 * Multivolume time series timepoints.
 *
 * @typedef {object} Timepoints
 * @property {string} tag The name of the tag that separates the
 *   timepoints.
 * @property {Array<{timepointIndex: number, tagValue: number}>} syncTable
 *   The index and tag value of each timepoint, ordered as the image
 *   volumes.
 */

// ESM module marker
export {};
