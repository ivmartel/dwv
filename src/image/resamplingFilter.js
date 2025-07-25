
import {Matrix33, BIG_EPSILON} from '../math/matrix.js';

export class ResamplingFilter {
  /**
   * Simple bilinear sampling function.
   *
   * @param {number[]} point The index space point to sample.
   * @param {TypedArray} buffer The buffer to sample.
   * @param {number[]} size The buffer size.
   * @param {number[]} unitVectors The buffer offset space unit vectors.
   * @returns {number} The sampled value.
   */
  #bilinearSample(point, buffer, size, unitVectors) {
    // base point
    const q0x = Math.floor(point[0]);
    const q0y = Math.floor(point[1]);
    const q0z = Math.floor(point[2]);

    // bounding points indices
    const x0 = q0x < 0 ? 0 : q0x;
    const x1 = q0x + 1 >= size[0] ? q0x : q0x + 1;
    const y0 = q0y < 0 ? 0 : q0y;
    const y1 = q0y + 1 >= size[1] ? q0y : q0y + 1;
    const z0 = q0z < 0 ? 0 : q0z;
    const z1 = q0z + 1 >= size[2] ? q0z : q0z + 1;

    // bounding points offsets
    const x0v = x0 * unitVectors[0];
    const x1v = x1 * unitVectors[0];
    const y0v = y0 * unitVectors[1];
    const y1v = y1 * unitVectors[1];
    const z0v = z0 * unitVectors[2];
    const z1v = z1 * unitVectors[2];
    const off000 = x0v + y0v + z0v;
    const off001 = x0v + y0v + z1v;
    const off010 = x0v + y1v + z0v;
    const off011 = x0v + y1v + z1v;
    const off100 = x1v + y0v + z0v;
    const off101 = x1v + y0v + z1v;
    const off110 = x1v + y1v + z0v;
    const off111 = x1v + y1v + z1v;

    // bounding points values
    const x0ok = x0 >= 0 && x0 < size[0];
    const x1ok = x1 >= 0 && x1 < size[0];
    const y0ok = y0 >= 0 && y0 < size[1];
    const y1ok = y1 >= 0 && y1 < size[1];
    const z0ok = z0 >= 0 && z0 < size[2];
    const z1ok = z1 >= 0 && z1 < size[2];
    const v000 = (x0ok && y0ok && z0ok) ? buffer[off000] : 0;
    const v001 = (x0ok && y0ok && z1ok) ? buffer[off001] : 0;
    const v010 = (x0ok && y1ok && z0ok) ? buffer[off010] : 0;
    const v011 = (x0ok && y1ok && z1ok) ? buffer[off011] : 0;
    const v100 = (x1ok && y0ok && z0ok) ? buffer[off100] : 0;
    const v101 = (x1ok && y0ok && z1ok) ? buffer[off101] : 0;
    const v110 = (x1ok && y1ok && z0ok) ? buffer[off110] : 0;
    const v111 = (x1ok && y1ok && z1ok) ? buffer[off111] : 0;

    // interpolation weights
    const wx0 = Math.abs(point[0] - q0x);
    const wy0 = Math.abs(point[1] - q0y);
    const wz0 = Math.abs(point[2] - q0z);
    const wx1 = 1 - wx0;
    const wy1 = 1 - wy0;
    const wz1 = 1 - wz0;
    // per point
    const w000 = wx1 * wy1 * wz1;
    const w001 = wx1 * wy1 * wz0;
    const w010 = wx1 * wy0 * wz1;
    const w011 = wx1 * wy0 * wz0;
    const w100 = wx0 * wy1 * wz1;
    const w101 = wx0 * wy1 * wz0;
    const w110 = wx0 * wy0 * wz1;
    const w111 = wx0 * wy0 * wz0;

    // weighted sum
    return (
      v000 * w000 +
      v001 * w001 +
      v010 * w010 +
      v011 * w011 +
      v100 * w100 +
      v101 * w101 +
      v110 * w110 +
      v111 * w111
    );
  }

  /**
   * Round if the value is close enough to an integer.
   *
   * @param {number} value The value to round.
   * @returns {number} The rounded value.
   */
  #snapRound(value) {
    const rounded = Math.round(value);
    return Math.abs(value - rounded) < BIG_EPSILON ? rounded : value;
  }

  /**
   * Calculate the resampling.
   *
   * @param {object} workerMessage The worker message.
   */
  run(workerMessage) {
    const sourceSize = workerMessage.sourceSize;
    const targetSize = workerMessage.targetSize;
    const sourceUnitVectors = workerMessage.sourceUnitVectors;
    const targetUnitVectors = workerMessage.targetUnitVectors;
    const sourceSpacing = workerMessage.sourceSpacing;
    const targetSpacing = workerMessage.targetSpacing;

    const sourceImageBuffer = workerMessage.sourceImageBuffer;

    const interpolate = workerMessage.interpolate;

    // Can't pass them in as matrixes, so we need to re-create them
    const sourceMatrix = new Matrix33(workerMessage.sourceOrientation);
    const targetMatrix = new Matrix33(workerMessage.targetOrientation);

    const invSourceMatrix = sourceMatrix.getInverse();
    const relativeMatrix = targetMatrix.multiply(invSourceMatrix);

    const halfTargetSize = [
      (targetSize[0] - 1) / 2.0,
      (targetSize[1] - 1) / 2.0,
      (targetSize[2] - 1) / 2.0
    ];

    const halfSourceSize = [
      (sourceSize[0] - 1) / 2.0,
      (sourceSize[1] - 1) / 2.0,
      (sourceSize[2] - 1) / 2.0
    ];

    const centeredIndexPoint = new Array(3);
    const rotIndexPoint = new Array(3);
    const point = new Array(3);

    let targetOffX, targetOffXY, targetOffset;
    for (let x = 0; x < targetSize[0]; x++) {
      centeredIndexPoint[0] = (x - halfTargetSize[0]) * targetSpacing[0];
      targetOffX = targetUnitVectors[0] * x;
      for (let y = 0; y < targetSize[1]; y++) {
        centeredIndexPoint[1] = (y - halfTargetSize[1]) * targetSpacing[1];
        targetOffXY = targetOffX + targetUnitVectors[1] * y;
        for (let z = 0; z < targetSize[2]; z++) {
          centeredIndexPoint[2] = (z - halfTargetSize[2]) * targetSpacing[2];

          relativeMatrix.multiplyTypedArray3D(
            centeredIndexPoint, rotIndexPoint
          );

          point[0] = this.#snapRound(
            (rotIndexPoint[0] / sourceSpacing[0]) + halfSourceSize[0]
          );
          point[1] = this.#snapRound(
            (rotIndexPoint[1] / sourceSpacing[1]) + halfSourceSize[1]
          );
          point[2] = this.#snapRound(
            (rotIndexPoint[2] / sourceSpacing[2]) + halfSourceSize[2]
          );

          if (
            point[0] >= 0 && point[0] < sourceSize[0] &&
            point[1] >= 0 && point[1] < sourceSize[1] &&
            point[2] >= 0 && point[2] < sourceSize[2]
          ) {
            targetOffset = targetOffXY + targetUnitVectors[2] * z;

            if (interpolate) {
              // Bilinear
              const sample = this.#bilinearSample(
                point,
                sourceImageBuffer,
                sourceSize,
                sourceUnitVectors
              );
              workerMessage.targetImageBuffer[targetOffset] = sample;

            } else {
              // Nearest Neighbor
              const inOffset =
                (sourceUnitVectors[0] * Math.round(point[0])) +
                (sourceUnitVectors[1] * Math.round(point[1])) +
                (sourceUnitVectors[2] * Math.round(point[2]));

              workerMessage.targetImageBuffer[targetOffset] =
                workerMessage.sourceImageBuffer[inOffset];
            }
          }
        }
      }
    }
  }
}