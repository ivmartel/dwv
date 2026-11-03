/**
 * JPEG Lossless decoder worker.
 */

import {jpeg} from './lossless.js';

self.addEventListener('message', function (event) {

  // bytes per element
  const bpe = event.data.meta.bitsAllocated / 8;
  // decode DICOM buffer (read in place, no copy)
  const buf = event.data.buffer;
  const decoder = new jpeg.lossless.Decoder();
  const decoded = decoder.decode(
    buf.buffer, buf.byteOffset, buf.byteLength, bpe);
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
  // transfer the result buffer to avoid a copy
  self.postMessage([res], res ? [res.buffer] : []);

}, false);
