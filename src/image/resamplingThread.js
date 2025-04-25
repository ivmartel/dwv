import {ThreadPool, WorkerTask} from '../utils/thread';
import { Matrix33 } from '../math/matrix'
import { Index } from '../math/index';
import { Point3D } from '../math/point';
import { Geometry } from './geometry';
import { Size } from './size';
import { getTypedArray } from '../dicom/dicomParser';

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

// const resamplingWorkerUrl = new URL('./resamplingWorker.js', import.meta.url);

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
    outTotalSize:    outTotalSize
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
   * Simple bilinear sampling function
   *
   * @param {TypedArray} buffer The buffer to sample.
   * @param {number[]} unitVectors The buffer offset space unit vectors.
   * @param {number[]} point The index space point to sample
   */
  #bilinearSample(buffer, unitVectors, point) {
    const q0Index = [
      Math.round(point[0]),
      Math.round(point[1]),
      Math.round(point[2])
    ]

    const weights = [
      Math.abs(point[0] - q0Index[0]),
      Math.abs(point[1] - q0Index[1]),
      Math.abs(point[2] - q0Index[2])
    ]

    const xMeans = [0.0, 0.0];
    for (let x = 0; x < 2; x++) {
      const yMeans = [0.0, 0.0];
      for (let y = 0; y < 2; y++) {
        const zValues = [0.0, 0.0];
        for (let z = 0; z < 2; z++) {
          const sampleOffset = 
            ((q0Index[0] + x) * unitVectors[0]) +
            ((q0Index[1] + y) * unitVectors[1]) +
            ((q0Index[2] + z) * unitVectors[2]);

          zValues[z] = buffer[sampleOffset];
        }

        yMeans[y] = (zValues[1] * weights[2]) +
                    (zValues[0] * (1 - weights[2]));
      }

      xMeans[x] = (yMeans[1] * weights[1]) +
                  (yMeans[0] * (1 - weights[1]));
    }

    return (xMeans[1] * weights[0]) +
           (xMeans[0] * (1 - weights[0]));
  }

  /**
   * TODO: TEMPORARY
   * Calculate the resampling syncronously
   *
   * @param {object} workerMessage The worker message.
   */
  #calculateResample(workerMessage) {
    const inSize = workerMessage.inSize;
    const outSize = workerMessage.outSize;
    const inUnitVectors = workerMessage.inUnitVectors;
    const outUnitVectors = workerMessage.outUnitVectors;

    // Can't pass them in as matrixes, so we need to re-create them
    const inMatrix = new Matrix33(workerMessage.inOrientation);
    const outMatrix = new Matrix33(workerMessage.outOrientation);

    const ioutMatrix = outMatrix.getInverse();
    const relativeMatrix = ioutMatrix.multiply(inMatrix);

    console.log(relativeMatrix.getValues());

    for (let x = 0; x < outSize[0]; x++) {
      for (let y = 0; y < outSize[1]; y++) {
        for (let z = 0; z < outSize[2]; z++) {
          const outIndexPoint = [x, y, z];

          const centeredIndexPoint = [
            outIndexPoint[0] - (outSize[0] / 2.0),
            outIndexPoint[1] - (outSize[1] / 2.0),
            outIndexPoint[2] - (outSize[2] / 2.0)
          ];

          const rotIndexPoint =
            relativeMatrix.multiplyArray3D(centeredIndexPoint);

          const inIndexPoint = [
            rotIndexPoint[0] + (inSize[0] / 2.0),
            rotIndexPoint[1] + (inSize[1] / 2.0),
            rotIndexPoint[2] + (inSize[2] / 2.0)
          ];

          if (!(
            inIndexPoint[0] < 0 ||
            inIndexPoint[0] >= inSize[0] ||
            inIndexPoint[1] < 0 ||
            inIndexPoint[1] >= inSize[1] ||
            inIndexPoint[2] < 0 ||
            inIndexPoint[2] >= inSize[2]
          )) {
            const outOffset =
              (outUnitVectors[0] * outIndexPoint[0]) +
              (outUnitVectors[1] * outIndexPoint[1]) +
              (outUnitVectors[2] * outIndexPoint[2]);

            // const inOffset =
            //   (inUnitVectors[0] * Math.round(inIndexPoint[0])) +
            //   (inUnitVectors[1] * Math.round(inIndexPoint[1])) +
            //   (inUnitVectors[2] * Math.round(inIndexPoint[2]));

            // workerMessage.outImageBuffer[outOffset] = workerMessage.inImageBuffer[inOffset];

            const sample = this.#bilinearSample(workerMessage.inImageBuffer, inUnitVectors, inIndexPoint);
            workerMessage.outImageBuffer[outOffset] = sample;
          } else {
            // console.log("Sample out of bounds, ignoring...", inIndexPoint, outIndexPoint);
          }
        }
      }
    }
  }

  /**
   * Trigger a resampling.
   *
   * @param {TypedArray} inImageBuffer The buffer to resample.
   * @param {Geometry} inImageGeometry The current image geometry.
   * @param {Object<string, any>} inMeta The metadata of the original image.
   * @param {Matrix33} outOrientation The orientation to resample to.
   * 
   * @returns {object} The transformed image.
   */
  run(inImageBuffer, inImageGeometry, inMeta, outOrientation) {
    // We can't just pass in an Image or we would get a circular dependency

    // this.#threadPool.onworkitem = this.ondone;

    // const workerTask = new WorkerTask(
    //   resamplingWorkerUrl,
    //   generateWorkerMessage(
    //     inImageBuffer, 
    //     inImageGeometry, 
    //     outImageBuffer, 
    //     outImageGeometry
    //   ),
    //   {}
    // );

    // // add it the queue and run it
    // this.#threadPool.addWorkerTask(workerTask);

    const iOutOrientation = outOrientation.getInverse();
    const relativeMatrix = iOutOrientation.multiply(inImageGeometry.getOrientation());

    const inSize = inImageGeometry.getSize();

    // The index coords of the bound if the center was at 0,0
    const boundIndex = [
      inSize.get(0) / 2.0,
      inSize.get(1) / 2.0,
      inSize.get(2) / 2.0,
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
      Math.ceil(Math.abs(maxBounds[0] - minBounds[0])),
      Math.ceil(Math.abs(maxBounds[1] - minBounds[1])),
      Math.ceil(Math.abs(maxBounds[2] - minBounds[2]))
    ]);

    // TODO: The output image should be resized to prevent clipping
    // const outImageBuffer = inImageBuffer.slice(0);

    const outImageBuffer = getTypedArray(
      inImageBuffer.BYTES_PER_ELEMENT * 8,
      inMeta.PixelRepresentation,
      outSize.getTotalSize());
      
    if (outImageBuffer === null) {
      throw new Error('Cannot reallocate data for image resampling.');
    }

    outImageBuffer.fill(0);

    console.log('POKE', outSize, outImageBuffer);


    /// ------------------- Origin shit
    const outOriginInIndex = new Index([
      inSize.get(0) - outSize.get(0),
      inSize.get(1) - outSize.get(1),
      inSize.get(2) - outSize.get(2),
    ]);
    const worldOutOriginIn = inImageGeometry.indexToWorld(outOriginInIndex).get3D();
    const outOrigin = relativeMatrix.multiplyPoint3D(worldOutOriginIn);


    // const inOrigin = inImageGeometry.getOrigin();
    // const inSize = inImageGeometry.getSize();
    // const centerIndex = new Index([
    //   inSize.get(0) / 2.0,
    //   inSize.get(1) / 2.0,
    //   inSize.get(2) / 2.0,
    // ]);
    // const worldCenter = inImageGeometry.indexToWorld(centerIndex).get3D();
    // const inOriginCenter = inOrigin.minus(worldCenter);
    // const outOriginCenter = relativeMatrix.multiplyVector3D(inOriginCenter);
    // const outOrigin = new Point3D(
    //   outOriginCenter.getX() + worldCenter.getX(),
    //   outOriginCenter.getY() + worldCenter.getY(),
    //   outOriginCenter.getZ() + worldCenter.getZ(),
    // );

    // console.log("POKE", inOrigin, worldCenter, inOriginCenter, outOriginCenter, outOrigin);
    /// -------------------

    const outImageGeometry = new Geometry(
      [ inImageGeometry.getOrigin() ],
      // [ outOrigin ],
      // inImageGeometry.getSize(),
      outSize,
      inImageGeometry.getSpacing(),
      // inImageGeometry.getOrientation()
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

    this.#calculateResample(workerMessage);

    console.log("POKE out orientation", outOrientation);

    const fakeImageGeometry = new Geometry(
      inImageGeometry.getOrigins(),
      // [ outOrigin ],
      // inImageGeometry.getSize(),
      outSize,
      inImageGeometry.getSpacing(),
      inImageGeometry.getOrientation(),
      // outOrientation
    );

    // TODO: this should be returned in the callback
    return { geometry: fakeImageGeometry, buffer: outImageBuffer };
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