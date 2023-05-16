import {Index} from '../math/index';
import {RescaleLut} from './rescaleLut';
import {WindowLut} from './windowLut';
import {lut} from './luts';
import {WindowLevel} from './windowLevel';
import {generateImageDataMonochrome} from './viewMonochrome';
import {generateImageDataPaletteColor} from './viewPaletteColor';
import {generateImageDataRgb} from './viewRgb';
import {generateImageDataYbrFull} from './viewYbrFull';
import {getSliceIterator} from '../image/iterator';
import {ListenerHandler} from '../utils/listen';
import {logger} from '../utils/logger';

/**
 * List of view event names.
 *
 * @type {Array}
 */
export const viewEventNames = [
  'wlchange',
  'wlpresetadd',
  'colourchange',
  'positionchange',
  'opacitychange',
  'alphafuncchange'
];

/**
 * View class.
 *
 * Need to set the window lookup table once created
 * (either directly or with helper methods).
 */
export class View {

  /**
   * The associated image.
   *
   * @type {Image}
   */
  #image;

  /**
   * Window lookup tables, indexed per Rescale Slope and Intercept (RSI).
   *
   * @type {object}
   */
  #windowLuts = {};

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
  #currentPresetName = null;

  /**
   * Current window level.
   *
   * @type {object}
   */
  #currentWl = null;

  /**
   * colour map.
   *
   * @type {object}
   */
  #colourMap = lut.plain;

  /**
   * Current position as a Point.
   * Store position and not index to stay geometry independent.
   *
   * @type {Point}
   */
  #currentPosition = null;

  /**
   * View orientation. Undefined will use the original slice ordering.
   *
   * @type {object}
   */
  #orientation;

  /**
   * Listener handler.
   *
   * @type {object}
   */
  #listenerHandler = new ListenerHandler();

  /**
   * @param {Image} image The associated image.
   */
  constructor(image) {
    this.#image = image;

    // listen to appendframe event to update the current position
    //   to add the extra dimension
    this.#image.addEventListener('appendframe', () => {
      // update current position if first appendFrame
      const index = this.getCurrentIndex();
      if (index.length() === 3) {
        // add dimension
        const values = index.getValues();
        values.push(0);
        this.setCurrentIndex(new Index(values));
      }
    });
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
   * @param {Image} inImage The associated image.
   */
  setImage(inImage) {
    this.#image = inImage;
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
   * Initialise the view: set initial index.
   */
  init() {
    this.setInitialIndex();
  }

  /**
   * Set the initial index to 0.
   */
  setInitialIndex() {
    const geometry = this.#image.getGeometry();
    const size = geometry.getSize();
    const values = new Array(size.length());
    values.fill(0);
    // middle
    values[0] = Math.floor(size.get(0) / 2);
    values[1] = Math.floor(size.get(1) / 2);
    values[2] = Math.floor(size.get(2) / 2);
    this.setCurrentIndex(new Index(values), true);
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
   * Per value alpha function.
   *
   * @param {*} _value The pixel value. Can be a number for monochrome
   *  data or an array for RGB data.
   * @param {number} _index The data index of the value.
   * @returns {number} The coresponding alpha [0,255].
   */
  #alphaFunction = function (_value, _index) {
    // default always returns fully visible
    return 0xff;
  };

  /**
   * Get the alpha function.
   *
   * @returns {(value, index) => number} The function.
   */
  getAlphaFunction() {
    return this.#alphaFunction;
  }

  /**
   * Set alpha function.
   *
   * @param {(value, index) => number} func The function.
   * @fires View#alphafuncchange
   */
  setAlphaFunction(func) {
    this.#alphaFunction = func;
    /**
     * Alpha func change event.
     *
     * @event View#alphafuncchange
     * @type {object}
     */
    this.#fireEvent({
      type: 'alphafuncchange'
    });
  }

  /**
   * Get the window LUT of the image.
   * Warning: can be undefined in no window/level was set.
   *
   * @param {object} [rsi] Optional image rsi, will take the one of the
   *   current slice otherwise.
   * @returns {WindowLut} The window LUT of the image.
   * @fires View#wlchange
   */
  getCurrentWindowLut(rsi) {
    // check position
    if (!this.getCurrentIndex()) {
      this.setInitialIndex();
    }
    const currentIndex = this.getCurrentIndex();
    // use current rsi if not provided
    if (typeof rsi === 'undefined') {
      rsi = this.#image.getRescaleSlopeAndIntercept(currentIndex);
    }

    // get the current window level
    let wl = null;
    // special case for 'perslice' presets
    if (this.#currentPresetName &&
      typeof this.#windowPresets[this.#currentPresetName] !== 'undefined' &&
      typeof this.#windowPresets[this.#currentPresetName].perslice !==
        'undefined' &&
      this.#windowPresets[this.#currentPresetName].perslice === true) {
      // get the preset for this slice
      const offset = this.#image.getSecondaryOffset(currentIndex);
      wl = this.#windowPresets[this.#currentPresetName].wl[offset];
    }
    // regular case
    if (!wl) {
      // if no current, use first id
      if (!this.#currentWl) {
        this.setWindowLevelPresetById(0, true);
      }
      wl = this.#currentWl;
    }

    // get the window lut
    let wlut = this.#windowLuts[rsi.toString()];
    if (typeof wlut === 'undefined') {
      // create the rescale lookup table
      const rescaleLut = new RescaleLut(
        this.#image.getRescaleSlopeAndIntercept(0),
        this.#image.getMeta().BitsStored);
      // create the window lookup table
      const windowLut = new WindowLut(
        rescaleLut, this.#image.getMeta().IsSigned);
      // store
      this.addWindowLut(windowLut);
      wlut = windowLut;
    }

    // update lut window level if not present or different from previous
    const lutWl = wlut.getWindowLevel();
    if (!wl.equals(lutWl)) {
      // set lut window level
      wlut.setWindowLevel(wl);
      wlut.update();
      // fire change event
      if (!lutWl ||
        lutWl.getWidth() !== wl.getWidth() ||
        lutWl.getCenter() !== wl.getCenter()) {
        this.#fireEvent({
          type: 'wlchange',
          value: [wl.getCenter(), wl.getWidth()],
          wc: wl.getCenter(),
          ww: wl.getWidth(),
          skipGenerate: true
        });
      }
    }

    // return
    return wlut;
  }

  /**
   * Add the window LUT to the list.
   *
   * @param {WindowLut} wlut The window LUT of the image.
   */
  addWindowLut(wlut) {
    const rsi = wlut.getRescaleLut().getRSI();
    this.#windowLuts[rsi.toString()] = wlut;
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
   * @returns {object} The list of window presets names.
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
   * Set the default colour map.
   *
   * @param {object} map The colour map.
   */
  setDefaultColourMap(map) {
    this.#colourMap = map;
  }

  /**
   * Add window presets to the existing ones.
   *
   * @param {object} presets The window presets.
   */
  addWindowPresets(presets) {
    const keys = Object.keys(presets);
    let key = null;
    for (let i = 0; i < keys.length; ++i) {
      key = keys[i];
      if (typeof this.#windowPresets[key] !== 'undefined') {
        if (typeof this.#windowPresets[key].perslice !== 'undefined' &&
        this.#windowPresets[key].perslice === true) {
          throw new Error('Cannot add perslice preset');
        } else {
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
         * @type {object}
         * @property {string} name The name of the preset.
         */
        this.#fireEvent({
          type: 'wlpresetadd',
          name: key
        });
      }
    }
  }

  /**
   * Get the colour map of the image.
   *
   * @returns {object} The colour map of the image.
   */
  getColourMap() {
    return this.#colourMap;
  }

  /**
   * Set the colour map of the image.
   *
   * @param {object} map The colour map of the image.
   * @fires View#colourchange
   */
  setColourMap(map) {
    this.#colourMap = map;
    /**
     * Color change event.
     *
     * @event View#colourchange
     * @type {object}
     * @property {Array} value The changed value.
     * @property {number} wc The new window center value.
     * @property {number} ww The new window wdth value.
     */
    this.#fireEvent({
      type: 'colourchange',
      wc: this.getCurrentWindowLut().getWindowLevel().getCenter(),
      ww: this.getCurrentWindowLut().getWindowLevel().getWidth()
    });
  }

  /**
   * Get the current position.
   *
   * @returns {Point} The current position.
   */
  getCurrentPosition() {
    return this.#currentPosition;
  }

  /**
   * Get the current index.
   *
   * @returns {Index} The current index.
   */
  getCurrentIndex() {
    const position = this.getCurrentPosition();
    if (!position) {
      return null;
    }
    const geometry = this.getImage().getGeometry();
    return geometry.worldToIndex(position);
  }

  /**
   * Check is the provided position can be set.
   *
   * @param {Point} position The position.
   * @returns {boolean} True is the position is in bounds.
   */
  canSetPosition(position) {
    const geometry = this.#image.getGeometry();
    const index = geometry.worldToIndex(position);
    const dirs = [this.getScrollIndex()];
    if (index.length() === 4) {
      dirs.push(3);
    }
    return geometry.isIndexInBounds(index, dirs);
  }

  /**
   * Get the origin at a given position.
   *
   * @param {Point} position The position.
   * @returns {Point} The origin.
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
   * Set the current position.
   *
   * @param {Point} position The new position.
   * @param {boolean} silent Flag to fire event or not.
   * @returns {boolean} False if not in bounds
   * @fires View#positionchange
   */
  setCurrentPosition(position, silent) {
    // send invalid event if not in bounds
    const geometry = this.#image.getGeometry();
    const index = geometry.worldToIndex(position);
    const dirs = [this.getScrollIndex()];
    if (index.length() === 4) {
      dirs.push(3);
    }
    if (!geometry.isIndexInBounds(index, dirs)) {
      if (!silent) {
        // fire event with valid: false
        this.#fireEvent({
          type: 'positionchange',
          value: [
            index.getValues(),
            position.getValues(),
          ],
          valid: false
        });
      }
      return false;
    }
    return this.setCurrentIndex(index, silent);
  }

  /**
   * Set the current index.
   *
   * @param {Index} index The new index.
   * @param {boolean} [silent] Flag to fire event or not.
   * @returns {boolean} False if not in bounds.
   * @fires View#positionchange
   */
  setCurrentIndex(index, silent) {
    // check input
    if (typeof silent === 'undefined') {
      silent = false;
    }

    const geometry = this.#image.getGeometry();
    const position = geometry.indexToWorld(index);

    // check if possible
    const dirs = [this.getScrollIndex()];
    if (index.length() === 4) {
      dirs.push(3);
    }
    if (!geometry.isIndexInBounds(index, dirs)) {
      // do no send invalid positionchange event: avoid empty repaint
      return false;
    }

    // calculate diff dims before updating internal
    let diffDims = null;
    let currentIndex = null;
    if (this.getCurrentPosition()) {
      currentIndex = this.getCurrentIndex();
    }
    if (currentIndex) {
      if (currentIndex.canCompare(index)) {
        diffDims = currentIndex.compare(index);
      } else {
        diffDims = [];
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
      diffDims = [];
      for (let k = 0; k < index.length(); ++k) {
        diffDims.push(k);
      }
    }

    // assign
    this.#currentPosition = position;

    if (!silent) {
      /**
       * Position change event.
       *
       * @event View#positionchange
       * @type {object}
       * @property {Array} value The changed value as [index, pixelValue].
       * @property {Array} diffDims An array of modified indices.
       */
      const posEvent = {
        type: 'positionchange',
        value: [
          index.getValues(),
          position.getValues(),
        ],
        diffDims: diffDims,
        data: {
          imageUid: this.#image.getImageUid(index)
        }
      };

      // add value if possible
      if (this.#image.canQuantify()) {
        const pixValue = this.#image.getRescaledValueAtIndex(index);
        posEvent.value.push(pixValue);
      }

      // fire
      this.#fireEvent(posEvent);
    }

    // all good
    return true;
  }

  /**
   * Set the view window/level.
   *
   * @param {number} center The window center.
   * @param {number} width The window width.
   * @param {string} [name] Associated preset name, defaults to 'manual'.
   * Warning: uses the latest set rescale LUT or the default linear one.
   * @param {boolean} [silent] Flag to launch events with skipGenerate.
   * @fires View#wlchange
   */
  setWindowLevel(center, width, name, silent) {
    // window width shall be >= 1 (see https://www.dabsoft.ch/dicom/3/C.11.2.1.2/)
    if (width < 1) {
      return;
    }

    // check input
    if (typeof name === 'undefined') {
      name = 'manual';
    }
    if (typeof silent === 'undefined') {
      silent = false;
    }

    // new window level
    const newWl = new WindowLevel(center, width);

    // check if new
    const isNew = !newWl.equals(this.#currentWl);

    // compare to previous if present
    if (isNew) {
      const isNewWidth = this.#currentWl
        ? this.#currentWl.getWidth() !== width : true;
      const isNewCenter = this.#currentWl
        ? this.#currentWl.getCenter() !== center : true;
      // assign
      this.#currentWl = newWl;
      this.#currentPresetName = name;

      if (isNewWidth || isNewCenter) {
        /**
         * Window/level change event.
         *
         * @event View#wlchange
         * @type {object}
         * @property {Array} value The changed value.
         * @property {number} wc The new window center value.
         * @property {number} ww The new window wdth value.
         * @property {boolean} skipGenerate Flag to skip view generation.
         */
        this.#fireEvent({
          type: 'wlchange',
          value: [center, width],
          wc: center,
          ww: width,
          skipGenerate: silent
        });
      }
    }
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
      throw new Error('Unknown window level preset: \'' + name + '\'');
    }
    // special min/max
    if (name === 'minmax' && typeof preset.wl === 'undefined') {
      preset.wl = [this.getWindowLevelMinMax()];
    }
    // default to first
    let wl = preset.wl[0];
    // check if 'perslice' case
    if (typeof preset.perslice !== 'undefined' &&
      preset.perslice === true) {
      const offset = this.#image.getSecondaryOffset(this.getCurrentIndex());
      wl = preset.wl[offset];
    }
    // set w/l
    this.setWindowLevel(
      wl.getCenter(), wl.getWidth(), name, silent);
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
   * Clone the image using all meta data and the original data buffer.
   *
   * @returns {View} A full copy of this {View}.
   */
  clone() {
    const copy = new View(this.getImage());
    for (const key in this.#windowLuts) {
      copy.addWindowLut(this.#windowLuts[key]);
    }
    copy.setListeners(this.getListeners());
    return copy;
  }

  /**
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type, will be called with the fired event.
   */
  addEventListener(type, callback) {
    this.#listenerHandler.add(type, callback);
  }

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  removeEventListener(type, callback) {
    this.#listenerHandler.remove(type, callback);
  }

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   */
  #fireEvent = (event) => {
    this.#listenerHandler.fireEvent(event);
  };

  /**
   * Get the image window/level that covers the full data range.
   * Warning: uses the latest set rescale LUT or the default linear one.
   *
   * @returns {object} A min/max window level.
   */
  getWindowLevelMinMax() {
    const range = this.getImage().getRescaledDataRange();
    const min = range.min;
    const max = range.max;
    let width = max - min;
    // full black / white images, defaults to 1.
    if (width < 1) {
      logger.warn('Zero or negative window width, defaulting to one.');
      width = 1;
    }
    const center = min + width / 2;
    return new WindowLevel(center, width);
  }

  /**
   * Set the image window/level to cover the full data range.
   * Warning: uses the latest set rescale LUT or the default linear one.
   */
  setWindowLevelMinMax() {
    // calculate center and width
    const wl = this.getWindowLevelMinMax();
    // set window level
    this.setWindowLevel(wl.getCenter(), wl.getWidth(), 'minmax');
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
      if (!this.getCurrentIndex()) {
        this.setInitialIndex();
      }
      index = this.getCurrentIndex();
    }

    const image = this.getImage();
    const iterator = getSliceIterator(
      image, index, false, this.getOrientation());

    const photoInterpretation = image.getPhotometricInterpretation();
    switch (photoInterpretation) {
    case 'MONOCHROME1':
    case 'MONOCHROME2':
      generateImageDataMonochrome(
        data,
        iterator,
        this.getAlphaFunction(),
        this.getCurrentWindowLut(),
        this.getColourMap()
      );
      break;

    case 'PALETTE COLOR':
      generateImageDataPaletteColor(
        data,
        iterator,
        this.getAlphaFunction(),
        this.getColourMap(),
        image.getMeta().BitsStored === 16
      );
      break;

    case 'RGB':
      generateImageDataRgb(
        data,
        iterator,
        this.getAlphaFunction(),
        this.getCurrentWindowLut()
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
        'Unsupported photometric interpretation: ' + photoInterpretation);
    }
  }

  /**
   * Increment the provided dimension.
   *
   * @param {number} dim The dimension to increment.
   * @param {boolean} silent Do not send event.
   * @returns {boolean} False if not in bounds.
   */
  incrementIndex(dim, silent) {
    const index = this.getCurrentIndex();
    const values = new Array(index.length());
    values.fill(0);
    if (dim < values.length) {
      values[dim] = 1;
    } else {
      console.warn('Cannot increment given index: ', dim, values.length);
    }
    const incr = new Index(values);
    const newIndex = index.add(incr);
    return this.setCurrentIndex(newIndex, silent);
  }

  /**
   * Decrement the provided dimension.
   *
   * @param {number} dim The dimension to increment.
   * @param {boolean} silent Do not send event.
   * @returns {boolean} False if not in bounds.
   */
  decrementIndex(dim, silent) {
    const index = this.getCurrentIndex();
    const values = new Array(index.length());
    values.fill(0);
    if (dim < values.length) {
      values[dim] = -1;
    } else {
      console.warn('Cannot decrement given index: ', dim, values.length);
    }
    const incr = new Index(values);
    const newIndex = index.add(incr);
    return this.setCurrentIndex(newIndex, silent);
  }

  /**
   * Get the scroll dimension index.
   *
   * @returns {number} The index.
   */
  getScrollIndex() {
    let index = null;
    const orientation = this.getOrientation();
    if (typeof orientation !== 'undefined') {
      index = orientation.getThirdColMajorDirection();
    } else {
      index = 2;
    }
    return index;
  }

  /**
   * Decrement the scroll dimension index.
   *
   * @param {boolean} silent Do not send event.
   * @returns {boolean} False if not in bounds.
   */
  decrementScrollIndex(silent) {
    return this.decrementIndex(this.getScrollIndex(), silent);
  }

  /**
   * Increment the scroll dimension index.
   *
   * @param {boolean} silent Do not send event.
   * @returns {boolean} False if not in bounds.
   */
  incrementScrollIndex(silent) {
    return this.incrementIndex(this.getScrollIndex(), silent);
  }

} // class View
