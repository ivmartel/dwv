/**
 * JPEG Baseline decoder worker.
 */

import {JpegImage} from './jpg.js';

self.addEventListener('message', function (event) {

  // decode DICOM buffer
  const decoder = new JpegImage();
  decoder.parse(event.data.buffer);
  // post decoded data
  const res = decoder.getData(decoder.width, decoder.height);
  self.postMessage([res]);

}, false);
