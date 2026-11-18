// Image related typedefs, in their own file to allow exporting them
// without functions.
// Keep this file type only: typedefs and JSDoc `@import` only, no
// runtime import or code, so that it stays a leaf of the module graph
// and cannot create circular dependencies.

/**
 * @import {ImageHistogram} from './imageHistogram.js';
 * @import {Label} from './label.js';
 * @import {SourcedNumberValue} from '../math/types.js';
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

/**
 * Volume id: the id of a volume (fourth dimension index) and an
 * optional associated value, for example
 * `{id: {value: 2, source: 'TemporalPositionIdentifier',
 * tagKey: '00200100'}, value: {value: 10, unit: 'unit.s',
 * source: 'AcquisitionTime', tagKey: '00080032'}}`.
 * Only the id is reliable: it groups, orders and locates the volumes
 * (it is the fourth dimension world coordinate). The associated value
 * is informative, for example the acquisition time of the volumes of
 * a temporal position identifier. Ids that are values (for example
 * an echo time) usually do not have one. Without source, the id is
 * a frame index (for example `{id: {value: 2}}`).
 *
 * @typedef {object} VolumeId
 * @property {SourcedNumberValue} id The volume id.
 * @property {SourcedNumberValue} [value] The associated value.
 */

// ESM module marker
export {};
