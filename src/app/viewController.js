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

  // check view
  if (typeof view.getImage() === 'undefined') {
    throw new Error('View does not have an image, cannot setup controller');
  }

  // setup the plane helper
  var planeHelper = new dwv.image.PlaneHelper(
    view.getImage().getGeometry().getRealSpacing(),
    view.getImage().getGeometry().getOrientation(),
    view.getOrientation()
  );

  /**
   * Get the plane helper.
   *
   * @returns {object} The helper.
   */
  this.getPlaneHelper = function () {
    return planeHelper;
  };

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
   * @returns {dwv.math.Point} The position.
   */
  this.getCurrentPosition = function () {
    return view.getCurrentPosition();
  };

  /**
   * Get the current index.
   *
   * @returns {dwv.math.Index} The current index.
   */
  this.getCurrentIndex = function () {
    return view.getCurrentIndex();
  };

  /**
   * Get the current oriented position.
   *
   * @returns {dwv.math.Point} The position.
   */
  this.getCurrentOrientedIndex = function () {
    var res = view.getCurrentIndex();
    // values = orientation * orientedValues
    // -> inv(orientation) * values = orientedValues
    if (typeof view.getOrientation() !== 'undefined') {
      var index3D = new dwv.math.Index(
        [res.get(0), res.get(1), res.get(2)]);
      var orientedIndex3D =
         view.getOrientation().getInverse().getAbs().multiplyIndex3D(index3D);
      var values = orientedIndex3D.getValues();
      res = new dwv.math.Index(values);
    }
    return res;
  };

  /**
   * Get the scroll index.
   *
   * @returns {number} The index.
   */
  this.getScrollIndex = function () {
    return view.getScrollIndex();
  };

  /**
   * Get the current scroll index value.
   *
   * @returns {object} The value.
   */
  this.getCurrentScrollIndexValue = function () {
    return view.getCurrentIndex().get(view.getScrollIndex());
  };

  this.getOrigin = function (position) {
    return view.getOrigin(position);
  };

  /**
   * Get the current scroll position value.
   *
   * @returns {object} The value.
   */
  this.getCurrentScrollPosition = function () {
    var scrollIndex = view.getScrollIndex();
    return view.getCurrentPosition().get(scrollIndex);
  };

  /**
   * Generate display image data to be given to a canvas.
   *
   * @param {Array} array The array to fill in.
   * @param {dwv.math.Point} position Optional position at which to generate,
   *   otherwise generates at current position.
   */
  this.generateImageData = function (array, position) {
    view.generateImageData(array, position);
  };

  /**
   * Set the associated image.
   *
   * @param {Image} img The associated image.
   */
  this.setImage = function (img) {
    view.setImage(img);
  };

  /**
   * Get the current spacing.
   *
   * @returns {Array} The 2D spacing.
   */
  this.get2DSpacing = function () {
    var spacing = view.getImage().getGeometry().getSpacing();
    return [spacing.get(0), spacing.get(1)];
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
    var position = this.getCurrentIndex();
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
      var spacingValues = orientedSpacing.getValues();
      spacingValues[2] = 1;
      var sliceSpacing = new dwv.image.Spacing(spacingValues);
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
      this.getCurrentIndex(),
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
   * @returns {boolean} True if the data has either the third dimension
   * or above greater than one.
   */
  this.canScroll = function () {
    return view.getImage().canScroll(view.getOrientation());
  };

  /**
   * Get the image size.
   *
   * @returns {dwv.image.Size} The size.
   */
  this.getImageSize = function () {
    return view.getImage().getGeometry().getSize(view.getOrientation());
  };

  /**
   * Get the image world (mm) 2D size.
   *
   * @returns {object} The 2D size as {x,y}.
   */
  this.getImageWorldSize = function () {
    var geometry = view.getImage().getGeometry();
    var size = geometry.getSize(view.getOrientation()).get2D();
    var spacing = geometry.getSpacing(view.getOrientation()).get2D();
    return {
      x: size.x * spacing.x,
      y: size.y * spacing.y
    };
  };

  /**
   * Get the image rescaled data range.
   *
   * @returns {object} The range as {min, max}.
   */
  this.getImageRescaledDataRange = function () {
    return view.getImage().getRescaledDataRange();
  };

  /**
   * Compare the input meta data to the associated image one.
   *
   * @param {object} meta The meta data.
   * @returns {boolean} True if the associated image has equal meta data.
   */
  this.equalImageMeta = function (meta) {
    var imageMeta = view.getImage().getMeta();
    // loop through input meta keys
    var metaKeys = Object.keys(meta);
    for (var i = 0; i < metaKeys.length; ++i) {
      var metaKey = metaKeys[i];
      if (typeof imageMeta[metaKey] === 'undefined') {
        return false;
      }
      if (imageMeta[metaKey] !== meta[metaKey]) {
        return false;
      }
    }
    return true;
  };

  /**
   * Check is the provided position can be set.
   *
   * @param {dwv.math.Point} position The position.
   * @returns {boolean} True is the position is in bounds.
   */
  this.canSetPosition = function (position) {
    return view.canSetPosition(position);
  };

  /**
   * Set the current position.
   *
   * @param {dwv.math.Point} pos The position.
   * @param {boolean} silent If true, does not fire a positionchange event.
   * @returns {boolean} False if not in bounds.
   */
  this.setCurrentPosition = function (pos, silent) {
    return view.setCurrentPosition(pos, silent);
  };

  /**
   * Set the current 2D (x,y) position.
   *
   * @param {number} x The column position.
   * @param {number} y The row position.
   * @returns {boolean} False if not in bounds.
   */
  this.setCurrentPosition2D = function (x, y) {
    // keep third direction
    var k = this.getCurrentScrollIndexValue();
    var planePoint = new dwv.math.Point3D(x, y, k);
    // de-orient
    var point = planeHelper.getImageOrientedVector3D(planePoint);
    // ~indexToWorld to not loose precision
    var geometry = view.getImage().getGeometry();
    var point3D = geometry.pointToWorld(point);
    // merge with current position to keep extra dimensions
    var position = this.getCurrentPosition().mergeWith3D(point3D);

    return view.setCurrentPosition(position);
  };

  /**
   * Set the current index.
   *
   * @param {dwv.math.Index} index The index.
   * @param {boolean} silent If true, does not fire a positionchange event.
   * @returns {boolean} False if not in bounds.
   */
  this.setCurrentIndex = function (index, silent) {
    return view.setCurrentIndex(index, silent);
  };

  /**
   * Get a 3D position from a plane 2D position.
   *
   * @param {dwv.math.Point2D} point2D The 2D position as {x,y}.
   * @returns {dwv.math.Point} The 3D point.
   */
  this.getPositionFromPlanePoint = function (point2D) {
    // keep third direction
    var k = this.getCurrentScrollIndexValue();
    var planePoint = new dwv.math.Point3D(point2D.x, point2D.y, k);
    // de-orient
    var point = planeHelper.getImageOrientedVector3D(planePoint);
    // ~indexToWorld to not loose precision
    var geometry = view.getImage().getGeometry();
    var point3D = geometry.pointToWorld(point);
    // merge with current position to keep extra dimensions
    return this.getCurrentPosition().mergeWith3D(point3D);
  };

  /**
   * Get a plane 3D position from a plane 2D position: does not compensate
   *   for the image origin. Needed for setting the scale center...
   *
   * @param {dwv.math.Point2D} point2D The 2D position as {x,y}.
   * @returns {dwv.math.Point3D} The 3D point.
   */
  this.getPlanePositionFromPlanePoint = function (point2D) {
    // keep third direction
    var k = this.getCurrentScrollIndexValue();
    var planePoint = new dwv.math.Point3D(point2D.x, point2D.y, k);
    // de-orient
    var point = planeHelper.getTargetDeOrientedVector3D(planePoint);
    // ~indexToWorld to not loose precision
    var geometry = view.getImage().getGeometry();
    var spacing = geometry.getRealSpacing();
    return new dwv.math.Point3D(
      point.getX() * spacing.get(0),
      point.getY() * spacing.get(1),
      point.getZ() * spacing.get(2));
  };

  /**
   * Get a 3D offset from a plane one.
   *
   * @param {object} offset2D The plane offset as {x,y}.
   * @returns {dwv.math.Vector3D} The 3D world offset.
   */
  this.getOffset3DFromPlaneOffset = function (offset2D) {
    return planeHelper.getOffset3DFromPlaneOffset(offset2D);
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
   * Scroll play: loop through all slices.
   */
  this.play = function () {
    // ensure data is scrollable: dim >= 3
    if (!this.canScroll()) {
      return;
    }
    if (playerID === null) {
      var image = view.getImage();
      var recommendedDisplayFrameRate =
        image.getMeta().RecommendedDisplayFrameRate;
      var milliseconds = view.getPlaybackMilliseconds(
        recommendedDisplayFrameRate);
      var size = image.getGeometry().getSize();
      var canScroll3D = size.canScroll3D();

      playerID = setInterval(function () {
        var canDoMore = false;
        if (canScroll3D) {
          canDoMore = self.incrementScrollIndex();
        } else {
          canDoMore = self.incrementIndex(3);
        }
        // end of scroll, loop back
        if (!canDoMore) {
          var pos1 = self.getCurrentIndex();
          var values = pos1.getValues();
          var orientation = view.getOrientation();
          if (canScroll3D) {
            values[orientation.getThirdColMajorDirection()] = 0;
          } else {
            values[3] = 0;
          }
          var index = new dwv.math.Index(values);
          var geometry = view.getImage().getGeometry();
          self.setCurrentPosition(geometry.indexToWorld(index));
        }
      }, milliseconds);
    } else {
      this.stop();
    }
  };

  /**
   * Stop scroll playing.
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
   * Set the view per value alpha function.
   *
   * @param {Function} func The function.
   */
  this.setViewAlphaFunction = function (func) {
    view.setAlphaFunction(func);
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
