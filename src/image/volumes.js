import {ThreadPool, WorkerTask} from '../utils/thread';

// doc imports
/* eslint-disable no-unused-vars */
import {Geometry} from './geometry';
/* eslint-enable no-unused-vars */

/**
 * List of compatible typed arrays.
 *
 * @typedef {(
 *   Uint8Array | Int8Array |
 *   Uint16Array | Int16Array |
 *   Uint32Array | Int32Array
 * )} TypedArray
 */

const volumesWorkerUrl = new URL('./volumesWorker.js', import.meta.url);

/**
 * Generate a worker message to send to the volumes web worker.
 *
 * @param {TypedArray} imageBuffer The buffer the segmentation to
 *  calculate volumes for.
 * @param {Size} imageSize The image size.
 *
 * @returns {object} The message to send to the worker.
 */
export function generateWorkerMessage(imageBuffer, imageSize) {
  // We can't pass these metadata objects directly, so we will just
  // pull out what we need and pass that.
  const ndims = imageSize.length();

  // Cache the unit vector offsets to make a couple calculations faster.
  const unitVectors = Array(ndims).fill(0);
  for (let d = 0; d < ndims; d++) {
    unitVectors[d] = imageSize.getDimSize(d);
  }

  const sizes = Array(ndims).fill(0);
  for (let d = 0; d < ndims; d++) {
    sizes[d] = imageSize.get(d);
  }

  const totalSize = imageSize.getTotalSize();

  return {
    imageBuffer: imageBuffer,
    unitVectors: unitVectors,
    sizes: sizes,
    totalSize: totalSize
  };
}

/**
 * Volumes (and other related values) calculator for segmentations.
 */
export class Volumes {
  /**
   * The volume worker thread pool.
   *
   * @type {ThreadPool}
   */
  #threadPool = new ThreadPool(1);

  constructor() {
    this.#threadPool.onerror = ((e) => {
      console.error('Volume calculation failed!', e.error);
    });
  }

  /**
   * Trigger a volume recalculation.
   *
   * @param {TypedArray} imageBuffer The buffer the segmentation to
   *  calculate volumes for.
   * @param {Size} size The image size.
   */
  calculateVolumes(imageBuffer, size) {
    // We can't just pass in an Image or we would get a circular dependency

    this.#threadPool.onworkitem = this.onVolumeCalculation;

    const workerTask = new WorkerTask(
      volumesWorkerUrl,
      generateWorkerMessage(imageBuffer, size),
      {}
    );

    // add it the queue and run it
    this.#threadPool.addWorkerTask(workerTask);
  }

  /**
   * Handle a completed volume calculation. Default behavior is do nothing,
   * this is meant to be overridden.
   *
   * @param {object} _event The work item event fired when a volume
   *   calculation is completed. Event.data should contain a 'volumes' item.
   */
  onVolumeCalculation(_event) {}
}