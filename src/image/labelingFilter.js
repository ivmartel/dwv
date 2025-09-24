import {LabelingDebug} from './labelingDebug.js';

// Set this to true to show the debug contour and diameter display
const DIAMETER_DEBUG = false;

/**
 * Filter for calculating labels.
 *
 * Labels a buffer using the Hoshen–Kopelman
 * algorithm to first label all of the connected components, then does
 * a second pass to count the number of voxels in each unique label.
 *
 * The Hoshen–Kopelman labelling is slightly modified to work with
 * non-binary 3D data, but is otherwise structured the same way.
 *
 * Ref: {@link https://en.wikipedia.org/wiki/Hoshen%E2%80%93Kopelman_algorithm}.
 */
export class LabelingFilter {
  /**
   * The last known image size.
   *
   * @type {number}
   */
  #lastKnownTotalSize;

  /**
   * A union-find (disjoint-set) representing the available labels.
   *
   * @type {Int32Array}
   */
  #unionFind;

  /**
   * A buffer containing the labels for each voxel.
   *
   * @type {Int32Array}
   */
  #labels;

  /**
   * A buffer containing a list of border pixels for each layer.
   *
   * @type {Int32Array}
   */
  #borders;

  /**
   * Union-find find operation.
   * Ref: {@link https://en.wikipedia.org/wiki/Disjoint-set_data_structure}.
   *
   * @param {number} label The label to find the root of.
   * @returns {number} The root label.
   */
  #find(label) {
    if (label < 0) {
      return label;
    }

    // Find the root label
    let currentLabel = label;
    while (this.#unionFind[currentLabel] !== currentLabel) {
      currentLabel = this.#unionFind[currentLabel];
    }

    // Do an update pass to make this faster next time
    let updateLabel = label;
    while (this.#unionFind[updateLabel] !== updateLabel) {
      const newLabel = this.#unionFind[updateLabel];
      this.#unionFind[updateLabel] = currentLabel;
      updateLabel = newLabel;
    }

    return currentLabel;
  }

  /**
   * Union-find union operation.
   *
   * @param {number} label1 The child label to union.
   * @param {number} label2 The parent label to union.
   */
  #union(label1, label2) {
    // This will break if a non-label (-1) get passed in
    // however with the current implmentation this should never happen
    this.#unionFind[this.#find(label1)] = this.#find(label2);
  }

  /**
   * Label the buffer using the Hoshen–Kopelman algorithm.
   *
   * @param {TypedArray} buffer The image buffer to regenerate the labels for.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} sizes The image dimensions.
   * @param {number} totalSize The total length of the buffer.
   */
  #regenerateLabels(buffer, unitVectors, sizes, totalSize) {
    // If we are re-calcing the labels of the same sized image as last time we
    // can save a little time on re-initializing memory. Makes it slightly
    // faster to use a seperate worker object per segmentation, at the
    // cost of extra memory.
    if (typeof this.#lastKnownTotalSize === 'undefined' ||
      this.#lastKnownTotalSize !== totalSize) {
      // The size of the image has changed, we need to reinitialize everything.
      this.#lastKnownTotalSize = totalSize;

      // Performance trade-off means this can use a fair bit of memory
      // on large images.
      this.#unionFind = new Int32Array(totalSize);
      this.#labels = new Int32Array(totalSize);
      this.#borders = new Int32Array(totalSize);
    }

    // Generate the Hoshen–Kopelman labels
    for (let z = 0; z < sizes[2]; z++) {

      let borderOffset = 0;

      for (let x = 0; x < sizes[0]; x++) {
        for (let y = 0; y < sizes[1]; y++) {

          const thisOffset =
            (unitVectors[0] * x) +
            (unitVectors[1] * y) +
            (unitVectors[2] * z);

          // Reset labels.
          this.#unionFind[thisOffset] = thisOffset;
          this.#labels[thisOffset] = -1;

          const thisValue = buffer[thisOffset];

          if (thisValue > 0) {
            // Neighbor offsets
            const xOffset = thisOffset - unitVectors[0];
            const yOffset = thisOffset - unitVectors[1];
            const zOffset = thisOffset - unitVectors[2];

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
            let zValue = 0;
            if (z > 0) {
              zValue = buffer[zOffset];
            };

            let xValuep = 0;
            if (x < sizes[0] - 1) {
              xValuep = buffer[xOffsetp];
            };
            let yValuep = 0;
            if (y < sizes[1] - 1) {
              yValuep = buffer[yOffsetp];
            };

            // Neighbor labels
            let xLabel = 0;
            if (x > 0) {
              xLabel = this.#labels[xOffset];
            };
            let yLabel = 0;
            if (y > 0) {
              yLabel = this.#labels[yOffset];
            };
            let zLabel = 0;
            if (z > 0) {
              zLabel = this.#labels[zOffset];
            };

            // No neighbors with matching values
            if (
              xValue !== thisValue &&
              yValue !== thisValue &&
              zValue !== thisValue
            ) {
              this.#labels[thisOffset] = thisOffset; // Guaranteed unique label.

            // One neighbor with matching values
            } else if (
              xValue === thisValue &&
              yValue !== thisValue &&
              zValue !== thisValue
            ) {
              this.#labels[thisOffset] = this.#find(xLabel);
            } else if (
              xValue !== thisValue &&
              yValue === thisValue &&
              zValue !== thisValue
            ) {
              this.#labels[thisOffset] = this.#find(yLabel);
            } else if (
              xValue !== thisValue &&
              yValue !== thisValue &&
              zValue === thisValue
            ) {
              this.#labels[thisOffset] = this.#find(zLabel);

            // Two neighbor with matching values
            } else if (
              xValue !== thisValue &&
              yValue === thisValue &&
              zValue === thisValue
            ) {
              this.#union(yLabel, zLabel);
              this.#labels[thisOffset] = this.#find(yLabel);
            } else if (
              xValue === thisValue &&
              yValue !== thisValue &&
              zValue === thisValue
            ) {
              this.#union(xLabel, zLabel);
              this.#labels[thisOffset] = this.#find(xLabel);
            } else if (
              xValue === thisValue &&
              yValue === thisValue &&
              zValue !== thisValue
            ) {
              this.#union(xLabel, yLabel);
              this.#labels[thisOffset] = this.#find(xLabel);

            // All neighbors with matching values
            } else if (
              xValue === thisValue &&
              yValue === thisValue &&
              zValue === thisValue
            ) {
              this.#union(xLabel, yLabel);
              this.#union(xLabel, zLabel);
              this.#labels[thisOffset] = this.#find(xLabel);
            }

            // Border check
            if (
              xValue !== thisValue ||
              yValue !== thisValue ||
              xValuep !== thisValue ||
              yValuep !== thisValue
            ) {
              this.#borders[(unitVectors[2] * z) + borderOffset] = thisOffset;
              borderOffset++;
            }
          }
        }
      }

      this.#borders[(unitVectors[2] * z) + borderOffset] = 0;

    }
  }

  /**
   * Convert an offset in memory to an index.
   *
   * @param {number} offset The offset to convert.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @returns {number[]} The index.
   */
  #offsetToIndex(offset, unitVectors) {
    const values = new Array(unitVectors.length);
    let off = offset;
    let dimSize = 0;
    for (let i = unitVectors.length - 1; i > 0; --i) {
      dimSize = unitVectors[i];
      values[i] = Math.floor(off / dimSize);
      off = off - values[i] * dimSize;
    }
    values[0] = off;
    return values;
  }

  /**
   * Quantify labels: count items, calculate centroid, and calculate height.
   *
   * @param {TypedArray} buffer The image buffer to quantify the labels for.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} spacing The pixel spacing of the image.
   *
   * @returns {object} The dictionary of quantified labels.
   */
  #quantifyLabels(
    buffer,
    unitVectors,
    spacing
  ) {
    const detailledInfos = {};

    // Count the number of voxels per unique label,
    // this has to be done as a second pass.
    for (let o = 0; o < this.#labels.length; o++) {
      const labelValue = this.#find(this.#labels[o]);

      if (labelValue >= 0) {
        const index = this.#offsetToIndex(o, unitVectors);
        const info = detailledInfos[labelValue];
        if (typeof info === 'undefined') {
          detailledInfos[labelValue] = {
            id: buffer[o],
            sum: index,
            count: 1,
            maxZ: index[2],
            minZ: index[2]
          };
        } else {
          info.sum[0] += index[0];
          info.sum[1] += index[1];
          info.sum[2] += index[2];
          info.count++;
          info.maxZ = Math.max(info.maxZ, index[2]);
          info.minZ = Math.min(info.minZ, index[2]);
        }
      }
    }

    const labelsInfo = {};

    for (const [label, detailledInfo] of Object.entries(detailledInfos)) {
      const index = Array(detailledInfo.sum.length).fill(0);
      for (let d = 0; d < detailledInfo.sum.length; d++) {
        index[d] = detailledInfo.sum[d] / detailledInfo.count;
      }

      labelsInfo[label] = {
        id: detailledInfo.id,
        centroidIndex: index,
        count: detailledInfo.count,
        height: (detailledInfo.maxZ - detailledInfo.minZ + 1) * spacing[2]
      };
    }

    return labelsInfo;
  }

  /**
   * Convert a slice local offset value to a slice local world coordinate.
   *
   * @param {number} sliceOffset Offset relative to the offset at the
   * start of the slice.
   * @param {number []} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number []} spacing The pixel spacing of the image.
   *
   * @returns {object} Point on the slice, scaled.
   *  (object with the structure {x, y}).
   */
  #sliceOffsetToSliceWorld(sliceOffset, unitVectors, spacing) {
    let x = 0;
    let y = 0;
    if (unitVectors[0] > unitVectors[1]) {
      y = (sliceOffset % unitVectors[0]) / unitVectors[1];
      x = Math.floor(sliceOffset / unitVectors[0]);
    } else {
      x = (sliceOffset % unitVectors[1]) / unitVectors[0];
      y = Math.floor(sliceOffset / unitVectors[1]);
    }

    x = x * spacing[0];
    y = y * spacing[1];

    return {x, y};
  }

  /**
   * Calculated the length of a 2D line segment.
   * Points should be in slice world space.
   *
   * @param {object} p1 The first endpoint of the line segment.
   *  (object with the structure {x, y}).
   * @param {object} p2 The second endpoint of the line segment.
   *
   * @returns {number} Length of the line segment relative to the X axis.
   */
  #calculateDistance(p1, p2) {
    const xD = Math.abs(p1.x - p2.x);
    const yD = Math.abs(p1.y - p2.y);
    return Math.sqrt((xD * xD) + (yD * yD));
  }

  /**
   * Calculated the angle of a 2D line segment.
   * Points should be in slice world space.
   *
   * @param {object} p1 The first endpoint of the line segment.
   *  (object with the structure {x, y}).
   * @param {object} p2 The second endpoint of the line segment.
   *
   * @returns {number} Angle of the line segment relative to the X axis.
   */
  #calculateAngle(p1, p2) {
    return Math.atan((p2.y - p1.y) / (p2.x - p1.x));
  }

  /**
   * Calculate the major and minor (perpendicular) diameters of each segment.
   *
   * @param {TypedArray} buffer The image buffer to calculate diameters for.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} sizes The image dimensions.
   * @param {number[]} spacing The pixel spacing of the image.
   *
   * @returns {object} The dictionary of calculated diameters.
   */
  #calculateDiameters(
    buffer,
    unitVectors,
    sizes,
    spacing
  ) {
    const maxDiameters = {};

    // Get the major diameter
    for (let z = 0; z < sizes[2]; z++) {
      const zOffset = unitVectors[2] * z;

      // TODO: It would be more efficient to calculate the convex hull, use
      // rotating calipers to get antipodal points, and then calculate the
      // major diameter from those.
      // For now the naive way is fast enough for an initial implementation.

      let borderOffset1 = 0;
      while (this.#borders[zOffset + borderOffset1] > 0) {
        const offset1 = this.#borders[zOffset + borderOffset1];
        const label1 = this.#find(this.#labels[offset1]);
        const sliceOffset1 = offset1 - zOffset;
        const slicePosition1 =
          this.#sliceOffsetToSliceWorld(sliceOffset1, unitVectors, spacing);

        let borderOffset2 = 0;
        while (this.#borders[zOffset + borderOffset2] > 0) {
          const offset2 = this.#borders[zOffset + borderOffset2];
          if (offset1 !== offset2) {
            const label2 = this.#find(this.#labels[offset2]);

            if (label1 === label2) {
              const sliceOffset2 = offset2 - zOffset;
              const slicePosition2 =
                this.#sliceOffsetToSliceWorld(
                  sliceOffset2,
                  unitVectors,
                  spacing
                );

              const distance =
                this.#calculateDistance(slicePosition1, slicePosition2);

              const maxDiameter = maxDiameters[label1];
              if (
                typeof maxDiameter === 'undefined' ||
                maxDiameter.major.diameter < distance
              ) {
                maxDiameters[label1] = {
                  id: buffer[offset1],
                  major: {
                    diameter: distance,
                    point1: slicePosition1,
                    point2: slicePosition2,
                    offset1: offset1,
                    offset2: offset2,
                  },
                  zIndex: z
                };
              }
            }
          }

          borderOffset2++;
        }

        borderOffset1++;
      }
    }

    // Get the minor (perpendicular) diameter
    for (const [label, diameter] of Object.entries(maxDiameters)) {
      const zOffset = unitVectors[2] * diameter.zIndex;
      const diameterAngle =
        this.#calculateAngle(diameter.major.point1, diameter.major.point2);

      // TODO: This could also be made faster by using a modified antipodal
      // point algorithm that uses perpedicularity to the initial diameter
      // instead of parallel tangents (we can't use the convex hull for this
      // one, so the normal algorithm doesn't work).
      // For now the naive way is fast enough for an initial implementation.

      let borderOffset1 = 0;
      while (this.#borders[zOffset + borderOffset1] > 0) {
        const offset1 = this.#borders[zOffset + borderOffset1];
        const label1 = this.#find(this.#labels[offset1]);

        if (label1.toString() !== label) {
          borderOffset1++;
          continue;
        }

        const sliceOffset1 = offset1 - zOffset;
        const slicePosition1 =
          this.#sliceOffsetToSliceWorld(sliceOffset1, unitVectors, spacing);

        let borderOffset2 = 0;
        while (this.#borders[zOffset + borderOffset2] > 0) {
          const offset2 = this.#borders[zOffset + borderOffset2];
          if (offset1 !== offset2) {
            const label2 = this.#find(this.#labels[offset2]);
            if (label2.toString() === label && label1 === label2) {
              const sliceOffset2 = offset2 - zOffset;
              const slicePosition2 =
                this.#sliceOffsetToSliceWorld(
                  sliceOffset2,
                  unitVectors,
                  spacing
                );

              // Check angle for perpendicularity
              const angle =
                this.#calculateAngle(slicePosition1, slicePosition2);

              const angleDifference = Math.abs(angle - diameterAngle);
              if (
                angleDifference > (Math.PI / 2) - 0.1 &&
                Math.abs(angle - diameterAngle) < (Math.PI / 2) + 0.1
              ) {
                const distance =
                  this.#calculateDistance(slicePosition1, slicePosition2);

                if (
                  typeof diameter.minor === 'undefined' ||
                  diameter.minor.diameter < distance
                ) {
                  diameter.minor = {
                    diameter: distance,
                    point1: slicePosition1,
                    point2: slicePosition2,
                    offset1: offset1,
                    offset2: offset2
                  };
                }
              }
            }
          }

          borderOffset2++;
        }

        borderOffset1++;
      }
    }

    return maxDiameters;
  }

  /**
   * Run the filter.
   *
   * @param {object} data The input data.
   * @returns {object[]} The list of quantified labels.
   */
  run(data) {
    const imageBuffer = data.imageBuffer;
    const unitVectors = data.unitVectors;
    const sizes = data.sizes;
    const spacing = data.spacing;
    const totalSize = data.totalSize;

    // This is temporary until a proper method of displaying them is implmented
    // ------
    const debug = new LabelingDebug();
    if (DIAMETER_DEBUG) {
      debug.cleanBuffer(imageBuffer);
    }
    // ------

    // generate labels
    this.#regenerateLabels(
      imageBuffer,
      unitVectors,
      sizes,
      totalSize
    );

    // quantify labels
    const labelsInfo = this.#quantifyLabels(
      imageBuffer,
      unitVectors,
      spacing
    );

    // calculate diameters
    const maxDiameters = this.#calculateDiameters(
      imageBuffer,
      unitVectors,
      sizes,
      spacing
    );

    // This is temporary until a proper method of displaying them is implmented
    // ------
    if (DIAMETER_DEBUG) {
      debug.drawDebugLines(
        imageBuffer,
        unitVectors,
        sizes,
        spacing,
        this.#borders,
        maxDiameters
      );
    }
    // ------

    // merge calculations
    const mergedLabelsInfo =
      Object.entries(labelsInfo).map(
        ([label, labelInfo]) => {
          if (typeof maxDiameters[label] !== 'undefined') {
            labelInfo.diameters = maxDiameters[label];
          }

          return labelInfo;
        }
      );

    return mergedLabelsInfo;
  }
} // class labelingFilter
