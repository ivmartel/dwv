import {ThreadPool, WorkerTask} from '../utils/thread';
import { Matrix33 } from '../math/matrix'
import { Index } from '../math/index';
import { Point3D } from '../math/point';
import { Geometry } from './geometry';
import { Size } from './size';
import { getTypedArray } from '../dicom/dicomParser';
import { Spacing } from './spacing';

//TODO temp
// import { calculateResample } from './resamplingWorker';

// doc imports
/* eslint-disable no-unused-vars */

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
 *
 * @returns {object} The message to send to the worker.
 */
export function generateWorkerMessage(inImageBuffer, inImageGeometry, outImageBuffer, outImageGeometry) {
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
    inOrigin:      inImageGeometry.getOrigin().getValues(),
    inSize:        inImageGeometry.getSize().getValues(),
    inSpacing:     inImageGeometry.getSpacing().getValues(),
    inOrientation: inImageGeometry.getOrientation().getValues(),
    inUnitVectors: inUnitVectors,
    inTotalSize:   inTotalSize,

    outImageBuffer:  outImageBuffer,
    outOrigin:       outImageGeometry.getOrigin().getValues(),
    outSize:         outImageGeometry.getSize().getValues(),
    outSpacing:      outImageGeometry.getSpacing().getValues(),
    outOrientation:  outImageGeometry.getOrientation().getValues(),
    outUnitVectors:  outUnitVectors,
    outTotalSize:    outTotalSize,

    interpolate: true // TODO: make configurable
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
   * @param {string} pixelRepresentation The pixel representation of the original image.
   * @param {Matrix33} outOrientation The orientation to resample to.
   */
  run(inImageBuffer, inImageGeometry, pixelRepresentation, outOrientation) {
    // We can't just pass in an Image or we would get a circular dependency

    const iOutOrientation = outOrientation.getInverse();
    const relativeMatrix = iOutOrientation.multiply(inImageGeometry.getOrientation());

    const inSize = inImageGeometry.getSize();
    const inSpacing = inImageGeometry.getSpacing();

    // Calculate updated spacing
    //---------------------------------
    const inSpacingArr = [
      inSpacing.get(0),
      inSpacing.get(1),
      inSpacing.get(2),
    ]

    const outSpacingArr = relativeMatrix.multiplyArray3D(inSpacingArr);
    const outSpacing = new Spacing(outSpacingArr);

    // Calculate updated size
    //---------------------------------
    // The index coords of the bound if the center was at 0,0
    const boundIndex = [
      (inSize.get(0) / 2.0) * inSpacing.get(0),
      (inSize.get(1) / 2.0) * inSpacing.get(1),
      (inSize.get(2) / 2.0) * inSpacing.get(2),
    ];

    const maxBounds = [0.0, 0.0, 0.0];
    const minBounds = [0.0, 0.0, 0.0];
    for (let x = -1; x <= 1; x+=2) {
      for (let y = -1; y <= 1; y+=2) {
        for (let z = -1; z <= 1; z+=2) {
          const boundPoint = new Point3D(
            boundIndex[0] * x,
            boundIndex[1] * y,
            boundIndex[2] * z,
          );

          const orientedBoundPoint = 
            relativeMatrix.multiplyPoint3D(boundPoint);

          maxBounds[0] = Math.max(maxBounds[0], orientedBoundPoint.getX());
          maxBounds[1] = Math.max(maxBounds[1], orientedBoundPoint.getY());
          maxBounds[2] = Math.max(maxBounds[2], orientedBoundPoint.getZ());
          minBounds[0] = Math.min(minBounds[0], orientedBoundPoint.getX());
          minBounds[1] = Math.min(minBounds[1], orientedBoundPoint.getY());
          minBounds[2] = Math.min(minBounds[2], orientedBoundPoint.getZ());
        }
      }
    }

    const outSize = new Size([
      Math.ceil(Math.abs((maxBounds[0] - minBounds[0]) / outSpacing.get(0))),
      Math.ceil(Math.abs((maxBounds[1] - minBounds[1]) / outSpacing.get(1))),
      Math.ceil(Math.abs((maxBounds[2] - minBounds[2]) / outSpacing.get(2)))
    ]);

    // Calculate updated origin
    //---------------------------------
    const outOriginIndexCentered = new Point3D(
      -(outSize.get(0)/2.0) * outSpacing.get(0),
      -(outSize.get(1)/2.0) * outSpacing.get(1),
      -(outSize.get(2)/2.0) * outSpacing.get(2),
    )
    const outOriginIndexOriented = relativeMatrix.getInverse().multiplyPoint3D(outOriginIndexCentered);

    const outOriginInIndex = new Index([
      Math.floor((outOriginIndexOriented.getX() / inSpacing.get(0)) + (inSize.get(0)/2.0)),
      Math.floor((outOriginIndexOriented.getY() / inSpacing.get(1)) + (inSize.get(0)/2.0)),
      Math.floor((outOriginIndexOriented.getZ() / inSpacing.get(2)) + (inSize.get(0)/2.0)),
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

    outImageBuffer.fill(100);
    
    const outImageGeometry = new Geometry(
      [ outOrigin ],
      outSize,
      outSpacing,
      outOrientation,
    );

    // TODO: TEMPORARY
    const workerMessage = 
      generateWorkerMessage(
        inImageBuffer, 
        inImageGeometry, 
        outImageBuffer, 
        outImageGeometry
      )

    this.#threadPool.onworkitem = this.ondone;
    
    const workerTask = new WorkerTask(
      resamplingWorkerUrl,
      workerMessage,
      {}
    );

    // add it the queue and run it
    this.#threadPool.addWorkerTask(workerTask);
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