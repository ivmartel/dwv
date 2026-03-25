/**
 * JPEG Baseline decoder worker.
 */

import {JpegImage} from './jpg.js';

self.addEventListener('message', function (event) {

  // decode DICOM buffer
  const decoder = new JpegImage();
  decoder.parse(event.data.buffer);
  // decoded buffer
  const decodedBuffer = decoder.getData(decoder.width, decoder.height);
  // cast to proper array
  let res = null;
  if (event.data.meta.bitsAllocated === 8) {
    if (event.data.meta.isSigned) {
      res = new Int8Array(decodedBuffer);
    } else {
      res = new Uint8Array(decodedBuffer);
    }
  } else if (event.data.meta.bitsAllocated === 16) {
    if (event.data.meta.isSigned) {
      res = new Int16Array(decodedBuffer);
    } else {
      res = new Uint16Array(decodedBuffer);
    }
  }
  // post result
  self.postMessage([res]);

}, false);
