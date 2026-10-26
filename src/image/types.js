// Image related typedefs, in their own file to allow exporting them
// without functions.
// Keep this file type only: typedefs and JSDoc `@import` only, no
// runtime import or code, so that it stays a leaf of the module graph
// and cannot create circular dependencies.

/**
 * @import {ImageHistogram} from './imageHistogram.js';
 * @import {Label} from './label.js';
 */

/**
 * Histogram of the segment voxels of a label.
 *
 * @typedef {object} LabelHistogram
 * @property {Label} label The label.
 * @property {ImageHistogram} histogram The label histogram.
 */

/**
 * Histogram of the voxels of a segment for one volume.
 *
 * @typedef {object} SegmentHistogram
 * @property {number} volume The volume index.
 * @property {ImageHistogram} histogram The segment histogram.
 * @property {LabelHistogram[]} [labelHistograms] One histogram per label
 *   of the segment, if available.
 */

// ESM module marker
export {};
