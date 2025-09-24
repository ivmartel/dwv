/**
 * Helper for the LabelingFilter, provides a debug display for diameters and
 * contours.
 *
 * Temporary until a proper way of rendering them is added.
 */
export class LabelingDebug {

  /**
   * Cleans buffer of debug lines before calculations.
   *
   * @param {TypedArray} imageBuffer The image buffer to clean.
   */
  cleanBuffer(imageBuffer) {
    for (let i = 0; i < imageBuffer.length; i++) {
      if (imageBuffer[i] >= 128) {
        imageBuffer[i] = imageBuffer[i] - 128;
      }
    }
  }

  /**
   * Convert a slice local world coordinate to a slice local offset value.
   *
   * @param {object} point Point on the slice, scaled.
   *  (object with the structure {x, y}).
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} spacing The pixel spacing of the image.
   *
   * @returns {number} Offset relative to the offset at the start of the slice.
   */
  #sliceWorldToSliceOffset(point, unitVectors, spacing) {
    const offset =
      (unitVectors[0] * Math.round(point.x / spacing[0])) +
      (unitVectors[1] * Math.round(point.y / spacing[1]));

    return offset;
  }

  /**
   * Draw a debug line segment of an angle less that 45 degrees.
   * Points should be in slice world space.
   *
   * @param {TypedArray} imageBuffer The image buffer to draw debug lines on.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} spacing The pixel spacing of the image.
   * @param {number} x0 The x of the first endpoint of the line segment.
   * @param {number} y0 The y of the first endpoint of the line segment.
   * @param {number} x1 The x of the second endpoint of the line segment.
   * @param {number} y1 The y of the second endpoint of the line segment.
   * @param {number} z The slice index.
   */
  #plotLineLow(imageBuffer, unitVectors, spacing, x0, y0, x1, y1, z) {
    const dx = x1 - x0;
    const dy = (y0 < y1) ? y1 - y0 : y0 - y1;
    let D = 2 * dy - dx;
    let y = y0;
    const yi = (y0 < y1) ? 1 : -1;

    for (let x = x0; x <= x1; x++) {
      const sliceOffset =
        this.#sliceWorldToSliceOffset({x, y}, unitVectors, spacing);
      const offset = sliceOffset + (unitVectors[2] * z);
      imageBuffer[offset] = imageBuffer[offset] + 128;

      if (D > 0) {
        y = y + yi;
        D = D - 2 * dx;
      }
      D = D + 2 * dy;
    }
  }

  /**
   * Draw a debug line segment of an angle greater that 45 degrees.
   * Points should be in slice world space.
   *
   * @param {TypedArray} imageBuffer The image buffer to draw debug lines on.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} spacing The pixel spacing of the image.
   * @param {number} x0 The x of the first endpoint of the line segment.
   * @param {number} y0 The y of the first endpoint of the line segment.
   * @param {number} x1 The x of the second endpoint of the line segment.
   * @param {number} y1 The y of the second endpoint of the line segment.
   * @param {number} z The slice index.
   */
  #plotLineHigh(imageBuffer, unitVectors, spacing, x0, y0, x1, y1, z) {
    const dx = (x0 < x1) ? x1 - x0 : x0 - x1;
    const dy = y1 - y0;
    let D = 2 * dx - dy;
    let x = x0;
    const xi = (x0 < x1) ? 1 : -1;

    for (let y = y0; y <= y1; y++) {
      const sliceOffset =
        this.#sliceWorldToSliceOffset({x, y}, unitVectors, spacing);
      const offset = sliceOffset + (unitVectors[2] * z);
      imageBuffer[offset] = imageBuffer[offset] + 128;

      if (D > 0) {
        x = x + xi;
        D = D - 2 * dy;
      }
      D = D + 2 * dx;
    }
  }

  /**
   * Draw a debug line segment.
   * Points should be in slice world space.
   *
   * @param {TypedArray} imageBuffer The image buffer to draw debug lines on.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} spacing The pixel spacing of the image.
   * @param {object} p0 The first endpoint of the line segment.
   *  (object with the structure {x, y}).
   * @param {object} p1 The second endpoint of the line segment.
   * @param {number} z The slice index.
   */
  #plotPoints(imageBuffer, unitVectors, spacing, p0, p1, z) {
    if (Math.abs(p1.y - p0.y) < Math.abs(p1.x - p0.x)) {
      if (p0.x < p1.x) {
        this.#plotLineLow(
          imageBuffer,
          unitVectors,
          spacing,
          p0.x,
          p0.y,
          p1.x,
          p1.y,
          z
        );
      } else {
        this.#plotLineLow(
          imageBuffer,
          unitVectors,
          spacing,
          p1.x,
          p1.y,
          p0.x,
          p0.y,
          z
        );
      }
    } else {
      if (p0.y < p1.y) {
        this.#plotLineHigh(
          imageBuffer,
          unitVectors,
          spacing,
          p0.x,
          p0.y,
          p1.x,
          p1.y,
          z
        );
      } else {
        this.#plotLineHigh(
          imageBuffer,
          unitVectors,
          spacing,
          p1.x,
          p1.y,
          p0.x,
          p0.y,
          z
        );
      }
    }
  }

  /**
   * Renders debug lines for contours and diameters.
   * The pixel value of the debug lines are the segmentation label of the
   * segment + 128.
   *
   * @param {TypedArray} imageBuffer The image buffer to draw debug lines on.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} sizes The image dimensions.
   * @param {number[]} spacing The pixel spacing of the image.
   * @param {TypedArray} borders The buffer containing the border pixel arrays.
   * @param {object} maxDiameters The dictionary of calculated diameters.
   */
  drawDebugLines(
    imageBuffer,
    unitVectors,
    sizes,
    spacing,
    borders,
    maxDiameters
  ) {
    for (let z = 0; z < sizes[2]; z++) {
      let borderOffset = 0;
      while (borders[(unitVectors[2] * z) + borderOffset] > 0) {
        const offset = borders[(unitVectors[2] * z) + borderOffset];
        if (imageBuffer[offset] > 0) {
          imageBuffer[offset] = imageBuffer[offset] + 128;
        }
        borderOffset++;
      }
    }
    Object.values(maxDiameters).map((diameter) => {
      this.#plotPoints(
        imageBuffer,
        unitVectors,
        spacing,
        diameter.major.point1,
        diameter.major.point2,
        diameter.zIndex
      );

      if (typeof diameter.minor !== 'undefined') {
        this.#plotPoints(
          imageBuffer,
          unitVectors,
          spacing,
          diameter.minor.point1,
          diameter.minor.point2,
          diameter.zIndex
        );
      }
    });
  }

} //class LabelingDebug