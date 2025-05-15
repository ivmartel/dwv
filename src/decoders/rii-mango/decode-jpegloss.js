/**
 * JPEG Lossless decoder worker.
 */

import {jpeg} from './lossless.js';

self.addEventListener('message', function (event) {

  // bytes per element
  const bpe = event.data.meta.bitsAllocated / 8;
  // decode DICOM buffer
  const buf = new Uint8Array(event.data.buffer);
  const decoder = new jpeg.lossless.Decoder();
  const decoded = decoder.decode(buf.buffer, 0, buf.buffer.byteLength, bpe);
  // post decoded data
  let res = null;
  if (event.data.meta.bitsAllocated === 8) {
    if (event.data.meta.isSigned) {
      res = new Int8Array(decoded.buffer);
    } else {
      res = new Uint8Array(decoded.buffer);
    }
  } else if (event.data.meta.bitsAllocated === 16) {
    if (event.data.meta.isSigned) {
      res = new Int16Array(decoded.buffer);
    } else {
      res = new Uint16Array(decoded.buffer);
    }
  }
  self.postMessage([res]);

}, false);
