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
    }

    // Generate the Hoshen–Kopelman labels
    for (let x = 0; x < sizes[0]; x++) {
      for (let y = 0; y < sizes[1]; y++) {
        for (let z = 0; z < sizes[2]; z++) {

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
          }
        }
      }
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
   * Quantify labels: count items and calculate centroid.
   *
   * @param {TypedArray} buffer The image buffer to regenerate the labels for.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   *
   * @returns {object[]} The list of quantified labels.
   */
  #quantifyLabels(
    buffer,
    unitVectors,
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
            count: 1
          };
        } else {
          info.sum[0] += index[0];
          info.sum[1] += index[1];
          info.sum[2] += index[2];
          info.count++;
        }
      }
    }

    const labelsInfo =
      Object.values(detailledInfos).map(
        (detailledInfo) => {
          const index = Array(detailledInfo.sum.length).fill(0);
          for (let d = 0; d < detailledInfo.sum.length; d++) {
            index[d] = detailledInfo.sum[d] / detailledInfo.count;
          }

          return {
            id: detailledInfo.id,
            centroidIndex: index,
            count: detailledInfo.count
          };
        }
      );

    return labelsInfo;
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
    const totalSize = data.totalSize;

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
    );

    return labelsInfo;
  }
} // class labelingFilter
