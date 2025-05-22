import {ThreadPool, WorkerTask} from '../utils/thread.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Size} from './size.js';
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

/**
 * Generate a worker message to send to the labeling worker.
 *
 * @param {TypedArray} imageBuffer The buffer to label.
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
 * Labeling worker task.
 */
class LabelingWorkerTask extends WorkerTask {
  constructor(message, info) {
    super(message, info);
  }
  getWorker() {
    return new Worker(
      new URL('./labeling.worker.js', import.meta.url),
      {
        name: 'labeling.worker'
      }
    );
  }
}

/**
 * Labeling thread.
 */
export class LabelingThread {
  /**
   * The thread pool.
   *
   * @type {ThreadPool}
   */
  #threadPool = new ThreadPool(1);

  constructor() {
    this.#threadPool.onerror = ((e) => {
      console.error('Labeling failed!', e.error);
    });
  }

  /**
   * Trigger a labels recalculation.
   *
   * @param {TypedArray} imageBuffer The buffer to label.
   * @param {Size} size The image size.
   */
  run(imageBuffer, size) {
    // We can't just pass in an Image or we would get a circular dependency

    this.#threadPool.onworkitem = this.ondone;

    const workerTask = new LabelingWorkerTask(
      generateWorkerMessage(imageBuffer, size),
      {}
    );

    // add it the queue and run it
    this.#threadPool.addWorkerTask(workerTask);
  }

  /**
   * Handle a completed labeling. Default behavior is do nothing,
   * this is meant to be overridden.
   *
   * @param {object} _event The work item event fired when a labeling
   *   calculation is completed. Event.data should contain a 'lebels' item.
   */
  ondone(_event) {}
}