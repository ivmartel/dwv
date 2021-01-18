// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * View class.
 *
 * @class
 * @param {Image} image The associated image.
 * Need to set the window lookup table once created
 * (either directly or with helper methods).
 */
dwv.image.View = function (image) {
  /**
   * Window lookup tables, indexed per Rescale Slope and Intercept (RSI).
   *
   * @private
   * @type {Window}
   */
  var windowLuts = {};

  /**
   * Window presets.
   * Minmax will be filled at first use (see view.setWindowLevelPreset).
   *
   * @private
   * @type {object}
   */
  var windowPresets = {minmax: {name: 'minmax'}};

  /**
   * Current window preset name.
   *
   * @private
   * @type {string}
   */
  var currentPresetName = null;

  /**
   * Current window level.
   *
   * @private
   * @type {object}
   */
  var currentWl = null;

  /**
   * colour map.
   *
   * @private
   * @type {object}
   */
  var colourMap = dwv.image.lut.plain;
  /**
   * Current position.
   *
   * @private
   * @type {object}
   */
  var currentPosition = null;
  /**
   * Current frame. Zero based.
   *
   * @private
   * @type {number}
   */
  var currentFrame = null;

  /**
   * Get the associated image.
   *
   * @returns {Image} The associated image.
   */
  this.getImage = function () {
    return image;
  };
  /**
   * Set the associated image.
   *
   * @param {Image} inImage The associated image.
   */
  this.setImage = function (inImage) {
    image = inImage;
  };

  /**
   * Set initial position.
   */
  this.setInitialPosition = function () {
    var silent = true;
    this.setCurrentPosition({i: 0, j: 0, k: 0}, silent);
    this.setCurrentFrame(0, silent);
  };

  /**
   * Get the milliseconds per frame from frame rate.
   *
   * @param {number} recommendedDisplayFrameRate Recommended Display Frame Rate.
   * @returns {number} The milliseconds per frame.
   */
  this.getPlaybackMilliseconds = function (recommendedDisplayFrameRate) {
    if (!recommendedDisplayFrameRate) {
      // Default to 10 FPS if none is found in the meta
      recommendedDisplayFrameRate = 10;
    }
    // round milliseconds per frame to nearest whole number
    return Math.round(1000 / recommendedDisplayFrameRate);
  };

  /**
   * Get the window LUT of the image.
   * Warning: can be undefined in no window/level was set.
   *
   * @param {object} rsi Optional image rsi, will take the one of the
   *   current slice otherwise.
   * @returns {Window} The window LUT of the image.
   * @fires dwv.image.View#wlwidthchange
   * @fires dwv.image.View#wlcenterchange
   */
  this.getCurrentWindowLut = function (rsi) {
    // check position (also sets frame)
    if (!this.getCurrentPosition()) {
      this.setInitialPosition();
    }
    var sliceNumber = this.getCurrentPosition().k;
    // use current rsi if not provided
    if (typeof rsi === 'undefined') {
      rsi = image.getRescaleSlopeAndIntercept(sliceNumber);
    }

    // get the current window level
    var wl = null;
    // special case for 'perslice' presets
    if (currentPresetName &&
      typeof windowPresets[currentPresetName] !== 'undefined' &&
      typeof windowPresets[currentPresetName].perslice !== 'undefined' &&
      windowPresets[currentPresetName].perslice === true) {
      // get the preset for this slice
      wl = windowPresets[currentPresetName].wl[sliceNumber];
    }
    // regular case
    if (!wl) {
      // if no current, use first id
      if (!currentWl) {
        this.setWindowLevelPresetById(0, true);
      }
      wl = currentWl;
    }

    // get the window lut
    var wlut = windowLuts[rsi.toString()];
    if (typeof wlut === 'undefined') {
      // create the rescale lookup table
      var rescaleLut = new dwv.image.RescaleLut(
        image.getRescaleSlopeAndIntercept(0), image.getMeta().BitsStored);
      // create the window lookup table
      var windowLut = new dwv.image.WindowLut(
        rescaleLut, image.getMeta().IsSigned);
      // store
      this.addWindowLut(windowLut);
      wlut = windowLut;
    }

    // update lut window level if not present or different from previous
    var lutWl = wlut.getWindowLevel();
    if (!wl.equals(lutWl)) {
      // set lut window level
      wlut.setWindowLevel(wl);
      wlut.update();
      // fire change event
      if (!lutWl || lutWl.getWidth() !== wl.getWidth()) {
        this.fireEvent({
          type: 'wlwidthchange',
          value: [wl.getWidth()],
          wc: wl.getCenter(),
          ww: wl.getWidth(),
          skipGenerate: true
        });
      }
      if (!lutWl || lutWl.getCenter() !== wl.getCenter()) {
        this.fireEvent({
          type: 'wlcenterchange',
          value: [wl.getCenter()],
          wc: wl.getCenter(),
          ww: wl.getWidth(),
          skipGenerate: true
        });
      }
    }

    // return
    return wlut;
  };
  /**
   * Add the window LUT to the list.
   *
   * @param {Window} wlut The window LUT of the image.
   */
  this.addWindowLut = function (wlut) {
    var rsi = wlut.getRescaleLut().getRSI();
    windowLuts[rsi.toString()] = wlut;
  };

  /**
   * Get the window presets.
   *
   * @returns {object} The window presets.
   */
  this.getWindowPresets = function () {
    return windowPresets;
  };

  /**
   * Get the window presets names.
   *
   * @returns {object} The list of window presets names.
   */
  this.getWindowPresetsNames = function () {
    return Object.keys(windowPresets);
  };

  /**
   * Set the window presets.
   *
   * @param {object} presets The window presets.
   */
  this.setWindowPresets = function (presets) {
    windowPresets = presets;
  };

  /**
   * Set the default colour map.
   *
   * @param {object} map The colour map.
   */
  this.setDefaultColourMap = function (map) {
    colourMap = map;
  };

  /**
   * Add window presets to the existing ones.
   *
   * @param {object} presets The window presets.
   * @param {number} k The slice the preset belong to.
   */
  this.addWindowPresets = function (presets, k) {
    var keys = Object.keys(presets);
    var key = null;
    for (var i = 0; i < keys.length; ++i) {
      key = keys[i];
      if (typeof windowPresets[key] !== 'undefined') {
        if (typeof windowPresets[key].perslice !== 'undefined' &&
                    windowPresets[key].perslice === true) {
          // use first new preset wl...
          windowPresets[key].wl.splice(k, 0, presets[key].wl[0]);
        } else {
          windowPresets[key] = presets[key];
        }
      } else {
        // add new
        windowPresets[key] = presets[key];
        // fire event
        /**
         * Window/level add preset event.
         *
         * @event dwv.image.View#wlpresetadd
         * @type {object}
         * @property {string} name The name of the preset.
         */
        this.fireEvent({
          type: 'wlpresetadd',
          name: key
        });
      }
    }
  };

  /**
   * Get the colour map of the image.
   *
   * @returns {object} The colour map of the image.
   */
  this.getColourMap = function () {
    return colourMap;
  };
  /**
   * Set the colour map of the image.
   *
   * @param {object} map The colour map of the image.
   * @fires dwv.image.View#colorchange
   */
  this.setColourMap = function (map) {
    colourMap = map;
    /**
     * Color change event.
     *
     * @event dwv.image.View#colorchange
     * @type {object}
     * @property {Array} value The changed value.
     * @property {number} wc The new window center value.
     * @property {number} ww The new window wdth value.
     */
    this.fireEvent({
      type: 'colorchange',
      wc: this.getCurrentWindowLut().getWindowLevel().getCenter(),
      ww: this.getCurrentWindowLut().getWindowLevel().getWidth()
    });
  };

  /**
   * Get the current position.
   *
   * @returns {object} The current position.
   */
  this.getCurrentPosition = function () {
    // return a clone to avoid reference problems
    return currentPosition ? {
      i: currentPosition.i,
      j: currentPosition.j,
      k: currentPosition.k
    } : null;
  };
  /**
   * Set the current position.
   *
   * @param {object} pos The current position.
   * @param {boolean} silent If true, does not fire a slicechange event.
   * @returns {boolean} False if not in bounds
   * @fires dwv.image.View#slicechange
   * @fires dwv.image.View#positionchange
   */
  this.setCurrentPosition = function (pos, silent) {
    // check input
    if (typeof silent === 'undefined') {
      silent = false;
    }

    // check if possible
    if (!image.getGeometry().getSize().isInBounds(pos.i, pos.j, pos.k)) {
      return false;
    }
    // check if new
    var equalPos = function (pos1, pos2) {
      return pos2 !== null &&
        pos1.i === pos2.i &&
        pos1.j === pos2.j &&
        pos1.k === pos2.k;
    };
    var isNew = !equalPos(pos, currentPosition);

    if (isNew) {
      var isNewSlice = currentPosition
        ? pos.k !== currentPosition.k : true;
      // assign
      currentPosition = pos;

      // fire a 'positionchange' event
      if (image.getPhotometricInterpretation().match(/MONOCHROME/) !== null) {
        var pixValue = image.getRescaledValue(
          pos.i, pos.j, pos.k, this.getCurrentFrame());
        /**
         * Position change event.
         *
         * @event dwv.image.View#positionchange
         * @type {object}
         * @property {Array} value The changed value.
         * @property {number} i The new column position
         * @property {number} j The new row position
         * @property {number} k The new slice position
         * @property {object} pixelValue The image value at the new position,
         *   (can be undefined).
         */
        this.fireEvent({
          type: 'positionchange',
          value: [pos.i, pos.j, pos.k, pixValue],
          i: pos.i,
          j: pos.j,
          k: pos.k,
          pixelValue: pixValue
        });
      } else {
        this.fireEvent({
          type: 'positionchange',
          value: [pos.i, pos.j, pos.k],
          i: pos.i,
          j: pos.j,
          k: pos.k
        });
      }

      // fire a slice change event (used to trigger redraw)
      if (!silent && isNewSlice) {
        /**
         * Slice change event.
         *
         * @event dwv.image.View#slicechange
         * @type {object}
         * @property {Array} value The changed value.
         * @property {object} data Associated event data: the imageUid.
         */
        this.fireEvent({
          type: 'slicechange',
          value: [currentPosition.k],
          data: {
            imageUid: image.getImageUids()[currentPosition.k]
          }
        });
      }
    }

    // all good
    return true;
  };

  /**
   * Get the current frame number.
   *
   * @returns {number} The current frame number.
   */
  this.getCurrentFrame = function () {
    return currentFrame;
  };

  /**
   * Set the current frame number.
   *
   * @param {number} frame The current frame number.
   * @param {boolean} silent Flag to launch events with skipGenerate.
   * @returns {boolean} False if not in bounds
   * @fires dwv.image.View#framechange
   */
  this.setCurrentFrame = function (frame, silent) {
    // check input
    if (typeof silent === 'undefined') {
      silent = false;
    }

    // check if possible
    if (frame < 0 || frame >= image.getNumberOfFrames()) {
      return false;
    }
    // check if new
    var isNew = currentFrame !== frame;

    if (isNew) {
      // assign
      currentFrame = frame;
      // fire event for multi frame data
      if (image.getNumberOfFrames() !== 1) {
        /**
         * Frame change event.
         *
         * @event dwv.image.View#framechange
         * @type {object}
         * @property {Array} value The changed value.
         * @property {number} frame The new frame number
         * @property {boolean} skipGenerate Flag to skip view generation.
         */
        this.fireEvent({
          type: 'framechange',
          value: [currentFrame],
          frame: currentFrame,
          skipGenerate: silent
        });
      }
    }
    // all good
    return true;
  };

  /**
   * Set the view window/level.
   *
   * @param {number} center The window center.
   * @param {number} width The window width.
   * @param {string} name Associated preset name, defaults to 'manual'.
   * Warning: uses the latest set rescale LUT or the default linear one.
   * @param {boolean} silent Flag to launch events with skipGenerate.
   * @fires dwv.image.View#wlwidthchange
   * @fires dwv.image.View#wlcenterchange
   */
  this.setWindowLevel = function (center, width, name, silent) {
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
    var newWl = new dwv.image.WindowLevel(center, width);

    // check if new
    var isNew = !newWl.equals(currentWl);

    // compare to previous if present
    if (isNew) {
      var isNewWidth = currentWl ? currentWl.getWidth() !== width : true;
      var isNewCenter = currentWl ? currentWl.getCenter() !== center : true;
      // assign
      currentWl = newWl;
      currentPresetName = name;

      if (isNewWidth) {
        /**
         * Window/level width change event.
         *
         * @event dwv.image.View#wlwidthchange
         * @type {object}
         * @property {Array} value The changed value.
         * @property {number} wc The new window center value.
         * @property {number} ww The new window wdth value.
         * @property {boolean} skipGenerate Flag to skip view generation.
         */
        this.fireEvent({
          type: 'wlwidthchange',
          value: [width],
          wc: center,
          ww: width,
          skipGenerate: silent
        });
      }

      if (isNewCenter) {
        /**
         * Window/level center change event.
         *
         * @event dwv.image.View#wlcenterchange
         * @type {object}
         * @property {Array} value The changed value.
         * @property {number} wc The new window center value.
         * @property {number} ww The new window wdth value.
         * @property {boolean} skipGenerate Flag to skip view generation.
         */
        this.fireEvent({
          type: 'wlcenterchange',
          value: [center],
          wc: center,
          ww: width,
          skipGenerate: silent
        });
      }
    }
  };

  /**
   * Set the window level to the preset with the input name.
   *
   * @param {string} name The name of the preset to activate.
   * @param {boolean} silent Flag to launch events with skipGenerate.
   */
  this.setWindowLevelPreset = function (name, silent) {
    var preset = this.getWindowPresets()[name];
    if (typeof preset === 'undefined') {
      throw new Error('Unknown window level preset: \'' + name + '\'');
    }
    // special min/max
    if (name === 'minmax' && typeof preset.wl === 'undefined') {
      preset.wl = this.getWindowLevelMinMax();
    }
    // special 'perslice' case
    if (typeof preset.perslice !== 'undefined' &&
      preset.perslice === true) {
      preset = {wl: preset.wl[this.getCurrentPosition().k]};
    }
    // set w/l
    this.setWindowLevel(
      preset.wl.getCenter(), preset.wl.getWidth(), name, silent);
  };

  /**
   * Set the window level to the preset with the input id.
   *
   * @param {number} id The id of the preset to activate.
   * @param {boolean} silent Flag to launch events with skipGenerate.
   */
  this.setWindowLevelPresetById = function (id, silent) {
    var keys = Object.keys(this.getWindowPresets());
    this.setWindowLevelPreset(keys[id], silent);
  };

  /**
   * Clone the image using all meta data and the original data buffer.
   *
   * @returns {dwv.image.View} A full copy of this {dwv.image.View}.
   */
  this.clone = function () {
    var copy = new dwv.image.View(this.getImage());
    for (var key in windowLuts) {
      copy.addWindowLut(windowLuts[key]);
    }
    copy.setListeners(this.getListeners());
    return copy;
  };

  /**
   * View listeners
   *
   * @private
   * @type {object}
   */
  var listeners = {};
  /**
   * Get the view listeners.
   *
   * @returns {object} The view listeners.
   */
  this.getListeners = function () {
    return listeners;
  };
  /**
   * Set the view listeners.
   *
   * @param {object} list The view listeners.
   */
  this.setListeners = function (list) {
    listeners = list;
  };
};

/**
 * Get the image window/level that covers the full data range.
 * Warning: uses the latest set rescale LUT or the default linear one.
 *
 * @returns {object} A min/max window level.
 */
dwv.image.View.prototype.getWindowLevelMinMax = function () {
  var range = this.getImage().getRescaledDataRange();
  var min = range.min;
  var max = range.max;
  var width = max - min;
  // full black / white images, defaults to 1.
  if (width < 1) {
    dwv.logger.warn('Zero or negative width, defaulting to one.');
    width = 1;
  }
  var center = min + width / 2;
  return new dwv.image.WindowLevel(center, width);
};

/**
 * Set the image window/level to cover the full data range.
 * Warning: uses the latest set rescale LUT or the default linear one.
 */
dwv.image.View.prototype.setWindowLevelMinMax = function () {
  // calculate center and width
  var wl = this.getWindowLevelMinMax();
  // set window level
  this.setWindowLevel(wl.getCenter(), wl.getWidth(), 'minmax');
};

/**
 * Generate display image data to be given to a canvas.
 *
 * @param {Array} array The array to fill in.
 */
dwv.image.View.prototype.generateImageData = function (array) {
  // check position (also sets frame)
  if (!this.getCurrentPosition()) {
    this.setInitialPosition();
  }
  var position = this.getCurrentPosition();
  var frame = this.getCurrentFrame();
  var image = this.getImage();
  var iterator = image.getSliceIterator(position.k, frame);

  var photoInterpretation = image.getPhotometricInterpretation();
  switch (photoInterpretation) {
  case 'MONOCHROME1':
  case 'MONOCHROME2':
    dwv.image.generateImageDataMonochrome(
      array,
      iterator,
      this.getCurrentWindowLut(),
      this.getColourMap()
    );
    break;

  case 'PALETTE COLOR':
    dwv.image.generateImageDataPaletteColor(
      array,
      iterator,
      this.getColourMap(),
      image.getMeta().BitsStored === 16
    );
    break;

  case 'RGB':
    dwv.image.generateImageDataRgb(
      array,
      iterator,
      this.getCurrentWindowLut()
    );
    break;

  case 'YBR_FULL':
    dwv.image.generateImageDataYbrFull(
      array,
      iterator
    );
    break;

  default:
    throw new Error(
      'Unsupported photometric interpretation: ' + photoInterpretation);
  }
};

/**
 * Add an event listener on the view.
 *
 * @param {string} type The event type.
 * @param {object} listener The method associated with the provided event type.
 */
dwv.image.View.prototype.addEventListener = function (type, listener) {
  var listeners = this.getListeners();
  if (!listeners[type]) {
    listeners[type] = [];
  }
  listeners[type].push(listener);
};

/**
 * Remove an event listener on the view.
 *
 * @param {string} type The event type.
 * @param {object} listener The method associated with the provided event type.
 */
dwv.image.View.prototype.removeEventListener = function (type, listener) {
  var listeners = this.getListeners();
  if (!listeners[type]) {
    return;
  }
  for (var i = 0; i < listeners[type].length; ++i) {
    if (listeners[type][i] === listener) {
      listeners[type].splice(i, 1);
    }
  }
};

/**
 * Fire an event: call all associated listeners.
 *
 * @param {object} event The event to fire.
 */
dwv.image.View.prototype.fireEvent = function (event) {
  var listeners = this.getListeners();
  if (!listeners[event.type]) {
    return;
  }
  for (var i = 0; i < listeners[event.type].length; ++i) {
    listeners[event.type][i](event);
  }
};
