/**
 * Web worker for calculating segmentation volumes.
 *
 * Calculates the volume of segmentations using the Hoshen–Kopelman
 * algorithm to first label all of the connected components, then does
 * a second pass to count the number of voxels in each unique label.
 *
 * The Hoshen–Kopelman labelling is slightly modified to work with
 * non-binary 3D data, but is otherwise structured the same way.
 */

const ML_PER_MM = 0.001; // ml/mm^3

class VolumesWorker {
  /**
   * The last known image size.
   *
   * @type {number}
   */
  #lastKnownTotalSize;

  /**
   * A union-find (disjoint-set) representing the available volume labels.
   *
   * @type {Int32Array}
   */
  #unionFind;

  /**
   * A buffer containing the volume labels for each voxel.
   *
   * @type {Int32Array}
   */
  #labels;


  constructor() {}

  /**
   * Union-find find operation.
   *
   * @param {number} label The label to find the root of.
   *
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
   * Label the segmentation volumes using the Hoshen–Kopelman algorithm.
   *
   * @param {TypedArray} buffer The image buffer to regenerate the labels for.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} sizes The image dimensions.
   * @param {number} totalSize The total length of the buffer.
   */
  regenerateLabels(buffer, unitVectors, sizes, totalSize) {
    // If we are re-calcing the volume of the same sized image as last time we
    // can save a little time on re-initializing memory. Makes it slightly
    // faster to use a seperate VolumesWorker object per segmentation, at the
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
   * Calculate the volumes and centroids of a segmentation.
   *
   * @param {number} mlVoxelVolume The number of ml per image voxel.
   * @param {number[]} unitVectors The unit vectors for index to offset
   *  conversion.
   * @param {number[]} spacing The space in mm between voxels.
   * @param {number[]} origin The origin of the image in mm.
   *
   * @returns {object[]} The list of volumes in ml and centroids in mm.
   */
  calculateVolumesAndCentroids(mlVoxelVolume, unitVectors, spacing, origin) {
    const volumes = {};

    // Count the number of voxels per unique label,
    // this has to be done as a second pass.
    for (let o = 0; o < this.#labels.length; o++) {
      const labelValue = this.#find(this.#labels[o]);

      if (labelValue >= 0) {
        const index = this.#offsetToIndex(o, unitVectors);
        const volume = volumes[labelValue];
        if (typeof volume === 'undefined') {
          volumes[labelValue] = {
            sum: index,
            count: 1
          };
        } else {
          volume.sum[0] += index[0];
          volume.sum[1] += index[1];
          volume.sum[2] += index[2];
          volume.count++;
        }
      }
    }

    const volumesAndCentroids =
      Object.values(volumes).map(
        (v) => {
          const centroid = Array(v.sum.length).fill(0);
          for (let d = 0; d < v.sum.length; d++) {
            centroid[d] =
              (((v.sum[d] / v.count) + 0.5) * spacing[d]) + origin[d];
          }

          return {
            centroid: centroid,
            volume: v.count * mlVoxelVolume
          };
        }
      );

    return volumesAndCentroids;
  }
}

const volumesWorker = new VolumesWorker();

self.addEventListener('message', function (event) {
  const imageBuffer = event.data.imageBuffer;
  const unitVectors = event.data.unitVectors;
  const sizes = event.data.sizes;
  const spacing = event.data.spacing;
  const origin = event.data.origin;
  const totalSize = event.data.totalSize;

  // Convert the voxel volumes to ml.
  const mlVoxelVolume =
    spacing[0] *
    spacing[1] *
    spacing[2] *
    ML_PER_MM;

  // Generate the volume labels.
  volumesWorker.regenerateLabels(
    imageBuffer,
    unitVectors,
    sizes,
    totalSize
  );

  // Calculate the volumes in ml.
  const volumes =
    volumesWorker.calculateVolumesAndCentroids(
      mlVoxelVolume,
      unitVectors,
      spacing,
      origin
    );

  self.postMessage({
    dataId: event.data.dataId,
    volumes: volumes
  });
});