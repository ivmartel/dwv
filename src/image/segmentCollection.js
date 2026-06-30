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
