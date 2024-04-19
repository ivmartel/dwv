/**
 * JPEG 2000 decoder worker.
 */
// Do not warn if these variables were not defined before.
/* global importScripts, JpxImage */

import { JpxImage }  from "./jpx.js";

self.addEventListener('message', function (event) {
  let res = JpxImage.decode(event.data.buffer, /* ignoreColorSpace = */ false);
  // post decoded data
  self.postMessage([res]);
}, false);
