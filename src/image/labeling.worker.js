/**
 * Labeling filter worker.
 */

import {LabelingFilter} from './labelingFilter.js';

self.addEventListener('message', function (event) {

  const filter = new LabelingFilter();
  if (event.data.segmentSlice) {
    const {segmentSlice: {segNumber, slices},
      totalSize, unitVectors, sizes, spacing} = event.data;
    const sliceSize = unitVectors[unitVectors.length - 1];
    const buf = new Uint8Array(totalSize);
    for (const {sliceIndex, data} of slices) {
      const offset = sliceIndex * sliceSize;
      for (let l = 0; l < data.length; ++l) {
        if (data[l] !== 0) {
          buf[offset + l] = segNumber;
        }
      }
    }
    self.postMessage(filter.run(
      {imageBuffer: buf, unitVectors, sizes, spacing, totalSize}
    ));
  } else {
    self.postMessage(filter.run(event.data));
  }

}, false);
