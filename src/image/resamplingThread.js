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
 * @param {TypedArray} inImageBuffer The buffer to resample.
 * @param {Geometry} inImageGeometry The current image geometry.
 * @param {TypedArray} outImageBuffer The buffer to resample to.
 * @param {Geometry} outImageGeometry The geometry to resample to.
 * @param {[boolean]} interpolated Default true, if true use bilinear
 *  sampling, otherwise use nearest neighbor.
 *
 * @returns {object} The message to send to the worker.
 */
export function generateWorkerMessage(
  inImageBuffer,
  inImageGeometry,
  outImageBuffer,
  outImageGeometry,
  interpolated
) {
  // We can't pass these metadata objects directly, so we will just
  // pull out what we need and pass that.

  const inSize = inImageGeometry.getSize();
  const inNDims = inSize.length();
  const outSize = outImageGeometry.getSize();
  const outNDims = inSize.length();

  // Cache the unit vector offsets to make a couple calculations faster.
  const inUnitVectors = Array(inNDims).fill(0);
  for (let d = 0; d < inNDims; d++) {
    inUnitVectors[d] = inSize.getDimSize(d);
  }

  const outUnitVectors = Array(outNDims).fill(0);
  for (let d = 0; d < outNDims; d++) {
    outUnitVectors[d] = outSize.getDimSize(d);
  }

  const inTotalSize = inSize.getTotalSize();
  const outTotalSize = outSize.getTotalSize();

  return {
    inImageBuffer: inImageBuffer,
    inOrigin: inImageGeometry.getOrigin().getValues(),
    inSize: inImageGeometry.getSize().getValues(),
    inSpacing: inImageGeometry.getSpacing().getValues(),
    inOrientation: inImageGeometry.getOrientation().getValues(),
    inUnitVectors: inUnitVectors,
    inTotalSize: inTotalSize,

    outImageBuffer: outImageBuffer,
    outOrigin: outImageGeometry.getOrigin().getValues(),
    outSize: outImageGeometry.getSize().getValues(),
    outSpacing: outImageGeometry.getSpacing().getValues(),
    outOrientation: outImageGeometry.getOrientation().getValues(),
    outUnitVectors: outUnitVectors,
    outTotalSize: outTotalSize,

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
   * @param {TypedArray} inImageBuffer The buffer to resample.
   * @param {Geometry} inImageGeometry The current image geometry.
   * @param {string} pixelRepresentation The pixel representation
   *  of the original image.
   * @param {Matrix33} outOrientation The orientation to resample to.
   * @param {[boolean]} interpolated Default true, if true use bilinear
   *  sampling, otherwise use nearest neighbor.
   *
   * @returns {object} Updated buffer and geometry.
   */
  run(
    inImageBuffer,
    inImageGeometry,
    pixelRepresentation,
    outOrientation,
    interpolated = true
  ) {
    // We can't just pass in an Image or we would get a circular dependency

    const iOutOrientation = outOrientation.getInverse();
    const relativeMatrix =
      iOutOrientation.multiply(inImageGeometry.getOrientation());

    const inSize = inImageGeometry.getSize();
    const inSpacing = inImageGeometry.getSpacing();

    // Calculate updated spacing
    //---------------------------------
    const inSpacingArr = inSpacing.getValues();

    // Calculate the bounds of the rotated pixel volume
    const maxSpacingBounds = [0.0, 0.0, 0.0];
    const minSpacingBounds = [0.0, 0.0, 0.0];
    for (let x = 0; x <= 1; x++) {
      for (let y = 0; y <= 1; y++) {
        for (let z = 0; z <= 1; z++) {
          const boundPoint = new Point3D(
            inSpacingArr[0] * x,
            inSpacingArr[1] * y,
            inSpacingArr[2] * z,
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

    const outSpacingArrMax = [
      Math.abs(maxSpacingBounds[0] - minSpacingBounds[0]),
      Math.abs(maxSpacingBounds[1] - minSpacingBounds[1]),
      Math.abs(maxSpacingBounds[2] - minSpacingBounds[2])
    ];

    // Maintain the ratio of the new bounds, but the
    // per pixel volume of the original.
    const outSpacingMaxVolume =
      outSpacingArrMax[0] *
      outSpacingArrMax[1] *
      outSpacingArrMax[2];

    const inSpacingVolume =
      inSpacingArr[0] *
      inSpacingArr[1] *
      inSpacingArr[2];

    const volumeRatio = Math.cbrt(inSpacingVolume / outSpacingMaxVolume);

    const outSpacingArr = [
      outSpacingArrMax[0] * volumeRatio,
      outSpacingArrMax[1] * volumeRatio,
      outSpacingArrMax[2] * volumeRatio
    ];

    const outSpacing = new Spacing(outSpacingArr);

    // Calculate updated size
    //---------------------------------
    // The index coords of the bound if the center was at 0,0
    const boundIndex = [
      (inSize.get(0) / 2.0) * inSpacing.get(0),
      (inSize.get(1) / 2.0) * inSpacing.get(1),
      (inSize.get(2) / 2.0) * inSpacing.get(2),
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

    const outSize = new Size([
      Math.round(Math.abs((maxBounds[0] - minBounds[0]) / outSpacing.get(0))),
      Math.round(Math.abs((maxBounds[1] - minBounds[1]) / outSpacing.get(1))),
      Math.round(Math.abs((maxBounds[2] - minBounds[2]) / outSpacing.get(2)))
    ]);

    // Calculate updated origin
    //---------------------------------
    const outOriginIndexCentered = new Point3D(
      (0 - (outSize.get(0) / 2.0)) * outSpacing.get(0),
      (0 - (outSize.get(1) / 2.0)) * outSpacing.get(1),
      (0 - (outSize.get(2) / 2.0)) * outSpacing.get(2),
    );
    const outOriginIndexOriented =
      relativeMatrix.getInverse().multiplyPoint3D(outOriginIndexCentered);

    const outOriginInIndex = new Index([
      Math.floor(
        (outOriginIndexOriented.getX() / inSpacing.get(0)) +
        (inSize.get(0) / 2.0)
      ),
      Math.floor(
        (outOriginIndexOriented.getY() / inSpacing.get(1)) +
        (inSize.get(1) / 2.0)
      ),
      Math.floor(
        (outOriginIndexOriented.getZ() / inSpacing.get(2)) +
        (inSize.get(2) / 2.0)
      ),
    ]);
    const outOrigin = inImageGeometry.indexToWorld(outOriginInIndex).get3D();

    // Generate new image
    //---------------------------------
    const outImageBuffer = getTypedArray(
      inImageBuffer.BYTES_PER_ELEMENT * 8,
      pixelRepresentation,
      outSize.getTotalSize());

    if (outImageBuffer === null) {
      throw new Error('Cannot reallocate data for image resampling.');
    }

    outImageBuffer.fill(0);

    const outImageGeometry = new Geometry(
      [outOrigin],
      outSize,
      outSpacing,
      outOrientation,
    );

    const workerMessage =
      generateWorkerMessage(
        inImageBuffer,
        inImageGeometry,
        outImageBuffer,
        outImageGeometry,
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
      buffer: outImageBuffer,
      geometry: outImageGeometry
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