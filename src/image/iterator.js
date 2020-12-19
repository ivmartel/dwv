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
