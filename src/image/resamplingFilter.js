
import {Matrix33, BIG_EPSILON} from '../math/matrix.js';

/**
 * Get the first value of an array.
 *
 * @param {number[]} values The input array.
 * @returns {number} The first value.
 */
function get0(values) {
  return values[0];
};
/**
 * Get the second value of an array.
 *
 * @param {number[]} values The input array.
 * @returns {number} The second value.
 */
function get1(values) {
  return values[1];
};
/**
 * Get a weighting func.
 *
 * @param {number} weight The weight.
 * @returns {Function} The weight function.
 */
function getWeightFunc(weight) {
  return (values) =>
    (values[1] * weight) + (values[0] * (1 - weight));
}

export class ResamplingFilter {
  /**
   * Simple bilinear sampling function.
   *
   * @param {TypedArray} buffer The buffer to sample.
   * @param {number[]} unitVectors The buffer offset space unit vectors.
   * @param {number[]} size The buffer size.
   * @param {number[]} point The index space point to sample.
   *
   * @returns {number} The sampled value.
   */
  #bilinearSample(buffer, unitVectors, size, point) {
    const q0IndexX = Math.floor(point[0]);
    const q0IndexY = Math.floor(point[1]);
    const q0IndexZ = Math.floor(point[2]);

    const wx = Math.abs(point[0] - q0IndexX);
    const wy = Math.abs(point[1] - q0IndexY);
    const wz = Math.abs(point[2] - q0IndexZ);

    let getYMean = getWeightFunc(wz);
    if (q0IndexZ < 0) {
      getYMean = get1;
    } else if (q0IndexZ + 1 >= size[2]) {
      getYMean = get0;
    }

    let getXMean = getWeightFunc(wy);
    if (q0IndexY < 0) {
      getXMean = get1;
    } else if (q0IndexY + 1 >= size[1]) {
      getXMean = get0;
    }

    let getMean = getWeightFunc(wx);
    if (q0IndexX < 0) {
      getMean = get1;
    } else if (q0IndexX + 1 >= size[0]) {
      getMean = get0;
    }

    let zIndex;
    let offX, offXY;
    const xMeans = [0.0, 0.0];
    let yMeans, zValues;
    for (let x = 0; x < 2; x++) {
      offX = (q0IndexX + x) * unitVectors[0];
      yMeans = [0.0, 0.0];
      for (let y = 0; y < 2; y++) {
        offXY = offX + (q0IndexY + y) * unitVectors[1];
        zValues = [0.0, 0.0];
        for (let z = 0; z < 2; z++) {
          zIndex = q0IndexZ + z;
          if (
            zIndex >= 0 && zIndex < size[2]
          ) {
            zValues[z] = buffer[offXY + zIndex * unitVectors[2]];
          } else {
            zValues[z] = 0;
          }
        }
        yMeans[y] = getYMean(zValues);
      }
      xMeans[x] = getXMean(yMeans);
    }

    return getMean(xMeans);
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
  calculateResample(workerMessage) {
    const sourceSize = workerMessage.sourceSize;
    const targetSize = workerMessage.targetSize;
    const sourceUnitVectors = workerMessage.sourceUnitVectors;
    const targetUnitVectors = workerMessage.targetUnitVectors;
    const sourceSpacing = workerMessage.sourceSpacing;
    const targetSpacing = workerMessage.targetSpacing;

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

    let sx, sy, sz;
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

          sx = this.#snapRound(
            (rotIndexPoint[0] / sourceSpacing[0]) + halfSourceSize[0]
          );
          sy = this.#snapRound(
            (rotIndexPoint[1] / sourceSpacing[1]) + halfSourceSize[1]
          );
          sz = this.#snapRound(
            (rotIndexPoint[2] / sourceSpacing[2]) + halfSourceSize[2]
          );

          if (
            sx >= 0 && sx < sourceSize[0] &&
            sy >= 0 && sy < sourceSize[1] &&
            sz >= 0 && sz < sourceSize[2]
          ) {
            targetOffset = targetOffXY + targetUnitVectors[2] * z;

            if (interpolate) {
              // Bilinear
              const sample = this.#bilinearSample(
                workerMessage.sourceImageBuffer,
                sourceUnitVectors,
                sourceSize,
                [sx, sy, sz]
              );
              workerMessage.targetImageBuffer[targetOffset] = sample;

            } else {
              // Nearest Neighbor
              const inOffset =
                (sourceUnitVectors[0] * Math.round(sx)) +
                (sourceUnitVectors[1] * Math.round(sy)) +
                (sourceUnitVectors[2] * Math.round(sz));

              workerMessage.targetImageBuffer[targetOffset] =
                workerMessage.sourceImageBuffer[inOffset];
            }
          }
        }
      }
    }
  }
}