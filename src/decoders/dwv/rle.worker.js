/**
 * RLE decoder worker.
 */

import {RleDecoder} from './rle.js';

self.addEventListener('message', function (event) {

  // decode DICOM buffer
  const decoder = new RleDecoder();
  // post decoded data
  self.postMessage([decoder.decode(
    event.data.buffer,
    event.data.meta.bitsAllocated,
    event.data.meta.isSigned,
    event.data.meta.sliceSize,
    event.data.meta.samplesPerPixel,
    event.data.meta.planarConfiguration)]);

}, false);
