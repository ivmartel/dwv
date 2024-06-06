import {Index} from '../math/index';
import {Point2D} from '../math/point';

// doc imports
/* eslint-disable no-unused-vars */
import {Image} from './image';
import {Point} from '../math/point';
import {Matrix33} from '../math/matrix';
/* eslint-enable no-unused-vars */

/**
 * Get an simple iterator for a given range for a one component data.
 *
 * Ref: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols}.
 *
 * @param {Function} dataAccessor Function to access data.
 * @param {number} start The start of the range (included).
 * @param {number} end The end of the range (excluded).
 * @param {number} [increment] The increment between indicies (default=1).
 * @returns {object} An iterator folowing the iterator and iterable protocol.
 */
export function simpleRange(dataAccessor, start, end, increment) {
  if (typeof increment === 'undefined') {
    increment = 1;
  }
  let nextIndex = start;
  // result
  return {
    next: function () {
      if (nextIndex < end) {
        const result = {
          value: dataAccessor(nextIndex),
          done: false,
          index: nextIndex
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
}

/**
 * Get an iterator for a given range for a one component data.
 *
 * Using 'maxIter' and not an 'end' index since it fails in some edge cases
 * (for ex coronal2, ie zxy).
 *
 * @param {Function} dataAccessor Function to access data.
 * @param {number} start Zero-based index at which to start the iteration.
 * @param {number} maxIter The maximum number of iterations.
 * @param {number} increment Increment between indicies.
 * @param {number} blockMaxIter Number of applied increment after which
 *   blockIncrement is applied.
 * @param {number} blockIncrement Increment after blockMaxIter is reached,
 *   the value is from block start to the next block start.
 * @param {boolean} reverse1 If true, loop from end to start.
 *   WARN: don't forget to set the value of start as the last index!
 * @param {boolean} reverse2 If true, loop from block end to block start.
 * @returns {object} An iterator folowing the iterator and iterable protocol.
 */
export function range(dataAccessor, start, maxIter, increment,
  blockMaxIter, blockIncrement, reverse1, reverse2) {
  if (typeof reverse1 === 'undefined') {
    reverse1 = false;
  }
  if (typeof reverse2 === 'undefined') {
    reverse2 = false;
  }

  // first index of the iteration
  let nextIndex = start;
  // adapt first index and increments to reverse values
  if (reverse1) {
    blockIncrement *= -1;
    if (reverse2) {
      // start at end of line
      nextIndex -= (blockMaxIter - 1) * increment;
    } else {
      increment *= -1;
    }
  } else {
    if (reverse2) {
      // start at end of line
      nextIndex += (blockMaxIter - 1) * increment;
      increment *= -1;
    }
  }
  const finalBlockIncrement = blockIncrement - blockMaxIter * increment;

  // counters
  let mainCount = 0;
  let blockCount = 0;
  // result
  return {
    next: function () {
      if (mainCount < maxIter) {
        const result = {
          value: dataAccessor(nextIndex),
          done: false,
          index: nextIndex
        };
        nextIndex += increment;
        ++mainCount;
        ++blockCount;
        if (blockCount === blockMaxIter) {
          blockCount = 0;
          nextIndex += finalBlockIncrement;
        }
        return result;
      }
      return {
        done: true,
        index: nextIndex
      };
    }
  };
}

/**
 * Get an iterator for a given range with bounds (for a one component data).
 *
 * Ref: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols}.
 *
 * @param {Function} dataAccessor Function to access data.
 * @param {number} start The start of the range (included).
 * @param {number} end The end of the range (excluded).
 * @param {number} increment The increment between indicies.
 * @param {number} regionSize The size of the region to iterate through.
 * @param {number} regionOffset The offset between regions.
 * @returns {object} An iterator folowing the iterator and iterable protocol.
 */
export function rangeRegion(
  dataAccessor, start, end, increment, regionSize, regionOffset) {
  let nextIndex = start;
  let regionElementCount = 0;
  // result
  return {
    next: function () {
      if (nextIndex < end) {
        const result = {
          value: dataAccessor(nextIndex),
          done: false,
          index: nextIndex
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
}

/**
 * Get an iterator for a given range with bounds (for a one component data).
 *
 * Ref: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols}.
 *
 * @param {Function} dataAccessor Function to access data.
 * @param {number} start The start of the range (included).
 * @param {number} end The end of the range (excluded).
 * @param {number} increment The increment between indicies.
 * @param {number[][]} regions An array of regions: [off0, size, off1].
 * @returns {object} An iterator folowing the iterator and iterable protocol.
 */
export function rangeRegions(
  dataAccessor, start, end, increment, regions) {
  let nextIndex = start;
  let regionCount = 0;
  let regionElementCount = 0;
  // result
  return {
    next: function () {
      if (nextIndex < end) {
        const result = {
          value: dataAccessor(nextIndex),
          done: false,
          index: nextIndex
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
}

/**
 * Get an iterator for a given range for a 3 components data.
 *
 * Ref: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols}.
 *
 * @param {Function} dataAccessor Function to access data.
 * @param {number} start The start of the range (included).
 * @param {number} end The end of the range (excluded).
 *   (end - start) needs to be a multiple of 3...
 * @param {number} increment The increment between indicies (default=1).
 * @param {boolean} isPlanar A flag to know if the data is planar
 *   (RRRR...GGGG...BBBB...) or not (RGBRGBRGBRGB...), defaults to false.
 * @returns {object} A 3 components iterator folowing the iterator and iterable
 *   protocol, the value is an array of size 3 with each component.
 */
export function simpleRange3d(
  dataAccessor, start, end, increment, isPlanar) {
  if (typeof increment === 'undefined') {
    increment = 1;
  }
  if (typeof isPlanar === 'undefined') {
    isPlanar = false;
  }
  let nextIndex = start;
  let componentIncrement = 1;
  if (isPlanar) {
    componentIncrement = (end - start) / 3;
  } else {
    increment *= 3;
  }
  let nextIndex1 = nextIndex + componentIncrement;
  let nextIndex2 = nextIndex + 2 * componentIncrement;

  // result
  return {
    next: function () {
      if (nextIndex < end) {
        const result = {
          value: [
            dataAccessor(nextIndex),
            dataAccessor(nextIndex1),
            dataAccessor(nextIndex2)
          ],
          done: false,
          index: [nextIndex, nextIndex1, nextIndex2]
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
}

/**
 * Get an iterator for a given range for a 3 components data.
 *
 * Using 'maxIter' and not an 'end' index since it fails in some edge cases
 * (for ex coronal2, ie zxy).
 *
 * @param {Function} dataAccessor Function to access data.
 * @param {number} start Zero-based index at which to start the iteration.
 * @param {number} maxIter The maximum number of iterations.
 * @param {number} increment Increment between indicies.
 * @param {number} blockMaxIter Number of applied increment after which
 *   blockIncrement is applied.
 * @param {number} blockIncrement Increment after blockMaxIter is reached,
 *   the value is from block start to the next block start.
 * @param {boolean} reverse1 If true, loop from end to start.
 *   WARN: don't forget to set the value of start as the last index!
 * @param {boolean} reverse2 If true, loop from block end to block start.
 * @param {boolean} isPlanar A flag to know if the data is planar
 *   (RRRR...GGGG...BBBB...) or not (RGBRGBRGBRGB...), defaults to false.
 * @returns {object} An iterator folowing the iterator and iterable protocol.
 */
export function range3d(dataAccessor, start, maxIter, increment,
  blockMaxIter, blockIncrement, reverse1, reverse2, isPlanar) {
  const iters = [];
  if (isPlanar) {
    iters.push(range(
      dataAccessor, start, maxIter, increment,
      blockMaxIter, blockIncrement, reverse1, reverse2
    ));
    iters.push(range(
      dataAccessor, start + maxIter * increment, maxIter, increment,
      blockMaxIter, blockIncrement, reverse1, reverse2
    ));
    iters.push(range(
      dataAccessor, start + 2 * maxIter * increment, maxIter, increment,
      blockMaxIter, blockIncrement, reverse1, reverse2
    ));
  } else {
    increment *= 3;
    blockIncrement *= 3;
    iters.push(range(
      dataAccessor, start, maxIter, increment,
      blockMaxIter, blockIncrement, reverse1, reverse2
    ));
    iters.push(range(
      dataAccessor, start + 1, maxIter, increment,
      blockMaxIter, blockIncrement, reverse1, reverse2
    ));
    iters.push(range(
      dataAccessor, start + 2, maxIter, increment,
      blockMaxIter, blockIncrement, reverse1, reverse2
    ));
  }

  // result
  return {
    next: function () {
      const r0 = iters[0].next();
      const r1 = iters[1].next();
      const r2 = iters[2].next();
      if (!r0.done) {
        return {
          value: [
            r0.value,
            r1.value,
            r2.value
          ],
          done: false,
          index: [
            r0.index,
            r1.index,
            r2.index
          ]
        };
      }
      return {
        done: true,
        index: r2.index
      };
    }
  };
}

/**
 * Get a list of values for a given iterator.
 *
 * @param {object} iterator The iterator to use to loop through data.
 * @returns {Array} The list of values.
 */
export function getIteratorValues(iterator) {
  const values = [];
  let ival = iterator.next();
  while (!ival.done) {
    values.push(ival.value);
    ival = iterator.next();
  }
  return values;
}

/**
 * Get a slice index iterator.
 *
 * @param {Image} image The image to parse.
 * @param {Index} position The current position.
 * @param {boolean} isRescaled Flag for rescaled values (default false).
 * @param {Matrix33} viewOrientation The view orientation.
 * @returns {object} The slice iterator.
 */
export function getSliceIterator(
  image, position, isRescaled, viewOrientation) {
  const size = image.getGeometry().getSize();
  // zero-ify non direction index
  let dirMax2Index = 2;
  if (viewOrientation && typeof viewOrientation !== 'undefined') {
    dirMax2Index = viewOrientation.getColAbsMax(2).index;
  }
  const posValues = position.getValues();
  // keep the main direction and any other than 3D
  const indexFilter = function (element, index) {
    return (index === dirMax2Index || index > 2) ? element : 0;
  };
  const posStart = new Index(posValues.map(indexFilter));
  let start = size.indexToOffset(posStart);

  // default to non rescaled data
  if (typeof isRescaled === 'undefined') {
    isRescaled = false;
  }
  let dataAccessor = null;
  if (isRescaled) {
    dataAccessor = function (offset) {
      return image.getRescaledValueAtOffset(offset);
    };
  } else {
    dataAccessor = function (offset) {
      return image.getValueAtOffset(offset);
    };
  }

  const ncols = size.get(0);
  const nrows = size.get(1);
  const nslices = size.get(2);
  let sliceSize = size.getDimSize(2);

  const ncomp = image.getNumberOfComponents();
  const isPlanar = image.getPlanarConfiguration() === 1;
  const getRange = function (
    dataAccessor, start, maxIter, increment,
    blockMaxIter, blockIncrement, reverse1, reverse2) {
    if (ncomp === 1) {
      return range(dataAccessor, start, maxIter, increment,
        blockMaxIter, blockIncrement, reverse1, reverse2);
    } else if (ncomp === 3) {
      return range3d(dataAccessor, 3 * start, maxIter, increment,
        blockMaxIter, blockIncrement, reverse1, reverse2, isPlanar);
    }
  };

  let rangeObj = null;
  if (viewOrientation && typeof viewOrientation !== 'undefined') {
    const dirMax0 = viewOrientation.getColAbsMax(0);
    const dirMax2 = viewOrientation.getColAbsMax(2);

    // default reverse
    const reverse1 = false;
    const reverse2 = false;

    let maxIter = null;
    if (dirMax2.index === 2) {
      // axial
      maxIter = ncols * nrows;
      if (dirMax0.index === 0) {
        // xyz
        rangeObj = getRange(dataAccessor,
          start, maxIter, 1, ncols, ncols, reverse1, reverse2);
      } else {
        // yxz
        rangeObj = getRange(dataAccessor,
          start, maxIter, ncols, nrows, 1, reverse1, reverse2);
      }
    } else if (dirMax2.index === 0) {
      // sagittal
      maxIter = nslices * nrows;
      if (dirMax0.index === 1) {
        // yzx
        rangeObj = getRange(dataAccessor,
          start, maxIter, ncols, nrows, sliceSize, reverse1, reverse2);
      } else {
        // zyx
        rangeObj = getRange(dataAccessor,
          start, maxIter, sliceSize, nslices, ncols, reverse1, reverse2);
      }
    } else if (dirMax2.index === 1) {
      // coronal
      maxIter = nslices * ncols;
      if (dirMax0.index === 0) {
        // xzy
        rangeObj = getRange(dataAccessor,
          start, maxIter, 1, ncols, sliceSize, reverse1, reverse2);
      } else {
        // zxy
        rangeObj = getRange(dataAccessor,
          start, maxIter, sliceSize, nslices, 1, reverse1, reverse2);
      }
    } else {
      throw new Error('Unknown direction: ' + dirMax2.index);
    }
  } else {
    if (image.getNumberOfComponents() === 1) {
      rangeObj = simpleRange(dataAccessor, start, start + sliceSize);
    } else if (image.getNumberOfComponents() === 3) {
      // 3 times bigger...
      start *= 3;
      sliceSize *= 3;
      rangeObj = simpleRange3d(
        dataAccessor, start, start + sliceSize, 1, isPlanar);
    } else {
      throw new Error('Unsupported number of components: ' +
        image.getNumberOfComponents());
    }
  }

  return rangeObj;
}

/**
 * Get a slice index iterator for a rectangular region.
 *
 * @param {Image} image The image to parse.
 * @param {Index} index The current position.
 * @param {boolean} isRescaled Flag for rescaled values (default false).
 * @param {Point2D} min The minimum position (optional).
 * @param {Point2D} max The maximum position (optional).
 * @returns {object} The slice iterator.
 */
export function getRegionSliceIterator(
  image, index, isRescaled, min, max) {
  if (image.getNumberOfComponents() !== 1) {
    throw new Error('Unsupported number of components for region iterator: ' +
      image.getNumberOfComponents());
  }

  // default to non rescaled data
  if (typeof isRescaled === 'undefined') {
    isRescaled = false;
  }
  let dataAccessor = null;
  if (isRescaled) {
    dataAccessor = function (offset) {
      return image.getRescaledValueAtOffset(offset);
    };
  } else {
    dataAccessor = function (offset) {
      return image.getValueAtOffset(offset);
    };
  }

  const size = image.getGeometry().getSize();
  if (typeof min === 'undefined') {
    min = new Point2D(0, 0);
  }
  if (typeof max === 'undefined') {
    max = new Point2D(
      size.get(0) - 1,
      size.get(1)
    );
  }
  // position to pixel for max: extra X is ok, remove extra Y
  const startOffset = size.indexToOffset(index.getWithNew2D(
    min.getX(), min.getY()
  ));
  const endOffset = size.indexToOffset(index.getWithNew2D(
    max.getX(), max.getY() - 1
  ));

  // minimum 1 column
  const rangeNumberOfColumns = Math.max(1, max.getX() - min.getX());
  const rowIncrement = size.get(0) - rangeNumberOfColumns;

  return rangeRegion(
    dataAccessor, startOffset, endOffset + 1,
    1, rangeNumberOfColumns, rowIncrement);
}

/**
 * Get a slice index iterator for a rectangular region.
 *
 * @param {Image} image The image to parse.
 * @param {Index} index The current position.
 * @param {boolean} isRescaled Flag for rescaled values (default false).
 * @param {number[][][]} regions An array of [x, y] pairs (min, max).
 * @returns {object|undefined} The slice iterator.
 */
export function getVariableRegionSliceIterator(
  image, index, isRescaled, regions) {
  if (image.getNumberOfComponents() !== 1) {
    throw new Error('Unsupported number of components for region iterator: ' +
      image.getNumberOfComponents());
  }

  // default to non rescaled data
  if (typeof isRescaled === 'undefined') {
    isRescaled = false;
  }
  let dataAccessor = null;
  if (isRescaled) {
    dataAccessor = function (offset) {
      return image.getRescaledValueAtOffset(offset);
    };
  } else {
    dataAccessor = function (offset) {
      return image.getValueAtOffset(offset);
    };
  }

  const size = image.getGeometry().getSize();

  const offsetRegions = [];
  let region;
  let min = null;
  let max = null;
  let regionIndex = null;
  for (let i = 0; i < regions.length; ++i) {
    region = regions[i];
    const width = region[1][0] - region[0][0];
    if (width !== 0) {
      regionIndex = i;
      if (!min) {
        min = region[0];
      }
      offsetRegions.push([
        region[0][0],
        width,
        size.get(0) - region[1][0]
      ]);
    }
  }
  if (regionIndex !== null) {
    max = regions[regionIndex][1];
  }

  // exit if no offsets
  if (offsetRegions.length === 0) {
    return undefined;
  }

  const startOffset = size.indexToOffset(index.getWithNew2D(
    min[0], min[1]
  ));
  const endOffset = size.indexToOffset(index.getWithNew2D(
    max[0], max[1]
  ));

  return rangeRegions(
    dataAccessor, startOffset, endOffset + 1,
    1, offsetRegions);
}

/**
 * Get a colour iterator. The input array defines the colours and
 * their start index.
 *
 * Ref: {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols}.
 *
 * @param {Array} colours An array of {index, colour} pairs.
 * @param {number} end The end of the range (excluded).
 * @returns {object} An iterator folowing the iterator and iterable protocol.
 */
export function colourRange(colours, end) {
  let nextIndex = 0;
  let nextColourIndex = 0;
  // result
  return {
    next: function () {
      if (nextIndex < end) {
        if (nextColourIndex + 1 < colours.length &&
          nextIndex >= colours[nextColourIndex + 1].index) {
          ++nextColourIndex;
        }
        const result = {
          value: colours[nextColourIndex].colour,
          done: false,
          index: nextIndex
        };
        ++nextIndex;
        return result;
      }
      return {
        done: true,
        index: end
      };
    }
  };
}
