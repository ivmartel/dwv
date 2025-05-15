/**
 * JPEG 2000 decoder worker.
 */

import {JpxImage} from './jpx.js';

self.addEventListener('message', function (event) {

  // decode DICOM buffer
  const decoder = new JpxImage();
  decoder.parse(event.data.buffer);
  // post decoded data
  const res = decoder.tiles[0].items;
  self.postMessage([res]);

}, false);
