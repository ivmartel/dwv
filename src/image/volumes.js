import {ThreadPool, WorkerTask} from '../utils/thread';

// doc imports
/* eslint-disable no-unused-vars */
import {App} from '../app/application';
/* eslint-enable no-unused-vars */

const ML_PER_MM = 0.001; // ml/mm^3

const volumesWorkerUrl = new URL('./volumesWorker.js', import.meta.url);

/**
 * Volumes (and other related values) calculator for segmentations.
 */
export class Volumes {

  /**
   * The associated application.
   *
   * @type {App}
   */
  #app;

  /**
   * The volume worker thread pool.
   *
   * @type {ThreadPool}
   */
  #threadPool = new ThreadPool(1);

  /**
   * @param {App} app The associated application.
   */
  constructor(app) {
    this.#app = app;

    this.#threadPool.onerror = ((e) => {
      console.error('Volume calculation failed!', e.error);
    });
  }

  /**
   * Trigger a volume recalculation.
   *
   * @param {string} maskDataId The data ID of the segmentation to
   *  calculate volumes for.
   */
  calculateVolumes(maskDataId) {
    this.#threadPool.onworkitem = this.onVolumeCalculation;
    const maskData = this.#app.getData(maskDataId);
    if (!maskData) {
      throw new Error(
        'No mask image to calculate segmentation volumes for ID: ' + maskDataId
      );
    }
    const image = maskData.image;

    // We can't pass these metadata objects directly, so we will just
    // pull out what we need and pass that.
    const currentGeometry = image.getGeometry();
    const currentSize = currentGeometry.getSize();
    const ndims = currentSize.length();

    // Cache the unit vector offsets to make a couple calculations faster.
    const unitVectors = Array(ndims).fill(0);
    for (let d = 0; d < ndims; d++) {
      unitVectors[d] = currentSize.getDimSize(d);
    }

    const sizes = Array(ndims).fill(0);
    for (let d = 0; d < ndims; d++) {
      sizes[d] = currentSize.get(d);
    }

    const totalSize = currentSize.getTotalSize();

    // Convert the voxel volumes to ml.
    const currentSpacing = currentGeometry.getSpacing();
    const mlVoxelVolume =
      currentSpacing.get(0) *
      currentSpacing.get(1) *
      currentSpacing.get(2) *
      ML_PER_MM;

    const workerTask = new WorkerTask(
      volumesWorkerUrl,
      {
        dataId: maskDataId,
        imageBuffer: image.getBuffer(),
        mlVoxelVolume: mlVoxelVolume,
        unitVectors: unitVectors,
        sizes: sizes,
        totalSize: totalSize
      },
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
   *   calculation is completed. Should contain a 'volumes' and 'dataId'
   *   item.
   */
  onVolumeCalculation(_event) {}
}