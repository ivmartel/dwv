/**
 * Resampling filter worker.
 */

import {ResamplingFilter} from './resamplingFilter.js';

self.addEventListener('message', function (event) {

  const filter = new ResamplingFilter();
  filter.calculateResample(event.data);
  self.postMessage(event.data);
}, false);