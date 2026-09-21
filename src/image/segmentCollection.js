import {ImageContour} from './imageContour.js';
import {logger} from '../utils/logger.js';

/**
 * @import {Geometry} from './geometry.js';
 * @import {Size} from './size.js';
 * @import {MaskSegment} from '../dicom/dicomSegment.js';
 * @import {MaskSegmentViewHelper} from './maskSegmentViewHelper.js';
 */

/**
 * Create ROI slice buffers.
 *
 * @param {Uint8Array} imageBuffer The mask image buffer.
 * @param {number[]} segmentNumbers The mask segment numbers.
 * @param {number} sliceSize The size of a slice.
 * @param {number} sliceOffset The slice offset.
 * @returns {Record<number, Uint8Array>} The ROI slice image buffers,
 * indexed by segment index (segment.number - 1).
 */
function createRoiSliceBuffers(
  imageBuffer,
  segmentNumbers,
  sliceSize,
  sliceOffset
) {
  // create binary mask buffers
  /** @type {Record<number, Uint8Array>} */
  const buffers = {};
  for (let o = 0; o < sliceSize; ++o) {
    const pixelValue = imageBuffer[sliceOffset + o];
    for (const segmentNumber of segmentNumbers) {
      if (pixelValue === segmentNumber) {
        const segmentIndex = segmentNumber - 1;
        if (buffers[segmentIndex] === undefined) {
          buffers[segmentIndex] = new Uint8Array(sliceSize);
        }
        buffers[segmentIndex][o] = 1;
      }
    }
  }
  return buffers;
}

/**
 * Create ROI buffers.
 *
 * @param {Uint8Array} imageBuffer The mask image buffer.
 * @param {Geometry} geometry The mask geometry.
 * @param {number[]} segmentNumbers The mask segment numbers.
 * @returns {Record<string, Record<number, Uint8Array>>} The ROI buffers,
 * indexed by segment index (segment.number - 1) and slice index.
 */
function createRoiBuffers(imageBuffer, geometry, segmentNumbers) {
  const size = geometry.getSize();

  // image buffer to multi frame
  const sliceSize = size.getDimSize(2);
  /** @type {Record<string, Record<number, Uint8Array>>} */
  const roiBuffers = {};
  for (let k = 0; k < size.get(2); ++k) {
    const sliceOffset = k * sliceSize;
    // create slice buffers
    const buffers = createRoiSliceBuffers(
      imageBuffer, segmentNumbers, sliceSize, sliceOffset);
    // store slice buffers
    const keys0 = Object.keys(buffers);
    for (const key0 of keys0) {
      if (roiBuffers[key0] === undefined) {
        roiBuffers[key0] = {};
      }
      // ordering by slice index (follows posPat)
      roiBuffers[key0][k] = buffers[key0];
    }
  }
  return roiBuffers;
}

/**
 * Collection of mask segments: stores per-segment, per-slice pixel data
 * and segment metadata. Builds the combined label map on demand.
 * TODO: check if mergeable with MaskSegmentHelper.
 */
export class SegmentCollection {

  /**
   * @type {Geometry}
   */
  #geometry;

  /**
   * Per-segment pixel data: only slices that carry actual frame data.
   * Type: Map<segNumber, Map<sliceIndex, Uint8Array>>.
   *
   * @type {Map<number, Map<number, Uint8Array>>}
   */
  #segments = new Map();

  /**
   * Flag set to true when two segments share at least one voxel.
   *
   * @type {boolean}
   */
  #hasOverlap = false;

  /**
   * Lazy cached combined label map.
   *
   * @type {Uint8Array|undefined}
   */
  #labelMap;

  /**
   * @param {Geometry} geometry The mask geometry, used to size the label map.
   */
  constructor(geometry) {
    this.#geometry = geometry;
  }

  /**
   * Get all the segments.
   *
   * @returns {Map<number, Map<number, Uint8Array>>} The segment buffers,
   * indexed by segment number and slice index.
   */
  getAll() {
    return this.#segments;
  }

  /**
   * Set the label map directly.
   * Used when the buffer already exists, for brush-painted masks.
   *
   * @param {Uint8Array} buffer The label map buffer.
   */
  setLabelMap(buffer) {
    this.#labelMap = buffer;
  }

  /**
   * Add pixel data for one DICOM frame to the appropriate segment and slice.
   * Allocates a Uint8Array(sliceSize) on first use for each
   * (segNumber, sliceIndex) pair; merges if the same pair appears again.
   *
   * @param {number} segNumber The segment number.
   * @param {Uint8Array} pixelBuffer The raw DICOM pixel buffer.
   * @param {number} frameOffset Offset of this frame within pixelBuffer.
   * @param {number} sliceIndex The slice index in the full label map geometry.
   * @param {number} sliceSize Number of pixels per slice (ncols * nrows).
   * @param {number} value The value to write for non-zero pixels.
   */
  addFrame(segNumber, pixelBuffer, frameOffset, sliceIndex, sliceSize, value) {
    if (!this.#segments.has(segNumber)) {
      this.#segments.set(segNumber, new Map());
    }
    const sliceMap = this.#segments.get(segNumber);
    if (!sliceMap.has(sliceIndex)) {
      sliceMap.set(sliceIndex, new Uint8Array(sliceSize));
    }
    const sliceBuf = sliceMap.get(sliceIndex);
    for (let l = 0; l < sliceSize; ++l) {
      if (pixelBuffer[frameOffset + l] !== 0) {
        sliceBuf[l] = value;
      }
    }
  }

  /**
   * Build and return the combined label map (lazy cached).
   * Iterates segments in insertion order so lower segment numbers win
   * at overlapping positions. Sets the hasOverlap flag if any voxel
   * already carries a different segment's value.
   *
   * @returns {Uint8Array} The full-volume label map.
   */
  getLabelMap() {
    if (typeof this.#labelMap !== 'undefined') {
      return this.#labelMap;
    }
    const sliceSize = this.#geometry.getSize().getDimSize(2);
    const totalSize = this.#geometry.getSize().getTotalSize();
    const labelMap = new Uint8Array(totalSize);

    for (const [, sliceMap] of this.#segments) {
      for (const [sliceIndex, sliceBuf] of sliceMap) {
        const offset = sliceIndex * sliceSize;
        for (let l = 0; l < sliceSize; ++l) {
          if (sliceBuf[l] !== 0) {
            if (labelMap[offset + l] !== 0 &&
              labelMap[offset + l] !== sliceBuf[l]) {
              this.#hasOverlap = true;
            }
            if (labelMap[offset + l] === 0) {
              labelMap[offset + l] = sliceBuf[l];
            }
          }
        }
      }
    }

    if (this.#hasOverlap) {
      logger.warn('SegmentCollection: detected overlapping segments');
    }
    this.#labelMap = labelMap;
    return labelMap;
  }

  /**
   * Split a flat label map offset into its slice index and the local
   * (within-slice) offset used to index a per-segment slice buffer.
   *
   * @param {number} offset The offset in the label map.
   * @returns {{sliceIndex: number, localOffset: number}} The split offset.
   */
  #splitOffset(offset) {
    const sliceSize = this.#geometry.getSize().getDimSize(2);
    const sliceIndex = Math.floor(offset / sliceSize);
    return {
      sliceIndex,
      localOffset: offset - (sliceIndex * sliceSize)
    };
  }

  /**
   * Update the per-segment, per-slice buffers after a direct edit to the
   * shared label map (for example brush painting on a mask loaded from
   * DICOM, where the label map and the per-segment buffers are otherwise
   * two separate structures). No-op when this collection has no
   * per-segment data (brush-created masks), since the label map is
   * already the source of truth in that case.
   *
   * @param {number} offset The offset in the label map that changed.
   * @param {number} previousValue The segment number previously at offset.
   * @param {number} newValue The segment number now at offset.
   */
  updateAtOffset(offset, previousValue, newValue) {
    if (this.#segments.size === 0 || previousValue === newValue) {
      return;
    }
    const sliceSize = this.#geometry.getSize().getDimSize(2);
    const {sliceIndex, localOffset} = this.#splitOffset(offset);

    if (previousValue !== 0) {
      const sliceBuf = this.#segments.get(previousValue)?.get(sliceIndex);
      if (typeof sliceBuf !== 'undefined') {
        sliceBuf[localOffset] = 0;
      }
    }
    if (newValue !== 0) {
      if (!this.#segments.has(newValue)) {
        this.#segments.set(newValue, new Map());
      }
      const sliceMap = this.#segments.get(newValue);
      if (!sliceMap.has(sliceIndex)) {
        sliceMap.set(sliceIndex, new Uint8Array(sliceSize));
      }
      sliceMap.get(sliceIndex)[localOffset] = newValue;
    }
  }

  /**
   * Re-index the per-segment, per-slice buffers after a slice insertion
   * (from Image#appendSlice/appendVolume) that shifted existing slice
   * content to make room for new slices. Unlike the shared label map
   * (which aliases the image buffer, so the raw byte-level shift already
   * covers it for free), `#segments` is keyed by slice index rather than
   * buffer offset, so an insertion before an existing slice leaves its
   * entries silently pointing at the wrong (pre-shift) slice index unless
   * they are explicitly re-keyed here.
   *
   * @param {number} sliceIndexThreshold Slices at or after this index
   *   (numbering as it was *before* the insertion) are shifted.
   * @param {number} numberOfSlices Number of slices inserted.
   */
  shiftSlices(sliceIndexThreshold, numberOfSlices) {
    if (this.#segments.size === 0 || numberOfSlices === 0) {
      return;
    }
    for (const sliceMap of this.#segments.values()) {
      const toShift = [...sliceMap.keys()]
        .filter(sliceIndex => sliceIndex >= sliceIndexThreshold);
      for (const sliceIndex of toShift) {
        const sliceBuf = sliceMap.get(sliceIndex);
        sliceMap.delete(sliceIndex);
        sliceMap.set(sliceIndex + numberOfSlices, sliceBuf);
      }
    }
    // the label map cache itself needs no update (it aliases the already
    // shifted image buffer), but the union contour cache is keyed by
    // segment content and would otherwise stay stale after a shift
    this.#unionContour = undefined;
    this.#unionContourKey = '';
  }

  /**
   * Get the value that a different, non-excluded segment holds at a given
   * label map offset. Used when deleting a segment to restore a voxel that
   * also belonged to another (overlapping) segment instead of losing that
   * other segment's presence there. Segments are checked in insertion
   * order, consistent with the first-wins policy used by {@link
   * SegmentCollection#getLabelMap}.
   *
   * @param {number} offset The offset in the label map.
   * @param {number} excludeSegmentNumber The segment number to ignore.
   * @returns {number} The other segment's stored value at that offset,
   *   or 0 if no other segment covers it.
   */
  getOtherValueAtOffset(offset, excludeSegmentNumber) {
    if (this.#segments.size === 0) {
      return 0;
    }
    const {sliceIndex, localOffset} = this.#splitOffset(offset);

    for (const [segNumber, sliceMap] of this.#segments) {
      if (segNumber === excludeSegmentNumber) {
        continue;
      }
      const sliceBuf = sliceMap.get(sliceIndex);
      if (typeof sliceBuf !== 'undefined' && sliceBuf[localOffset] !== 0) {
        return sliceBuf[localOffset];
      }
    }
    return 0;
  }

  /**
   * Create a deep copy of this collection: per-segment/per-slice buffers
   * and the overlap flag are copied, the lazily-built label map and union
   * contour caches are left unset (they rebuild on demand from the copied
   * per-segment data, same as a freshly constructed collection).
   *
   * @returns {SegmentCollection} The copy.
   */
  clone() {
    const copy = new SegmentCollection(this.#geometry);
    for (const [segNumber, sliceMap] of this.#segments) {
      const copiedSliceMap = new Map();
      for (const [sliceIndex, sliceBuf] of sliceMap) {
        copiedSliceMap.set(sliceIndex, sliceBuf.slice());
      }
      copy.#segments.set(segNumber, copiedSliceMap);
    }
    copy.#hasOverlap = this.#hasOverlap;
    return copy;
  }

  /**
   * Check whether any two segments share at least one voxel.
   *
   * @returns {boolean} True if overlap was detected.
   */
  getHasOverlap() {
    // ensure label map is built and hasOverlap flag is set
    this.getLabelMap();
    return this.#hasOverlap;
  }

  /**
   * Get the segment buffers. Using input image and segments since they
   * could have been modified (for example by brush).
   *
   * When per-segment data is available (MaskFactory path), builds ROI buffers
   * directly from #segments so that overlap pixels for every segment are
   * included. Falls back to label-map reconstruction for masks created via
   * setupSegmentCollection (brush path), where #segments is empty and the
   * label map is the only source of truth.
   *
   * @param {MaskSegment[]} segments The mask segments.
   * @returns {Record<string, Record<number, Uint8Array>>} The segment buffers,
   * indexed by segment index (segment.number - 1) and slice index.
   */
  getSegmentBuffers(segments) {
    if (this.#segments.size === 0) {
      // brush path: no per-segment data, reconstruct from label map;
      // when segments metadata is absent, discover numbers from the buffer
      let segNumbers = segments.map(segment => segment.number);
      if (segNumbers.length === 0 && typeof this.#labelMap !== 'undefined') {
        const found = new Set();
        for (let i = 0; i < this.#labelMap.length; ++i) {
          if (this.#labelMap[i] !== 0) {
            found.add(this.#labelMap[i]);
          }
        }
        segNumbers = Array.from(found);
      }
      return createRoiBuffers(this.#labelMap, this.#geometry, segNumbers);
    }
    // MaskFactory path: use per-segment per-slice buffers directly so that
    // pixels in overlap zones are present for every segment, not just the
    // first one stored in the label map
    /** @type {Record<string, Record<number, Uint8Array>>} */
    const roiBuffers = {};
    for (const segment of segments) {
      const segmentIndex = segment.number - 1;
      const sliceMap = this.#segments.get(segment.number);
      if (typeof sliceMap === 'undefined') {
        continue;
      }
      for (const [sliceIndex, sliceBuf] of sliceMap) {
        if (roiBuffers[segmentIndex] === undefined) {
          roiBuffers[segmentIndex] = {};
        }
        const binarySlice = new Uint8Array(sliceBuf.length);
        for (let l = 0; l < sliceBuf.length; ++l) {
          if (sliceBuf[l] !== 0) {
            binarySlice[l] = 1;
          }
        }
        roiBuffers[segmentIndex][sliceIndex] = binarySlice;
      }
    }
    return roiBuffers;
  }

  /**
   * Cached union contour (distance-to-border for visible segments union).
   *
   * @type {ImageContour|undefined}
   */
  #unionContour;

  /**
   * Visibility key for the cached union contour.
   * Sorted hidden segment numbers joined by comma.
   *
   * @type {string}
   */
  #unionContourKey = '';

  /**
   * Get the union ImageContour for the current visibility state,
   * building it if the set of hidden segments has changed.
   *
   * @param {MaskSegmentViewHelper|undefined} segmentViewHelper
   *   Hidden-segment tracker.
   * @param {Size} imageSize The image size.
   * @returns {ImageContour} The union ImageContour.
   */
  getOrBuildUnionContour(segmentViewHelper, imageSize) {
    const hidden = [];
    for (const [segNum] of this.#segments) {
      if (segmentViewHelper?.isHidden(segNum)) {
        hidden.push(segNum);
      }
    }
    const key = hidden.sort().join(',');

    if (typeof this.#unionContour !== 'undefined' &&
      key === this.#unionContourKey) {
      return this.#unionContour;
    }

    const sliceSize = imageSize.getDimSize(2);
    const unionBuffer = new Uint8Array(imageSize.getTotalSize());
    for (const [segNum, sliceMap] of this.#segments) {
      if (segmentViewHelper?.isHidden(segNum)) {
        continue;
      }
      for (const [sliceIndex, sliceBuf] of sliceMap) {
        const offset = sliceIndex * sliceSize;
        for (let l = 0; l < sliceSize; ++l) {
          if (sliceBuf[l] !== 0) {
            unionBuffer[offset + l] = 1;
          }
        }
      }
    }

    this.#unionContour = new ImageContour();
    this.#unionContour.initialize(unionBuffer, imageSize);
    this.#unionContourKey = key;
    return this.#unionContour;
  }

}
