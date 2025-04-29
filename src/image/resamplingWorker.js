
/**
 * Immutable 3x3 Matrix. (Paired down copy to play nice with the webworker)
 */
class Matrix33 {

  /**
   * Matrix values.
   *
   * @type {number[]}
   */
  #values;

  /**
   * @param {number[]} values Row-major ordered 9 values.
   */
  constructor(values) {
    this.#values = values;
  }

  /**
   * Get a value of the matrix.
   *
   * @param {number} row The row at wich to get the value.
   * @param {number} col The column at wich to get the value.
   * @returns {number|undefined} The value at the position.
   */
  get(row, col) {
    return this.#values[row * 3 + col];
  }

  /**
   * Get the inverse of this matrix.
   *
   * Ref:
   * - {@link https://en.wikipedia.org/wiki/Invertible_matrix#Inversion_of_3_%C3%97_3_matrices},
   * - {@link https://github.com/willnode/N-Matrix-Programmer}.
   *
   * @returns {Matrix33|undefined} The inverse matrix or undefined
   *   if the determinant is zero.
   */
  getInverse() {
    const m00 = this.get(0, 0);
    const m01 = this.get(0, 1);
    const m02 = this.get(0, 2);
    const m10 = this.get(1, 0);
    const m11 = this.get(1, 1);
    const m12 = this.get(1, 2);
    const m20 = this.get(2, 0);
    const m21 = this.get(2, 1);
    const m22 = this.get(2, 2);

    const a1212 = m11 * m22 - m12 * m21;
    const a2012 = m12 * m20 - m10 * m22;
    const a0112 = m10 * m21 - m11 * m20;

    let det = m00 * a1212 + m01 * a2012 + m02 * a0112;
    if (det === 0) {
      logger.warn('Cannot invert 3*3 matrix with zero determinant.');
      return undefined;
    }
    det = 1 / det;

    const values = [
      det * a1212,
      det * (m02 * m21 - m01 * m22),
      det * (m01 * m12 - m02 * m11),
      det * a2012,
      det * (m00 * m22 - m02 * m20),
      det * (m02 * m10 - m00 * m12),
      det * a0112,
      det * (m01 * m20 - m00 * m21),
      det * (m00 * m11 - m01 * m10)
    ];

    return new Matrix33(values);
  }

  /**
   * Multiply this matrix by another.
   *
   * @param {Matrix33} rhs The matrix to multiply by.
   * @returns {Matrix33} The product matrix.
   */
  multiply(rhs) {
    const values = [];
    for (let i = 0; i < 3; ++i) {
      for (let j = 0; j < 3; ++j) {
        let tmp = 0;
        for (let k = 0; k < 3; ++k) {
          tmp += this.get(i, k) * rhs.get(k, j);
        }
        values.push(tmp);
      }
    }
    return new Matrix33(values);
  }

  /**
   * Multiply this matrix by a 3D array.
   *
   * @param {number[]} array3D The input 3D array.
   * @returns {number[]} The result 3D array.
   */
  multiplyArray3D(array3D) {
    if (array3D.length !== 3) {
      throw new Error('Cannot multiply 3x3 matrix with non 3D array: ' +
        array3D.length);
    }
    const values = [];
    for (let i = 0; i < 3; ++i) {
      let tmp = 0;
      for (let j = 0; j < 3; ++j) {
        tmp += this.get(i, j) * array3D[j];
      }
      values.push(tmp);
    }
    return values;
  }

  /**
   * Get the values of the matrix as an array.
   *
   * @returns {number[]} The matrix.
   */
  getValues() {
    return this.#values.slice();
  }
} // Matrix33


/**
 * Simple bilinear sampling function
 *
 * @param {TypedArray} buffer The buffer to sample.
 * @param {number[]} unitVectors The buffer offset space unit vectors.
 * @param {number[]} point The index space point to sample
 */
function bilinearSample(buffer, unitVectors, point) {
  const q0Index = [
    Math.floor(point[0]),
    Math.floor(point[1]),
    Math.floor(point[2])
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
 * Calculate the resampling
 *
 * @param {object} workerMessage The worker message.
 */
function calculateResample(workerMessage) {
  const inSize = workerMessage.inSize;
  const outSize = workerMessage.outSize;
  const inUnitVectors = workerMessage.inUnitVectors;
  const outUnitVectors = workerMessage.outUnitVectors;
  const inOrigin = workerMessage.inOrigin;
  const outOrigin = workerMessage.outOrigin;
  const inSpacing = workerMessage.inSpacing;
  const outSpacing = workerMessage.outSpacing;

  const interpolate = workerMessage.interpolate;

  // Can't pass them in as matrixes, so we need to re-create them
  const inMatrix = new Matrix33(workerMessage.inOrientation);
  const outMatrix = new Matrix33(workerMessage.outOrientation);

  const iInMatrix = inMatrix.getInverse();
  const relativeMatrix = outMatrix.multiply(iInMatrix);

  for (let x = 0; x < outSize[0]; x++) {
    for (let y = 0; y < outSize[1]; y++) {
      for (let z = 0; z < outSize[2]; z++) {
        const outIndexPoint = [x, y, z];

        const centeredIndexPoint = [
          (outIndexPoint[0] - (outSize[0] / 2.0)) * outSpacing[0],
          (outIndexPoint[1] - (outSize[1] / 2.0)) * outSpacing[1],
          (outIndexPoint[2] - (outSize[2] / 2.0)) * outSpacing[2]
        ];

        const rotIndexPoint =
          relativeMatrix.multiplyArray3D(centeredIndexPoint);

        const inIndexPoint = [
          (rotIndexPoint[0] / inSpacing[0]) + (inSize[0] / 2.0),
          (rotIndexPoint[1] / inSpacing[1]) + (inSize[1] / 2.0),
          (rotIndexPoint[2] / inSpacing[2]) + (inSize[2] / 2.0) 
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

          if (interpolate) {
            // Bilinear
            const sample = bilinearSample(workerMessage.inImageBuffer, inUnitVectors, inIndexPoint);
            workerMessage.outImageBuffer[outOffset] = sample;

          } else {
            // Nearest Neighbor
            const inOffset =
              (inUnitVectors[0] * Math.round(inIndexPoint[0])) +
              (inUnitVectors[1] * Math.round(inIndexPoint[1])) +
              (inUnitVectors[2] * Math.round(inIndexPoint[2]));

            workerMessage.outImageBuffer[outOffset] = workerMessage.inImageBuffer[inOffset];
          }
        } else {
          // if (x <= 10 && y <= 10 && z <= 10){
          //   console.log("Sample out of bounds, ignoring...", inIndexPoint, outIndexPoint, inOrigin, outOrigin);
          // }
        }
      }
    }
  }
}

// Are we in a web worker?
if (typeof window === 'undefined' || window !== window.window) {
  self.addEventListener('message', function (event) {
    calculateResample(event.data);
    self.postMessage(event.data);
  });

// If not we are in a unit test
} else {
  self.calculateResample = calculateResample;
}