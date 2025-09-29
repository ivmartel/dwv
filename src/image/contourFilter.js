import {LabelingDebug} from './labelingDebug.js';

// Set this to true to show the debug contour and diameter display
const DIAMETER_DEBUG = false;

/**
 * Filter for calculating contours.
 */
export class ContourFilter {
  /**
   * The last known image size.
   *
   * @type {number}
   */
  #lastKnownTotalSize;

  /**
   * A buffer containing the contour overlay distance field.
   *
   * @type {Uint16Array}
   */
  #contour;


  /**
   * Generate the contour overlay distance field for a sementation image.
   *
   * @param {TypedArray} buffer The image buffer to regenerate the 
   *  contours for.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} sizes The image dimensions.
   * @param {number} totalSize The total length of the buffer.
   */
  #regenerateContours(buffer, unitVectors, sizes, totalSize) {
    // If we are re-calcing the contour of the same sized image as last time we
    // can save a little time on re-initializing memory. Makes it slightly
    // faster to use a seperate worker object per segmentation, at the
    // cost of extra memory.
    if (typeof this.#lastKnownTotalSize === 'undefined' ||
      this.#lastKnownTotalSize !== totalSize) {
      // The size of the image has changed, we need to reinitialize everything.
      this.#lastKnownTotalSize = totalSize;
      this.#contour = new Uint16Array(totalSize);
    }

    // Generate the Hoshen–Kopelman labels
    for (let z = 0; z < sizes[2]; z++) {
      for (let x = 0; x < sizes[0]; x++) {
        for (let y = 0; y < sizes[1]; y++) {
          const thisOffset =
            (unitVectors[0] * x) +
            (unitVectors[1] * y) +
            (unitVectors[2] * z);

          const thisValue = buffer[thisOffset];

          if (thisValue > 0) {
            // Neighbor offsets
            const xOffset = thisOffset - unitVectors[0];
            const yOffset = thisOffset - unitVectors[1];
            const xOffsetp = thisOffset + unitVectors[0];
            const yOffsetp = thisOffset + unitVectors[1];

            // Neighbor values
            let xValue = 0;
            if (x > 0) {
              xValue = buffer[xOffset];
            };
            let yValue = 0;
            if (y > 0) {
              yValue = buffer[yOffset];
            };

            let xValuep = 0;
            if (x < sizes[0] - 1) {
              xValuep = buffer[xOffsetp];
            };
            let yValuep = 0;
            if (y < sizes[1] - 1) {
              yValuep = buffer[yOffsetp];
            };

            // Border check
            if (
              xValue !== thisValue ||
              yValue !== thisValue ||
              xValuep !== thisValue ||
              yValuep !== thisValue
            ) {
              // On the border
              this.#contour[thisOffset] = 1;

            } else {
              // Neighbor contour values
              let xContourValue = 0;
              if (x > 0) {
                xContourValue = buffer[xOffset];
              };
              let yContourValue = 0;
              if (y > 0) {
                yContourValue = buffer[yOffset];
              };

              let xContourValuep = 0;
              if (x < sizes[0] - 1) {
                xContourValuep = buffer[xOffsetp];
              };
              let yContourValuep = 0;
              if (y < sizes[1] - 1) {
                yContourValuep = buffer[yOffsetp];
              };

              if (
                xContourValue !== 0 ||
                yContourValue !== 0 ||
                xContourValuep !== 0 ||
                yContourValuep !== 0
              ) {

                // Inside the segment
                this.#contour[thisOffset] = 
                  Math.min(
                    xContourValue,
                    yContourValue,
                    xContourValuep,
                    yContourValuep
                  ) + 1;
              }
            }
          } else {
            // Outside the segment
            this.#contour[thisOffset] = 0;
          }
        }
      }
    }
  }

  /**
   * Run the filter.
   *
   * @param {object} data The input data.
   * @returns {object}
   */
  run(data) {
    const imageBuffer = data.imageBuffer;
    const unitVectors = data.unitVectors;
    const sizes = data.sizes;
    const totalSize = data.totalSize;

    this.#regenerateContours(
      imageBuffer,
      unitVectors,
      sizes,
      totalSize
    );

    // Passing a TypedArray out of a worker clones it.
    return this.#contour;
  }
} // class contourFilter
