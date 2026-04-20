import {Point2D} from '../math/point.js';

/**
 * @import {Line} from '../math/line.js';
 */

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
   * @param {Point2D} point Point on the slice, scaled.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} spacing The pixel spacing of the image.
   *
   * @returns {number} Offset relative to the offset at the start of the slice.
   */
  #sliceWorldToSliceOffset(point, unitVectors, spacing) {
    const offset =
      (unitVectors[0] * Math.round(point.getX() / spacing[0])) +
      (unitVectors[1] * Math.round(point.getY() / spacing[1]));

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
   * @param {Line} line The line segment to plot.
   * @param {number} z The slice index.
   */
  #plotLineLow(imageBuffer, unitVectors, spacing, line, z) {
    const p0 = line.getBegin();
    const p1 = line.getEnd();
    const dx = line.getDeltaX();
    const dy = Math.abs(line.getDeltaY());
    let D = 2 * dy - dx;
    let y = p0.getY();
    const yi = (p0.getY() < p1.getY()) ? 1 : -1;

    for (let x = p0.getX(); x <= p1.getX(); x++) {
      const sliceOffset =
        this.#sliceWorldToSliceOffset(new Point2D(x, y), unitVectors, spacing);
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
   * @param {Line} line The line segment to plot.
   * @param {number} z The slice index.
   */
  #plotLineHigh(imageBuffer, unitVectors, spacing, line, z) {
    const p0 = line.getBegin();
    const p1 = line.getEnd();
    const dx = Math.abs(line.getDeltaX());
    const dy = line.getDeltaY();
    let D = 2 * dx - dy;
    let x = p0.getX();
    const xi = (p0.getX() < p1.getX()) ? 1 : -1;

    for (let y = p0.getY(); y <= p1.getY(); y++) {
      const sliceOffset =
        this.#sliceWorldToSliceOffset(new Point2D(x, y), unitVectors, spacing);
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
   * @param {Line} line The line segment to plot.
   * @param {number} z The slice index.
   */
  #plotPoints(imageBuffer, unitVectors, spacing, line, z) {
    const p0 = line.getBegin();
    const p1 = line.getEnd();
    if (Math.abs(line.getDeltaY()) < Math.abs(line.getDeltaX())) {
      if (p0.getX() < p1.getX()) {
        this.#plotLineLow(
          imageBuffer,
          unitVectors,
          spacing,
          line,
          z
        );
      } else {
        this.#plotLineLow(
          imageBuffer,
          unitVectors,
          spacing,
          line.getFlipped(),
          z
        );
      }
    } else if (p0.getY() < p1.getY()) {
      this.#plotLineHigh(
        imageBuffer,
        unitVectors,
        spacing,
        line,
        z
      );
    } else {
      this.#plotLineHigh(
        imageBuffer,
        unitVectors,
        spacing,
        line.getFlipped(),
        z
      );
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
    Object.values(maxDiameters).map((diameter) => {
      this.#plotPoints(
        imageBuffer,
        unitVectors,
        spacing,
        diameter.major.line,
        diameter.zIndex
      );

      if (typeof diameter.minor !== 'undefined') {
        this.#plotPoints(
          imageBuffer,
          unitVectors,
          spacing,
          diameter.minor.line,
          diameter.zIndex
        );
      }
    });
  }

} //class LabelingDebug