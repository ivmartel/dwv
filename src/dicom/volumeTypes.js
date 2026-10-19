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
 * @property {boolean} [timeBased] Flag for a time based candidate.
 */

/**
 * Timepoints of a multivolume time series.
 *
 * @typedef {object} Timepoints
 * @property {string} tag The timepoint tag name.
 * @property {Array<{timepointIndex: number, tagValue: number}>} syncTable
 *   The timepoint index and tag value of each volume.
 */

// ESM module marker
export {};
