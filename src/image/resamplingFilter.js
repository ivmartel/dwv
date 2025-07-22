
import {Matrix33, BIG_EPSILON} from '../math/matrix.js';

function get0(values) {
  return values[0];
};
function get1(values) {
  return values[1];
};
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
    const q0Index = [
      Math.floor(point[0]),
      Math.floor(point[1]),
      Math.floor(point[2])
    ];

    const weights = [
      Math.abs(point[0] - q0Index[0]),
      Math.abs(point[1] - q0Index[1]),
      Math.abs(point[2] - q0Index[2])
    ];


    let getYMean = getWeightFunc(weights[2]);
    if (q0Index[2] < 0) {
      getYMean = get1;
    } else if (q0Index[2] + 1 >= size[2]) {
      getYMean = get0;
    }

    let getXMean = getWeightFunc(weights[1]);
    if (q0Index[1] < 0) {
      getXMean = get1;
    } else if (q0Index[1] + 1 >= size[1]) {
      getXMean = get0;
    }

    let getMean = getWeightFunc(weights[0]);
    if (q0Index[0] < 0) {
      getMean = get1;
    } else if (q0Index[0] + 1 >= size[0]) {
      getMean = get0;
    }

    let xIndex, yIndex, zIndex;
    const xMeans = [0.0, 0.0];
    let yMeans, zValues;
    for (let x = 0; x < 2; x++) {
      xIndex = q0Index[0] + x;
      yMeans = [0.0, 0.0];
      for (let y = 0; y < 2; y++) {
        yIndex = q0Index[1] + y;
        zValues = [0.0, 0.0];
        for (let z = 0; z < 2; z++) {
          zIndex = q0Index[2] + z;

          if (
            zIndex < 0 ||
            zIndex >= size[2]
          ) {
            zValues[z] = 0;
          } else {
            const sampleOffset =
              (xIndex * unitVectors[0]) +
              (yIndex * unitVectors[1]) +
              (zIndex * unitVectors[2]);

            zValues[z] = buffer[sampleOffset];
          }
        }
        yMeans[y] = getYMean(zValues, weights);
      }
      xMeans[x] = getXMean(yMeans, weights);
    }

    return getMean(xMeans, weights);
  }

  /**
   * Round if the value is close enough to an integer.
   *
   * @param {number} value The value to round.
   * @returns {number} The rounded value.
   */
  #snapRound(value) {
    const rounded = Math.round(value);
    if (Math.abs(value - rounded) < BIG_EPSILON) {
      return rounded;
    } else {
      return value;
    }
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

    const centeredIndexPoint = new Float64Array(3);
    const rotIndexPoint = new Float64Array(3);
    const sourceIndexPoint = new Float64Array(3);

    for (let x = 0; x < targetSize[0]; x++) {
      centeredIndexPoint[0] = (x - halfTargetSize[0]) * targetSpacing[0];
      for (let y = 0; y < targetSize[1]; y++) {
        centeredIndexPoint[1] = (y - halfTargetSize[1]) * targetSpacing[1];
        for (let z = 0; z < targetSize[2]; z++) {
          centeredIndexPoint[2] = (z - halfTargetSize[2]) * targetSpacing[2];

          relativeMatrix.multiplyTypedArray3D(
            centeredIndexPoint, rotIndexPoint
          );

          sourceIndexPoint[0] = this.#snapRound(
            (rotIndexPoint[0] / sourceSpacing[0]) + halfSourceSize[0]
          );
          sourceIndexPoint[1] = this.#snapRound(
            (rotIndexPoint[1] / sourceSpacing[1]) + halfSourceSize[1]
          );
          sourceIndexPoint[2] = this.#snapRound(
            (rotIndexPoint[2] / sourceSpacing[2]) + halfSourceSize[2]
          );

          if (!(
            sourceIndexPoint[0] < 0 ||
            sourceIndexPoint[0] >= sourceSize[0] ||
            sourceIndexPoint[1] < 0 ||
            sourceIndexPoint[1] >= sourceSize[1] ||
            sourceIndexPoint[2] < 0 ||
            sourceIndexPoint[2] >= sourceSize[2]
          )) {
            const targetOffset =
              (targetUnitVectors[0] * x) +
              (targetUnitVectors[1] * y) +
              (targetUnitVectors[2] * z);

            if (interpolate) {
              // Bilinear
              const sample = this.#bilinearSample(
                workerMessage.sourceImageBuffer,
                sourceUnitVectors,
                sourceSize,
                sourceIndexPoint
              );
              workerMessage.targetImageBuffer[targetOffset] = sample;

            } else {
              // Nearest Neighbor
              const inOffset =
                (sourceUnitVectors[0] * Math.round(sourceIndexPoint[0])) +
                (sourceUnitVectors[1] * Math.round(sourceIndexPoint[1])) +
                (sourceUnitVectors[2] * Math.round(sourceIndexPoint[2]));

              workerMessage.targetImageBuffer[targetOffset] =
                workerMessage.sourceImageBuffer[inOffset];
            }
          }
        }
      }
    }
  }
}