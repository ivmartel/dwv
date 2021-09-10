// namespaces
var dwv = dwv || {};
dwv.ctrl = dwv.ctrl || {};

/**
 * View controller.
 *
 * @param {dwv.image.View} view The associated view.
 * @class
 */
dwv.ctrl.ViewController = function (view) {
  // closure to self
  var self = this;
  // third dimension player ID (created by setInterval)
  var playerID = null;

  /**
   * Initialise the controller.
   */
  this.initialise = function () {
    // set window/level to first preset
    this.setWindowLevelPresetById(0);
    // default position
    this.setCurrentPosition2D(0, 0);
  };

  /**
   * Get the window/level presets names.
   *
   * @returns {Array} The presets names.
   */
  this.getWindowLevelPresetsNames = function () {
    return view.getWindowPresetsNames();
  };

  /**
   * Add window/level presets to the view.
   *
   * @param {object} presets A preset object.
   * @returns {object} The list of presets.
   */
  this.addWindowLevelPresets = function (presets) {
    return view.addWindowPresets(presets);
  };

  /**
   * Set the window level to the preset with the input name.
   *
   * @param {string} name The name of the preset to activate.
   */
  this.setWindowLevelPreset = function (name) {
    view.setWindowLevelPreset(name);
  };

  /**
   * Set the window level to the preset with the input id.
   *
   * @param {number} id The id of the preset to activate.
   */
  this.setWindowLevelPresetById = function (id) {
    view.setWindowLevelPresetById(id);
  };

  /**
   * Check if the controller is playing.
   *
   * @returns {boolean} True if the controler is playing.
   */
  this.isPlaying = function () {
    return (playerID !== null);
  };

  /**
   * Get the current position.
   *
   * @returns {object} The position.
   */
  this.getCurrentPosition = function () {
    return view.getCurrentPosition();
  };

  /**
   * Get the current scroll position.
   *
   * @returns {object} The position.
   */
  this.getCurrentScrollPosition = function () {
    return view.getCurrentPosition().get(view.getScrollIndex());
  };

  /**
   * Get the current spacing.
   *
   * @returns {Array} The 2D spacing.
   */
  this.get2DSpacing = function () {
    var spacing = view.getImage().getGeometry().getSpacing();
    return [spacing.getColumnSpacing(), spacing.getRowSpacing()];
  };

  /**
   * Get some values from the associated image in a region.
   *
   * @param {dwv.math.Point2D} min Minimum point.
   * @param {dwv.math.Point2D} max Maximum point.
   * @returns {Array} A list of values.
   */
  this.getImageRegionValues = function (min, max) {
    var image = view.getImage();
    var orientation = view.getOrientation();
    var position = this.getCurrentPosition();
    var rescaled = true;

    // created oriented slice if needed
    if (!dwv.math.isIdentityMat33(orientation)) {
      // generate slice values
      var sliceIter = dwv.image.getSliceIterator(
        image,
        position,
        rescaled,
        orientation
      );
      var sliceValues = dwv.image.getIteratorValues(sliceIter);
      // oriented geometry
      var orientedSize = image.getGeometry().getSize(orientation);
      var sizeValues = orientedSize.getValues();
      sizeValues[2] = 1;
      var sliceSize = new dwv.image.Size(sizeValues);
      var orientedSpacing = image.getGeometry().getSpacing(orientation);
      var sliceSpacing = new dwv.image.Spacing(
        orientedSpacing.getColumnSpacing(),
        orientedSpacing.getRowSpacing(),
        1
      );
      var sliceOrigin = new dwv.math.Point3D(0, 0, 0);
      var sliceGeometry =
        new dwv.image.Geometry(sliceOrigin, sliceSize, sliceSpacing);
      // slice image
      image = new dwv.image.Image(sliceGeometry, sliceValues);
      // update position
      position = new dwv.math.Index([0, 0, 0]);
      rescaled = false;
    }

    // get region values
    var iter = dwv.image.getRegionSliceIterator(
      image, position, rescaled, min, max);
    var values = [];
    if (iter) {
      values = dwv.image.getIteratorValues(iter);
    }
    return values;
  };

  /**
   * Get some values from the associated image in variable regions.
   *
   * @param {Array} regions A list of regions.
   * @returns {Array} A list of values.
   */
  this.getImageVariableRegionValues = function (regions) {
    var iter = dwv.image.getVariableRegionSliceIterator(
      view.getImage(),
      this.getCurrentPosition(),
      true, regions
    );
    var values = [];
    if (iter) {
      values = dwv.image.getIteratorValues(iter);
    }
    return values;
  };

  /**
   * Can the image values be quantified?
   *
   * @returns {boolean} True if possible.
   */
  this.canQuantifyImage = function () {
    return view.getImage().canQuantify();
  };

  /**
   * Can window and level be applied to the data?
   *
   * @returns {boolean} True if possible.
   */
  this.canWindowLevel = function () {
    return view.getImage().canWindowLevel();
  };

  /**
   * Can the data be scrolled?
   *
   * @returns {boolean} True if the data has a third dimension greater than one.
   */
  this.canScroll = function () {
    return view.getImage().canScroll(view.getOrientation());
  };

  /**
   * Set the current position.
   *
   * @param {object} pos The position.
   * @param {boolean} silent If true, does not fire a positionchange event.
   * @returns {boolean} False if not in bounds.
   */
  this.setCurrentPosition = function (pos, silent) {
    return view.setCurrentPosition(pos, silent);
  };

  /**
   * Set the current 2D (i,j) position.
   *
   * @param {number} i The column index.
   * @param {number} j The row index.
   * @returns {boolean} False if not in bounds.
   */
  this.setCurrentPosition2D = function (i, j) {
    // keep third direction
    var k = this.getCurrentScrollPosition();
    var posPlane = new dwv.math.Index([i, j, k]);
    var pos3D = posPlane;
    var orientation = view.getOrientation();
    if (typeof orientation !== 'undefined') {
      // abs? otherwise negative position...
      // pos3D = orientation * posPlane
      pos3D = orientation.getAbs().multiplyIndex3D(posPlane);
    }
    return view.setCurrentPosition(pos3D);
  };

  /**
   * Increment the provided dimension.
   *
   * @param {number} dim The dimension to increment.
   * @param {boolean} silent Do not send event.
   * @returns {boolean} False if not in bounds.
   */
  this.incrementIndex = function (dim, silent) {
    return view.incrementIndex(dim, silent);
  };

  /**
   * Decrement the provided dimension.
   *
   * @param {number} dim The dimension to increment.
   * @param {boolean} silent Do not send event.
   * @returns {boolean} False if not in bounds.
   */
  this.decrementIndex = function (dim, silent) {
    return view.decrementIndex(dim, silent);
  };

  /**
   * Decrement the scroll dimension index.
   *
   * @param {boolean} silent Do not send event.
   * @returns {boolean} False if not in bounds.
   */
  this.decrementScrollIndex = function (silent) {
    return view.decrementScrollIndex(silent);
  };

  /**
   * Increment the scroll dimension index.
   *
   * @param {boolean} silent Do not send event.
   * @returns {boolean} False if not in bounds.
   */
  this.incrementScrollIndex = function (silent) {
    return view.incrementScrollIndex(silent);
  };

  /**
   *
   */
  this.play = function () {
    if (!this.canScroll()) {
      return;
    }
    if (playerID === null) {
      var recommendedDisplayFrameRate =
        view.getImage().getMeta().RecommendedDisplayFrameRate;
      var milliseconds = view.getPlaybackMilliseconds(
        recommendedDisplayFrameRate);

      playerID = setInterval(function () {
        // end of scroll, loop back
        if (!self.incrementScrollIndex()) {
          var pos1 = self.getCurrentPosition();
          var values = pos1.getValues();
          var orientation = view.getOrientation();
          values[orientation.getThirdColMajorDirection()] = 0;
          self.setCurrentPosition(new dwv.math.Index(values));
        }
      }, milliseconds);
    } else {
      this.stop();
    }
  };

  /**
   *
   */
  this.stop = function () {
    if (playerID !== null) {
      clearInterval(playerID);
      playerID = null;
    }
  };

  /**
   * Get the window/level.
   *
   * @returns {object} The window center and width.
   */
  this.getWindowLevel = function () {
    return {
      width: view.getCurrentWindowLut().getWindowLevel().getWidth(),
      center: view.getCurrentWindowLut().getWindowLevel().getCenter()
    };
  };

  /**
   * Set the window/level.
   *
   * @param {number} wc The window center.
   * @param {number} ww The window width.
   */
  this.setWindowLevel = function (wc, ww) {
    view.setWindowLevel(wc, ww);
  };

  /**
   * Get the colour map.
   *
   * @returns {object} The colour map.
   */
  this.getColourMap = function () {
    return view.getColourMap();
  };

  /**
   * Set the colour map.
   *
   * @param {object} colourMap The colour map.
   */
  this.setColourMap = function (colourMap) {
    view.setColourMap(colourMap);
  };

  /**
   * Set the colour map from a name.
   *
   * @param {string} name The name of the colour map to set.
   */
  this.setColourMapFromName = function (name) {
    // check if we have it
    if (!dwv.tool.colourMaps[name]) {
      throw new Error('Unknown colour map: \'' + name + '\'');
    }
    // enable it
    this.setColourMap(dwv.tool.colourMaps[name]);
  };

}; // class ViewController
