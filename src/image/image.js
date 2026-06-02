import {Index} from '../math/index.js';
import {Point3D} from '../math/point.js';
import {logger} from '../utils/logger.js';
import {arrayContains} from '../utils/array.js';
import {getTypedArray} from '../dicom/dicomParser.js';
import {valueRange} from './iterator.js';
import {RescaleSlopeAndIntercept} from './rsi.js';
import {ImageFactory} from './imageFactory.js';
import {MaskFactory} from './maskFactory.js';
import {isMonochrome} from '../dicom/dicomImage.js';
import {LabelingFilter} from './labelingFilter.js';
import {LabelingThread} from './labelingThread.js';
import {ResamplingThread} from './resamplingThread.js';
import {ImageContour} from './imageContour.js';
import {BooleanResult} from '../utils/result.js';
import {equalWl} from './windowLevel.js';
import {SegmentCollection} from './segmentCollection.js';

/**
 * @import {Geometry} from './geometry.js';
 * @import {Matrix33} from '../math/matrix.js';
 * @import {NumberRange} from '../math/number.js';
 * @import {DataElement} from '../dicom/dataElement.js';
 * @import {RGB} from '../utils/colour.js';
 * @import {ColourMap} from './luts.js';
 * @import {Point} from '../math/point.js';
 * @import {Label} from './label.js';
 */

const ML_PER_MM = 0.001; // ml/mm^3


/**
 * List of image event names.
 *
 * @type {string[]}
 */
export const imageEventNames = [
  'imagecontentchange',
  'imagegeometrychange',
  'imageresamplingstart',
  'imageresamplingcomplete',
  'imageresampled',
  'labelingstart',
  'labelschanged'
];

/**
 * Get the slice index of an input slice into a volume geometry.
 *
 * @param {Geometry} volumeGeometry The volume geometry.
 * @param {Geometry} sliceGeometry The slice geometry.
 * @returns {Index} The index of the slice in the volume geomtry.
 */
function getSliceIndex(volumeGeometry, sliceGeometry) {
  // possible time
  const timeId = sliceGeometry.getInitialTime();
  // index values
  const values = [];
  // x, y
  values.push(0);
  values.push(0);
  // z
  values.push(volumeGeometry.getSliceIndex(sliceGeometry.getOrigin(), timeId));
  // time
  if (typeof timeId !== 'undefined') {
    values.push(timeId);
  }
  // return index
  return new Index(values);
}

/**
 * Create an Image from DICOM elements.
 *
 * @param {Record<string, DataElement>} elements The DICOM elements.
 * @returns {Image} The Image object.
 */
export function createImage(elements) {
  const factory = new ImageFactory();
  return factory.create(
    elements,
    elements['7FE00010'].value[0],
    1
  );
}

/**
 * Create a mask Image from DICOM elements.
 *
 * @param {Record<string, DataElement>} elements The DICOM elements.
 * @returns {Image} The mask Image object.
 */
export function createMaskImage(elements) {
  const factory = new MaskFactory();
  return factory.create(
    elements,
    /** @type {Uint8Array} */
    elements['7FE00010'].value[0]
  );
}

/**
 * Image class.
 * Usable once created, optional are:
 * - rescale slope and intercept (default 1:0),
 * - photometric interpretation (default MONOCHROME2),
 * - planar configuration (default RGBRGB...).
 *
 * @example
 * import {DicomParser, createImage} from '//esm.sh/dwv';
 * // XMLHttpRequest onload callback
 * const onload = function (event) {
 *   // parse the dicom buffer
 *   const dicomParser = new DicomParser();
 *   dicomParser.parse(event.target.response);
 *   // create the image object
 *   const image = createImage(dicomParser.getDicomElements());
 *   // result div
 *   const div = document.getElementById('dwv');
 *   // display the image size
 *   const size = image.getGeometry().getSize();
 *   div.appendChild(document.createTextNode(
 *     'Size: ' + size.toString() +
 *     ' (should be 256,256,1)'));
 *   // break line
 *   div.appendChild(document.createElement('br'));
 *   // display a pixel value
 *   div.appendChild(document.createTextNode(
 *     'Pixel @ [128,40,0]: ' +
 *     image.getRescaledValue(128,40,0) +
 *     ' (should be 101)'));
 * };
 * // DICOM file request
 * const request = new XMLHttpRequest();
 * const url = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm';
 * request.open('GET', url);
 * request.responseType = 'arraybuffer';
 * request.onload = onload;
 * request.send();
 */
export class Image extends EventTarget {

  /**
   * Data geometry.
   *
   * @type {Geometry}
   */
  #geometry;

  /**
   * List of compatible typed arrays.
   *
   * @typedef {(
   *   Uint8Array | Int8Array |
   *   Uint16Array | Int16Array |
   *   Uint32Array | Int32Array
   * )} TypedArray
   */

  /**
   * Data buffer.
   *
   * @type {TypedArray}
   */
  #buffer;

  /**
   * Image contour.
   *
   * @type {ImageContour}
   */
  #contour;

  /**
   * Whether the image has been resampled or not.
   *
   * @type {boolean}
   */
  #resampled;

  /**
   * The ID of the current resampling job.
   *
   * @type {string}
   */
  #resamplingJobId;

  /**
   * Data geometry, unmodified if image is resampled, null otherwise.
   *
   * @type {Geometry}
   */
  #rawGeometry;

  /**
   * Data buffer, unmodified if image is resampled, null otherwise.
   *
   * @type {TypedArray}
   */
  #rawBuffer;

  /**
   * Image UIDs.
   *
   * @type {string[]}
   */
  #imageUids;

  /**
   * Constant rescale slope and intercept (default).
   *
   * @type {RescaleSlopeAndIntercept}
   */
  #rsi = new RescaleSlopeAndIntercept(1, 0);

  /**
   * Varying rescale slope and intercept.
   *
   * @type {RescaleSlopeAndIntercept[]}
   */
  #rsis = null;

  /**
   * Flag to know if the RSIs are all identity (1,0).
   *
   * @type {boolean}
   */
  #isIdentityRSI = true;

  /**
   * Flag to know if the RSIs are all equals.
   *
   * @type {boolean}
   */
  #isConstantRSI = true;

  /**
   * Photometric interpretation (MONOCHROME, RGB...).
   *
   * @type {string}
   */
  #photometricInterpretation = 'MONOCHROME2';

  /**
   * Palette colour map.
   *
   * @type {ColourMap}
   */
  #paletteColourMap;

  /**
   * Planar configuration for RGB data (`0:RGBRGBRGBRGB...` or
   *   `1:RRR...GGG...BBB...`).
   *
   * @type {number}
   */
  #planarConfiguration = 0;

  /**
   * Number of components.
   *
   * @type {number}
   */
  #numberOfComponents;

  /**
   * Meta information.
   *
   * @type {Record<string, any>}
   */
  #meta = {};

  /**
   * Data range.
   *
   * @type {NumberRange}
   */
  #dataRange = null;

  /**
   * Rescaled data range.
   *
   * @type {NumberRange}
   */
  #rescaledDataRange = null;

  /**
   * Histogram.
   *
   * @type {Array}
   */
  #histogram = null;

  /**
   * The labeling thread.
   *
   * @type {LabelingThread}
   */
  #labelingThread;

  /**
   * The resampling thread.
   *
   * @type {ResamplingThread}
   */
  #resamplingThread;

  /**
   * Image complete flag, default to false.
   *
   * @type {boolean}
   */
  #complete = false;

  /**
   * Segment collection for mask (SEG) images.
   *
   * @type {SegmentCollection|undefined}
   */
  #segmentCollection;

  /**
   * @param {Geometry} geometry The geometry of the image.
   * @param {TypedArray} buffer The image data as a one dimensional buffer.
   * @param {string[]} [imageUids] An array of Uids indexed to slice number.
   */
  constructor(geometry, buffer, imageUids) {
    super();
    this.#geometry = geometry;
    this.#buffer = buffer;
    this.#resampled = false;
    this.#resamplingJobId = '0';
    this.#rawGeometry = null;
    this.#rawBuffer = null;
    this.#contour = new ImageContour();
    this.#imageUids = imageUids;
    this.#labelingThread = null;
    this.#resamplingThread = null;

    this.#numberOfComponents = this.#buffer.length / (
      this.#geometry.getSize().getTotalSize());
  }

  /**
   * Set the image complete flag.
   *
   * @param {boolean} flag True if the data is complete.
   */
  setComplete(flag) {
    this.#complete = flag;
    if (flag) {
      this.#geometry.updateSliceSpacing();
    }
  }

  /**
   * Get the image complete flag.
   *
   * @returns {boolean} True if the data is complete.
   */
  getComplete() {
    return this.#complete;
  }

  /**
   * Set up a segment collection from the existing image buffer.
   * Used for brush-painted masks (not created via MaskFactory).
   */
  setupSegmentCollection() {
    this.#segmentCollection = new SegmentCollection(this.#geometry);
    this.#segmentCollection.setLabelMap(
      /** @type {Uint8Array} */ (this.#buffer)
    );
  }

  /**
   * Set the segment collection.
   *
   * @param {SegmentCollection} collection The segment collection.
   */
  setSegmentCollection(collection) {
    this.#segmentCollection = collection;
  }

  /**
   * Get the segment collection.
   *
   * @returns {SegmentCollection|undefined} The segment collection.
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
   * Get the image UID at a given index.
   *
   * @param {Index} [index] The index at which to get the id.
   * @returns {string} The UID.
   */
  getImageUid(index) {
    let uid = this.#imageUids[0];
    if (this.#imageUids.length !== 1 && typeof index !== 'undefined') {
      uid = this.#imageUids[this.getSecondaryOffset(index)];
    }
    return uid;
  }

  /**
   * Get the image origin for a image UID.
   *
   * @param {string} uid The UID.
   * @returns {Point3D|undefined} The origin.
   */
  getOriginForImageUid(uid) {
    let origin;
    const uidIndex = this.#imageUids.indexOf(uid);
    if (uidIndex !== -1) {
      const origins = this.getGeometry().getOrigins();
      origin = origins[uidIndex];
    }
    return origin;
  }

  /**
   * Check if the image includes an UID.
   *
   * @param {string} uid The UID.
   * @returns {boolean} True if present.
   */
  includesImageUid(uid) {
    return this.#imageUids.includes(uid);
  }

  /**
   * Check if this image includes the input uids.
   *
   * @param {string[]} uids UIDs to test for presence.
   * @returns {boolean} True if all uids are in this image uids.
   */
  containsImageUids(uids) {
    return arrayContains(this.#imageUids, uids);
  }

  /**
   * Get the geometry of the image.
   *
   * @returns {Geometry} The geometry.
   */
  getGeometry() {
    return this.#geometry;
  }

  /**
   * Get the data buffer of the image.
   *
   * @todo Dangerous...
   * @returns {TypedArray} The data buffer of the image.
   */
  getBuffer() {
    return this.#buffer;
  }

  /**
   * Can the image values be quantified?
   *
   * @returns {boolean} True if only one component.
   */
  canQuantify() {
    return this.getNumberOfComponents() === 1;
  }

  /**
   * Can window and level be applied to the data?
   *
   * @returns {boolean} True if the data is monochrome.
   * @deprecated Since v0.33, please use isMonochrome instead.
   */
  canWindowLevel() {
    return this.isMonochrome();
  }

  /**
   * Is the data monochrome.
   *
   * @returns {boolean} True if the data is monochrome.
   */
  isMonochrome() {
    return isMonochrome(this.getPhotometricInterpretation());
  }

  /**
   * Can the data be scrolled?
   *
   * @param {Matrix33} viewOrientation The view orientation.
   * @returns {boolean} True if the data has a third dimension greater than one
   *   after applying the view orientation.
   */
  canScroll(viewOrientation) {
    const size = this.getGeometry().getSize();
    // also check the numberOfFiles in case we are in the middle of a load
    let nFiles = 1;
    if (typeof this.#meta.numberOfFiles !== 'undefined') {
      nFiles = this.#meta.numberOfFiles;
    }
    return size.canScroll(viewOrientation) || nFiles !== 1;
  }

  /**
   * Get the secondary offset max.
   *
   * @returns {number} The maximum offset.
   */
  #getSecondaryOffsetMax() {
    return this.#geometry.getSize().getTotalSize(2);
  }

  /**
   * Get the secondary offset: an offset that takes into account
   *   the slice and above dimension numbers.
   *
   * @param {Index} index The index.
   * @returns {number} The offset.
   */
  getSecondaryOffset(index) {
    return this.#geometry.getSize().indexToOffset(index, 2);
  }

  /**
   * Get the rescale slope and intercept.
   *
   * @param {Index} [index] The index (only needed for non constant rsi).
   * @returns {RescaleSlopeAndIntercept} The rescale slope and intercept.
   */
  getRescaleSlopeAndIntercept(index) {
    let res = this.#rsi;
    if (!this.isConstantRSI()) {
      if (typeof index === 'undefined') {
        throw new Error('Cannot get non constant RSI with empty slice index.');
      }
      const offset = this.getSecondaryOffset(index);
      if (typeof this.#rsis[offset] !== 'undefined') {
        res = this.#rsis[offset];
      } else {
        logger.warn(`undefined non constant rsi at ${offset}`);
      }
    }
    return res;
  }

  /**
   * Get the rsi at a specified (secondary) offset.
   *
   * @param {number} offset The desired (secondary) offset.
   * @returns {RescaleSlopeAndIntercept} The coresponding rsi.
   */
  #getRescaleSlopeAndInterceptAtOffset(offset) {
    return this.#rsis[offset];
  }

  /**
   * Set the rescale slope and intercept.
   *
   * @param {RescaleSlopeAndIntercept} inRsi The input rescale
   *   slope and intercept.
   * @param {number} [offset] The rsi offset (only needed for non constant rsi).
   */
  setRescaleSlopeAndIntercept(inRsi, offset) {
    // update identity flag
    this.#isIdentityRSI = this.#isIdentityRSI && inRsi.isID();
    // update constant flag
    if (!this.#isConstantRSI) {
      if (typeof offset === 'undefined') {
        throw new Error(
          'Cannot store non constant RSI with empty slice index.');
      }
      this.#rsis.splice(offset, 0, inRsi);
    } else if (!this.#rsi.equals(inRsi)) {
      if (typeof offset === 'undefined') {
        // no slice index, replace existing
        this.#rsi = inRsi;
      } else {
        // first non constant rsi
        this.#isConstantRSI = false;
        // switch to non constant mode
        this.#rsis = [];
        // initialise RSIs
        for (let i = 0, leni = this.#getSecondaryOffsetMax(); i < leni; ++i) {
          this.#rsis.push(this.#rsi);
        }
        // store
        this.#rsi = null;
        this.#rsis.splice(offset, 0, inRsi);
      }
    }
  }

  /**
   * Are all the RSIs identity (1,0).
   *
   * @returns {boolean} True if they are.
   */
  isIdentityRSI() {
    return this.#isIdentityRSI;
  }

  /**
   * Are all the RSIs equal.
   *
   * @returns {boolean} True if they are.
   */
  isConstantRSI() {
    return this.#isConstantRSI;
  }

  /**
   * Get the photometricInterpretation of the image.
   *
   * @returns {string} The photometricInterpretation of the image.
   */
  getPhotometricInterpretation() {
    return this.#photometricInterpretation;
  }

  /**
   * Set the photometricInterpretation of the image.
   *
   * @param {string} interp The photometricInterpretation of the image.
   */
  setPhotometricInterpretation(interp) {
    this.#photometricInterpretation = interp;
  }

  /**
   * Set the palette colour map.
   *
   * @param {ColourMap} map The colour map.
   */
  setPaletteColourMap(map) {
    this.#paletteColourMap = map;
    // fire imagecontentchange
    this.dispatchEvent(new CustomEvent('imagecontentchange'));
  }

  /**
   * Get the palette colour map.
   *
   * @returns {ColourMap} The colour map.
   */
  getPaletteColourMap() {
    return this.#paletteColourMap;
  }

  /**
   * Update the palette colour map.
   *
   * @param {number} index The index to change the colour of.
   * @param {RGB} colour The colour to use at index.
   */
  updatePaletteColourMap(index, colour) {
    this.#paletteColourMap.red[index] = colour.r;
    this.#paletteColourMap.green[index] = colour.g;
    this.#paletteColourMap.blue[index] = colour.b;
    // fire imagecontentchange
    this.dispatchEvent(new CustomEvent('imagecontentchange'));
  }

  /**
   * Get the planarConfiguration of the image.
   *
   * @returns {number} The planarConfiguration of the image.
   */
  getPlanarConfiguration() {
    return this.#planarConfiguration;
  }

  /**
   * Set the planarConfiguration of the image.
   *
   * @param {number} config The planarConfiguration of the image.
   */
  setPlanarConfiguration(config) {
    this.#planarConfiguration = config;
  }

  /**
   * Get the numberOfComponents of the image.
   *
   * @returns {number} The numberOfComponents of the image.
   */
  getNumberOfComponents() {
    return this.#numberOfComponents;
  }

  /**
   * Get the meta information of the image.
   *
   * @returns {Record<string, any>} The meta information of the image.
   */
  getMeta() {
    return this.#meta;
  }

  /**
   * Set the meta information of the image.
   *
   * @param {Record<string, any>} rhs The meta information of the image.
   */
  setMeta(rhs) {
    this.#meta = rhs;
  }

  /**
   * Get value at offset. Warning: No size check...
   *
   * @param {number} offset The desired offset.
   * @returns {number} The value at offset.
   */
  getValueAtOffset(offset) {
    return this.#buffer[offset];
  }

  /**
   * Get the offsets where the buffer equals the input value.
   * Loops through the whole volume, can get long for big data...
   *
   * @param {number|RGB} value The value to check.
   * @returns {number[]} The list of offsets.
   */
  getOffsets(value) {
    // value to array
    let bufferValue;
    if (typeof value === 'number') {
      if (this.#numberOfComponents !== 1) {
        throw new Error(
          'Number of components is not 1 for getting single value.');
      }
      bufferValue = [value];
    } else if (typeof value.r !== 'undefined' &&
      typeof value.g !== 'undefined' &&
      typeof value.b !== 'undefined') {
      if (this.#numberOfComponents !== 3) {
        throw new Error(
          'Number of components is not 3 for getting RGB value.');
      }
      bufferValue = [value.r, value.g, value.b];
    }

    // main loop
    const offsets = [];
    let equal;
    for (let i = 0; i < this.#buffer.length; i = i + this.#numberOfComponents) {
      equal = true;
      for (let j = 0; j < this.#numberOfComponents; ++j) {
        if (this.#buffer[i + j] !== bufferValue[j]) {
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
   * Check if the input values are in the buffer.
   * Could loop through the whole volume, can get long for big data...
   *
   * @param {Array} values The values to check.
   * @returns {boolean[]} A list of booleans for each input value,
   *   set to true if the value is present in the buffer.
   */
  hasValues(values) {
    // check input
    if (typeof values === 'undefined' ||
      values.length === 0) {
      return [];
    }
    // final array value
    const finalValues = [];
    for (let v1 = 0; v1 < values.length; ++v1) {
      if (this.#numberOfComponents === 1) {
        finalValues.push([values[v1]]);
      } else if (this.#numberOfComponents === 3) {
        finalValues.push([
          values[v1].r,
          values[v1].g,
          values[v1].b
        ]);
      }
    }
    // find callback
    let equalFunc;
    if (this.#numberOfComponents === 1) {
      equalFunc = function (a, b) {
        return a[0] === b[0];
      };
    } else if (this.#numberOfComponents === 3) {
      equalFunc = function (a, b) {
        return a[0] === b[0] &&
          a[1] === b[1] &&
          a[2] === b[2];
      };
    }
    const getEqualCallback = function (value) {
      return function (item) {
        return equalFunc(item, value);
      };
    };
    // main loop
    const res = new Array(values.length);
    res.fill(false);
    const valuesToFind = finalValues.slice();
    let equal;
    let indicesToRemove;
    for (let i = 0, leni = this.#buffer.length;
      i < leni; i = i + this.#numberOfComponents) {
      indicesToRemove = [];
      for (let v = 0; v < valuesToFind.length; ++v) {
        equal = true;
        // check value(s)
        for (let j = 0; j < this.#numberOfComponents; ++j) {
          if (this.#buffer[i + j] !== valuesToFind[v][j]) {
            equal = false;
            break;
          }
        }
        // if found, store answer and add to indices to remove
        if (equal) {
          const valIndex = finalValues.findIndex(
            getEqualCallback(valuesToFind[v]));
          res[valIndex] = true;
          indicesToRemove.push(v);
        }
      }
      // remove found values
      for (let r = 0; r < indicesToRemove.length; ++r) {
        valuesToFind.splice(indicesToRemove[r], 1);
      }
      // exit if no values to find
      if (valuesToFind.length === 0) {
        break;
      }
    }
    // return
    return res;
  }

  /**
   * Clone the image.
   *
   * @returns {Image} A clone of this image.
   */
  clone() {
    // clone the image buffer
    const clonedBuffer = this.#buffer.slice(0);
    // create the image copy
    const copy = new Image(
      this.getGeometry().clone(), clonedBuffer, this.#imageUids);
    // copy the RSI(s)
    if (this.isConstantRSI()) {
      copy.setRescaleSlopeAndIntercept(this.getRescaleSlopeAndIntercept());
    } else {
      for (let i = 0; i < this.#getSecondaryOffsetMax(); ++i) {
        copy.setRescaleSlopeAndIntercept(
          this.#getRescaleSlopeAndInterceptAtOffset(i), i);
      }
    }
    // copy extras
    copy.setPhotometricInterpretation(this.getPhotometricInterpretation());
    copy.setPlanarConfiguration(this.getPlanarConfiguration());
    copy.setPaletteColourMap(structuredClone(this.#paletteColourMap));
    copy.setMeta(structuredClone(this.getMeta()));
    // return
    return copy;
  }

  /**
   * Re-allocate buffer memory to an input size.
   *
   * @param {number} size The new size.
   */
  #realloc(size) {
    // save buffer
    let tmpBuffer = this.#buffer;
    // create new
    this.#buffer = getTypedArray(
      this.#buffer.BYTES_PER_ELEMENT * 8,
      this.#meta.PixelRepresentation,
      size);
    if (this.#buffer === null) {
      throw new Error('Cannot reallocate data for image.');
    }
    // put old in new
    this.#buffer.set(tmpBuffer);

    // force GC
    // eslint-disable-next-line no-useless-assignment
    tmpBuffer = null;
  }


  /**
   * Check if another image can be appended to this one.
   *
   * @param {Image} rhs The image to check.
   * @returns {BooleanResult} Result with success set to true if
   *   the image can be appended.
   */
  canAppend(rhs) {
    // check input
    if (rhs === null) {
      return {
        success: false,
        message: 'Cannot append null slice'
      };
    }

    // check geometry
    const geoCanAppend = this.#geometry.canAppend(rhs.getGeometry());
    if (!geoCanAppend.success) {
      return geoCanAppend;
    }

    if (this.#photometricInterpretation !==
      rhs.getPhotometricInterpretation()) {
      return {
        success: false,
        message:
          'Cannot append a slice with different photometric interpretation'
      };
    }
    // all meta should be equal
    for (const key in this.#meta) {
      if (
        key === 'windowPresets' ||
        key === 'numberOfFiles' ||
        key === 'custom'
      ) {
        continue;
      }

      if (this.#meta[key] !== rhs.getMeta()[key]) {
        const message = `Cannot append a slice with different ${ key
        }: ${this.#meta[key]} != ${rhs.getMeta()[key]}`;
        return {
          success: false,
          message
        };
      }
    }

    return new BooleanResult(true);
  }

  /**
   * Append a slice to the image.
   *
   * @param {Image} rhs The slice to append.
   * @fires Image#imagegeometrychange
   */
  appendSlice(rhs) {
    // check if possible
    const canAppend = this.canAppend(rhs);
    if (!canAppend.success) {
      throw new Error(canAppend.message);
    }

    // update ranges
    const rhsRange = rhs.getDataRange();
    const range = this.getDataRange();
    this.#dataRange = {
      min: Math.min(rhsRange.min, range.min),
      max: Math.max(rhsRange.max, range.max),
    };
    const rhsResRange = rhs.getRescaledDataRange();
    const resRange = this.getRescaledDataRange();
    this.#rescaledDataRange = {
      min: Math.min(rhsResRange.min, resRange.min),
      max: Math.max(rhsResRange.max, resRange.max),
    };

    let size = this.getGeometry().getSize();

    // possible time
    const timeId = rhs.getGeometry().getInitialTime();

    // append frame if needed
    let isNewFrame = false;
    if (typeof timeId !== 'undefined' &&
      !this.#geometry.hasSlicesAtTime(timeId)) {
      // update grometry
      this.appendFrame(timeId, rhs.getGeometry().getOrigin());
      // update size
      size = this.#geometry.getSize();
      // update flag
      isNewFrame = true;
    }

    // get slice index
    const index = getSliceIndex(this.#geometry, rhs.getGeometry());

    // calculate slice size
    const sliceSize = this.#numberOfComponents * size.getDimSize(2);

    // create full buffer if not done yet
    if (typeof this.#meta.numberOfFiles === 'undefined') {
      throw new Error('Missing number of files for buffer manipulation.');
    }
    const fullBufferSize = sliceSize * this.#meta.numberOfFiles;
    if (this.#buffer.length !== fullBufferSize) {
      this.#realloc(fullBufferSize);

      if (this.#contour.isInitialized()) {
        this.#contour.realloc(
          /** @type {Uint8Array} */ (this.#buffer),
          this.#geometry.getSize()
        );
      }
    }

    // slice index
    const sliceIndex = index.get(2);

    // slice index including possible 4D
    let fullSliceIndex = sliceIndex;
    if (typeof timeId !== 'undefined') {
      fullSliceIndex +=
        this.#geometry.getCurrentNumberOfSlicesBeforeTime(timeId);
    }
    // offset of the input slice
    const indexOffset = fullSliceIndex * sliceSize;
    const totalSlices = this.#geometry.getCurrentTotalNumberOfSlices();
    const maxOffset = totalSlices * sliceSize;
    // move content if needed
    if (indexOffset < maxOffset) {
      this.#buffer.set(
        this.#buffer.subarray(indexOffset, maxOffset),
        indexOffset + sliceSize
      );

      if (this.#contour.isInitialized()) {
        const contourSliceSize = size.getDimSize(2) * 3;
        const contourIndexOffset = fullSliceIndex * contourSliceSize;
        const contourMaxOffset = totalSlices * contourSliceSize;
        this.#contour.shiftSlice(
          contourIndexOffset, contourSliceSize, contourMaxOffset
        );
      }
    }
    // add new slice content
    this.#buffer.set(rhs.getBuffer(), indexOffset);

    // update geometry
    if (!isNewFrame) {
      this.#geometry.appendOrigin(
        rhs.getGeometry().getOrigin(), sliceIndex, timeId);
    }
    // update rsi
    // (rhs should just have one rsi)
    this.setRescaleSlopeAndIntercept(
      rhs.getRescaleSlopeAndIntercept(), fullSliceIndex);

    // current number of images
    const numberOfImages = this.#imageUids.length;

    // insert sop instance UIDs
    this.#imageUids.splice(fullSliceIndex, 0, rhs.getImageUid());

    // update window presets
    if (typeof this.#meta.windowPresets !== 'undefined') {
      const windowPresets = this.#meta.windowPresets;
      const rhsPresets = rhs.getMeta().windowPresets;
      const keys = Object.keys(rhsPresets);
      let pkey;
      for (let i = 0; i < keys.length; ++i) {
        pkey = keys[i];
        const rhsPreset = rhsPresets[pkey];
        const windowPreset = windowPresets[pkey];
        if (typeof windowPreset !== 'undefined') {
          // if not set or false, check perslice
          if (typeof windowPreset.perslice === 'undefined' ||
            windowPreset.perslice === false) {
            // if different preset.wl, mark it as perslice
            if (!equalWl(windowPreset.wl[0], rhsPreset.wl[0])) {
              windowPreset.perslice = true;
              // fill wl array with copy of wl[0]
              // (loop on number of images minus the existing one)
              for (let j = 0; j < numberOfImages - 1; ++j) {
                windowPreset.wl.push(windowPreset.wl[0]);
              }
            }
          }
          // store (first) rhs preset.wl if needed
          if (typeof windowPreset.perslice !== 'undefined' &&
            windowPreset.perslice === true) {
            windowPresets[pkey].wl.splice(
              fullSliceIndex, 0, rhsPreset.wl[0]);
          }
        } else {
          // if not defined (it should be), store all
          windowPresets[pkey] = rhsPresets[pkey];
        }
      }
    }
    /**
     * Image geometry change event.
     *
     * @event Image#imagegeometrychange
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     */
    this.dispatchEvent(new CustomEvent('imagegeometrychange'));
  }

  /**
   * Append a frame buffer to the image.
   *
   * @param {object} frameBuffer The frame buffer to append.
   * @param {number} frameIndex The frame index.
   */
  appendFrameBuffer(frameBuffer, frameIndex) {
    // create full buffer if not done yet
    const size = this.#geometry.getSize();
    const frameSize = this.#numberOfComponents * size.getDimSize(2);
    if (typeof this.#meta.numberOfFiles === 'undefined') {
      throw new Error('Missing number of files for frame buffer manipulation.');
    }
    const fullBufferSize = frameSize * this.#meta.numberOfFiles;
    if (this.#buffer.length !== fullBufferSize) {
      this.#realloc(fullBufferSize);

      if (this.#contour.isInitialized()) {
        this.#contour.realloc(
          /** @type {Uint8Array} */ (this.#buffer),
          this.#geometry.getSize()
        );
      }
    }
    // check index
    if (frameIndex >= this.#meta.numberOfFiles) {
      logger.warn(`Ignoring frame at index ${ frameIndex
      } (size: ${this.#meta.numberOfFiles})`);
      return;
    }
    // append
    this.#buffer.set(frameBuffer, frameSize * frameIndex);
    // update geometry
    this.appendFrame(frameIndex, new Point3D(0, 0, 0));
  }

  /**
   * Append a frame to the image.
   *
   * @param {number} time The frame time value.
   * @param {Point3D} origin The origin of the frame.
   */
  appendFrame(time, origin) {
    this.#geometry.appendFrame(origin, time);
    /**
     * Append frame event.
     *
     * @event Image#appendframe
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     */
    this.dispatchEvent(new CustomEvent('appendframe'));
    // memory will be updated at the first appendSlice or appendFrameBuffer
  }

  /**
   * Get the data range.
   *
   * @returns {NumberRange} The data range.
   */
  getDataRange() {
    if (!this.#dataRange) {
      this.#dataRange = this.calculateDataRange();
    }
    return this.#dataRange;
  }

  /**
   * Get the rescaled data range.
   *
   * @returns {NumberRange} The rescaled data range.
   */
  getRescaledDataRange() {
    if (!this.#rescaledDataRange) {
      this.#rescaledDataRange = this.calculateRescaledDataRange();
    }
    return this.#rescaledDataRange;
  }

  /**
   * Get the histogram.
   *
   * @returns {Array} The histogram.
   */
  getHistogram() {
    if (!this.#histogram) {
      const res = this.calculateHistogram();
      this.#dataRange = res.dataRange;
      this.#rescaledDataRange = res.rescaledDataRange;
      this.#histogram = res.histogram;
    }
    return this.#histogram;
  }

  // ****************************************
  // image data modifiers... carefull...
  // ****************************************

  /**
   * Set the inner buffer values at given offsets.
   *
   * @param {number[]} offsets List of offsets where to set the data.
   * @param {number|RGB} value The value to set at the given offsets.
   * @fires Image#imagecontentchange
   */
  setAtOffsets(offsets, value) {
    // value to array
    let bufferValue;
    if (typeof value === 'number') {
      if (this.#numberOfComponents !== 1) {
        throw new Error(
          'Number of components is not 1 for setting single value.');
      }
      bufferValue = [value];
    } else if (typeof value.r !== 'undefined' &&
      typeof value.g !== 'undefined' &&
      typeof value.b !== 'undefined') {
      if (this.#numberOfComponents !== 3) {
        throw new Error(
          'Number of components is not 3 for setting RGB value.');
      }
      bufferValue = [value.r, value.g, value.b];
    }

    let offset;
    for (let i = 0, leni = offsets.length; i < leni; ++i) {
      offset = offsets[i];
      for (let j = 0; j < this.#numberOfComponents; ++j) {
        this.#buffer[offset + j] = bufferValue[j];
      }
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
    const originalValuesLists = [];

    // update and store
    for (let j = 0; j < offsetsLists.length; ++j) {
      const offsets = offsetsLists[j];
      // first value
      let offset = offsets[0];
      let previousValue = this.#buffer[offset];
      // original value storage
      const originalValues = [];
      originalValues.push({
        index: 0,
        value: previousValue
      });
      for (let i = 0; i < offsets.length; ++i) {
        offset = offsets[i];
        const currentValue = this.#buffer[offset];
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
        this.#buffer[offset] = value;
        this.#contour.resetAroundOffset(offset);
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
        this.#buffer[offset] = ival.value;
        this.#contour.resetAroundOffset(offset);
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
   * Get the value of the image at a specific coordinate.
   *
   * @param {number} i The X index.
   * @param {number} j The Y index.
   * @param {number} k The Z index.
   * @param {number} [f] Optional frame number.
   * @returns {number} The value at the desired position.
   * Warning: No size check...
   */
  getValue(i, j, k, f) {
    const values = [i, j, k];
    if (typeof f !== 'undefined') {
      values.push(f);
    }
    const index = new Index(values);
    return this.getValueAtOffset(
      this.getGeometry().getSize().indexToOffset(index));
  }

  /**
   * Get the value of the image at a specific index.
   *
   * @param {Index} index The index.
   * @returns {number} The value at the desired position.
   * Warning: No size check...
   */
  getValueAtIndex(index) {
    return this.getValueAtOffset(
      this.getGeometry().getSize().indexToOffset(index));
  }

  /**
   * Get the rescaled value of the image at a specific position.
   *
   * @param {number} i The X index.
   * @param {number} j The Y index.
   * @param {number} k The Z index.
   * @param {number} [f] Optional frame number.
   * @returns {number} The rescaled value at the desired position.
   * Warning: No size check...
   */
  getRescaledValue(i, j, k, f) {
    let val = this.getValue(i, j, k, f);
    if (!this.isIdentityRSI()) {
      if (this.isConstantRSI()) {
        val = this.getRescaleSlopeAndIntercept().apply(val);
      } else {
        const values = [i, j, k];
        if (typeof f !== 'undefined') {
          values.push(f);
        }
        const index = new Index(values);
        val = this.getRescaleSlopeAndIntercept(index).apply(val);
      }
    }
    return val;
  }

  /**
   * Get the rescaled value of the image at a specific index.
   *
   * @param {Index} index The index.
   * @returns {number} The rescaled value at the desired position.
   * Warning: No size check...
   */
  getRescaledValueAtIndex(index) {
    return this.getRescaledValueAtOffset(
      this.getGeometry().getSize().indexToOffset(index)
    );
  }

  /**
   * Get the rescaled value of the image at a specific offset.
   *
   * @param {number} offset The desired offset.
   * @returns {number} The rescaled value at the desired offset.
   * Warning: No size check...
   */
  getRescaledValueAtOffset(offset) {
    let val = this.getValueAtOffset(offset);
    if (!this.isIdentityRSI()) {
      if (this.isConstantRSI()) {
        val = this.getRescaleSlopeAndIntercept().apply(val);
      } else {
        const index = this.getGeometry().getSize().offsetToIndex(offset);
        val = this.getRescaleSlopeAndIntercept(index).apply(val);
      }
    }
    return val;
  }

  /**
   * Calculate the data range of the image.
   * WARNING: for speed reasons, only calculated on the first frame...
   *
   * @returns {object} The range {min, max}.
   */
  calculateDataRange() {
    let min = this.getValueAtOffset(0);
    let max = min;
    let value;
    const size = this.getGeometry().getSize();
    let leni = size.getTotalSize();
    // max to 3D
    if (size.length() >= 3) {
      leni = size.getDimSize(3);
    }
    for (let i = 0; i < leni; ++i) {
      value = this.getValueAtOffset(i);
      if (value > max) {
        max = value;
      }
      if (value < min) {
        min = value;
      }
    }
    // return
    return {min, max};
  }

  /**
   * Calculate the rescaled data range of the image.
   * WARNING: for speed reasons, only calculated on the first frame...
   *
   * @returns {object} The range {min, max}.
   */
  calculateRescaledDataRange() {
    if (this.isIdentityRSI()) {
      return this.getDataRange();
    } else if (this.isConstantRSI()) {
      const range = this.getDataRange();
      const resmin = this.getRescaleSlopeAndIntercept().apply(range.min);
      const resmax = this.getRescaleSlopeAndIntercept().apply(range.max);
      return {
        min: ((resmin < resmax) ? resmin : resmax),
        max: ((resmin > resmax) ? resmin : resmax)
      };
    }

    let rmin = this.getRescaledValueAtOffset(0);
    let rmax = rmin;
    let rvalue;
    const size = this.getGeometry().getSize();
    let leni = size.getTotalSize();
    // max to 3D
    if (size.length() === 3) {
      leni = size.getDimSize(3);
    }
    for (let i = 0; i < leni; ++i) {
      rvalue = this.getRescaledValueAtOffset(i);
      if (rvalue > rmax) {
        rmax = rvalue;
      }
      if (rvalue < rmin) {
        rmin = rvalue;
      }
    }
    // return
    return {min: rmin, max: rmax};
  }

  /**
   * Calculate the histogram of the image.
   *
   * @returns {object} The histogram, data range and rescaled data range.
   */
  calculateHistogram() {
    const size = this.getGeometry().getSize();
    const histo = [];
    let min = this.getValueAtOffset(0);
    let max = min;
    let value;
    let rmin = this.getRescaledValueAtOffset(0);
    let rmax = rmin;
    let rvalue;
    for (let i = 0, leni = size.getTotalSize(); i < leni; ++i) {
      value = this.getValueAtOffset(i);
      if (value > max) {
        max = value;
      }
      if (value < min) {
        min = value;
      }
      rvalue = this.getRescaledValueAtOffset(i);
      if (rvalue > rmax) {
        rmax = rvalue;
      }
      if (rvalue < rmin) {
        rmin = rvalue;
      }
      histo[rvalue] = (histo[rvalue] || 0) + 1;
    }
    // set data range
    const dataRange = {min, max};
    const rescaledDataRange = {min: rmin, max: rmax};
    // generate data for plotting
    const histogram = [];
    for (let b = rmin; b <= rmax; ++b) {
      histogram.push([b, (histo[b] || 0)]);
    }
    // return
    return {
      dataRange,
      rescaledDataRange,
      histogram
    };
  }

  /**
   * Convolute the image with a given 2D kernel.
   *
   * Note: Uses raw buffer values.
   *
   * @param {number[]} weights The weights of the 2D kernel as a 3x3 matrix.
   * @returns {Image} The convoluted image.
   */
  convolute2D(weights) {
    if (weights.length !== 9) {
      throw new Error(
        `The convolution matrix does not have a length of 9; it has ${
          weights.length }`);
    }

    const newImage = this.clone();
    const newBuffer = newImage.getBuffer();

    const imgSize = this.getGeometry().getSize();
    const dimOffset = imgSize.getDimSize(2) * this.getNumberOfComponents();
    for (let k = 0; k < imgSize.get(2); ++k) {
      this.convoluteBuffer(weights, newBuffer, k * dimOffset);
    }

    return newImage;
  }

  /**
   * Convolute an image buffer with a given 2D kernel.
   *
   * Note: Uses raw buffer values.
   *
   * @param {number[]} weights The weights of the 2D kernel as a 3x3 matrix.
   * @param {TypedArray} buffer The buffer to convolute.
   * @param {number} startOffset The index to start at.
   */
  convoluteBuffer(
    weights, buffer, startOffset) {
    const imgSize = this.getGeometry().getSize();
    const ncols = imgSize.get(0);
    const nrows = imgSize.get(1);
    const ncomp = this.getNumberOfComponents();

    // number of component and planar configuration vars
    let factor = 1;
    let componentOffset = 1;
    if (ncomp === 3) {
      if (this.getPlanarConfiguration() === 0) {
        factor = 3;
      } else {
        componentOffset = imgSize.getDimSize(2);
      }
    }

    // default weight offset matrix
    const wOff = [];
    wOff[0] = (-ncols - 1) * factor;
    wOff[1] = (-ncols) * factor;
    wOff[2] = (-ncols + 1) * factor;
    wOff[3] = -factor;
    wOff[4] = 0;
    wOff[5] = factor;
    wOff[6] = (ncols - 1) * factor;
    wOff[7] = (ncols) * factor;
    wOff[8] = (ncols + 1) * factor;

    // border weight offset matrices
    // borders are extended (see http://en.wikipedia.org/wiki/Kernel_%28image_processing%29)

    /* eslint-disable @stylistic/js/max-statements-per-line */

    // i=0, j=0
    const wOff00 = [];
    wOff00[0] = wOff[4]; wOff00[1] = wOff[4]; wOff00[2] = wOff[5];
    wOff00[3] = wOff[4]; wOff00[4] = wOff[4]; wOff00[5] = wOff[5];
    wOff00[6] = wOff[7]; wOff00[7] = wOff[7]; wOff00[8] = wOff[8];
    // i=0, j=*
    const wOff0x = [];
    wOff0x[0] = wOff[1]; wOff0x[1] = wOff[1]; wOff0x[2] = wOff[2];
    wOff0x[3] = wOff[4]; wOff0x[4] = wOff[4]; wOff0x[5] = wOff[5];
    wOff0x[6] = wOff[7]; wOff0x[7] = wOff[7]; wOff0x[8] = wOff[8];
    // i=0, j=nrows
    const wOff0n = [];
    wOff0n[0] = wOff[1]; wOff0n[1] = wOff[1]; wOff0n[2] = wOff[2];
    wOff0n[3] = wOff[4]; wOff0n[4] = wOff[4]; wOff0n[5] = wOff[5];
    wOff0n[6] = wOff[4]; wOff0n[7] = wOff[4]; wOff0n[8] = wOff[5];

    // i=*, j=0
    const wOffx0 = [];
    wOffx0[0] = wOff[3]; wOffx0[1] = wOff[4]; wOffx0[2] = wOff[5];
    wOffx0[3] = wOff[3]; wOffx0[4] = wOff[4]; wOffx0[5] = wOff[5];
    wOffx0[6] = wOff[6]; wOffx0[7] = wOff[7]; wOffx0[8] = wOff[8];
    // i=*, j=* -> wOff
    // i=*, j=nrows
    const wOffxn = [];
    wOffxn[0] = wOff[0]; wOffxn[1] = wOff[1]; wOffxn[2] = wOff[2];
    wOffxn[3] = wOff[3]; wOffxn[4] = wOff[4]; wOffxn[5] = wOff[5];
    wOffxn[6] = wOff[3]; wOffxn[7] = wOff[4]; wOffxn[8] = wOff[5];

    // i=ncols, j=0
    const wOffn0 = [];
    wOffn0[0] = wOff[3]; wOffn0[1] = wOff[4]; wOffn0[2] = wOff[4];
    wOffn0[3] = wOff[3]; wOffn0[4] = wOff[4]; wOffn0[5] = wOff[4];
    wOffn0[6] = wOff[6]; wOffn0[7] = wOff[7]; wOffn0[8] = wOff[7];
    // i=ncols, j=*
    const wOffnx = [];
    wOffnx[0] = wOff[0]; wOffnx[1] = wOff[1]; wOffnx[2] = wOff[1];
    wOffnx[3] = wOff[3]; wOffnx[4] = wOff[4]; wOffnx[5] = wOff[4];
    wOffnx[6] = wOff[6]; wOffnx[7] = wOff[7]; wOffnx[8] = wOff[7];
    // i=ncols, j=nrows
    const wOffnn = [];
    wOffnn[0] = wOff[0]; wOffnn[1] = wOff[1]; wOffnn[2] = wOff[1];
    wOffnn[3] = wOff[3]; wOffnn[4] = wOff[4]; wOffnn[5] = wOff[4];
    wOffnn[6] = wOff[3]; wOffnn[7] = wOff[4]; wOffnn[8] = wOff[4];

    /* eslint-enable @stylistic/js/max-statements-per-line */

    // loop vars
    let pixelOffset = startOffset;
    let newValue;
    let wOffFinal;
    for (let c = 0; c < ncomp; ++c) {
      // component offset
      pixelOffset += c * componentOffset;
      for (let j = 0; j < nrows; ++j) {
        for (let i = 0; i < ncols; ++i) {
          wOffFinal = wOff;
          // special border cases
          if (i === 0 && j === 0) {
            wOffFinal = wOff00;
          } else if (i === 0 && j === (nrows - 1)) {
            wOffFinal = wOff0n;
          } else if (i === (ncols - 1) && j === 0) {
            wOffFinal = wOffn0;
          } else if (i === (ncols - 1) && j === (nrows - 1)) {
            wOffFinal = wOffnn;
          } else if (i === 0 && j !== (nrows - 1) && j !== 0) {
            wOffFinal = wOff0x;
          } else if (i === (ncols - 1) && j !== (nrows - 1) && j !== 0) {
            wOffFinal = wOffnx;
          } else if (i !== 0 && i !== (ncols - 1) && j === 0) {
            wOffFinal = wOffx0;
          } else if (i !== 0 && i !== (ncols - 1) && j === (nrows - 1)) {
            wOffFinal = wOffxn;
          }
          // calculate the weighed sum of the source image pixels that
          // fall under the convolution matrix
          newValue = 0;
          for (let wi = 0; wi < 9; ++wi) {
            newValue += this.getValueAtOffset(
              pixelOffset + wOffFinal[wi]) * weights[wi];
          }
          buffer[pixelOffset] = newValue;
          // increment pixel offset
          pixelOffset += factor;
        }
      }
    }
  }

  /**
   * Transform an image using a specific operator.
   * WARNING: no size check!
   *
   * @param {Function} operator The operator to use when transforming.
   * @returns {Image} The transformed image.
   * Note: Uses the raw buffer values.
   */
  transform(operator) {
    const newImage = this.clone();
    const newBuffer = newImage.getBuffer();
    for (let i = 0, leni = newBuffer.length; i < leni; ++i) {
      newBuffer[i] = operator(newImage.getValueAtOffset(i));
    }
    return newImage;
  }

  /**
   * Compose this image with another one and using a specific operator.
   * WARNING: no size check!
   *
   * @param {Image} rhs The image to compose with.
   * @param {Function} operator The operator to use when composing.
   * @returns {Image} The composed image.
   * Note: Uses the raw buffer values.
   */
  compose(rhs, operator) {
    const newImage = this.clone();
    const newBuffer = newImage.getBuffer();
    for (let i = 0, leni = newBuffer.length; i < leni; ++i) {
      // using the operator on the local buffer, i.e. the
      // latest (not original) data
      newBuffer[i] = Math.floor(
        operator(this.getValueAtOffset(i), rhs.getValueAtOffset(i))
      );
    }
    return newImage;
  }

  /**
   * Initialize the contour buffer.
   * Should be called on every segmentation image, or any image where
   * contour rendering needs to be supported.
   */
  initializeContour() {
    this.#contour.initialize(
      /** @type {Uint8Array} */ (this.#buffer),
      this.#geometry.getSize()
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
   * Post-process labels after labeling thread is done.
   *
   * @param {any} labels The labels to update.
   * @fires Image#labelschanged
   */
  #postProcessLabels(labels) {
    const spacing = this.#geometry.getSpacing();
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
      label.centroid = this.#geometry.indexToWorld(
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
   * Warning: not using workers, so might be slow for large images
   * with many segments.
   */
  #labelOverlapSegments() {
    const imageSize = this.#geometry.getSize();
    const totalSize = imageSize.getTotalSize();
    const sliceSize = imageSize.getDimSize(2);
    const ndims = imageSize.length();
    const unitVectors = Array(ndims).fill(0);
    for (let d = 0; d < ndims; d++) {
      unitVectors[d] = imageSize.getDimSize(d);
    }
    // full mask size
    // TODO could be optimized to be the real
    // size of the segments
    const sizes = Array(ndims).fill(0);
    for (let d = 0; d < ndims; d++) {
      sizes[d] = imageSize.get(d);
    }
    const spacingValues = this.#geometry.getSpacing().getValues();

    const filter = new LabelingFilter();
    const allLabels = [];
    for (const [segNumber, sliceMap] of this.#segmentCollection.getAll()) {
      const segBuffer = new Uint8Array(totalSize);
      for (const [sliceIndex, sliceBuf] of sliceMap) {
        const sliceOffset = sliceIndex * sliceSize;
        for (let l = 0; l < sliceBuf.length; ++l) {
          if (sliceBuf[l] !== 0) {
            segBuffer[sliceOffset + l] = segNumber;
          }
        }
      }
      const result = filter.run({
        imageBuffer: segBuffer,
        unitVectors,
        sizes,
        spacing: spacingValues,
        totalSize
      });
      allLabels.push(...result.labels);
    }

    this.#postProcessLabels(allLabels);
  }

  /**
   * Recalculate labels.
   *
   * @fires Image#labelingstart
   * @fires Image#labelschanged
   */
  recalculateLabels() {
    this.dispatchEvent(new CustomEvent('labelingstart'));

    const collection = this.#segmentCollection;
    if (collection?.getHasOverlap() && collection.getAll().size > 0) {
      this.#labelOverlapSegments();
    } else {
      // create thread if not done yet
      if (this.#labelingThread === null) {
        this.#labelingThread = new LabelingThread();

        this.#labelingThread.ondone = (event) => {
          this.#postProcessLabels(event.data.labels);
          //TODO: This is temporary until a proper method of displaying
          // diameters is implmented.
          // ------
          if (event.data.buffer) {
            this.#buffer = event.data.buffer;
            this.dispatchEvent(new CustomEvent('imagecontentchange'));
          }
          // ------
        };
      }
      // run labeling thread
      this.#labelingThread.run(this.#buffer, this.#geometry);
    }
  }

  /**
   * Return if this image has been resampled.
   *
   * @returns {boolean} If the image has been resampled.
   */
  isResampled() {
    return this.#resampled;
  }

  /**
   * Resample this image to a new orientation.
   *
   * @param {Matrix33} orientation The orientation to resample to.
   * @param {boolean|undefined} interpolated Default true, if true use bilinear
   *  sampling, otherwise use nearest neighbor.
   * @param {Point|undefined} centerOfRotation World space center of rotation.
   */
  resample(
    orientation,
    interpolated = undefined,
    centerOfRotation = undefined
  ) {
    if (this.#resamplingThread === null) {
      this.#resamplingThread = new ResamplingThread();

      this.#resamplingThread.ondoneframe = (event) => {
        const data = event.data;

        // In case multiple resampled jobs are running at the same time,
        // we only care about the most recent one.
        if (this.#resamplingJobId === data.jobId) {
          this.#buffer.set(data.targetImageBuffer, data.startOffset);
          this.dispatchEvent(new CustomEvent('imageresampled',
            {detail: {frame: data.frame}}));
        }
      };

      this.#resamplingThread.ondone = (_) => {
        this.dispatchEvent(new CustomEvent('imageresamplingcomplete'));
      };
    }

    // If we were already resampled then resample again from the
    // original to not degrade the data

    const source = this.#resampled && this.#rawBuffer && this.#rawGeometry
      ? {buffer: this.#rawBuffer, geometry: this.#rawGeometry}
      : {buffer: this.#buffer, geometry: this.#geometry};

    this.dispatchEvent(new CustomEvent('imageresamplingstart'));

    const resampled = this.#resamplingThread.run(
      source.buffer,
      source.geometry,
      this.#meta.PixelRepresentation,
      orientation,
      typeof interpolated === 'undefined' || interpolated,
      centerOfRotation
    );

    // if the image is already resampled we don't want to override the raw
    if (!this.#resampled) {
      this.#resampled = true;
      this.#rawBuffer = this.#buffer;
      this.#rawGeometry = this.#geometry;
    }

    this.#buffer = resampled.buffer;
    this.#geometry = resampled.geometry;
    this.#resamplingJobId = resampled.jobId;

    this.dispatchEvent(new CustomEvent('imagecontentchange'));
    this.dispatchEvent(new CustomEvent('imagegeometrychange'));
  }

  /**
   * Revert a resampled image to its original state.
   */
  revert() {
    if (!this.#resampled) {
      return;
    }

    this.dispatchEvent(new CustomEvent('imageresamplingstart'));

    this.#resampled = false;
    this.#buffer = this.#rawBuffer;
    this.#geometry = this.#rawGeometry;
    this.#rawBuffer = null;
    this.#rawGeometry = null;

    this.dispatchEvent(new CustomEvent('imagecontentchange'));
    this.dispatchEvent(new CustomEvent('imagegeometrychange'));
    this.dispatchEvent(new CustomEvent('imageresampled'));
  }

} // class Image
