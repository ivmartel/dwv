import {ThreadPool, WorkerTask} from '../utils/thread.js';

/**
 * @import {Geometry} from './geometry.js';
 * @import {Size} from './size.js';
 * @import {Spacing} from './spacing.js';
 */

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
 * Generate a worker message with geometry metadata only.
 *
 * @param {Size} imageSize The image size.
 * @param {Spacing} imageSpacing The image spacing.
 *
 * @returns {object} The geometry part of a worker message.
 */
export function generateGeometryMessage(imageSize, imageSpacing) {
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

  return {
    unitVectors,
    sizes,
    spacing: imageSpacing.getValues(),
    totalSize: imageSize.getTotalSize()
  };
}

/**
 * Generate a worker message to send to the labeling worker.
 *
 * @param {TypedArray} imageBuffer The buffer to label.
 * @param {Geometry} imageGeometry The image geometry.
 *
 * @returns {object} The message to send to the worker.
 */
export function generateWorkerMessage(imageBuffer, imageGeometry) {
  return {
    imageBuffer,
    ...generateGeometryMessage(
      imageGeometry.getSize(), imageGeometry.getSpacing()
    )
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
  #threadPool = new ThreadPool(navigator?.hardwareConcurrency ?? 4);

  constructor() {
    this.#threadPool.onerror = ((e) => {
      console.error('Labeling failed!', e.error);
    });
  }

  /**
   * Trigger a labels recalculation.
   *
   * @param {TypedArray} imageBuffer The buffer to label.
   * @param {Geometry} geometry The image geometry.
   */
  run(imageBuffer, geometry) {
    // We can't just pass in an Image or we would get a circular dependency

    this.#threadPool.onworkitem = this.ondone;
    this.#threadPool.onwork = () => {};

    const workerTask = new LabelingWorkerTask(
      generateWorkerMessage(imageBuffer, geometry),
      {}
    );

    // add it the queue and run it
    this.#threadPool.addWorkerTask(workerTask);
  }

  /**
   * Trigger a labels recalculation for overlapping segments.
   * Spawns one worker task per segment for parallel execution.
   *
   * @param {{segNumber: number, size: Size, slices: {sliceIndex: number,
   *   data: Uint8Array}[]}[]} segments Per-segment raw slice data
   *   with global slice indices.
   * @param {Geometry} geometry The full image geometry.
   */
  runOverlap(segments, geometry) {
    const allLabels = [];

    this.#threadPool.onworkitem = (event) => {
      allLabels.push(...event.data.labels);
    };
    this.#threadPool.onwork = () => {
      this.ondone({data: {labels: allLabels}});
    };

    for (const {segNumber, size, slices} of segments) {
      const geoMsg = generateGeometryMessage(size, geometry.getSpacing());

      this.#threadPool.addWorkerTask(new LabelingWorkerTask(
        {segmentSlice: {segNumber, slices}, ...geoMsg},
        {}
      ));
    }
  }

  /**
   * Handle a completed labeling. Default behavior is do nothing,
   * this is meant to be overridden.
   *
   * @param {object} _event The work item event fired when a labeling
   *   calculation is completed. Event.data should contain a 'labels' item.
   */
  ondone(_event) {}
}
