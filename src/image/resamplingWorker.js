
import { Matrix33 } from '../math/matrix'
// import { Index } from '../math/index';
// import { Point3D } from '../math/point';
// import { Geometry } from './geometry';
// import { Size } from './size';
// import { getTypedArray } from '../dicom/dicomParser';


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

  // Can't pass them in as matrixes, so we need to re-create them
  const inMatrix = new Matrix33(workerMessage.inOrientation);
  const outMatrix = new Matrix33(workerMessage.outOrientation);

  const ioutMatrix = outMatrix.getInverse();
  const relativeMatrix = ioutMatrix.multiply(inMatrix);

  for (let x = 0; x < outSize[0]; x++) {
    for (let y = 0; y < outSize[1]; y++) {
      for (let z = 0; z < outSize[2]; z++) {
        const outIndexPoint = [x, y, z];

        const centeredIndexPoint = [
          outIndexPoint[0] - ((outSize[0] - 1) / 2.0),
          outIndexPoint[1] - ((outSize[1] - 1) / 2.0),
          outIndexPoint[2] - ((outSize[2] - 1) / 2.0)
        ];

        const rotIndexPoint =
          relativeMatrix.multiplyArray3D(centeredIndexPoint);

        const inIndexPoint = [
          rotIndexPoint[0] + ((inSize[0] - 1) / 2.0),
          rotIndexPoint[1] + ((inSize[1] - 1) / 2.0),
          rotIndexPoint[2] + ((inSize[2] - 1) / 2.0)
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

          const sample = bilinearSample(workerMessage.inImageBuffer, inUnitVectors, inIndexPoint);
          workerMessage.outImageBuffer[outOffset] = sample;
        } else {
          // console.log("Sample out of bounds, ignoring...", inIndexPoint, outIndexPoint);
        }
      }
    }
  }
}



// Are we in a web worker?
if (typeof window === 'undefined' || window !== window.window) {
  self.addEventListener('message', function (event) {
    self.postMessage({
      labels: labelingWorker.calculateFromEvent(event.data)
    });
  });
}

// TODO: temp
export { calculateResample }