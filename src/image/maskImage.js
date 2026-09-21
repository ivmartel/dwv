import {Index} from '../math/index.js';
import {Size} from './size.js';
import {valueRange} from './iterator.js';
import {LabelingThread} from './labelingThread.js';
import {SegmentCollection} from './segmentCollection.js';
import {ImageContour} from './imageContour.js';
import {Image} from './image.js';

/**
 * @import {Geometry} from './geometry.js';
 * @import {RGB} from '../utils/colour.js';
 * @import {Label} from './label.js';
 */

const ML_PER_MM = 0.001; // ml/mm^3

/**
 * Mask (segmentation) image class.
 * Extends {@link Image} with a {@link SegmentCollection} and the
 * segment-aware behavior built on top of it: per-segment/per-slice
 * bookkeeping, the brush tool's offset-editing methods, and per-segment
 * labeling statistics (volume/centroid/diameter).
 */
export class MaskImage extends Image {

  /**
   * @type {SegmentCollection}
   */
  #segmentCollection;

  /**
   * Mask contour, used for outline-style rendering.
   *
   * @type {ImageContour}
   */
  #contour = new ImageContour();

  /**
   * The labeling thread.
   *
   * @type {LabelingThread}
   */
  #labelingThread = null;

  /**
   * @param {Geometry} geometry The geometry of the image.
   * @param {Uint8Array} buffer The mask data as a one dimensional buffer:
   *   one byte per voxel, 0 for background, the segment number otherwise.
   * @param {string[]} [imageUids] An array of Uids indexed to slice number.
   * @param {SegmentCollection} [segmentCollection] The segment collection,
   *   for a mask already parsed from DICOM (its own label map already
   *   aliases `buffer`). When omitted (brush-created masks), a fresh
   *   collection is created and its label map is aliased to `buffer`.
   */
  constructor(geometry, buffer, imageUids, segmentCollection) {
    super(geometry, buffer, imageUids);
    if (typeof segmentCollection === 'undefined') {
      segmentCollection = new SegmentCollection(geometry);
      segmentCollection.setLabelMap(buffer);
    }
    this.#segmentCollection = segmentCollection;

    // keep the segment collection's label map and the contour buffer
    // (both alias the buffer directly) pointing at it after a reallocation
    this.addEventListener('imagebufferrealloc', () => {
      this.#segmentCollection?.setLabelMap(
        /** @type {Uint8Array} */ (this.getBuffer()));
      if (this.#contour.isInitialized()) {
        this.#contour.realloc(
          /** @type {Uint8Array} */ (this.getBuffer()),
          this.getGeometry().getSize()
        );
      }
    });

    // replicate a buffer slice shift (from appendSlice/appendVolume) onto
    // the segment collection's per-slice indexing and the contour buffer
    this.addEventListener('imagesliceshift', (event) => {
      const {indexOffset, insertSize, maxOffset} =
        /** @type {CustomEvent} */ (event).detail;

      // #segments is keyed by slice index (not buffer offset), so it
      // needs re-indexing explicitly -- it isn't just an alias of the
      // (already correctly shifted) image buffer like the label map is
      const dimSliceSize = this.getGeometry().getSize().getDimSize(2);
      this.#segmentCollection?.shiftSlices(
        indexOffset / dimSliceSize, insertSize / dimSliceSize
      );

      if (this.#contour.isInitialized()) {
        // the contour buffer always tracks 3 values per voxel, while the
        // image buffer tracks getNumberOfComponents() (1 for a mask)
        const factor = 3 / this.getNumberOfComponents();
        this.#contour.shiftSlice(
          indexOffset * factor, insertSize * factor, maxOffset * factor
        );
      }
    });
  }

  /**
   * Initialize the contour buffer.
   * Should be called on every segmentation image, or any image where
   * contour rendering needs to be supported.
   */
  initializeContour() {
    this.#contour.initialize(
      /** @type {Uint8Array} */ (this.getBuffer()),
      this.getGeometry().getSize()
    );
  }

  /**
   * Get the image contour. Should only be available
   * for segmentation images, but can be initialized
   * for any Uint8Array image.
   *
   * @returns {ImageContour} The image contour.
   */
  getContour() {
    return this.#contour;
  }

  /**
   * Get the segment collection.
   *
   * @returns {SegmentCollection} The segment collection.
   */
  getSegmentCollection() {
    return this.#segmentCollection;
  }

  /**
   * Check whether the mask has overlapping segments.
   *
   * @returns {boolean} True if any two segments share at least one voxel.
   */
  getHasOverlap() {
    return this.#segmentCollection?.getHasOverlap() ?? false;
  }

  /**
   * Get the UID of the series referenced by the mask, if any.
   *
   * @returns {string|undefined} The UID.
   */
  getMaskReferencedSeriesUID() {
    return this.getMeta().custom.referencedSeriesUID;
  }

  /**
   * Check is the image is a mask.
   *
   * @returns {boolean} True.
   * @deprecated Since v0.37, please use `instanceof MaskImage` instead.
   */
  isMask() {
    return true;
  }

  /**
   * Get the offsets where the buffer equals the input value.
   * Loops through the whole volume, can get long for big data...
   *
   * @param {number|RGB} value The value to check.
   * @returns {number[]} The list of offsets.
   */
  getOffsets(value) {
    const buffer = this.getBuffer();
    const numberOfComponents = this.getNumberOfComponents();
    // value to array
    let bufferValue;
    if (typeof value === 'number') {
      if (numberOfComponents !== 1) {
        throw new Error(
          'Number of components is not 1 for getting single value.');
      }
      bufferValue = [value];
    } else if (typeof value.r !== 'undefined' &&
      typeof value.g !== 'undefined' &&
      typeof value.b !== 'undefined') {
      if (numberOfComponents !== 3) {
        throw new Error(
          'Number of components is not 3 for getting RGB value.');
      }
      bufferValue = [value.r, value.g, value.b];
    }

    // main loop
    const offsets = [];
    let equal;
    for (let i = 0; i < buffer.length; i = i + numberOfComponents) {
      equal = true;
      for (let j = 0; j < numberOfComponents; ++j) {
        if (buffer[i + j] !== bufferValue[j]) {
          equal = false;
          break;
        }
      }
      if (equal) {
        offsets.push(i);
      }
    }
    return offsets;
  }

  /**
   * Set the inner buffer values at given offsets.
   *
   * @param {number[]} offsets List of offsets where to set the data.
   * @param {number|RGB} value The value to set at the given offsets.
   * @fires Image#imagecontentchange
   */
  setAtOffsets(offsets, value) {
    const buffer = this.getBuffer();
    const numberOfComponents = this.getNumberOfComponents();
    // value to array
    let bufferValue;
    if (typeof value === 'number') {
      if (numberOfComponents !== 1) {
        throw new Error(
          'Number of components is not 1 for setting single value.');
      }
      bufferValue = [value];
    } else if (typeof value.r !== 'undefined' &&
      typeof value.g !== 'undefined' &&
      typeof value.b !== 'undefined') {
      if (numberOfComponents !== 3) {
        throw new Error(
          'Number of components is not 3 for setting RGB value.');
      }
      bufferValue = [value.r, value.g, value.b];
    }

    let offset;
    for (let i = 0, leni = offsets.length; i < leni; ++i) {
      offset = offsets[i];
      if (numberOfComponents === 1) {
        const previousValue = buffer[offset];
        buffer[offset] = bufferValue[0];
        this.#segmentCollection?.updateAtOffset(
          offset, previousValue, bufferValue[0]);
      } else {
        for (let j = 0; j < numberOfComponents; ++j) {
          buffer[offset + j] = bufferValue[j];
        }
      }
    }
    // fire imagecontentchange
    this.dispatchEvent(new CustomEvent('imagecontentchange'));
  }

  /**
   * Set the inner buffer values at given offsets, each to its own value.
   * Used when a single uniform value cannot be used across all offsets,
   * for example restoring the segment still present at a voxel that used
   * to be hidden by an overlapping, now deleted, segment.
   *
   * @param {number[]} offsets List of offsets where to set the data.
   * @param {number[]} values Per-offset values, same length as offsets.
   * @fires Image#imagecontentchange
   */
  setAtOffsetsWithValues(offsets, values) {
    const buffer = this.getBuffer();
    for (let i = 0; i < offsets.length; ++i) {
      const offset = offsets[i];
      const value = values[i];
      const previousValue = buffer[offset];
      buffer[offset] = value;
      this.getContour().resetAroundOffset(offset);
      this.#segmentCollection?.updateAtOffset(offset, previousValue, value);
    }
    // fire imagecontentchange
    this.dispatchEvent(new CustomEvent('imagecontentchange'));
  }

  /**
   * Set the inner buffer values at given offsets.
   *
   * @param {number[][]} offsetsLists List of offset lists where
   *   to set the data.
   * @param {number} value The value to set at the given offsets.
   * @returns {Array} A list of objects representing the original values before
   *  replacing them.
   * @fires Image#imagecontentchange
   */
  setAtOffsetsAndGetOriginals(offsetsLists, value) {
    const buffer = this.getBuffer();
    const originalValuesLists = [];

    // update and store
    for (let j = 0; j < offsetsLists.length; ++j) {
      const offsets = offsetsLists[j];
      // first value
      let offset = offsets[0];
      let previousValue = buffer[offset];
      // original value storage
      const originalValues = [];
      originalValues.push({
        index: 0,
        value: previousValue
      });
      for (let i = 0; i < offsets.length; ++i) {
        offset = offsets[i];
        const currentValue = buffer[offset];
        // check if new value
        if (previousValue !== currentValue) {
          // store new value
          originalValues.push({
            index: i,
            value: currentValue
          });
          previousValue = currentValue;
        }
        // write update value
        buffer[offset] = value;
        this.getContour().resetAroundOffset(offset);
        this.#segmentCollection?.updateAtOffset(offset, currentValue, value);
      }
      originalValuesLists.push(originalValues);
    }
    // fire imagecontentchange
    this.dispatchEvent(new CustomEvent('imagecontentchange'));
    return originalValuesLists;
  }

  /**
   * Set the inner buffer values at given offsets.
   *
   * @param {number[][]} offsetsLists List of offset lists
   *   where to set the data.
   * @param {number|Array} value The value to set at the given offsets.
   * @fires Image#imagecontentchange
   */
  setAtOffsetsWithIterator(offsetsLists, value) {
    const buffer = this.getBuffer();
    const isValueArray = Array.isArray(value);

    for (let j = 0; j < offsetsLists.length; ++j) {
      const offsets = offsetsLists[j];
      let iterator;
      if (isValueArray) {
        // input value is a list of iterators
        // created by setAtOffsetsAndGetOriginals
        iterator = valueRange(
          value[j], offsets.length);
      } else {
        // input value is a simple color
        iterator = valueRange(
          [{index: 0, value}], offsets.length);
      }

      // set values
      let ival = iterator.next();
      while (!ival.done) {
        const offset = offsets[ival.index];
        const previousValue = buffer[offset];
        buffer[offset] = ival.value;
        this.getContour().resetAroundOffset(offset);
        this.#segmentCollection?.updateAtOffset(
          offset, previousValue, ival.value);
        ival = iterator.next();
      }
    }
    /**
     * Image content change event.
     *
     * @event Image#imagecontentchange
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     */
    this.dispatchEvent(new CustomEvent('imagecontentchange'));
  }

  /**
   * Post-process labels after labeling thread is done.
   *
   * @param {any} labels The labels to update.
   * @fires Image#labelschanged
   */
  #postProcessLabels(labels) {
    const geometry = this.getGeometry();
    const spacing = geometry.getSpacing();
    const lengthUnit = this.getMeta().lengthUnit;
    let pixelVolume = 1;
    let volumeUnit = 'unit.pixel';
    if (lengthUnit === 'unit.mm') {
      pixelVolume =
        spacing.get(0) *
        spacing.get(1) *
        spacing.get(2) *
        ML_PER_MM;
      volumeUnit = 'unit.ml';
    }

    for (const label of labels) {
      // add centroid point
      label.centroid = geometry.indexToWorld(
        new Index(label.centroidIndex));
      // add volume
      label.volume = {
        value: label.count * pixelVolume,
        unit: volumeUnit
      };
      // add unit to values
      let majorDiameter;
      let minorDiameter;
      if (typeof label.diameters !== 'undefined') {
        if (typeof label.diameters.major !== 'undefined') {
          majorDiameter = label.diameters.major.diameter;
        }
        if (typeof label.diameters.minor !== 'undefined') {
          minorDiameter = label.diameters.minor.diameter;
        }
      }
      label.diameters = {
        major: {
          diameter: {
            value: majorDiameter,
            unit: lengthUnit
          }
        },
        minor: {
          diameter: {
            value: minorDiameter,
            unit: lengthUnit
          }
        }
      };
      label.height = {
        value: label.height,
        unit: lengthUnit
      };
    }
    // sort by volume then by id
    /** @type {Label[]} */
    const labelsSorted =
      labels.sort((v1, v2) => {
        return v2.volume.value - v1.volume.value;
      }).sort((v1, v2) => {
        return v1.id - v2.id;
      });

    this.dispatchEvent(new CustomEvent('labelschanged', {
      detail: {
        labels: /** @type {Label[]} */ (labelsSorted)
      }
    }));
  }

  /**
   * Label segments with overlap.
   * The merged labelmap uses first-wins at overlap positions, so voxels
   * shared by two segments are attributed only to the first segment.
   * Run the filter once per segment on a clean per-segment buffer so
   * every segment gets its correct voxels counted.
   */
  #labelOverlapSegments() {
    const geometry = this.getGeometry();
    const imageSize = geometry.getSize();
    const nx = imageSize.get(0);
    const ny = imageSize.get(1);
    const segments = [];
    for (const [segNumber, sliceMap] of this.#segmentCollection.getAll()) {
      const sliceIndices = [...sliceMap.keys()];
      const minSlice = Math.min(...sliceIndices);
      const size = new Size([nx, ny, Math.max(...sliceIndices) - minSlice + 1]);
      const slices = [];
      for (const [sliceIndex, sliceBuf] of sliceMap) {
        slices.push({
          sliceIndex: sliceIndex - minSlice,
          data: new Uint8Array(sliceBuf)
        });
      }
      segments.push({segNumber, size, slices, minSlice});
    }

    this.#labelingThread.runOverlap(segments, geometry);
  }

  /**
   * Recalculate labels.
   *
   * @fires Image#labelingstart
   * @fires Image#labelschanged
   */
  recalculateLabels() {
    this.dispatchEvent(new CustomEvent('labelingstart'));

    // create thread if not done yet
    if (this.#labelingThread === null) {
      this.#labelingThread = new LabelingThread();

      this.#labelingThread.ondone = (event) => {
        this.#postProcessLabels(event.data.labels);
        //TODO: This is temporary until a proper method of displaying
        // diameters is implmented.
        // ------
        if (event.data.buffer) {
          this.replaceBuffer(event.data.buffer);
        }
        // ------
      };
    }

    const collection = this.#segmentCollection;
    if (collection?.getHasOverlap() && collection.getAll().size > 0) {
      this.#labelOverlapSegments();
    } else {
      this.#labelingThread.run(this.getBuffer(), this.getGeometry());
    }
  }

  /**
   * Clone the mask image.
   *
   * @returns {MaskImage} A clone of this mask image.
   */
  clone() {
    const copy = /** @type {MaskImage} */ (super.clone());
    // deep-copy the per-segment/per-slice data, then re-point its label
    // map to the copy's own (already pixel-cloned) buffer -- the fresh
    // SegmentCollection that MaskImage's constructor gave `copy` aliased
    // it correctly already, but only for an empty collection
    const clonedCollection = this.#segmentCollection.clone();
    clonedCollection.setLabelMap(
      /** @type {Uint8Array} */ (copy.getBuffer()));
    copy.#segmentCollection = clonedCollection;
    return copy;
  }

} // MaskImage class
