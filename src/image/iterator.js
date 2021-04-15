// namespaces
var dwv = dwv || {};
dwv.image = dwv.image || {};

/**
 * Get an iterator for a given range for a one component data.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 * @param {Function} dataAccessor Function to access data.
 * @param {number} start The start of the range (included).
 * @param {number} end The end of the range (excluded).
 * @param {number} increment The increment between indicies (default=1).
 * @returns {object} An iterator folowing the iterator and iterable protocol.
 */
dwv.image.range = function (dataAccessor, start, end, increment) {
  if (typeof increment === 'undefined') {
    increment = 1;
  }
  var nextIndex = start;
  // result
  return {
    next: function () {
      if (nextIndex < end) {
        var result = {
          value: dataAccessor(nextIndex),
          done: false
        };
        nextIndex += increment;
        return result;
      }
      return {
        done: true,
        index: end
      };
    }
  };
};

/**
 * Get an iterator for a given range with bounds (for a one component data).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 * @param {Function} dataAccessor Function to access data.
 * @param {number} start The start of the range (included).
 * @param {number} end The end of the range (excluded).
 * @param {number} increment The increment between indicies.
 * @param {number} regionSize The size of the region to iterate through.
 * @param {number} regionOffset The offset between regions.
 * @returns {object} An iterator folowing the iterator and iterable protocol.
 */
dwv.image.rangeRegion = function (
  dataAccessor, start, end, increment, regionSize, regionOffset) {
  var nextIndex = start;
  var regionElementCount = 0;
  // result
  return {
    next: function () {
      if (nextIndex < end) {
        var result = {
          value: dataAccessor(nextIndex),
          done: false
        };
        regionElementCount += 1;
        nextIndex += increment;
        if (regionElementCount === regionSize) {
          regionElementCount = 0;
          nextIndex += regionOffset;
        }
        return result;
      }
      return {
        done: true,
        index: end
      };
    }
  };
};

/**
 * Get an iterator for a given range with bounds (for a one component data).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 * @param {Function} dataAccessor Function to access data.
 * @param {number} start The start of the range (included).
 * @param {number} end The end of the range (excluded).
 * @param {number} increment The increment between indicies.
 * @param {Array} regions An array of regions: [off0, size, off1].
 * @returns {object} An iterator folowing the iterator and iterable protocol.
 */
dwv.image.rangeRegions = function (
  dataAccessor, start, end, increment, regions) {
  var nextIndex = start;
  var regionCount = 0;
  var regionElementCount = 0;
  // result
  return {
    next: function () {
      if (nextIndex < end) {
        var result = {
          value: dataAccessor(nextIndex),
          done: false
        };
        regionElementCount += 1;
        nextIndex += increment;
        if (regionElementCount === regions[regionCount][1]) {
          regionElementCount = 0;
          // off1 of current group
          nextIndex += regions[regionCount][2];
          regionCount += 1;
          // off0 of next group
          if (regionCount < regions.length) {
            nextIndex += regions[regionCount][0];
          }
        }
        return result;
      }
      return {
        done: true,
        index: end
      };
    }
  };
};

/**
 * Get an iterator for a given range for a 3 components data.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 * @param {Function} dataAccessor Function to access data.
 * @param {number} start The start of the range (included).
 * @param {number} end The end of the range (excluded).
 *   (end - start) needs to be a multiple of 3...
 * @param {number} increment The increment between indicies (default=1).
 * @param {boolean} isPlanar A flag to know if the data is planar
 *   (RRRR...GGGG...BBBB...) or not (RGBRGBRGBRGB...), defaults to false.
 * @returns {object} A 3 components iterator folowing the iterator and iterable
 *   protocol, with extra 'value1' and 'value2' for the second and
 *   third component.
 */
dwv.image.range3d = function (dataAccessor, start, end, increment, isPlanar) {
  if (typeof increment === 'undefined') {
    increment = 1;
  }
  if (typeof isPlanar === 'undefined') {
    isPlanar = false;
  }
  var nextIndex = start;
  var componentIncrement = 1;
  if (isPlanar) {
    componentIncrement = (end - start) / 3;
  } else {
    increment *= 3;
  }
  var nextIndex1 = nextIndex + componentIncrement;
  var nextIndex2 = nextIndex + 2 * componentIncrement;

  // result
  return {
    next: function () {
      if (nextIndex < end) {
        var result = {
          value: [
            dataAccessor(nextIndex),
            dataAccessor(nextIndex1),
            dataAccessor(nextIndex2)
          ],
          done: false
        };
        nextIndex += increment;
        nextIndex1 += increment;
        nextIndex2 += increment;
        return result;
      }
      return {
        done: true,
        index: [end]
      };
    }
  };
};

/**
 * Get a list of values for a given iterator.
 *
 * @param {object} iterator The iterator to use to loop through data.
 * @returns {Array} The list of values.
 */
dwv.image.getIteratorValues = function (iterator) {
  var values = [];
  var ival = iterator.next();
  while (!ival.done) {
    values.push(ival.value);
    ival = iterator.next();
  }
  return values;
};

/**
 * Get a slice index iterator.
 *
 * @param {object} image The image to parse.
 * @param {number} slice The index of the slice.
 * @param {number} frame The frame index.
 * @returns {object} The slice iterator.
 */
dwv.image.getSliceIterator = function (image, slice, frame) {
  var sliceSize = image.getGeometry().getSize().getSliceSize();
  var start = slice * sliceSize;

  var dataAccessor = function (offset) {
    return image.getValueAtOffsetAndFrame(offset, frame);
  };

  var range = null;
  if (image.getNumberOfComponents() === 1) {
    range = dwv.image.range(dataAccessor, start, start + sliceSize);
  } else if (image.getNumberOfComponents() === 3) {
    // 3 times bigger...
    start *= 3;
    sliceSize *= 3;
    var isPlanar = image.getPlanarConfiguration() === 1;
    range = dwv.image.range3d(
      dataAccessor, start, start + sliceSize, 1, isPlanar);
  } else {
    throw new Error('Unsupported number of components: ' +
      image.getNumberOfComponents());
  }

  return range;
};

/**
 * Get a slice index iterator for a rectangular region.
 *
 * @param {object} image The image to parse.
 * @param {number} slice The index of the slice.
 * @param {number} frame The frame index.
 * @param {boolean} isRescaled Flag for rescaled values (default false).
 * @param {dwv.math.Point2D} min The minimum position (optional).
 * @param {dwv.math.Point2D} max The maximum position (optional).
 * @returns {object} The slice iterator.
 */
dwv.image.getRegionSliceIterator = function (
  image, slice, frame, isRescaled, min, max) {
  if (image.getNumberOfComponents() !== 1) {
    throw new Error('Unsupported number of components for region iterator: ' +
      image.getNumberOfComponents());
  }

  if (typeof isRescaled === 'undefined') {
    isRescaled = false;
  }
  var geometry = image.getGeometry();
  var size = geometry.getSize();
  if (typeof min === 'undefined') {
    min = new dwv.math.Point2D(0, 0);
  }
  if (typeof max === 'undefined') {
    max = new dwv.math.Point2D(
      size.getNumberOfColumns() - 1,
      size.getNumberOfRows()
    );
  }
  // position to pixel for max: extra X is ok, remove extra Y
  var minIndex = new dwv.math.Index(min.getX(), min.getY(), slice);
  var startOffset = geometry.indexToOffset(minIndex);
  var maxIndex = new dwv.math.Index(max.getX(), max.getY() - 1, slice);
  var endOffset = geometry.indexToOffset(maxIndex);

  // minimum 1 column
  var rangeNumberOfColumns = Math.max(1, max.getX() - min.getX());
  var rowIncrement = size.getNumberOfColumns() - rangeNumberOfColumns;

  // data accessor
  var dataAccessor = null;
  if (isRescaled) {
    dataAccessor = function (offset) {
      return image.getRescaledValueAtOffset(offset, slice, frame);
    };
  } else {
    dataAccessor = function (offset) {
      return image.getValueAtOffsetAndFrame(offset, frame);
    };
  }

  return dwv.image.rangeRegion(
    dataAccessor, startOffset, endOffset + 1,
    1, rangeNumberOfColumns, rowIncrement);
};

/**
 * Get a slice index iterator for a rectangular region.
 *
 * @param {object} image The image to parse.
 * @param {number} slice The index of the slice.
 * @param {number} frame The frame index.
 * @param {boolean} isRescaled Flag for rescaled values (default false).
 * @param {Array} regions An array of regions.
 * @returns {object} The slice iterator.
 */
dwv.image.getVariableRegionSliceIterator = function (
  image, slice, frame, isRescaled, regions) {
  if (image.getNumberOfComponents() !== 1) {
    throw new Error('Unsupported number of components for region iterator: ' +
      image.getNumberOfComponents());
  }

  if (typeof isRescaled === 'undefined') {
    isRescaled = false;
  }
  var geometry = image.getGeometry();
  var size = geometry.getSize();

  var offsetRegions = [];
  var region;
  var min = null;
  var max = null;
  var index = null;
  for (var i = 0; i < regions.length; ++i) {
    region = regions[i];
    var width = region[1][0] - region[0][0];
    if (width !== 0) {
      index = i;
      if (!min) {
        min = region[0];
      }
      offsetRegions.push([
        region[0][0],
        width,
        size.getNumberOfColumns() - region[1][0]
      ]);
    }
  }
  if (index !== null) {
    max = regions[index][1];
  }

  // exit if no offsets
  if (offsetRegions.length === 0) {
    return;
  }

  var minIndex = new dwv.math.Index(min[0], min[1], slice);
  var startOffset = geometry.indexToOffset(minIndex);
  var maxIndex = new dwv.math.Index(max[0], max[1], slice);
  var endOffset = geometry.indexToOffset(maxIndex);

  // data accessor
  var dataAccessor = null;
  if (isRescaled) {
    dataAccessor = function (offset) {
      return image.getRescaledValueAtOffset(offset, slice, frame);
    };
  } else {
    dataAccessor = function (offset) {
      return image.getValueAtOffsetAndFrame(offset, frame);
    };
  }

  return dwv.image.rangeRegions(
    dataAccessor, startOffset, endOffset + 1,
    1, offsetRegions);
};
