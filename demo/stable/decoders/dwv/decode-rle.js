/**
 * RLE decoder worker.
 */
// Do not warn if these variables were not defined before.
/* global importScripts */

importScripts('rle.js');

self.addEventListener('message', function (event) {

  // decode DICOM buffer
  // eslint-disable-next-line no-undef
  var decoder = new dwvdecoder.RleDecoder();
  // post decoded data
  self.postMessage([decoder.decode(
    event.data.buffer,
    event.data.meta.bitsAllocated,
    event.data.meta.isSigned,
    event.data.meta.sliceSize,
    event.data.meta.samplesPerPixel,
    event.data.meta.planarConfiguration)]);

}, false);
