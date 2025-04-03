// doc imports
/* eslint-disable no-unused-vars */
import {Image} from './image';
import {Size} from './size';
/* eslint-enable no-unused-vars */

export class Volumes {

  /**
   * The image to calculate volumes for.
   *
   * @type {Image}
   */
  #image;

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
   * A cached array of unique labels.
   *
   * @type {number[]}
   */
  #uniqueLabels = [];

  /**
   * A cached array of calculated volumes.
   *
   * @type {number}
   */
  #volumes = [];

  /**
   * Invalidate volumes cache.
   *
   * @type {bool}
   */
  #volumesInvalid;

  /**
   * @param {Image} image The image to calculate volumes for.
   */
  constructor(image) {
    this.#image = image;

    this.#reconstructLabels();

    //TODO add destructor
    image.addEventListener(
      'imagecontentchange',
      (() => this.#reconstructLabels())
    );
  }

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

  #union(label1, label2) {
    this.#unionFind[this.#find(label1)] = this.#find(label2);
  }

  /**
   * Reconstruct the volume labels after the image changes.
   */
  #reconstructLabels() {
    const startTime = Date.now();

    const currentGeometry = this.#image.getGeometry();
    const currentSize = currentGeometry.getSize();

    //TODO: Support n-dimensional images?
    if (currentSize.length() !== 3) {
      return;
    };

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

    // Reset labels.
    const totalSize = currentSize.getTotalSize();
    for (let i = 0; i < totalSize; i++) {
      this.#unionFind[i] = i;
    }
    this.#labels.fill(-1);
    this.#volumesInvalid = true;

    //TODO: Support n-dimensional images?
    for (let x = 0; x < currentSize.get(0); x++) {
      for (let y = 0; y < currentSize.get(1); y++) {
        for (let z = 0; z < currentSize.get(2); z++) {

          const thisOffset =
            (this.#unitVectors[0] * x) +
            (this.#unitVectors[1] * y) +
            (this.#unitVectors[2] * z);

          const thisValue = this.#image.getBuffer()[thisOffset];

          if (thisValue > 0) {
            const xOffset = thisOffset - this.#unitVectors[0];
            const yOffset = thisOffset - this.#unitVectors[1];
            const zOffset = thisOffset - this.#unitVectors[2];

            let xValue = 0;
            if (x > 0) {
              xValue = this.#image.getBuffer()[xOffset];
            };
            let yValue = 0;
            if (y > 0) {
              yValue = this.#image.getBuffer()[yOffset];
            };
            let zValue = 0;
            if (z > 0) {
              zValue = this.#image.getBuffer()[zOffset];
            };

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

            if (
              xValue !== thisValue &&
              yValue !== thisValue &&
              zValue !== thisValue
            ) {
              this.#labels[thisOffset] = thisOffset; // Guaranteed unique label.

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

    const timeTaken = Date.now() - startTime;

    this.calculateVolumes();

    console.log('POKE time taken label: ', timeTaken, 'ms');
    console.log(
      'POKE size',
      currentSize.get(0),
      currentSize.get(1),
      currentSize.get(2)
    );
  }

  calculateVolumes() {
    const startTime = Date.now();

    const currentGeometry = this.#image.getGeometry();
    const currentSize = currentGeometry.getSize();

    if (typeof this.#size === 'undefined' || !this.#size.equals(currentSize)) {
      // The size changed since the last time labels were reconstructed.
      this.#reconstructLabels();
    }

    if (this.#volumesInvalid) {
      // Labels have been reconstructed since the last time volumes
      // were calculated.

      this.#uniqueLabels = [];
      this.#volumes = [];

      for (let x = 0; x < currentSize.get(0); x++) {
        for (let y = 0; y < currentSize.get(1); y++) {
          for (let z = 0; z < currentSize.get(2); z++) {

            const thisOffset =
              (this.#unitVectors[0] * x) +
              (this.#unitVectors[1] * y) +
              (this.#unitVectors[2] * z);

            const labelValue = this.#find(this.#labels[thisOffset]);
            const labelIndex = this.#uniqueLabels.indexOf(labelValue);

            if (labelValue >= 0 && labelIndex < 0) {
              this.#uniqueLabels.push(labelValue);
              this.#volumes.push(1);

            } else if (labelIndex >= 0) {
              this.#volumes[labelIndex]++;
            }
          }
        }
      }
    }

    // Convert the voxel volumes to ml.
    const currentSpacing = currentGeometry.getSpacing();
    const mlVoxelVolume =
      currentSpacing.get(0) *
      currentSpacing.get(1) *
      currentSpacing.get(2) *
      0.001; // ml/mm^3

    const mlVolumes =
      this.#volumes.map(
        (v) => {
          return (Math.round(v * mlVoxelVolume * 1e4)) / 1e4;
        }
      );

    const timeTaken = Date.now() - startTime;

    console.log('POKE unique labels: ', this.#uniqueLabels);
    console.log('POKE volumes (voxels): ', this.#volumes);
    console.log('POKE volumes (ml): ', mlVolumes);
    console.log('POKE time taken volume: ', timeTaken, 'ms');

    return mlVolumes;
  }

}