// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * List of view event names.
 *
 * @type {Array}
 */
dwv.image.viewEventNames = [
  'wlwidthchange',
  'wlcenterchange',
  'wlpresetadd',
  'colourchange',
  'positionchange'
];

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
   * Listener handler.
   *
   * @type {object}
   * @private
   */
  var listenerHandler = new dwv.utils.ListenerHandler();

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
    this.setCurrentPosition(
      new dwv.math.Index([0, 0, 0, 0]),
      silent
    );
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
    // check position
    if (!this.getCurrentPosition()) {
      this.setInitialPosition();
    }
    var sliceNumber = this.getCurrentPosition().get(2);
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
        fireEvent({
          type: 'wlwidthchange',
          value: [wl.getWidth()],
          wc: wl.getCenter(),
          ww: wl.getWidth(),
          skipGenerate: true
        });
      }
      if (!lutWl || lutWl.getCenter() !== wl.getCenter()) {
        fireEvent({
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
        fireEvent({
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
   * @fires dwv.image.View#colourchange
   */
  this.setColourMap = function (map) {
    colourMap = map;
    /**
     * Color change event.
     *
     * @event dwv.image.View#colourchange
     * @type {object}
     * @property {Array} value The changed value.
     * @property {number} wc The new window center value.
     * @property {number} ww The new window wdth value.
     */
    fireEvent({
      type: 'colourchange',
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
    return currentPosition;
  };

  /**
   * Get the current position.
   *
   * @returns {object} The current position.
   */
  this.getCurrentPositionAsObject = function () {
    // return a clone to avoid reference problems
    return currentPosition ? {
      i: currentPosition.get(0),
      j: currentPosition.get(1),
      k: currentPosition.get(2)
    } : null;
  };

  /**
   * Set the current position.
   *
   * @param {object} pos The current position.
   */
  this.setCurrentPositionFromObject = function (pos) {
    var frame = 0;
    if (typeof pos.f !== 'undefined') {
      frame = pos.f;
    }
    var posIndex = new dwv.math.Index([pos.i, pos.j, pos.k, frame]);
    this.setCurrentPosition(posIndex, true);
  };

  /**
   * Set the current position.
   *
   * @param {object} posIndex The current position.
   * @param {boolean} silent Flag to fire event or not.
   * @returns {boolean} False if not in bounds
   * @fires dwv.image.View#positionchange
   */
  this.setCurrentPosition = function (posIndex, silent) {
    // check input
    if (typeof silent === 'undefined') {
      silent = false;
    }

    // check if possible
    if (!image.getGeometry().getSize().isInBounds(posIndex)) {
      return false;
    }

    var isNew = !currentPosition || !currentPosition.equals(posIndex);

    if (isNew) {
      var diffDims = null;
      if (currentPosition) {
        diffDims = currentPosition.differentDims(posIndex);
      } else {
        diffDims = [0, 1, 2, 3];
      }

      // assign
      currentPosition = posIndex;

      if (!silent) {
        var eventValue = [
          posIndex.get(0),
          posIndex.get(1),
          posIndex.get(2)
        ];
        if (posIndex.length() === 3) {
          eventValue.push(posIndex.get(3));
        }

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
        var posEvent = {
          type: 'positionchange',
          value: eventValue,
          i: posIndex.get(0),
          j: posIndex.get(1),
          k: posIndex.get(2),
          diffDims: diffDims
        };
        if (posIndex.length() === 3) {
          posEvent.f = posIndex.get(3);
        }

        // add value if possible
        if (image.canQuantify()) {
          var pixValue = image.getRescaledValueAtIndex(posIndex);
          eventValue.push(pixValue);
          posEvent.pixelValue = pixValue;
        }

        // fire
        fireEvent(posEvent);
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
        fireEvent({
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
        fireEvent({
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
      preset = {wl: preset.wl[this.getCurrentPosition().get(2)]};
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
   * Add an event listener to this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type, will be called with the fired event.
   */
  this.addEventListener = function (type, callback) {
    listenerHandler.add(type, callback);
  };

  /**
   * Remove an event listener from this class.
   *
   * @param {string} type The event type.
   * @param {object} callback The method associated with the provided
   *   event type.
   */
  this.removeEventListener = function (type, callback) {
    listenerHandler.remove(type, callback);
  };

  /**
   * Fire an event: call all associated listeners with the input event object.
   *
   * @param {object} event The event to fire.
   * @private
   */
  function fireEvent(event) {
    listenerHandler.fireEvent(event);
  }
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
  // check position
  if (!this.getCurrentPosition()) {
    this.setInitialPosition();
  }
  var image = this.getImage();
  var position = this.getCurrentPosition();
  var iterator = dwv.image.getSliceIterator(image, position);

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
