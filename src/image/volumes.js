// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
import {Size} from './size';
/* eslint-enable no-unused-vars */

export class Volumes {

  /**
   * The associated application.
   *
   * @type {App}
   */
  #app;

  /**
   * The last known image size.
   *
   * @type {Size}
   */
  #size;

  /**
   * The offset unit vectors (eg the offset for index [0,1,0] etc.).
   *
   * @type {number[]}
   */
  #unitVectors;

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

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;
  }

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
   * @param {Image} image The image to regenerate the labels for.
   */
  #regenerateLabels(image) {
    const currentGeometry = image.getGeometry();
    const currentSize = currentGeometry.getSize();

    // This check is probably redundant
    if (currentSize.length() !== 3) {
      return;
    };

    // If we are re-calcing the volume of the same sized image as last time we
    // can save a little time on re-initializing memory. Makes it slightly
    // faster to use a seperate Volumes object per segmentation, at the cost
    // of extra memory.
    if (typeof this.#size === 'undefined' || !this.#size.equals(currentSize)) {
      // The size of the image has changed, we need to reinitialize everything.
      this.#size = currentSize;

      // Cache the unit vector offsets to make a couple calculations faster.
      const ndims = currentSize.length();
      this.#unitVectors = Array(ndims).fill(0);
      for (let d = 0; d < ndims; d++) {
        this.#unitVectors[d] = currentSize.getDimSize(d);
      }

      const totalSize = currentSize.getTotalSize();
      // Performance trade-off means this can use a fair bit of memory
      // on large images.
      this.#unionFind = new Int32Array(totalSize);
      this.#labels = new Int32Array(totalSize);
    }

    // Generate the Hoshen–Kopelman labels
    for (let x = 0; x < currentSize.get(0); x++) {
      for (let y = 0; y < currentSize.get(1); y++) {
        for (let z = 0; z < currentSize.get(2); z++) {

          const thisOffset =
            (this.#unitVectors[0] * x) +
            (this.#unitVectors[1] * y) +
            (this.#unitVectors[2] * z);

          // Reset labels.
          this.#unionFind[thisOffset] = thisOffset;
          this.#labels[thisOffset] = -1;

          const thisValue = image.getBuffer()[thisOffset];

          if (thisValue > 0) {
            // Neighbor offsets
            const xOffset = thisOffset - this.#unitVectors[0];
            const yOffset = thisOffset - this.#unitVectors[1];
            const zOffset = thisOffset - this.#unitVectors[2];

            // Neighbor values
            let xValue = 0;
            if (x > 0) {
              xValue = image.getBuffer()[xOffset];
            };
            let yValue = 0;
            if (y > 0) {
              yValue = image.getBuffer()[yOffset];
            };
            let zValue = 0;
            if (z > 0) {
              zValue = image.getBuffer()[zOffset];
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

            // One neibour with matching values
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

            // Two neibours with matching values
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

            // All neibours with matching values
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
   * Calculate the volumes of a segmentation.
   *
   * @param {string} maskDataId The data ID of the mask to calculate
   *  volumes for.
   *
   * @returns {number[]} The list of volumes in ml.
   */
  calculateVolumes(maskDataId) {
    // Calculates the volume of segmentations using the Hoshen–Kopelman
    // algorithm to first label all of the connected components, then does
    // a second pass to count the number of voxels in each unique label.
    //
    // The Hoshen–Kopelman labelling is slightly modified to work with
    // non-binary 3D data, but is otherwise structured the same way.

    const maskData = this.#app.getData(maskDataId);
    if (!maskData) {
      throw new Error(
        'No mask image to calculate segmentation volumes for ID: ' + maskDataId
      );
    }
    const image = maskData.image;

    const startTime1 = Date.now();

    // Generate the volume labels.
    this.#regenerateLabels(image);

    const timeTaken1 = Date.now() - startTime1;
    const startTime2 = Date.now();

    const volumes = {};

    // Count the number of voxels per unique label,
    // this has to be done as a second pass.
    for (let o = 0; o < this.#labels.length; o++) {
      const labelValue = this.#find(this.#labels[o]);

      if (labelValue >= 0) {
        const volume = volumes[labelValue];
        if (typeof volume === 'undefined') {
          volumes[labelValue] = 1;
        } else {
          volumes[labelValue]++;
        }
      }
    }

    // Convert the voxel volumes to ml.
    const currentGeometry = image.getGeometry();
    const currentSpacing = currentGeometry.getSpacing();
    const mlVoxelVolume =
      currentSpacing.get(0) *
      currentSpacing.get(1) *
      currentSpacing.get(2) *
      0.001; // ml/mm^3

    const mlVolumes =
      Object.values(volumes).map(
        (v) => {
          return (Math.round(v * mlVoxelVolume * 1e4)) / 1e4;
        }
      );

    const timeTaken2 = Date.now() - startTime2;

    // Debug code, please ignore for now will be removed later
    console.log('POKE volumes (voxels): ', volumes);
    console.log('POKE volumes (ml): ', mlVolumes);
    console.log('POKE time taken labels: ', timeTaken1, 'ms');
    console.log('POKE time taken volume: ', timeTaken2, 'ms');

    return mlVolumes;
  }

}