/**
 * Resampling filter worker.
 */

import {ResamplingFilter} from './resamplingFilter.js';

self.addEventListener('message', function (event) {

  const filter = new ResamplingFilter();
  const ret = filter.run(event.data);
  self.postMessage(ret);

}, false);