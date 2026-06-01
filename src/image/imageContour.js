/**
 * @import {Matrix33} from '../math/matrix.js';
 * @import {Size} from './size.js';
 */

/**
 * Maximum contour size in pixels.
 *
 * @type {number}
 */
export const MAX_CONTOUR_SIZE = 10;

/**
 * Image contour buffer manager.
 * Caches per-pixel distance-to-border values for contour rendering.
 * Stores 3 distance values per pixel (one per orientation: x, y, z).
 */
export class ImageContour {

  /**
   * Contour data buffer (3 values per image pixel).
   * Null when contour rendering is not enabled.
   *
   * @type {Uint8Array?}
   */
  #data = null;

  /**
   * Reference to the image data buffer.
   *
   * @type {Uint8Array?}
   */
  #imageBuffer = null;

  /**
   * Reference to the image size.
   *
   * @type {Size}
   */
  #imageSize = null;

  /**
   * Initialize the contour buffer.
   * Should be called on every segmentation image, or any image where
   * contour rendering needs to be supported.
   *
   * @param {Uint8Array} imageBuffer The image data buffer.
   * @param {Size} imageSize The image size.
   */
  initialize(imageBuffer, imageSize) {
    this.#imageBuffer = imageBuffer;
    this.#imageSize = imageSize;
    this.#data = new Uint8Array(imageBuffer.length * 3);
  }

  /**
   * Get whether or not the contour buffer has been initialized.
   *
   * @returns {boolean} True if buffer has been initialized.
   */
  isInitialized() {
    return this.#data !== null;
  }

  /**
   * Re-allocate contour buffer memory after an image buffer resize.
   * Updates the stored image buffer and size references.
   *
   * @param {Uint8Array} imageBuffer The new image data buffer.
   * @param {Size} imageSize The new image size.
   */
  realloc(imageBuffer, imageSize) {
    this.#imageBuffer = imageBuffer;
    this.#imageSize = imageSize;
    let tmpBuffer = this.#data;
    this.#data = new Uint8Array(imageBuffer.length * 3);
    this.#data.set(tmpBuffer);
    // force GC
    // eslint-disable-next-line no-useless-assignment
    tmpBuffer = null;
  }

  /**
   * Shift contour buffer content to make room for an inserted slice.
   *
   * @param {number} contourIndexOffset Start offset of the slice to shift.
   * @param {number} contourSliceSize Size of one contour slice.
   * @param {number} contourMaxOffset End offset of content to shift.
   */
  shiftSlice(contourIndexOffset, contourSliceSize, contourMaxOffset) {
    this.#data.set(
      this.#data.subarray(contourIndexOffset, contourMaxOffset),
      contourIndexOffset + contourSliceSize
    );
  }

  /**
   * Reset contour buffer values at a single offset (3 bytes: x, y, z).
   *
   * @param {number} offset The offset to reset.
   */
  #resetAtOffset(offset) {
    this.#data[offset * 3] = 0;
    this.#data[(offset * 3) + 1] = 0;
    this.#data[(offset * 3) + 2] = 0;
  }

  /**
   * Reset contour buffer for the values around an offset.
   * Prevents certain artifacts, especially at small brush sizes
   * and when erasing.
   *
   * @param {number} offset The offset to reset.
   */
  resetAroundOffset(offset) {
    if (!this.isInitialized()) {
      return;
    }
    this.#resetAtOffset(offset);

    const xOffset = this.#imageSize.getDimSize(0);
    const yOffset = this.#imageSize.getDimSize(1);
    const zOffset = this.#imageSize.getDimSize(2);

    const max = MAX_CONTOUR_SIZE / 2;
    const min = -max;
    for (let x = min; x < max; x++) {
      for (let y = min; y < max; y++) {
        for (let z = min; z < max; z++) {
          const p =
            offset +
            (xOffset * x) +
            (yOffset * y) +
            (zOffset * z);
          if (p >= 0 && p < this.#imageBuffer.length) {
            this.#resetAtOffset(p);
          }
        }
      }
    }
  }

  /**
   * Move cursor a step in the X direction to check for border pixels.
   *
   * @param {number} distance Accumulated distance travelled.
   * @param {number} index Current cursor index before moving.
   * @param {number} direction Offset to move cursor.
   * @param {number} dim The index of the current dimension.
   * @param {number} checkValue Initial pixel value.
   * @param {Function[]} queue Ordered queue of locations to check.
   * @returns {Function} A function that returns the distance to the nearest
   *  border pixel or 0.
   */
  #recursiveDistanceCheckX(distance, index, direction, dim, checkValue, queue) {
    return () => {
      const newIndex = index + direction;
      const newDistance = distance + 1;

      const borderCheck = this.#imageSize.offsetToIndex(newIndex);

      if (
        newIndex >= this.#imageBuffer.length ||
        newIndex < 0 ||
        borderCheck.get(dim) === 0 ||
        borderCheck.get(dim) === this.#imageSize.get(dim) - 1 ||
        newDistance === 255
      ) {
        return newDistance;
      }

      if (newDistance > MAX_CONTOUR_SIZE) {
        return 255;
      }

      if (this.#imageBuffer[newIndex] !== checkValue) {
        return newDistance;
      }

      queue.push(this.#recursiveDistanceCheckX(
        newDistance, newIndex, direction, dim, checkValue, queue
      ));

      return 0;
    };
  }

  /**
   * Move cursor a step in the Y direction to check for border pixels.
   * Also spawns two new cursors checking in the X directions to either side.
   *
   * @param {number} distance Accumulated distance travelled.
   * @param {number} index Current cursor index before moving.
   * @param {number} yDirection Offset to move cursor.
   * @param {number} xDirection Offset to move cursor.
   * @param {number} yDim The index of the y dimension.
   * @param {number} xDim The index of the x dimension.
   * @param {number} checkValue Initial pixel value.
   * @param {Function[]} queue Ordered queue of locations to check.
   * @returns {Function} A function that returns the distance to the nearest
   *  border pixel or 0.
   */
  #recursiveDistanceCheckY(
    distance, index, yDirection, xDirection, yDim, xDim, checkValue, queue
  ) {
    return () => {
      const newIndex = index + yDirection;
      const newDistance = distance + 1;

      const borderCheck = this.#imageSize.offsetToIndex(newIndex);

      if (
        newIndex >= this.#imageBuffer.length ||
        newIndex < 0 ||
        borderCheck.get(yDim) === 0 ||
        borderCheck.get(yDim) === this.#imageSize.get(yDim) - 1 ||
        newDistance === 255
      ) {
        return newDistance;
      }

      if (newDistance > MAX_CONTOUR_SIZE) {
        return 255;
      }

      if (this.#imageBuffer[newIndex] !== checkValue) {
        return newDistance;
      }

      queue.push(this.#recursiveDistanceCheckX(
        newDistance, newIndex, xDirection, xDim, checkValue, queue
      ));
      queue.push(this.#recursiveDistanceCheckX(
        newDistance, newIndex, -xDirection, xDim, checkValue, queue
      ));
      queue.push(this.#recursiveDistanceCheckY(
        newDistance, newIndex, yDirection, xDirection,
        yDim, xDim, checkValue, queue
      ));

      return 0;
    };
  }

  /**
   * Calculate the distance to the nearest border pixel
   * (or return the cached distance).
   * Returns 0 if the contour buffer is not initialized.
   *
   * @param {number} index Index/offset of the pixel to check.
   * @param {Matrix33} viewOrientation The orientation of the view.
   * @returns {number} The distance to the nearest border pixel or 0.
   */
  getDistance(index, viewOrientation) {
    if (!this.isInitialized()) {
      return 0;
    }

    const orientationIndex = viewOrientation.getThirdColMajorDirection();

    const xDim = (orientationIndex + 1) % 3;
    const yDim = (orientationIndex + 2) % 3;

    const contourIndex = index * 3 + orientationIndex;

    const bufferedDistance = this.#data[contourIndex];
    if (bufferedDistance > 0) {
      return bufferedDistance;
    }

    const checkValue = this.#imageBuffer[index];
    const operationQueue = [];

    const yDimSize = this.#imageSize.getDimSize(yDim);
    const xDimSize = this.#imageSize.getDimSize(xDim);

    operationQueue.push(this.#recursiveDistanceCheckY(
      0, index, yDimSize, xDimSize, yDim, xDim, checkValue, operationQueue
    ));
    operationQueue.push(this.#recursiveDistanceCheckX(
      0, index, xDimSize, xDim, checkValue, operationQueue
    ));
    operationQueue.push(this.#recursiveDistanceCheckX(
      0, index, -xDimSize, xDim, checkValue, operationQueue
    ));
    operationQueue.push(this.#recursiveDistanceCheckY(
      0, index, -yDimSize, xDimSize, yDim, xDim, checkValue, operationQueue
    ));

    let opCount = 0;
    // Enough to check every square up to MAX_CONTOUR_SIZE
    const maxOps = Math.pow(MAX_CONTOUR_SIZE, 2);
    while (operationQueue.length > 0) {
      opCount++;
      if (opCount > maxOps) {
        this.#data[contourIndex] = 255;
        return 255;
      }

      const operation = operationQueue.shift();
      const distanceCheck = operation();

      if (distanceCheck > 0) {
        // Return the first valid distance we find
        this.#data[contourIndex] = distanceCheck;
        return distanceCheck;
      }
    }

    // Something has gone wrong
    return Infinity;
  }

} // class ImageContour
