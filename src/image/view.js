import {Index} from '../math/index.js';
import {ModalityLut} from './modalityLut.js';
import {WindowLut} from './windowLut.js';
import {luts} from './luts.js';
import {VoiLut} from './voiLut.js';
import {
  WindowLevel,
  equalWl,
  validateWindowLevel
} from './windowLevel.js';
import {generateImageDataMonochrome} from './viewMonochrome.js';
import {
  generateImageDataPaletteColor,
  generateImageDataPaletteColorBlend
} from './viewPaletteColor.js';
import {generateImageDataRgb} from './viewRgb.js';
import {generateImageDataYbrFull} from './viewYbrFull.js';
import {ViewFactory} from './viewFactory.js';
import {isIdentityMat33} from '../math/matrix.js';
import {getSliceIterator} from '../image/iterator.js';

import {RescaleSlopeAndIntercept} from './rsi.js';
import {MaskSegmentViewHelper} from '../image/maskSegmentViewHelper.js';
import {MAX_CONTOUR_SIZE} from './imageContour.js';

/**
 * @import {Image} from './image.js';
 * @import {ColourMap} from './luts.js';
 * @import {Matrix33} from '../math/matrix.js';
 * @import {Point, Point3D} from '../math/point.js';
 * @import {DataElement} from '../dicom/dataElement.js';
 */

/**
 * List of view event names.
 *
 * @type {string[]}
 */
export const viewEventNames = [
  'wlchange',
  'wlpresetadd',
  'colourmapchange',
  'positionchange',
  'opacitychange',
  'alphafuncchange',
  'maskviewchange'
];

/**
 * Create a View from DICOM elements and image.
 *
 * @param {Record<string, DataElement>} elements The DICOM elements.
 * @param {Image} image The associated image.
 * @returns {View} The View object.
 */
export function createView(elements, image) {
  const factory = new ViewFactory();
  return factory.create(elements, image);
}

/**
 * View class.
 *
 * Need to set the window lookup table once created
 * (either directly or with helper methods).
 *
 * @example
 * import {DicomParser, createImage, createView} from '//esm.sh/dwv';
 * // XMLHttpRequest onload callback
 * const onload = function (event) {
 *   // parse the dicom buffer
 *   const dicomParser = new DicomParser();
 *   dicomParser.parse(event.target.response);
 *   // create the image object
 *   const image = createImage(dicomParser.getDicomElements());
 *   // create the view
 *   const view = createView(dicomParser.getDicomElements(), image);
 *   // setup canvas
 *   const canvas = document.createElement('canvas');
 *   canvas.width = 256;
 *   canvas.height = 256;
 *   const ctx = canvas.getContext("2d");
 *   // update the image data
 *   const imageData = ctx.createImageData(256, 256);
 *   view.generateImageData(imageData);
 *   ctx.putImageData(imageData, 0, 0);
 *   // update html
 *   const div = document.getElementById('dwv');
 *   div.appendChild(canvas);
 * };
 * // DICOM file request
 * const request = new XMLHttpRequest();
 * const url = 'https://raw.githubusercontent.com/ivmartel/dwv/master/tests/data/bbmri-53323851.dcm';
 * request.open('GET', url);
 * request.responseType = 'arraybuffer';
 * request.onload = onload;
 * request.send();
 */
export class View extends EventTarget {

  /**
   * The associated image.
   *
   * @type {Image}
   */
  #image;

  /**
   * Window lookup tables, indexed per Rescale Slope and Intercept (RSI).
   *
   * @type {WindowLut}
   */
  #windowLut;

  /**
   * Flag for image constant RSI.
   *
   * @type {boolean}
   */
  #isConstantRSI;

  /**
   * Window presets.
   * Minmax will be filled at first use (see view.setWindowLevelPreset).
   *
   * @type {object}
   */
  #windowPresets = {minmax: {name: 'minmax'}};

  /**
   * Current window preset name.
   *
   * @type {string}
   */
  #currentPresetName;

  /**
   * Current window level.
   *
   * @type {WindowLevel}
   */
  #currentWl;

  /**
   * Colour map name.
   *
   * @type {string}
   */
  #colourMapName = 'plain';

  /**
   * Current position as a Point.
   * Store position and not index to stay geometry independent.
   *
   * @type {Point}
   */
  #currentPosition;

  /**
   * View orientation. Undefined will use the original slice ordering.
   *
   * @type {Matrix33}
   */
  #orientation;

  /**
   * The ill (non-contour) opacity relative to global opacity.
   * This only has an effect on segmentation views, or any other alpha
   * function that makes use of it.
   *
   * @type {number}
   */
  #fillOpacity = 0.33;

  /**
   * The thickness of the contour in pixels.
   * This only has an effect on segmentation views, or any other alpha
   * function that makes use of it.
   *
   * @type {number}
   */
  #contourThickness = 1;

  /**
   * @callback alphaFn
   * @param {number[]|number} value The pixel value.
   *   Can be a number for monochrome data or an array for RGB data.
   * @param {number} index The values' index.
   * @returns {number} The opacity of the input value in [0,255] range.
   */

  /**
   * @callback maskAlphaFn
   * @param {number} value The pixel value.
   *   Can be a number for monochrome data or an array for RGB data.
   * @param {number} index The values' index.
   * @returns {number} The opacity of the input value in [0,255] range.
   */

  /**
   * Per value alpha function.
   *
   * @type {alphaFn|maskAlphaFn}
   */
  #alphaFunction;

  /**
   * Image alpha function.
   *
   * @type {alphaFn}
   */
  #imageAlphaFunction = function (_value, _index) {
    // default always returns fully visible
    return 0xff;
  };

  /**
   * Mask image alpha function.
   *
   * @type {maskAlphaFn}
   */
  #maskAlphaFuntion = (value, index) => {
    // transparent: 0 (background) and hidden
    if (value === 0 || this.#segmentViewHelper.isHidden(value)) {
      return 0;
    }

    if (this.getContourThickness() !== 0) {
      // ideally getContourDistance would be passed in by an
      // iterator, but that would require a large change to a
      // lot of components for this one edge case.
      const contourDistance =
        this.#image.getContour().getDistance(
          index,
          this.getOrientation()
        );
      if (contourDistance <= this.getContourThickness()) {
        return 0xff;
      }
      return 0xff * this.getFillOpacity();
    }

    return 0xff * this.getFillOpacity();
  };

  /**
   * Segment view helper to handle
   *   hidden segments.
   *
   * @type {MaskSegmentViewHelper|undefined}
   */
  #segmentViewHelper;

  /**
   * @param {Image} image The associated image.
   */
  constructor(image) {
    super();
    this.setImage(image);
  }

  /**
   * Get the associated image.
   *
   * @returns {Image} The associated image.
   */
  getImage() {
    return this.#image;
  }

  /**
   * Set the associated image.
   *
   * @param {Image} image The associated image.
   */
  setImage(image) {
    this.#image = image;

    // default to middle index
    if (typeof this.getCurrentPosition() === 'undefined') {
      this.setCurrentIndex(this.#getMiddleIndex(), true);
    }

    // reset alpha function
    if (this.isMask()) {
      // default helper
      this.#segmentViewHelper = new MaskSegmentViewHelper();
      // mask alpha func
      this.#alphaFunction = this.#maskAlphaFuntion;
    } else {
      // image alpha func
      this.#alphaFunction = this.#imageAlphaFunction;
      // listen to appendframe event to update the current position
      //   to add the extra dimension
      this.#image.addEventListener('appendframe', () => {
        // update current position if first appendFrame
        const index = this.getCurrentIndex();
        if (index.length() === 3) {
          // add dimension
          const values = index.getValues();
          values.push(0);
          this.setCurrentIndex(new Index(values), true);
        }
      });
    }
  }

  /**
   * Check is the associated image is a mask.
   *
   * @returns {boolean} True if the associated image is a mask.
   */
  isMask() {
    return this.#image.isMask();
  }

  /**
   * Set the mask segment view helper to handle
   *   hidden segments.
   *
   * @param {MaskSegmentViewHelper} helper The helper.
   */
  setMaskViewHelper(helper) {
    this.#segmentViewHelper = helper;

    this.dispatchEvent(new CustomEvent('alphafuncchange'));
  }

  /**
   * Get the view orientation.
   *
   * @returns {Matrix33} The orientation matrix.
   */
  getOrientation() {
    return this.#orientation;
  }

  /**
   * Set the view orientation.
   *
   * @param {Matrix33} mat33 The orientation matrix.
   */
  setOrientation(mat33) {
    this.#orientation = mat33;
  }

  /**
   * Get the fill opacity relative to the global opacity.
   *
   * @returns {number} The fill opacity (between 0 and 1).
   */
  getFillOpacity() {
    return this.#fillOpacity;
  }

  /**
   * Set the fill opacity relative to the global opacity.
   * This only has an effect on segmentation views, or any other alpha
   * function that makes use of it.
   *
   * @param {number} opacity The fill opacity (between 0 and 1).
   */
  setFillOpacity(opacity) {
    // Clamp to 0,1
    if (opacity > 1) {
      this.#fillOpacity = 1;
    } else if (opacity < 0) {
      this.#fillOpacity = 0;
    } else {
      this.#fillOpacity = opacity;
    }

    /**
     * Mask view change event.
     *
     * @event View#maskviewchange
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {Array} detail.value The changed value.
     */
    this.dispatchEvent(new CustomEvent('maskviewchange', {
      detail: {value: [this.#fillOpacity, this.#contourThickness]}
    }));
  }

  /**
   * Get the thickness of the contour in pixels.
   *
   * @returns {number} The contour thickness (0 <= integer <= MAX_CONTOUR_SIZE).
   */
  getContourThickness() {
    return this.#contourThickness;
  }

  /**
   * Set the thickness of the contour in pixels.
   * This only has an effect on segmentation views, or any other alpha
   * function that makes use of it.
   *
   * @param {number} thickness The contour thickness
   *  (0 <= integer <= MAX_CONTOUR_SIZE).
   */
  setContourThickness(thickness) {
    if (thickness < 0) {
      this.#contourThickness = 0;
    } else if (thickness > MAX_CONTOUR_SIZE) {
      this.#contourThickness = MAX_CONTOUR_SIZE;
    } else {
      this.#contourThickness = thickness;
    }

    // fire mask view change
    this.dispatchEvent(new CustomEvent('maskviewchange', {
      detail: {value: [this.#fillOpacity, this.#contourThickness]}
    }));
  }

  /**
   * Get the middle index of the current image.
   *
   * @returns {Index} The middle index.
   */
  #getMiddleIndex() {
    const geometry = this.#image.getGeometry();
    const size = geometry.getSize();
    const values = new Array(size.length());
    values.fill(0);
    // middle
    values[0] = Math.floor(size.get(0) / 2);
    values[1] = Math.floor(size.get(1) / 2);
    values[2] = Math.floor(size.get(2) / 2);
    return size.normaliseIndex(new Index(values));
  }

  /**
   * Get the milliseconds per frame from frame rate.
   *
   * @param {number} recommendedDisplayFrameRate Recommended Display Frame Rate.
   * @returns {number} The milliseconds per frame.
   */
  getPlaybackMilliseconds(recommendedDisplayFrameRate) {
    if (!recommendedDisplayFrameRate) {
      // Default to 10 FPS if none is found in the meta
      recommendedDisplayFrameRate = 10;
    }
    // round milliseconds per frame to nearest whole number
    return Math.round(1000 / recommendedDisplayFrameRate);
  }

  /**
   * Get the alpha function.
   *
   * @returns {alphaFn} The function.
   */
  getAlphaFunction() {
    return this.#alphaFunction;
  }

  /**
   * Set alpha function.
   *
   * @param {alphaFn} func The function.
   * @fires View#alphafuncchange
   */
  setAlphaFunction(func) {
    this.#alphaFunction = func;
    /**
     * Alpha func change event.
     *
     * @event View#alphafuncchange
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     */
    this.dispatchEvent(new CustomEvent('alphafuncchange'));
  }

  /**
   * Get the window LUT of the image.
   * Warning: can be undefined in no window/level was set.
   *
   * @returns {WindowLut} The window LUT of the image.
   * @fires View#wlchange
   */
  #getCurrentWindowLut() {
    // special case for 'perslice' presets
    if (typeof this.#currentPresetName !== 'undefined' &&
      typeof this.#windowPresets[this.#currentPresetName] !== 'undefined' &&
      typeof this.#windowPresets[this.#currentPresetName].perslice !==
      'undefined' &&
      this.#windowPresets[this.#currentPresetName].perslice === true &&
      // TODO: we currently can't handle per-slice wl on resampled images
      !this.#image.isResampled()) {
      // get the slice window level
      const currentIndex = this.getCurrentIndex();
      if (typeof currentIndex === 'undefined') {
        throw new Error('Cannot get window lut with no current index');
      }
      const offset = this.#image.getSecondaryOffset(currentIndex);
      const currentPreset = this.#windowPresets[this.#currentPresetName];
      const sliceWl = currentPreset.wl[offset];
      // set window level: will send a change event, mark it as silent as
      // this change is always triggered by a position change
      if (typeof sliceWl !== 'undefined') {
        this.setWindowLevel(sliceWl, this.#currentPresetName, true);
      }
    }

    // if no current, use first id
    if (typeof this.#currentWl === 'undefined') {
      this.setWindowLevelPresetById(0, true);
    }

    // get the window lut
    if (typeof this.#isConstantRSI === 'undefined' ||
      this.#image.isConstantRSI() !== this.#isConstantRSI) {
      this.#isConstantRSI = this.#image.isConstantRSI();
      // set or update windowLut if isConstantRSI has changed
      // (can be different at first slice and after having loaded
      //  the full volume...)
      let rsi;
      let isDiscrete;
      if (this.#isConstantRSI) {
        rsi = this.#image.getRescaleSlopeAndIntercept();
        isDiscrete = true;
      } else {
        rsi = new RescaleSlopeAndIntercept(1, 0);
        isDiscrete = false;
      }
      // create the rescale lookup table
      const modalityLut = new ModalityLut(
        rsi,
        this.#image.getMeta().BitsStored);
      // create the window lookup table
      this.#windowLut = new WindowLut(
        modalityLut,
        this.#image.getMeta().PixelRepresentation === 1,
        isDiscrete);
    }

    // update VOI lut if not present or its window level
    // is different from the current one
    const voiLut = this.#windowLut.getVoiLut();
    let voiLutWl;
    if (typeof voiLut !== 'undefined') {
      voiLutWl = voiLut.getWindowLevel();
    }
    if (typeof voiLut === 'undefined' ||
      !equalWl(this.#currentWl, voiLutWl)) {
      // set lut window level
      const newVoiLut = new VoiLut(
        this.#currentWl,
        this.#image.getMeta().VOILUTFunction
      );
      this.#windowLut.setVoiLut(newVoiLut);
    }

    // return
    return this.#windowLut;
  }

  /**
   * Get the window presets.
   *
   * @returns {object} The window presets.
   */
  getWindowPresets() {
    return this.#windowPresets;
  }

  /**
   * Get the window presets names.
   *
   * @returns {string[]} The list of window presets names.
   */
  getWindowPresetsNames() {
    return Object.keys(this.#windowPresets);
  }

  /**
   * Set the window presets.
   *
   * @param {object} presets The window presets.
   */
  setWindowPresets(presets) {
    this.#windowPresets = presets;
  }

  /**
   * Add window presets to the existing ones.
   *
   * @param {object} presets The window presets.
   */
  addWindowPresets(presets) {
    const keys = Object.keys(presets);
    for (const key of keys) {
      if (typeof this.#windowPresets[key] !== 'undefined') {
        if (typeof this.#windowPresets[key].perslice !== 'undefined' &&
          this.#windowPresets[key].perslice === true) {
          throw new Error('Cannot add perslice preset');
        } else {
          // update existing
          this.#windowPresets[key] = presets[key];
        }
      } else {
        // add new
        this.#windowPresets[key] = presets[key];
        // fire event
        /**
         * Window/level add preset event.
         *
         * @event View#wlpresetadd
         * @type {CustomEvent}
         * @property {object} detail The event detail.
         * @property {string} detail.name The name of the preset.
         */
        this.dispatchEvent(new CustomEvent('wlpresetadd', {
          detail: {name: key}
        }));
      }
    }
  }

  /**
   * Get the current window level preset name.
   *
   * @returns {string|undefined} The preset name.
   */
  getCurrentWindowPresetName() {
    return this.#currentPresetName;
  }

  /**
   * Get the colour map of the image.
   *
   * @returns {string} The colour map name.
   */
  getColourMap() {
    return this.#colourMapName;
  }

  /**
   * Get the colour map object.
   *
   * @returns {ColourMap} The colour map.
   */
  #getColourMapLut() {
    return luts[this.#colourMapName];
  }

  /**
   * Set the colour map of the image.
   *
   * @param {string} name The colour map name.
   * @fires View#colourmapchange
   */
  setColourMap(name) {
    // check if we have it
    if (!luts[name]) {
      throw new Error(`Unknown colour map: '${name}'`);
    }

    this.#colourMapName = name;

    /**
     * Color change event.
     *
     * @event View#colourmapchange
     * @type {CustomEvent}
     * @property {object} detail The event detail.
     * @property {Array} detail.value The changed value.
     */
    this.dispatchEvent(new CustomEvent('colourmapchange', {
      detail: {value: [name]}
    }));
  }

  /**
   * Get the current position.
   *
   * @returns {Point|undefined} The current position.
   */
  getCurrentPosition() {
    return this.#currentPosition;
  }

  /**
   * Get the current index.
   *
   * @returns {Index|undefined} The current index.
   */
  getCurrentIndex() {
    const position = this.getCurrentPosition();
    if (typeof position === 'undefined') {
      return;
    }
    const geometry = this.getImage().getGeometry();
    return geometry.worldToIndex(position);
  }

  /**
   * Get the SOP image UID of the current image.
   *
   * @returns {string} The UID.
   */
  getCurrentImageUid() {
    return this.#image.getImageUid(this.getCurrentIndex());
  }

  /**
   * Get the image origin for a image UID.
   *
   * @param {string} uid The UID.
   * @returns {Point3D|undefined} The origin.
   */
  getOriginForImageUid(uid) {
    return this.#image.getOriginForImageUid(uid);
  }

  /**
   * Check if the image includes an UID.
   *
   * @param {string} uid The UID.
   * @returns {boolean} True if present.
   */
  includesImageUid(uid) {
    return this.#image.includesImageUid(uid);
  }

  /**
   * Check if the current position (default) or
   * the provided position is in bounds.
   *
   * @param {Point} [position] Optional position.
   * @returns {boolean} True is the position is in bounds.
   */
  isPositionInBounds(position) {
    if (typeof position === 'undefined') {
      position = this.#currentPosition;
    }
    const geometry = this.#image.getGeometry();
    const index = geometry.worldToIndex(position);
    const dirs = [this.getScrollDimIndex()];
    if (index.length() === 4) {
      dirs.push(3);
    }
    return geometry.isIndexInBounds(index, dirs);
  }

  /**
   * Get the first origin or at a given position.
   *
   * @param {Point} [position] Optional position.
   * @returns {Point3D} The origin.
   */
  getOrigin(position) {
    const geometry = this.#image.getGeometry();
    let originIndex = 0;
    if (typeof position !== 'undefined') {
      const index = geometry.worldToIndex(position);
      // index is reoriented, 2 is scroll index
      originIndex = index.get(2);
    }
    return geometry.getOrigins()[originIndex];
  }

  /**
   * Set the current position via an index.
   *
   * @param {Index} index The new index.
   * @param {boolean} [silent] Flag to fire event or not.
   * @returns {boolean} False if not in bounds.
   * @fires View#positionchange
   */
  setCurrentIndex(index, silent) {
    const geometry = this.#image.getGeometry();
    const position = geometry.indexToWorld(index);
    return this.setCurrentPosition(position, silent);
  }

  /**
   * Set current position.
   *
   * @param {Point} inPosition The new position.
   * @param {boolean} [silent] Flag to fire event or not.
   * @returns {boolean} False if not in bounds.
   * @fires View#positionchange
   */
  setCurrentPosition(inPosition, silent) {
    // check input
    if (typeof silent === 'undefined') {
      silent = false;
    }

    const geometry = this.#image.getGeometry();
    const position = geometry.getSize().normalisePoint(
      inPosition, this.#currentPosition);
    const index = geometry.worldToIndex(position);

    // check if possible
    const dirs = [this.getScrollDimIndex()];
    if (index.length() === 4) {
      dirs.push(3);
    }
    if (!geometry.isIndexInBounds(index, dirs)) {
      this.#currentPosition = position;
      if (!silent) {
        // fire event with valid: false
        this.dispatchEvent(new CustomEvent('positionchange', {
          detail: {
            value: [index.getValues(), inPosition.getValues()],
            valid: false
          }
        }));
      }

      // do no send invalid positionchange event: avoid empty repaint
      return false;
    }

    // calculate diff dims before updating internal
    let diffDims = [];
    const currentIndex = this.getCurrentIndex();
    if (typeof currentIndex !== 'undefined') {
      if (currentIndex.canCompare(index)) {
        diffDims = currentIndex.compare(index);
      } else {
        const minLen = Math.min(currentIndex.length(), index.length());
        for (let i = 0; i < minLen; ++i) {
          if (currentIndex.get(i) !== index.get(i)) {
            diffDims.push(i);
          }
        }
        const maxLen = Math.max(currentIndex.length(), index.length());
        for (let j = minLen; j < maxLen; ++j) {
          diffDims.push(j);
        }
      }
    } else {
      for (let k = 0; k < index.length(); ++k) {
        diffDims.push(k);
      }
    }

    // assign
    this.#currentPosition = position;

    if (!silent) {
      /** @type {Array} */
      const posValue = [
        index.getValues(),
        inPosition.getValues(),
      ];

      // add value if possible
      if (this.#image.canQuantify()) {
        const pixValue = this.#image.getRescaledValueAtIndex(index);
        posValue.push(pixValue);
      }

      /**
       * Position change event.
       *
       * @event View#positionchange
       * @type {CustomEvent}
       * @property {object} detail The event detail.
       * @property {Array} detail.value The changed value as
       *   [index, pixelValue].
       * @property {number[]} detail.diffDims An array of modified indices.
       */
      this.dispatchEvent(new CustomEvent('positionchange', {
        detail: {
          value: posValue,
          diffDims,
          data: {imageUid: this.#image.getImageUid(index)}
        }
      }));
    }

    // all good
    return true;
  }

  /**
   * Set the view window/level.
   *
   * @param {WindowLevel} wl The window and level.
   * @param {string} [name] Associated preset name, defaults to 'manual'.
   * Warning: uses the latest set rescale LUT or the default linear one.
   * @param {boolean} [silent] Flag to launch events with skipGenerate.
   * @fires View#wlchange
   */
  setWindowLevel(wl, name, silent) {
    // check input
    if (typeof name === 'undefined') {
      name = 'manual';
    }
    if (name !== 'manual' &&
      typeof this.#windowPresets[name] === 'undefined') {
      throw new Error(`Unknown window level preset: '${name}'`);
    }
    if (typeof silent === 'undefined') {
      silent = false;
    }

    // bound window center and width
    const wlBound = validateWindowLevel(
      wl,
      this.#image.getRescaledDataRange(),
      this.#image.getMeta().VOILUTFunction
    );

    // check if new wl
    const isNewWl = !equalWl(wlBound, this.#currentWl);
    // check if new name
    const isNewName = this.#currentPresetName !== name;

    // compare to previous if present
    if (isNewWl || isNewName) {
      // assign
      this.#currentWl = wlBound;
      this.#currentPresetName = name;

      // update manual
      if (name === 'manual') {
        if (typeof this.#windowPresets[name] !== 'undefined') {
          this.#windowPresets[name].wl[0] = wlBound;
        } else {
          // add if not present
          this.addWindowPresets({
            manual: {
              wl: [wlBound],
              name: 'manual'
            }
          });
        }
      }

      /**
       * Window/level change event.
       *
       * @event View#wlchange
       * @type {CustomEvent}
       * @property {object} detail The event detail.
       * @property {Array} detail.value The changed value.
       * @property {number} detail.wc The new window center value.
       * @property {number} detail.ww The new window width value.
       * @property {boolean} detail.skipGenerate Flag to skip view generation.
       */
      this.dispatchEvent(new CustomEvent('wlchange', {
        detail: {
          value: [wlBound.center, wlBound.width, name],
          wc: wlBound.center,
          ww: wlBound.width,
          skipGenerate: silent
        }
      }));
    }
  }

  /**
   * Get the window/level.
   *
   * @returns {WindowLevel} The window and level.
   */
  getWindowLevel() {
    // same as #currentWl...
    const windowLut = this.#getCurrentWindowLut();
    return windowLut.getVoiLut().getWindowLevel();
  }

  /**
   * Set the window level to the preset with the input name.
   *
   * @param {string} name The name of the preset to activate.
   * @param {boolean} [silent] Flag to launch events with skipGenerate.
   */
  setWindowLevelPreset(name, silent) {
    const preset = this.getWindowPresets()[name];
    if (typeof preset === 'undefined') {
      throw new Error(`Unknown window level preset: '${name}'`);
    }
    // special min/max
    if (name === 'minmax' && typeof preset.wl === 'undefined') {
      preset.wl = [this.getWindowLevelMinMax()];
    }
    // default to first
    let wl = preset.wl[0];
    // check if 'perslice' case
    if (typeof preset.perslice !== 'undefined' &&
      preset.perslice === true &&
      // TODO: we currently can't handle per-slice wl on resampled images
      !this.#image.isResampled()) {
      const offset = this.#image.getSecondaryOffset(this.getCurrentIndex());
      wl = preset.wl[offset];
    }
    // set w/l
    if (typeof wl !== 'undefined') {
      this.setWindowLevel(wl, name, silent);
    }
  }

  /**
   * Set the window level to the preset with the input id.
   *
   * @param {number} id The id of the preset to activate.
   * @param {boolean} [silent] Flag to launch events with skipGenerate.
   */
  setWindowLevelPresetById(id, silent) {
    const keys = Object.keys(this.getWindowPresets());
    this.setWindowLevelPreset(keys[id], silent);
  }

  /**
   * Get the image window/level that covers the full data range.
   * Warning: uses the latest set rescale LUT or the default linear one.
   *
   * @returns {WindowLevel} A min/max window level.
   */
  getWindowLevelMinMax() {
    const range = this.getImage().getRescaledDataRange();
    const width = range.max - range.min;
    const center = range.min + width / 2;
    return validateWindowLevel(
      new WindowLevel(center, width),
      range,
      this.#image.getMeta().VOILUTFunction
    );
  }

  /**
   * Set the image window/level to cover the full data range.
   * Warning: uses the latest set rescale LUT or the default linear one.
   */
  setWindowLevelMinMax() {
    // calculate center and width
    const wl = this.getWindowLevelMinMax();
    // set window level
    this.setWindowLevel(wl, 'minmax');
  }

  /**
   * Generate display image data to be given to a canvas.
   *
   * @param {ImageData} data The iamge data to fill in.
   * @param {Index} index Optional index at which to generate,
   *   otherwise generates at current index.
   */
  generateImageData(data, index) {
    // check index
    if (typeof index === 'undefined') {
      // use current index
      index = this.getCurrentIndex();
      if (typeof index === 'undefined') {
        throw new Error('Cannot generate image data with no current index');
      }
    }

    const image = this.getImage();
    const isRescaled = !image.isConstantRSI();
    const iterator = getSliceIterator(
      image, index, isRescaled, this.getOrientation());

    const photoInterpretation = image.getPhotometricInterpretation();
    switch (photoInterpretation) {
      case 'MONOCHROME1':
      case 'MONOCHROME2':
        generateImageDataMonochrome(
          data,
          iterator,
          this.getAlphaFunction(),
          this.#getCurrentWindowLut(),
          this.#getColourMapLut()
        );
        break;

      case 'PALETTE COLOR':
        if (image.getHasOverlap()) {
          generateImageDataPaletteColorBlend(
            data,
            iterator,
            image.getPaletteColourMap(),
            image.getSegmentCollection(),
            image.getGeometry().getSize().getDimSize(2),
            image.getGeometry().getSize(),
            this.getOrientation(),
            this.getContourThickness(),
            this.getFillOpacity(),
            this.#segmentViewHelper
          );
        } else {
          generateImageDataPaletteColor(
            data,
            iterator,
            this.getAlphaFunction(),
            image.getPaletteColourMap(),
            image.getMeta().BitsStored === 16
          );
        }
        break;

      case 'RGB':
        generateImageDataRgb(
          data,
          iterator,
          this.getAlphaFunction()
        );
        break;

      case 'YBR_FULL':
        generateImageDataYbrFull(
          data,
          iterator,
          this.getAlphaFunction()
        );
        break;

      default:
        throw new Error(
          `Unsupported photometric interpretation: ${photoInterpretation}`);
    }
  }

  /**
   * Get the scroll dimension index.
   *
   * @returns {number} The index.
   */
  getScrollDimIndex() {
    // default to z
    let index = 2;
    // use orientation if available
    const orientation = this.getOrientation();
    if (typeof orientation !== 'undefined') {
      index = orientation.getThirdColMajorDirection();
    }
    return index;
  }

  /**
   * Is this view in the same orientation as the image aquisition.
   *
   * @returns {boolean} True if in aquisition plane.
   */
  isAquisitionOrientation() {
    return isIdentityMat33(this.#orientation);
  }

} // class View
