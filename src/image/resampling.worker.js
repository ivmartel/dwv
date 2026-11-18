/**
 * Resampling filter worker.
 */

import {ResamplingFilter} from './resamplingFilter.js';

self.addEventListener('message', function (event) {

  const filter = new ResamplingFilter();
  const ret = filter.run(event.data);
  // transfer the result buffer to avoid a copy
  self.postMessage(ret, [ret.targetImageBuffer.buffer]);

}, false);