
import {Matrix33, BIG_EPSILON} from '../math/matrix.js';

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

    const xMeans = [0.0, 0.0];
    for (let x = 0; x < 2; x++) {
      const xIndex = q0Index[0] + x;
      const yMeans = [0.0, 0.0];
      for (let y = 0; y < 2; y++) {
        const yIndex = q0Index[1] + y;
        const zValues = [0.0, 0.0];
        for (let z = 0; z < 2; z++) {
          const zIndex = q0Index[2] + z;

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

        if (
          q0Index[2] < 0
        ) {
          yMeans[y] = zValues[1];
        } else if (q0Index[2] + 1 >= size[2]) {
          yMeans[y] = zValues[0];
        } else {
          yMeans[y] = (zValues[1] * weights[2]) +
                      (zValues[0] * (1 - weights[2]));
        }
      }

      if (
        q0Index[1] < 0
      ) {
        xMeans[x] = yMeans[1];
      } else if (q0Index[1] + 1 >= size[1]) {
        xMeans[x] = yMeans[0];
      } else {
        xMeans[x] = (yMeans[1] * weights[1]) +
                  (yMeans[0] * (1 - weights[1]));
      }
    }

    if (
      q0Index[0] < 0
    ) {
      return xMeans[1];
    } else if (q0Index[0] + 1 >= size[0]) {
      return xMeans[0];
    } else {
      return (xMeans[1] * weights[0]) +
          (xMeans[0] * (1 - weights[0]));
    }
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
      targetSize[0] / 2.0,
      targetSize[1] / 2.0,
      targetSize[2] / 2.0
    ];

    const halfSourceSize = [
      sourceSize[0] / 2.0,
      sourceSize[1] / 2.0,
      sourceSize[2] / 2.0
    ];

    const centeredIndexPoint = new Float64Array(3);
    const rotIndexPoint = new Float64Array(3);
    const sourceIndexPoint = new Float64Array(3);

    for (let x = 0; x < targetSize[0]; x++) {
      for (let y = 0; y < targetSize[1]; y++) {
        for (let z = 0; z < targetSize[2]; z++) {
          centeredIndexPoint[0] = (x - halfTargetSize[0]) * targetSpacing[0];
          centeredIndexPoint[1] = (y - halfTargetSize[1]) * targetSpacing[1];
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