import {ThreadPool, WorkerTask} from '../utils/thread';
import {Index} from '../math/index';
import {Point3D} from '../math/point';
import {Geometry} from './geometry';
import {Size} from './size';
import {getTypedArray} from '../dicom/dicomParser';
import {Spacing} from './spacing';

// doc imports
/* eslint-disable no-unused-vars */
import {Matrix33} from '../math/matrix';
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

const resamplingWorkerUrl = new URL('./resamplingWorker.js', import.meta.url);

/**
 * Generate a worker message to send to the resampling worker.
 *
 * @param {TypedArray} sourceImageBuffer The buffer to resample.
 * @param {Geometry} sourceImageGeometry The current image geometry.
 * @param {TypedArray} targetImageBuffer The buffer to resample to.
 * @param {Geometry} targetImageGeometry The geometry to resample to.
 * @param {[boolean]} interpolated Default true, if true use bilinear
 *  sampling, otherwise use nearest neighbor.
 *
 * @returns {object} The message to send to the worker.
 */
export function generateWorkerMessage(
  sourceImageBuffer,
  sourceImageGeometry,
  targetImageBuffer,
  targetImageGeometry,
  interpolated
) {
  // We can't pass these metadata objects directly, so we will just
  // pull out what we need and pass that.

  const sourceSize = sourceImageGeometry.getSize();
  const sourceNDims = sourceSize.length();
  const targetSize = targetImageGeometry.getSize();
  const targetNDims = sourceSize.length();

  // Cache the unit vector offsets to make a couple calculations faster.
  const sourceUnitVectors = Array(sourceNDims).fill(0);
  for (let d = 0; d < sourceNDims; d++) {
    sourceUnitVectors[d] = sourceSize.getDimSize(d);
  }

  const targetUnitVectors = Array(targetNDims).fill(0);
  for (let d = 0; d < targetNDims; d++) {
    targetUnitVectors[d] = targetSize.getDimSize(d);
  }

  const sourceTotalSize = sourceSize.getTotalSize();
  const targetTotalSize = targetSize.getTotalSize();

  return {
    sourceImageBuffer: sourceImageBuffer,
    sourceOrigin: sourceImageGeometry.getOrigin().getValues(),
    sourceSize: sourceImageGeometry.getSize().getValues(),
    sourceSpacing: sourceImageGeometry.getSpacing().getValues(),
    sourceOrientation: sourceImageGeometry.getOrientation().getValues(),
    sourceUnitVectors: sourceUnitVectors,
    sourceTotalSize: sourceTotalSize,

    targetImageBuffer: targetImageBuffer,
    targetOrigin: targetImageGeometry.getOrigin().getValues(),
    targetSize: targetImageGeometry.getSize().getValues(),
    targetSpacing: targetImageGeometry.getSpacing().getValues(),
    targetOrientation: targetImageGeometry.getOrientation().getValues(),
    targetUnitVectors: targetUnitVectors,
    targetTotalSize: targetTotalSize,

    interpolate: interpolated
  };
}

/**
 * Resampling thread.
 */
export class ResamplingThread {
  /**
   * The thread pool.
   *
   * @type {ThreadPool}
   */
  #threadPool = new ThreadPool(1);

  constructor() {
    this.#threadPool.onerror = ((e) => {
      console.error('Resampling failed!', e.error);
    });
  }

  /**
   * Trigger a resampling.
   *
   * @param {TypedArray} sourceImageBuffer The buffer to resample.
   * @param {Geometry} sourceImageGeometry The current image geometry.
   * @param {string} pixelRepresentation The pixel representation
   *  of the original image.
   * @param {Matrix33} targetOrientation The orientation to resample to.
   * @param {[boolean]} interpolated Default true, if true use bilinear
   *  sampling, otherwise use nearest neighbor.
   *
   * @returns {object} Updated buffer and geometry.
   */
  run(
    sourceImageBuffer,
    sourceImageGeometry,
    pixelRepresentation,
    targetOrientation,
    interpolated = true
  ) {
    // We can't just pass in an Image or we would get a circular dependency

    const invTargetOrientation = targetOrientation.getInverse();
    const relativeMatrix =
      invTargetOrientation.multiply(sourceImageGeometry.getOrientation());

    const sourceSize = sourceImageGeometry.getSize();
    const sourceSpacing = sourceImageGeometry.getSpacing();

    // Calculate updated spacing
    //---------------------------------
    const sourceSpacingArr = sourceSpacing.getValues();

    // Calculate the bounds of the rotated pixel volume
    const maxSpacingBounds = [0.0, 0.0, 0.0];
    const minSpacingBounds = [0.0, 0.0, 0.0];
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          const boundPoint = new Point3D(
            sourceSpacingArr[0] * x,
            sourceSpacingArr[1] * y,
            sourceSpacingArr[2] * z,
          );

          const orientedBoundPoint =
            relativeMatrix.multiplyPoint3D(boundPoint);

          maxSpacingBounds[0] =
            Math.max(maxSpacingBounds[0], orientedBoundPoint.getX());
          maxSpacingBounds[1] =
            Math.max(maxSpacingBounds[1], orientedBoundPoint.getY());
          maxSpacingBounds[2] =
            Math.max(maxSpacingBounds[2], orientedBoundPoint.getZ());
          minSpacingBounds[0] =
            Math.min(minSpacingBounds[0], orientedBoundPoint.getX());
          minSpacingBounds[1] =
            Math.min(minSpacingBounds[1], orientedBoundPoint.getY());
          minSpacingBounds[2] =
            Math.min(minSpacingBounds[2], orientedBoundPoint.getZ());
        }
      }
    }

    const targetSpacingArrMax = [
      Math.abs(maxSpacingBounds[0] - minSpacingBounds[0]),
      Math.abs(maxSpacingBounds[1] - minSpacingBounds[1]),
      Math.abs(maxSpacingBounds[2] - minSpacingBounds[2])
    ];

    // Maintain the ratio of the new bounds, but the
    // per pixel volume of the original.
    const targetSpacingMaxVolume =
      targetSpacingArrMax[0] *
      targetSpacingArrMax[1] *
      targetSpacingArrMax[2];

    const sourceSpacingVolume =
      sourceSpacingArr[0] *
      sourceSpacingArr[1] *
      sourceSpacingArr[2];

    const volumeRatio = Math.cbrt(sourceSpacingVolume / targetSpacingMaxVolume);

    const targetSpacingArr = [
      targetSpacingArrMax[0] * volumeRatio,
      targetSpacingArrMax[1] * volumeRatio,
      targetSpacingArrMax[2] * volumeRatio
    ];

    const targetSpacing = new Spacing(targetSpacingArr);

    // Calculate updated size
    //---------------------------------
    // The index coords of the bound if the center was at 0,0
    const boundIndex = [
      (sourceSize.get(0) / 2.0) * sourceSpacing.get(0),
      (sourceSize.get(1) / 2.0) * sourceSpacing.get(1),
      (sourceSize.get(2) / 2.0) * sourceSpacing.get(2),
    ];

    let firstValue = true;
    const maxBounds = [0.0, 0.0, 0.0];
    const minBounds = [0.0, 0.0, 0.0];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          const boundPoint = new Point3D(
            boundIndex[0] * x,
            boundIndex[1] * y,
            boundIndex[2] * z,
          );

          const orientedBoundPoint =
            relativeMatrix.multiplyPoint3D(boundPoint);

          if (firstValue) {
            maxBounds[0] = orientedBoundPoint.getX();
            maxBounds[1] = orientedBoundPoint.getY();
            maxBounds[2] = orientedBoundPoint.getZ();
            minBounds[0] = orientedBoundPoint.getX();
            minBounds[1] = orientedBoundPoint.getY();
            minBounds[2] = orientedBoundPoint.getZ();
            firstValue = false;
          } else {
            maxBounds[0] = Math.max(maxBounds[0], orientedBoundPoint.getX());
            maxBounds[1] = Math.max(maxBounds[1], orientedBoundPoint.getY());
            maxBounds[2] = Math.max(maxBounds[2], orientedBoundPoint.getZ());
            minBounds[0] = Math.min(minBounds[0], orientedBoundPoint.getX());
            minBounds[1] = Math.min(minBounds[1], orientedBoundPoint.getY());
            minBounds[2] = Math.min(minBounds[2], orientedBoundPoint.getZ());
          }
        }
      }
    }

    const targetSize = new Size([
      Math.round(Math.abs((maxBounds[0] - minBounds[0]) / targetSpacing.get(0))),
      Math.round(Math.abs((maxBounds[1] - minBounds[1]) / targetSpacing.get(1))),
      Math.round(Math.abs((maxBounds[2] - minBounds[2]) / targetSpacing.get(2)))
    ]);

    // Calculate updated origin
    //---------------------------------
    const targetOriginIndexCentered = new Point3D(
      (0 - (targetSize.get(0) / 2.0)) * targetSpacing.get(0),
      (0 - (targetSize.get(1) / 2.0)) * targetSpacing.get(1),
      (0 - (targetSize.get(2) / 2.0)) * targetSpacing.get(2),
    );
    const targetOriginIndexOriented =
      relativeMatrix.getInverse().multiplyPoint3D(targetOriginIndexCentered);

    const targetOriginSourceIndex = new Index([
      Math.floor(
        (targetOriginIndexOriented.getX() / sourceSpacing.get(0)) +
        (sourceSize.get(0) / 2.0)
      ),
      Math.floor(
        (targetOriginIndexOriented.getY() / sourceSpacing.get(1)) +
        (sourceSize.get(1) / 2.0)
      ),
      Math.floor(
        (targetOriginIndexOriented.getZ() / sourceSpacing.get(2)) +
        (sourceSize.get(2) / 2.0)
      ),
    ]);
    const targetOrigin = sourceImageGeometry.indexToWorld(targetOriginSourceIndex).get3D();

    // Generate new image
    //---------------------------------
    const targetImageBuffer = getTypedArray(
      sourceImageBuffer.BYTES_PER_ELEMENT * 8,
      pixelRepresentation,
      targetSize.getTotalSize());

    if (targetImageBuffer === null) {
      throw new Error('Cannot reallocate data for image resampling.');
    }

    targetImageBuffer.fill(0);

    const targetImageGeometry = new Geometry(
      [targetOrigin],
      targetSize,
      targetSpacing,
      targetOrientation,
    );

    const workerMessage =
      generateWorkerMessage(
        sourceImageBuffer,
        sourceImageGeometry,
        targetImageBuffer,
        targetImageGeometry,
        interpolated
      );

    this.#threadPool.onworkitem = this.ondone;

    const workerTask = new WorkerTask(
      resamplingWorkerUrl,
      workerMessage,
      {}
    );

    // add it the queue and run it
    this.#threadPool.addWorkerTask(workerTask);

    return {
      buffer: targetImageBuffer,
      geometry: targetImageGeometry
    };
  }

  /**
   * Handle a completed resampling. Default behavior is do nothing,
   * this is meant to be overridden.
   *
   * @param {object} _event The work item event fired when a resampling
   *   calculation is completed.
   */
  ondone(_event) {}
}