import {ThreadPool, WorkerTask} from '../utils/thread.js';
import {Point3D} from '../math/point.js';
import {Geometry} from './geometry.js';
import {Size} from './size.js';
import {getTypedArray} from '../dicom/dicomParser.js';
import {Spacing} from './spacing.js';

// doc imports
/* eslint-disable no-unused-vars */
import {Matrix33} from '../math/matrix.js';
import {Point} from '../math/point.js';
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
 * Resampling worker task.
 */
class ResamplingWorkerTask extends WorkerTask {
  constructor(message, info) {
    super(message, info);
  }
  getWorker() {
    return new Worker(
      new URL('./resampling.worker.js', import.meta.url),
      {
        name: 'resampling.worker'
      }
    );
  }
}

/**
 * Generate a worker message to send to the resampling worker.
 *
 * @param {TypedArray} sourceImageBuffer The buffer to resample.
 * @param {Geometry} sourceImageGeometry The current image geometry.
 * @param {TypedArray} targetImageBuffer The buffer to resample to.
 * @param {Geometry} targetImageGeometry The geometry to resample to.
 * @param {boolean} interpolated If true use bilinear
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
  const targetNDims = targetSize.length();

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
 * Generate the geometry of the resampled image.
 *
 * @param {Geometry} sourceImageGeometry The current image geometry.
 * @param {Matrix33} targetOrientation The target image orientation.
 * @param {Point|undefined} centerOfRotation World space center of rotation.
 *
 * @returns {Geometry} The new geometry.
 */
export function generateResampledGeometry(
  sourceImageGeometry,
  targetOrientation,
  centerOfRotation = undefined
) {
  const sourceOrientation = sourceImageGeometry.getOrientation();
  const invTargetOrientation = targetOrientation.getInverse();
  const relativeMatrix = invTargetOrientation.multiply(sourceOrientation);

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
    Math.round(
      Math.abs((maxBounds[0] - minBounds[0]) / targetSpacing.get(0))
    ),
    Math.round(
      Math.abs((maxBounds[1] - minBounds[1]) / targetSpacing.get(1))
    ),
    Math.round(
      Math.abs((maxBounds[2] - minBounds[2]) / targetSpacing.get(2))
    )
  ]);

  // Calculate updated origin
  //---------------------------------
  // Basic version of the calculation:
  // (centerTarget*scaleTarget)*orientationTarget + originTarget =
  //  (centerSource*scaleSource)*orientationSource + originSource
  // so
  // oT = (cS*sS)*RS + oS - (cT*sT)*RT

  const sourceCenterIndex =
    typeof centerOfRotation === 'undefined'
      ? new Point3D(
        sourceSize.get(0) / 2.0,
        sourceSize.get(1) / 2.0,
        sourceSize.get(2) / 2.0
      )
      : sourceImageGeometry.worldToPoint(centerOfRotation);

  const targetCenterIndexArr = [0, 0, 0];
  if (typeof centerOfRotation === 'undefined') {
    // Center of rotation === Center of source
    // Math is much simpler
    targetCenterIndexArr[0] = targetSize.get(0) / 2.0;
    targetCenterIndexArr[1] = targetSize.get(1) / 2.0;
    targetCenterIndexArr[2] = targetSize.get(2) / 2.0;

  } else {
    const relativeSourceCenterOffsetArr = [
      (sourceCenterIndex.getX() - (sourceSize.get(0) / 2.0)) *
      sourceSpacing.get(0),
      (sourceCenterIndex.getY() - (sourceSize.get(1) / 2.0)) *
      sourceSpacing.get(1),
      (sourceCenterIndex.getZ() - (sourceSize.get(2) / 2.0)) *
      sourceSpacing.get(2)
    ];

    const relativeTargetCenterOffsetArr =
      relativeMatrix.multiplyArray3D(relativeSourceCenterOffsetArr);

    targetCenterIndexArr[0] =
      (relativeTargetCenterOffsetArr[0] / targetSpacing.get(0)) +
      (targetSize.get(0) / 2.0);
    targetCenterIndexArr[1] =
      (relativeTargetCenterOffsetArr[1] / targetSpacing.get(1)) +
      (targetSize.get(1) / 2.0);
    targetCenterIndexArr[2] =
      (relativeTargetCenterOffsetArr[2] / targetSpacing.get(2)) +
      (targetSize.get(2) / 2.0);
  }

  const targetCenterIndexSpaced = new Point3D(
    targetCenterIndexArr[0] * targetSpacing.get(0),
    targetCenterIndexArr[1] * targetSpacing.get(1),
    targetCenterIndexArr[2] * targetSpacing.get(2)
  );
  const targetCenterPointLocal =
    targetOrientation.multiplyPoint3D(targetCenterIndexSpaced);

  const sourceCenterPoint =
    sourceImageGeometry.pointToWorld(sourceCenterIndex);

  const targetOrigin = new Point3D(
    sourceCenterPoint.getX() - targetCenterPointLocal.getX(),
    sourceCenterPoint.getY() - targetCenterPointLocal.getY(),
    sourceCenterPoint.getZ() - targetCenterPointLocal.getZ()
  );

  const unitVector = [0, 0, targetSpacing.get(2)];
  const targetUnit = targetOrientation.multiplyArray3D(unitVector);

  const targetOrigins = [];
  for (let z = 0; z < targetSize.get(2); z++) {
    targetOrigins.push(new Point3D(
      targetOrigin.getX() + (targetUnit[0] * z),
      targetOrigin.getY() + (targetUnit[1] * z),
      targetOrigin.getZ() + (targetUnit[2] * z)
    ));
  }

  return new Geometry(
    targetOrigins,
    targetSize,
    targetSpacing,
    targetOrientation,
  );
}

/**
 * Generate the buffer for the resampled image.
 *
 * @param {TypedArray} sourceImageBuffer The current image buffer.
 * @param {number} pixelRepresentation The source image pixel representation.
 * @param {Size} targetSize The size of the target.
 *
 * @returns {TypedArray} The new buffer.
 */
export function generateBuffer(
  sourceImageBuffer,
  pixelRepresentation,
  targetSize
) {
  const targetImageBuffer = getTypedArray(
    sourceImageBuffer.BYTES_PER_ELEMENT * 8,
    pixelRepresentation,
    targetSize.getTotalSize()
  );

  if (targetImageBuffer === null) {
    throw new Error('Cannot reallocate data for image resampling.');
  }

  targetImageBuffer.fill(0);

  return targetImageBuffer;
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
   * @param {number} pixelRepresentation The pixel representation
   *  of the original image.
   * @param {Matrix33} targetOrientation The orientation to resample to.
   * @param {boolean} interpolated If true use bilinear
   *  sampling, otherwise use nearest neighbor.
   * @param {Point|undefined} centerOfRotation World space center of rotation.
   *
   * @returns {object} Updated buffer and geometry.
   */
  run(
    sourceImageBuffer,
    sourceImageGeometry,
    pixelRepresentation,
    targetOrientation,
    interpolated,
    centerOfRotation = undefined
  ) {
    // We can't just pass in an Image or we would get a circular dependency

    const targetImageGeometry =
      generateResampledGeometry(
        sourceImageGeometry,
        targetOrientation,
        centerOfRotation
      );

    const targetImageBuffer =
      generateBuffer(
        sourceImageBuffer,
        pixelRepresentation,
        targetImageGeometry.getSize()
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

    const workerTask = new ResamplingWorkerTask(workerMessage, {});

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